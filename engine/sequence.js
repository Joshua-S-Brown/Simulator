/**
 * SHATTERED DUNGEON — Sequence Runner v1.2
 * [ADD] Round snapshots passed through from encounters
 * [ADD] Batch aggregation of per-round momentum data
 */

const { runEncounter } = require('./encounter');

function runSequence(scenario, dungeonAI, visitorAI, config = {}) {
  const results = [];
  let carryover = null;

  for (let i = 0; i < scenario.encounters.length; i++) {
    const enc = scenario.encounters[i];
    if (carryover?.visitor) {
      const v = carryover.visitor;
      if (v.vitality <= 0 || v.resolve <= 0 || v.nerve <= 0) break;
      // Clear combat conditions between encounters (room-specific)
      v.conditions = [];
    }
    // Dungeon carries damage but depleted reducers get partial restoration for new room
    if (carryover?.dungeon) {
      const d = carryover.dungeon;
      const sv = d.startingValues || { structure: 16, veil: 14, presence: 12 };
      // If a reducer was depleted (visitor won that room), restore to 30% of starting
      // This represents the new room's baseline while keeping overall attrition pressure
      for (const res of ['structure', 'veil', 'presence']) {
        if (d[res] <= 0) {
          d[res] = Math.max(1, Math.round(sv[res] * 0.3));
        }
      }
      // Clear combat conditions between encounters (room-specific)
      d.conditions = [];
    }
    const result = runEncounter(
      enc.encounter, enc.dungeonDeck, enc.visitorDeck,
      scenario.visitorTemplate, scenario.dungeonTemplate,
      dungeonAI, visitorAI,
      { ...config, ...enc.config }, carryover
    );
    results.push(result);
    carryover = {
      visitor: result.carryover.visitor,
      dungeon: result.carryover.dungeon,           // Dungeon stats carry forward (attrition)
      visitorDiscard: result.carryover.visitorDiscard,
      dungeonDiscard: [],                           // Fresh deck per room (new card pool)
    };
    if (result.outcome.winner === 'dungeon' || result.outcome.condition === 'Bond') break;
  }

  const lastResult = results[results.length - 1];
  const lastCondition = lastResult?.outcome?.condition;

  let runOutcome;
  if (lastCondition === 'Bond') {
    // Bond is a mutual outcome — propagate directly
    runOutcome = lastResult.outcome;
  } else {
    const allCleared = results.length === scenario.encounters.length && lastResult?.outcome?.winner !== 'dungeon';
    runOutcome = allCleared
      ? { winner: 'visitor', condition: 'Survive', desc: 'Cleared all encounters' }
      : lastResult?.outcome;
  }

  return {
    scenario: scenario.name,
    outcome: runOutcome,
    encounters: results.map(r => ({
      name: r.encounter, outcome: r.outcome,
      rounds: r.stats.rounds, decisions: r.stats.decisions,
      roundSnapshots: r.roundSnapshots || [],
    })),
    finalVisitor: lastResult?.finalVisitor,
    finalDungeon: lastResult?.finalDungeon,
    totalRounds: results.reduce((s, r) => s + r.stats.rounds, 0),
    totalDecisions: results.reduce((s, r) => s + r.stats.decisions, 0),
    logs: config.verbose ? results.map(r => r.log) : undefined,
  };
}

function runBatch(scenario, dungeonAI, visitorAI, iterations = 1000, config = {}) {
  const outcomes = {};
  const perEncounter = {};
  let totalRounds = 0, totalDecisions = 0;

  for (let i = 0; i < iterations; i++) {
    const result = runSequence(scenario, dungeonAI, visitorAI, { ...config, verbose: false });
    const key = result.outcome.condition;
    outcomes[key] = (outcomes[key] || 0) + 1;
    totalRounds += result.totalRounds;
    totalDecisions += result.totalDecisions;

    for (const enc of result.encounters) {
      if (!perEncounter[enc.name]) {
        perEncounter[enc.name] = {
          outcomes: {}, totalRounds: 0, totalDecisions: 0, count: 0,
          roundData: {},
        };
      }
      const pe = perEncounter[enc.name];
      pe.outcomes[enc.outcome.condition] = (pe.outcomes[enc.outcome.condition] || 0) + 1;
      pe.totalRounds += enc.rounds;
      pe.totalDecisions += enc.decisions;
      pe.count++;

      // Aggregate round snapshots
      for (const snap of (enc.roundSnapshots || [])) {
        if (!pe.roundData[snap.round]) {
          pe.roundData[snap.round] = {
            count: 0,
            dungeonPctSum: 0, visitorPctSum: 0,
            dungeonLeadCount: 0, visitorLeadCount: 0, tiedCount: 0,
          };
        }
        const rd = pe.roundData[snap.round];
        rd.count++;
        rd.dungeonPctSum += snap.dungeon.pct;
        rd.visitorPctSum += snap.visitor.pct;
        if (snap.lead === 'dungeon') rd.dungeonLeadCount++;
        else if (snap.lead === 'visitor') rd.visitorLeadCount++;
        else rd.tiedCount++;
      }
    }
  }

  const summary = {
    scenario: scenario.name, iterations,
    outcomeDistribution: {},
    avgRounds: +(totalRounds / iterations).toFixed(1),
    avgDecisions: +(totalDecisions / iterations).toFixed(1),
    perEncounter: {},
  };

  for (const [k, v] of Object.entries(outcomes))
    summary.outcomeDistribution[k] = { count: v, pct: +((v / iterations) * 100).toFixed(1) };

  for (const [name, data] of Object.entries(perEncounter)) {
    const momentum = [];
    const maxRound = Math.max(...Object.keys(data.roundData).map(Number), 0);
    for (let r = 1; r <= maxRound; r++) {
      const rd = data.roundData[r];
      if (!rd || rd.count < Math.max(10, data.count * 0.05)) continue;
      momentum.push({
        round: r,
        samples: rd.count,
        dungeonPct: Math.round(rd.dungeonPctSum / rd.count),
        visitorPct: Math.round(rd.visitorPctSum / rd.count),
        dungeonLeadPct: +((rd.dungeonLeadCount / rd.count) * 100).toFixed(0),
        visitorLeadPct: +((rd.visitorLeadCount / rd.count) * 100).toFixed(0),
      });
    }

    summary.perEncounter[name] = {
      timesReached: data.count, reachedPct: +((data.count / iterations) * 100).toFixed(1),
      avgRounds: +(data.totalRounds / data.count).toFixed(1),
      avgDecisions: +(data.totalDecisions / data.count).toFixed(1),
      outcomes: {},
      momentum,
    };
    for (const [ok, ov] of Object.entries(data.outcomes))
      summary.perEncounter[name].outcomes[ok] = { count: ov, pct: +((ov / data.count) * 100).toFixed(1) };
  }
  return summary;
}

module.exports = { runSequence, runBatch };