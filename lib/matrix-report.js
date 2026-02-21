/**
 * MATRIX REPORT — Aggregate and analyze matchup results
 *
 * Implements GDD §18.5 anomaly detection:
 *   - A member class with 80%+ first-knockout rate regardless of composition
 *   - An encounter ordering producing 0% of some win condition
 *   - A composition winning 70%+ against all opponents
 *   - Any matchup with agency below 1.0
 *
 * Usage:
 *   const report = require('./matrix-report');
 *   const analysis = report.analyze(matrixResult);
 *   report.printReport(analysis);
 */

const { flattenAll } = require('./matrix-runner');

// ═══════════════════════════════════════════════════════════════
// ANALYSIS
// ═══════════════════════════════════════════════════════════════

/**
 * Analyze matrix results and flag anomalies.
 *
 * @param {object} matrixResult - From matrix-runner.runMatrix()
 * @returns {object} Analysis report
 */
function analyze(matrixResult) {
  const rows = flattenAll(matrixResult);
  if (rows.length === 0) return { rows: [], summary: {}, anomalies: [] };

  const anomalies = [];

  // ── Overall summary ──
  const summary = {
    matchups: rows.length,
    iterations: matrixResult.meta.iterations,
    elapsed: matrixResult.meta.totalElapsedSec,
    errors: matrixResult.meta.matchupsFailed,

    // Aggregate outcome distribution
    outcomes: aggregateOutcomes(rows),

    // Quality metric averages
    avgAgency: avg(rows.map(r => r.agency).filter(v => v !== null)),
    avgCloseness: avg(rows.map(r => r.closeness).filter(v => v !== null)),
    avgDiversity: avg(rows.map(r => r.outcomeDiversity).filter(v => v !== null)),
    avgRounds: avg(rows.map(r => r.avgRounds)),

    // Health
    healthyCount: rows.filter(r => r.healthIssues === 0).length,
    unhealthyCount: rows.filter(r => r.healthIssues > 0).length,
  };

  // ── Anomaly detection per GDD §18.5 ──

  // 1. Dungeon dominance: any composition winning 70%+ dungeon across all matchups
  const byVisitor = groupBy(rows, r => r.visitor);
  for (const [visitor, matchups] of Object.entries(byVisitor)) {
    const allHigh = matchups.every(r => r.dungeonWinRate >= 70);
    if (allHigh && matchups.length >= 3) {
      anomalies.push({
        type: 'dungeon_dominance',
        severity: 'HIGH',
        desc: `Dungeon wins 70%+ against ${visitor} in ALL ${matchups.length} matchups (avg ${avg(matchups.map(r => r.dungeonWinRate)).toFixed(1)}%)`,
      });
    }
  }

  // 2. Visitor dominance: visitor winning 70%+ against all dungeon configs
  for (const [visitor, matchups] of Object.entries(byVisitor)) {
    const allLow = matchups.every(r => r.dungeonWinRate <= 30);
    if (allLow && matchups.length >= 3) {
      anomalies.push({
        type: 'visitor_dominance',
        severity: 'HIGH',
        desc: `${visitor} survives 70%+ against ALL ${matchups.length} dungeon configs (avg dungeon win ${avg(matchups.map(r => r.dungeonWinRate)).toFixed(1)}%)`,
      });
    }
  }

  // 3. Low agency matchups
  const lowAgency = rows.filter(r => r.agency !== null && r.agency < 1.0);
  if (lowAgency.length > 0) {
    anomalies.push({
      type: 'low_agency',
      severity: lowAgency.length > rows.length * 0.2 ? 'HIGH' : 'MEDIUM',
      desc: `${lowAgency.length}/${rows.length} matchups have agency < 1.0 (${pct(lowAgency.length, rows.length)}%)`,
      matchups: lowAgency.map(r => ({ id: r.id, agency: r.agency })).slice(0, 10),
    });
  }

  // 4. Zero outcome conditions
  const byEncounters = groupBy(rows, r => r.encounters);
  for (const [encDesc, matchups] of Object.entries(byEncounters)) {
    const allOutcomes = ['kill', 'break', 'panic', 'overcome', 'inert', 'dominate'];
    for (const outcome of allOutcomes) {
      const allZero = matchups.every(r => r[outcome] === 0);
      if (allZero && matchups.length >= 3) {
        anomalies.push({
          type: 'zero_outcome',
          severity: 'MEDIUM',
          desc: `${capitalize(outcome)} never fires for encounter sequence [${encDesc}] across ${matchups.length} matchups`,
        });
      }
    }
  }

  // 5. Low diversity matchups
  const lowDiversity = rows.filter(r => r.outcomeDiversity !== null && r.outcomeDiversity < 0.35);
  if (lowDiversity.length > 0) {
    anomalies.push({
      type: 'low_diversity',
      severity: lowDiversity.length > rows.length * 0.3 ? 'HIGH' : 'MEDIUM',
      desc: `${lowDiversity.length}/${rows.length} matchups have outcome diversity < 0.35 (${pct(lowDiversity.length, rows.length)}%)`,
    });
  }

  // 6. Health issues from engine quality metrics
  const withIssues = rows.filter(r => r.healthIssues > 0);
  if (withIssues.length > 0) {
    // Aggregate issue types
    const issueCounts = {};
    for (const r of withIssues) {
      for (const issue of r.healthIssueList.split('; ')) {
        if (issue) issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      }
    }
    for (const [issue, count] of Object.entries(issueCounts)) {
      anomalies.push({
        type: 'health_issue',
        severity: count > rows.length * 0.3 ? 'HIGH' : 'LOW',
        desc: `${issue} — ${count} matchups (${pct(count, rows.length)}%)`,
      });
    }
  }

  // ── Breakdowns ──
  const breakdowns = {
    byDungeonProfile: profileBreakdown(rows, 'dungeonProfile'),
    byVisitorType: profileBreakdown(rows, 'visitorType'),
    byEncounterSequence: encounterBreakdown(rows),
    topDungeonWinRate: [...rows].sort((a, b) => b.dungeonWinRate - a.dungeonWinRate).slice(0, 5),
    bottomDungeonWinRate: [...rows].sort((a, b) => a.dungeonWinRate - b.dungeonWinRate).slice(0, 5),
    topAgency: [...rows].sort((a, b) => (b.agency || 0) - (a.agency || 0)).slice(0, 5),
    bottomAgency: [...rows].sort((a, b) => (a.agency || 99) - (b.agency || 99)).slice(0, 5),
  };

  return { rows, summary, anomalies, breakdowns };
}

// ═══════════════════════════════════════════════════════════════
// BREAKDOWN HELPERS
// ═══════════════════════════════════════════════════════════════

function aggregateOutcomes(rows) {
  const totals = {};
  const n = rows.length;
  for (const key of ['kill', 'break', 'panic', 'overcome', 'inert', 'dominate', 'bond', 'survive']) {
    const vals = rows.map(r => r[key] || 0);
    totals[key] = {
      avg: +avg(vals).toFixed(1),
      min: Math.min(...vals),
      max: Math.max(...vals),
      stddev: +stddev(vals).toFixed(1),
    };
  }
  return totals;
}

function profileBreakdown(rows, field) {
  const groups = groupBy(rows, r => r[field]);
  const result = {};
  for (const [key, matchups] of Object.entries(groups)) {
    result[key] = {
      count: matchups.length,
      avgDungeonWinRate: +avg(matchups.map(r => r.dungeonWinRate)).toFixed(1),
      avgAgency: +avg(matchups.map(r => r.agency).filter(v => v !== null)).toFixed(2),
      avgDiversity: +avg(matchups.map(r => r.outcomeDiversity).filter(v => v !== null)).toFixed(3),
      avgRounds: +avg(matchups.map(r => r.avgRounds)).toFixed(1),
    };
  }
  return result;
}

function encounterBreakdown(rows) {
  const groups = groupBy(rows, r => r.encounters);
  const result = {};
  for (const [key, matchups] of Object.entries(groups)) {
    result[key] = {
      count: matchups.length,
      avgDungeonWinRate: +avg(matchups.map(r => r.dungeonWinRate)).toFixed(1),
      avgAgency: +avg(matchups.map(r => r.agency).filter(v => v !== null)).toFixed(2),
      avgDiversity: +avg(matchups.map(r => r.outcomeDiversity).filter(v => v !== null)).toFixed(3),
    };
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
// CONSOLE REPORT
// ═══════════════════════════════════════════════════════════════

function printReport(analysis) {
  const { summary, anomalies, breakdowns } = analysis;

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  COMPOSITION MATRIX — Analysis Report                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Summary
  console.log(`\n  Matchups: ${summary.matchups} | Iterations: ${summary.iterations} each | Elapsed: ${summary.elapsed}s`);
  if (summary.errors > 0) console.log(`  Errors: ${summary.errors}`);
  console.log(`  Healthy: ${summary.healthyCount} | Unhealthy: ${summary.unhealthyCount}`);

  // Quality metric averages
  console.log(`\n  ── Quality Averages ──`);
  console.log(`  Agency:    ${summary.avgAgency?.toFixed(2) ?? 'N/A'} (target: 1.5–4.0)`);
  console.log(`  Closeness: ${summary.avgCloseness?.toFixed(1) ?? 'N/A'}% (target: 15–40%)`);
  console.log(`  Diversity: ${summary.avgDiversity?.toFixed(3) ?? 'N/A'} (target: 0.35–0.85)`);
  console.log(`  Avg Rounds: ${summary.avgRounds?.toFixed(1) ?? 'N/A'}`);

  // Aggregate outcomes
  console.log(`\n  ── Outcome Averages Across All Matchups ──`);
  for (const [key, val] of Object.entries(summary.outcomes)) {
    if (val.avg > 0 || val.max > 0) {
      console.log(`  ${capitalize(key).padEnd(10)} avg:${String(val.avg).padStart(5)}%  min:${String(val.min).padStart(5)}%  max:${String(val.max).padStart(5)}%  σ:${String(val.stddev).padStart(5)}`);
    }
  }

  // Anomalies
  if (anomalies.length > 0) {
    console.log(`\n  ── Anomalies (${anomalies.length}) ──`);
    for (const a of anomalies) {
      const icon = a.severity === 'HIGH' ? '🔴' : a.severity === 'MEDIUM' ? '🟡' : '🔵';
      console.log(`  ${icon} [${a.severity}] ${a.desc}`);
    }
  } else {
    console.log(`\n  ✅ No anomalies detected.`);
  }

  // By dungeon profile
  if (breakdowns.byDungeonProfile) {
    console.log(`\n  ── By Dungeon Profile ──`);
    for (const [profile, data] of Object.entries(breakdowns.byDungeonProfile)) {
      console.log(`  ${profile.padEnd(12)} (${data.count}) DWR:${data.avgDungeonWinRate}%  Agency:${data.avgAgency}  Div:${data.avgDiversity}  Rnd:${data.avgRounds}`);
    }
  }

  // By visitor type
  if (breakdowns.byVisitorType) {
    console.log(`\n  ── By Visitor Type ──`);
    for (const [type, data] of Object.entries(breakdowns.byVisitorType)) {
      console.log(`  ${type.padEnd(12)} (${data.count}) DWR:${data.avgDungeonWinRate}%  Agency:${data.avgAgency}  Div:${data.avgDiversity}  Rnd:${data.avgRounds}`);
    }
  }

  // Top/bottom tables
  console.log(`\n  ── Highest Dungeon Win Rate ──`);
  for (const r of breakdowns.topDungeonWinRate) {
    console.log(`  ${String(r.dungeonWinRate).padStart(5)}%  ${r.visitor.substring(0, 30).padEnd(30)}  [${r.encounters.substring(0, 40)}]  ${r.dungeonProfile}`);
  }

  console.log(`\n  ── Lowest Dungeon Win Rate ──`);
  for (const r of breakdowns.bottomDungeonWinRate) {
    console.log(`  ${String(r.dungeonWinRate).padStart(5)}%  ${r.visitor.substring(0, 30).padEnd(30)}  [${r.encounters.substring(0, 40)}]  ${r.dungeonProfile}`);
  }

  console.log(`\n  ── Lowest Agency ──`);
  for (const r of breakdowns.bottomAgency) {
    console.log(`  ${String(r.agency?.toFixed(2) ?? 'N/A').padStart(5)}  ${r.visitor.substring(0, 30).padEnd(30)}  [${r.encounters.substring(0, 40)}]  DWR:${r.dungeonWinRate}%`);
  }
}

// ═══════════════════════════════════════════════════════════════
// JSON EXPORT
// ═══════════════════════════════════════════════════════════════

/**
 * Export analysis to a JSON-serializable object.
 */
function toJSON(analysis) {
  return {
    summary: analysis.summary,
    anomalies: analysis.anomalies,
    breakdowns: {
      byDungeonProfile: analysis.breakdowns.byDungeonProfile,
      byVisitorType: analysis.breakdowns.byVisitorType,
      byEncounterSequence: analysis.breakdowns.byEncounterSequence,
    },
    rows: analysis.rows,
  };
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

function groupBy(arr, keyFn) {
  const groups = {};
  for (const item of arr) {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function avg(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stddev(arr) {
  if (arr.length < 2) return 0;
  const mean = avg(arr);
  const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function pct(num, total) {
  return ((num / total) * 100).toFixed(1);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

module.exports = {
  analyze,
  printReport,
  toJSON,
};
