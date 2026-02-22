/**
 * SHATTERED DUNGEON — Encounter Quality Metrics v1.0
 * 
 * Implements GDD Section 18: five formal quality metrics that replace
 * raw win percentages as the primary balance evaluation criteria.
 * 
 * Metrics:
 *   1. Agency Score — lead changes per encounter
 *   2. Closeness at Resolution — losing side's nearest resource %
 *   3. Outcome Diversity — Shannon entropy across win conditions
 *   4. Knockout Pattern Diversity — first-knockout distribution (party only)
 *   5. Multi-Room Attrition Curve — per-room entry states (multi-room only)
 * 
 * All functions are pure computations over collected iteration data.
 * No engine or encounter dependencies — just math on arrays of numbers.
 */

// ═══ 1. AGENCY SCORE ═══

/**
 * Count lead changes in a single encounter's round snapshots.
 * A lead change occurs when the `lead` field transitions between
 * 'dungeon' and 'visitor' (tied rounds don't count as changes).
 * 
 * @param {Array} snapshots - Round snapshots with .lead field
 * @returns {number} Number of lead changes
 */
function countLeadChanges(snapshots) {
  if (!snapshots || snapshots.length < 2) return 0;
  let changes = 0;
  let lastLead = null;
  for (const snap of snapshots) {
    if (snap.lead === 'tied') continue; // Ties don't establish or break leads
    if (lastLead !== null && snap.lead !== lastLead) changes++;
    lastLead = snap.lead;
  }
  return changes;
}

/**
 * Compute agency score from an array of per-iteration lead change counts.
 * 
 * @param {number[]} leadChangeCounts - One entry per iteration
 * @returns {object} { average, distribution: { 0: N, 1: N, 2: N, '3+': N }, assessment }
 */
function computeAgencyScore(leadChangeCounts) {
  if (!leadChangeCounts.length) return { average: 0, distribution: {}, assessment: 'no data' };

  const total = leadChangeCounts.reduce((s, v) => s + v, 0);
  const average = +(total / leadChangeCounts.length).toFixed(2);

  // Distribution buckets: 0, 1, 2, 3+
  const dist = { 0: 0, 1: 0, 2: 0, '3+': 0 };
  for (const c of leadChangeCounts) {
    if (c === 0) dist[0]++;
    else if (c === 1) dist[1]++;
    else if (c === 2) dist[2]++;
    else dist['3+']++;
  }
  // Convert to percentages
  const n = leadChangeCounts.length;
  const distPct = {};
  for (const [k, v] of Object.entries(dist)) {
    distPct[k] = { count: v, pct: +((v / n) * 100).toFixed(1) };
  }

  let assessment;
  if (average < 1.0) assessment = 'LOW — one side dominates from start';
  else if (average <= 4.0) assessment = 'HEALTHY';
  else assessment = 'HIGH — outcomes may feel random';

  return { average, distribution: distPct, assessment };
}

// ═══ 2. CLOSENESS AT RESOLUTION ═══

/**
 * Compute closeness for a single iteration.
 * Examines the LOSING side's remaining resources as % of starting values.
 * Returns the lowest non-depleted resource % (closest alternative outcome).
 * 
 * @param {object} outcome - { winner, condition }
 * @param {object} finalVisitor - End-state visitor resources + startingValues
 * @param {object} finalDungeon - End-state dungeon resources + startingValues
 * @returns {number|null} Lowest non-depleted resource % on losing side (0-100), or null if Bond/N/A
 */
function computeIterationCloseness(outcome, finalVisitor, finalDungeon) {
  if (!outcome || !finalVisitor || !finalDungeon) return null;
  if (outcome.condition === 'Bond') return null; // Both sides win — closeness N/A

  const loser = outcome.winner === 'dungeon' ? 'visitor' : 'dungeon';

  if (loser === 'visitor') {
    const sv = finalVisitor.startingValues || {};
    // Check all visitor reducers that WEREN'T the one that hit zero
    const resources = [];
    if (outcome.condition !== 'Kill' && sv.vitality > 0) {
      // For party: use aggregate vitality
      const vit = finalVisitor.vitality;
      const startVit = sv.vitality || 1;
      resources.push(Math.max(0, (vit / startVit) * 100));
    }
    if (outcome.condition !== 'Break' && sv.resolve > 0)
      resources.push(Math.max(0, (finalVisitor.resolve / (sv.resolve || 1)) * 100));
    if (outcome.condition !== 'Panic' && sv.nerve > 0)
      resources.push(Math.max(0, (finalVisitor.nerve / (sv.nerve || 1)) * 100));
    // Survive = visitor wins, so we check dungeon side instead
    if (outcome.condition === 'Survive') return computeLoserCloseness('dungeon', finalDungeon);

    return resources.length ? +Math.min(...resources).toFixed(1) : null;
  } else {
    return computeLoserCloseness('dungeon', finalDungeon);
  }
}

function computeLoserCloseness(side, finalState) {
  if (side !== 'dungeon') return null;
  const sv = finalState.startingValues || {};
  const resources = [];
  // Dungeon loses if any of structure/veil/presence hits 0
  // Check the ones that DIDN'T hit 0
  if (finalState.structure > 0 && sv.structure > 0)
    resources.push((finalState.structure / sv.structure) * 100);
  if (finalState.veil > 0 && sv.veil > 0)
    resources.push((finalState.veil / sv.veil) * 100);
  if (finalState.presence > 0 && sv.presence > 0)
    resources.push((finalState.presence / sv.presence) * 100);
  return resources.length ? +Math.min(...resources).toFixed(1) : null;
}

/**
 * Aggregate closeness values across iterations.
 * 
 * @param {number[]} closenessValues - One entry per iteration (nulls filtered out)
 * @returns {object} { average, median, assessment }
 */
function computeClosenessScore(closenessValues) {
  const valid = closenessValues.filter(v => v !== null && v !== undefined);
  if (!valid.length) return { average: null, median: null, assessment: 'no data' };

  const avg = +(valid.reduce((s, v) => s + v, 0) / valid.length).toFixed(1);
  const sorted = [...valid].sort((a, b) => a - b);
  const median = +sorted[Math.floor(sorted.length / 2)].toFixed(1);

  let assessment;
  if (avg < 10) assessment = 'VERY CLOSE — knife-edge, potentially too random';
  else if (avg <= 40) assessment = 'HEALTHY';
  else if (avg <= 60) assessment = 'MODERATE — primary win condition dominates';
  else assessment = 'LOW — only one outcome ever in play';

  return { average: avg, median, validSamples: valid.length, assessment };
}

// ═══ 3. OUTCOME DIVERSITY (SHANNON ENTROPY) ═══

/**
 * Compute Shannon entropy for a distribution.
 * 
 * @param {object} outcomeDistribution - { Kill: { count, pct }, Break: { count, pct }, ... }
 * @returns {object} { raw, normalized, assessment, possibleOutcomes }
 */
function computeOutcomeDiversity(outcomeDistribution) {
  const counts = Object.values(outcomeDistribution).map(v => v.count || v);
  const total = counts.reduce((s, v) => s + v, 0);
  if (total === 0) return { raw: 0, normalized: 0, assessment: 'no data', possibleOutcomes: 0 };

  const probabilities = counts.filter(c => c > 0).map(c => c / total);
  const possibleOutcomes = probabilities.length;

  // Shannon entropy: H = -Σ(p * log2(p))
  let H = 0;
  for (const p of probabilities) {
    if (p > 0) H -= p * Math.log2(p);
  }

  // Normalize by max possible entropy (log2 of all 8 win conditions)
  const maxEntropy = Math.log2(8); // 3.0 bits
  const normalized = +(H / maxEntropy).toFixed(3);
  const raw = +H.toFixed(3);

  let assessment;
  if (normalized < 0.35) assessment = 'LOW — severe outcome concentration';
  else if (normalized <= 0.85) assessment = 'HEALTHY';
  else assessment = 'HIGH — no strategic identity';

  return { raw, normalized, possibleOutcomes, assessment };
}

// ═══ 4. KNOCKOUT PATTERN DIVERSITY (Party-Specific) ═══

/**
 * Compute knockout pattern diversity from first-knockout tracking.
 * 
 * @param {object} firstKnockoutCounts - { knight: N, battlemage: N, cleric: N, rogue: N }
 * @returns {object} { distribution, entropy, normalized, assessment }
 */
function computeKnockoutDiversity(firstKnockoutCounts) {
  if (!firstKnockoutCounts) return null;

  const counts = Object.values(firstKnockoutCounts);
  const total = counts.reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  // Distribution as percentages
  const distribution = {};
  for (const [member, count] of Object.entries(firstKnockoutCounts)) {
    distribution[member] = { count, pct: +((count / total) * 100).toFixed(1) };
  }

  // Shannon entropy
  const probabilities = counts.filter(c => c > 0).map(c => c / total);
  let H = 0;
  for (const p of probabilities) {
    if (p > 0) H -= p * Math.log2(p);
  }

  const memberCount = Object.keys(firstKnockoutCounts).length;
  const maxEntropy = memberCount > 1 ? Math.log2(memberCount) : 1;
  const normalized = +(H / maxEntropy).toFixed(3);

  let assessment;
  if (normalized < 0.50) assessment = 'LOW — targeting too deterministic';
  else if (normalized <= 0.90) assessment = 'HEALTHY';
  else assessment = 'HIGH — targeting may be unfocused';

  return { distribution, entropy: +H.toFixed(3), normalized, assessment };
}

// ═══ 5. MULTI-ROOM ATTRITION CURVE ═══

/**
 * Compute attrition curve from per-room entry state data.
 * 
 * @param {object} roomEntryData - { 'Room 2': { vitality: [vals], resolve: [vals], nerve: [vals] }, ... }
 * @param {object} startingValues - { vitality: N, resolve: N, nerve: N }
 * @returns {object} Per-room average entry percentages and assessment
 */
function computeAttritionCurve(roomEntryData, startingValues) {
  if (!roomEntryData || !Object.keys(roomEntryData).length) return null;

  const sv = startingValues || { vitality: 30, resolve: 14, nerve: 16 };
  const curve = {};

  for (const [room, data] of Object.entries(roomEntryData)) {
    const n = data.vitality.length;
    if (n === 0) continue;

    const avgVit = data.vitality.reduce((s, v) => s + v, 0) / n;
    const avgRes = data.resolve.reduce((s, v) => s + v, 0) / n;
    const avgNrv = data.nerve.reduce((s, v) => s + v, 0) / n;

    const vitPct = +((avgVit / (sv.vitality || 1)) * 100).toFixed(1);
    const resPct = +((avgRes / (sv.resolve || 1)) * 100).toFixed(1);
    const nrvPct = +((avgNrv / (sv.nerve || 1)) * 100).toFixed(1);
    const overallPct = +((vitPct + resPct + nrvPct) / 3).toFixed(1);

    let assessment;
    if (overallPct > 80) assessment = 'TOO EASY — previous room has little impact';
    else if (overallPct >= 55) assessment = 'HEALTHY';
    else if (overallPct >= 30) assessment = 'WORN — may be too attrited for meaningful play';
    else assessment = 'CRITICAL — entering nearly dead';

    curve[room] = {
      samples: n,
      avgVitalityPct: vitPct, avgResolvePct: resPct, avgNervePct: nrvPct,
      overallPct, assessment,
    };
  }

  return curve;
}

// ═══ HEALTH CHECK — Combined Assessment ═══

/**
 * Generate a combined health assessment from all metrics.
 * @param {object} metrics - All computed metrics
 * @returns {string[]} Array of issue descriptions (empty = healthy)
 */
function assessHealth(metrics) {
  const issues = [];

  if (metrics.agency?.average < 1.0)
    issues.push(`Agency too low (${metrics.agency.average}) — one side dominates from start`);
  if (metrics.agency?.average > 5.0)
    issues.push(`Agency too high (${metrics.agency.average}) — outcomes feel random`);

  if (metrics.closeness?.average !== null && metrics.closeness?.average > 60)
    issues.push(`Closeness too low (${metrics.closeness.average}%) — only one win condition in play`);

  if (metrics.outcomeDiversity?.normalized < 0.35)
    issues.push(`Outcome diversity too low (${metrics.outcomeDiversity.normalized}) — severe concentration`);

  if (metrics.knockoutPatterns?.normalized < 0.50)
    issues.push(`Knockout targeting too deterministic (${metrics.knockoutPatterns.normalized})`);

  if (metrics.attritionCurve) {
    for (const [room, data] of Object.entries(metrics.attritionCurve)) {
      if (data.overallPct < 30)
        issues.push(`${room} entry too low (${data.overallPct}%) — visitors entering nearly dead`);
      if (data.overallPct > 80)
        issues.push(`${room} entry too high (${data.overallPct}%) — previous room has little impact`);
    }
  }

  return issues;
}

export { // Per-iteration helpers
  countLeadChanges,
  computeIterationCloseness,
  // Batch aggregation
  computeAgencyScore,
  computeClosenessScore,
  computeOutcomeDiversity,
  computeKnockoutDiversity,
  computeAttritionCurve,
  // Health check
  assessHealth, };