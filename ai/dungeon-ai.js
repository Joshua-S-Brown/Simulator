/**
 * SHATTERED DUNGEON — Dungeon AI v2.0
 * 
 * Major upgrade: opponent tracking, win probability, strategic mode switching.
 * 
 * [ADD] Opponent card tracking: knows what categories opponent has played
 * [ADD] Win probability: estimates chance of winning based on resource trajectories
 * [ADD] Strategic modes: aggressive when losing, conservative when winning, desperate when critical
 * [ADD] React exhaustion awareness: knows when opponent is out of Reacts
 * [FIX] Better Counter timing: only when opponent has active buffs worth removing
 */
const { getEffectiveCost } = require('./ai-utils');

const PROFILES = {
  aggressive: {
    description: 'Maximize damage to reducers. Kill-focused.',
    baseWeights: { Strike: 3, Empower: 2, Disrupt: 1.5, Counter: 1.5, Trap: 1.5, Offer: 0, Reshape: 0.5, React: 1 },
    scoreThreshold: 2, preferredTargets: ['vitality', 'nerve'],
    energyEagerness: 0.6, comboAwareness: 0.7,
  },
  nurturing: {
    description: 'Build Trust toward Bond. Minimize harm.',
    baseWeights: { Strike: 0.5, Empower: 1, Disrupt: 0.5, Counter: 1, Trap: 0, Offer: 3, Reshape: 2, React: 1, Test: 2.5 },
    scoreThreshold: 1, preferredTargets: ['trust', 'rapport'],
    energyEagerness: 0.5, comboAwareness: 0.5,
  },
  tactical: {
    description: 'Balanced play. Reads board state. Pivots based on win probability.',
    baseWeights: { Strike: 2, Empower: 1.5, Disrupt: 2, Counter: 2.5, Trap: 2, Offer: 1, Reshape: 2, React: 1 },
    scoreThreshold: 2, preferredTargets: null,
    energyEagerness: 0.7, comboAwareness: 0.9,
  },
  deceptive: {
    description: 'Build Trust then betray. Offer-Trap combos.',
    baseWeights: { Strike: 1, Empower: 1, Disrupt: 1, Counter: 1, Trap: 3, Offer: 3, Reshape: 1, React: 1 },
    scoreThreshold: 1, preferredTargets: ['trust'],
    energyEagerness: 0.5, comboAwareness: 0.8,
    betrayalThreshold: 4,
  },
};

function createDungeonAI(profileName) {
  const p = PROFILES[profileName];
  if (!p) throw new Error(`Unknown dungeon profile: ${profileName}. Options: ${Object.keys(PROFILES).join(', ')}`);
  const history = { counterCount: 0, loopDetected: false };
  return {
    profile: p,
    history,
    pickCards(hand, energy, self, opponent, ctx) {
      return pickCards(hand, energy, self, opponent, ctx, p, history);
    },
  };
}

// ═══ WIN PROBABILITY ESTIMATION ═══
function estimateWinProbability(self, opponent, round) {
  // Dungeon wins by depleting ANY visitor reducer. Visitor wins by depleting ANY dungeon reducer.
  const selfReducers = [
    { val: self.structure, start: self.startingValues?.structure || 16 },
    { val: self.veil, start: self.startingValues?.veil || 14 },
    { val: self.presence, start: self.startingValues?.presence || 12 },
  ];
  const oppReducers = [
    { val: opponent.vitality, start: opponent.startingValues?.vitality || 20 },
    { val: opponent.resolve, start: opponent.startingValues?.resolve || 16 },
    { val: opponent.nerve, start: opponent.startingValues?.nerve || 16 },
  ];

  // Health advantage: compare lowest reducers (most vulnerable)
  const selfLowest = Math.min(...selfReducers.map(r => r.val / r.start));
  const oppLowest = Math.min(...oppReducers.map(r => r.val / r.start));

  // Average health
  const selfAvg = selfReducers.reduce((s, r) => s + r.val / r.start, 0) / 3;
  const oppAvg = oppReducers.reduce((s, r) => s + r.val / r.start, 0) / 3;

  // Win prob: based on how close opponent's weakest is to zero vs our weakest
  // Higher = more likely WE win
  const vulnAdvantage = (1 - oppLowest) - (1 - selfLowest); // positive = opponent more vulnerable
  const avgAdvantage = selfAvg - oppAvg; // positive = we're healthier overall

  // Time pressure: later rounds favor whoever has auto-effect advantage
  const timePressure = Math.min(round / 15, 1) * 0.1;

  return Math.max(0, Math.min(1, 0.5 + vulnAdvantage * 0.3 + avgAdvantage * 0.2 + timePressure));
}

// ═══ OPPONENT ANALYSIS ═══
function analyzeOpponent(opponent, cardTracker, oppSide) {
  const played = cardTracker?.[oppSide] || {};
  return {
    reactsPlayed: played.React || 0,
    likelyOutOfReacts: (played.React || 0) >= 2, // Most decks have 2-3 Reacts
    countersPlayed: played.Counter || 0,
    likelyOutOfCounters: (played.Counter || 0) >= 1,
    strikesPlayed: played.Strike || 0,
    hasActiveEmpower: opponent.conditions.some(c => c.type === 'empower'),
    hasActiveDisrupt: opponent.conditions.some(c => c.type === 'disrupt'),
    isEntangled: opponent.conditions.some(c => c.type === 'entangled'),
  };
}

function pickCards(hand, energy, self, opponent, ctx, p, history) {
  const decisions = [];
  const available = [...hand];
  const energyCards = available.filter(c => c.category === 'Energy');
  const actionCards = available.filter(c => c.category !== 'Energy' && c.category !== 'React');
  const strikes = actionCards.filter(c => c.category === 'Strike');
  const hasStrike = strikes.length > 0;
  const bestStrikePower = hasStrike ? Math.max(...strikes.map(c => c.power || 0)) : 0;
  const hasOffer = actionCards.some(c => c.category === 'Offer');
  const round = ctx.round || 1;

  // ── STRATEGIC ANALYSIS ──
  const winProb = estimateWinProbability(self, opponent, round);
  const oppSide = opponent.side || 'visitor';
  const oppAnalysis = analyzeOpponent(opponent, ctx.cardTracker, oppSide);

  // Strategic mode based on win probability
  let mode = 'balanced';
  if (winProb > 0.65) mode = 'conservative';      // We're winning — protect lead
  else if (winProb < 0.35) mode = 'aggressive';    // We're losing — push hard
  else if (winProb < 0.2) mode = 'desperate';       // Critical — all-in offense

  // ── LOOP DETECTION ──
  const oppCounteredUs = ctx.lastRoundEvents?.opponentCountered || false;
  if (oppCounteredUs) history.counterCount++;
  else history.counterCount = Math.max(0, history.counterCount - 1);
  history.loopDetected = history.counterCount >= 2;

  // ── ENERGY INVESTMENT ──
  const bestActionCost = actionCards.length > 0 ? Math.max(...actionCards.map(c => c.cost || 0)) : 0;
  let shouldPlayEnergy = false;
  if (energyCards.length > 0) {
    if (round <= 2 && energy.base < 4) shouldPlayEnergy = true;
    else if (energy.available < bestActionCost) shouldPlayEnergy = true;
    else if (energy.available < 3 && hasStrike) shouldPlayEnergy = true;
  }
  if (shouldPlayEnergy) {
    const ec = energyCards[0];
    decisions.push({ card: ec, action: 'energy' });
    available.splice(available.indexOf(ec), 1);
  }

  // ── RESOURCE ANALYSIS ──
  const autoResource = ctx.autoResource;
  const oppReducers = [
    { name: 'vitality', val: opponent.vitality, start: opponent.startingValues?.vitality || 20 },
    { name: 'resolve', val: opponent.resolve, start: opponent.startingValues?.resolve || 16 },
    { name: 'nerve', val: opponent.nerve, start: opponent.startingValues?.nerve || 16 },
  ].map(r => ({ ...r, ratio: r.val / r.start }));

  const selfReducers = [
    { name: 'structure', val: self.structure, start: self.startingValues?.structure || 16 },
    { name: 'veil', val: self.veil, start: self.startingValues?.veil || 14 },
    { name: 'presence', val: self.presence, start: self.startingValues?.presence || 12 },
  ].map(r => ({ ...r, ratio: r.val / r.start }));

  const lowestSelfRatio = Math.min(...selfReducers.map(r => r.ratio));

  // ── TARGET SELECTION ──
  let targets = p.preferredTargets;
  if (!targets) {
    const sorted = [...oppReducers].map(r => ({
      ...r,
      effectiveRatio: r.name === autoResource ? r.ratio + 0.3 : r.ratio,
    })).sort((a, b) => a.effectiveRatio - b.effectiveRatio);
    targets = [sorted[0].name, sorted[1].name];
  }

  if (p.betrayalThreshold && opponent.trust >= p.betrayalThreshold) {
    targets = ['vitality', 'nerve'];
  }

  // ── LETHAL CHECK ──
  const nearDeath = oppReducers.filter(r => r.val > 0 && r.val <= 3);
  let lethalMode = false;
  if (nearDeath.length > 0) {
    lethalMode = true;
    targets = [nearDeath.sort((a, b) => a.val - b.val)[0].name, ...targets];
  }

  // ── SCORE CARDS ──
  const scored = actionCards.filter(c => available.includes(c)).map(c => {
    let score = 0;
    const w = p.baseWeights[c.category] || 1;

    // NURTURING STRIKE SUPPRESSION: refuse to strike when building rapport
    if (c.category === 'Strike' && p.preferredTargets?.includes('rapport') && (self.rapport || 0) > 2) {
      return { card: c, score: 0 }; // Hard suppress — don't betray cooperation
    }

    // Mode adjustments
    let modeMultiplier = 1;
    if (mode === 'aggressive' || mode === 'desperate') {
      if (c.category === 'Strike') modeMultiplier = 1.4;
      if (c.category === 'Empower') modeMultiplier = 1.3;
      if (c.category === 'Reshape') modeMultiplier = 0.3;
      if (c.category === 'Trap') modeMultiplier = 0.5;
    } else if (mode === 'conservative') {
      if (c.category === 'Reshape') modeMultiplier = 1.5;
      if (c.category === 'Counter') modeMultiplier = 1.3;
      if (c.category === 'Disrupt') modeMultiplier = 1.3;
      if (c.category === 'Strike') modeMultiplier = 0.8;
    }

    score += w * 2 * modeMultiplier;
    score += (c.power || 0) * 1.5;
    if (c.trigger) score += 1;
    score -= (c.cost || 0) * 0.5;

    // ── STRIKE SCORING ──
    if (c.category === 'Strike' && c.target) {
      const targetReducer = oppReducers.find(r => r.name === c.target);
      if (targets.includes(c.target)) score += 3;
      if (targetReducer) {
        if (targetReducer.ratio > 0.8) score += 2;  // Fresh target
        if (targetReducer.ratio < 0.2 && !lethalMode) score -= 2;  // Diminishing returns
      }
      if (oppAnalysis.likelyOutOfReacts) score += 2;
      if (c.target === autoResource && !targets[0]?.includes(c.target)) score -= 1;

      // Keyword-aware scoring
      const kws = c.keywords || [];
      if (kws.includes('Entangle') && !opponent.conditions?.some(co => co.type === 'entangled')) {
        score += 2; // Setup value: enables future Entangle combos
      }
      if (kws.includes('Erode')) {
        score += 1.5; // Persistent pressure value
      }
      if (kws.includes('Drain')) {
        const drainRes = c.drainTarget || 'presence';
        const drainReducer = selfReducers.find(r => r.name === drainRes);
        if (drainReducer && drainReducer.ratio < 0.7) score += 2; // More valuable when damaged
      }
      if (kws.includes('Overwhelm')) {
        if (targetReducer && targetReducer.ratio < 0.3) score += 3; // Near-depleted → big spill
      }

      // Trigger-aware: bonus if condition is currently met
      if (c.trigger?.condition) {
        if (c.trigger.condition.type === 'has_condition') {
          const hasCond = opponent.conditions?.some(co => co.type === c.trigger.condition.condition);
          if (hasCond) score += (c.trigger.bonus || 2) * 1.5; // Trigger is active — big payoff
        }
        if (c.trigger.condition.type === 'resource_below' && c.trigger.condition.target === 'self') {
          const res = c.trigger.condition.resource;
          const val = self[res] || 0;
          const start = self.startingValues?.[res] || 20;
          if (val <= start * (c.trigger.condition.pct || 0.5)) {
            score += (c.trigger.bonus || 2) * 1.5; // Desperate trigger active
          }
        }
      }

      // Self-cost risk: penalize unless we can afford it
      if (c.selfCost) {
        const costRes = self[c.selfCost.resource] || 0;
        if (costRes <= c.selfCost.amount * 2) score -= 3; // Too risky
        else score += 1; // Risk/reward trade worth it
      }
      // Exhaust: slightly penalize (one-time use is precious)
      if (c.exhaust && !lethalMode) score -= 1;
      if (c.exhaust && lethalMode) score += 2; // Save exhaust for lethal push
    }

    // ── EMPOWER SCORING ──
    if (c.category === 'Empower') {
      if (!hasStrike || bestStrikePower < 2) score *= 0.1;
      else score *= (0.5 + bestStrikePower * 0.25);
      if (history.loopDetected) score *= 0.2;
      if (!oppAnalysis.likelyOutOfCounters) score *= 0.7;
      // Keyword grant bonuses
      if (c.empowerEffect?.addKeyword) {
        score += 1.5; // Keyword grants are more valuable than raw stats
        // Erode grant more valuable with Strikes in hand
        if (c.empowerEffect.addKeyword === 'Erode') score += 1;
        // Drain grant more valuable when damaged
        if (c.empowerEffect.addKeyword === 'Drain') {
          const anyDamaged = selfReducers.some(r => r.ratio < 0.7);
          if (anyDamaged) score += 1.5;
        }
      }
      if (c.empowerEffect?.retarget) score += 1; // Flexibility has value
    }

    // ── DISRUPT SCORING ──
    if (c.category === 'Disrupt') {
      if (!hasStrike) score *= 0.3;
      else score *= (0.7 + bestStrikePower * 0.1);
    }

    // ── COUNTER SCORING ──
    if (c.category === 'Counter') {
      const oppHasEmpower = opponent.conditions.some(co => co.type === 'empower' && co.placedBy === oppSide);
      const oppHasDisruptOnUs = self.conditions.some(co => co.type === 'disrupt' && co.placedBy === oppSide);
      if (oppHasEmpower || oppHasDisruptOnUs) {
        score += 4;
        if (oppHasEmpower) score += 2;
      } else {
        score = 0;
      }
    }

    // ── RESHAPE SCORING ──
    if (c.category === 'Reshape') {
      if (c.reshapeEffect?.heal) {
        for (const h of c.reshapeEffect.heal) {
          const reducer = selfReducers.find(r => r.name === h.resource);
          if (reducer) {
            const damageRatio = 1 - reducer.ratio;
            score += damageRatio * 6;
            if (reducer.ratio < 0.3) score += 4;
          }
        }
      }
      if (c.reshapeEffect?.fortify) {
        const reducer = selfReducers.find(r => r.name === c.reshapeEffect.fortify.resource);
        if (reducer && reducer.ratio < 0.5) score += 2;
      }
      if (c.reshapeEffect?.shift) {
        const fromR = selfReducers.find(r => r.name === c.reshapeEffect.shift.from);
        const toR = selfReducers.find(r => r.name === c.reshapeEffect.shift.to);
        if (fromR && toR && fromR.ratio > toR.ratio + 0.2) score += 3;
      }
      if (lowestSelfRatio > 0.8) score *= 0.2;
    }

    // ── TRAP SCORING ──
    if (c.category === 'Trap') {
      if (c.trapTrigger === 'offer_accepted' && hasOffer) score += 3;
      if (c.trapTrigger === 'empower_played' || c.trapTrigger === 'strike_played') score += 2;
      if (c.trapTrigger === 'counter_played') score += 1.5;
      const existingTrap = self.conditions.find(co => co.type === 'trap' && co.trigger === c.trapTrigger);
      if (existingTrap) score = 0;
    }

    // ── OFFER SCORING ──
    if (c.category === 'Offer') {
      const trustRatio = (opponent.trust || 0) / (ctx.bondThreshold || 12);
      if (trustRatio > 0.3 && trustRatio < 0.9) score *= 1.3;
      if (trustRatio >= 0.9) score *= 1.5;
      const hasTrapSet = self.conditions.some(co => co.type === 'trap' && co.trigger === 'offer_accepted');
      if (hasTrapSet) score += 3;
    }

    // ── TEST SCORING ──
    if (c.category === 'Test') {
      const rapRatio = (self.rapport || 0) / (ctx.bondThreshold || 12);
      score += 3; // Tests are inherently valuable for nurturing profiles
      if (rapRatio > 0.3 && rapRatio < 0.8) score *= 1.4;
      if (rapRatio >= 0.8) score *= 1.2;
      // Penalty if opponent trust is low (might defect)
      if ((opponent.trust || 0) < 2) score *= 0.7;
    }

    // ── LETHAL OVERRIDE ──
    if (lethalMode) {
      if (c.category === 'Strike' && targets.includes(c.target)) score *= 1.5;
      if (['Empower', 'Reshape', 'Trap', 'Offer'].includes(c.category)) score *= 0.3;
    }

    return { card: c, score };
  }).filter(s => s.score > (p.scoreThreshold || 2) && energy.available >= (getEffectiveCost(s.card, self)))
    .sort((a, b) => b.score - a.score);

  // ── PLAY ORDERING ──
  // Counter first when urgent
  const counterIdx = scored.findIndex(s => s.card.category === 'Counter' && s.score > 5);
  if (counterIdx > 0) {
    const [counter] = scored.splice(counterIdx, 1);
    scored.unshift(counter);
  }

  // Trap before Offer
  if (!lethalMode) {
    const trapIdx = scored.findIndex(s => s.card.category === 'Trap' && s.card.trapTrigger === 'offer_accepted');
    const offerIdx = scored.findIndex(s => s.card.category === 'Offer');
    if (trapIdx >= 0 && offerIdx >= 0 && trapIdx > offerIdx) {
      const [trap] = scored.splice(trapIdx, 1);
      scored.splice(offerIdx, 0, trap);
    }
  }

  // Empower before Strike (combo)
  if (Math.random() < p.comboAwareness && !lethalMode && !history.loopDetected) {
    const empIdx = scored.findIndex(s => s.card.category === 'Empower');
    const strikeIdx = scored.findIndex(s => s.card.category === 'Strike');
    if (empIdx >= 0 && strikeIdx >= 0 && empIdx > strikeIdx) {
      const [emp] = scored.splice(empIdx, 1);
      scored.splice(strikeIdx, 0, emp);
    }
  }

  // Loop breaker
  if (history.loopDetected && scored.length > 0) {
    const strikeFirst = scored.findIndex(s => s.card.category === 'Strike');
    if (strikeFirst > 0) {
      const [strike] = scored.splice(strikeFirst, 1);
      scored.unshift(strike);
    }
  }

  let budget = energy.available - decisions.reduce((s, d) => s + (d.card.cost || 0), 0);
  for (const s of scored) {
    if ((getEffectiveCost(s.card, self)) <= budget) {
      decisions.push({ card: s.card, action: 'play' });
      budget -= (getEffectiveCost(s.card, self));
    }
  }

  // RESTRAINT: Only when no Offers/Tests are available (true dead-turn filler).
  // "I choose not to hurt you" — prevents completely empty turns.
  if (p.preferredTargets?.includes('rapport') && (self.rapport || 0) > 2) {
    const playedCards = decisions.map(d => d.card);
    const hasCoopCards = available.some(c =>
      (c.category === 'Offer' || c.category === 'Test') && !playedCards.includes(c)
    );
    if (!hasCoopCards) {
      const unplayedStrikes = available.filter(c =>
        c.category === 'Strike' && !playedCards.includes(c)
      );
      if (unplayedStrikes.length > 0) {
        decisions.push({ card: unplayedStrikes[0], action: 'restrain' });
      }
    }
  }

  return decisions;
}

module.exports = { createDungeonAI, PROFILES };