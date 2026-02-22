/**
 * REGISTRY v2 — Central Data Registry (ES Module Format)
 *
 * Converted from dynamic require() to static imports.
 * All data files are imported at module load time.
 *
 * Usage:
 *   import { getEncounter, getMember, getCreature } from './registry.js';
 *
 *   getEncounter('root-hollow')
 *     → { name, description, initiative, autoEffects, tags,
 *         contributions, modifierContributions, deck }
 */

// ── Static Data Imports ──
import rootHollow from '../data/encounters-combined/root-hollow.js';
import whisperingGallery from '../data/encounters-combined/whispering-gallery.js';
import veilBreach from '../data/encounters-combined/veil-breach.js';
import honeyedHollow from '../data/encounters-combined/honeyed-hollow.js';
import livingRootSanctuary from '../data/encounters-combined/living-root-sanctuary.js';
import hollowSirensGrotto from '../data/encounters-combined/hollow-sirens-grotto.js';
import constructsForge from '../data/encounters-combined/constructs-forge.js';
import broodmothersWeb from '../data/encounters-combined/broodmothers-web.js';

import knight from '../data/members/knight.js';
import battlemage from '../data/members/battlemage.js';
import cleric from '../data/members/cleric.js';
import rogue from '../data/members/rogue.js';
import warden from '../data/members/warden.js';
import sorcerer from '../data/members/sorcerer.js';
import druid from '../data/members/druid.js';
import ranger from '../data/members/ranger.js';

import thornbackBoar from '../data/creatures/thornback-boar.js';
import veilMoth from '../data/creatures/veil-moth.js';
import driftSymbiote from '../data/creatures/drift-symbiote.js';

// ═══════════════════════════════════════════════════════════════
// LOOKUP MAPS
// ═══════════════════════════════════════════════════════════════

const ENCOUNTERS = {
  'root-hollow': rootHollow,
  'whispering-gallery': whisperingGallery,
  'veil-breach': veilBreach,
  'honeyed-hollow': honeyedHollow,
  'living-root-sanctuary': livingRootSanctuary,
  'hollow-sirens-grotto': hollowSirensGrotto,
  'constructs-forge': constructsForge,
  'broodmothers-web': broodmothersWeb,
};

const MEMBERS = {
  'knight': knight,
  'battlemage': battlemage,
  'cleric': cleric,
  'rogue': rogue,
  'warden': warden,
  'sorcerer': sorcerer,
  'druid': druid,
  'ranger': ranger,
};

const CREATURES = {
  'thornback-boar': thornbackBoar,
  'veil-moth': veilMoth,
  'drift-symbiote': driftSymbiote,
};

// ═══════════════════════════════════════════════════════════════
// CONTENT KEYS
// ═══════════════════════════════════════════════════════════════

const ENCOUNTER_KEYS = ["root-hollow","whispering-gallery","veil-breach","honeyed-hollow","living-root-sanctuary","hollow-sirens-grotto","constructs-forge","broodmothers-web"];
const MEMBER_KEYS = ["knight","battlemage","cleric","rogue","warden","sorcerer","druid","ranger"];
const CREATURE_KEYS = ["thornback-boar","veil-moth","drift-symbiote"];

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
// ENCOUNTER API
// ═══════════════════════════════════════════════════════════════

function getEncounter(key) {
  const enc = ENCOUNTERS[key];
  if (!enc) throw new Error(`Unknown encounter: "${key}". Valid: ${ENCOUNTER_KEYS.join(', ')}`);
  return enc;
}

function listEncounters() {
  return [...ENCOUNTER_KEYS];
}

// ═══════════════════════════════════════════════════════════════
// MEMBER API
// ═══════════════════════════════════════════════════════════════

function getMember(key) {
  const mem = MEMBERS[key];
  if (!mem) throw new Error(`Unknown member: "${key}". Valid: ${MEMBER_KEYS.join(', ')}`);
  return mem;
}

function getMemberDeck(key) {
  return getMember(key).deck;
}

function listMembers() {
  return [...MEMBER_KEYS];
}

// ═══════════════════════════════════════════════════════════════
// CREATURE API
// ═══════════════════════════════════════════════════════════════

function getCreature(key) {
  const creature = CREATURES[key];
  if (!creature) throw new Error(`Unknown creature: "${key}". Valid: ${CREATURE_KEYS.join(', ')}`);
  return creature;
}

function listCreatures() {
  return [...CREATURE_KEYS];
}

// ═══════════════════════════════════════════════════════════════
// PROFILE API
// ═══════════════════════════════════════════════════════════════

function listDungeonProfiles() { return [...DUNGEON_PROFILES]; }
function listVisitorProfiles() { return [...VISITOR_PROFILES]; }
function isValidDungeonProfile(profile) { return DUNGEON_PROFILES.includes(profile); }
function isValidVisitorProfile(profile) { return VISITOR_PROFILES.includes(profile); }

// ═══════════════════════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════════════════════

function clearCache() {
  // No-op in ESM (static imports are cached by the runtime)
}

export {
  getEncounter, listEncounters,
  getMember, getMemberDeck, listMembers,
  getCreature, listCreatures,
  listDungeonProfiles, listVisitorProfiles,
  isValidDungeonProfile, isValidVisitorProfile,
  ENCOUNTERS_PER_RUN, MEMBERS_PER_PARTY,
  clearCache,
};
