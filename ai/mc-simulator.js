/**
 * SHATTERED DUNGEON — Monte Carlo Card Evaluator v1.0
 * 
 * For each card in hand, simulates playing it N times with random dice,
 * evaluates the resulting board state, and returns expected value.
 * 
 * This replaces the hand-tuned heuristic scoring in the AI modules.
 */

const R = require('../engine/rules');
const { evaluateBoard } = require('./board-eval');

/**
 * Apply promoter gain with per-round cap (MC simulation version).
 */
function mcApplyPromoterGain(target, resource, amount, ctx) {
  if (resource !== 'trust' && resource !== 'rapport') {
    R.applyBenefit(target, resource, amount);
    return amount;
  }
  const cap = ctx.promoterGainCap || 2;
  const start = resource === 'trust' ? (ctx.roundStartTrust || 0) : (ctx.roundStartRapport || 0);
  const current = target[resource] || 0;
  const gained = current - start;
  const room = Math.max(0, cap - gained);
  const actual = Math.min(amount, room);
  if (actual > 0) R.applyBenefit(target, resource, actual);
  return actual;
}

/**
 * Evaluate all playable cards in hand by MC simulation.
 * @param {Array} hand - Cards in hand
 * @param {string} side - 'dungeon' or 'visitor'
 * @param {object} self - Our state
 * @param {object} opponent - Opponent state
 * @param {object} energy - Energy pool
 * @param {object} ctx - Context { encounter, round, cardTracker, goalType, bondThreshold }
 * @param {number} simCount - Number of simulations per card (default 16)
 * @returns {Array} Cards sorted by expected board eval delta, each with { card, expectedValue, delta }
 */
function evaluateAllCards(hand, side, self, opponent, energy, ctx, simCount = 16) {
  const baseEval = evaluateBoard(self, opponent, side, ctx);
  const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
  const results = [];

  // Filter to playable action cards
  const actionCards = hand.filter(c =>
    c.category !== 'Energy' && c.category !== 'React' && (c.cost || 0) <= energy.available
  );

  for (const card of actionCards) {
    let totalEval = 0;

    for (let i = 0; i < simCount; i++) {
      // Deep clone state for simulation
      const simSelf = cloneState(self);
      const simOpp = cloneState(opponent);

      // Simulate playing this card
      simulateCard(card, side, simSelf, simOpp, ctx);

      // Evaluate resulting board
      const eval_ = evaluateBoard(simSelf, simOpp, side, ctx);
      totalEval += eval_;
    }

    const expectedValue = totalEval / simCount;
    results.push({
      card,
      expectedValue,
      delta: expectedValue - baseEval,
    });
  }

  // Also evaluate Energy cards (deterministic, no MC needed)
  const energyCards = hand.filter(c => c.category === 'Energy');
  for (const card of energyCards) {
    // Energy investment: small positive delta for future potential
    const round = ctx.round || 1;
    const energyValue = round <= 3 ? 5 : round <= 6 ? 3 : 1; // Less valuable late
    results.push({ card, expectedValue: baseEval + energyValue, delta: energyValue });
  }

  // Evaluate Restraint: for cooperative goals, one Strike can be restrained for +1 promoter
  if (ctx.goalType === 'bond') {
    const strikes = hand.filter(c => c.category === 'Strike');
    if (strikes.length > 0) {
      // Only evaluate the weakest Strike (best candidate to sacrifice)
      const weakest = strikes.reduce((a, b) => (a.power || 1) <= (b.power || 1) ? a : b);
      const simSelf = cloneState(self);
      if (side === 'dungeon') {
        R.applyBenefit(simSelf, 'rapport', 1);
      } else {
        R.applyBenefit(simSelf, 'trust', 1);
      }
      const eval_ = evaluateBoard(simSelf, cloneState(opponent), side, ctx);
      results.push({
        card: weakest, expectedValue: eval_, delta: eval_ - baseEval,
        action: 'restrain',
      });
    }
  }

  // Sort by delta (best improvement first)
  results.sort((a, b) => b.delta - a.delta);
  return results;
}

/**
 * Simulate playing a card (mutates simSelf and simOpp).
 */
function simulateCard(card, side, self, opp, ctx) {
  const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';

  switch (card.category) {
    case 'Strike':
      simulateStrike(card, side, self, opp, ctx);
      break;

    case 'Restrain':
      // Handled separately — not a real category, just a marker for the action
      break;

    case 'Empower':
      self.conditions.push({ type: 'empower', effect: card.empowerEffect || {}, source: card.name, placedBy: side });
      break;

    case 'Disrupt':
      opp.conditions.push({ type: 'disrupt', effect: card.disruptEffect || {}, source: card.name, placedBy: side });
      break;

    case 'Counter': {
      let removed = removeCondition(opp, 'empower', oppSide);
      if (!removed) removed = removeCondition(self, 'disrupt', oppSide);
      if (removed && card.counterDamage) {
        R.applyDamage(opp, card.counterDamage.resource, card.counterDamage.amount, 1);
      }
      break;
    }

    case 'Trap':
      self.conditions.push({ type: 'trap', card, trigger: card.trapTrigger, placedBy: side });
      break;

    case 'Offer':
      simulateOffer(card, side, self, opp, ctx);
      break;

    case 'Test':
      simulateTest(card, side, self, opp, ctx);
      break;

    case 'Reshape':
      simulateReshape(card, side, self, opp);
      break;
  }
}

/**
 * Simulate a Strike with random dice rolls.
 */
function simulateStrike(card, side, self, opp, ctx) {
  const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
  let advantage = 0, powerBonus = 0;

  // Check for empower (consume it)
  const empIdx = self.conditions.findIndex(c => c.type === 'empower' && c.placedBy === side);
  if (empIdx >= 0) {
    const emp = self.conditions.splice(empIdx, 1)[0];
    if (emp.effect.advantage) advantage += 1;
    if (emp.effect.powerBonus) powerBonus += emp.effect.powerBonus;
  }

  // Check for disrupt on self (consume it)
  const disIdx = self.conditions.findIndex(c => c.type === 'disrupt' && c.placedBy === oppSide);
  if (disIdx >= 0) {
    const dis = self.conditions.splice(disIdx, 1)[0];
    if (dis.effect.disadvantage) advantage -= 1;
  }

  // Trigger bonus
  let triggerBonus = 0;
  if (card.trigger) {
    const triggered = evaluateTrigger(card.trigger, self, opp);
    if (triggered) triggerBonus = card.trigger.bonus || 0;
  }

  // Modifier bonus
  const atkMod = R.getModifierBonus(card, self);
  const defMod = R.getModifierBonus(card, opp);

  // Roll dice
  const atkRoll = R.contestedRoll(advantage);
  const defRoll = R.contestedRoll(0);
  const atkTotal = atkRoll.total + atkMod;
  const defTotal = defRoll.total + defMod;

  const result = R.resolveTier(atkTotal, defTotal);
  const damagePower = (card.power || 0) + powerBonus + triggerBonus;

  // Apply damage
  if (result.atkMult > 0 && card.target) {
    let rawDmg = Math.floor(damagePower * result.atkMult);
    if (damagePower > 0 && rawDmg < 1) rawDmg = 1;

    // Estimate React mitigation (probabilistic)
    const reactProb = estimateReactProbability(oppSide, ctx);
    const reactMitigation = (result.tier === 'Strong' || result.tier === 'Devastating')
      ? reactProb * 1.5 // avg mitigation if React fires
      : 0;

    // Fortify reduction
    let fortifyReduction = 0;
    const fortifyConds = opp.conditions.filter(c => c.type === 'fortify' && c.resource === card.target);
    for (const fc of fortifyConds) fortifyReduction += fc.reduction;

    const finalDmg = Math.max(0, rawDmg - Math.round(reactMitigation) - fortifyReduction);
    R.applyDamage(opp, card.target, finalDmg, 1);

    // Apply keywords
    if ((card.keywords || []).includes('Erode') && ctx.autoResource !== card.target) {
      opp.conditions.push({ type: 'erode', resource: card.target, amount: 1, placedBy: side });
    }
    if ((card.keywords || []).includes('Entangle') && !opp.conditions.some(c => c.type === 'entangled')) {
      opp.conditions.push({ type: 'entangled', placedBy: side });
    }

    // Rally: restore 1 to lowest self reducer on Strong/Devastating
    if (result.atkMult >= 1.0) {
      const reducerNames = side === 'dungeon'
        ? ['structure', 'veil', 'presence']
        : ['vitality', 'resolve', 'nerve'];
      const sv = self.startingValues || {};
      const damaged = reducerNames
        .map(n => ({ name: n, val: self[n], start: sv[n] || self[n] || 16 }))
        .filter(r => r.val < r.start)
        .sort((a, b) => (a.val / a.start) - (b.val / b.start));
      if (damaged.length > 0) {
        R.applyBenefit(self, damaged[0].name, 1);
      }
    }
  }

  // Reversal damage
  if (result.defMult > 0) {
    const reversalResource = side === 'dungeon' ? 'structure' : 'vitality';
    R.applyDamage(self, reversalResource, 1, result.defMult);
  }

  // Betrayal: striking during cooperation crashes promoters (only if genuinely cooperating)
  if (side === 'dungeon' && (self.rapport || 0) > 3) {
    self.rapport = Math.max(0, self.rapport - Math.ceil(self.rapport * 0.5));
    if ((opp.trust || 0) > 3) opp.trust = Math.max(0, opp.trust - Math.ceil(opp.trust * 0.5));
  } else if (side === 'visitor' && (self.trust || 0) > 3) {
    self.trust = Math.max(0, self.trust - Math.ceil(self.trust * 0.5));
    if ((opp.rapport || 0) > 3) opp.rapport = Math.max(0, opp.rapport - Math.ceil(opp.rapport * 0.5));
  }
}

/**
 * Simulate an Offer.
 */
function simulateOffer(card, side, self, opp, ctx) {
  const trustLevel = side === 'dungeon' ? opp.trust : self.trust;
  const acceptChance = Math.min(0.9, 0.3 + (trustLevel * 0.1));

  if (Math.random() < acceptChance) {
    if (card.offerPayload) {
      for (const effect of card.offerPayload) {
        const target = effect.target === 'opponent' ? opp : self;
        if (effect.amount > 0) {
          if (effect.resource === 'trust' || effect.resource === 'rapport') {
            mcApplyPromoterGain(target, effect.resource, effect.amount, ctx);
          } else {
            R.applyBenefit(target, effect.resource, effect.amount);
          }
        } else {
          R.applyDamage(target, effect.resource, Math.abs(effect.amount), 1);
        }
      }
    }
  } else {
    // Refusal cost
    if (side === 'dungeon' && (self.rapport || 0) > 0) self.rapport = Math.max(0, self.rapport - 1);
    else if (side === 'visitor' && (opp.rapport || 0) > 0) opp.rapport = Math.max(0, opp.rapport - 1);
  }
}

/**
 * Simulate a Test (prisoner's dilemma).
 */
function simulateTest(card, side, self, opp, ctx) {
  const trustLevel = side === 'dungeon' ? opp.trust : self.trust;
  const rapportLevel = side === 'dungeon' ? self.rapport : opp.rapport;
  const coopChance = Math.min(0.85, 0.4 + (trustLevel * 0.05) + (rapportLevel * 0.03));
  const testReward = card.testReward || { trust: 2, rapport: 2 };
  const defectPenalty = card.defectPenalty || { trustCrash: 0.5, powerGain: 2 };

  if (Math.random() < coopChance) {
    mcApplyPromoterGain(opp, 'trust', testReward.trust, ctx);
    mcApplyPromoterGain(self, 'rapport', testReward.rapport, ctx);
    if (card.exposureCost) R.applyDamage(self, card.exposureCost.resource, card.exposureCost.amount, 1);
  } else {
    // Defect: trust crashes
    if ((opp.trust || 0) > 0) opp.trust = Math.max(0, Math.ceil(opp.trust * (1 - defectPenalty.trustCrash)));
    if ((self.rapport || 0) > 0) self.rapport = Math.max(0, Math.ceil(self.rapport * (1 - defectPenalty.trustCrash)));
  }
}

/**
 * Simulate a Reshape.
 */
function simulateReshape(card, side, self, opp) {
  if (!card.reshapeEffect) return;
  const eff = card.reshapeEffect;

  if (eff.heal) {
    for (const h of eff.heal) {
      R.applyBenefit(self, h.resource, h.amount);
    }
  }
  if (eff.shift) {
    const take = Math.min(eff.shift.amount, self[eff.shift.from] || 0);
    if (take > 0) {
      R.applyDamage(self, eff.shift.from, take, 1);
      R.applyBenefit(self, eff.shift.to, take);
    }
  }
  if (eff.fortify) {
    self.conditions.push({
      type: 'fortify', resource: eff.fortify.resource,
      reduction: eff.fortify.reduction, duration: eff.fortify.duration || 2,
      source: card.name, placedBy: side,
    });
  }
}

/**
 * Estimate probability opponent has a React available.
 */
function estimateReactProbability(oppSide, ctx) {
  const played = ctx.cardTracker?.[oppSide] || {};
  const reactsPlayed = played.React || 0;
  // Typical deck has 2 Reacts. After playing both, probability drops to near 0.
  // Also factor in that they might have drawn new ones (deck recycle).
  if (reactsPlayed >= 2) return 0.1;
  if (reactsPlayed >= 1) return 0.4;
  return 0.6;
}

/**
 * Estimate probability opponent has a Counter available.
 */
function estimateCounterProbability(oppSide, ctx) {
  const played = ctx.cardTracker?.[oppSide] || {};
  const countersPlayed = played.Counter || 0;
  if (countersPlayed >= 2) return 0.1;
  if (countersPlayed >= 1) return 0.35;
  return 0.5;
}

// — Utility functions —

function cloneState(state) {
  return {
    ...state,
    conditions: state.conditions.map(c => ({ ...c })),
    startingValues: state.startingValues ? { ...state.startingValues } : undefined,
    modifiers: state.modifiers ? { ...state.modifiers } : {},
  };
}

function removeCondition(state, condType, placedBy) {
  const idx = state.conditions.findIndex(c => c.type === condType && c.placedBy === placedBy);
  if (idx < 0) return null;
  return state.conditions.splice(idx, 1)[0];
}

function evaluateTrigger(trigger, self, opponent) {
  if (!trigger?.condition) return false;
  const c = trigger.condition;
  if (c.type === 'resource_below') {
    const val = opponent[c.resource];
    const threshold = c.value !== undefined ? c.value : Math.floor((opponent.startingValues?.[c.resource] || 16) / 2);
    return val <= threshold;
  }
  if (c.type === 'resource_above') return (opponent[c.resource] || 0) >= c.value;
  return false;
}

module.exports = { evaluateAllCards, cloneState, estimateReactProbability, estimateCounterProbability };