/**
 * SHATTERED DUNGEON — Dungeon AI v2.5 (Bond v3.0 Profiles)
 * 
 * v2.0: opponent tracking, win probability, strategic mode switching.
 * v2.1: Combo sequencer integration — replaces naive energy-then-score
 *       with strategic energy planning (Surge burst, Attune sequencing,
 *       Siphon awareness, budget-aware combos, win condition diversification).
 * v2.4: Party member targeting — selectMemberTarget for per-profile targeting
 * v2.5: Bond v3.0 — trust-tier-aware scoring for nurturing/deceptive profiles
 *       via bond-ai-scoring module. Replaces heuristic rapport-gating with
 *       phase-driven scoring (trust-building → Covenant / betrayal).
 * 
 * [ADD] Opponent card tracking: knows what categories opponent has played
 * [ADD] Win probability: estimates chance of winning based on resource trajectories
 * [ADD] Strategic modes: aggressive when losing, conservative when winning, desperate when critical
 * [ADD] React exhaustion awareness: knows when opponent is out of Reacts
 * [FIX] Better Counter timing: only when opponent has active buffs worth removing
 * [ADD] Combo sequencer: strategic energy + action card sequencing (v2.1)
 * [ADD] selectMemberTarget: per-profile party member targeting (v2.4)
 * [ADD] Bond v3.0: trust-tier scoring for nurturing/deceptive via applyBondV3Scoring (v2.5)
 */
const { getEffectiveCost } = require('./ai-utils');
const { planTurn } = require('./combo-sequencer');
const { applyBondV3Scoring } = require('./bond-ai-scoring');

const PROFILES = {
  aggressive: {
    description: 'Maximize damage to reducers. Kill-focused.',
    baseWeights: { Strike: 3, Empower: 2, Disrupt: 1.5, Counter: 1.5, Trap: 1.5, Offer: 0, Reshape: 0.5, React: 1 },
    scoreThreshold: 2, preferredTargets: ['vitality', 'nerve'],
    energyEagerness: 0.6, comboAwareness: 0.7,
  },
  // Bond v3.0: Trust-tier-aware nurturing profile
  nurturing: {
    description: 'Build Trust toward Bond. Minimize harm. Bond v3.0 trust-tier strategy.',
    baseWeights: { Strike: 0.1, Empower: 0.5, Disrupt: 0.3, Counter: 1, Trap: 0, Offer: 5, Reshape: 3, React: 1, Test: 4 },
    scoreThreshold: 1, preferredTargets: ['trust', 'rapport'],
    energyEagerness: 0.5, comboAwareness: 0.5,
    bondStrategy: 'nurturing',
  },
  tactical: {
    description: 'Balanced play. Reads board state. Pivots based on win probability.',
    baseWeights: { Strike: 2, Empower: 1.5, Disrupt: 2, Counter: 2.5, Trap: 2, Offer: 1, Reshape: 2, React: 1 },
    scoreThreshold: 2, preferredTargets: null,
    energyEagerness: 0.7, comboAwareness: 0.9,
  },
  // Bond v3.0: Trust-tier-aware deceptive profile
  deceptive: {
    description: 'Build Trust then betray. Mirrors Nurturing until threshold. Bond v3.0.',
    baseWeights: { Strike: 0.1, Empower: 0.5, Disrupt: 0.3, Counter: 1, Trap: 0, Offer: 5, Reshape: 3, React: 1, Test: 4 },
    scoreThreshold: 1, preferredTargets: ['trust', 'rapport'],
    energyEagerness: 0.5, comboAwareness: 0.8,
    bondStrategy: 'deceptive',
    betrayalThreshold: 6,
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
    // v2.4: Party member targeting
    selectMemberTarget(visitor, dungeon) {
      return selectMemberTarget(visitor, dungeon, profileName);
    },
  };
}

// ═══ PARTY MEMBER TARGETING (v2.4) ═══

function selectMemberTarget(visitor, dungeon, profileName) {
  if (!visitor.isParty) return null;

  const active = Object.entries(visitor.members)
    .filter(([_, m]) => m.status === 'active')
    .map(([key, m]) => ({ key, ...m }));

  if (active.length <= 1) return active.length === 1 ? active[0].key : null;

  switch (profileName) {
    case 'aggressive':
    case 'desperate':
      // Target lowest vitality → fastest knockout
      return active.sort((a, b) => a.vitality - b.vitality)[0].key;

    case 'tactical': {
      // Target most valuable member: support > flex > dps > tank
      const rolePriority = { support: 4, flex: 3, dps: 2, tank: 1 };
      return active.sort((a, b) => {
        const pA = rolePriority[a.role] || 0;
        const pB = rolePriority[b.role] || 0;
        if (pB !== pA) return pB - pA; // Higher priority first
        return a.vitality - b.vitality; // Tiebreak: lower vitality
      })[0].key;
    }

    case 'nurturing':
      // Target highest vitality → avoid kills, want Bond
      return active.sort((a, b) => b.vitality - a.vitality)[0].key;

    case 'deceptive': {
      // Deception means misdirection — vary targets to be unpredictable.
      // Still favors anti-deception tools (flex) and sustain (support),
      // but weighted random ensures the party can't predict who's next.
      const deceptivePriority = { flex: 3, support: 2.5, dps: 1.5, tank: 1 };
      const weights = active.map(m => {
        const priority = deceptivePriority[m.role] || 1;
        // Slight bias toward wounded targets (easier kills)
        const vulnBonus = m.maxVitality ? (1 + 0.3 * (1 - m.vitality / m.maxVitality)) : 1;
        return { key: m.key, weight: priority * vulnBonus };
      });
      const totalWeight = weights.reduce((s, w) => s + w.weight, 0);
      let roll = Math.random() * totalWeight;
      for (const w of weights) {
        roll -= w.weight;
        if (roll <= 0) return w.key;
      }
      return weights[weights.length - 1].key;
    }

    default:
      return active.sort((a, b) => a.vitality - b.vitality)[0].key;
  }
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

  const selfLowest = Math.min(...selfReducers.map(r => r.val / r.start));
  const oppLowest = Math.min(...oppReducers.map(r => r.val / r.start));

  const selfAvg = selfReducers.reduce((s, r) => s + r.val / r.start, 0) / 3;
  const oppAvg = oppReducers.reduce((s, r) => s + r.val / r.start, 0) / 3;

  const vulnAdvantage = (1 - oppLowest) - (1 - selfLowest);
  const avgAdvantage = selfAvg - oppAvg;

  const timePressure = Math.min(round / 15, 1) * 0.1;

  return Math.max(0, Math.min(1, 0.5 + vulnAdvantage * 0.3 + avgAdvantage * 0.2 + timePressure));
}

// ═══ OPPONENT ANALYSIS ═══
function analyzeOpponent(opponent, cardTracker, oppSide) {
  const played = cardTracker?.[oppSide] || {};
  return {
    reactsPlayed: played.React || 0,
    likelyOutOfReacts: (played.React || 0) >= 2,
    countersPlayed: played.Counter || 0,
    likelyOutOfCounters: (played.Counter || 0) >= 1,
    strikesPlayed: played.Strike || 0,
    hasActiveEmpower: opponent.conditions.some(c => c.type === 'empower'),
    hasActiveDisrupt: opponent.conditions.some(c => c.type === 'disrupt'),
    isEntangled: opponent.conditions.some(c => c.type === 'entangled'),
  };
}

function pickCards(hand, energy, self, opponent, ctx, p, history) {
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

  let mode = 'balanced';
  if (winProb > 0.65) mode = 'conservative';
  else if (winProb < 0.35) mode = 'aggressive';
  else if (winProb < 0.2) mode = 'desperate';

  // ── LOOP DETECTION ──
  const oppCounteredUs = ctx.lastRoundEvents?.opponentCountered || false;
  if (oppCounteredUs) history.counterCount++;
  else history.counterCount = Math.max(0, history.counterCount - 1);
  history.loopDetected = history.counterCount >= 2;

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
    // Weight by absolute remaining HP + starting HP (lower = faster to deplete)
    // Deprioritize auto-damage resource — don't pile on what erosion already handles
    const sorted = [...oppReducers].map(r => ({
      ...r,
      depletionScore: r.val + r.start * 0.3 + (r.name === autoResource ? 5 : 0),
    })).sort((a, b) => a.depletionScore - b.depletionScore);
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

  // ── SCORE FUNCTION (captures all strategic context for the sequencer) ──
  const scoreFunction = (card) => {
    let score = 0;
    const w = p.baseWeights[card.category] || 1;

    // NURTURING STRIKE SUPPRESSION (legacy fallback — Bond v3.0 scoring handles this better)
    if (card.category === 'Strike' && p.preferredTargets?.includes('rapport') && (self.rapport || 0) > 2 && !p.bondStrategy) {
      return 0;
    }

    // Mode adjustments
    let modeMultiplier = 1;
    if (mode === 'aggressive' || mode === 'desperate') {
      if (card.category === 'Strike') modeMultiplier = 1.4;
      if (card.category === 'Empower') modeMultiplier = 1.3;
      if (card.category === 'Reshape') modeMultiplier = 0.3;
      if (card.category === 'Trap') modeMultiplier = 0.5;
    } else if (mode === 'conservative') {
      if (card.category === 'Reshape') modeMultiplier = 1.5;
      if (card.category === 'Counter') modeMultiplier = 1.3;
      if (card.category === 'Disrupt') modeMultiplier = 1.3;
      if (card.category === 'Strike') modeMultiplier = 0.8;
    }

    score += w * 2 * modeMultiplier;
    score += (card.power || 0) * 1.5;
    if (card.trigger) score += 1;
    score -= (card.cost || 0) * 0.2;

    // ── STRIKE SCORING ──
    if (card.category === 'Strike' && card.target) {
      const targetReducer = oppReducers.find(r => r.name === card.target);
      if (targets.includes(card.target)) score += 3;
      if (targetReducer) {
        // Reward targeting resources closer to depletion (focus fire)
        if (targetReducer.ratio < 0.5) score += 3;
        if (targetReducer.ratio < 0.3) score += 2; // Stacks — finish it off
        // Small bonus for fresh targets we haven't touched (open new win path)
        if (targetReducer.ratio > 0.9 && targets.includes(card.target)) score += 1;
      }
      if (oppAnalysis.likelyOutOfReacts) score += 2;
      if (card.target === autoResource && !targets[0]?.includes(card.target)) score -= 1;

      const kws = card.keywords || [];
      if (kws.includes('Entangle') && !opponent.conditions?.some(co => co.type === 'entangled')) {
        score += 2;
      }
      if (kws.includes('Erode')) {
        score += 1.5;
      }
      if (kws.includes('Drain')) {
        const drainRes = card.drainTarget || 'presence';
        const drainReducer = selfReducers.find(r => r.name === drainRes);
        if (drainReducer && drainReducer.ratio < 0.7) score += 2;
      }
      if (kws.includes('Overwhelm')) {
        if (targetReducer && targetReducer.ratio < 0.3) score += 3;
      }

      if (card.trigger?.condition) {
        if (card.trigger.condition.type === 'has_condition') {
          const hasCond = opponent.conditions?.some(co => co.type === card.trigger.condition.condition);
          if (hasCond) score += (card.trigger.bonus || 2) * 1.5;
        }
        if (card.trigger.condition.type === 'resource_below' && card.trigger.condition.target === 'self') {
          const res = card.trigger.condition.resource;
          const val = self[res] || 0;
          const start = self.startingValues?.[res] || 20;
          if (val <= start * (card.trigger.condition.pct || 0.5)) {
            score += (card.trigger.bonus || 2) * 1.5;
          }
        }
      }

      if (card.selfCost) {
        const costRes = self[card.selfCost.resource] || 0;
        if (costRes <= card.selfCost.amount * 2) score -= 3;
        else score += 1;
      }
      if (card.exhaust && !lethalMode) score -= 1;
      if (card.exhaust && lethalMode) score += 2;
    }

    // ── EMPOWER SCORING ──
    if (card.category === 'Empower') {
      if (!hasStrike || bestStrikePower < 2) score *= 0.1;
      else score *= (0.5 + bestStrikePower * 0.25);
      if (history.loopDetected) score *= 0.2;
      if (!oppAnalysis.likelyOutOfCounters) score *= 0.7;
      if (card.empowerEffect?.addKeyword) {
        score += 1.5;
        if (card.empowerEffect.addKeyword === 'Erode') score += 1;
        if (card.empowerEffect.addKeyword === 'Drain') {
          if (selfReducers.some(r => r.ratio < 0.7)) score += 1.5;
        }
      }
      if (card.empowerEffect?.retarget) score += 1;
    }

    // ── DISRUPT SCORING ──
    if (card.category === 'Disrupt') {
      if (!hasStrike) score *= 0.3;
      else score *= (0.7 + bestStrikePower * 0.1);
    }

    // ── COUNTER SCORING ──
    if (card.category === 'Counter') {
      const oppHasEmpower = opponent.conditions.some(co => co.type === 'empower' && co.placedBy === oppSide);
      const oppHasDisruptOnUs = self.conditions.some(co => co.type === 'disrupt' && co.placedBy === oppSide);
      if (oppHasEmpower || oppHasDisruptOnUs) {
        score += 4;
        if (oppHasEmpower) score += 2;
      } else {
        score = 0;
      }
    }

    // ── TRAP SCORING ──
    if (card.category === 'Trap') {
      if (card.trapTrigger === 'empower_played' || card.trapTrigger === 'strike_played') score += 2;
      if (card.trapTrigger === 'counter_played') score += 1.5;
      const existingTrap = self.conditions.find(co => co.type === 'trap' && co.trigger === card.trapTrigger);
      if (existingTrap) score = 0;
    }

    // ── OFFER SCORING ──
    if (card.category === 'Offer') {
      const trustRatio = (opponent.trust || 0) / (ctx.bondThreshold || 12);
      if (trustRatio > 0.3 && trustRatio < 0.9) score *= 1.3;
      if (trustRatio >= 0.9) score *= 1.5;
      const hasTrapSet = self.conditions.some(co => co.type === 'trap' && co.trigger === 'offer_accepted');
      if (hasTrapSet) score += 3;
    }

    // ── TEST SCORING ──
    if (card.category === 'Test') {
      const rapRatio = (self.rapport || 0) / (ctx.bondThreshold || 12);
      score += 3;
      if (rapRatio > 0.3 && rapRatio < 0.8) score *= 1.4;
      if (rapRatio >= 0.8) score *= 1.2;
      if ((opponent.trust || 0) < 2) score *= 0.7;
    }

    // ── LETHAL OVERRIDE ──
    if (lethalMode) {
      if (card.category === 'Strike' && targets.includes(card.target)) score *= 1.5;
      if (['Empower', 'Reshape', 'Trap', 'Offer'].includes(card.category)) score *= 0.3;
    }

    // ── BOND v3.0: Trust-Tier-Aware Override ──
    if (p.bondStrategy) {
      score = applyBondV3Scoring(card, score, self, opponent, ctx, p, {
        hasStrike, bestStrikePower, round, lethalMode
      });
    }

    return score;
  };

  // ── HAND OFF TO COMBO SEQUENCER ──
  return planTurn(hand, energy, self, opponent, {
    ...ctx,
    scoreFunction,
    _handHasStrike: hasStrike,
  }, p);
}

module.exports = { createDungeonAI, PROFILES };