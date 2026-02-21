/**
 * REGISTRY v2 — Central Data Registry (Combined Format)
 *
 * Reads from combined data files where each encounter, member, and
 * creature is a self-contained unit with stats + deck + contributions.
 *
 * Key changes from v1:
 *   - No hardcoded party or dungeon presets (those are computed)
 *   - Encounters include deck + contribution stats
 *   - Members include stats + deck + modifier contributions
 *   - Creatures include template + deck
 *   - getEncounter() returns contributions alongside encounter/deck
 *   - getMember() returns full member data including deck
 *
 * Usage:
 *   const registry = require('./registry');
 *
 *   registry.getEncounter('root-hollow')
 *     → { name, description, initiative, autoEffects, tags,
 *         contributions, modifierContributions, deck }
 *
 *   registry.getMember('knight')
 *     → { name, role, vitality, resolveContribution, nerveContribution,
 *         modifierContributions, deck }
 *
 *   registry.getCreature('thornback-boar')
 *     → { name, type, vitality, resolve, nerve, trust, modifiers,
 *         motivation, aiProfile, deck }
 */

const path = require('path');

// ── Helper: resolve paths relative to project root ──
const ROOT = path.join(__dirname, '..');
const resolve = (...parts) => path.join(ROOT, ...parts);

// ═══════════════════════════════════════════════════════════════
// CONTENT KEYS — What exists in the game
// ═══════════════════════════════════════════════════════════════

/**
 * Encounter keys. Each has a combined file at data/encounters-combined/{key}.js
 */
const ENCOUNTER_KEYS = [
  'root-hollow',
  'whispering-gallery',
  'veil-breach',
  'honeyed-hollow',
  'living-root-sanctuary',
];

/**
 * Member keys. Each has a combined file at data/members/{key}.js
 */
const MEMBER_KEYS = [
  'knight',
  'battlemage',
  'cleric',
  'rogue',
  'warden',
  'sorcerer',
  'druid',
  'ranger',
];

/**
 * Creature keys. Each has a combined file at data/creatures/{key}.js
 */
const CREATURE_KEYS = [
  'thornback-boar',
  'veil-moth',
  'drift-symbiote',
];

// ═══════════════════════════════════════════════════════════════
// AI PROFILE LISTS
// ═══════════════════════════════════════════════════════════════

const DUNGEON_PROFILES = ['aggressive', 'tactical', 'nurturing', 'deceptive'];
const VISITOR_PROFILES = ['feral_aggressive', 'cautious_explorer', 'cooperative', 'party_balanced'];

// ═══════════════════════════════════════════════════════════════
// GAME RULES — Fixed constraints
// ═══════════════════════════════════════════════════════════════

const ENCOUNTERS_PER_RUN = 3;
const MEMBERS_PER_PARTY = 4;

// ═══════════════════════════════════════════════════════════════
// MODULE CACHE
// ═══════════════════════════════════════════════════════════════

const _cache = {};

function cached(key, loader) {
  if (!_cache[key]) {
    _cache[key] = loader();
  }
  return _cache[key];
}

// ═══════════════════════════════════════════════════════════════
// ENCOUNTER API
// ═══════════════════════════════════════════════════════════════

/**
 * Get a combined encounter by key.
 * Returns the full combined object: encounter def + deck + contributions.
 *
 * The returned object has ALL fields from the combined file:
 *   name, description, initiative, autoEffects, tags,
 *   contributions, modifierContributions, deck
 *
 * @param {string} key - e.g. 'root-hollow'
 * @returns {object} Combined encounter data
 */
function getEncounter(key) {
  if (!ENCOUNTER_KEYS.includes(key)) {
    throw new Error(`Unknown encounter: "${key}". Valid: ${ENCOUNTER_KEYS.join(', ')}`);
  }
  return cached(`enc:${key}`, () => require(resolve('data', 'encounters-combined', `${key}.js`)));
}

/**
 * List all encounter keys.
 * @returns {string[]}
 */
function listEncounters() {
  return [...ENCOUNTER_KEYS];
}

// ═══════════════════════════════════════════════════════════════
// MEMBER API
// ═══════════════════════════════════════════════════════════════

/**
 * Get a combined member by key.
 * Returns the full combined object: stats + deck + modifier contributions.
 *
 * @param {string} key - e.g. 'knight'
 * @returns {object} Combined member data
 */
function getMember(key) {
  if (!MEMBER_KEYS.includes(key)) {
    throw new Error(`Unknown member: "${key}". Valid: ${MEMBER_KEYS.join(', ')}`);
  }
  return cached(`member:${key}`, () => require(resolve('data', 'members', `${key}.js`)));
}

/**
 * Get just the deck for a member.
 * Convenience for template builder / deck assembly.
 *
 * @param {string} key - e.g. 'knight'
 * @returns {object[]} Array of 10 card objects
 */
function getMemberDeck(key) {
  return getMember(key).deck;
}

/**
 * List all member keys.
 * @returns {string[]}
 */
function listMembers() {
  return [...MEMBER_KEYS];
}

// ═══════════════════════════════════════════════════════════════
// CREATURE API
// ═══════════════════════════════════════════════════════════════

/**
 * Get a combined creature by key.
 * Returns the full combined object: template + deck.
 *
 * @param {string} key - e.g. 'thornback-boar'
 * @returns {object} Combined creature data
 */
function getCreature(key) {
  if (!CREATURE_KEYS.includes(key)) {
    throw new Error(`Unknown creature: "${key}". Valid: ${CREATURE_KEYS.join(', ')}`);
  }
  return cached(`creature:${key}`, () => require(resolve('data', 'creatures', `${key}.js`)));
}

/**
 * List all creature keys.
 * @returns {string[]}
 */
function listCreatures() {
  return [...CREATURE_KEYS];
}

// ═══════════════════════════════════════════════════════════════
// PROFILE API
// ═══════════════════════════════════════════════════════════════

function listDungeonProfiles() {
  return [...DUNGEON_PROFILES];
}

function listVisitorProfiles() {
  return [...VISITOR_PROFILES];
}

function isValidDungeonProfile(profile) {
  return DUNGEON_PROFILES.includes(profile);
}

function isValidVisitorProfile(profile) {
  return VISITOR_PROFILES.includes(profile);
}

// ═══════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════

/**
 * Clear the module cache (useful for testing).
 */
function clearCache() {
  for (const key of Object.keys(_cache)) {
    delete _cache[key];
  }
}

module.exports = {
  // Encounters
  getEncounter,
  listEncounters,

  // Members
  getMember,
  getMemberDeck,
  listMembers,

  // Creatures
  getCreature,
  listCreatures,

  // Profiles
  listDungeonProfiles,
  listVisitorProfiles,
  isValidDungeonProfile,
  isValidVisitorProfile,

  // Constants
  ENCOUNTERS_PER_RUN,
  MEMBERS_PER_PARTY,

  // Utility
  clearCache,
};