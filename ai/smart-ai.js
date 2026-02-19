/**
 * SHATTERED DUNGEON — Smart AI v1.1 (Combo Sequencer)
 * 
 * v1.0: MC evaluation, deck tracking, opponent response modeling.
 * v1.1: Combo sequencer integration — replaces naive energy-then-score
 *       with strategic energy planning. MC scores passed to sequencer
 *       via scoreFunction closure.
 * 
 * Unified AI module using:
 * - Board evaluator for position assessment
 * - Monte Carlo simulator for card evaluation (replaces heuristic scoring)
 * - Deck tracker for draw probability and resource planning
 * - 1-ply lookahead with opponent response modeling
 * - Combo sequencer for energy + action card planning (v1.1)
 * 
 * Supports both dungeon and visitor sides via configuration.
 * Matches the pickCards() interface of existing AI modules.
 */
const { getEffectiveCost } = require('./ai-utils');
const { evaluateBoard } = require('./board-eval');
const { evaluateAllCards, estimateCounterProbability, estimateReactProbability } = require('./mc-simulator');
const { createDeckTracker } = require('./deck-tracker');
const { planTurn } = require('./combo-sequencer');

// ═══ PROFILES ═══

const PROFILES = {
  // — Dungeon profiles —
  smart_tactical: {
    side: 'dungeon',
    description: 'Smart tactical dungeon. MC-evaluated decisions with deck awareness.',
    goalType: 'combat',
    simCount: 12,
    aggressionBias: 0,
    preferStrike: false,
    preferOffer: false,
    comboAwareness: 0.9,
  },
  smart_aggressive: {
    side: 'dungeon',
    description: 'Smart aggressive dungeon. Pushes damage, races for kills.',
    goalType: 'combat',
    simCount: 12,
    aggressionBias: 0.5,
    preferStrike: true,
    preferOffer: false,
    comboAwareness: 0.7,
  },
  smart_nurturing: {
    side: 'dungeon',
    description: 'Smart nurturing dungeon. Seeks Bond via Trust/Rapport.',
    goalType: 'bond',
    simCount: 12,
    aggressionBias: -0.5,
    preferStrike: false,
    preferOffer: true,
    comboAwareness: 0.5,
  },
  smart_deceptive: {
    side: 'dungeon',
    description: 'Smart deceptive dungeon. Builds Trust then exploits it.',
    goalType: 'combat',
    simCount: 12,
    aggressionBias: 0,
    preferStrike: false,
    preferOffer: true,
    comboAwareness: 0.8,
    betrayalThreshold: 4,
  },
  // — Visitor profiles —
  smart_feral: {
    side: 'visitor',
    description: 'Smart feral visitor. Aggressive combat-focused creature.',
    goalType: 'combat',
    simCount: 12,
    aggressionBias: 0.3,
    preferStrike: true,
    preferOffer: false,
    comboAwareness: 0.6,
  },
  smart_cautious: {
    side: 'visitor',
    description: 'Smart cautious visitor. Defensive, disruption-heavy creature.',
    goalType: 'combat',
    simCount: 12,
    aggressionBias: -0.3,
    preferStrike: false,
    preferOffer: false,
    comboAwareness: 0.8,
  },
  smart_cooperative: {
    side: 'visitor',
    description: 'Smart cooperative visitor. Seeks Bond. Symbiote-like.',
    goalType: 'bond',
    simCount: 12,
    aggressionBias: -0.5,
    preferStrike: false,
    preferOffer: true,
    comboAwareness: 0.5,
  },
};

// ═══ AI FACTORY ═══

function createSmartAI(profileName) {
  const p = PROFILES[profileName];
  if (!p) throw new Error(`Unknown smart profile: ${profileName}. Options: ${Object.keys(PROFILES).join(', ')}`);

  let deckTracker = null;
  const history = {
    turnCount: 0,
    counterLoopCount: 0,
    lastEvalScore: 0,
    lastMode: 'balanced',
  };

  return {
    profile: p,
    history,

    /**
     * Initialize deck tracker. Call once at encounter start with the full deck.
     */
    initDeck(fullDeck) {
      deckTracker = createDeckTracker(fullDeck);
    },

    pickCards(hand, energy, self, opponent, ctx) {
      // Lazy init deck tracker from hand if not already done
      if (!deckTracker) {
        deckTracker = createDeckTracker(hand);
      }
      deckTracker.updateHand(hand);

      const result = pickCardsSmart(hand, energy, self, opponent, ctx, p, deckTracker, history);

      // Record played cards
      for (const d of result) {
        if (d.action === 'play' || d.action === 'energy') {
          deckTracker.recordPlay(d.card);
        }
      }

      history.turnCount++;
      return result;
    },
  };
}

// ═══ CORE DECISION ENGINE ═══

function pickCardsSmart(hand, energy, self, opponent, ctx, profile, tracker, history) {
  const available = [...hand];
  const side = ctx.activeSide || profile.side;
  const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
  const round = ctx.round || 1;

  // — BOARD ASSESSMENT —
  const boardScore = evaluateBoard(self, opponent, side, {
    ...ctx,
    goalType: profile.goalType,
    bondThreshold: ctx.bondThreshold || 6,
  });
  history.lastEvalScore = boardScore;

  // — STRATEGIC MODE —
  let mode = 'balanced';
  if (boardScore > 30) mode = 'conservative';
  else if (boardScore < -30) mode = 'aggressive';
  else if (boardScore < -50) mode = 'desperate';
  if (profile.aggressionBias > 0.3 && mode === 'balanced') mode = 'aggressive';
  if (profile.aggressionBias < -0.3 && mode === 'balanced') mode = 'conservative';
  history.lastMode = mode;

  // — DECK AWARENESS —
  const deckInfo = tracker.getSummary();

  // — MC CARD EVALUATION —
  const actionCards = available.filter(c => c.category !== 'Energy' && c.category !== 'React');
  const mcResults = evaluateAllCards(
    actionCards,
    side, self, opponent, energy, {
      ...ctx,
      goalType: profile.goalType,
      bondThreshold: ctx.bondThreshold || 6,
    },
    profile.simCount
  );

  // — STRATEGIC ADJUSTMENTS (on top of MC evaluation) —
  const adjustedResults = mcResults.map(r => {
    let adjustedDelta = r.delta;
    const card = r.card;

    adjustedDelta = applyOpponentResponseDiscount(card, adjustedDelta, oppSide, ctx);
    adjustedDelta = applyDeckAwareAdjustments(card, adjustedDelta, deckInfo, mode, profile);
    adjustedDelta = applyModeAdjustments(card, adjustedDelta, mode, profile, self, opponent, side, ctx);
    adjustedDelta = applyComboAwareness(card, adjustedDelta, available, profile);

    return { card, delta: adjustedDelta, originalDelta: r.delta };
  });

  // — COOPERATIVE OVERRIDE (bond profiles) —
  // MC evaluation structurally undervalues cooperative play: single-card
  // rollouts can't see multi-turn Trust/Rapport accumulation toward Bond.
  // For bond profiles, apply heuristic cooperative logic on top of MC deltas.
  if (profile.goalType === 'bond') {
    applyCooperativeOverrides(adjustedResults, self, opponent, side, profile);
  }
  // — BUILD SCORE FUNCTION FROM MC RESULTS —
  const mcScoreMap = new Map();
  for (const r of adjustedResults) {
    mcScoreMap.set(r.card, r.delta);
  }

  const minPlayThreshold = mode === 'desperate' ? -5 : mode === 'conservative' ? 2 : 0;
  const scoreFunction = (card) => {
    const delta = mcScoreMap.get(card);
    if (delta === undefined) return 0;
    // Filter out cards below the play threshold
    if (delta < minPlayThreshold) return 0;
    return delta;
  };

  // — HAND OFF TO COMBO SEQUENCER —
  return planTurn(hand, energy, self, opponent, {
    ...ctx,
    scoreFunction,
  }, profile);
}

// ═══ OPPONENT RESPONSE MODELING (1-ply) ═══

function applyOpponentResponseDiscount(card, delta, oppSide, ctx) {
  if (card.category === 'Empower') {
    const counterProb = estimateCounterProbability(oppSide, ctx);
    delta *= (1 - counterProb * 0.7);
  }

  if (card.category === 'Strike' && (card.power || 0) >= 3) {
    const reactProb = estimateReactProbability(oppSide, ctx);
    delta *= (1 - reactProb * 0.15);
  }

  if (card.category === 'Disrupt') {
    const counterProb = estimateCounterProbability(oppSide, ctx);
    delta *= (1 - counterProb * 0.5);
  }

  return delta;
}

// ═══ DECK-AWARE ADJUSTMENTS ═══

function applyDeckAwareAdjustments(card, delta, deckInfo, mode, profile) {
  if (card.category === 'Strike' && !deckInfo.strikesRemaining && profile.goalType === 'combat') {
    delta += 3;
  }

  if (card.category === 'Reshape' && !deckInfo.reshapesRemaining) {
    delta -= 1;
  }

  if (card.category === 'Empower' && !deckInfo.hasStrikesInHand) {
    if (deckInfo.pStrikeNextDraw > 0.5) {
      delta -= 1;
    } else {
      delta -= 4;
    }
  }

  if (deckInfo.handSize <= 3) {
    delta *= 1.2;
  }

  return delta;
}

// ═══ MODE ADJUSTMENTS ═══

function applyModeAdjustments(card, delta, mode, profile, self, opponent, side, ctx) {
  if (mode === 'aggressive' || mode === 'desperate') {
    if (card.category === 'Strike') delta *= 1.3;
    if (card.category === 'Empower') delta *= 1.2;
    if (card.category === 'Reshape' && mode === 'desperate') delta *= 0.3;
    if (card.category === 'Trap') delta *= 0.5;
    if (card.category === 'Offer' && !profile.preferOffer) delta *= 0.3;
  } else if (mode === 'conservative') {
    if (card.category === 'Reshape') delta *= 1.3;
    if (card.category === 'Counter') delta *= 1.2;
    if (card.category === 'Disrupt') delta *= 1.2;
    if (card.category === 'Strike') delta *= 0.9;
  }

  // Lethal check
  const oppReducers = getOpponentReducers(opponent, side);
  const nearDeath = oppReducers.filter(r => r.val > 0 && r.val <= 3);
  if (nearDeath.length > 0) {
    if (card.category === 'Strike' && nearDeath.some(r => r.name === card.target)) {
      delta += 10;
    }
    if (['Empower', 'Trap', 'Offer', 'Reshape'].includes(card.category) && !profile.preferOffer) {
      delta -= 5;
    }
  }

  // Counter: only valuable if opponent has active conditions worth removing
  if (card.category === 'Counter') {
    const oppSide2 = side === 'dungeon' ? 'visitor' : 'dungeon';
    const oppHasEmpower = opponent.conditions.some(c => c.type === 'empower' && c.placedBy === oppSide2);
    const oppHasDisruptOnUs = self.conditions.some(c => c.type === 'disrupt' && c.placedBy === oppSide2);
    if (!oppHasEmpower && !oppHasDisruptOnUs) {
      delta = -10;
    } else {
      delta += oppHasEmpower ? 5 : 3;
    }
  }

  // Deceptive profile: switch to aggression at betrayal threshold
  if (profile.betrayalThreshold) {
    const trust = side === 'dungeon' ? opponent.trust : self.trust;
    if (trust >= profile.betrayalThreshold) {
      if (card.category === 'Strike') delta += 5;
      if (card.category === 'Offer') delta -= 8;
    }
  }

  return delta;
}

// ═══ COMBO AWARENESS ═══

function applyComboAwareness(card, delta, hand, profile) {
  if (Math.random() > profile.comboAwareness) return delta;

  const hasStrike = hand.some(c => c.category === 'Strike');
  const hasEmpower = hand.some(c => c.category === 'Empower');
  const hasTrap = hand.some(c => c.category === 'Trap');
  const hasOffer = hand.some(c => c.category === 'Offer');

  if (card.category === 'Empower' && hasStrike) delta += 2;
  if (card.category === 'Strike' && hasEmpower) delta += 1;

  if (card.category === 'Trap' && card.trapTrigger === 'offer_accepted' && hasOffer) delta += 3;
  if (card.category === 'Offer' && hasTrap) delta += 1;

  return delta;
}

// ═══ COOPERATIVE OVERRIDES ═══

/**
 * For bond-goal profiles, override MC scores to enforce cooperative strategy.
 * MC evaluation can't see multi-turn cooperative payoff (a single Offer yields
 * ~1.25 pts of board eval, but 10 Offers reaching Bond threshold = game win).
 * Apply same cooperative rules as heuristic AI: suppress strikes, boost offers.
 */
function applyCooperativeOverrides(results, self, opponent, side, profile) {
  const rapport = side === 'dungeon' ? (self.rapport || 0) : (opponent.rapport || 0);
  const trust = side === 'dungeon' ? (opponent.trust || 0) : (self.trust || 0);
  const coopInvested = rapport > 2 || trust > 2;

  for (const r of results) {
    const cat = r.card.category;

    // Strike suppression: hard-zero when cooperation is established.
    // Mirrors heuristic AI — prevents betrayal crashes that destroy promoters.
    if (cat === 'Strike' && coopInvested) {
      r.delta = 0;
      continue;
    }

    // Before cooperation established, still deprioritize strikes for bond goal
    if (cat === 'Strike') {
      r.delta *= 0.3;
    }

    // Boost Offers — MC sees ~1 pt of board improvement per Offer, but
    // cumulative effect over 8-12 rounds is what reaches Bond threshold
    if (cat === 'Offer') {
      r.delta = Math.max(r.delta, 5) + 8;
    }

    // Boost Tests — prisoner's dilemma payoff is high but requires
    // multi-turn trust accumulation that MC can't model
    if (cat === 'Test') {
      r.delta = Math.max(r.delta, 4) + 6;
    }

    // Reshape keeps you alive long enough to reach threshold
    if (cat === 'Reshape') {
      r.delta = Math.max(r.delta, 3) + 2;
    }

    // Counter/Disrupt: keep MC values — defensive impact is immediate
    // and MC evaluates it correctly
  }
}

// ═══ HELPERS ═══

function getOpponentReducers(opponent, mySide) {
  if (mySide === 'dungeon') {
    const sv = opponent.startingValues || { vitality: 20, resolve: 16, nerve: 16 };
    return [
      { name: 'vitality', val: opponent.vitality, start: sv.vitality },
      { name: 'resolve', val: opponent.resolve, start: sv.resolve },
      { name: 'nerve', val: opponent.nerve, start: sv.nerve },
    ];
  } else {
    const sv = opponent.startingValues || { structure: 16, veil: 14, presence: 12 };
    return [
      { name: 'structure', val: opponent.structure, start: sv.structure },
      { name: 'veil', val: opponent.veil, start: sv.veil },
      { name: 'presence', val: opponent.presence, start: sv.presence },
    ];
  }
}

module.exports = { createSmartAI, PROFILES };