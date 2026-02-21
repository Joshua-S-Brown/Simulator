/**
 * TEMPLATE BUILDER — Compute dungeon and party templates from components
 *
 * Dungeons and parties are not stored objects — they're computed from
 * their component encounter/member selections. This module contains
 * the aggregation formulas.
 *
 * Usage:
 *   const { buildDungeonTemplate, buildPartyTemplate } = require('./template-builder');
 *
 *   // Dungeon = sum of 3 encounter contributions
 *   const dungeon = buildDungeonTemplate(['root-hollow', 'whispering-gallery', 'veil-breach']);
 *   // → { name, structure: 16, veil: 14, presence: 12, rapport: 0, modifiers: {...} }
 *
 *   // Party = sum of 4 member contributions
 *   const party = buildPartyTemplate(['knight', 'battlemage', 'cleric', 'rogue']);
 *   // → { name, type: 'party', partySize: 4, resolve: 14, nerve: 16, trust: 0,
 *   //     members: {...}, modifiers: {...}, killThreshold: 2, knockoutMorale: [...] }
 */

const registry = require('./registry');

// ═══════════════════════════════════════════════════════════════
// CONSTANTS — Universal party mechanics (not per-composition)
// ═══════════════════════════════════════════════════════════════

const PARTY_CONSTANTS = {
  trust: 0,
  killThreshold: 2,
  knockoutMorale: [
    { resolveHit: 3, nerveHit: 3 },   // First knockout: moderate shock
    { resolveHit: 5, nerveHit: 5 },    // Second knockout: severe
  ],
};

// ═══════════════════════════════════════════════════════════════
// DUNGEON TEMPLATE BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Build a dungeon template from 3 encounter selections.
 *
 * @param {string[]} encounterKeys - Exactly 3 encounter keys
 * @returns {object} Dungeon template compatible with engine/rules.js createDungeonState()
 */
function buildDungeonTemplate(encounterKeys) {
  if (!Array.isArray(encounterKeys) || encounterKeys.length !== 3) {
    throw new Error(`buildDungeonTemplate requires exactly 3 encounters, got ${encounterKeys?.length || 0}`);
  }

  // Check for duplicates
  const unique = new Set(encounterKeys);
  if (unique.size !== encounterKeys.length) {
    throw new Error(`Duplicate encounters not permitted: ${encounterKeys.join(', ')}`);
  }

  let structure = 0, veil = 0, presence = 0;
  const modifiers = { dominion: 0, resonance: 0, presence_attr: 0, memory: 0 };

  for (const key of encounterKeys) {
    const enc = registry.getEncounter(key);
    const contrib = enc.contributions;
    const modContrib = enc.modifierContributions;

    if (!contrib) {
      throw new Error(`Encounter '${key}' has no contributions field. Run migration first.`);
    }

    structure += contrib.structure || 0;
    veil += contrib.veil || 0;
    presence += contrib.presence || 0;

    if (modContrib) {
      for (const [mod, val] of Object.entries(modContrib)) {
        modifiers[mod] = (modifiers[mod] || 0) + val;
      }
    }
  }

  // Generate name from encounter sequence
  const encounterNames = encounterKeys.map(k => registry.getEncounter(k).name);
  const name = `Dungeon (${encounterNames.join(' + ')})`;

  return {
    name,
    structure,
    veil,
    presence,
    rapport: 0, // always starts at 0 (promoter)
    modifiers,
  };
}

// ═══════════════════════════════════════════════════════════════
// PARTY TEMPLATE BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Build a party template from 4 member selections.
 *
 * @param {string[]} memberKeys - Exactly 4 member keys
 * @returns {object} Party template compatible with engine/rules.js createPartyVisitorState()
 */
function buildPartyTemplate(memberKeys) {
  if (!Array.isArray(memberKeys) || memberKeys.length !== 4) {
    throw new Error(`buildPartyTemplate requires exactly 4 members, got ${memberKeys?.length || 0}`);
  }

  let resolve = 0, nerve = 0;
  const modifiers = { strength: 0, cunning: 0, perception: 0, resilience: 0 };
  const members = {};

  for (const key of memberKeys) {
    const member = registry.getMember(key);

    members[key] = {
      name: member.name,
      role: member.role,
      vitality: member.vitality,
      resolveContribution: member.resolveContribution,
      nerveContribution: member.nerveContribution,
    };

    resolve += member.resolveContribution;
    nerve += member.nerveContribution;

    if (member.modifierContributions) {
      for (const [mod, val] of Object.entries(member.modifierContributions)) {
        modifiers[mod] = (modifiers[mod] || 0) + val;
      }
    }
  }

  // Generate name from member composition
  const memberNames = memberKeys.map(k => registry.getMember(k).name);
  const name = `Party (${memberNames.join(', ')})`;

  return {
    name,
    type: 'party',
    partySize: memberKeys.length,
    resolve,
    nerve,
    trust: PARTY_CONSTANTS.trust,
    members,
    killThreshold: PARTY_CONSTANTS.killThreshold,
    knockoutMorale: PARTY_CONSTANTS.knockoutMorale,
    modifiers,
  };
}

/**
 * Build a party deck by concatenating member decks.
 *
 * @param {string[]} memberKeys - Exactly 4 member keys
 * @returns {object[]} Combined deck array (40 cards)
 */
function buildPartyDeck(memberKeys) {
  const deck = [];
  for (const key of memberKeys) {
    const memberDeck = registry.getMemberDeck(key);
    deck.push(...memberDeck);
  }
  return deck;
}

module.exports = {
  buildDungeonTemplate,
  buildPartyTemplate,
  buildPartyDeck,
  PARTY_CONSTANTS,
};