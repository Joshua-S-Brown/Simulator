/**
 * COMPOSITION GENERATOR — Enumerate and sample the matchup space
 *
 * Two modes per GDD §18.6:
 *   1. Random sampling — baseline distributions across random matchups
 *   2. Targeted probing — all matchups for a specific filter
 *
 * Usage:
 *   const gen = require('./composition-generator');
 *
 *   // Random sample of 50 matchups
 *   const matchups = gen.randomSample(50);
 *
 *   // All matchups for a specific encounter combo
 *   const targeted = gen.targetedProbe({ encounters: ['root-hollow', 'veil-breach', 'honeyed-hollow'] });
 *
 *   // All matchups for a specific member
 *   const memberProbe = gen.targetedProbe({ requiredMember: 'knight' });
 *
 *   // Full enumeration (warning: 17,520 matchups)
 *   const all = gen.enumerateAll();
 */

import * as registry from './registry.js'; // ═══════════════════════════════════════════════════════════════
// COMBINATION UTILITIES
// ═══════════════════════════════════════════════════════════════

/** Generate all C(n,k) combinations from an array */
function combinations(arr, k) {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const results = [];
  for (let i = 0; i <= arr.length - k; i++) {
    const rest = combinations(arr.slice(i + 1), k - 1);
    for (const combo of rest) {
      results.push([arr[i], ...combo]);
    }
  }
  return results;
}

/** Generate all permutations of an array */
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const results = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      results.push([arr[i], ...perm]);
    }
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// SPACE ENUMERATION
// ═══════════════════════════════════════════════════════════════

/** All unique 3-encounter combinations (unordered). C(5,3) = 10. */
function encounterCombinations() {
  return combinations(registry.listEncounters(), 3);
}

/** All ordered 3-encounter sequences. P(5,3) = 60. */
function encounterSequences() {
  const combos = encounterCombinations();
  const seqs = [];
  for (const combo of combos) {
    for (const perm of permutations(combo)) {
      seqs.push(perm);
    }
  }
  return seqs;
}

/** All unique 4-member party compositions (unordered). C(8,4) = 70. */
function partyCombinations() {
  return combinations(registry.listMembers(), 4);
}

// ═══════════════════════════════════════════════════════════════
// MATCHUP GENERATION
// ═══════════════════════════════════════════════════════════════

/**
 * A matchup spec that can be fed to scenario-builder.buildFromMatchup().
 *
 * @typedef {object} MatchupSpec
 * @property {string[]} encounters - 3 encounter keys (ordered)
 * @property {string[]} [members] - 4 member keys (party visitor)
 * @property {string} [creature] - creature key (creature visitor)
 * @property {string} dungeonProfile - AI profile for dungeon
 * @property {string} visitorProfile - AI profile for visitor
 * @property {string} id - Unique identifier for this matchup
 */

/**
 * Generate a unique ID for a matchup.
 * Encounter order matters. Member order doesn't (sorted).
 */
function matchupId(encounters, visitorKeys, dungeonProfile) {
  const encPart = encounters.join('>');
  const visPart = Array.isArray(visitorKeys)
    ? [...visitorKeys].sort().join('+')
    : visitorKeys;
  return `${encPart}|${visPart}|${dungeonProfile}`;
}

/**
 * Determine the appropriate visitor AI profile for a visitor type.
 */
function defaultVisitorProfile(visitorType) {
  // Creatures have their own default profiles stored in the data
  // Parties use party_balanced
  return visitorType === 'party' ? 'party_balanced' : null;
}

/**
 * Enumerate ALL legal matchups in the composition space.
 *
 * This is the full matrix: every ordered encounter sequence ×
 * every visitor (parties + creatures) × every dungeon profile.
 *
 * @param {object} [options]
 * @param {boolean} [options.orderedEncounters=true] - Use ordered sequences (60) vs combinations (10)
 * @returns {MatchupSpec[]}
 */
function enumerateAll(options = {}) {
  const useOrdered = options.orderedEncounters !== false;
  const encSets = useOrdered ? encounterSequences() : encounterCombinations();
  const parties = partyCombinations();
  const creatures = registry.listCreatures();
  const dungeonProfiles = registry.listDungeonProfiles();

  const matchups = [];

  for (const encounters of encSets) {
    for (const dungeonProfile of dungeonProfiles) {
      // Party matchups
      for (const members of parties) {
        matchups.push({
          encounters,
          members,
          dungeonProfile,
          visitorProfile: 'party_balanced',
          id: matchupId(encounters, members, dungeonProfile),
        });
      }

      // Creature matchups
      for (const creatureKey of creatures) {
        const creatureData = registry.getCreature(creatureKey);
        matchups.push({
          encounters,
          creature: creatureKey,
          dungeonProfile,
          visitorProfile: creatureData.aiProfile || 'feral_aggressive',
          id: matchupId(encounters, creatureKey, dungeonProfile),
        });
      }
    }
  }

  return matchups;
}

/**
 * Random sample of N matchups from the full space.
 *
 * Sampling strategy: build matchups on demand rather than
 * enumerating then sampling (avoids 17K allocation for small N).
 *
 * @param {number} n - Number of matchups to sample
 * @param {object} [options]
 * @param {boolean} [options.partiesOnly=false] - Only sample party matchups
 * @param {boolean} [options.creaturesOnly=false] - Only sample creature matchups
 * @param {string} [options.dungeonProfile] - Fix dungeon profile instead of random
 * @returns {MatchupSpec[]}
 */
function randomSample(n, options = {}) {
  const encounters = registry.listEncounters();
  const members = registry.listMembers();
  const creatures = registry.listCreatures();
  const dungeonProfiles = registry.listDungeonProfiles();

  const seen = new Set();
  const matchups = [];
  let attempts = 0;
  const maxAttempts = n * 20; // Safety valve

  while (matchups.length < n && attempts < maxAttempts) {
    attempts++;

    // Random encounter sequence (pick 3, order matters)
    const encPool = [...encounters];
    const enc = [];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * encPool.length);
      enc.push(encPool.splice(idx, 1)[0]);
    }

    // Random dungeon profile
    const dp = options.dungeonProfile || dungeonProfiles[Math.floor(Math.random() * dungeonProfiles.length)];

    // Random visitor
    let matchup;
    const pickParty = options.creaturesOnly ? false
      : options.partiesOnly ? true
      : Math.random() < 0.8; // 80% party, 20% creature (proportional to space)

    if (pickParty) {
      // Random 4 members (no duplicates)
      const memPool = [...members];
      const mems = [];
      for (let i = 0; i < 4; i++) {
        const idx = Math.floor(Math.random() * memPool.length);
        mems.push(memPool.splice(idx, 1)[0]);
      }
      matchup = {
        encounters: enc,
        members: mems,
        dungeonProfile: dp,
        visitorProfile: 'party_balanced',
        id: matchupId(enc, mems, dp),
      };
    } else {
      const ck = creatures[Math.floor(Math.random() * creatures.length)];
      const creatureData = registry.getCreature(ck);
      matchup = {
        encounters: enc,
        creature: ck,
        dungeonProfile: dp,
        visitorProfile: creatureData.aiProfile || 'feral_aggressive',
        id: matchupId(enc, ck, dp),
      };
    }

    if (!seen.has(matchup.id)) {
      seen.add(matchup.id);
      matchups.push(matchup);
    }
  }

  return matchups;
}

/**
 * Targeted probe — all matchups matching a filter.
 *
 * Use this to explore specific slices of the composition space.
 *
 * @param {object} filter
 * @param {string[]} [filter.encounters] - Fix encounter sequence (ordered)
 * @param {string[]} [filter.members] - Fix party composition
 * @param {string} [filter.creature] - Fix creature
 * @param {string} [filter.requiredMember] - All parties containing this member
 * @param {string} [filter.requiredEncounter] - All sequences containing this encounter
 * @param {string} [filter.dungeonProfile] - Fix dungeon profile
 * @param {boolean} [filter.orderedEncounters=true] - Use ordered sequences
 * @returns {MatchupSpec[]}
 */
function targetedProbe(filter = {}) {
  const useOrdered = filter.orderedEncounters !== false;
  let encSets = useOrdered ? encounterSequences() : encounterCombinations();
  let parties = partyCombinations();
  const creatures = registry.listCreatures();
  let dungeonProfiles = registry.listDungeonProfiles();

  // Apply encounter filters
  if (filter.encounters) {
    encSets = [filter.encounters];
  } else if (filter.requiredEncounter) {
    encSets = encSets.filter(seq => seq.includes(filter.requiredEncounter));
  }

  // Apply dungeon profile filter
  if (filter.dungeonProfile) {
    dungeonProfiles = [filter.dungeonProfile];
  }

  // Apply member filters
  if (filter.members) {
    parties = [filter.members];
  } else if (filter.requiredMember) {
    parties = parties.filter(p => p.includes(filter.requiredMember));
  }

  const matchups = [];

  for (const encounters of encSets) {
    for (const dp of dungeonProfiles) {
      // Party matchups (unless creature is fixed)
      if (!filter.creature) {
        for (const members of parties) {
          matchups.push({
            encounters,
            members,
            dungeonProfile: dp,
            visitorProfile: 'party_balanced',
            id: matchupId(encounters, members, dp),
          });
        }
      }

      // Creature matchups (unless members are fixed)
      if (!filter.members && !filter.requiredMember) {
        const creatureList = filter.creature ? [filter.creature] : creatures;
        for (const ck of creatureList) {
          const creatureData = registry.getCreature(ck);
          matchups.push({
            encounters,
            creature: ck,
            dungeonProfile: dp,
            visitorProfile: creatureData.aiProfile || 'feral_aggressive',
            id: matchupId(encounters, ck, dp),
          });
        }
      }
    }
  }

  return matchups;
}

// ═══════════════════════════════════════════════════════════════
// SPACE STATISTICS
// ═══════════════════════════════════════════════════════════════

function spaceStats() {
  const enc = registry.listEncounters().length;
  const mem = registry.listMembers().length;
  const cre = registry.listCreatures().length;
  const dp = registry.listDungeonProfiles().length;

  const encCombos = combinations(registry.listEncounters(), 3).length;
  const encSequences = encCombos * 6; // 3! orderings per combo
  const partyCombos = combinations(registry.listMembers(), 4).length;

  return {
    encounters: enc,
    members: mem,
    creatures: cre,
    dungeonProfiles: dp,
    encounterCombinations: encCombos,
    encounterSequences: encSequences,
    partyCombinations: partyCombos,
    partyMatchups: encSequences * partyCombos * dp,
    creatureMatchups: encSequences * cre * dp,
    totalMatchups: encSequences * partyCombos * dp + encSequences * cre * dp,
  };
}

export { // Enumeration
  enumerateAll,
  randomSample,
  targetedProbe,
  spaceStats,

  // Building blocks (exported for testing)
  encounterCombinations,
  encounterSequences,
  partyCombinations,
  combinations,
  permutations,
  matchupId, };