// ═══════════════════════════════════════════════════════════════
// PROFILE BUILDER — Infers play profiles from selected encounters/members
//
// Fragment sum approach: sums aiContributions across selections,
// then infers archetype from weight distribution.
//
// buildDungeonProfile(encounterKeys) → { weights, archetype, strategy, ... }
// buildVisitorProfile(memberKeys) → { weights, archetype, cooperationThresholds, ... }
// ═══════════════════════════════════════════════════════════════

import { getEncounter, getMember } from '@lib/registry.js';

// ─── Dungeon Archetypes ─────────────────────────────────────

function inferDungeonArchetype(weights, bondAffinity, betrayalAffinity) {
  const combat = (weights.Strike || 0) + (weights.Empower || 0);
  const control = (weights.Counter || 0) + (weights.Disrupt || 0) + (weights.Trap || 0);
  const support = (weights.Offer || 0) + (weights.Test || 0) + (weights.Reshape || 0);
  const total = combat + control + support;

  if (total === 0) return { name: 'Dormant', desc: 'No clear tactical identity.' };

  if (bondAffinity >= 2.0) {
    return { name: 'Guardian', desc: 'Seeks understanding and mutual benefit. Prefers Bond outcomes.' };
  }
  if (bondAffinity >= 1.0) {
    return { name: 'Shepherd', desc: 'Guides visitors with care, but maintains boundaries.' };
  }
  if (betrayalAffinity >= 1.5) {
    return { name: 'Deceiver', desc: 'Builds trust to exploit it. Honeyed words hide sharp teeth.' };
  }

  const combatRatio = combat / total;
  const controlRatio = control / total;

  if (combatRatio > 0.45) {
    return { name: 'Predator', desc: 'Aggressive and direct. Prefers overwhelming force.' };
  }
  if (controlRatio > 0.40) {
    return { name: 'Architect', desc: 'Controls the flow. Disrupts, counters, and traps.' };
  }

  return { name: 'Warden', desc: 'Balanced approach. Adapts tactics to the situation.' };
}

// ─── Visitor Archetypes ────────────────────────────────────

function inferVisitorArchetype(weights, bondAffinity) {
  const combat = (weights.Strike || 0) + (weights.Empower || 0);
  const defense = (weights.Counter || 0) + (weights.React || 0);
  const support = (weights.Offer || 0) + (weights.Reshape || 0) + (weights.Test || 0);
  const total = combat + defense + support;

  if (total === 0) return { name: 'Lost', desc: 'No clear tactical identity.' };

  if (bondAffinity >= 1.5) {
    return { name: 'Diplomats', desc: 'Seek connection over conquest. Open to cooperation.' };
  }
  if (support / total > 0.35) {
    return { name: 'Seekers', desc: 'Explorers who sustain and investigate. Cautious but curious.' };
  }
  if (combat > defense * 1.3) {
    return { name: 'War Party', desc: 'Aggressive and focused. Here to destroy the dungeon.' };
  }
  if (defense > combat) {
    return { name: 'Shieldwall', desc: 'Defensive formation. Hard to break, slow to advance.' };
  }

  return { name: 'Adventurers', desc: 'Balanced party. Adapts to the situation at hand.' };
}

// ─── Public API ─────────────────────────────────────────────

export function buildDungeonProfile(encounterKeys) {
  const weights = {};
  let comboAwareness = 0, energyEagerness = 0;
  let bondAffinity = 0, betrayalAffinity = 0;

  for (const key of encounterKeys) {
    const enc = getEncounter(key);
    const ai = enc.aiContributions;
    if (!ai || !ai.baseWeights) continue;

    for (const [cat, val] of Object.entries(ai.baseWeights)) {
      weights[cat] = (weights[cat] || 0) + val;
    }

    comboAwareness += ai.comboAwareness || 0;
    energyEagerness += ai.energyEagerness || 0;
    bondAffinity += ai.bondAffinity || 0;
    betrayalAffinity += ai.betrayalAffinity || 0;
  }

  const strategy = bondAffinity >= 2.0 ? 'nurturing'
    : betrayalAffinity >= 2.0 ? 'deceptive'
    : (bondAffinity > 0 || betrayalAffinity > 0) ? 'mixed'
    : null;

  const archetype = inferDungeonArchetype(weights, bondAffinity, betrayalAffinity);

  return {
    weights, comboAwareness, energyEagerness,
    bondAffinity, betrayalAffinity, strategy, archetype,
  };
}

export function buildVisitorProfile(memberKeys) {
  const weights = {};
  let comboAwareness = 0;
  let bondAffinity = 0, cooperationSensitivity = 0;

  for (const key of memberKeys) {
    const mem = getMember(key);
    const ai = mem.aiContributions;
    if (!ai || !ai.baseWeights) continue;

    for (const [cat, val] of Object.entries(ai.baseWeights)) {
      weights[cat] = (weights[cat] || 0) + val;
    }

    comboAwareness += ai.comboAwareness || 0;
    bondAffinity += ai.bondAffinity || 0;
    cooperationSensitivity += ai.cooperationSensitivity || 0;
  }

  const archetype = inferVisitorArchetype(weights, bondAffinity);

  const avgCoop = memberKeys.length > 0 ? cooperationSensitivity / memberKeys.length : 0;
  const cautiousRound = Math.max(2, Math.round(5 - avgCoop * 4));
  const cooperativeRound = Math.max(cautiousRound + 1, Math.round(7 - avgCoop * 5));

  return {
    weights, comboAwareness, bondAffinity, cooperationSensitivity,
    archetype,
    cooperationThresholds: { cautious: cautiousRound, cooperative: cooperativeRound },
  };
}
