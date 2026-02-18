#!/usr/bin/env node
/**
 * SHATTERED DUNGEON — Simulation Runner
 * 
 * Usage:
 *   node run.js                           # defaults: 1000 iterations, tactical/feral_aggressive
 *   node run.js -n 5000                   # 5000 iterations
 *   node run.js -d aggressive -v cautious_explorer  # specific AI profiles
 *   node run.js --verbose                 # single run with full log
 *   node run.js --csv                     # output CSV to output/
 *   node run.js --json                    # output JSON to output/
 *   node run.js --help
 */

const { runBatch, runSequence } = require('./engine/sequence');
const { createDungeonAI, PROFILES: D_PROFILES } = require('./ai/dungeon-ai');
const { createVisitorAI, PROFILES: V_PROFILES } = require('./ai/visitor-ai');
const { createSmartAI, PROFILES: S_PROFILES } = require('./ai/smart-ai');
const path = require('path');
const fs = require('fs');

// ─── CLI Argument Parsing ───

function parseArgs(argv) {
  const args = {
    iterations: 1000,
    dungeonProfile: 'tactical',
    visitorProfile: 'feral_aggressive',
    scenario: './data/scenarios/verdant-maw-vs-boar.js',
    verbose: false,
    csv: false,
    json: false,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '-n': case '--iterations': args.iterations = parseInt(argv[++i]) || 1000; break;
      case '-d': case '--dungeon':    args.dungeonProfile = argv[++i]; break;
      case '-v': case '--visitor':    args.visitorProfile = argv[++i]; break;
      case '-s': case '--scenario':   args.scenario = argv[++i]; break;
      case '--verbose': args.verbose = true; break;
      case '--csv':     args.csv = true; break;
      case '--json':    args.json = true; break;
      case '--help': case '-h': args.help = true; break;
    }
  }
  return args;
}

function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║  SHATTERED DUNGEON — Simulation Runner              ║
╚══════════════════════════════════════════════════════╝

Usage:  node run.js [options]

Options:
  -n, --iterations <N>       Number of iterations (default: 1000)
  -d, --dungeon <profile>    Dungeon AI profile (default: tactical)
  -v, --visitor <profile>    Visitor AI profile (default: feral_aggressive)
  -s, --scenario <path>      Path to scenario file (default: verdant-maw-vs-boar)
  --verbose                  Show full encounter log (single run)
  --csv                      Write CSV results to output/
  --json                     Write JSON results to output/
  -h, --help                 Show this help

Dungeon AI Profiles:  ${Object.keys(D_PROFILES).join(', ')}
Visitor AI Profiles:  ${Object.keys(V_PROFILES).join(', ')}
Smart AI Profiles:    ${Object.keys(S_PROFILES).join(', ')}

Examples:
  node run.js                            Quick 1000-iteration batch
  node run.js --verbose                  Single run with full log
  node run.js -n 5000 -d aggressive      5000 runs, aggressive dungeon
  node run.js --csv --json -n 10000      Full output in both formats
`);
}

// ─── Output Formatting ───

function printSummary(summary) {
  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  ${summary.scenario.padEnd(50)} ║`);
  console.log(`╚══════════════════════════════════════════════════════╝`);
  console.log(`  Iterations: ${summary.iterations}`);
  console.log(`  Avg Rounds: ${summary.avgRounds} | Avg Decisions: ${summary.avgDecisions}`);

  console.log(`\n  ── Overall Outcomes ──`);
  const sorted = Object.entries(summary.outcomeDistribution).sort((a, b) => b[1].pct - a[1].pct);
  for (const [outcome, data] of sorted) {
    const bar = '█'.repeat(Math.floor(data.pct / 2));
    console.log(`  ${outcome.padEnd(12)} ${data.pct.toFixed(1).padStart(5)}%  ${bar}  (${data.count})`);
  }

  console.log(`\n  ── Per Encounter ──`);
  for (const [name, data] of Object.entries(summary.perEncounter)) {
    console.log(`\n  ${name} (reached ${data.reachedPct}% | avg ${data.avgRounds} rnds | avg ${data.avgDecisions} decisions)`);
    const eSorted = Object.entries(data.outcomes).sort((a, b) => b[1].pct - a[1].pct);
    for (const [outcome, od] of eSorted) {
      const bar = '█'.repeat(Math.floor(od.pct / 2));
      console.log(`    ${outcome.padEnd(12)} ${od.pct.toFixed(1).padStart(5)}%  ${bar}  (${od.count})`);
    }

    // Momentum chart
    if (data.momentum && data.momentum.length > 0) {
      console.log(`\n    ── Momentum (avg health %) ──`);
      console.log(`    ${'Rnd'.padStart(4)}  ${'Dng%'.padStart(4)} ${'Vis%'.padStart(4)}  ${'Lead'.padStart(8)}  Chart`);
      for (const m of data.momentum) {
        const dBar = '█'.repeat(Math.max(0, Math.floor(m.dungeonPct / 5)));
        const vBar = '▓'.repeat(Math.max(0, Math.floor(m.visitorPct / 5)));
        const lead = m.dungeonPct > m.visitorPct
          ? `D+${m.dungeonPct - m.visitorPct}`
          : m.visitorPct > m.dungeonPct
            ? `V+${m.visitorPct - m.dungeonPct}`
            : 'TIED';
        console.log(`    ${String(m.round).padStart(4)}  ${String(m.dungeonPct).padStart(4)} ${String(m.visitorPct).padStart(4)}  ${lead.padStart(8)}  D${dBar} V${vBar}`);
      }
      // Who leads more often at midpoint?
      const mid = data.momentum[Math.floor(data.momentum.length / 2)];
      if (mid) {
        console.log(`    Midpoint (R${mid.round}): Dungeon leads ${mid.dungeonLeadPct}% | Visitor leads ${mid.visitorLeadPct}% | Tied ${100 - mid.dungeonLeadPct - mid.visitorLeadPct}%`);
      }
    }
  }
  console.log('');
}

function writeCsv(summary, outDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filepath = path.join(outDir, `sim-${timestamp}.csv`);
  let csv = 'Scenario,Iterations,Avg Rounds,Avg Decisions\n';
  csv += `"${summary.scenario}",${summary.iterations},${summary.avgRounds},${summary.avgDecisions}\n\n`;
  csv += 'Outcome,Count,Percentage\n';
  for (const [k, v] of Object.entries(summary.outcomeDistribution)) csv += `${k},${v.count},${v.pct}\n`;
  csv += '\nEncounter,Reached %,Avg Rounds,Outcome,Count,Pct\n';
  for (const [name, data] of Object.entries(summary.perEncounter))
    for (const [outcome, od] of Object.entries(data.outcomes))
      csv += `"${name}",${data.reachedPct},${data.avgRounds},${outcome},${od.count},${od.pct}\n`;
  fs.writeFileSync(filepath, csv);
  console.log(`  CSV written: ${filepath}`);
}

function writeJson(summary, outDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filepath = path.join(outDir, `sim-${timestamp}.json`);
  fs.writeFileSync(filepath, JSON.stringify(summary, null, 2));
  console.log(`  JSON written: ${filepath}`);
}

// ─── Main ───

function main() {
  const args = parseArgs(process.argv);
  if (args.help) { printHelp(); return; }

  const scenarioPath = path.resolve(args.scenario);
  let scenario;
  try { scenario = require(scenarioPath); }
  catch (e) { console.error(`Error loading scenario: ${scenarioPath}\n${e.message}`); process.exit(1); }

  // Create AIs — check smart profiles first, then fall back to legacy
  let dungeonAI, visitorAI;
  
  if (S_PROFILES[args.dungeonProfile]) {
    dungeonAI = createSmartAI(args.dungeonProfile);
  } else {
    dungeonAI = createDungeonAI(args.dungeonProfile);
  }
  
  if (S_PROFILES[args.visitorProfile]) {
    visitorAI = createSmartAI(args.visitorProfile);
  } else {
    visitorAI = createVisitorAI(args.visitorProfile);
  }

  console.log(`\nDungeon AI: ${args.dungeonProfile} — ${dungeonAI.profile.description}`);
  console.log(`Visitor AI: ${args.visitorProfile} — ${visitorAI.profile.description}`);

  if (args.verbose) {
    const result = runSequence(scenario, dungeonAI, visitorAI, { verbose: true });
    for (const encLogs of (result.logs || [])) for (const line of encLogs) console.log(line);
    const winLabel = result.outcome.winner === 'both' ? 'mutual' : `${result.outcome.winner} wins`;
    console.log(`\n  Final: ${result.outcome.condition} (${winLabel})`);
    console.log(`  Rounds: ${result.totalRounds} | Decisions: ${result.totalDecisions}`);
    if (result.finalVisitor) { const v = result.finalVisitor; console.log(`  Visitor: Vit:${v.vitality} Res:${v.resolve} Nrv:${v.nerve} Tru:${v.trust}`); }
    if (result.finalDungeon) { const d = result.finalDungeon; console.log(`  Dungeon: Str:${d.structure} Vl:${d.veil} Pr:${d.presence} Rp:${d.rapport}`); }

    // Per-encounter momentum summary
    for (const enc of result.encounters) {
      if (enc.roundSnapshots && enc.roundSnapshots.length > 0) {
        console.log(`\n  ── ${enc.name} Momentum ──`);
        console.log(`  ${'Rnd'.padStart(4)}  ${'Dng%'.padStart(4)} ${'Vis%'.padStart(4)}  ${'Lead'.padStart(8)}`);
        for (const s of enc.roundSnapshots) {
          const lead = s.dungeon.pct > s.visitor.pct
            ? `D+${s.dungeon.pct - s.visitor.pct}`
            : s.visitor.pct > s.dungeon.pct
              ? `V+${s.visitor.pct - s.dungeon.pct}`
              : 'TIED';
          console.log(`  ${String(s.round).padStart(4)}  ${String(s.dungeon.pct).padStart(4)} ${String(s.visitor.pct).padStart(4)}  ${lead.padStart(8)}`);
        }
      }
    }
    return;
  }

  console.log(`\nRunning ${args.iterations} iterations...`);
  const start = Date.now();
  const summary = runBatch(scenario, dungeonAI, visitorAI, args.iterations);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`  Completed in ${elapsed}s`);
  printSummary(summary);

  const outDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (args.csv) writeCsv(summary, outDir);
  if (args.json) writeJson(summary, outDir);
  fs.writeFileSync(path.join(outDir, 'latest.json'), JSON.stringify(summary, null, 2));
  console.log(`  Latest results: output/latest.json`);
}

main();