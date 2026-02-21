/**
 * DECK ASSEMBLER — Combines individual member decks into party decks
 *
 * Phase 0 of the Composition Engine.
 *
 * Usage:
 *   const { assembleDeck, assemblePartyDeck } = require('./deck-assembler');
 *
 *   // Assemble from specific members
 *   const deck = assembleDeck(['knight', 'battlemage', 'cleric', 'rogue']);
 *
 *   // Convenience: assemble a known party
 *   const standardDeck = assemblePartyDeck('standard-party');
 *   const arcaneDeck = assemblePartyDeck('arcane-expedition');
 *
 * Member deck files live in data/decks/members/{member}.js
 * Each exports an array of 10 cards with a `member` field.
 */

const path = require('path');

// ── Member → file mapping ──
const MEMBER_FILES = {
  knight:     'knight.js',
  battlemage: 'battlemage.js',
  cleric:     'cleric.js',
  rogue:      'rogue.js',
  warden:     'warden.js',
  sorcerer:   'sorcerer.js',
  druid:      'druid.js',
  ranger:     'ranger.js',
};

// ── Party → member list mapping ──
const PARTY_MEMBERS = {
  'standard-party': ['knight', 'battlemage', 'cleric', 'rogue'],
  'arcane-expedition': ['warden', 'sorcerer', 'druid', 'ranger'],
};

/**
 * Load a single member's deck from file.
 * @param {string} memberKey - e.g. 'knight', 'sorcerer'
 * @returns {object[]} Array of card objects
 */
function loadMemberDeck(memberKey) {
  const file = MEMBER_FILES[memberKey];
  if (!file) {
    throw new Error(`Unknown member: "${memberKey}". Valid: ${Object.keys(MEMBER_FILES).join(', ')}`);
  }
  const deckPath = path.join(__dirname, '..', 'data', 'decks', 'members', file);
  return require(deckPath);
}

/**
 * Assemble a party deck from an array of member keys.
 * Concatenates individual member decks in order.
 *
 * @param {string[]} memberKeys - e.g. ['knight', 'battlemage', 'cleric', 'rogue']
 * @returns {object[]} Combined deck array (typically 40 cards for 4 members)
 */
function assembleDeck(memberKeys) {
  const deck = [];
  for (const key of memberKeys) {
    const memberCards = loadMemberDeck(key);
    deck.push(...memberCards);
  }
  return deck;
}

/**
 * Assemble a known party's deck by party key.
 *
 * @param {string} partyKey - 'standard-party' or 'arcane-expedition'
 * @returns {object[]} Combined deck array
 */
function assemblePartyDeck(partyKey) {
  const members = PARTY_MEMBERS[partyKey];
  if (!members) {
    throw new Error(`Unknown party: "${partyKey}". Valid: ${Object.keys(PARTY_MEMBERS).join(', ')}`);
  }
  return assembleDeck(members);
}

/**
 * List all available member keys.
 * @returns {string[]}
 */
function listMembers() {
  return Object.keys(MEMBER_FILES);
}

/**
 * List all available party keys.
 * @returns {string[]}
 */
function listParties() {
  return Object.keys(PARTY_MEMBERS);
}

/**
 * Get member list for a party.
 * @param {string} partyKey
 * @returns {string[]}
 */
function getPartyMembers(partyKey) {
  return PARTY_MEMBERS[partyKey] || null;
}

module.exports = {
  assembleDeck,
  assemblePartyDeck,
  loadMemberDeck,
  listMembers,
  listParties,
  getPartyMembers,
  MEMBER_FILES,
  PARTY_MEMBERS,
};
