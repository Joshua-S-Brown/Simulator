#!/usr/bin/env node
/**
 * SHATTERED DUNGEON — Composition Matrix Runner
 *
 * Usage:
 *   node run-matrix.js                          # 20 random matchups, 100 iterations
 *   node run-matrix.js -n 200 --sample 50       # 50 random, 200 iterations each
 *   node run-matrix.js --all -n 50              # Full 17,520 matchups (SLOW)
 *   node run-matrix.js --all --combos -n 100    # 10 combo × visitors × profiles (not ordered)
 *   node run-matrix.js --probe-encounter root-hollow -n 200
 *   node run-matrix.js --probe-member knight -n 200
 *   node run-matrix.js --probe-creature thornback-boar -n 200
 *   node run-matrix.js --probe-dungeon tactical -n 200
 *   node run-matrix.js --parties-only --sample 30
 *   node run-matrix.js --creatures-only --sample 30
 *   node run-matrix.js --json                   # Save full results to output/
 *   node run-matrix.js --help
 */

import * as gen from './lib/composition-generator.js';
import * as runner from './lib/matrix-runner.js';
import * as report from './lib/matrix-report.js';
import fs from 'fs';
import path from 'path'; // ═══════════════════════════════════════════════════════════════

import { fileURLToPath, pathToFileURL } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// CLI PARSING
// ═══════════════════════════════════════════════════════════════

function parseArgs(argv) {
  const args = {
    iterations: 100,
    sample: 20,
    all: false,
    combos: false,      // Use combinations instead of ordered sequences
    json: false,
    help: false,

    // Targeted probe filters
    probeEncounter: null,
    probeMember: null,
    probeCreature: null,
    probeDungeon: null,
    probeEncounterSeq: null, // Comma-separated encounter sequence

    // Visitor type filters
    partiesOnly: false,
    creaturesOnly: false,
  };

  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '-n': case '--iterations':
        args.iterations = parseInt(argv[++i]) || 100; break;
      case '--sample':
        args.sample = parseInt(argv[++i]) || 20; break;
      case '--all':
        args.all = true; break;
      case '--combos':
        args.combos = true; break;
      case '--json':
        args.json = true; break;
      case '--parties-only':
        args.partiesOnly = true; break;
      case '--creatures-only':
        args.creaturesOnly = true; break;
      case '--probe-encounter':
        args.probeEncounter = argv[++i]; break;
      case '--probe-member':
        args.probeMember = argv[++i]; break;
      case '--probe-creature':
        args.probeCreature = argv[++i]; break;
      case '--probe-dungeon':
        args.probeDungeon = argv[++i]; break;
      case '--probe-encounters':
        args.probeEncounterSeq = argv[++i]; break;
      case '-h': case '--help':
        args.help = true; break;
    }
  }
  return args;
}

function printHelp() {
  const stats = gen.spaceStats();
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  SHATTERED DUNGEON — Composition Matrix Runner          ║
╚══════════════════════════════════════════════════════════╝

Composition Space:
  ${stats.encounters} encounters → ${stats.encounterCombinations} combinations, ${stats.encounterSequences} ordered sequences
  ${stats.members} members → ${stats.partyCombinations} party compositions
  ${stats.creatures} creatures
  ${stats.totalMatchups.toLocaleString()} total matchups (${stats.partyMatchups.toLocaleString()} party + ${stats.creatureMatchups.toLocaleString()} creature)

Usage:  node run-matrix.js [options]

Modes:
  (default)                     Random sample (--sample N matchups)
  --all                         Full enumeration (${stats.totalMatchups.toLocaleString()} matchups — SLOW)
  --all --combos                Combinations only (no ordering permutations)
  --probe-encounter <key>       All matchups containing this encounter
  --probe-member <key>          All party matchups containing this member
  --probe-creature <key>        All matchups with this creature
  --probe-dungeon <profile>     All matchups with this dungeon AI profile
  --probe-encounters <a,b,c>    All matchups with this exact encounter sequence

Options:
  -n, --iterations <N>    Iterations per matchup (default: 100)
  --sample <N>            Sample size for random mode (default: 20)
  --parties-only          Only sample/enumerate party matchups
  --creatures-only        Only sample/enumerate creature matchups
  --json                  Save full results to output/matrix-*.json
  -h, --help              Show this help

Examples:
  node run-matrix.js                              # Quick 20-matchup sample
  node run-matrix.js --sample 100 -n 200          # 100 matchups, 200 iters each
  node run-matrix.js --probe-member knight -n 200  # All matchups with Knight
  node run-matrix.js --probe-dungeon tactical      # All tactical dungeon matchups
  node run-matrix.js --all --combos -n 50          # Full combos (not permutations)
`);
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) { printHelp(); return; }

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  SHATTERED DUNGEON — Composition Matrix                 ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  // ── Generate matchups ──
  let matchups;
  let mode;

  if (args.probeEncounterSeq) {
    const encounters = args.probeEncounterSeq.split(',');
    matchups = gen.targetedProbe({ encounters });
    mode = `Targeted: encounters [${encounters.join(' → ')}]`;
  } else if (args.probeEncounter) {
    matchups = gen.targetedProbe({
      requiredEncounter: args.probeEncounter,
      orderedEncounters: !args.combos,
    });
    mode = `Targeted: encounters containing ${args.probeEncounter}`;
  } else if (args.probeMember) {
    matchups = gen.targetedProbe({
      requiredMember: args.probeMember,
      orderedEncounters: !args.combos,
    });
    mode = `Targeted: parties containing ${args.probeMember}`;
  } else if (args.probeCreature) {
    matchups = gen.targetedProbe({
      creature: args.probeCreature,
      orderedEncounters: !args.combos,
    });
    mode = `Targeted: creature ${args.probeCreature}`;
  } else if (args.probeDungeon) {
    matchups = gen.targetedProbe({
      dungeonProfile: args.probeDungeon,
      orderedEncounters: !args.combos,
    });
    mode = `Targeted: dungeon profile ${args.probeDungeon}`;
  } else if (args.all) {
    matchups = gen.enumerateAll({ orderedEncounters: !args.combos });
    mode = `Full enumeration (${args.combos ? 'combinations' : 'ordered'})`;
  } else {
    matchups = gen.randomSample(args.sample, {
      partiesOnly: args.partiesOnly,
      creaturesOnly: args.creaturesOnly,
    });
    mode = `Random sample`;
  }

  // Apply visitor type filters for non-random modes
  if (args.partiesOnly) {
    matchups = matchups.filter(m => m.members);
  } else if (args.creaturesOnly) {
    matchups = matchups.filter(m => m.creature);
  }

  console.log(`\n  Mode: ${mode}`);
  console.log(`  Matchups: ${matchups.length}`);
  console.log(`  Iterations per matchup: ${args.iterations}`);

  const totalSims = matchups.length * args.iterations;
  console.log(`  Total simulations: ${totalSims.toLocaleString()}`);

  if (matchups.length === 0) {
    console.log('\n  No matchups to run. Check your filters.');
    return;
  }

  // Warn on large runs
  if (totalSims > 100000) {
    const estMinutes = (totalSims / 5000).toFixed(0); // rough: ~5000 sims/sec
    console.log(`  ⚠ Estimated time: ~${estMinutes} minutes`);
  }

  // ── Run ──
  console.log(`\n  Running...`);
  const matrixResult = runner.runMatrix(matchups, {
    iterations: args.iterations,
    onProgress: (i, total, matchup, elapsed) => {
      const pct = ((i / total) * 100).toFixed(0);
      const eta = i > 0 ? ((elapsed / i) * (total - i)).toFixed(0) : '?';
      process.stdout.write(`\r  ${i}/${total} (${pct}%) — ${elapsed}s elapsed, ~${eta}s remaining   `);
    },
  });
  process.stdout.write('\r' + ' '.repeat(80) + '\r');
  console.log(`  ✓ Complete: ${matrixResult.meta.matchupsRun} matchups in ${matrixResult.meta.totalElapsedSec}s`);
  console.log(`  Avg: ${matrixResult.meta.avgMsPerMatchup}ms per matchup`);

  // ── Analyze + Report ──
  const analysis = report.analyze(matrixResult);
  report.printReport(analysis);

  // ── JSON output ──
  if (args.json) {
    const outDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filepath = path.join(outDir, `matrix-${timestamp}.json`);
    fs.writeFileSync(filepath, JSON.stringify(report.toJSON(analysis), null, 2));
    console.log(`\n  JSON saved: ${filepath}`);
  }
}

main();
