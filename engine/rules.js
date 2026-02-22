/**
 * SHATTERED DUNGEON — Rules Engine v2.4
 * 
 * v1.1: Separate modifier mappings, side tracking, condition source tracking
 * v2.4: Party system support — createPartyVisitorState, member damage/restore,
 *       knockout mechanics, card removal helpers, party-aware win conditions
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

function createPartyVisitorState(t) {
  // Build individual member states
  const members = {};
  for (const [key, m] of Object.entries(t.members)) {
    members[key] = {
      vitality: m.vitality,
      maxVitality: m.vitality,
      status: 'active', // 'active' | 'knocked_out'
      name: m.name,
      role: m.role,
      resolveContribution: m.resolveContribution || 0,
      nerveContribution: m.nerveContribution || 0,
    };
  }

  // Compute aggregate vitality for display/health% calculations
  const totalVitality = Object.values(members).reduce((s, m) => s + m.vitality, 0);

  return {
    // Collective pools (existing fields — AI and encounter code sees these)
    vitality: totalVitality,
    resolve: t.resolve,
    nerve: t.nerve,
    trust: t.trust || 0,

    // Party-specific fields
    isParty: true,
    members,
    knockoutCount: 0,
    killThreshold: t.killThreshold || 2,
    knockoutMorale: t.knockoutMorale || [
      { resolveHit: 3, nerveHit: 3 },
      { resolveHit: 6, nerveHit: 6 },
    ],
    partySize: t.partySize || Object.keys(t.members).length,

    // Existing fields (preserved for compatibility)
    modifiers: { ...(t.modifiers || {}) },
    side: 'visitor',
    emotionalState: 'neutral',
    conditions: [],
    startingValues: {
      vitality: totalVitality,
      resolve: t.resolve,
      nerve: t.nerve,
      trust: t.trust || 0,
    },
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

  // Party Kill: based on knockout threshold, not raw vitality
  if (visitor.isParty) {
    if (visitor.knockoutCount >= visitor.killThreshold) {
      return { winner: 'dungeon', condition: 'Kill', desc: `${visitor.knockoutCount} party members eliminated` };
    }
  } else {
    if (visitor.vitality <= 0) return { winner: 'dungeon', condition: 'Kill', desc: 'Vitality depleted' };
  }

  // These work identically for solo and party (collective pools)
  if (visitor.resolve   <= 0) return { winner: 'dungeon', condition: 'Break',    desc: 'Resolve shattered' };
  if (visitor.nerve     <= 0) return { winner: 'dungeon', condition: 'Panic',    desc: 'Nerve broken' };
  if (dungeon.structure <= 0) return { winner: 'visitor', condition: 'Overcome', desc: 'Structure breached' };
  if (dungeon.veil      <= 0) return { winner: 'visitor', condition: 'Inert',    desc: 'Veil depleted' };
  if (dungeon.presence  <= 0) return { winner: 'visitor', condition: 'Dominate', desc: 'Presence overwhelmed' };
//  if (visitor.trust >= bt && dungeon.rapport >= bt)
//   return { winner: 'both', condition: 'Bond', desc: 'Mutual trust established' };
  // Bond v3.0: triggers via Covenant acceptance, not threshold.
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
  if (state[resource] === undefined) return 0;
  const before = state[resource];
  state[resource] += amount;
  // Cap reducer resources at starting values (no overheal)
  // Promoters (trust, rapport) are uncapped — they must grow toward Bond threshold
  if (state.startingValues && state.startingValues[resource] !== undefined
      && resource !== 'trust' && resource !== 'rapport') {
    state[resource] = Math.min(state[resource], state.startingValues[resource]);
  }
  return state[resource] - before;
}

// ═══ PARTY DAMAGE & RESTORATION ═══

/**
 * Apply vitality damage to a specific party member.
 * Returns { damaged, knockout, memberKey, moraleCascade } event data.
 */
function damagePartyMember(visitor, memberKey, amount) {
  const member = visitor.members[memberKey];
  if (!member || member.status !== 'active') return { damaged: 0, knockout: false };

  const before = member.vitality;
  member.vitality = Math.max(0, member.vitality - amount);
  const damaged = before - member.vitality;

  // Update aggregate vitality for health% display
  visitor.vitality = Object.values(visitor.members)
    .filter(m => m.status === 'active')
    .reduce((s, m) => s + m.vitality, 0);

  const result = { damaged, knockout: false, memberKey };

  // Check for knockout
  if (member.vitality <= 0 && before > 0) {
    member.status = 'knocked_out';
    visitor.knockoutCount++;
    result.knockout = true;

    // Morale cascade — apply resolve/nerve damage to collective pool
    const cascadeIdx = Math.min(visitor.knockoutCount - 1, visitor.knockoutMorale.length - 1);
    const cascade = visitor.knockoutMorale[cascadeIdx];
    if (cascade) {
      const resDmg = Math.min(cascade.resolveHit, visitor.resolve);
      const nrvDmg = Math.min(cascade.nerveHit, visitor.nerve);
      visitor.resolve = Math.max(0, visitor.resolve - cascade.resolveHit);
      visitor.nerve = Math.max(0, visitor.nerve - cascade.nerveHit);
      result.moraleCascade = { resolveHit: resDmg, nerveHit: nrvDmg };
    }
  }

  return result;
}

/**
 * Restore a knocked-out party member (e.g., Healing Word).
 * Returns { restored, memberKey, vitality } event data.
 */
function restorePartyMember(visitor, memberKey, healAmount) {
  const member = visitor.members[memberKey];
  if (!member || member.status !== 'knocked_out') return { restored: false };

  member.status = 'active';
  member.vitality = Math.min(healAmount, member.maxVitality);
  visitor.knockoutCount = Math.max(0, visitor.knockoutCount - 1);

  // Update aggregate vitality
  visitor.vitality = Object.values(visitor.members)
    .filter(m => m.status === 'active')
    .reduce((s, m) => s + m.vitality, 0);

  return { restored: true, memberKey, vitality: member.vitality };
}

/**
 * Remove a knocked-out member's cards from hand, draw pile, and discard.
 * Returns { newHand, removed, from: { hand, draw, discard } } for logging.
 */
function removeKnockedOutCards(memberKey, hand, drawPile, discard) {
  const result = { removed: [], from: { hand: 0, draw: 0, discard: 0 } };

  const filterOut = (arr, source) => {
    const kept = [];
    for (const card of arr) {
      if (card.member === memberKey) {
        result.removed.push(card.name);
        result.from[source]++;
      } else {
        kept.push(card);
      }
    }
    return kept;
  };

  const newHand = filterOut(hand, 'hand');

  // Mutate draw/discard in place (preserve references used by encounter loop)
  const newDraw = filterOut(drawPile, 'draw');
  drawPile.length = 0;
  drawPile.push(...newDraw);

  const newDiscard = filterOut(discard, 'discard');
  discard.length = 0;
  discard.push(...newDiscard);

  return { newHand, ...result };
}

/**
 * Return a restored member's cards to the discard pile.
 * Cards come from the original full deck (passed as param).
 */
function returnMemberCards(memberKey, fullDeck, discard) {
  const memberCards = fullDeck.filter(c => c.member === memberKey);
  discard.push(...memberCards);
  return memberCards.map(c => c.name);
}

/**
 * Select best target for dungeon to attack in a party.
 * strategies: 'lowest_vitality', 'highest_vitality', 'random', or a specific member key
 */
function selectPartyTarget(visitor, strategy = 'lowest_vitality') {
  const active = Object.entries(visitor.members)
    .filter(([_, m]) => m.status === 'active')
    .map(([key, m]) => ({ key, ...m }));

  if (active.length === 0) return null;
  if (active.length === 1) return active[0].key;

  switch (strategy) {
    case 'lowest_vitality':
      return active.sort((a, b) => a.vitality - b.vitality)[0].key;
    case 'highest_vitality':
      return active.sort((a, b) => b.vitality - a.vitality)[0].key;
    case 'random':
      return active[Math.floor(Math.random() * active.length)].key;
    default:
      // If strategy is a member key, target directly
      if (visitor.members[strategy]?.status === 'active') return strategy;
      return active.sort((a, b) => a.vitality - b.vitality)[0].key;
  }
}

// ═══ MODIFIER BONUSES ═══

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

function hasCondition(state, condType) {
  return state.conditions.some(c => c.type === condType);
}

function findConditionsBy(state, condType, placedBy) {
  return state.conditions.filter(c => c.type === condType && c.placedBy === placedBy);
}

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
export { rollD6, contestedRoll, resolveTier, createVisitorState, createPartyVisitorState, createDungeonState, checkWinConditions, createEnergyPool, applyDamage, applyBenefit, applyKeywords, damagePartyMember, restorePartyMember, removeKnockedOutCards, returnMemberCards, selectPartyTarget, resolveErode, getModifierBonus, getEscalation, shuffle, drawOpeningHand, drawCards, hasCondition, findConditionsBy, removeCondition };