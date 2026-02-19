/**
 * SHATTERED DUNGEON — Smart AI v1.0
 * 
 * Unified AI module using:
 * - Board evaluator for position assessment
 * - Monte Carlo simulator for card evaluation (replaces heuristic scoring)
 * - Deck tracker for draw probability and resource planning
 * - 1-ply lookahead with opponent response modeling
 * 
 * Supports both dungeon and visitor sides via configuration.
 * Matches the pickCards() interface of existing AI modules.
 */
const { getEffectiveCost } = require('./ai-utils');
const { evaluateBoard } = require('./board-eval');
const { evaluateAllCards, estimateCounterProbability, estimateReactProbability } = require('./mc-simulator');
const { createDeckTracker } = require('./deck-tracker');

// ═══ PROFILES ═══

const PROFILES = {
  // — Dungeon profiles —
  smart_tactical: {
    side: 'dungeon',
    description: 'Smart tactical dungeon. MC-evaluated decisions with deck awareness.',
    goalType: 'combat',
    simCount: 12,
    aggressionBias: 0,       // -1 = defensive, 0 = balanced, +1 = aggressive
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
    preferOffer: true,    // Uses offers as bait for traps
    comboAwareness: 0.8,
    betrayalThreshold: 4, // Switch to aggression at this trust level
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
        // We don't have the full deck here, so create a minimal tracker
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
  const decisions = [];
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
  if (boardScore > 30) mode = 'conservative';      // We're winning — protect lead
  else if (boardScore < -30) mode = 'aggressive';   // We're losing — push hard
  else if (boardScore < -50) mode = 'desperate';     // Critical — all-in
  // Apply profile aggression bias
  if (profile.aggressionBias > 0.3 && mode === 'balanced') mode = 'aggressive';
  if (profile.aggressionBias < -0.3 && mode === 'balanced') mode = 'conservative';
  history.lastMode = mode;

  // — DECK AWARENESS —
  const deckInfo = tracker.getSummary();

  // — ENERGY DECISION —
  const energyCards = available.filter(c => c.category === 'Energy');
  const actionCards = available.filter(c => c.category !== 'Energy' && c.category !== 'React');

  let shouldPlayEnergy = false;
  if (energyCards.length > 0) {
    const bestActionCost = actionCards.length > 0 ? Math.max(...actionCards.map(c => c.cost || 0)) : 0;
    // Smart energy: invest early, or when needed for expensive cards
    if (round <= 2 && energy.base < 4) shouldPlayEnergy = true;
    else if (energy.available < bestActionCost && bestActionCost > 0) shouldPlayEnergy = true;
    else if (energy.available < 2 && actionCards.some(c => c.category === 'Strike')) shouldPlayEnergy = true;
    // Don't invest energy if we're desperate and need to play cards NOW
    if (mode === 'desperate' && energy.available >= 2) shouldPlayEnergy = false;
  }

  if (shouldPlayEnergy) {
    const ec = energyCards[0];
    decisions.push({ card: ec, action: 'energy' });
    available.splice(available.indexOf(ec), 1);
    energy = { ...energy, available: energy.available }; // Don't mutate
  }

  // — MC CARD EVALUATION —
  const mcResults = evaluateAllCards(
    available.filter(c => c.category !== 'Energy' && c.category !== 'React'),
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

    // Counter opponent response modeling (1-ply lookahead)
    adjustedDelta = applyOpponentResponseDiscount(card, adjustedDelta, oppSide, ctx);

    // Deck-aware adjustments
    adjustedDelta = applyDeckAwareAdjustments(card, adjustedDelta, deckInfo, mode, profile);

    // Mode adjustments
    adjustedDelta = applyModeAdjustments(card, adjustedDelta, mode, profile, self, opponent, side, ctx);

    // Combo ordering awareness
    adjustedDelta = applyComboAwareness(card, adjustedDelta, available, profile);

    return { card, delta: adjustedDelta, originalDelta: r.delta };
  });

  // Sort by adjusted delta
  adjustedResults.sort((a, b) => b.delta - a.delta);

  // — PLAY ORDERING —
  const ordered = applyPlayOrdering(adjustedResults, mode, profile, self, opponent, oppSide);

  // — BUILD DECISION LIST (respecting energy budget) —
  let budget = energy.available - decisions.reduce((s, d) => s + (d.card.cost || 0), 0);
  const minPlayThreshold = mode === 'desperate' ? -5 : mode === 'conservative' ? 2 : 0;

  for (const r of ordered) {
    const cost = r.card.cost || 0;
    if (cost <= budget && r.delta >= minPlayThreshold) {
      decisions.push({ card: r.card, action: 'play' });
      budget -= cost;
    }
  }

  return decisions;
}

// ═══ OPPONENT RESPONSE MODELING (1-ply) ═══

function applyOpponentResponseDiscount(card, delta, oppSide, ctx) {
  // If we play Empower, opponent might Counter → discount empower value
  if (card.category === 'Empower') {
    const counterProb = estimateCounterProbability(oppSide, ctx);
    // If countered, our empower is wasted. Discount by counter probability.
    delta *= (1 - counterProb * 0.7);
  }

  // If we play Strike, opponent might React → already factored in MC sim
  // But add extra caution for high-damage strikes (opponent more likely to React)
  if (card.category === 'Strike' && (card.power || 0) >= 3) {
    const reactProb = estimateReactProbability(oppSide, ctx);
    delta *= (1 - reactProb * 0.15); // Small additional discount
  }

  // Disrupt might get Countered next turn
  if (card.category === 'Disrupt') {
    const counterProb = estimateCounterProbability(oppSide, ctx);
    delta *= (1 - counterProb * 0.5);
  }

  return delta;
}

// ═══ DECK-AWARE ADJUSTMENTS ═══

function applyDeckAwareAdjustments(card, delta, deckInfo, mode, profile) {
  // If this is our last Strike and we're in combat mode, value it highly
  if (card.category === 'Strike' && !deckInfo.strikesRemaining && profile.goalType === 'combat') {
    delta += 3; // Scarcity premium
  }

  // If this is our last React, don't play it (it should stay in hand for defense)
  // React cards aren't in the MC eval (filtered out), so this is just a note.

  // If no more Reshapes available after this one, be more conservative with it
  if (card.category === 'Reshape' && !deckInfo.reshapesRemaining) {
    // Only play if we're actually damaged enough to benefit
    delta -= 1; // Small penalty for using our last heal
  }

  // If no Strikes in hand but high probability of drawing one, hold off on Empower
  if (card.category === 'Empower' && !deckInfo.hasStrikesInHand) {
    if (deckInfo.pStrikeNextDraw > 0.5) {
      delta -= 1; // Empower without Strike in hand — will we draw one?
    } else {
      delta -= 4; // Very unlikely to draw a Strike — Empower is wasted
    }
  }

  // Card economy: if we have very few cards left, each play matters more
  if (deckInfo.handSize <= 3) {
    delta *= 1.2; // Each card is more precious
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

  // Lethal check: if opponent has a reducer ≤ 3, prioritize finishing
  const oppReducers = getOpponentReducers(opponent, side);
  const nearDeath = oppReducers.filter(r => r.val > 0 && r.val <= 3);
  if (nearDeath.length > 0) {
    if (card.category === 'Strike' && nearDeath.some(r => r.name === card.target)) {
      delta += 10; // Kill shot priority
    }
    if (['Empower', 'Trap', 'Offer', 'Reshape'].includes(card.category) && !profile.preferOffer) {
      delta -= 5; // Don't build when you can finish
    }
  }

  // Counter: only valuable if opponent has active conditions worth removing
  if (card.category === 'Counter') {
    const oppSide2 = side === 'dungeon' ? 'visitor' : 'dungeon';
    const oppHasEmpower = opponent.conditions.some(c => c.type === 'empower' && c.placedBy === oppSide2);
    const oppHasDisruptOnUs = self.conditions.some(c => c.type === 'disrupt' && c.placedBy === oppSide2);
    if (!oppHasEmpower && !oppHasDisruptOnUs) {
      delta = -10; // Nothing to counter — don't play
    } else {
      delta += oppHasEmpower ? 5 : 3; // Counter is very valuable when there's something to remove
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

  // Empower + Strike combo
  if (card.category === 'Empower' && hasStrike) delta += 2;
  if (card.category === 'Strike' && hasEmpower) delta += 1;

  // Trap + Offer combo (deceptive play)
  if (card.category === 'Trap' && card.trapTrigger === 'offer_accepted' && hasOffer) delta += 3;
  if (card.category === 'Offer' && hasTrap) delta += 1;

  return delta;
}

// ═══ PLAY ORDERING ═══

function applyPlayOrdering(results, mode, profile, self, opponent, oppSide) {
  const ordered = [...results];

  // Counter first when urgent (opponent has active buff)
  const urgentCounter = ordered.findIndex(r =>
    r.card.category === 'Counter' && r.delta > 3 &&
    (opponent.conditions.some(c => c.type === 'empower' && c.placedBy === oppSide) ||
     self.conditions.some(c => c.type === 'disrupt' && c.placedBy === oppSide))
  );
  if (urgentCounter > 0) {
    const [counter] = ordered.splice(urgentCounter, 1);
    ordered.unshift(counter);
  }

  // Trap before Offer (set trap, then bait)
  const trapIdx = ordered.findIndex(r => r.card.category === 'Trap' && r.card.trapTrigger === 'offer_accepted');
  const offerIdx = ordered.findIndex(r => r.card.category === 'Offer');
  if (trapIdx >= 0 && offerIdx >= 0 && trapIdx > offerIdx) {
    const [trap] = ordered.splice(trapIdx, 1);
    ordered.splice(offerIdx, 0, trap);
  }

  // Empower before Strike (set up before hitting)
  if (mode !== 'desperate') {
    const empIdx = ordered.findIndex(r => r.card.category === 'Empower');
    const strikeIdx = ordered.findIndex(r => r.card.category === 'Strike');
    if (empIdx >= 0 && strikeIdx >= 0 && empIdx > strikeIdx) {
      const [emp] = ordered.splice(empIdx, 1);
      ordered.splice(strikeIdx, 0, emp);
    }
  }

  return ordered;
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