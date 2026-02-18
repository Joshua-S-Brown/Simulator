/**
 * SHATTERED DUNGEON — Encounter Engine v1.4
 * 
 * CHANGES from v1.3:
 * [ADD] Restraint action: discard Strike for trust/rapport ("I choose not to hurt you")
 * [ADD] Per-round promoter gain cap (+2/round) prevents early-draw Bond avalanches
 * [FIX] Betrayal threshold raised to > 3 (no false positives on starting trust)
 */

const R = require('./rules');

/**
 * Apply a promoter gain (trust or rapport) with per-round cap.
 * Returns the actual amount applied (may be less than requested).
 */
function applyPromoterGain(target, resource, amount, ctx) {
  if (resource !== 'trust' && resource !== 'rapport') {
    // Not a promoter — apply normally
    R.applyBenefit(target, resource, amount);
    return amount;
  }
  const cap = ctx.promoterGainCap || 2;
  const start = resource === 'trust' ? (ctx.roundStartTrust || 0) : (ctx.roundStartRapport || 0);
  const current = target[resource] || 0;
  const gained = current - start;
  const room = Math.max(0, cap - gained);
  const actual = Math.min(amount, room);
  if (actual > 0) R.applyBenefit(target, resource, actual);
  return actual;
}

function runEncounter(encounter, dungeonDeck, visitorDeck, visitorTemplate,
                      dungeonTemplate, dungeonAI, visitorAI, config = {}, carryover = null) {

  const maxRounds = config.maxRounds || 15;
  const lines = [];
  const log = (msg) => { lines.push(msg); };

  // ─── STATE SETUP ───
  const visitor = carryover?.visitor || R.createVisitorState(visitorTemplate);
  const dungeon = carryover?.dungeon || R.createDungeonState(dungeonTemplate);
  const dEnergy = R.createEnergyPool(config.dungeonBaseEnergy || 2);
  const vEnergy = R.createEnergyPool(config.visitorBaseEnergy || 2);

  const dDraw = R.drawOpeningHand(dungeonDeck, config.handSize || 7);
  const vDraw = R.drawOpeningHand(visitorDeck, config.handSize || 7);
  let dHand = dDraw.hand, dPile = dDraw.drawPile, dDiscard = carryover?.dungeonDiscard || [];
  let vHand = vDraw.hand, vPile = vDraw.drawPile, vDiscard = carryover?.visitorDiscard || [];

  // Initialize deck trackers for smart AIs
  if (typeof dungeonAI.initDeck === 'function') dungeonAI.initDeck(dungeonDeck);
  if (typeof visitorAI.initDeck === 'function') visitorAI.initDeck(visitorDeck);

  // Bidirectional auto-effects: support both legacy single and new array format
  const autoEffects = encounter.autoEffects || (encounter.autoEffect ? [encounter.autoEffect] : []);
  // Legacy: first visitor-targeting auto-effect resource (for Erode, AI context)
  const autoResource = autoEffects.find(ae => ae.target === 'visitor')?.resource || null;

  log(`═══ ${encounter.name} ═══`);
  for (const ae of autoEffects) {
    const freq = ae.frequency === 'other' ? 'other round' : 'round';
    log(`  Auto: ${ae.target} ${ae.resource} ${ae.amount > 0 ? '+' : ''}${ae.amount}/${freq}`);
  }
  log(`  Dungeon: Str:${dungeon.structure} Vl:${dungeon.veil} Pr:${dungeon.presence} Rp:${dungeon.rapport}`);
  log(`  Visitor: Vit:${visitor.vitality} Res:${visitor.resolve} Nrv:${visitor.nerve} Tru:${visitor.trust}`);
  log(`  D-Hand: ${dHand.map(c => c.name).join(', ')}`);
  log(`  V-Hand: ${vHand.map(c => c.name).join(', ')}`);

  // Card play tracking for smarter AI
  const cardTracker = {
    dungeon: { Strike: 0, Empower: 0, Disrupt: 0, Counter: 0, React: 0, Trap: 0, Offer: 0, Reshape: 0, Test: 0 },
    visitor: { Strike: 0, Empower: 0, Disrupt: 0, Counter: 0, React: 0, Trap: 0, Offer: 0, Reshape: 0, Test: 0 },
  };

  let round = 0, outcome = null;
  const stats = {
    rounds: 0, dCardsPlayed: 0, vCardsPlayed: 0, decisions: 0,
    dDamageDealt: {}, vDamageDealt: {}, dLastType: null, vLastType: null,
  };
  const roundSnapshots = []; // Track per-round resource state

  // ─── MAIN LOOP ───
  while (round < maxRounds) {
    round++;
    stats.rounds = round;
    log(`\n── Round ${round} ──`);

    // Track promoter values at round start for per-round gain cap
    const roundStartTrust = visitor.trust || 0;
    const roundStartRapport = dungeon.rapport || 0;
    const promoterGainCap = config.promoterGainCap || 2;

    // 1. ENVIRONMENT PRESSURE (bidirectional)
    for (const ae of autoEffects) {
      const fires = ae.frequency === 'every' || (ae.frequency === 'other' && round % 2 === 1);
      if (fires && ae.resource && ae.amount !== 0) {
        const tgt = ae.target === 'visitor' ? visitor : dungeon;
        if (ae.amount < 0) R.applyDamage(tgt, ae.resource, Math.abs(ae.amount), 1);
        else R.applyBenefit(tgt, ae.resource, ae.amount);
        log(`  [Auto] ${ae.target} ${ae.resource} ${ae.amount > 0 ? '+' : ''}${ae.amount}`);
      }
    }
    R.resolveErode(visitor, autoResource, log);
    R.resolveErode(dungeon, autoResource, log);

    const esc = R.getEscalation(round, config);
    if (esc) {
      R.applyDamage(visitor, 'vitality', esc.damage, 1);
      R.applyDamage(dungeon, 'structure', esc.damage, 1);
      log(`  [Escalation] Both sides take ${esc.damage}`);
    }

    outcome = R.checkWinConditions(visitor, dungeon, config);
    if (outcome) { log(`  >>> ${outcome.condition}: ${outcome.desc}`); break; }

    // 2. TURN ORDER
    const dungeonFirst = encounter.initiative === 'dungeon';
    const firstSide = dungeonFirst ? 'dungeon' : 'visitor';
    const secondSide = dungeonFirst ? 'visitor' : 'dungeon';

    const sides = {
      dungeon: { hand: dHand, energy: dEnergy, self: dungeon, opp: visitor, ai: dungeonAI, discard: dDiscard },
      visitor: { hand: vHand, energy: vEnergy, self: visitor, opp: dungeon, ai: visitorAI, discard: vDiscard },
    };

    // 3. FIRST TURN — clear entangle on the acting side before they act
    clearEntangle(sides[firstSide].self, firstSide, log);
    const firstCtx = { encounter, round, stats, autoResource, log, activeSide: firstSide,
      opponentReactHand: sides[secondSide].hand, opponentSide: secondSide, cardTracker,
      bondThreshold: config.bondThreshold || 12,
      roundStartTrust, roundStartRapport, promoterGainCap };
    const firstResult = executeTurn(firstSide, sides[firstSide], firstCtx);
    sides[firstSide].hand = firstResult.remainingHand;
    for (const p of firstResult.plays) {
      sides[firstSide].discard.push(p.card);
      if (p.card.category && cardTracker[firstSide]) cardTracker[firstSide][p.card.category] = (cardTracker[firstSide][p.card.category] || 0) + 1;
      if (firstSide === 'dungeon') stats.dCardsPlayed++; else stats.vCardsPlayed++;
    }

    outcome = R.checkWinConditions(visitor, dungeon, config);
    if (outcome) { log(`  >>> ${outcome.condition}: ${outcome.desc}`); break; }

    // 4. SECOND TURN — clear entangle on acting side
    clearEntangle(sides[secondSide].self, secondSide, log);
    const secondCtx = { encounter, round, stats, autoResource, log, activeSide: secondSide,
      opponentReactHand: sides[firstSide].hand, opponentSide: firstSide, cardTracker,
      bondThreshold: config.bondThreshold || 12,
      roundStartTrust, roundStartRapport, promoterGainCap };
    const secondResult = executeTurn(secondSide, sides[secondSide], secondCtx);
    sides[secondSide].hand = secondResult.remainingHand;
    for (const p of secondResult.plays) {
      sides[secondSide].discard.push(p.card);
      if (p.card.category && cardTracker[secondSide]) cardTracker[secondSide][p.card.category] = (cardTracker[secondSide][p.card.category] || 0) + 1;
      if (secondSide === 'dungeon') stats.dCardsPlayed++; else stats.vCardsPlayed++;
    }

    outcome = R.checkWinConditions(visitor, dungeon, config);
    if (outcome) { log(`  >>> ${outcome.condition}: ${outcome.desc}`); break; }

    // 5. END OF ROUND
    dHand = sides.dungeon.hand;
    vHand = sides.visitor.hand;
    const drawPerRound = config.drawPerRound || 2;
    const minHandSize = config.minHandSize || 3;
    const dDrawCount = Math.max(drawPerRound, minHandSize - dHand.length);
    const vDrawCount = Math.max(drawPerRound, minHandSize - vHand.length);
    if (dDrawCount > 0) dHand.push(...R.drawCards(dPile, dDiscard, dDrawCount));
    if (vDrawCount > 0) vHand.push(...R.drawCards(vPile, vDiscard, vDrawCount));
    dEnergy.refresh();
    vEnergy.refresh();

    // Tick down fortify durations
    for (const state of [dungeon, visitor]) {
      state.conditions = state.conditions.filter(c => {
        if (c.type === 'fortify') {
          c.duration--;
          if (c.duration <= 0) {
            log(`    [Fortify] ${c.source} expires`);
            return false;
          }
        }
        return true;
      });
    }

    log(`  [EoR] V: Vit${visitor.vitality} Res${visitor.resolve} Nrv${visitor.nerve} Tru${visitor.trust} | D: Str${dungeon.structure} Vl${dungeon.veil} Pr${dungeon.presence} Rp${dungeon.rapport} | DE:${dEnergy.base} VE:${vEnergy.base}`);

    // Snapshot: track resource health percentages each round
    const dStart = dungeon.startingValues || { structure: 20, veil: 16, presence: 14 };
    const vStart = visitor.startingValues || { vitality: 20, resolve: 16, nerve: 16 };
    const dHealthPct = Math.round(
      ((dungeon.structure / dStart.structure) + (dungeon.veil / dStart.veil) + (dungeon.presence / dStart.presence)) / 3 * 100
    );
    const vHealthPct = Math.round(
      ((visitor.vitality / vStart.vitality) + (visitor.resolve / vStart.resolve) + (visitor.nerve / vStart.nerve)) / 3 * 100
    );
    roundSnapshots.push({
      round,
      dungeon: { structure: dungeon.structure, veil: dungeon.veil, presence: dungeon.presence, pct: dHealthPct },
      visitor: { vitality: visitor.vitality, resolve: visitor.resolve, nerve: visitor.nerve, pct: vHealthPct },
      lead: dHealthPct > vHealthPct ? 'dungeon' : vHealthPct > dHealthPct ? 'visitor' : 'tied',
      gap: Math.abs(dHealthPct - vHealthPct),
    });
  }

  if (!outcome) outcome = { winner: 'visitor', condition: 'Survive', desc: 'Round limit reached' };

  return {
    encounter: encounter.name, outcome, stats, roundSnapshots,
    finalVisitor: { ...visitor }, finalDungeon: { ...dungeon },
    carryover: { visitor, dungeon, dungeonDiscard: dDiscard, visitorDiscard: vDiscard },
    log: lines,
  };
}

// ═══ ENTANGLE MANAGEMENT ═══
// Entangle clears when the entangled side starts their turn (not end of round).
// This means if you're entangled on the opponent's turn, you stay entangled
// through their whole turn and it clears when YOUR turn begins.
function clearEntangle(state, side, log) {
  const had = R.hasCondition(state, 'entangled');
  state.conditions = state.conditions.filter(c => c.type !== 'entangled');
  if (had) log(`  [${side}] Entangle expires`);
}

// ═══ TURN EXECUTION ═══

function executeTurn(side, sideData, ctx) {
  const { hand, energy, self, opp, ai } = sideData;
  const log = ctx.log;
  const plays = [];
  const remainingHand = [...hand];

  const decisions = ai.pickCards(remainingHand, energy, self, opp, ctx);

  for (const decision of decisions) {
    const card = decision.card;
    const idx = remainingHand.indexOf(card);
    if (idx === -1) continue;

    // React cards are held for opponent's turn
    if (card.category === 'React') continue;

    if (card.category === 'Energy') {
      energy.addPermanent(card.energyGain || 1);
      remainingHand.splice(idx, 1);
      plays.push({ card, action: 'energy' });
      log(`  [${side}] Energy: ${card.name} → pool now ${energy.base}`);
      ctx.stats.decisions++;
      continue;
    }

    if (decision.action === 'activate') {
      remainingHand.splice(idx, 1);
      energy.addTemp(1);
      log(`  [${side}] Activate: ${card.name} → +1 temp Energy`);
      plays.push({ card, action: 'activate' });
      ctx.stats.decisions++;
      continue;
    }

    // RESTRAINT: Discard a Strike to build Trust/Rapport. "I choose not to hurt you."
    // Flat +1 to own promoter only, max once per turn. Fills dead turns, not a Bond accelerant.
    if (decision.action === 'restrain') {
      if (plays.some(p => p.action === 'restrain')) continue; // Max 1 per turn
      remainingHand.splice(idx, 1);
      if (side === 'dungeon') {
        const rapGain = applyPromoterGain(self, 'rapport', 1, ctx);
        log(`  [${side}] Restrain: ${card.name} → rapport +${rapGain}`);
      } else {
        const truGain = applyPromoterGain(self, 'trust', 1, ctx);
        log(`  [${side}] Restrain: ${card.name} → trust +${truGain}`);
      }
      plays.push({ card, action: 'restrain' });
      ctx.stats.decisions++;
      continue;
    }

    const cost = card.cost || 0;
    if (!energy.canAfford(cost)) continue;
    energy.spend(cost);
    remainingHand.splice(idx, 1);
    plays.push({ card, action: 'play' });
    ctx.stats.decisions++;

    switch (card.category) {
      case 'Strike':
        resolveStrike(card, side, self, opp, energy, ctx, sideData);
        checkTraps('strike_played', side, self, opp, ctx);
        // BETRAYAL: Striking while building cooperation crashes promoters
        // Only triggers when genuine cooperation is established (promoter > 3),
        // not on incidental starting trust from encounter templates
        if (side === 'dungeon' && self.rapport > 3) {
          const lost = Math.ceil(self.rapport * 0.5);
          self.rapport = Math.max(0, self.rapport - lost);
          log(`    [Betrayal] dungeon rapport -${lost} (aggression during cooperation)`);
          if (opp.trust > 3) {
            const trustLost = Math.ceil(opp.trust * 0.5);
            opp.trust = Math.max(0, opp.trust - trustLost);
            log(`    [Betrayal] visitor trust -${trustLost}`);
          }
        } else if (side === 'visitor' && self.trust > 3) {
          const lost = Math.ceil(self.trust * 0.5);
          self.trust = Math.max(0, self.trust - lost);
          log(`    [Betrayal] visitor trust -${lost} (aggression during cooperation)`);
          if (opp.rapport > 3) {
            const rapLost = Math.ceil(opp.rapport * 0.5);
            opp.rapport = Math.max(0, opp.rapport - rapLost);
            log(`    [Betrayal] dungeon rapport -${rapLost}`);
          }
        }
        break;

      case 'Test':
        resolveTest(card, side, self, opp, ctx);
        break;

      case 'Empower':
        self.conditions.push({ type: 'empower', effect: card.empowerEffect || {}, source: card.name, placedBy: side });
        log(`  [${side}] Empower: ${card.name}`);
        checkTraps('empower_played', side, self, opp, ctx);
        break;

      case 'Disrupt':
        opp.conditions.push({ type: 'disrupt', effect: card.disruptEffect || {}, source: card.name, placedBy: side });
        log(`  [${side}] Disrupt: ${card.name} → debuffing ${ctx.opponentSide}`);
        break;

      case 'Counter': {
        const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
        let removed = R.removeCondition(opp, 'empower', oppSide);
        if (!removed) removed = R.removeCondition(self, 'disrupt', oppSide);
        if (removed) {
          log(`  [${side}] Counter: ${card.name} removes ${removed.source}`);
          if (card.counterDamage) {
            const dmg = R.applyDamage(opp, card.counterDamage.resource, card.counterDamage.amount, 1);
            log(`    +chip: ${card.counterDamage.resource} -${dmg}`);
          }
        } else {
          log(`  [${side}] Counter: ${card.name} → nothing to remove`);
        }
        checkTraps('counter_played', side, self, opp, ctx);
        break;
      }

      case 'Trap':
        self.conditions.push({ type: 'trap', card, trigger: card.trapTrigger, placedBy: side });
        log(`  [${side}] Trap set: ${card.name} (face-down)`);
        break;

      case 'Offer':
        resolveOffer(card, side, self, opp, ctx);
        break;

      case 'Reshape':
        resolveReshape(card, side, self, opp, ctx);
        break;

      default:
        log(`  [${side}] Play: ${card.name}`);
    }
  }

  return { plays, remainingHand };
}

// ═══ STRIKE RESOLUTION ═══

function resolveStrike(card, side, self, opp, energy, ctx, sideData) {
  const log = ctx.log;
  const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
  let advantage = 0, powerBonus = 0;

  // Consume Empower (placed by us on ourselves)
  const emp = R.removeCondition(self, 'empower', side);
  if (emp) {
    if (emp.effect.advantage) advantage += 1;
    if (emp.effect.powerBonus) powerBonus += emp.effect.powerBonus;
  }

  // Consume Disrupt on self (placed by opponent on us)
  const dis = R.removeCondition(self, 'disrupt', oppSide);
  if (dis) {
    if (dis.effect.disadvantage) advantage -= 1;
  }

  // Resonate
  const lastType = side === 'dungeon' ? ctx.stats.dLastType : ctx.stats.vLastType;
  if ((card.keywords || []).includes('Resonate') && lastType === card.type) {
    powerBonus += 1;
  }

  // Modifier bonus (affects ROLL, not damage)
  const atkMod = R.getModifierBonus(card, self);

  // Trigger check (affects DAMAGE)
  let triggerBonus = 0;
  if (card.trigger && evaluateTrigger(card.trigger, self, opp)) {
    triggerBonus = card.trigger.bonus || 0;
  }

  // ── LOG SETUP INFO ──
  if (emp) log(`    Empower consumed: ${emp.source}${emp.effect.advantage ? ' (Advantage)' : ''}${emp.effect.powerBonus ? ` (+${emp.effect.powerBonus} dmg)` : ''}`);
  if (dis) log(`    Disrupt consumed: ${dis.source}${dis.effect.disadvantage ? ' (Disadvantage)' : ''}`);
  if (triggerBonus) log(`    Trigger: ${card.trigger.description} → +${triggerBonus} dmg`);

  // ── ATTACKER ROLL ──
  const atkRoll = R.contestedRoll(advantage);
  const atkTotal = atkRoll.total + atkMod;
  const atkRollStr = advantage > 0 ? `3d6kh2[${atkRoll.dice}]→[${atkRoll.kept}]`
    : advantage < 0 ? `3d6kl2[${atkRoll.dice}]→[${atkRoll.kept}]`
    : `2d6[${atkRoll.kept}]`;

  // ── DEFENDER ROLL ──
  const defRoll = R.contestedRoll(0);
  const defMod = R.getModifierBonus(card, opp);
  const defTotal = defRoll.total + defMod;

  const result = R.resolveTier(atkTotal, defTotal);

  // Damage uses card power + empower powerBonus + triggerBonus (NOT modifier)
  const damagePower = (card.power || 0) + powerBonus + triggerBonus;

  log(`  [${side}] Strike: ${card.name} (P:${card.power}${powerBonus ? `+${powerBonus}e` : ''}${triggerBonus ? `+${triggerBonus}t` : ''} = ${damagePower} dmg) | Roll: ${atkRollStr}+${atkMod}mod = ${atkTotal} vs 2d6[${defRoll.kept}]+${defMod}mod = ${defTotal} → ${result.tier}`);

  // ── REACT CHECK ──
  let reactMitigation = 0;
  if (result.atkMult > 0 && ctx.opponentReactHand) {
    const reactResult = tryReact(oppSide, ctx.opponentReactHand, opp, self, card, result, ctx);
    if (reactResult) {
      reactMitigation = reactResult.mitigation;
      const rIdx = ctx.opponentReactHand.indexOf(reactResult.card);
      if (rIdx >= 0) ctx.opponentReactHand.splice(rIdx, 1);
      if (oppSide === 'dungeon') ctx.stats.dCardsPlayed++;
      else ctx.stats.vCardsPlayed++;
      ctx.stats.decisions++;
    }
  }

  // ── APPLY DAMAGE ──
  if (result.atkMult > 0 && card.target) {
    let rawDmg = Math.floor(damagePower * result.atkMult);
    if (damagePower > 0 && rawDmg < 1) rawDmg = 1; // min 1 damage on any non-Stalemate hit

    // Fortify reduction
    let fortifyReduction = 0;
    const fortifyConds = opp.conditions.filter(c => c.type === 'fortify' && c.resource === card.target);
    for (const fc of fortifyConds) {
      fortifyReduction += fc.reduction;
    }

    const finalDmg = Math.max(0, rawDmg - reactMitigation - fortifyReduction);
    const applied = R.applyDamage(opp, card.target, finalDmg, 1);
    const mitigationParts = [];
    if (reactMitigation > 0) mitigationParts.push(`${reactMitigation} React`);
    if (fortifyReduction > 0) mitigationParts.push(`${fortifyReduction} Fortify`);
    const mitigationStr = mitigationParts.length > 0 ? ` (${rawDmg} raw - ${mitigationParts.join(' - ')})` : '';
    log(`    → ${card.target} -${applied}${mitigationStr} [${result.tier}: ${damagePower}×${result.atkMult}=${rawDmg}]`);

    const tracker = side === 'dungeon' ? ctx.stats.dDamageDealt : ctx.stats.vDamageDealt;
    tracker[card.target] = (tracker[card.target] || 0) + applied;

    if (applied > 0) {
      R.applyKeywords(card, opp, self, { autoResource: ctx.autoResource, log, activeSide: side });

      // ── RALLY: attacker recovers 1 of lowest reducer on Strong/Devastating ──
      if (result.atkMult >= 1.0) {
        const reducers = side === 'dungeon'
          ? [{ name: 'structure', val: self.structure, start: self.startingValues?.structure || 20 },
             { name: 'veil', val: self.veil, start: self.startingValues?.veil || 16 },
             { name: 'presence', val: self.presence, start: self.startingValues?.presence || 14 }]
          : [{ name: 'vitality', val: self.vitality, start: self.startingValues?.vitality || 20 },
             { name: 'resolve', val: self.resolve, start: self.startingValues?.resolve || 16 },
             { name: 'nerve', val: self.nerve, start: self.startingValues?.nerve || 16 }];
        const damaged = reducers.filter(r => r.val < r.start).sort((a, b) => (a.val / a.start) - (b.val / b.start));
        if (damaged.length > 0) {
          const before = self[damaged[0].name];
          R.applyBenefit(self, damaged[0].name, 1);
          const after = self[damaged[0].name];
          if (after > before) log(`    [Rally] ${side} ${damaged[0].name} +1 (${before}→${after})`);
        }
      }
    }
  } else if (result.atkMult === 0) {
    log(`    → No damage (${result.tier})`);
  }

  // ── REVERSAL ──
  if (result.defMult > 0) {
    const reversalResource = self.side === 'dungeon' ? 'structure' : 'vitality';
    const cDmg = R.applyDamage(self, reversalResource, 1, result.defMult);
    if (cDmg > 0) log(`    → Reversal: ${side} ${reversalResource} -${cDmg}`);
  }

  // Update last type for Resonate
  if (side === 'dungeon') ctx.stats.dLastType = card.type;
  else ctx.stats.vLastType = card.type;
}

// ═══ REACT RESOLUTION ═══

function tryReact(defenderSide, defenderHand, defenderState, attackerState, incomingCard, result, ctx) {
  const log = ctx.log;
  const reactCards = defenderHand.filter(c => c.category === 'React');
  if (reactCards.length === 0) return null;

  // Only react to significant incoming damage
  if (result.tier !== 'Strong' && result.tier !== 'Devastating') return null;

  const react = reactCards.sort((a, b) => (b.power || 0) - (a.power || 0))[0];
  const reactRoll = R.contestedRoll(0);
  const reactMod = R.getModifierBonus(react, defenderState);
  const reactTotal = reactRoll.total + reactMod + (react.power || 0);
  const threshold = 7;
  const success = reactTotal >= threshold;

  if (success) {
    const mitigation = react.power || 1;
    log(`    [${defenderSide}] React: ${react.name} → SUCCESS (2d6[${reactRoll.kept}]+${reactMod}mod+${react.power}pwr = ${reactTotal} vs ${threshold}) mitigates ${mitigation}`);
    return { card: react, mitigation };
  } else {
    log(`    [${defenderSide}] React: ${react.name} → FAILED (2d6[${reactRoll.kept}]+${reactMod}mod+${react.power}pwr = ${reactTotal} vs ${threshold})`);
    return { card: react, mitigation: 0 };
  }
}

// ═══ RESHAPE RESOLUTION ═══

function resolveReshape(card, side, self, opp, ctx) {
  const log = ctx.log;
  log(`  [${side}] Reshape: ${card.name}`);

  if (!card.reshapeEffect) return;
  const eff = card.reshapeEffect;

  // Heal: restore a resource (capped at starting value)
  if (eff.heal) {
    for (const h of eff.heal) {
      const before = self[h.resource];
      R.applyBenefit(self, h.resource, h.amount);
      const after = self[h.resource];
      const gained = after - before;
      if (gained > 0) log(`    → ${h.resource} +${gained} (${before}→${after})`);
    }
  }

  // Shift: move points from one resource to another
  if (eff.shift) {
    const fromVal = self[eff.shift.from];
    const take = Math.min(eff.shift.amount, fromVal);
    if (take > 0) {
      R.applyDamage(self, eff.shift.from, take, 1);
      R.applyBenefit(self, eff.shift.to, take);
      log(`    → ${eff.shift.from} -${take}, ${eff.shift.to} +${take}`);
    }
  }

  // Fortify: add a persistent defensive condition (reduces incoming damage)
  if (eff.fortify) {
    self.conditions.push({
      type: 'fortify',
      resource: eff.fortify.resource,
      reduction: eff.fortify.reduction,
      duration: eff.fortify.duration || 2,
      source: card.name,
      placedBy: side,
    });
    log(`    → Fortified: ${eff.fortify.resource} -${eff.fortify.reduction} incoming for ${eff.fortify.duration || 2} rounds`);
  }
}

// ═══ TRAP TRIGGER CHECK ═══
// Check if opponent has traps that trigger on the action we just performed
function checkTraps(triggerType, actingSide, self, opp, ctx) {
  const log = ctx.log;
  const oppSide = actingSide === 'dungeon' ? 'visitor' : 'dungeon';
  // Traps are stored on the SETTER's conditions. Opponent set them, so check opp.conditions
  const traps = opp.conditions.filter(c => c.type === 'trap' && c.trigger === triggerType);
  for (const trap of traps) {
    log(`    TRAP SPRINGS: ${trap.card.name} (triggered by ${triggerType})`);
    opp.conditions = opp.conditions.filter(c => c !== trap);
    if (trap.card.trapEffect) {
      for (const eff of trap.card.trapEffect) {
        // 'triggerer' = the one who triggered the trap (the acting side = self)
        const t = eff.target === 'triggerer' ? self : opp;
        const dmg = R.applyDamage(t, eff.resource, Math.abs(eff.amount), 1);
        log(`      → ${eff.resource} -${dmg}`);
      }
    }
    if (trap.card.keywords?.length) {
      R.applyKeywords(trap.card, self, opp, { autoResource: ctx.autoResource, log, activeSide: oppSide });
    }
  }
}

// ═══ TEST RESOLUTION ═══
// Tests are prisoner's dilemma interactions. The opponent chooses cooperate or defect.
// Cooperate: both promoters advance. Defect: defector gains combat advantage, trust crashes.

function resolveTest(card, side, self, opp, ctx) {
  const log = ctx.log;
  const trustLevel = side === 'dungeon' ? opp.trust : self.trust;
  const rapportLevel = side === 'dungeon' ? self.rapport : opp.rapport;

  // Cooperation probability based on existing trust + rapport
  // Higher trust = more likely to cooperate. Base 40% + 5% per trust point.
  const coopChance = Math.min(0.85, 0.4 + (trustLevel * 0.05) + (rapportLevel * 0.03));
  const cooperates = Math.random() < coopChance;

  const testReward = card.testReward || { trust: 2, rapport: 2 };
  const defectPenalty = card.defectPenalty || { trustCrash: 0.5, powerGain: 2 };

  // Trust is ALWAYS visitor's promoter, Rapport is ALWAYS dungeon's promoter
  const visitorState = side === 'dungeon' ? opp : self;
  const dungeonState = side === 'dungeon' ? self : opp;

  if (cooperates) {
    log(`  [${side}] Test: ${card.name} → COOPERATE (trust:${trustLevel}, chance:${(coopChance * 100).toFixed(0)}%)`);
    // Both promoters advance (subject to per-round cap)
    const truGain = applyPromoterGain(visitorState, 'trust', testReward.trust, ctx);
    const rapGain = applyPromoterGain(dungeonState, 'rapport', testReward.rapport, ctx);
    log(`    → trust +${truGain}, rapport +${rapGain}`);
    // Small vulnerability cost: test-giver loses 1 from a reducer (exposure cost)
    if (card.exposureCost) {
      const dmg = R.applyDamage(self, card.exposureCost.resource, card.exposureCost.amount, 1);
      log(`    → Exposure: ${card.exposureCost.resource} -${dmg}`);
    }
  } else {
    log(`  [${side}] Test: ${card.name} → DEFECT (trust:${trustLevel}, chance:${(coopChance * 100).toFixed(0)}%)`);
    // Defector gains combat advantage
    const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
    opp.conditions.push({
      type: 'empower',
      effect: { advantage: false, powerBonus: defectPenalty.powerGain },
      source: `${card.name} (defection)`,
      placedBy: oppSide,
    });
    log(`    → Defector gains +${defectPenalty.powerGain} power on next strike`);
    // Trust and rapport crash on defection — always target correct side
    if (visitorState.trust > 0) {
      const trustLost = Math.ceil(visitorState.trust * defectPenalty.trustCrash);
      visitorState.trust = Math.max(0, visitorState.trust - trustLost);
      log(`    → trust crashes -${trustLost}`);
    }
    if (dungeonState.rapport > 0) {
      const rapLost = Math.ceil(dungeonState.rapport * defectPenalty.trustCrash);
      dungeonState.rapport = Math.max(0, dungeonState.rapport - rapLost);
      log(`    → rapport crashes -${rapLost}`);
    }
  }
}

// ═══ OFFER RESOLUTION ═══

function resolveOffer(card, side, self, opp, ctx) {
  const log = ctx.log;
  const trustLevel = side === 'dungeon' ? opp.trust : self.trust;
  const acceptChance = Math.min(0.9, 0.3 + (trustLevel * 0.1));
  const accepted = Math.random() < acceptChance;

  if (accepted) {
    log(`  [${side}] Offer: ${card.name} → ACCEPTED (trust:${trustLevel}, chance:${(acceptChance * 100).toFixed(0)}%)`);
    if (card.offerPayload) {
      for (const effect of card.offerPayload) {
        const target = effect.target === 'opponent' ? opp : self;
        if (effect.amount > 0) {
          // Promoter gains (trust/rapport) are subject to per-round cap
          if (effect.resource === 'trust' || effect.resource === 'rapport') {
            const actual = applyPromoterGain(target, effect.resource, effect.amount, ctx);
            log(`    Payload: ${effect.resource} +${actual}${actual < effect.amount ? ` (capped, wanted +${effect.amount})` : ''}`);
          } else {
            R.applyBenefit(target, effect.resource, effect.amount);
            log(`    Payload: ${effect.resource} +${effect.amount}`);
          }
        } else {
          R.applyDamage(target, effect.resource, Math.abs(effect.amount), 1);
          log(`    Payload: ${effect.resource} ${effect.amount}`);
        }
      }
    }
    // Trap check on Offer acceptance
    const traps = self.conditions.filter(c => c.type === 'trap' && c.trigger === 'offer_accepted');
    for (const trap of traps) {
      log(`    TRAP SPRINGS: ${trap.card.name}`);
      self.conditions = self.conditions.filter(c => c !== trap);
      if (trap.card.trapEffect) {
        for (const eff of trap.card.trapEffect) {
          const t = eff.target === 'triggerer' ? opp : self;
          const dmg = R.applyDamage(t, eff.resource, Math.abs(eff.amount), 1);
          log(`      → ${eff.resource} -${dmg}`);
        }
      }
      if (trap.card.keywords?.length) {
        R.applyKeywords(trap.card, opp, self, { autoResource: ctx.autoResource, log, activeSide: side });
      }
    }
  } else {
    log(`  [${side}] Offer: ${card.name} → REFUSED (trust:${trustLevel}, chance:${(acceptChance * 100).toFixed(0)}%)`);
    // Refusal cost: small rapport loss from the awkwardness of rejection
    if (side === 'dungeon' && self.rapport > 0) {
      self.rapport = Math.max(0, self.rapport - 1);
      log(`    → rapport -1 (offer rejected)`);
    } else if (side === 'visitor' && opp.rapport > 0) {
      opp.rapport = Math.max(0, opp.rapport - 1);
      log(`    → rapport -1 (offer rejected)`);
    }
  }
}

// ═══ TRIGGER EVALUATION ═══

function evaluateTrigger(trigger, self, opponent) {
  if (!trigger?.condition) return false;
  const c = trigger.condition;
  if (c.type === 'resource_below') {
    const val = opponent[c.resource];
    const threshold = c.value !== undefined ? c.value : Math.floor(opponent.startingValues[c.resource] / 2);
    return val <= threshold;
  }
  if (c.type === 'resource_above') return (opponent[c.resource] || 0) >= c.value;
  if (c.type === 'has_condition') return R.hasCondition(opponent, c.condition);
  return false;
}

module.exports = { runEncounter };