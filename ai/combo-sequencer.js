/**
 * SHATTERED DUNGEON — Combo Sequencer v1.2 (Bond v3.0 Restraint)
 * 
 * Strategic energy + action card sequencing module.
 * Called by dungeon-ai.js, visitor-ai.js, and smart-ai.js to replace
 * naive "play first energy card" logic with combo-aware planning.
 * 
 * v1.1 FIXES:
 *   - Energy investment cost now scales with pool size (stops dump-all-energy)
 *   - Win condition diversification skips score-0 cards (preserves coop suppression)
 * v1.2 Bond v3.0:
 *   - addRestraintIfNeeded now recognizes bondStrategy profiles (nurturing/deceptive)
 *     so restraint triggers even at trust 0, not just when rapport/trust > 2.
 * 
 * KEY CAPABILITIES:
 *   1. Surge Planning     — Burst turns: Surge → expensive card in one turn
 *   2. Attune Sequencing  — Play Attune(type) before matching type cards
 *   3. Siphon Awareness   — Prioritize Siphon when conditions are met
 *   4. Budget-Aware Combos — Plan energy to enable Empower+Strike etc.
 *   5. Win Condition Diversification — Redirect energy toward non-Kill paths
 * 
 * INTERFACE:
 *   planTurn(hand, energy, self, opponent, ctx, profile) → decisions[]
 *   Each decision: { card, action: 'energy'|'play'|'activate'|'restrain' }
 */

const { getEffectiveCost } = require('./ai-utils');
const { checkSiphonCondition } = require('../engine/energy');

// ═══ MAIN ENTRY POINT ═══

/**
 * Plan an entire turn's card sequence: energy cards first (strategically ordered),
 * then action cards (budget-aware, combo-sequenced).
 * 
 * @param {object[]} hand - All cards in hand
 * @param {object} energy - Energy pool ({ base, available, spent, tempBonus, canAfford, ... })
 * @param {object} self - Playing side's state
 * @param {object} opponent - Opponent's state
 * @param {object} ctx - Context (round, cardTracker, autoResource, lastRoundEvents, bondThreshold, etc.)
 * @param {object} profile - AI profile (baseWeights, preferredTargets, comboAwareness, etc.)
 * @returns {object[]} Ordered decisions array
 */
function planTurn(hand, energy, self, opponent, ctx, profile) {
  const round = ctx.round || 1;
  const energyCards = hand.filter(c => c.category === 'Energy');
  const actionCards = hand.filter(c => c.category !== 'Energy' && c.category !== 'React');

  // If no energy cards, skip straight to action planning
  if (energyCards.length === 0) {
    return planActions(actionCards, energy.available, self, opponent, ctx, profile);
  }

  // If no action cards, just play energy for investment
  if (actionCards.length === 0) {
    return planEnergyOnly(energyCards, energy, self, opponent, ctx, round);
  }

  // ── SCORE ALL ACTION CARDS ──
  // Use external scoreFunction if provided (smart-ai passes MC scores),
  // otherwise use profile-based heuristic scoring
  const scoreFn = ctx.scoreFunction || ((card) => scoreCardHeuristic(card, self, opponent, ctx, profile));
  const scoredActions = actionCards.map(c => ({ card: c, score: scoreFn(c) }));

  // ── WIN CONDITION DIVERSIFICATION ──
  // Detect kill-path dominance and boost resolve/nerve card scores
  applyWinConditionDiversification(scoredActions, self, opponent, ctx, profile);

  // ── EVALUATE ENERGY PLANS ──
  // Try all subsets of energy cards (up to 2^5 = 32 combinations for 5 energy cards)
  // and pick the plan that maximizes total playable action value
  const bestPlan = evaluateEnergyPlans(energyCards, scoredActions, energy, self, opponent, ctx, round, profile);

  // ── BUILD FINAL DECISION LIST ──
  const decisions = [];

  // Energy decisions first (strategically ordered)
  for (const ec of bestPlan.energySequence) {
    decisions.push({ card: ec, action: 'energy' });
  }

  // Action decisions (budget-aware, combo-ordered)
  for (const ac of bestPlan.actionSequence) {
    decisions.push({ card: ac.card, action: 'play' });
  }

  // ── RESTRAINT (cooperative profiles only) ──
  addRestraintIfNeeded(decisions, hand, self, opponent, ctx, profile);

  return decisions;
}

// ═══ ENERGY PLAN EVALUATION ═══

/**
 * Evaluate all possible energy card combinations to find the plan
 * that enables the highest-value set of action cards this turn.
 */
function evaluateEnergyPlans(energyCards, scoredActions, energy, self, opponent, ctx, round, profile) {
  const subsets = getSubsets(energyCards);
  let bestPlan = null;
  let bestValue = -Infinity;

  for (const subset of subsets) {
    // Simulate what energy state looks like after playing this subset
    const sim = simulateEnergyPlay(subset, energy, self, opponent, ctx);

    // Determine which action cards we can afford with this energy state
    const affordable = selectAffordableActions(scoredActions, sim.available, sim.self, profile);

    // Total value = action card value gained - opportunity cost of energy investment
    const actionValue = affordable.reduce((sum, a) => sum + a.score, 0);

    // Energy investment cost scales with pool size — playing your 3rd energy card
    // when your pool is already 6+ and you have nothing expensive to enable is wasteful.
    // Each energy card costs more to play when pool is already high.
    const currentPool = energy.base || 2;
    const investmentCost = subset.reduce((sum, _, i) => {
      const poolAfterPrevious = currentPool + i; // Approximate pool after prior cards in subset
      // Cost: 1 base + 0.5 per existing pool point (diminishing returns)
      return sum + 1.0 + poolAfterPrevious * 0.5;
    }, 0);

    // Growth bonus only when energy actually UNLOCKS cards we couldn't play before
    const affordableWithout = selectAffordableActions(scoredActions, energy.available, self, profile);
    const valueWithout = affordableWithout.reduce((sum, a) => sum + a.score, 0);
    const unlockBonus = actionValue - valueWithout; // Value of cards energy ENABLED

    // Small future-investment bonus for permanent growth in early rounds only
    const futureBonus = sim.permanentGained * (round <= 3 ? 1.0 : round <= 6 ? 0.3 : 0);

    const totalValue = actionValue - investmentCost + Math.max(unlockBonus, 0) + futureBonus;

    if (totalValue > bestValue) {
      bestValue = totalValue;
      bestPlan = {
        energySequence: orderEnergyCards(subset, affordable, self, opponent, ctx),
        actionSequence: orderActionCards(affordable, self, opponent, ctx, profile),
        totalValue,
        simState: sim,
      };
    }
  }

  // Fallback: no energy, just play what we can afford now
  if (!bestPlan) {
    const affordable = selectAffordableActions(scoredActions, energy.available, self, profile);
    bestPlan = {
      energySequence: [],
      actionSequence: orderActionCards(affordable, self, opponent, ctx, profile),
      totalValue: affordable.reduce((sum, a) => sum + a.score, 0),
    };
  }

  return bestPlan;
}

/**
 * Simulate the energy pool state after playing a set of energy cards.
 * Returns { available, permanentGained, self } — self is a shallow clone
 * with any Attune conditions added.
 */
function simulateEnergyPlay(energyCards, energy, self, opponent, ctx) {
  let available = energy.available;
  let permanentGained = 0;

  // Clone self.conditions for Attune simulation
  const simSelf = { ...self, conditions: [...(self.conditions || [])] };

  for (const ec of energyCards) {
    const etype = ec.energyType || 'standard';

    switch (etype) {
      case 'standard': {
        const gain = ec.energyGain || 1;
        available += gain;
        permanentGained += gain;
        break;
      }
      case 'surge': {
        const gain = ec.surgeGain || 2;
        available += gain; // Temp energy usable this turn
        break;
      }
      case 'attune': {
        const gain = ec.energyGain || 1;
        available += gain;
        permanentGained += gain;
        // Add attune condition to simulation
        if (ec.attune) {
          const existing = simSelf.conditions.find(
            c => c.type === 'attune' && c.cardType === ec.attune.cardType
          );
          if (!existing) {
            simSelf.conditions.push({
              type: 'attune',
              cardType: ec.attune.cardType,
              discount: ec.attune.discount || 1,
              source: ec.name,
              duration: 99,
            });
          }
        }
        break;
      }
      case 'siphon': {
        const conditionMet = checkSiphonCondition(ec.siphon, self, opponent);
        if (conditionMet) {
          const gain = ec.energyGain || 1;
          available += gain;
          permanentGained += gain;
        } else {
          const fallback = ec.siphonFallback || 1;
          available += fallback; // Temp energy
        }
        break;
      }
      default: {
        available += 1;
        permanentGained += 1;
      }
    }
  }

  return { available, permanentGained, self: simSelf };
}

/**
 * Generate all subsets of an array (power set).
 * For energy cards (max 5), this is at most 32 combinations.
 */
function getSubsets(arr) {
  const subsets = [];
  const n = arr.length;
  for (let mask = 0; mask < (1 << n); mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(arr[i]);
    }
    subsets.push(subset);
  }
  return subsets;
}

// ═══ ACTION CARD SELECTION ═══

/**
 * Greedily select the highest-scoring action cards that fit the energy budget.
 * Uses effective cost (accounting for Attune discounts from simulated state).
 */
function selectAffordableActions(scoredActions, availableEnergy, simSelf, profile) {
  const sorted = [...scoredActions]
    .filter(s => s.score > (profile.scoreThreshold || 0))
    .sort((a, b) => b.score - a.score);

  const selected = [];
  let budget = availableEnergy;

  for (const s of sorted) {
    const cost = getEffectiveCost(s.card, simSelf);
    if (cost <= budget) {
      selected.push(s);
      budget -= cost;
    }
  }

  return selected;
}

// ═══ CARD ORDERING ═══

/**
 * Order energy cards for optimal sequencing:
 *   1. Attune cards — must be played BEFORE matching action cards
 *   2. Siphon cards (when condition met) — permanent growth first
 *   3. Standard cards — reliable permanent growth
 *   4. Surge cards — LAST, because temp energy is "use it or lose it"
 *   5. Siphon cards (condition not met) — fallback temp energy
 */
function orderEnergyCards(energyCards, plannedActions, self, opponent, ctx) {
  if (energyCards.length <= 1) return [...energyCards];

  // Check which attune types are needed by planned actions
  const neededTypes = new Set(plannedActions.map(a => a.card.type).filter(Boolean));

  return [...energyCards].sort((a, b) => {
    const prioA = getEnergyPriority(a, neededTypes, self, opponent);
    const prioB = getEnergyPriority(b, neededTypes, self, opponent);
    return prioA - prioB; // Lower = played first
  });
}

function getEnergyPriority(card, neededTypes, self, opponent) {
  const etype = card.energyType || 'standard';

  switch (etype) {
    case 'attune':
      // Attune goes first IF we have matching action cards to discount
      if (card.attune && neededTypes.has(card.attune.cardType)) return 0;
      return 2; // Still good (permanent growth), but no urgent sequencing need
    case 'siphon': {
      const condMet = checkSiphonCondition(card.siphon, self, opponent);
      return condMet ? 1 : 5; // Permanent if met → early; temp fallback → late
    }
    case 'standard':
      return 2; // Reliable middle ground
    case 'surge':
      return 4; // Last — temp energy should be spent immediately after
    default:
      return 3;
  }
}

/**
 * Order action cards for optimal sequencing:
 *   1. Counters (when urgent — opponent has active buffs)
 *   2. Traps before Offers (set trap, then bait)
 *   3. Empowers before Strikes (buff then hit)
 *   4. Disrupts before Strikes (debuff then hit)
 *   5. Remaining by score
 */
function orderActionCards(selected, self, opponent, ctx, profile) {
  if (selected.length <= 1) return [...selected];

  const ordered = [...selected];

  // Counter first when urgent
  const counterIdx = ordered.findIndex(s => s.card.category === 'Counter' && s.score > 5);
  if (counterIdx > 0) {
    const [counter] = ordered.splice(counterIdx, 1);
    ordered.unshift(counter);
  }

  // Trap before Offer
  const trapIdx = ordered.findIndex(s =>
    s.card.category === 'Trap' && s.card.trapTrigger === 'offer_accepted'
  );
  const offerIdx = ordered.findIndex(s => s.card.category === 'Offer');
  if (trapIdx >= 0 && offerIdx >= 0 && trapIdx > offerIdx) {
    const [trap] = ordered.splice(trapIdx, 1);
    ordered.splice(offerIdx, 0, trap);
  }

  // Empower before Strike (combo awareness — always on in sequencer)
  const empIdx = ordered.findIndex(s => s.card.category === 'Empower');
  const strikeIdx = ordered.findIndex(s => s.card.category === 'Strike');
  if (empIdx >= 0 && strikeIdx >= 0 && empIdx > strikeIdx) {
    const [emp] = ordered.splice(empIdx, 1);
    ordered.splice(strikeIdx, 0, emp);
  }

  // Disrupt before Strike (debuff, then hit into it)
  const disruptIdx = ordered.findIndex(s => s.card.category === 'Disrupt');
  const strikeIdx2 = ordered.findIndex(s => s.card.category === 'Strike');
  if (disruptIdx >= 0 && strikeIdx2 >= 0 && disruptIdx > strikeIdx2) {
    const [dis] = ordered.splice(disruptIdx, 1);
    ordered.splice(strikeIdx2, 0, dis);
  }

  return ordered;
}

// ═══ WIN CONDITION DIVERSIFICATION ═══

/**
 * When the kill path (vitality depletion) is dominating, boost scores for
 * cards targeting resolve and nerve to re-diversify win conditions.
 * This addresses the "secondary win conditions collapsed" problem.
 */
function applyWinConditionDiversification(scoredActions, self, opponent, ctx, profile) {
  // Only apply to combat-oriented profiles
  if (profile.preferredTargets?.includes('trust') || profile.preferredTargets?.includes('rapport')) {
    return; // Cooperative profiles don't need kill diversification
  }

  const oppReducers = getOpponentReducers(opponent);
  if (oppReducers.length === 0) return;

  // Measure damage spread: how lopsided is our damage distribution?
  const sorted = [...oppReducers].sort((a, b) => a.ratio - b.ratio);
  const mostDamaged = sorted[0];
  const leastDamaged = sorted[sorted.length - 1];
  const spread = leastDamaged.ratio - mostDamaged.ratio; // 0 = even, 0.5+ = lopsided

  if (spread < 0.05) return; // Damage already well-distributed, no intervention

  // Boost scales with how lopsided the damage is (max 6)
  const boostScale = Math.min(spread * 12, 6);
  const avgDamage = oppReducers.reduce((s, r) => s + (1 - r.ratio), 0) / oppReducers.length;

  for (const sa of scoredActions) {
    // NEVER boost cards that were deliberately suppressed (score 0 or negative)
    if (sa.score <= 0) continue;

    const targetReducer = oppReducers.find(r => r.name === sa.card.target);
    if (!targetReducer) continue;

    const resourceDamage = 1 - targetReducer.ratio;

    if (resourceDamage < avgDamage) {
      // This resource is LESS damaged than average — boost to encourage targeting it
      sa.score += boostScale;
    } else if (resourceDamage > avgDamage + 0.15) {
      // This resource is MUCH more damaged than average — slight penalty to redirect
      if (sa.score > 3) {
        sa.score -= boostScale * 0.3;
      }
    }
  }
}

function getOpponentReducers(opponent) {
  // Detect side from available properties
  if (opponent.vitality !== undefined) {
    // Opponent is visitor
    return [
      { name: 'vitality', val: opponent.vitality, start: opponent.startingValues?.vitality || 20 },
      { name: 'resolve', val: opponent.resolve, start: opponent.startingValues?.resolve || 16 },
      { name: 'nerve', val: opponent.nerve, start: opponent.startingValues?.nerve || 16 },
    ].map(r => ({ ...r, ratio: r.val / r.start }));
  } else if (opponent.structure !== undefined) {
    // Opponent is dungeon
    return [
      { name: 'structure', val: opponent.structure, start: opponent.startingValues?.structure || 16 },
      { name: 'veil', val: opponent.veil, start: opponent.startingValues?.veil || 14 },
      { name: 'presence', val: opponent.presence, start: opponent.startingValues?.presence || 12 },
    ].map(r => ({ ...r, ratio: r.val / r.start }));
  }
  return [];
}

// ═══ HEURISTIC CARD SCORING ═══

/**
 * Lightweight card scoring using profile weights and board state.
 * Used when no external scoreFunction is provided.
 * Mirrors the logic in dungeon-ai.js / visitor-ai.js but simplified.
 */
function scoreCardHeuristic(card, self, opponent, ctx, profile) {
  const w = profile.baseWeights?.[card.category] || 1;
  let score = w * 2;
  score += (card.power || 0) * 1.5;
  if (card.trigger) score += 1;
  score -= (card.cost || 0) * 0.2;

  // Target alignment
  if (card.target && profile.preferredTargets) {
    if (profile.preferredTargets.includes(card.target)) score += 3;
  }

  // Strike keyword bonuses
  if (card.category === 'Strike') {
    const kws = card.keywords || [];
    if (kws.includes('Entangle') && !opponent.conditions?.some(c => c.type === 'entangled')) score += 2;
    if (kws.includes('Erode')) score += 1.5;
    if (kws.includes('Drain')) score += 1.5;
    if (kws.includes('Overwhelm')) {
      const targetReducer = getOpponentReducers(opponent).find(r => r.name === card.target);
      if (targetReducer && targetReducer.ratio < 0.3) score += 3;
    }

    // Trigger-aware: bonus if condition currently met
    if (card.trigger?.condition?.type === 'has_condition') {
      const hasCond = opponent.conditions?.some(c => c.type === card.trigger.condition.condition);
      if (hasCond) score += (card.trigger.bonus || 2) * 1.5;
    }
  }

  // Empower: only valuable with strikes in hand
  if (card.category === 'Empower') {
    const hasStrike = ctx._handHasStrike !== undefined ? ctx._handHasStrike : true;
    if (!hasStrike) score *= 0.1;
  }

  // Counter: only when opponent has active buffs
  if (card.category === 'Counter') {
    const oppHasEmpower = opponent.conditions?.some(c => c.type === 'empower');
    const oppHasDisrupt = self.conditions?.some(c => c.type === 'disrupt');
    if (!oppHasEmpower && !oppHasDisrupt) score = 0;
  }

  // Cooperative: suppress strikes when building trust/rapport
  if (card.category === 'Strike') {
    if (profile.preferredTargets?.includes('rapport') && (self.rapport || 0) > 2) score = 0;
    if (profile.preferredTargets?.includes('trust') && (self.trust || 0) > 2) score = 0;
  }

  return score;
}

// ═══ EDGE CASES ═══

/**
 * Plan action cards when no energy cards are in hand.
 */
function planActions(actionCards, availableEnergy, self, opponent, ctx, profile) {
  const scoreFn = ctx.scoreFunction || ((card) => scoreCardHeuristic(card, self, opponent, ctx, profile));
  const scored = actionCards.map(c => ({ card: c, score: scoreFn(c) }));
  applyWinConditionDiversification(scored, self, opponent, ctx, profile);
  const affordable = selectAffordableActions(scored, availableEnergy, self, profile);
  const ordered = orderActionCards(affordable, self, opponent, ctx, profile);

  const decisions = [];
  for (const ac of ordered) {
    decisions.push({ card: ac.card, action: 'play' });
  }

  addRestraintIfNeeded(decisions, actionCards, self, opponent, ctx, profile);
  return decisions;
}

/**
 * Plan energy-only turns (no action cards in hand).
 * Prioritize permanent growth, with Siphon awareness.
 */
function planEnergyOnly(energyCards, energy, self, opponent, ctx, round) {
  // Play up to 1 energy card per turn (most decks have 1 energy slot)
  // Prioritize: Siphon (if condition met) > Standard > Attune > Siphon (fallback) > Surge (wasted)
  const sorted = [...energyCards].sort((a, b) => {
    return getEnergyInvestmentPriority(a, self, opponent) - getEnergyInvestmentPriority(b, self, opponent);
  });

  return [{ card: sorted[0], action: 'energy' }];
}

/**
 * Priority for pure energy investment (no action cards to enable).
 * Permanent growth is king when there's nothing to spend energy on.
 */
function getEnergyInvestmentPriority(card, self, opponent) {
  const etype = card.energyType || 'standard';
  switch (etype) {
    case 'siphon': {
      const condMet = checkSiphonCondition(card.siphon, self, opponent);
      return condMet ? 0 : 4; // Permanent if met, temp wasted if not
    }
    case 'standard': return 1;
    case 'attune': return 2; // Permanent + discount (discount may not be used)
    case 'surge': return 5;  // Temp energy with nothing to spend on = waste
    default: return 3;
  }
}

/**
 * Add restraint decision for cooperative profiles when no cooperative cards available.
 * v1.2 Bond v3.0: bondStrategy profiles (nurturing/deceptive) always restrain,
 * even at trust 0, because restraint gives +1 rapport and Strikes destroy
 * the entire cooperative investment.
 */
function addRestraintIfNeeded(decisions, hand, self, opponent, ctx, profile) {
  // Bond v3.0: bondStrategy profiles are always cooperative
  // Deceptive stops being cooperative once trust reaches betrayal threshold
  const isCooperative =
    (profile.bondStrategy === 'nurturing') ||
    (profile.bondStrategy === 'deceptive' && (opponent.trust || 0) < (profile.betrayalThreshold || 6)) ||
    (profile.preferredTargets?.includes('rapport') && (self.rapport || 0) > 2) ||
    (profile.preferredTargets?.includes('trust') && (self.trust || 0) > 2);

  if (!isCooperative) return;

  const playedCards = new Set(decisions.map(d => d.card));
  const hasCoopCards = hand.some(c =>
    (c.category === 'Offer' || c.category === 'Test') && !playedCards.has(c)
  );

  if (!hasCoopCards) {
    const unplayedStrikes = hand.filter(c =>
      c.category === 'Strike' && !playedCards.has(c)
    );
    if (unplayedStrikes.length > 0) {
      // Restrain the weakest strike
      const weakest = unplayedStrikes.reduce((a, b) =>
        (a.power || 1) <= (b.power || 1) ? a : b
      );
      decisions.push({ card: weakest, action: 'restrain' });
    }
  }
}

// ═══ EXPORTS ═══

module.exports = {
  planTurn,
  // Expose internals for testing and smart-ai integration
  evaluateEnergyPlans,
  simulateEnergyPlay,
  selectAffordableActions,
  orderEnergyCards,
  orderActionCards,
  applyWinConditionDiversification,
  scoreCardHeuristic,
};