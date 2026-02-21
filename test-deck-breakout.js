#!/usr/bin/env node
/**
 * PHASE 0 VALIDATION: Deck Breakout Test
 *
 * Validates:
 *  1. All 8 member decks load and have correct structure
 *  2. Assembled party decks have correct card counts
 *  3. Card distribution matches documented specs
 *  4. Member fields are consistent (every card tagged correctly)
 *  5. No duplicate card names within a party
 *
 * Run: node test-deck-breakout.js
 *
 * DIFF TEST (run in project root after copying files):
 *   To validate assembled decks match originals exactly, uncomment
 *   the diff section at the bottom and ensure data/decks/visitor-party-standard.js
 *   and data/decks/visitor-party-arcane.js are accessible.
 */

const { assembleDeck, assemblePartyDeck, loadMemberDeck, listMembers, PARTY_MEMBERS } = require('./lib/deck-assembler');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.log(`  ✗ FAIL: ${msg}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// 1. Individual member deck validation
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 1. Member Deck Structure ═══');

const allMembers = listMembers();
assert(allMembers.length === 8, `8 members registered (got ${allMembers.length})`);

for (const member of allMembers) {
  const deck = loadMemberDeck(member);
  assert(deck.length === 10, `${member}: 10 cards (got ${deck.length})`);
  assert(deck.every(c => c.member === member), `${member}: all cards tagged member="${member}"`);
  assert(deck.every(c => c.name && c.category), `${member}: all cards have name + category`);

  // Energy check: every member should have at least 2 energy cards
  const energyCount = deck.filter(c => c.category === 'Energy').length;
  assert(energyCount >= 2, `${member}: ≥2 Energy cards (got ${energyCount})`);
}

// ═══════════════════════════════════════════════════════════════
// 2. Assembled party deck validation
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 2. Assembled Party Decks ═══');

// Standard Adventuring Company
const standardDeck = assemblePartyDeck('standard-party');
assert(standardDeck.length === 40, `Standard party: 40 cards (got ${standardDeck.length})`);

const stdMembers = new Set(standardDeck.map(c => c.member));
assert(stdMembers.size === 4, `Standard party: 4 unique members (got ${stdMembers.size})`);
assert([...stdMembers].sort().join(',') === 'battlemage,cleric,knight,rogue',
  `Standard party members: knight,battlemage,cleric,rogue`);

// Arcane Expedition
const arcaneDeck = assemblePartyDeck('arcane-expedition');
assert(arcaneDeck.length === 40, `Arcane expedition: 40 cards (got ${arcaneDeck.length})`);

const arcMembers = new Set(arcaneDeck.map(c => c.member));
assert(arcMembers.size === 4, `Arcane expedition: 4 unique members (got ${arcMembers.size})`);
assert([...arcMembers].sort().join(',') === 'druid,ranger,sorcerer,warden',
  `Arcane expedition members: warden,sorcerer,druid,ranger`);

// ═══════════════════════════════════════════════════════════════
// 3. Card distribution check (documented specs)
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 3. Card Distribution ═══');

function countCategories(deck) {
  const counts = {};
  for (const c of deck) {
    counts[c.category] = (counts[c.category] || 0) + 1;
  }
  return counts;
}

// Standard: Energy 10, Strike 9, Empower 2, Disrupt 4, Counter 4, React 4, Trap 2, Offer 1, Test 1, Reshape 3
const stdCats = countCategories(standardDeck);
const stdExpected = { Energy: 10, Strike: 9, Empower: 2, Disrupt: 4, Counter: 4, React: 4, Trap: 2, Offer: 1, Test: 1, Reshape: 3 };
for (const [cat, expected] of Object.entries(stdExpected)) {
  assert(stdCats[cat] === expected, `Standard ${cat}: ${expected} (got ${stdCats[cat] || 0})`);
}

// Arcane: Energy 10, Strike 9, Empower 1, Disrupt 4, Counter 3, React 4, Trap 1, Offer 1, Test 1, Reshape 6
const arcCats = countCategories(arcaneDeck);
const arcExpected = { Energy: 10, Strike: 9, Empower: 1, Disrupt: 4, Counter: 3, React: 4, Trap: 1, Offer: 1, Test: 1, Reshape: 6 };
for (const [cat, expected] of Object.entries(arcExpected)) {
  assert(arcCats[cat] === expected, `Arcane ${cat}: ${expected} (got ${arcCats[cat] || 0})`);
}

// ═══════════════════════════════════════════════════════════════
// 4. No duplicate card names within a party
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 4. Uniqueness ═══');

const stdNames = standardDeck.map(c => c.name);
const stdDups = stdNames.filter((n, i) => stdNames.indexOf(n) !== i);
assert(stdDups.length === 0, `Standard party: no duplicate card names${stdDups.length ? ' — dupes: ' + stdDups.join(', ') : ''}`);

const arcNames = arcaneDeck.map(c => c.name);
const arcDups = arcNames.filter((n, i) => arcNames.indexOf(n) !== i);
assert(arcDups.length === 0, `Arcane expedition: no duplicate card names${arcDups.length ? ' — dupes: ' + arcDups.join(', ') : ''}`);

// ═══════════════════════════════════════════════════════════════
// 5. Assembly order (members concatenated in party order)
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 5. Assembly Order ═══');

// Standard: knight[0-9], battlemage[10-19], cleric[20-29], rogue[30-39]
const stdOrder = PARTY_MEMBERS['standard-party'];
for (let i = 0; i < stdOrder.length; i++) {
  const member = stdOrder[i];
  const slice = standardDeck.slice(i * 10, (i + 1) * 10);
  assert(slice.every(c => c.member === member),
    `Standard cards ${i*10}-${(i+1)*10-1}: all ${member}`);
}

// Arcane: warden[0-9], sorcerer[10-19], druid[20-29], ranger[30-39]
const arcOrder = PARTY_MEMBERS['arcane-expedition'];
for (let i = 0; i < arcOrder.length; i++) {
  const member = arcOrder[i];
  const slice = arcaneDeck.slice(i * 10, (i + 1) * 10);
  assert(slice.every(c => c.member === member),
    `Arcane cards ${i*10}-${(i+1)*10-1}: all ${member}`);
}

// ═══════════════════════════════════════════════════════════════
// 6. Cross-party member uniqueness (no member in both parties)
// ═══════════════════════════════════════════════════════════════
console.log('\n═══ 6. Cross-Party Validation ═══');
const stdMemberList = PARTY_MEMBERS['standard-party'];
const arcMemberList = PARTY_MEMBERS['arcane-expedition'];
const overlap = stdMemberList.filter(m => arcMemberList.includes(m));
assert(overlap.length === 0, `No member overlap between parties${overlap.length ? ' — overlap: ' + overlap.join(', ') : ''}`);

// ═══════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════
console.log(`\n${'═'.repeat(50)}`);
console.log(`  ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('  ✓ ALL TESTS PASSED — member decks are structurally valid');
} else {
  console.log('  ✗ SOME TESTS FAILED — review output above');
}
console.log(`${'═'.repeat(50)}`);

// ═══════════════════════════════════════════════════════════════
// DIFF TEST (uncomment when running in project root)
// ═══════════════════════════════════════════════════════════════
//
// Uncomment this section to validate assembled decks match the
// original combined files card-for-card. Requires the original
// files at data/decks/visitor-party-standard.js and
// data/decks/visitor-party-arcane.js.
//
const originalStandard = require('./data/decks/visitor-party-standard');
const originalArcane = require('./data/decks/visitor-party-arcane');

function deepDiffDecks(assembled, original, label) {
  if (assembled.length !== original.length) {
    console.log(`  ✗ ${label}: length mismatch (assembled ${assembled.length} vs original ${original.length})`);
    return false;
  }
  for (let i = 0; i < assembled.length; i++) {
    const a = JSON.stringify(assembled[i]);
    const o = JSON.stringify(original[i]);
    if (a !== o) {
      console.log(`  ✗ ${label} card ${i} differs:`);
      console.log(`    Assembled: ${assembled[i].name} (${assembled[i].member})`);
      console.log(`    Original:  ${original[i].name} (${original[i].member})`);
      // Show first diff
      const aObj = assembled[i], oObj = original[i];
      for (const key of new Set([...Object.keys(aObj), ...Object.keys(oObj)])) {
        if (JSON.stringify(aObj[key]) !== JSON.stringify(oObj[key])) {
          console.log(`    Key "${key}": ${JSON.stringify(aObj[key])} vs ${JSON.stringify(oObj[key])}`);
        }
      }
      return false;
    }
  }
  return true;
}

console.log('\n═══ DIFF: Assembled vs Original ═══');
const stdMatch = deepDiffDecks(standardDeck, originalStandard, 'Standard party');
if (stdMatch) console.log('  ✓ Standard party deck: EXACT MATCH (40 cards)');

const arcMatch = deepDiffDecks(arcaneDeck, originalArcane, 'Arcane expedition');
if (arcMatch) console.log('  ✓ Arcane expedition deck: EXACT MATCH (40 cards)');

process.exit(failed > 0 ? 1 : 0);
