/**
 * PROFILE BUILDER — Compute AI profiles from deck composition
 *
 * Instead of hardcoded profiles that play the same regardless of deck,
 * this module analyzes what cards are actually available and adjusts
 * AI behavior to match deck capabilities.
 *
 * The profile is a blend of:
 *   - Designer intent (base profile name: aggressive, nurturing, etc.)
 *   - Deck capability (what the cards can actually do)
 *
 * Usage:
 *   const { buildDungeonProfile, buildVisitorProfile } = require('./profile-builder');
 *
 *   // Dungeon: 3 encounter decks + intent
 *   const profile = buildDungeonProfile(['root-hollow', 'whispering-gallery', 'veil-breach'], 'tactical');
 *   const ai = createDungeonAI(profile);  // pass object, not string
 *
 *   // Visitor party: 4 member decks
 *   const vProfile = buildVisitorProfile(['knight', 'battlemage', 'cleric', 'rogue']);
 *   const vai = createVisitorAI(vProfile);
 *
 *   // Creature: single deck, mostly uses stored aiProfile
 *   const cProfile = buildCreatureProfile('thornback-boar');
 */

const registry = require('./registry');

// ═══════════════════════════════════════════════════════════════
// DECK ANALYSIS
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze a deck and extract AI-relevant statistics.
 * Works for any deck: dungeon encounter, party, creature.
 *
 * @param {object[]} deck - Array of card objects
 * @returns {object} Deck analysis
 */
function analyzeDeck(deck) {
  const categoryCounts = {};
  const targetCounts = {};    // targets from offensive cards (Strike, Disrupt, Trap)
  const allTargetCounts = {}; // targets from ALL cards with a target field
  const typeCounts = {};      // Physical, Environmental, Social, Mystical
  const keywordCounts = {};
  let totalCost = 0;
  let totalPower = 0;
  let offensiveCards = 0;

  for (const card of deck) {
    // Category distribution
    const cat = card.category || 'Unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Type distribution
    if (card.type) {
      typeCounts[card.type] = (typeCounts[card.type] || 0) + 1;
    }

    // Target distribution — offensive cards that pressure specific resources
    if (card.target) {
      allTargetCounts[card.target] = (allTargetCounts[card.target] || 0) + 1;
      if (['Strike', 'Disrupt', 'Trap'].includes(cat)) {
        targetCounts[card.target] = (targetCounts[card.target] || 0) + 1;
        offensiveCards++;
      }
    }

    // Keywords
    if (card.keywords) {
      for (const kw of card.keywords) {
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
      }
    }

    totalCost += card.cost || 0;
    totalPower += card.power || 0;
  }

  return {
    categoryCounts,
    targetCounts,
    allTargetCounts,
    typeCounts,
    keywordCounts,
    avgCost: deck.length > 0 ? totalCost / deck.length : 0,
    avgPower: offensiveCards > 0 ? totalPower / offensiveCards : 0,
    cardCount: deck.length,
    offensiveCards,
  };
}

// ═══════════════════════════════════════════════════════════════
// DUNGEON PROFILE BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Base dungeon profiles — designer intent.
 * These define the STRATEGY. Deck analysis adjusts the TACTICS.
 *
 * Kept here (not imported from dungeon-ai.js) to avoid coupling.
 * Must stay in sync with dungeon-ai.js PROFILES.
 */
const DUNGEON_BASE_PROFILES = {
  aggressive: {
    description: 'Maximize damage to reducers. Kill-focused.',
    baseWeights: { Strike: 3, Empower: 2, Disrupt: 1.5, Counter: 1.5, Trap: 1.5, Offer: 0, Reshape: 0.5, React: 1 },
    scoreThreshold: 2,
    preferredTargets: ['vitality', 'nerve'],
    energyEagerness: 0.6,
    comboAwareness: 0.7,
    // Member targeting: kill the weakest
    targetingIntent: 'kill_weakest',
  },
  nurturing: {
    description: 'Build Trust toward Bond. Minimize harm. Bond v3.0 trust-tier strategy.',
    baseWeights: { Strike: 0.1, Empower: 0.5, Disrupt: 0.3, Counter: 1, Trap: 0, Offer: 5, Reshape: 3, React: 1, Test: 4 },
    scoreThreshold: 1,
    preferredTargets: ['trust', 'rapport'],
    energyEagerness: 0.5,
    comboAwareness: 0.5,
    bondStrategy: 'nurturing',
    // Member targeting: protect the weakest (avoid kills)
    targetingIntent: 'protect_weakest',
  },
  tactical: {
    description: 'Balanced play. Reads board state. Pivots based on win probability.',
    baseWeights: { Strike: 2, Empower: 1.5, Disrupt: 2, Counter: 2.5, Trap: 2, Offer: 1, Reshape: 2, React: 1 },
    scoreThreshold: 2,
    preferredTargets: null, // tactical lets deck analysis decide
    energyEagerness: 0.7,
    comboAwareness: 0.9,
    // Member targeting: highest strategic value
    targetingIntent: 'highest_value',
  },
  deceptive: {
    description: 'Build Trust then betray. Mirrors Nurturing until threshold. Bond v3.0.',
    baseWeights: { Strike: 0.1, Empower: 0.5, Disrupt: 0.3, Counter: 1, Trap: 0, Offer: 5, Reshape: 3, React: 1, Test: 4 },
    scoreThreshold: 1,
    preferredTargets: ['trust', 'rapport'],
    energyEagerness: 0.5,
    comboAwareness: 0.8,
    bondStrategy: 'deceptive',
    betrayalThreshold: 6,
    // Member targeting: unpredictable (weighted random)
    targetingIntent: 'unpredictable',
  },
};

/**
 * Build a dungeon AI profile from encounter decks + base profile intent.
 *
 * @param {string[]} encounterKeys - 3 encounter keys making up the dungeon
 * @param {string} baseProfileName - Designer intent: 'aggressive', 'tactical', etc.
 * @returns {object} Complete profile object consumable by createDungeonAI()
 */
function buildDungeonProfile(encounterKeys, baseProfileName) {
  const base = DUNGEON_BASE_PROFILES[baseProfileName];
  if (!base) {
    throw new Error(`Unknown base profile: "${baseProfileName}". Valid: ${Object.keys(DUNGEON_BASE_PROFILES).join(', ')}`);
  }

  // Analyze each encounter's deck
  const perEncounter = encounterKeys.map(key => {
    const enc = registry.getEncounter(key);
    return { key, analysis: analyzeDeck(enc.deck), autoEffects: enc.autoEffects || [] };
  });

  // ── Merge deck analyses across all 3 encounters ──
  const merged = mergeAnalyses(perEncounter.map(e => e.analysis));

  // ── Compute preferred targets from deck reality ──
  const isBondProfile = base.bondStrategy === 'nurturing' || base.bondStrategy === 'deceptive';
  let computedTargets;

  if (isBondProfile) {
    // Bond profiles keep intent-driven targets (trust/rapport)
    // But store combat targets for post-betrayal (deceptive) or emergency
    computedTargets = base.preferredTargets;
  } else if (base.preferredTargets === null) {
    // Tactical: fully deck-driven targeting
    computedTargets = computePreferredTargets(merged.targetCounts);
  } else {
    // Aggressive: blend intent with reality
    // If intent says 'vitality' but deck has zero vitality Strikes, adjust
    computedTargets = blendTargets(base.preferredTargets, merged.targetCounts);
  }

  // ── Adjust category weights based on deck composition ──
  const adjustedWeights = adjustWeights(base.baseWeights, merged.categoryCounts, merged.cardCount);

  // ── Compute energy eagerness from avg cost ──
  // High avg cost → more eager to invest in energy (need the budget)
  // Low avg cost → less eager (cheap cards don't need big pools)
  const costFactor = merged.avgCost / 2; // normalize: 2 is "average" cost
  const adjustedEagerness = clamp(base.energyEagerness * (0.7 + 0.3 * costFactor), 0.3, 0.95);

  // ── Compute combo awareness from Empower+Strike presence ──
  const hasEmpowers = (merged.categoryCounts.Empower || 0) > 0;
  const hasStrikes = (merged.categoryCounts.Strike || 0) > 0;
  const hasTrapOfferCombos = (merged.categoryCounts.Trap || 0) > 0 && (merged.categoryCounts.Offer || 0) > 0;
  let adjustedCombo = base.comboAwareness;
  if (!hasEmpowers || !hasStrikes) adjustedCombo *= 0.5;  // no combo material
  if (hasTrapOfferCombos) adjustedCombo = Math.max(adjustedCombo, 0.7); // trap+offer needs sequencing

  // ── Auto-effect awareness ──
  // Track which resources auto-effects drain — the AI shouldn't pile on
  const autoDrainTargets = [];
  for (const enc of perEncounter) {
    for (const ae of enc.autoEffects) {
      if (ae.target === 'visitor' && ae.resource) {
        autoDrainTargets.push(ae.resource);
      }
    }
  }

  // ── Combat targets for deceptive post-betrayal ──
  const combatTargets = isBondProfile
    ? computePreferredTargets(merged.targetCounts)
    : computedTargets;

  // ── Targeting weights for selectMemberTarget ──
  const targetingWeights = computeTargetingWeights(base.targetingIntent);

  return {
    // Core AI fields (same shape as PROFILES in dungeon-ai.js)
    description: `${base.description} [${encounterKeys.join('+')}]`,
    baseWeights: adjustedWeights,
    scoreThreshold: base.scoreThreshold,
    preferredTargets: computedTargets,
    energyEagerness: adjustedEagerness,
    comboAwareness: clamp(adjustedCombo, 0.3, 0.95),

    // Bond fields (pass through from base)
    bondStrategy: base.bondStrategy || null,
    betrayalThreshold: base.betrayalThreshold || null,

    // New: deck-inferred fields
    deckProfile: {
      categoryCounts: merged.categoryCounts,
      targetCounts: merged.targetCounts,
      typeCounts: merged.typeCounts,
      avgCost: merged.avgCost,
      avgPower: merged.avgPower,
      autoDrainTargets,
      combatTargets,      // for deceptive: what to target after betrayal
    },

    // New: member targeting weights (replaces switch on profileName)
    targetingWeights,
    targetingIntent: base.targetingIntent,

    // Metadata
    _baseName: baseProfileName,
    _encounters: encounterKeys,
    _inferred: true,
  };
}


// ═══════════════════════════════════════════════════════════════
// VISITOR PROFILE BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Base visitor profiles — designer intent.
 */
const VISITOR_BASE_PROFILES = {
  feral_aggressive: {
    description: 'Aggressive creature. Fights dungeon directly.',
    baseWeights: { Strike: 3, Empower: 2, Disrupt: 2, Counter: 1, Trap: 0, Offer: 0, Reshape: 0, React: 1 },
    scoreThreshold: 2,
    preferredTargets: ['structure', 'presence'],
    energyEagerness: 0.8,
    comboAwareness: 0.5,
  },
  cautious_explorer: {
    description: 'Cautious creature. Prefers defense and disruption.',
    baseWeights: { Strike: 1.5, Empower: 1, Disrupt: 2.5, Counter: 2, Trap: 1, Offer: 1, Reshape: 0, React: 1 },
    scoreThreshold: 1,
    preferredTargets: ['veil', 'presence'],
    energyEagerness: 0.6,
    comboAwareness: 0.7,
  },
  cooperative: {
    description: 'Cooperative creature. Seeks Bond.',
    baseWeights: { Strike: 0.5, Empower: 1, Disrupt: 0.5, Counter: 1, Trap: 0, Offer: 3, Reshape: 0, React: 1, Test: 2.5 },
    scoreThreshold: 1,
    preferredTargets: ['trust'],
    energyEagerness: 0.5,
    comboAwareness: 0.5,
  },
  party_balanced: {
    description: 'Balanced party of adventurers. Survive-focused with Bond secondary.',
    baseWeights: { Strike: 2.5, Empower: 2.0, Disrupt: 1.8, Counter: 1.5, React: 1.5, Trap: 1.5, Offer: 0.8, Test: 0.8, Reshape: 2.0, Energy: 2.0 },
    scoreThreshold: 1,
    preferredTargets: ['structure', 'veil', 'presence'],
    energyEagerness: 0.7,
    comboAwareness: 0.8,
  },
};

/**
 * Build a visitor AI profile for a party composition.
 *
 * @param {string[]} memberKeys - 4 member keys
 * @param {string} [baseProfileName='party_balanced'] - Base intent
 * @returns {object} Complete profile object consumable by createVisitorAI()
 */
function buildVisitorProfile(memberKeys, baseProfileName = 'party_balanced') {
  const base = VISITOR_BASE_PROFILES[baseProfileName];
  if (!base) {
    throw new Error(`Unknown visitor base profile: "${baseProfileName}"`);
  }

  // Build the combined party deck and analyze it
  const allCards = [];
  for (const key of memberKeys) {
    const memberDeck = registry.getMemberDeck(key);
    allCards.push(...memberDeck);
  }
  const merged = analyzeDeck(allCards);

  // Adjust targets based on what the party deck can hit
  const computedTargets = base.preferredTargets === null
    ? computePreferredTargets(merged.targetCounts)
    : blendTargets(base.preferredTargets, merged.targetCounts);

  const adjustedWeights = adjustWeights(base.baseWeights, merged.categoryCounts, merged.cardCount);

  // Cost-based eagerness adjustment
  const costFactor = merged.avgCost / 2;
  const adjustedEagerness = clamp(base.energyEagerness * (0.7 + 0.3 * costFactor), 0.3, 0.95);

  // Combo awareness
  const hasEmpowers = (merged.categoryCounts.Empower || 0) > 0;
  const hasStrikes = (merged.categoryCounts.Strike || 0) > 0;
  let adjustedCombo = base.comboAwareness;
  if (!hasEmpowers || !hasStrikes) adjustedCombo *= 0.5;

  return {
    description: `${base.description} [${memberKeys.join('+')}]`,
    baseWeights: adjustedWeights,
    scoreThreshold: base.scoreThreshold,
    preferredTargets: computedTargets,
    energyEagerness: adjustedEagerness,
    comboAwareness: clamp(adjustedCombo, 0.3, 0.95),

    deckProfile: {
      categoryCounts: merged.categoryCounts,
      targetCounts: merged.targetCounts,
      typeCounts: merged.typeCounts,
      avgCost: merged.avgCost,
      avgPower: merged.avgPower,
    },

    _baseName: baseProfileName,
    _members: memberKeys,
    _inferred: true,
  };
}

/**
 * Build a visitor AI profile for a creature.
 * Creatures have smaller, fixed decks. Light-touch inference.
 *
 * @param {string} creatureKey - e.g. 'thornback-boar'
 * @returns {object} Complete profile object
 */
function buildCreatureProfile(creatureKey) {
  const creature = registry.getCreature(creatureKey);
  const baseProfileName = creature.aiProfile || 'feral_aggressive';
  const base = VISITOR_BASE_PROFILES[baseProfileName];
  if (!base) {
    throw new Error(`Unknown visitor base profile: "${baseProfileName}" for creature "${creatureKey}"`);
  }

  const analysis = analyzeDeck(creature.deck);

  // Light-touch: creatures have small focused decks, so just adjust targets
  const computedTargets = base.preferredTargets === null
    ? computePreferredTargets(analysis.targetCounts)
    : blendTargets(base.preferredTargets, analysis.targetCounts);

  // Creatures keep base weights mostly as-is (decks are small and focused)
  const adjustedWeights = adjustWeights(base.baseWeights, analysis.categoryCounts, analysis.cardCount);

  return {
    ...base,
    baseWeights: adjustedWeights,
    preferredTargets: computedTargets,
    description: `${base.description} [${creatureKey}]`,

    deckProfile: {
      categoryCounts: analysis.categoryCounts,
      targetCounts: analysis.targetCounts,
      avgCost: analysis.avgCost,
      avgPower: analysis.avgPower,
    },

    _baseName: baseProfileName,
    _creature: creatureKey,
    _inferred: true,
  };
}


// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Merge multiple deck analyses into one.
 */
function mergeAnalyses(analyses) {
  const merged = {
    categoryCounts: {},
    targetCounts: {},
    allTargetCounts: {},
    typeCounts: {},
    keywordCounts: {},
    cardCount: 0,
    offensiveCards: 0,
  };

  let totalCost = 0;
  let totalPower = 0;

  for (const a of analyses) {
    for (const [k, v] of Object.entries(a.categoryCounts)) {
      merged.categoryCounts[k] = (merged.categoryCounts[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(a.targetCounts)) {
      merged.targetCounts[k] = (merged.targetCounts[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(a.allTargetCounts || {})) {
      merged.allTargetCounts[k] = (merged.allTargetCounts[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(a.typeCounts || {})) {
      merged.typeCounts[k] = (merged.typeCounts[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(a.keywordCounts || {})) {
      merged.keywordCounts[k] = (merged.keywordCounts[k] || 0) + v;
    }
    totalCost += a.avgCost * a.cardCount;
    totalPower += a.avgPower * a.offensiveCards;
    merged.cardCount += a.cardCount;
    merged.offensiveCards += a.offensiveCards;
  }

  merged.avgCost = merged.cardCount > 0 ? totalCost / merged.cardCount : 0;
  merged.avgPower = merged.offensiveCards > 0 ? totalPower / merged.offensiveCards : 0;

  return merged;
}

/**
 * Compute preferred targets from offensive card target distribution.
 * Returns top 2 most-targeted resources.
 *
 * @param {object} targetCounts - { vitality: 3, resolve: 2, nerve: 1 }
 * @returns {string[]} e.g. ['vitality', 'resolve']
 */
function computePreferredTargets(targetCounts) {
  const sorted = Object.entries(targetCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  return sorted.length > 0 ? sorted.slice(0, 2) : null;
}

/**
 * Blend designer-intended targets with deck reality.
 * If the deck can't support a target, swap it for what the deck actually has.
 *
 * @param {string[]} intentTargets - Designer's preferred targets
 * @param {object} targetCounts - What the deck actually hits
 * @returns {string[]}
 */
function blendTargets(intentTargets, targetCounts) {
  if (!intentTargets || intentTargets.length === 0) {
    return computePreferredTargets(targetCounts);
  }

  const deckTargets = computePreferredTargets(targetCounts);
  if (!deckTargets) return intentTargets;

  const result = [];
  for (const target of intentTargets) {
    if (targetCounts[target] && targetCounts[target] > 0) {
      // Intent target exists in deck — keep it
      result.push(target);
    } else {
      // Intent target has no cards — substitute deck's best alternative
      const alt = deckTargets.find(t => !result.includes(t) && !intentTargets.includes(t));
      if (alt) result.push(alt);
      else result.push(target); // fallback: keep original even if unsupported
    }
  }

  return result;
}

/**
 * Adjust base category weights based on deck composition.
 *
 * Categories well-represented in the deck get a boost.
 * Categories absent from the deck get suppressed.
 * Adjustments are moderate — we nudge, not replace.
 *
 * @param {object} baseWeights - { Strike: 3, Offer: 0, ... }
 * @param {object} categoryCounts - { Strike: 5, Offer: 2, ... }
 * @param {number} totalCards - Total cards in deck
 * @returns {object} Adjusted weights
 */
function adjustWeights(baseWeights, categoryCounts, totalCards) {
  const adjusted = { ...baseWeights };
  if (totalCards === 0) return adjusted;

  for (const cat of Object.keys(adjusted)) {
    const count = categoryCounts[cat] || 0;
    const deckRatio = count / totalCards;

    if (count === 0 && adjusted[cat] > 0) {
      // Category not in deck — suppress heavily but don't zero
      // (could still appear via conditions or cross-encounter)
      adjusted[cat] *= 0.1;
    } else if (deckRatio >= 0.25) {
      // Well-represented (25%+ of deck) — modest boost
      adjusted[cat] *= 1.15;
    } else if (deckRatio >= 0.15) {
      // Present — no adjustment
    } else if (count > 0 && deckRatio < 0.08) {
      // Barely present — slight suppression
      adjusted[cat] *= 0.8;
    }
  }

  // Round to 2 decimal places for readability
  for (const cat of Object.keys(adjusted)) {
    adjusted[cat] = Math.round(adjusted[cat] * 100) / 100;
  }

  return adjusted;
}

/**
 * Compute member targeting weights from targeting intent.
 *
 * Returns a weights object that selectMemberTarget can use
 * for weighted selection instead of a switch statement.
 *
 * @param {string} intent - 'kill_weakest', 'highest_value', 'protect_weakest', 'unpredictable'
 * @returns {object} { rolePriority, vitalityBias, randomness }
 */
function computeTargetingWeights(intent) {
  switch (intent) {
    case 'kill_weakest':
      return {
        rolePriority: { tank: 1, dps: 1, flex: 1, support: 1 },
        vitalityBias: -1,    // negative = prefer low vitality
        randomness: 0,       // deterministic
      };

    case 'highest_value':
      return {
        rolePriority: { support: 4, flex: 3, dps: 2, tank: 1 },
        vitalityBias: -0.3,  // slight tiebreak toward wounded
        randomness: 0,       // deterministic
      };

    case 'protect_weakest':
      return {
        rolePriority: { tank: 1, dps: 1, flex: 1, support: 1 },
        vitalityBias: 1,     // positive = prefer HIGH vitality (avoid kills)
        randomness: 0,
      };

    case 'unpredictable':
      return {
        rolePriority: { flex: 3, support: 2.5, dps: 1.5, tank: 1 },
        vitalityBias: -0.3,  // slight wound bias
        randomness: 0.6,     // high randomness
      };

    default:
      return {
        rolePriority: { tank: 1, dps: 1, flex: 1, support: 1 },
        vitalityBias: -1,
        randomness: 0,
      };
  }
}

/**
 * Clamp a value between min and max.
 */
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}


// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Builders
  buildDungeonProfile,
  buildVisitorProfile,
  buildCreatureProfile,

  // Utilities (exported for testing)
  analyzeDeck,
  computePreferredTargets,
  blendTargets,
  adjustWeights,
  computeTargetingWeights,

  // Base profiles (for reference/testing)
  DUNGEON_BASE_PROFILES,
  VISITOR_BASE_PROFILES,
};
