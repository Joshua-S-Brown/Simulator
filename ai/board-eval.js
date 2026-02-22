/**
 * SHATTERED DUNGEON — Board State Evaluator v1.0
 * 
 * Evaluates a board state from a given side's perspective.
 * Returns a score from -100 (certain loss) to +100 (certain win).
 * 0 = dead even.
 * 
 * Used by MC simulator to evaluate the expected outcome of card plays.
 */

/**
 * Evaluate the board state from `side`'s perspective.
 * @param {object} self - The evaluating side's state
 * @param {object} opponent - The opponent's state
 * @param {string} side - 'dungeon' or 'visitor'
 * @param {object} ctx - Context: { encounter, round, cardTracker }
 * @returns {number} Score from -100 to +100
 */
function evaluateBoard(self, opponent, side, ctx = {}) {
  const round = ctx.round || 1;

  // — REDUCER ANALYSIS —
  const selfReducers = getReducers(self, side);
  const oppReducers = getReducers(opponent, side === 'dungeon' ? 'visitor' : 'dungeon');

  // Proximity to win: how close is opponent's weakest reducer to 0?
  const oppMinRatio = Math.min(...oppReducers.map(r => r.ratio));
  const selfMinRatio = Math.min(...selfReducers.map(r => r.ratio));

  // If we've won or lost
  if (oppMinRatio <= 0) return 100;
  if (selfMinRatio <= 0) return -100;

  // — HEALTH ADVANTAGE (40 pts max) —
  // Compare overall health pools
  const selfAvgHealth = selfReducers.reduce((s, r) => s + r.ratio, 0) / selfReducers.length;
  const oppAvgHealth = oppReducers.reduce((s, r) => s + r.ratio, 0) / oppReducers.length;
  const healthDelta = selfAvgHealth - oppAvgHealth; // -1 to +1
  const healthScore = healthDelta * 25;

  // — VULNERABILITY ADVANTAGE (30 pts max) —
  // More weight on who's closer to losing a reducer
  const vulnDelta = (1 - oppMinRatio) - (1 - selfMinRatio); // positive = opp more vulnerable
  const vulnScore = vulnDelta * 35;

  // — LETHAL PROXIMITY (20 pts max) —
  // Big bonus when opponent is near death on any reducer
  let lethalScore = 0;
  for (const r of oppReducers) {
    if (r.val > 0 && r.val <= 2) lethalScore += 15;
    else if (r.val > 0 && r.val <= 4) lethalScore += 8;
    else if (r.val > 0 && r.val <= 6) lethalScore += 3;
  }
  // Penalty when WE are near death
  for (const r of selfReducers) {
    if (r.val > 0 && r.val <= 2) lethalScore -= 15;
    else if (r.val > 0 && r.val <= 4) lethalScore -= 8;
    else if (r.val > 0 && r.val <= 6) lethalScore -= 3;
  }

  // — CONDITION ADVANTAGE (15 pts max) —
  let condScore = 0;
  // Our empowers are good
  const ourEmpowers = self.conditions.filter(c => c.type === 'empower' && c.placedBy === side);
  condScore += ourEmpowers.length * 3;
  // Disrupts on opponent are good (we placed them)
  const ourDisrupts = opponent.conditions.filter(c => c.type === 'disrupt' && c.placedBy === side);
  condScore += ourDisrupts.length * 2.5;
  // Opponent's empowers are bad for us
  const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
  const oppEmpowers = opponent.conditions.filter(c => c.type === 'empower' && c.placedBy === oppSide);
  condScore -= oppEmpowers.length * 3;
  // Disrupts on us are bad
  const oppDisrupts = self.conditions.filter(c => c.type === 'disrupt' && c.placedBy === oppSide);
  condScore -= oppDisrupts.length * 2.5;
  // Fortify is good for us
  const ourFortify = self.conditions.filter(c => c.type === 'fortify');
  condScore += ourFortify.length * 2;
  // Our traps are good (hidden potential)
  const ourTraps = self.conditions.filter(c => c.type === 'trap');
  condScore += ourTraps.length * 1.5;
  // Entangled is bad for whoever has it
  if (self.conditions.some(c => c.type === 'entangled')) condScore -= 3;
  if (opponent.conditions.some(c => c.type === 'entangled')) condScore += 3;

  // — BOND PROXIMITY (for nurturing/cooperative goals) —
  let bondScore = 0;
  if (ctx.goalType === 'bond') {
    const bt = ctx.bondThreshold || 6;
    const trust = side === 'dungeon' ? opponent.trust : self.trust;
    const rapport = side === 'dungeon' ? self.rapport : opponent.rapport;
    const bondProgress = ((trust / bt) + (rapport / bt)) / 2;
    bondScore = bondProgress * 30; // Up to 30 pts for bond progress
  }

  // — TIME PRESSURE (5 pts max) —
  // Auto-effects and escalation favor whoever's winning
  const timeFactor = Math.min(round / 15, 1);
  const autoEffects = ctx.encounter?.autoEffects || [];
  let autoAdvantage = 0;
  for (const ae of autoEffects) {
    if (ae.amount < 0) {
      // Damage auto-effect — bad for target
      if (ae.target === side) autoAdvantage -= Math.abs(ae.amount) * (ae.frequency === 'every' ? 1 : 0.5);
      else autoAdvantage += Math.abs(ae.amount) * (ae.frequency === 'every' ? 1 : 0.5);
    }
  }
  const timeScore = autoAdvantage * timeFactor * 3;

  // Combine and clamp
  const raw = healthScore + vulnScore + lethalScore + condScore + bondScore + timeScore;
  return Math.max(-100, Math.min(100, Math.round(raw)));
}

/**
 * Get reducer info for a side.
 */
function getReducers(state, side) {
  if (side === 'dungeon') {
    const sv = state.startingValues || { structure: 16, veil: 14, presence: 12 };
    return [
      { name: 'structure', val: state.structure, start: sv.structure, ratio: state.structure / sv.structure },
      { name: 'veil', val: state.veil, start: sv.veil, ratio: state.veil / sv.veil },
      { name: 'presence', val: state.presence, start: sv.presence, ratio: state.presence / sv.presence },
    ];
  } else {
    const sv = state.startingValues || { vitality: 20, resolve: 16, nerve: 16 };
    return [
      { name: 'vitality', val: state.vitality, start: sv.vitality, ratio: state.vitality / sv.vitality },
      { name: 'resolve', val: state.resolve, start: sv.resolve, ratio: state.resolve / sv.resolve },
      { name: 'nerve', val: state.nerve, start: sv.nerve, ratio: state.nerve / sv.nerve },
    ];
  }
}

export { evaluateBoard, getReducers };