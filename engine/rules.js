/**
 * SHATTERED DUNGEON — Rules Engine v1.1
 * 
 * CHANGES from v1.0:
 * [FIX] Separate modifier mappings for dungeon vs visitor attributes
 * [FIX] States now track which side they belong to (side: 'dungeon'|'visitor')
 * [FIX] Conditions require placedBy field for source tracking
 * [FIX] Entangle stored as object (not bare string) for consistency
 */

// ═══ DICE ═══

function rollD6() { return Math.floor(Math.random() * 6) + 1; }

function contestedRoll(advantage = 0) {
  if (advantage > 0) {
    const dice = [rollD6(), rollD6(), rollD6()].sort((a, b) => b - a);
    return { dice, kept: [dice[0], dice[1]], total: dice[0] + dice[1] };
  } else if (advantage < 0) {
    const dice = [rollD6(), rollD6(), rollD6()].sort((a, b) => a - b);
    return { dice, kept: [dice[0], dice[1]], total: dice[0] + dice[1] };
  }
  const dice = [rollD6(), rollD6()];
  return { dice, kept: dice, total: dice[0] + dice[1] };
}

// ═══ RESOLUTION TIERS ═══

function resolveTier(attackerTotal, defenderTotal) {
  const margin = attackerTotal - defenderTotal;
  // v1.3: Widened Partial from [-1,+1] to [-2,+1], Stalemate now [-4,-3]
  if (margin >= 5)  return { tier: 'Devastating', atkMult: 1.5, defMult: 0   };
  if (margin >= 2)  return { tier: 'Strong',      atkMult: 1.0, defMult: 0   };
  if (margin >= -2) return { tier: 'Partial',     atkMult: 0.5, defMult: 0.5 };
  if (margin >= -4) return { tier: 'Stalemate',   atkMult: 0,   defMult: 1.0 };
  return                    { tier: 'Reversal',    atkMult: 0,   defMult: 1.5 };
}

// ═══ RESOURCES ═══

function createVisitorState(t) {
  return {
    vitality: t.vitality, resolve: t.resolve, nerve: t.nerve,
    trust: t.trust || 0,
    modifiers: { ...(t.modifiers || {}) },
    side: 'visitor',
    emotionalState: 'neutral',
    conditions: [],
    startingValues: { vitality: t.vitality, resolve: t.resolve, nerve: t.nerve, trust: t.trust || 0 },
  };
}

function createDungeonState(t) {
  return {
    structure: t.structure, veil: t.veil, presence: t.presence,
    rapport: t.rapport || 0,
    modifiers: { ...(t.modifiers || {}) },
    side: 'dungeon',
    conditions: [],
    startingValues: { structure: t.structure, veil: t.veil, presence: t.presence, rapport: t.rapport || 0 },
  };
}

// ═══ WIN CONDITIONS ═══

function checkWinConditions(visitor, dungeon, config = {}) {
  const bt = config.bondThreshold || 12;
  if (visitor.vitality  <= 0) return { winner: 'dungeon', condition: 'Kill',     desc: 'Vitality depleted' };
  if (visitor.resolve   <= 0) return { winner: 'dungeon', condition: 'Break',    desc: 'Resolve shattered' };
  if (visitor.nerve     <= 0) return { winner: 'dungeon', condition: 'Panic',    desc: 'Nerve broken' };
  if (dungeon.structure <= 0) return { winner: 'visitor', condition: 'Overcome', desc: 'Structure breached' };
  if (dungeon.veil      <= 0) return { winner: 'visitor', condition: 'Inert',    desc: 'Veil depleted' };
  if (dungeon.presence  <= 0) return { winner: 'visitor', condition: 'Dominate', desc: 'Presence overwhelmed' };
  if (visitor.trust >= bt && dungeon.rapport >= bt)
    return { winner: 'both', condition: 'Bond', desc: 'Mutual trust established' };
  return null;
}

// ═══ ENERGY SYSTEM ═══

function createEnergyPool(base = 2) {
  return {
    base, spent: 0, tempBonus: 0,
    get available() { return this.base + this.tempBonus - this.spent; },
    canAfford(cost) { return this.available >= cost; },
    spend(cost) { if (!this.canAfford(cost)) return false; this.spent += cost; return true; },
    addPermanent(n) { this.base += n; },
    addTemp(n) { this.tempBonus += n; },
    refresh() { this.spent = 0; this.tempBonus = 0; },
  };
}

// ═══ DAMAGE & BENEFIT ═══

function applyDamage(state, resource, basePower, multiplier) {
  // v1.3: Minimum 1 damage when multiplier > 0 (non-Stalemate)
  let dmg = Math.floor(basePower * multiplier);
  if (multiplier > 0 && basePower > 0 && dmg < 1) dmg = 1;
  if (dmg <= 0) return 0;
  if (state[resource] !== undefined) state[resource] = Math.max(0, state[resource] - dmg);
  return dmg;
}

function applyBenefit(state, resource, amount) {
  if (state[resource] !== undefined) state[resource] += amount;
  return amount;
}

// ═══ MODIFIER BONUSES ═══
// Dungeon attributes: dominion, resonance, presence_attr, memory
// Visitor attributes: strength, cunning, perception, resilience
// These are INTENTIONALLY different per the design docs.

const DUNGEON_TYPE_ATTR_MAP = {
  Physical: 'dominion',
  Environmental: 'resonance',
  Social: 'presence_attr',
  Mystical: 'memory',
};

const VISITOR_TYPE_ATTR_MAP = {
  Physical: 'strength',
  Environmental: 'resilience',
  Social: 'cunning',
  Mystical: 'perception',
};

const NATURAL_AFFINITIES = {
  Physical:      ['vitality', 'structure'],
  Environmental: ['vitality', 'structure', 'nerve'],
  Social:        ['resolve', 'trust', 'presence', 'rapport'],
  Mystical:      ['veil', 'nerve', 'resolve'],
};

function getModifierBonus(card, playerState) {
  if (!card || !card.type) return 0;
  const attrMap = playerState.side === 'dungeon' ? DUNGEON_TYPE_ATTR_MAP : VISITOR_TYPE_ATTR_MAP;
  const attrKey = attrMap[card.type];
  const attrVal = (playerState.modifiers || {})[attrKey] || 0;
  const isNatural = (NATURAL_AFFINITIES[card.type] || []).includes(card.target);
  return isNatural ? attrVal : Math.floor(attrVal / 2);
}

// ═══ CONDITION HELPERS ═══

/** Check if a state has a specific condition type */
function hasCondition(state, condType) {
  return state.conditions.some(c => c.type === condType);
}

/** Find conditions on a state placed by a specific side */
function findConditionsBy(state, condType, placedBy) {
  return state.conditions.filter(c => c.type === condType && c.placedBy === placedBy);
}

/** Remove first matching condition, return it or null */
function removeCondition(state, condType, placedBy) {
  const idx = state.conditions.findIndex(c => c.type === condType && c.placedBy === placedBy);
  if (idx < 0) return null;
  return state.conditions.splice(idx, 1)[0];
}

// ═══ ERODE RESOLUTION ═══

function resolveErode(state, autoEffectResource, log) {
  const keep = [];
  for (const c of state.conditions) {
    if (c.type === 'erode') {
      if (c.resource !== autoEffectResource) {
        const dmg = applyDamage(state, c.resource, c.amount, 1);
        log(`    [Erode] ${c.resource} -${dmg}`);
      } else {
        log(`    [Erode] ${c.resource} SUPPRESSED (auto-effect match)`);
      }
      // Erode expires after 1 round
    } else {
      keep.push(c);
    }
  }
  state.conditions = keep;
}

// ═══ KEYWORD APPLICATION ═══

function applyKeywords(card, targetState, _sourceState, ctx) {
  const kws = card.keywords || [];
  const log = ctx.log || (() => {});
  const side = ctx.activeSide;
  for (const kw of kws) {
    switch (kw) {
      case 'Entangle':
        if (!hasCondition(targetState, 'entangled')) {
          targetState.conditions.push({ type: 'entangled', placedBy: side });
          log(`    [KW] Entangle applied`);
        }
        break;
      case 'Erode':
        if (ctx.autoResource !== card.target) {
          targetState.conditions.push({ type: 'erode', resource: card.target, amount: 1, placedBy: side });
          log(`    [KW] Erode: ${card.target} -1 next round`);
        } else {
          log(`    [KW] Erode SUPPRESSED (matches auto-effect)`);
        }
        break;
      case 'Drain': log(`    [KW] Drain: resource conversion`); break;
      case 'Insight': log(`    [KW] Insight: info revealed`); break;
      case 'Ward':
        targetState.conditions.push({ type: 'ward', duration: 1, placedBy: side });
        log(`    [KW] Ward applied`);
        break;
    }
  }
}

// ═══ ESCALATION ═══

function getEscalation(round, config = {}) {
  const start = config.escalationStart || 8;
  const rate = config.escalationRate || 1;
  if (round < start) return null;
  return { damage: rate + Math.floor((round - start) / 2) };
}

// ═══ HAND MANAGEMENT ═══

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawOpeningHand(deck, handSize = 7, maxMulls = 3) {
  for (let i = 0; i <= maxMulls; i++) {
    const s = shuffle(deck);
    const hand = s.slice(0, handSize);
    const rest = s.slice(handSize);
    if (hand.filter(c => c.category === 'Energy').length >= 2 &&
        hand.filter(c => c.category !== 'Energy').length >= 3) {
      return { hand, drawPile: rest, mulligans: i };
    }
  }
  const s = shuffle(deck);
  return { hand: s.slice(0, handSize), drawPile: s.slice(handSize), mulligans: maxMulls };
}

function drawCards(drawPile, discard, count) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    if (drawPile.length === 0) {
      if (discard.length === 0) break;
      drawPile.push(...shuffle(discard.splice(0)));
    }
    drawn.push(drawPile.shift());
  }
  return drawn;
}

// ═══ EXPORTS ═══
module.exports = {
  rollD6, contestedRoll, resolveTier,
  createVisitorState, createDungeonState,
  checkWinConditions, createEnergyPool,
  applyDamage, applyBenefit, applyKeywords,
  resolveErode, getModifierBonus, getEscalation,
  shuffle, drawOpeningHand, drawCards,
  hasCondition, findConditionsBy, removeCondition,
};