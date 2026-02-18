/**
 * SHATTERED DUNGEON — Visitor AI v2.0
 * 
 * Major upgrade: opponent tracking, win probability, strategic mode switching.
 * 
 * [ADD] Opponent card tracking: knows what categories dungeon has played  
 * [ADD] Win probability: estimates chance of winning based on resource trajectories
 * [ADD] Strategic modes: aggressive when winning (push advantage), defensive when losing
 * [ADD] React exhaustion awareness: strikes more confidently when dungeon out of Reacts
 */

const PROFILES = {
  feral_aggressive: {
    description: 'Aggressive creature. Fights dungeon directly. Boar-like.',
    baseWeights: { Strike: 3, Empower: 2, Disrupt: 2, Counter: 1, Trap: 0, Offer: 0, Reshape: 0, React: 1 },
    scoreThreshold: 2, preferredTargets: ['structure', 'presence'],
    energyEagerness: 0.8, comboAwareness: 0.5,
  },
  cautious_explorer: {
    description: 'Cautious creature. Prefers defense and disruption. Moth-like.',
    baseWeights: { Strike: 1.5, Empower: 1, Disrupt: 2.5, Counter: 2, Trap: 1, Offer: 1, Reshape: 0, React: 1 },
    scoreThreshold: 1, preferredTargets: ['veil', 'presence'],
    energyEagerness: 0.6, comboAwareness: 0.7,
  },
  cooperative: {
    description: 'Cooperative creature. Seeks Bond. Symbiote-like.',
    baseWeights: { Strike: 0.5, Empower: 1, Disrupt: 0.5, Counter: 1, Trap: 0, Offer: 3, Reshape: 0, React: 1, Test: 2.5 },
    scoreThreshold: 1, preferredTargets: ['trust'],
    energyEagerness: 0.5, comboAwareness: 0.5,
  },
};

function createVisitorAI(profileName) {
  const p = PROFILES[profileName];
  if (!p) throw new Error(`Unknown visitor profile: ${profileName}. Options: ${Object.keys(PROFILES).join(', ')}`);
  const history = { counterCount: 0, loopDetected: false };
  return {
    profile: p,
    history,
    pickCards(hand, energy, self, opponent, ctx) {
      return pickCards(hand, energy, self, opponent, ctx, p, history);
    },
  };
}

// ═══ WIN PROBABILITY ESTIMATION (from visitor perspective) ═══
function estimateWinProbability(self, opponent, round) {
  // Visitor wins by depleting ANY dungeon reducer. Dungeon wins by depleting ANY visitor reducer.
  const selfReducers = [
    { val: self.vitality, start: self.startingValues?.vitality || 20 },
    { val: self.resolve, start: self.startingValues?.resolve || 16 },
    { val: self.nerve, start: self.startingValues?.nerve || 16 },
  ];
  const oppReducers = [
    { val: opponent.structure, start: opponent.startingValues?.structure || 16 },
    { val: opponent.veil, start: opponent.startingValues?.veil || 14 },
    { val: opponent.presence, start: opponent.startingValues?.presence || 12 },
  ];

  const selfLowest = Math.min(...selfReducers.map(r => r.val / r.start));
  const oppLowest = Math.min(...oppReducers.map(r => r.val / r.start));
  const selfAvg = selfReducers.reduce((s, r) => s + r.val / r.start, 0) / 3;
  const oppAvg = oppReducers.reduce((s, r) => s + r.val / r.start, 0) / 3;

  const vulnAdvantage = (1 - oppLowest) - (1 - selfLowest);
  const avgAdvantage = selfAvg - oppAvg;

  // Time pressure: auto-effects favor dungeon (visitor takes damage every round)
  // So later rounds are worse for visitors
  const timePressure = -Math.min(round / 15, 1) * 0.1;

  return Math.max(0, Math.min(1, 0.5 + vulnAdvantage * 0.3 + avgAdvantage * 0.2 + timePressure));
}

// ═══ OPPONENT ANALYSIS ═══
function analyzeOpponent(opponent, cardTracker) {
  const played = cardTracker?.dungeon || {};
  return {
    reactsPlayed: played.React || 0,
    likelyOutOfReacts: (played.React || 0) >= 2,
    countersPlayed: played.Counter || 0,
    likelyOutOfCounters: (played.Counter || 0) >= 2,
    strikesPlayed: played.Strike || 0,
    reshapesPlayed: played.Reshape || 0,
    hasActiveEmpower: opponent.conditions.some(c => c.type === 'empower'),
    hasActiveDisrupt: opponent.conditions.some(c => c.type === 'disrupt'),
    hasTrapSet: opponent.conditions.some(c => c.type === 'trap'),
    hasFortify: opponent.conditions.some(c => c.type === 'fortify'),
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
  const round = ctx.round || 1;

  // ── STRATEGIC ANALYSIS ──
  const winProb = estimateWinProbability(self, opponent, round);
  const oppAnalysis = analyzeOpponent(opponent, ctx.cardTracker);

  let mode = 'balanced';
  if (winProb > 0.65) mode = 'aggressive';        // We're winning — push the advantage
  else if (winProb < 0.35) mode = 'defensive';     // We're losing — survive and disrupt
  else if (winProb < 0.2) mode = 'desperate';       // Critical — hail mary strikes

  // ── LOOP DETECTION ──
  const oppCounteredUs = ctx.lastRoundEvents?.opponentCountered || false;
  if (oppCounteredUs) history.counterCount++;
  else history.counterCount = Math.max(0, history.counterCount - 1);
  history.loopDetected = history.counterCount >= 2;

  // ── ENERGY ──
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
    { name: 'structure', val: opponent.structure, start: opponent.startingValues?.structure || 16 },
    { name: 'veil', val: opponent.veil, start: opponent.startingValues?.veil || 14 },
    { name: 'presence', val: opponent.presence, start: opponent.startingValues?.presence || 12 },
  ].map(r => ({ ...r, ratio: r.val / r.start }));

  const selfReducers = [
    { name: 'vitality', val: self.vitality, start: self.startingValues?.vitality || 20 },
    { name: 'resolve', val: self.resolve, start: self.startingValues?.resolve || 16 },
    { name: 'nerve', val: self.nerve, start: self.startingValues?.nerve || 16 },
  ].map(r => ({ ...r, ratio: r.val / r.start }));

  // ── TARGET SELECTION ──
  let targets = p.preferredTargets;
  if (!targets || !targets[0]) {
    const sorted = [...oppReducers].sort((a, b) => a.ratio - b.ratio);
    targets = [sorted[0].name, sorted[1].name];
  }

  // Smart targeting: go after the dungeon resource that matches their auto-damage
  // (the room is already eroding it — pile on)
  const autoEffects = ctx.encounter?.autoEffects || [];
  const dungeonAutoTarget = autoEffects.find(ae => ae.target === 'dungeon')?.resource;
  if (dungeonAutoTarget) {
    const dungeonAutoReducer = oppReducers.find(r => r.name === dungeonAutoTarget);
    if (dungeonAutoReducer && dungeonAutoReducer.ratio < 0.7) {
      // Room is already damaging this — pile on
      if (!targets.includes(dungeonAutoTarget)) targets = [dungeonAutoTarget, ...targets];
    }
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

    // COOPERATIVE STRIKE SUPPRESSION: refuse to strike when building trust
    if (c.category === 'Strike' && p.preferredTargets?.includes('trust') && (self.trust || 0) > 2) {
      return { card: c, score: 0 }; // Hard suppress — don't betray cooperation
    }

    // Mode adjustments
    let modeMultiplier = 1;
    if (mode === 'aggressive') {
      if (c.category === 'Strike') modeMultiplier = 1.4;
      if (c.category === 'Empower') modeMultiplier = 1.3;
      if (c.category === 'Disrupt') modeMultiplier = 0.8;
    } else if (mode === 'defensive') {
      if (c.category === 'Disrupt') modeMultiplier = 1.5;
      if (c.category === 'Counter') modeMultiplier = 1.3;
      if (c.category === 'Strike') modeMultiplier = 0.7;
    } else if (mode === 'desperate') {
      if (c.category === 'Strike') modeMultiplier = 1.6;
      if (['Disrupt', 'Counter', 'Trap'].includes(c.category)) modeMultiplier = 0.3;
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
        if (targetReducer.ratio > 0.8) score += 2;
        if (targetReducer.ratio < 0.2 && !lethalMode) score -= 2;
      }
      if (oppAnalysis.likelyOutOfReacts) score += 2;
      if (oppAnalysis.hasFortify && opponent.conditions.some(co =>
        co.type === 'fortify' && co.resource === c.target)) {
        score -= 2;
      }

      // Keyword-aware scoring
      const kws = c.keywords || [];
      if (kws.includes('Entangle') && !opponent.conditions?.some(co => co.type === 'entangled')) {
        score += 2;
      }
      if (kws.includes('Erode')) score += 1.5;
      if (kws.includes('Drain')) {
        const drainRes = c.drainTarget || 'vitality';
        const drainReducer = selfReducers.find(r => r.name === drainRes);
        if (drainReducer && drainReducer.ratio < 0.7) score += 2;
      }
      if (kws.includes('Overwhelm')) {
        if (targetReducer && targetReducer.ratio < 0.3) score += 3;
      }

      // Trigger-aware
      if (c.trigger?.condition) {
        if (c.trigger.condition.type === 'has_condition') {
          if (opponent.conditions?.some(co => co.type === c.trigger.condition.condition)) {
            score += (c.trigger.bonus || 2) * 1.5;
          }
        }
        if (c.trigger.condition.type === 'resource_below' && c.trigger.condition.target === 'self') {
          const res = c.trigger.condition.resource;
          const val = self[res] || 0;
          const start = self.startingValues?.[res] || 20;
          if (val <= start * (c.trigger.condition.pct || 0.5)) {
            score += (c.trigger.bonus || 2) * 1.5;
          }
        }
      }

      if (c.selfCost) {
        const costRes = self[c.selfCost.resource] || 0;
        if (costRes <= c.selfCost.amount * 2) score -= 3;
        else score += 1;
      }
      if (c.exhaust && !lethalMode) score -= 1;
      if (c.exhaust && lethalMode) score += 2;
    }

    // ── EMPOWER SCORING ──
    if (c.category === 'Empower') {
      if (!hasStrike || bestStrikePower < 2) score *= 0.1;
      else score *= (0.5 + bestStrikePower * 0.25);
      if (history.loopDetected) score *= 0.2;
      if (!oppAnalysis.likelyOutOfCounters) score *= 0.7;
      if (c.empowerEffect?.addKeyword) {
        score += 1.5;
        if (c.empowerEffect.addKeyword === 'Erode') score += 1;
        if (c.empowerEffect.addKeyword === 'Drain') {
          if (selfReducers.some(r => r.ratio < 0.7)) score += 1.5;
        }
      }
    }

    // ── DISRUPT SCORING ──
    if (c.category === 'Disrupt') {
      if (!hasStrike) score *= 0.3;
      else score *= (0.7 + bestStrikePower * 0.1);
    }

    // ── COUNTER SCORING ──
    if (c.category === 'Counter') {
      const oppHasEmpower = opponent.conditions.some(co => co.type === 'empower' && co.placedBy === 'dungeon');
      const oppHasDisruptOnUs = self.conditions.some(co => co.type === 'disrupt' && co.placedBy === 'dungeon');
      if (oppHasEmpower || oppHasDisruptOnUs) {
        score += 4;
        if (oppHasEmpower) score += 2;
      } else {
        score = 0;
      }
    }

    // ── OFFER SCORING ──
    if (c.category === 'Offer') {
      const trustRatio = (self.trust || 0) / (ctx.bondThreshold || 12);
      if (trustRatio > 0.3 && trustRatio < 0.9) score *= 1.3;
      if (trustRatio >= 0.9) score *= 1.5;
      // Be wary if dungeon has set a trap
      if (oppAnalysis.hasTrapSet) score *= 0.5;
    }

    // ── TEST SCORING ──
    if (c.category === 'Test') {
      const trustRatio = (self.trust || 0) / (ctx.bondThreshold || 12);
      score += 3; // Tests are inherently valuable for cooperative profiles
      if (trustRatio > 0.3 && trustRatio < 0.8) score *= 1.4; // Sweet spot: building but not there yet
      if (trustRatio >= 0.8) score *= 1.2; // Close to Bond — keep pushing
      // Penalty if opponent rapport is low (might defect)
      if ((opponent.rapport || 0) < 2) score *= 0.7;
    }

    // ── LETHAL OVERRIDE ──
    if (lethalMode) {
      if (c.category === 'Strike' && targets.includes(c.target)) score *= 1.5;
      if (['Empower', 'Trap', 'Offer'].includes(c.category)) score *= 0.3;
    }

    return { card: c, score };
  }).filter(s => s.score > (p.scoreThreshold || 2) && energy.available >= (s.card.cost || 0))
    .sort((a, b) => b.score - a.score);

  // ── PLAY ORDERING ──
  // Counter first when urgent
  const counterIdx = scored.findIndex(s => s.card.category === 'Counter' && s.score > 5);
  if (counterIdx > 0) {
    const [counter] = scored.splice(counterIdx, 1);
    scored.unshift(counter);
  }

  // Empower before Strike
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
    if ((s.card.cost || 0) <= budget) {
      decisions.push({ card: s.card, action: 'play' });
      budget -= (s.card.cost || 0);
    }
  }

  // RESTRAINT: Only when no Offers/Tests are available (true dead-turn filler).
  // "I choose not to hurt you" — prevents completely empty turns.
  if (p.preferredTargets?.includes('trust') && (self.trust || 0) > 2) {
    const playedCards = decisions.map(d => d.card);
    const hasCoopCards = available.some(c =>
      (c.category === 'Offer' || c.category === 'Test') && !playedCards.includes(c)
    );
    if (!hasCoopCards) {
      const unplayedStrikes = available.filter(c =>
        c.category === 'Strike' && !playedCards.includes(c)
      );
      if (unplayedStrikes.length > 0) {
        const weakest = unplayedStrikes.reduce((a, b) => (a.power || 1) <= (b.power || 1) ? a : b);
        decisions.push({ card: weakest, action: 'restrain' });
      }
    }
  }

  return decisions;
}

module.exports = { createVisitorAI, PROFILES };