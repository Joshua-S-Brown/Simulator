/**
 * SHATTERED DUNGEON — Sequence Runner v1.4
 * [ADD] Round snapshots passed through from encounters
 * [ADD] Batch aggregation of per-round momentum data
 * [ADD] v2.5: Encounter quality metrics (GDD Section 18)
 * [ADD] v2.5: Short Rest — party recovery between encounters
 */

const { runEncounter } = require('./encounter');
const { createDungeonAI } = require('../ai/dungeon-ai');
const { createVisitorAI } = require('../ai/visitor-ai');
const QM = require('./quality-metrics');

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

    // ─── SHORT REST: Party recovery between encounters ───
    // Mirrors the dungeon's between-room restoration. Represents the party
    // resting, regrouping, and tending wounds before entering the next room.
    // Only applies to party visitors, only between rooms (not before Room 1).
    if (carryover?.visitor?.isParty) {
      const v = carryover.visitor;
      const sv = v.startingValues || {};
      const restConfig = config.shortRest || {};

      // Recovery rates (configurable via scenario config, sensible defaults)
      const DOWNED_RESTORE_PCT = restConfig.downedRestorePct || 0.40;   // Downed members return at 40% max vit
      const ACTIVE_HEAL_PCT    = restConfig.activeHealPct   || 0.25;    // Active members heal 25% of missing vit
      const POOL_RESTORE_PCT   = restConfig.poolRestorePct  || 0.20;    // Collective pools restore 20% of starting

      // 1. Restore downed members
      for (const [key, member] of Object.entries(v.members)) {
        if (member.status === 'knocked_out') {
          member.status = 'active';
          member.vitality = Math.max(1, Math.round(member.maxVitality * DOWNED_RESTORE_PCT));
          v.knockoutCount = Math.max(0, v.knockoutCount - 1);
        }
      }

      // 2. Heal active members (25% of missing vitality)
      for (const [key, member] of Object.entries(v.members)) {
        if (member.status === 'active' && member.vitality < member.maxVitality) {
          const missing = member.maxVitality - member.vitality;
          member.vitality += Math.round(missing * ACTIVE_HEAL_PCT);
          member.vitality = Math.min(member.vitality, member.maxVitality);
        }
      }

      // 3. Update aggregate vitality to reflect member recovery
      v.vitality = Object.values(v.members).reduce((s, m) => s + m.vitality, 0);

      // 4. Restore collective pools (20% of starting values, capped at starting)
      if (sv.resolve > 0) {
        v.resolve = Math.min(sv.resolve, v.resolve + Math.round(sv.resolve * POOL_RESTORE_PCT));
      }
      if (sv.nerve > 0) {
        v.nerve = Math.min(sv.nerve, v.nerve + Math.round(sv.nerve * POOL_RESTORE_PCT));
      }

      // 5. Clear carryover discard — restored members' cards return via fresh deck draw
      // The encounter draws from the full visitorDeck each room, so cleared discard
      // means all cards (including previously knocked-out members') are available again.
      carryover.visitorDiscard = [];
    }

    const encDungeonAI = enc.config?.dungeonProfile
      ? createDungeonAI(enc.config.dungeonProfile)
      : dungeonAI;
    const encVisitorAI = enc.config?.visitorProfile
      ? createVisitorAI(enc.config.visitorProfile)
      : visitorAI;

    const result = runEncounter(
      enc.encounter, enc.dungeonDeck, enc.visitorDeck,
      scenario.visitorTemplate, scenario.dungeonTemplate,
      encDungeonAI, encVisitorAI,
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

  // ─── v2.5: Quality metric collectors ───
  const qualityData = {
    leadChanges: [],        // Per-iteration: total lead changes across all encounters
    closeness: [],          // Per-iteration: closeness at resolution
    firstKnockouts: {},     // Member key → count (party scenarios only)
    roomEntryStates: {},    // Room name → { vitality: [], resolve: [], nerve: [] }
    hasParty: false,
    isMultiRoom: scenario.encounters.length > 1,
  };

  for (let i = 0; i < iterations; i++) {
    const result = runSequence(scenario, dungeonAI, visitorAI, { ...config, verbose: false });
    const key = result.outcome.condition;
    outcomes[key] = (outcomes[key] || 0) + 1;
    totalRounds += result.totalRounds;
    totalDecisions += result.totalDecisions;

    // ─── v2.5: Collect per-iteration quality data ───

    // 1. Agency: count lead changes across all encounters in this run
    let runLeadChanges = 0;
    for (const enc of result.encounters) {
      runLeadChanges += QM.countLeadChanges(enc.roundSnapshots || []);
    }
    qualityData.leadChanges.push(runLeadChanges);

    // 2. Closeness at resolution
    const closeness = QM.computeIterationCloseness(
      result.outcome, result.finalVisitor, result.finalDungeon
    );
    qualityData.closeness.push(closeness);

    // 3. First knockout tracking (party scenarios)
    if (result.finalVisitor?.isParty) {
      qualityData.hasParty = true;
      // Walk encounters to find first knockout
      let firstKO = null;
      for (const enc of result.encounters) {
        for (const snap of (enc.roundSnapshots || [])) {
          if (snap.partyMembers && snap.knockoutCount > 0 && !firstKO) {
            // Find which member is knocked out
            for (const [mk, ms] of Object.entries(snap.partyMembers)) {
              if (ms.status === 'knocked_out') {
                firstKO = mk;
                break;
              }
            }
          }
          if (firstKO) break;
        }
        if (firstKO) break;
      }
      if (firstKO) {
        qualityData.firstKnockouts[firstKO] = (qualityData.firstKnockouts[firstKO] || 0) + 1;
      }
    }

    // 4. Multi-room attrition: capture visitor state at room entry
    if (qualityData.isMultiRoom && result.encounters.length > 1) {
      for (let ei = 1; ei < result.encounters.length; ei++) {
        const enc = result.encounters[ei];
        const snaps = enc.roundSnapshots || [];
        if (snaps.length > 0) {
          const firstSnap = snaps[0]; // Round 1 snapshot ≈ entry state
          const roomKey = `Room ${ei + 1} (${enc.name})`;
          if (!qualityData.roomEntryStates[roomKey]) {
            qualityData.roomEntryStates[roomKey] = { vitality: [], resolve: [], nerve: [] };
          }
          const entry = qualityData.roomEntryStates[roomKey];
          entry.vitality.push(firstSnap.visitor.vitality);
          entry.resolve.push(firstSnap.visitor.resolve);
          entry.nerve.push(firstSnap.visitor.nerve);
        }
      }
    }

    // ─── Existing per-encounter aggregation (unchanged) ───
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

  // ─── Build summary (existing) ───
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

  // ─── v2.5: Compute quality metrics ───
  const visitorStarting = scenario.visitorTemplate?.startingValues ||
    (scenario.visitorTemplate?.type === 'party'
      ? (() => {
          // Compute party starting values for attrition curve
          const members = scenario.visitorTemplate.members || {};
          const totalVit = Object.values(members).reduce((s, m) => s + (m.vitality || 0), 0);
          return {
            vitality: totalVit,
            resolve: scenario.visitorTemplate.resolve || 14,
            nerve: scenario.visitorTemplate.nerve || 16,
          };
        })()
      : { vitality: 28, resolve: 14, nerve: 14 }); // Fallback defaults

  summary.qualityMetrics = {
    agency: QM.computeAgencyScore(qualityData.leadChanges),
    closeness: QM.computeClosenessScore(qualityData.closeness),
    outcomeDiversity: QM.computeOutcomeDiversity(summary.outcomeDistribution),
    knockoutPatterns: qualityData.hasParty
      ? QM.computeKnockoutDiversity(qualityData.firstKnockouts)
      : null,
    attritionCurve: qualityData.isMultiRoom
      ? QM.computeAttritionCurve(qualityData.roomEntryStates, visitorStarting)
      : null,
  };

  summary.qualityMetrics.healthIssues = QM.assessHealth(summary.qualityMetrics);

  return summary;
}

module.exports = { runSequence, runBatch };