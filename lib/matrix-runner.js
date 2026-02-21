/**
 * MATRIX RUNNER — Execute matchups through the engine
 *
 * Takes matchup specs from the composition generator, builds scenarios,
 * runs them through runBatch, and collects results with quality metrics.
 *
 * Usage:
 *   const runner = require('./matrix-runner');
 *   const gen = require('./composition-generator');
 *
 *   const matchups = gen.randomSample(20);
 *   const results = runner.runMatrix(matchups, { iterations: 200 });
 *
 *   // With progress callback
 *   const results = runner.runMatrix(matchups, {
 *     iterations: 200,
 *     onProgress: (i, total, matchup, elapsed) => {
 *       process.stdout.write(`\r  ${i}/${total} (${elapsed}s)...`);
 *     },
 *   });
 */

const { buildFromMatchup } = require('./scenario-builder');
const { runBatch } = require('../engine/sequence');
const { createDungeonAI } = require('../ai/dungeon-ai');
const { createVisitorAI } = require('../ai/visitor-ai');

// ═══════════════════════════════════════════════════════════════
// MATRIX EXECUTION
// ═══════════════════════════════════════════════════════════════

/**
 * Run a set of matchups through the engine.
 *
 * @param {MatchupSpec[]} matchups - From composition-generator
 * @param {object} [options]
 * @param {number} [options.iterations=100] - Iterations per matchup
 * @param {object} [options.config={}] - Engine config overrides
 * @param {object} [options.encounterConfigs={}] - Per-encounter config overrides
 * @param {Function} [options.onProgress] - Called after each matchup: (index, total, matchup, elapsedSec)
 * @param {Function} [options.onError] - Called on matchup error: (matchup, error). Default: log and continue.
 * @returns {MatrixResult}
 */
function runMatrix(matchups, options = {}) {
  const iterations = options.iterations || 100;
  const config = options.config || {};
  const encounterConfigs = options.encounterConfigs || {};
  const onProgress = options.onProgress || null;
  const onError = options.onError || ((m, e) => console.error(`  ✗ ${m.id}: ${e.message}`));

  const results = [];
  const errors = [];
  const startTime = Date.now();

  for (let i = 0; i < matchups.length; i++) {
    const matchup = matchups[i];
    const matchupStart = Date.now();

    try {
      // Build scenario
      const scenario = buildFromMatchup(matchup, { config, encounterConfigs });

      // Create AI instances
      const dungeonAI = createDungeonAI(matchup.dungeonProfile);
      const visitorAI = createVisitorAI(matchup.visitorProfile);

      // Run batch
      const summary = runBatch(scenario, dungeonAI, visitorAI, iterations);

      // Collect result
      results.push({
        matchup,
        summary,
        elapsedMs: Date.now() - matchupStart,
      });
    } catch (e) {
      errors.push({ matchup, error: e.message });
      onError(matchup, e);
    }

    if (onProgress) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      onProgress(i + 1, matchups.length, matchup, elapsed);
    }
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  return {
    results,
    errors,
    meta: {
      matchupsRun: results.length,
      matchupsFailed: errors.length,
      iterations,
      totalElapsedSec: parseFloat(totalElapsed),
      avgMsPerMatchup: results.length > 0
        ? Math.round(results.reduce((s, r) => s + r.elapsedMs, 0) / results.length)
        : 0,
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// RESULT EXTRACTION
// ═══════════════════════════════════════════════════════════════

/**
 * Extract a flat summary row from a matchup result.
 * Useful for tabular output and CSV export.
 *
 * @param {object} result - Single entry from results array
 * @returns {object} Flat row
 */
function flattenResult(result) {
  const { matchup, summary } = result;
  const qm = summary.qualityMetrics || {};
  const od = summary.outcomeDistribution || {};

  // Visitor description
  const visitorDesc = matchup.members
    ? matchup.members.join('+')
    : matchup.creature;

  // Encounter sequence
  const encDesc = matchup.encounters.join(' → ');

  // Outcome percentages
  const outcomes = {};
  for (const [key, val] of Object.entries(od)) {
    outcomes[key] = val.pct;
  }

  return {
    id: matchup.id,
    encounters: encDesc,
    visitor: visitorDesc,
    visitorType: matchup.members ? 'party' : 'creature',
    dungeonProfile: matchup.dungeonProfile,
    visitorProfile: matchup.visitorProfile,

    // Outcomes
    kill: outcomes.Kill || 0,
    break: outcomes.Break || 0,
    panic: outcomes.Panic || 0,
    survive: outcomes.Survive || outcomes.Overcome || 0,
    overcome: outcomes.Overcome || 0,
    inert: outcomes.Inert || 0,
    dominate: outcomes.Dominate || 0,
    bond: outcomes.Bond || 0,

    // Dungeon win rate (kill + break + panic)
    dungeonWinRate: (outcomes.Kill || 0) + (outcomes.Break || 0) + (outcomes.Panic || 0),

    // Quality metrics
    agency: qm.agency?.average ?? null,
    agencyAssessment: qm.agency?.assessment ?? null,
    closeness: qm.closeness?.average ?? null,
    closenessAssessment: qm.closeness?.assessment ?? null,
    outcomeDiversity: qm.outcomeDiversity?.normalized ?? null,
    diversityAssessment: qm.outcomeDiversity?.assessment ?? null,
    healthIssues: (qm.healthIssues || []).length,
    healthIssueList: (qm.healthIssues || []).join('; '),

    // Pacing
    avgRounds: summary.avgRounds,
    avgDecisions: summary.avgDecisions,

    // Performance
    elapsedMs: result.elapsedMs,
  };
}

/**
 * Extract flat rows from all results.
 * @param {object} matrixResult - From runMatrix()
 * @returns {object[]} Array of flat rows
 */
function flattenAll(matrixResult) {
  return matrixResult.results.map(flattenResult);
}

module.exports = {
  runMatrix,
  flattenResult,
  flattenAll,
};
