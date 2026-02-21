/**
 * SHATTERED DUNGEON — Bond v3.0 AI Scoring Module
 * ai/bond-ai-scoring.js
 * 
 * Drop-in module for trust-tier-aware card scoring.
 * Handles Nurturing and Deceptive strategy phases.
 * 
 * USAGE IN dungeon-ai.js:
 * 
 *   const { applyBondV3Scoring } = require('./bond-ai-scoring');
 * 
 *   // Inside scoreFunction, just before `return score;`:
 *   if (p.bondStrategy) {
 *     score = applyBondV3Scoring(card, score, self, opponent, ctx, p, {
 *       hasStrike, bestStrikePower, round, lethalMode
 *     });
 *   }
 */

const Bond = require('../engine/bond');

// ═══ MAIN ENTRY POINT ═══

function applyBondV3Scoring(card, baseScore, self, opponent, ctx, profile, extras) {
  const trust = opponent.trust || 0;
  const tier = Bond.getTrustTier(trust);
  const strategy = profile.bondStrategy;
  const round = extras.round || 1;

  // Deceptive: check betrayal trigger
  // Trust-based OR timeout-based (patience runs out)
  if (strategy === 'deceptive') {
    const trustReached = trust >= (profile.betrayalThreshold || 8);
    const patienceExpired = (extras.round || 1) >= 10 && trust >= 3;
    if (trustReached || patienceExpired) {
      return scoreBetrayalPhase(card, self, opponent, trust, extras);
    }
  }

  // Nurturing frustration: if trust isn't advancing despite offers,
  // the dungeon stops being passive. "I offered peace and you hit me."
  if (strategy === 'nurturing' && round >= 5) {
    const trustStalled = trust < 3;          // Barely any trust after 5+ rounds
    const dungeonHurt = self.startingValues && (
      Math.min(
        self.structure / (self.startingValues.structure || 16),
        self.veil / (self.startingValues.veil || 14),
        self.presence / (self.startingValues.presence || 12)
      ) < 0.5
    );
    if (trustStalled && dungeonHurt) {
      // Frustrated — revert to base combat scoring with slight cooperative memory
      return scoreFrustratedPhase(card, baseScore, self, opponent, trust, extras);
    }
  }

  // Nurturing + Deceptive pre-betrayal: trust-building phases
  return scoreTrustBuildingPhase(card, baseScore, self, opponent, ctx, tier, trust, round, strategy);
}

// ═══ TRUST-BUILDING PHASE (Nurturing + Deceptive pre-betrayal) ═══

function scoreTrustBuildingPhase(card, baseScore, self, opponent, ctx, tier, trust, round, strategy) {
  switch (card.category) {

    case 'Strike':
      // Hard suppress once ANY trust exists — each Strike costs -1 to -2 trust
      // and erases potentially many rounds of cooperative investment.
      if (trust > 0) return -20;
      // Trust 0: very mild — prefer Offers but don't completely refuse
      // (we might need some defense if visitor is aggressive)
      return Math.min(baseScore * 0.15, 1.5);

    case 'Offer':
      return scoreOffer(card, tier, trust, strategy);

    case 'Test':
      return scoreTest(tier, trust);

    case 'Reshape':
      return scoreReshape(baseScore, self, round);

    case 'Empower':
      // No Strikes to empower during trust-building
      return trust > 0 ? -5 : Math.min(baseScore, 2);

    case 'Disrupt':
      // Low priority — purely defensive utility
      return Math.min(baseScore, 2);

    case 'Counter':
      // Unchanged — removing enemy buffs/debuffs is always valid
      return baseScore;

    case 'Trap':
      if (strategy === 'nurturing') return -5;
      // Deceptive: traps are suspicious alongside Offers
      return trust > 3 ? -3 : 1;

    case 'Energy':
      // Slightly boost energy — need to sustain through long cooperative game
      return baseScore + 1;

    default:
      return baseScore;
  }
}

function scoreOffer(card, tier, trust, strategy) {
  // Covenant: Bond finisher — only play at Tier 3
  if (card.subtype === 'Covenant') {
    return tier >= 3 ? 40 : -10;
  }

  // Standard/Transactional Offers
  let score = 10; // Strong base — primary action

  // Tier scaling: higher trust = higher acceptance = more value
  switch (tier) {
    case 0: score += 2; break;   // Transparent: low acceptance (~30%), builds trust on refusal too
    case 1: score += 5; break;   // Veiled: hidden costs, higher acceptance (~50-60%)
    case 2: score += 8; break;   // Entrusted: auto-accept Binding Offers
    case 3: score += 6; break;   // Covenant-eligible — prefer Covenant over standard Offers
  }

  // Deceptive: prefer Offers that set up vulnerability for betrayal
  if (strategy === 'deceptive' && tier >= 1) {
    const costType = card.offer?.cost?.type;
    if (costType === 'exposure') score += 4;  // +2 damage on next Strike = betrayal setup
    if (costType === 'binding') score += 3;   // Persistent drain weakens visitor
  }

  return score;
}

function scoreTest(tier, trust) {
  let score = 8;
  // Tests give +2 trust/rapport on cooperate — very efficient
  // Most valuable mid-game when cooperation chance is decent
  if (tier === 1) score += 3;
  if (tier === 2) score += 2;
  // At trust 0, cooperation chance starts low (~40%) — still worth it
  if (trust === 0) score -= 2;
  return score;
}

function scoreReshape(baseScore, self, round) {
  let score = baseScore + 3;
  // Survival scales up over time — we need to live long enough for Covenant
  if (round >= 6) score += 2;
  if (round >= 10) score += 3;
  // Emergency healing if any reducer is critical
  const selfReducers = [
    { val: self.structure, start: self.startingValues?.structure || 16 },
    { val: self.veil, start: self.startingValues?.veil || 14 },
    { val: self.presence, start: self.startingValues?.presence || 12 },
  ];
  const lowestRatio = Math.min(...selfReducers.map(r => r.val / r.start));
  if (lowestRatio < 0.4) score += 5;
  if (lowestRatio < 0.2) score += 5; // Really urgent
  return score;
}

// ═══ BETRAYAL PHASE (Deceptive only) ═══

function scoreBetrayalPhase(card, self, opponent, trust, extras) {
  switch (card.category) {
    case 'Strike': {
      // MAXIMUM PRIORITY: the betrayal Strike converts all trust to damage
      let score = 30 + (card.power || 0) * 5;
      // Target the weakest visitor reducer for maximum kill chance
      const oppReducers = [
        { name: 'vitality', val: opponent.vitality, start: opponent.startingValues?.vitality || 20 },
        { name: 'resolve', val: opponent.resolve, start: opponent.startingValues?.resolve || 16 },
        { name: 'nerve', val: opponent.nerve, start: opponent.startingValues?.nerve || 16 },
      ].sort((a, b) => a.val - b.val);
      if (card.target === oppReducers[0].name) score += 10;
      // Bonus for keywords that synergize with betrayal damage
      const kws = card.keywords || [];
      if (kws.includes('Overwhelm')) score += 5; // Spill damage after trust conversion
      if (kws.includes('Drain')) score += 3;     // Self-heal from the kill
      return score;
    }

    case 'Empower':
      // Empower before betrayal Strike for maximum damage
      return extras.hasStrike ? 20 : -5;

    case 'Offer':
    case 'Test':
      return -20; // No more cooperation — we're going for the kill

    case 'Reshape':
      return 2; // Low priority but not zero — might survive counterattack

    case 'Trap':
      return 5; // Can still help with combat

    case 'Counter':
    case 'Disrupt':
      return 0; // Standard defensive — don't prioritize over Strikes

    default:
      return 0;
  }
}

// ═══ FRUSTRATED PHASE (Nurturing only) ═══

/**
 * The dungeon offered peace, the visitor kept attacking, trust stalled.
 * The dungeon gets angry — not full betrayal (no trust conversion), 
 * just "fine, I'll defend myself."
 * 
 * Scoring: standard combat weights, not the all-out betrayal of deceptive.
 * Reshapes still high (survival), Strikes moderate (fighting back, not 
 * going for the kill), Offers suppressed (done trying).
 */
function scoreFrustratedPhase(card, baseScore, self, opponent, trust, extras) {
  switch (card.category) {
    case 'Strike':
      // Fight back — not maximum aggression, but real damage
      return baseScore * 1.5 + 5;

    case 'Empower':
      return extras.hasStrike ? 8 : 1;

    case 'Reshape':
      // Still prioritize survival — frustrated, not suicidal
      return baseScore + 5;

    case 'Offer':
    case 'Test':
      // Done offering for now. Slight chance if trust somehow recovers
      return trust >= 3 ? baseScore * 0.5 : -5;

    case 'Counter':
    case 'Disrupt':
      return baseScore + 2;

    case 'Trap':
      return baseScore + 1;

    default:
      return baseScore;
  }
}


// ═══ RESTRAINT CHECK (replaces combo-sequencer logic) ═══

/**
 * Enhanced restraint check for Bond v3.0 profiles.
 * Export this and use it to replace the isCooperative check in
 * addRestraintIfNeeded() in ai/combo-sequencer.js.
 * 
 * Bond profiles should restrain Strikes even at trust 0 because:
 * - Restraint gives +1 rapport (dungeon) or +1 trust (visitor)
 * - Playing Strikes at trust 0 prevents trust from ever starting
 * - The whole strategy depends on not attacking
 */
function shouldRestrain(profile, self, opponent) {
  if (profile.bondStrategy === 'nurturing') return true;
  if (profile.bondStrategy === 'deceptive') {
    const trust = opponent.trust || 0;
    return trust < (profile.betrayalThreshold || 6);
  }
  // Standard cooperative check for non-bond profiles
  return (self.rapport || 0) > 2 || (opponent.trust || 0) > 2;
}


// ═══ UPDATED PROFILE DEFINITIONS ═══

/**
 * Drop these into the PROFILES object in dungeon-ai.js,
 * replacing the existing nurturing and deceptive entries.
 */
const PROFILES_PATCH = {
  nurturing: {
    description: 'Build Trust toward Bond. Minimize harm. Bond v3.0 trust-tier strategy.',
    baseWeights: { Strike: 0.1, Empower: 0.5, Disrupt: 0.3, Counter: 1, Trap: 0, Offer: 5, Reshape: 3, React: 1, Test: 4 },
    scoreThreshold: 1, preferredTargets: ['trust', 'rapport'],
    energyEagerness: 0.5, comboAwareness: 0.5,
    bondStrategy: 'nurturing',
  },
  deceptive: {
    description: 'Build Trust then betray. Mirrors Nurturing until threshold. Bond v3.0.',
    baseWeights: { Strike: 0.1, Empower: 0.5, Disrupt: 0.3, Counter: 1, Trap: 0, Offer: 5, Reshape: 3, React: 1, Test: 4 },
    scoreThreshold: 1, preferredTargets: ['trust', 'rapport'],
    energyEagerness: 0.5, comboAwareness: 0.8,
    bondStrategy: 'deceptive',
    betrayalThreshold: 6,
  },
};

module.exports = {
  applyBondV3Scoring,
  shouldRestrain,
  PROFILES_PATCH,
};