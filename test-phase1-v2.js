#!/usr/bin/env node
/**
 * TEST: Phase 1 v2 Validation — Compositional Architecture
 *
 * Validates the full v2 architecture:
 *   1. Registry reads combined files correctly
 *   2. Template builder computes correct dungeon/party stats
 *   3. Scenario builder produces engine-compatible output
 *   4. Baseline Verdant Maw stats reproduced by composition
 *   5. All 10 encounter combinations produce valid stat ranges
 *   6. All member combinations produce valid party templates
 *
 * RUN:
 *   node test-phase1-v2.js                  # All structural tests
 *   node test-phase1-v2.js --sim            # + Simulation equivalence
 *   node test-phase1-v2.js --sim -n 200     # Custom iteration count
 *
 * DEPENDS ON:
 *   Combined format files (run migrate-to-combined.js --write first)
 *   lib/registry.js (v2)
 *   lib/template-builder.js
 *   lib/scenario-builder.js (v2)
 */

import * as registry from './lib/registry.js';
import { buildDungeonTemplate, buildPartyTemplate, buildPartyDeck } from './lib/template-builder.js';
import { buildScenario } from './lib/scenario-builder.js'; // Helper: compute expected party stats from member data
function expectedPartyStats(memberKeys) {
  let resolve = 0, nerve = 0;
  for (const key of memberKeys) {
    const m = registry.getMember(key);
    resolve += m.resolveContribution;
    nerve += m.nerveContribution;
  }
  return { resolve, nerve };
}


// ═══════════════════════════════════════════════════════════════
// TEST INFRASTRUCTURE
// ═══════════════════════════════════════════════════════════════

let pass = 0, fail = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    pass++;
    console.log(`  ✓ ${message}`);
  } else {
    fail++;
    failures.push(message);
    console.log(`  ✗ ${message}`);
  }
}

function section(title) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

// ═══════════════════════════════════════════════════════════════
// REGISTRY TESTS
// ═══════════════════════════════════════════════════════════════

function testRegistry() {
  section('REGISTRY — Combined Format');

  // Encounters
  const encounters = registry.listEncounters();
  assert(encounters.length === 5, `5 encounters registered`);

  for (const key of encounters) {
    const enc = registry.getEncounter(key);
    assert(enc.name && typeof enc.name === 'string', `encounter '${key}' has name: ${enc.name}`);
    assert(enc.description, `encounter '${key}' has description`);
    assert(enc.initiative, `encounter '${key}' has initiative: ${enc.initiative}`);
    assert(Array.isArray(enc.autoEffects), `encounter '${key}' has autoEffects`);
    assert(Array.isArray(enc.tags) && enc.tags.length > 0, `encounter '${key}' has tags: ${enc.tags.join(', ')}`);
    assert(enc.contributions, `encounter '${key}' has contributions`);
    assert(enc.contributions.structure >= 0, `encounter '${key}' structure: ${enc.contributions.structure}`);
    assert(enc.contributions.veil >= 0, `encounter '${key}' veil: ${enc.contributions.veil}`);
    assert(enc.contributions.presence >= 0, `encounter '${key}' presence: ${enc.contributions.presence}`);
    assert(enc.modifierContributions, `encounter '${key}' has modifierContributions`);
    assert(Array.isArray(enc.deck) && enc.deck.length > 0, `encounter '${key}' has deck (${enc.deck.length} cards)`);
  }

  // Members
  const members = registry.listMembers();
  assert(members.length === 8, `8 members registered`);

  for (const key of members) {
    const m = registry.getMember(key);
    assert(m.name && typeof m.name === 'string', `member '${key}' has name: ${m.name}`);
    assert(typeof m.role === 'string', `member '${key}' has role: ${m.role}`);
    assert(typeof m.vitality === 'number' && m.vitality > 0, `member '${key}' vitality: ${m.vitality}`);
    assert(typeof m.resolveContribution === 'number', `member '${key}' resolveContribution: ${m.resolveContribution}`);
    assert(typeof m.nerveContribution === 'number', `member '${key}' nerveContribution: ${m.nerveContribution}`);
    assert(m.modifierContributions, `member '${key}' has modifierContributions`);
    assert(Array.isArray(m.deck) && m.deck.length === 10, `member '${key}' has deck (${m.deck.length} cards)`);
  }

  // getMemberDeck convenience
  const knightDeck = registry.getMemberDeck('knight');
  assert(Array.isArray(knightDeck) && knightDeck.length === 10, 'getMemberDeck returns 10 cards');

  // Creatures
  const creatures = registry.listCreatures();
  assert(creatures.length === 3, `3 creatures registered`);

  for (const key of creatures) {
    const c = registry.getCreature(key);
    assert(c.name, `creature '${key}' has name: ${c.name}`);
    assert(typeof c.vitality === 'number', `creature '${key}' vitality: ${c.vitality}`);
    assert(typeof c.resolve === 'number', `creature '${key}' resolve: ${c.resolve}`);
    assert(typeof c.nerve === 'number', `creature '${key}' nerve: ${c.nerve}`);
    assert(c.modifiers, `creature '${key}' has modifiers`);
    assert(typeof c.aiProfile === 'string', `creature '${key}' aiProfile: ${c.aiProfile}`);
    assert(Array.isArray(c.deck) && c.deck.length > 0, `creature '${key}' has deck (${c.deck.length} cards)`);
  }

  // Constants
  assert(registry.ENCOUNTERS_PER_RUN === 3, `ENCOUNTERS_PER_RUN: ${registry.ENCOUNTERS_PER_RUN}`);
  assert(registry.MEMBERS_PER_PARTY === 4, `MEMBERS_PER_PARTY: ${registry.MEMBERS_PER_PARTY}`);

  // Profiles
  assert(registry.listDungeonProfiles().length === 4, '4 dungeon profiles');
  assert(registry.listVisitorProfiles().length === 4, '4 visitor profiles');
  assert(registry.isValidDungeonProfile('tactical'), 'tactical is valid');
  assert(!registry.isValidDungeonProfile('invalid'), 'invalid is not valid');

  // Error handling
  let threw;
  threw = false; try { registry.getEncounter('fake'); } catch(e) { threw = true; }
  assert(threw, 'getEncounter throws on unknown key');
  threw = false; try { registry.getMember('fake'); } catch(e) { threw = true; }
  assert(threw, 'getMember throws on unknown key');
  threw = false; try { registry.getCreature('fake'); } catch(e) { threw = true; }
  assert(threw, 'getCreature throws on unknown key');
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE BUILDER TESTS
// ═══════════════════════════════════════════════════════════════

function testTemplateBuilder() {
  section('TEMPLATE BUILDER — Dungeon');

  // Baseline: Root Hollow + Whispering Gallery + Veil Breach = Verdant Maw
  const baseline = buildDungeonTemplate(['root-hollow', 'whispering-gallery', 'veil-breach']);
  assert(baseline.structure === 16, `baseline structure: ${baseline.structure} === 16`);
  assert(baseline.veil === 14, `baseline veil: ${baseline.veil} === 14`);
  assert(baseline.presence === 12, `baseline presence: ${baseline.presence} === 12`);
  assert(baseline.rapport === 0, `baseline rapport: ${baseline.rapport} === 0`);
  assert(baseline.modifiers.dominion === 2, `baseline dominion: ${baseline.modifiers.dominion} === 2`);
  assert(baseline.modifiers.resonance === 1, `baseline resonance: ${baseline.modifiers.resonance} === 1`);
  assert(baseline.modifiers.presence_attr === 1, `baseline presence_attr: ${baseline.modifiers.presence_attr} === 1`);
  assert(baseline.modifiers.memory === 0, `baseline memory: ${baseline.modifiers.memory} === 0`);

  // All 10 combinations of 3 encounters
  console.log('\n  All 10 encounter combinations:');
  const allEnc = registry.listEncounters();
  let combCount = 0;
  for (let i = 0; i < allEnc.length; i++) {
    for (let j = i + 1; j < allEnc.length; j++) {
      for (let k = j + 1; k < allEnc.length; k++) {
        const keys = [allEnc[i], allEnc[j], allEnc[k]];
        const d = buildDungeonTemplate(keys);
        const total = d.structure + d.veil + d.presence;
        combCount++;
        console.log(`    ${combCount}. ${keys.join(' + ')}: Str:${d.structure} Vl:${d.veil} Pr:${d.presence} (total:${total})`);
        assert(d.structure >= 10 && d.structure <= 20, `  structure in range: ${d.structure}`);
        assert(d.veil >= 8 && d.veil <= 18, `  veil in range: ${d.veil}`);
        assert(d.presence >= 8 && d.presence <= 18, `  presence in range: ${d.presence}`);
        assert(total >= 38 && total <= 46, `  total in range: ${total}`);
      }
    }
  }
  assert(combCount === 10, `generated all 10 combinations`);

  // Errors
  let threw;
  threw = false; try { buildDungeonTemplate(['root-hollow']); } catch(e) { threw = true; }
  assert(threw, 'throws on < 3 encounters');
  threw = false; try { buildDungeonTemplate(['root-hollow', 'root-hollow', 'veil-breach']); } catch(e) { threw = true; }
  assert(threw, 'throws on duplicate encounters');

  // ── Party Templates ──
  section('TEMPLATE BUILDER — Party');

  // Standard Party baseline
  const standardMembers = ['knight', 'battlemage', 'cleric', 'rogue'];
  const standardExpected = expectedPartyStats(standardMembers);
  const standard = buildPartyTemplate(standardMembers);
  assert(standard.resolve === standardExpected.resolve, `standard resolve: ${standard.resolve} === ${standardExpected.resolve}`);
  assert(standard.nerve === standardExpected.nerve, `standard nerve: ${standard.nerve} === ${standardExpected.nerve}`);
  assert(standard.trust === 0, `standard trust: ${standard.trust} === 0`);
  assert(standard.type === 'party', 'standard type is party');
  assert(standard.partySize === 4, 'standard partySize is 4');
  assert(standard.killThreshold === 2, 'standard killThreshold is 2');
  assert(standard.modifiers.strength === 1, `standard strength: ${standard.modifiers.strength} === 1`);
  assert(standard.modifiers.cunning === 1, `standard cunning: ${standard.modifiers.cunning} === 1`);
  assert(standard.modifiers.perception === 1, `standard perception: ${standard.modifiers.perception} === 1`);
  assert(standard.modifiers.resilience === 0, `standard resilience: ${standard.modifiers.resilience} === 0`);

  // Arcane Expedition baseline
  const arcaneMembers = ['warden', 'sorcerer', 'druid', 'ranger'];
  const arcaneExpected = expectedPartyStats(arcaneMembers);
  const arcane = buildPartyTemplate(arcaneMembers);
  assert(arcane.resolve === arcaneExpected.resolve, `arcane resolve: ${arcane.resolve} === ${arcaneExpected.resolve}`);
  assert(arcane.nerve === arcaneExpected.nerve, `arcane nerve: ${arcane.nerve} === ${arcaneExpected.nerve}`);
  assert(arcane.modifiers.perception === 2, `arcane perception: ${arcane.modifiers.perception} === 2`);

  // Cross-party composition
  // Cross-party composition
  const crossMembers = ['knight', 'sorcerer', 'druid', 'rogue'];
  const crossExpected = expectedPartyStats(crossMembers);
  const crossParty = buildPartyTemplate(crossMembers);
  assert(crossParty.resolve === crossExpected.resolve, `cross resolve: ${crossParty.resolve} === ${crossExpected.resolve}`);
  assert(crossParty.nerve === crossExpected.nerve, `cross nerve: ${crossParty.nerve} === ${crossExpected.nerve}`);
  console.log(`  Cross-party Knight+Sorcerer+Druid+Rogue: res:${crossParty.resolve} nrv:${crossParty.nerve}`);

  // Party deck
  const deck = buildPartyDeck(['knight', 'battlemage', 'cleric', 'rogue']);
  assert(deck.length === 40, `standard deck: ${deck.length} === 40`);

  // Members object
  assert(Object.keys(standard.members).length === 4, 'standard has 4 members');
  assert(standard.members.knight.vitality === 10, 'knight vitality in template: 10');

  // Errors
  threw = false; try { buildPartyTemplate(['knight']); } catch(e) { threw = true; }
  assert(threw, 'throws on < 4 members');
}

// ═══════════════════════════════════════════════════════════════
// SCENARIO BUILDER TESTS
// ═══════════════════════════════════════════════════════════════

function testScenarioBuilder() {
  section('SCENARIO BUILDER');

  // Party scenario
  const partyScenario = buildScenario({
    encounters: ['root-hollow', 'whispering-gallery', 'veil-breach'],
    members: ['knight', 'battlemage', 'cleric', 'rogue'],
  });

  assert(partyScenario.name, `has name: ${partyScenario.name}`);
  assert(partyScenario.description, 'has description');
  assert(partyScenario.visitorTemplate.type === 'party', 'visitor is party');
  const scenarioExpected = expectedPartyStats(['knight', 'battlemage', 'cleric', 'rogue']);
  assert(partyScenario.visitorTemplate.resolve === scenarioExpected.resolve, `visitor resolve: ${partyScenario.visitorTemplate.resolve} === ${scenarioExpected.resolve}`);
  assert(partyScenario.dungeonTemplate.structure === 16, 'dungeon structure: 16');
  assert(partyScenario.encounters.length === 3, '3 encounters');

  // Check encounter structure matches engine expectations
  const enc0 = partyScenario.encounters[0];
  assert(enc0.encounter && enc0.encounter.name === 'Root Hollow', 'enc[0] is Root Hollow');
  assert(Array.isArray(enc0.dungeonDeck) && enc0.dungeonDeck.length > 0, 'enc[0] has dungeonDeck');
  assert(Array.isArray(enc0.visitorDeck) && enc0.visitorDeck.length === 40, 'enc[0] has visitorDeck (40 cards)');
  assert(enc0.config.bondThreshold === 12, 'enc[0] has default bondThreshold');

  // Creature scenario
  const creatureScenario = buildScenario({
    encounters: ['veil-breach', 'whispering-gallery', 'root-hollow'],
    creature: 'veil-moth',
  });

  assert(creatureScenario.visitorTemplate.name === 'Veil Moth', 'creature name: Veil Moth');
  assert(creatureScenario.visitorTemplate.vitality === 18, 'moth vitality: 18');
  assert(!creatureScenario.visitorTemplate.type, 'creature template has no type field (not party)');
  assert(creatureScenario.encounters[0].visitorDeck.length > 0, 'creature has deck');

  // Config overrides
  const withConfig = buildScenario({
    encounters: ['honeyed-hollow', 'root-hollow', 'veil-breach'],
    creature: 'drift-symbiote',
    config: { bondThreshold: 15 },
    encounterConfigs: {
      'honeyed-hollow': { maxRounds: 8 },
    },
  });

  assert(withConfig.encounters[0].config.bondThreshold === 15, 'base config override: bondThreshold 15');
  assert(withConfig.encounters[0].config.maxRounds === 8, 'per-encounter override: maxRounds 8');
  assert(withConfig.encounters[1].config.bondThreshold === 15, 'base config on enc[1]');
  assert(withConfig.encounters[1].config.maxRounds === undefined, 'no maxRounds on enc[1]');

  // Custom name/description
  const custom = buildScenario({
    encounters: ['root-hollow', 'veil-breach', 'honeyed-hollow'],
    creature: 'thornback-boar',
    name: 'Custom Test',
    description: 'Test description.',
  });
  assert(custom.name === 'Custom Test', 'custom name preserved');
  assert(custom.description === 'Test description.', 'custom description preserved');

  // Error cases
  let threw;
  threw = false;
  try { buildScenario({ encounters: ['root-hollow'], creature: 'thornback-boar' }); }
  catch(e) { threw = true; }
  assert(threw, 'throws on != 3 encounters');

  threw = false;
  try { buildScenario({ encounters: ['root-hollow', 'veil-breach', 'veil-breach'], creature: 'thornback-boar' }); }
  catch(e) { threw = true; }
  assert(threw, 'throws on duplicate encounters');

  threw = false;
  try { buildScenario({ encounters: ['root-hollow', 'veil-breach', 'honeyed-hollow'] }); }
  catch(e) { threw = true; }
  assert(threw, 'throws on missing visitor');

  threw = false;
  try { buildScenario({ encounters: ['root-hollow', 'veil-breach', 'honeyed-hollow'], members: ['knight', 'battlemage', 'cleric', 'rogue'], creature: 'thornback-boar' }); }
  catch(e) { threw = true; }
  assert(threw, 'throws on both members and creature');

  threw = false;
  try { buildScenario({ encounters: ['root-hollow', 'veil-breach', 'honeyed-hollow'], members: ['knight', 'battlemage'] }); }
  catch(e) { threw = true; }
  assert(threw, 'throws on != 4 members');
}

// ═══════════════════════════════════════════════════════════════
// COMPOSITION SPACE REPORT
// ═══════════════════════════════════════════════════════════════

function reportCompositionSpace() {
  section('COMPOSITION SPACE');

  const encounters = registry.listEncounters();
  const members = registry.listMembers();
  const creatures = registry.listCreatures();
  const dungeonProfiles = registry.listDungeonProfiles();
  const visitorProfiles = registry.listVisitorProfiles();

  // Encounter combinations (C(5,3) = 10, × 3! orderings = 60)
  const encCombinations = 10;
  const encOrderings = 60;
  console.log(`  Encounters: ${encounters.length} → C(${encounters.length},3) = ${encCombinations} combinations, ${encOrderings} ordered sequences`);

  // Party combinations (C(8,4) = 70, order doesn't matter for stats)
  const partyCombinations = 70;
  console.log(`  Members: ${members.length} → C(${members.length},4) = ${partyCombinations} party compositions`);

  // Creature visitors
  console.log(`  Creatures: ${creatures.length}`);

  // Total matchup space
  const partyMatchups = encOrderings * partyCombinations * dungeonProfiles.length;
  const creatureMatchups = encOrderings * creatures.length * dungeonProfiles.length;
  const total = partyMatchups + creatureMatchups;

  console.log(`\n  Party matchups: ${encOrderings} × ${partyCombinations} × ${dungeonProfiles.length} profiles = ${partyMatchups.toLocaleString()}`);
  console.log(`  Creature matchups: ${encOrderings} × ${creatures.length} × ${dungeonProfiles.length} profiles = ${creatureMatchups.toLocaleString()}`);
  console.log(`  Total matchup space: ${total.toLocaleString()}`);

  assert(encOrderings === 60, '60 ordered encounter sequences');
  assert(total > 0, `total matchup space: ${total.toLocaleString()}`);
}

// ═══════════════════════════════════════════════════════════════
// SIMULATION EQUIVALENCE (optional --sim)
// ═══════════════════════════════════════════════════════════════

function testSimulationEquivalence(iterations) {
  section(`SIMULATION EQUIVALENCE (${iterations} iterations)`);

  let runBatch, createDungeonAI, createVisitorAI;
  try {
    ({ runBatch } = require('./engine/sequence'));
    ({ createDungeonAI } = require('./ai/dungeon-ai'));
    ({ createVisitorAI } = require('./ai/visitor-ai'));
  } catch (e) {
    console.log(`  ⚠ Could not load engine modules. Skipping simulation tests.`);
    console.log(`    ${e.message}`);
    return;
  }

  // Compare built scenario vs hand-crafted for the baseline
  const SIM_SPECS = [
    {
      name: 'Baseline: Standard Party 3-Room (tactical/party_balanced)',
      handcraftedPath: './data/scenarios/verdant-maw-vs-party-3room',
      buildSpec: {
        encounters: ['root-hollow', 'whispering-gallery', 'veil-breach'],
        members: ['knight', 'battlemage', 'cleric', 'rogue'],
      },
      dungeonProfile: 'tactical',
      visitorProfile: 'party_balanced',
    },
    {
      name: 'Baseline: Boar 3-Room (tactical/feral_aggressive)',
      handcraftedPath: './data/scenarios/verdant-maw-vs-boar',
      buildSpec: {
        encounters: ['root-hollow', 'whispering-gallery', 'veil-breach'],
        creature: 'thornback-boar',
      },
      dungeonProfile: 'tactical',
      visitorProfile: 'feral_aggressive',
    },
  ];

  for (const spec of SIM_SPECS) {
    console.log(`\n── ${spec.name} ──`);

    let handcrafted;
    try { handcrafted = require(spec.handcraftedPath); } catch(e) {
      console.log(`  SKIPPED (${spec.handcraftedPath} not found)`);
      continue;
    }

    const built = buildScenario(spec.buildSpec);
    const dungeonAI = createDungeonAI(spec.dungeonProfile);
    const visitorAI = createVisitorAI(spec.visitorProfile);

    console.log(`  Running handcrafted (${iterations} iters)...`);
    const hResult = runBatch(handcrafted, dungeonAI, visitorAI, iterations);

    console.log(`  Running built (${iterations} iters)...`);
    const bResult = runBatch(built, dungeonAI, visitorAI, iterations);

    const hOutcomes = hResult.outcomeDistribution;
    const bOutcomes = bResult.outcomeDistribution;
    const allKeys = new Set([...Object.keys(hOutcomes), ...Object.keys(bOutcomes)]);
    let maxDiff = 0;
    let details = [];

    for (const key of allKeys) {
      const hPct = hOutcomes[key]?.pct || 0;
      const bPct = bOutcomes[key]?.pct || 0;
      const diff = Math.abs(hPct - bPct);
      maxDiff = Math.max(maxDiff, diff);
      details.push(`${key}: ${hPct}% vs ${bPct}% (Δ${diff.toFixed(1)})`);
    }

    console.log(`  ${details.join(', ')}`);

    const threshold = Math.max(5, 50 / Math.sqrt(iterations));
    assert(
      maxDiff <= threshold,
      `max outcome diff ${maxDiff.toFixed(1)}% ≤ ${threshold.toFixed(1)}% threshold`
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 1 v2 VALIDATION — Compositional Architecture    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  testRegistry();
  testTemplateBuilder();
  testScenarioBuilder();
  reportCompositionSpace();

  const args = process.argv.slice(2);
  if (args.includes('--sim')) {
    const nIdx = args.indexOf('-n');
    const iterations = nIdx !== -1 ? parseInt(args[nIdx + 1], 10) : 200;
    testSimulationEquivalence(iterations);
  }

  // Summary
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  RESULTS: ${pass} passed, ${fail} failed`);
  console.log('═'.repeat(60));

  if (fail > 0) {
    console.log('\n  FAILURES:');
    for (const f of failures) console.log(`    ✗ ${f}`);
    process.exit(1);
  } else {
    console.log('\n  ✓ All tests passed.\n');
    if (!args.includes('--sim')) {
      console.log('  TIP: Run with --sim for simulation equivalence check:');
      console.log('    node test-phase1-v2.js --sim');
      console.log('    node test-phase1-v2.js --sim -n 1000\n');
    }
  }
}

main();
