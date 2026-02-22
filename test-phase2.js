#!/usr/bin/env node
/**
 * TEST: Phase 2 Validation — Composition Generator + Matrix Runner
 *
 * Structural tests (no engine required):
 *   - Combination/permutation math
 *   - Matchup enumeration correctness
 *   - Random sampling coverage
 *   - Targeted probe filtering
 *   - Result flattening
 *
 * Integration test (requires engine, --sim flag):
 *   - Run a small sample through the full pipeline
 *   - Verify report generation
 *
 * RUN:
 *   node test-phase2.js                # Structural only
 *   node test-phase2.js --sim          # + Integration (runs ~10 matchups)
 */

import * as gen from './lib/composition-generator.js';
let pass = 0, fail = 0;
const failures = [];

function assert(condition, message) {
  if (condition) { pass++; console.log(`  ✓ ${message}`); }
  else { fail++; failures.push(message); console.log(`  ✗ ${message}`); }
}

function section(title) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

// ═══════════════════════════════════════════════════════════════
// COMBINATION UTILITIES
// ═══════════════════════════════════════════════════════════════

function testCombinations() {
  section('COMBINATION UTILITIES');

  // C(5,3) = 10
  const c53 = gen.combinations([1,2,3,4,5], 3);
  assert(c53.length === 10, `C(5,3) = ${c53.length} === 10`);

  // C(8,4) = 70
  const c84 = gen.combinations([1,2,3,4,5,6,7,8], 4);
  assert(c84.length === 70, `C(8,4) = ${c84.length} === 70`);

  // C(5,0) = 1
  const c50 = gen.combinations([1,2,3,4,5], 0);
  assert(c50.length === 1, `C(5,0) = ${c50.length} === 1`);

  // C(3,5) = 0
  const c35 = gen.combinations([1,2,3], 5);
  assert(c35.length === 0, `C(3,5) = ${c35.length} === 0`);

  // Permutations of 3 elements = 6
  const p3 = gen.permutations([1,2,3]);
  assert(p3.length === 6, `P(3) = ${p3.length} === 6`);

  // All permutations are unique
  const pStrings = p3.map(p => p.join(','));
  const pUnique = new Set(pStrings);
  assert(pUnique.size === 6, `all permutations unique: ${pUnique.size} === 6`);
}

// ═══════════════════════════════════════════════════════════════
// SPACE ENUMERATION
// ═══════════════════════════════════════════════════════════════

function testEnumeration() {
  section('SPACE ENUMERATION');

  // Encounter combinations
  const encCombos = gen.encounterCombinations();
  assert(encCombos.length === 10, `encounter combinations: ${encCombos.length} === 10`);

  // Each combo has exactly 3 encounters
  assert(encCombos.every(c => c.length === 3), 'all combos have 3 encounters');

  // No duplicates within combos
  assert(encCombos.every(c => new Set(c).size === 3), 'no duplicates within combos');

  // Encounter sequences (ordered)
  const encSeqs = gen.encounterSequences();
  assert(encSeqs.length === 60, `encounter sequences: ${encSeqs.length} === 60`);

  // Each sequence has exactly 3 encounters
  assert(encSeqs.every(s => s.length === 3), 'all sequences have 3 encounters');

  // All sequences are unique
  const seqStrings = encSeqs.map(s => s.join(','));
  assert(new Set(seqStrings).size === 60, 'all sequences unique');

  // Party combinations
  const parties = gen.partyCombinations();
  assert(parties.length === 70, `party combinations: ${parties.length} === 70`);

  // Each party has exactly 4 members
  assert(parties.every(p => p.length === 4), 'all parties have 4 members');

  // No duplicates within parties
  assert(parties.every(p => new Set(p).size === 4), 'no duplicates within parties');

  // Space stats
  const stats = gen.spaceStats();
  assert(stats.encounterCombinations === 10, `stats: 10 encounter combos`);
  assert(stats.encounterSequences === 60, `stats: 60 encounter sequences`);
  assert(stats.partyCombinations === 70, `stats: 70 party combos`);
  assert(stats.totalMatchups === 17520, `stats: ${stats.totalMatchups} total matchups`);
  console.log(`  Space: ${stats.totalMatchups.toLocaleString()} total (${stats.partyMatchups.toLocaleString()} party + ${stats.creatureMatchups.toLocaleString()} creature)`);
}

// ═══════════════════════════════════════════════════════════════
// FULL ENUMERATION
// ═══════════════════════════════════════════════════════════════

function testFullEnumeration() {
  section('FULL ENUMERATION');

  // Ordered sequences (default)
  const allOrdered = gen.enumerateAll({ orderedEncounters: true });
  assert(allOrdered.length === 17520, `full ordered: ${allOrdered.length} === 17520`);

  // All have valid structure
  const sampleOrdered = allOrdered.slice(0, 100);
  assert(sampleOrdered.every(m => m.encounters.length === 3), 'all have 3 encounters');
  assert(sampleOrdered.every(m => m.members || m.creature), 'all have visitor');
  assert(sampleOrdered.every(m => m.dungeonProfile), 'all have dungeon profile');
  assert(sampleOrdered.every(m => m.visitorProfile), 'all have visitor profile');
  assert(sampleOrdered.every(m => m.id), 'all have id');

  // All IDs unique
  const allIds = new Set(allOrdered.map(m => m.id));
  assert(allIds.size === allOrdered.length, `all IDs unique: ${allIds.size} === ${allOrdered.length}`);

  // Combination mode (unordered)
  const allCombos = gen.enumerateAll({ orderedEncounters: false });
  const expectedCombos = 10 * (70 + 3) * 4; // 10 combos × (70 parties + 3 creatures) × 4 profiles
  assert(allCombos.length === expectedCombos, `full combos: ${allCombos.length} === ${expectedCombos}`);

  // Count party vs creature
  const partyCount = allOrdered.filter(m => m.members).length;
  const creatureCount = allOrdered.filter(m => m.creature).length;
  assert(partyCount === 60 * 70 * 4, `party matchups: ${partyCount} === ${60 * 70 * 4}`);
  assert(creatureCount === 60 * 3 * 4, `creature matchups: ${creatureCount} === ${60 * 3 * 4}`);
}

// ═══════════════════════════════════════════════════════════════
// RANDOM SAMPLING
// ═══════════════════════════════════════════════════════════════

function testRandomSampling() {
  section('RANDOM SAMPLING');

  // Basic sample
  const sample20 = gen.randomSample(20);
  assert(sample20.length === 20, `sample(20): ${sample20.length} === 20`);

  // All unique
  const ids = new Set(sample20.map(m => m.id));
  assert(ids.size === 20, `all unique: ${ids.size} === 20`);

  // Structure valid
  assert(sample20.every(m => m.encounters.length === 3), 'all have 3 encounters');
  assert(sample20.every(m => m.members || m.creature), 'all have visitor');

  // Parties only
  const partySample = gen.randomSample(15, { partiesOnly: true });
  assert(partySample.every(m => m.members), `parties only: all have members`);
  assert(partySample.length === 15, `parties only: ${partySample.length} === 15`);

  // Creatures only
  const creatureSample = gen.randomSample(10, { creaturesOnly: true });
  assert(creatureSample.every(m => m.creature), `creatures only: all have creature`);
  assert(creatureSample.length === 10, `creatures only: ${creatureSample.length} === 10`);

  // Fixed dungeon profile
  const fixedDP = gen.randomSample(10, { dungeonProfile: 'aggressive' });
  assert(fixedDP.every(m => m.dungeonProfile === 'aggressive'), 'fixed dungeon profile');

  // Large sample doesn't exceed space
  const large = gen.randomSample(1000);
  assert(large.length <= 17520, `large sample capped: ${large.length} ≤ 17520`);
  assert(large.length === 1000, `large sample: ${large.length} === 1000`);

  // Coverage: sample should contain mix of party and creature
  const hasParty = sample20.some(m => m.members);
  const hasCreature = sample20.some(m => m.creature);
  // These are probabilistic, not guaranteed, so just log
  console.log(`  Coverage: ${hasParty ? '✓' : '✗'} parties, ${hasCreature ? '✓' : '✗'} creatures in sample of 20`);
}

// ═══════════════════════════════════════════════════════════════
// TARGETED PROBING
// ═══════════════════════════════════════════════════════════════

function testTargetedProbe() {
  section('TARGETED PROBING');

  // Probe specific encounter sequence
  const encProbe = gen.targetedProbe({
    encounters: ['root-hollow', 'whispering-gallery', 'veil-breach'],
  });
  assert(encProbe.length === (70 + 3) * 4, `fixed encounter seq: ${encProbe.length} === ${(70+3)*4}`);
  assert(encProbe.every(m => m.encounters.join(',') === 'root-hollow,whispering-gallery,veil-breach'),
    'all have correct encounter sequence');

  // Probe required encounter
  const reqEnc = gen.targetedProbe({ requiredEncounter: 'honeyed-hollow' });
  assert(reqEnc.every(m => m.encounters.includes('honeyed-hollow')),
    'all contain honeyed-hollow');
  // 6 combos contain honeyed-hollow, each has 6 orderings = 36 sequences
  // × (70 parties + 3 creatures) × 4 profiles
  console.log(`  required encounter 'honeyed-hollow': ${reqEnc.length} matchups`);
  assert(reqEnc.length > 0, 'required encounter returns results');

  // Probe required member
  const reqMem = gen.targetedProbe({ requiredMember: 'knight' });
  assert(reqMem.every(m => m.members && m.members.includes('knight')),
    'all contain knight');
  // C(7,3) = 35 parties contain knight × 60 sequences × 4 profiles
  const expectedKnight = 35 * 60 * 4;
  assert(reqMem.length === expectedKnight, `required member 'knight': ${reqMem.length} === ${expectedKnight}`);

  // Probe creature
  const creProbe = gen.targetedProbe({ creature: 'veil-moth' });
  assert(creProbe.every(m => m.creature === 'veil-moth'), 'all are veil-moth');
  assert(creProbe.length === 60 * 4, `creature probe: ${creProbe.length} === ${60 * 4}`);

  // Probe dungeon profile
  const dpProbe = gen.targetedProbe({ dungeonProfile: 'nurturing' });
  assert(dpProbe.every(m => m.dungeonProfile === 'nurturing'), 'all nurturing');
  assert(dpProbe.length === 60 * (70 + 3), `dungeon profile: ${dpProbe.length} === ${60 * 73}`);

  // Combo mode (unordered)
  const comboProbe = gen.targetedProbe({
    requiredEncounter: 'root-hollow',
    orderedEncounters: false,
  });
  console.log(`  combo probe (root-hollow, unordered): ${comboProbe.length} matchups`);
  assert(comboProbe.length > 0, 'combo probe returns results');
  assert(comboProbe.length < reqEnc.length, 'combo mode produces fewer than ordered mode');

  // Combined filters
  const combined = gen.targetedProbe({
    requiredMember: 'knight',
    dungeonProfile: 'tactical',
    orderedEncounters: false,
  });
  assert(combined.every(m => m.members.includes('knight')), 'combined: all have knight');
  assert(combined.every(m => m.dungeonProfile === 'tactical'), 'combined: all tactical');
  console.log(`  combined (knight + tactical + combos): ${combined.length} matchups`);
}

// ═══════════════════════════════════════════════════════════════
// MATCHUP ID
// ═══════════════════════════════════════════════════════════════

function testMatchupId() {
  section('MATCHUP ID');

  // Order matters for encounters
  const id1 = gen.matchupId(['a', 'b', 'c'], ['x', 'y'], 'tactical');
  const id2 = gen.matchupId(['c', 'b', 'a'], ['x', 'y'], 'tactical');
  assert(id1 !== id2, 'different encounter order → different ID');

  // Order does NOT matter for members (sorted in ID)
  const id3 = gen.matchupId(['a', 'b', 'c'], ['y', 'x'], 'tactical');
  assert(id1 === id3, 'different member order → same ID (sorted)');

  // Different profile → different ID
  const id4 = gen.matchupId(['a', 'b', 'c'], ['x', 'y'], 'aggressive');
  assert(id1 !== id4, 'different profile → different ID');

  // Creature string
  const id5 = gen.matchupId(['a', 'b', 'c'], 'thornback-boar', 'tactical');
  assert(id5.includes('thornback-boar'), 'creature key in ID');
}

// ═══════════════════════════════════════════════════════════════
// INTEGRATION TEST (--sim)
// ═══════════════════════════════════════════════════════════════

function testIntegration() {
  section('INTEGRATION — Full Pipeline');

  let matrixRunner, matrixReport;
  try {
    matrixRunner = require('./lib/matrix-runner');
    matrixReport = require('./lib/matrix-report');
  } catch (e) {
    console.log(`  ⚠ Could not load runner/report modules: ${e.message}`);
    return;
  }

  // Run 10 random matchups at 50 iterations
  const matchups = gen.randomSample(10);
  console.log(`  Running ${matchups.length} matchups × 50 iterations...`);

  const startTime = Date.now();
  const matrixResult = matrixRunner.runMatrix(matchups, {
    iterations: 50,
    onProgress: (i, total) => {
      process.stdout.write(`\r  ${i}/${total}...`);
    },
  });
  process.stdout.write('\r' + ' '.repeat(40) + '\r');
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`  Completed in ${elapsed}s`);

  // Validate results
  assert(matrixResult.results.length === 10, `10 results: ${matrixResult.results.length}`);
  assert(matrixResult.errors.length === 0, `0 errors: ${matrixResult.errors.length}`);
  assert(matrixResult.meta.matchupsRun === 10, `meta: 10 matchups run`);
  assert(matrixResult.meta.iterations === 50, `meta: 50 iterations`);

  // Validate result structure
  const r0 = matrixResult.results[0];
  assert(r0.matchup && r0.summary && r0.elapsedMs > 0, 'result has matchup, summary, elapsed');
  assert(r0.summary.outcomeDistribution, 'summary has outcomeDistribution');
  assert(r0.summary.qualityMetrics, 'summary has qualityMetrics');

  // Flatten
  const flat = matrixRunner.flattenAll(matrixResult);
  assert(flat.length === 10, `flattened: ${flat.length} rows`);
  assert(flat[0].id, 'flat row has id');
  assert(flat[0].encounters, 'flat row has encounters');
  assert(typeof flat[0].dungeonWinRate === 'number', 'flat row has dungeonWinRate');
  assert(flat[0].agency !== undefined, 'flat row has agency');

  // Analyze
  const analysis = matrixReport.analyze(matrixResult);
  assert(analysis.summary.matchups === 10, `analysis: 10 matchups`);
  assert(analysis.rows.length === 10, `analysis: 10 rows`);
  assert(Array.isArray(analysis.anomalies), 'analysis has anomalies array');
  assert(analysis.breakdowns, 'analysis has breakdowns');

  // Print report (visual check)
  matrixReport.printReport(analysis);

  // JSON export
  const json = matrixReport.toJSON(analysis);
  assert(json.summary && json.rows && json.anomalies, 'JSON export has all sections');
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  PHASE 2 VALIDATION — Composition Generator             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  testCombinations();
  testEnumeration();
  testFullEnumeration();
  testRandomSampling();
  testTargetedProbe();
  testMatchupId();

  const args = process.argv.slice(2);
  if (args.includes('--sim')) {
    testIntegration();
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
      console.log('  TIP: Run with --sim for integration test:');
      console.log('    node test-phase2.js --sim\n');
    }
  }
}

main();
