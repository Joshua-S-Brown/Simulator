/**
 * SHATTERED DUNGEON — Encounter Engine v2.7
 * 
 * v2.2: Energy card type resolution, Attune discount
 * v2.4: Party system — member targeting, knockout mechanics, card removal,
 *       morale cascade, restoration, party-aware damage routing
 * v2.6b: Defensive mechanics rework — Guard, React Fortify, Fortify spread,
 *        Fortify extension, party restore via Reshape
 * v2.6c: Fortify/Guard duration timing fix
 * v2.7:  Bond v3.0 integration — transactional Offers, trust decay,
 *        betrayal conversion, Binding/Dependency EoR processing,
 *        Betrayed/Scorned/Exposure combat bonuses, Covenant win condition,
 *        dungeon strike tracking for Covenant suspicion
 * 
 * v2.7 CHANGES (Bond v3.0):
 * [ADD] Offer resolution delegates to Bond.resolveTransactionalOffer()
 * [ADD] Bond win condition check after each turn (Covenant accepted)
 * [ADD] Trust decay on dungeon Strikes via Bond.applyTrustDecay()
 * [ADD] Betrayal conversion via Bond.checkBetrayal()
 * [ADD] EoR: Binding drains, Dependency checks, bond condition ticking
 * [ADD] Strike power: Betrayed bonus (Bond.getBetrayedBonus)
 * [ADD] Strike defense: Scorned bonus (Bond.getScornedBonus)
 * [ADD] Strike damage: Exposure bonus (Bond.checkExposure)
 * [ADD] Dungeon strike counter (ctx.stats.dStrikesPlayed) for Covenant suspicion
 *
 * v2.6c CHANGES:
 * [FIX] Fortify and Guard conditions now carry a `fresh` flag when placed.
 *       Fresh conditions skip their first end-of-round tick-down, ensuring
 *       duration N = N full rounds of protection AFTER the round of placement.
 *       Previously, duration 1 expired same-round → zero effective protection.
 *       Duration 2 (Arcane Ward, Guardian Stance) now correctly protects for
 *       2 full rounds instead of ~1. Affects all 8 Fortify creation points
 *       and 1 Guard creation point.
 *
 * v2.6b CHANGES:
 * [ADD] Guard mechanic: Disrupt cards with `guard` effect place a Guarded
 *       condition on an ally, reducing Strike power against that member.
 *       Dungeon must spend extra power or switch targets.
 * [ADD] React onSuccess Fortify: React cards with `reactEffect.onSuccess.selfFortify`
 *       grant Fortify to the defender on successful block (snowball defense).
 * [ADD] Counter spreadFortify: Counter cards with `counterEffect.spreadFortify`
 *       propagate Fortify from self to an ally when condition is met.
 * [ADD] Reshape extendFortify: Reshape cards with `reshapeEffect.extendFortify`
 *       extend active Fortify durations on the healed target.
 * [FIX] Reshape `restore` now correctly triggers party member restoration
 *       (previously only `restoreMember` was handled).
 * [FIX] Heal target `weakest_member` now routes to lowest-vitality active member.
 * [ADD] Guard conditions tick down at end of round alongside Fortify.
 * 
 * Previous changes preserved:
 * [ADD] Extended trigger system, Drain, Overwhelm, Empower keyword grants
 * [ADD] Disrupt variants, Counter variants, React variants
 * [ADD] Strike self-cost, Exhaust mechanic
 */

const R = require('./rules');
const { resolveEnergy, consumeAttune } = require('./energy');
const Bond = require('./bond');

/**
 * Apply a promoter gain (trust or rapport) with per-round cap.
 * Returns the actual amount applied (may be less than requested).
 */
function applyPromoterGain(target, resource, amount, ctx) {
  if (resource !== 'trust' && resource !== 'rapport') {
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
  // v2.4: Party visitor support
  const visitor = carryover?.visitor || (
    visitorTemplate.type === 'party'
      ? R.createPartyVisitorState(visitorTemplate)
      : R.createVisitorState(visitorTemplate)
  );
  const dungeon = carryover?.dungeon || R.createDungeonState(dungeonTemplate);
  const dEnergy = R.createEnergyPool(config.dungeonBaseEnergy || 2);
  const vEnergy = R.createEnergyPool(config.visitorBaseEnergy || 2);

  const dDraw = R.drawOpeningHand(dungeonDeck, config.handSize || 7);
  const vDraw = R.drawOpeningHand(visitorDeck, config.handSize || 7);
  let dHand = dDraw.hand, dPile = dDraw.drawPile, dDiscard = carryover?.dungeonDiscard || [];
  let vHand = vDraw.hand, vPile = vDraw.drawPile, vDiscard = carryover?.visitorDiscard || [];

  // v2.4: Keep full deck reference for member card restoration (Healing Word)
  const fullVisitorDeck = [...visitorDeck];

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
  // v2.4: Party-aware header logging
  if (visitor.isParty) {
    const memberStatus = Object.entries(visitor.members)
      .map(([k, m]) => `${m.name}:${m.vitality}/${m.maxVitality}`)
      .join(' ');
    log(`  Party: ${memberStatus} | Res:${visitor.resolve} Nrv:${visitor.nerve} Tru:${visitor.trust}`);
  } else {
    log(`  Visitor: Vit:${visitor.vitality} Res:${visitor.resolve} Nrv:${visitor.nerve} Tru:${visitor.trust}`);
  }
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
    dStrikesPlayed: 0,  // v2.7: Track dungeon strikes for Covenant suspicion
  };
  const roundSnapshots = [];

  // ─── MAIN LOOP ───
  while (round < maxRounds) {
    round++;
    stats.rounds = round;
    log(`\n── Round ${round} ──`);

    const roundStartTrust = visitor.trust || 0;
    const roundStartRapport = dungeon.rapport || 0;
    const promoterGainCap = config.promoterGainCap || 2;

    // 1. ENVIRONMENT PRESSURE (bidirectional)
    for (const ae of autoEffects) {
      const fires = ae.frequency === 'every' || (ae.frequency === 'other' && round % 2 === 1);
      if (fires && ae.resource && ae.amount !== 0) {
        const tgt = ae.target === 'visitor' ? visitor : dungeon;
        if (ae.amount < 0) {
          // v2.4: Route party vitality auto-damage to a random active member
          if (tgt.isParty && ae.resource === 'vitality') {
            const targetKey = R.selectPartyTarget(tgt, 'random');
            if (targetKey) {
              const autoResult = R.damagePartyMember(tgt, targetKey, Math.abs(ae.amount));
              log(`  [Auto] ${ae.target} ${tgt.members[targetKey].name} vitality ${ae.amount}`);
              if (autoResult.knockout) {
                log(`    >>> ${tgt.members[targetKey].name} KNOCKED OUT by auto-effect!`);
                if (autoResult.moraleCascade) {
                  log(`    [Morale] Resolve -${autoResult.moraleCascade.resolveHit}, Nerve -${autoResult.moraleCascade.nerveHit}`);
                }
                const removal = R.removeKnockedOutCards(targetKey, vHand, vPile, vDiscard);
                vHand = removal.newHand;
                log(`    [Deck] Removed ${removal.removed.length} cards`);
              }
            }
          } else {
            R.applyDamage(tgt, ae.resource, Math.abs(ae.amount), 1);
            log(`  [Auto] ${ae.target} ${ae.resource} ${ae.amount}`);
          }
        } else {
          R.applyBenefit(tgt, ae.resource, ae.amount);
          log(`  [Auto] ${ae.target} ${ae.resource} ${ae.amount > 0 ? '+' : ''}${ae.amount}`);
        }
      }
    }
    R.resolveErode(visitor, autoResource, log);
    R.resolveErode(dungeon, autoResource, log);

    const esc = R.getEscalation(round, config);
    if (esc) {
      // v2.4: Route escalation vitality damage to party member
      if (visitor.isParty) {
        const escTarget = R.selectPartyTarget(visitor, 'random');
        if (escTarget) R.damagePartyMember(visitor, escTarget, esc.damage);
      } else {
        R.applyDamage(visitor, 'vitality', esc.damage, 1);
      }
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

    // v2.4: Compute party member targeting strategy for dungeon turns
    let memberTargetStrategy = null;
    if (visitor.isParty) {
      memberTargetStrategy = (typeof dungeonAI.selectMemberTarget === 'function')
        ? dungeonAI.selectMemberTarget(visitor, dungeon)
        : 'lowest_vitality';
    }

    // 3. FIRST TURN
    clearEntangle(sides[firstSide].self, firstSide, log);
    const firstCtx = { encounter, round, stats, autoResource, log, activeSide: firstSide,
      opponentReactHand: sides[secondSide].hand, opponentSide: secondSide, cardTracker,
      bondThreshold: config.bondThreshold || 12,
      roundStartTrust, roundStartRapport, promoterGainCap,
      memberTargetStrategy: firstSide === 'dungeon' ? memberTargetStrategy : null,
      fullVisitorDeck, vPile, vDiscard, sides,
    };
    const firstResult = executeTurn(firstSide, sides[firstSide], firstCtx);
    sides[firstSide].hand = firstResult.remainingHand;
    // v2.4: Update vHand reference if visitor hand changed during dungeon turn (knockout removal)
    if (firstSide === 'dungeon' && firstResult.updatedVisitorHand) {
      vHand = firstResult.updatedVisitorHand;
      sides.visitor.hand = vHand;
    }
    for (const p of firstResult.plays) {
      if (!p.card._exhausted) sides[firstSide].discard.push(p.card);
      if (p.card.category && cardTracker[firstSide]) cardTracker[firstSide][p.card.category] = (cardTracker[firstSide][p.card.category] || 0) + 1;
      if (firstSide === 'dungeon') stats.dCardsPlayed++; else stats.vCardsPlayed++;
    }

    // v2.7: Bond win check after first turn (Covenant accepted during Offer resolution)
    if (firstCtx.bondTriggered) {
      outcome = { winner: 'both', condition: 'Bond', desc: 'Covenant accepted' };
      log(`  >>> Bond: Covenant accepted`);
      break;
    }

    outcome = R.checkWinConditions(visitor, dungeon, config);
    if (outcome) { log(`  >>> ${outcome.condition}: ${outcome.desc}`); break; }

    // 4. SECOND TURN
    clearEntangle(sides[secondSide].self, secondSide, log);
    const secondCtx = { encounter, round, stats, autoResource, log, activeSide: secondSide,
      opponentReactHand: sides[firstSide].hand, opponentSide: firstSide, cardTracker,
      bondThreshold: config.bondThreshold || 12,
      roundStartTrust, roundStartRapport, promoterGainCap,
      memberTargetStrategy: secondSide === 'dungeon' ? memberTargetStrategy : null,
      fullVisitorDeck, vPile, vDiscard, sides,
    };
    const secondResult = executeTurn(secondSide, sides[secondSide], secondCtx);
    sides[secondSide].hand = secondResult.remainingHand;
    if (secondSide === 'dungeon' && secondResult.updatedVisitorHand) {
      vHand = secondResult.updatedVisitorHand;
      sides.visitor.hand = vHand;
    }
    for (const p of secondResult.plays) {
      if (!p.card._exhausted) sides[secondSide].discard.push(p.card);
      if (p.card.category && cardTracker[secondSide]) cardTracker[secondSide][p.card.category] = (cardTracker[secondSide][p.card.category] || 0) + 1;
      if (secondSide === 'dungeon') stats.dCardsPlayed++; else stats.vCardsPlayed++;
    }

    // v2.7: Bond win check after second turn
    if (secondCtx.bondTriggered) {
      outcome = { winner: 'both', condition: 'Bond', desc: 'Covenant accepted' };
      log(`  >>> Bond: Covenant accepted`);
      break;
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

    // Tick down Fortify and Guard durations
    // v2.6c: Fresh conditions skip their first tick-down (the round they were placed).
    // This ensures duration N = N full rounds of protection AFTER the round of play.
    // Without this, duration 1 expired same round it was played → zero protection.
    for (const state of [dungeon, visitor]) {
      state.conditions = state.conditions.filter(c => {
        if (c.type === 'fortify') {
          if (c.fresh) { c.fresh = false; return true; }  // v2.6c: skip first tick
          c.duration--;
          if (c.duration <= 0) {
            log(`    [Fortify] ${c.source} expires`);
            return false;
          }
        }
        if (c.type === 'guarded') {
          if (c.fresh) { c.fresh = false; return true; }  // v2.6c: skip first tick
          c.duration--;
          if (c.duration <= 0) {
            const guardedName = state.isParty && state.members[c.memberKey]
              ? state.members[c.memberKey].name : 'target';
            log(`    [Guard] ${c.source} on ${guardedName} expires`);
            return false;
          }
        }
        return true;
      });
    }

    // v2.7: Bond v3.0 — Process Binding drains, Dependency checks, tick bond conditions
    Bond.resolveBindings(visitor, { log });
    Bond.resolveBindings(dungeon, { log });
    Bond.checkDependencies(visitor, { log });
    Bond.tickBondConditions(visitor);
    Bond.tickBondConditions(dungeon);

    // v2.4: Party-aware EoR logging
    if (visitor.isParty) {
      const mStatus = Object.entries(visitor.members)
        .map(([k, m]) => `${m.name[0]}:${m.vitality}${m.status === 'knocked_out' ? '☠' : ''}`)
        .join(' ');
      log(`  [EoR] Party [${mStatus}] Res${visitor.resolve} Nrv${visitor.nerve} Tru${visitor.trust} KO:${visitor.knockoutCount} | D: Str${dungeon.structure} Vl${dungeon.veil} Pr${dungeon.presence} Rp${dungeon.rapport} | DE:${dEnergy.base} VE:${vEnergy.base}`);
    } else {
      log(`  [EoR] V: Vit${visitor.vitality} Res${visitor.resolve} Nrv${visitor.nerve} Tru${visitor.trust} | D: Str${dungeon.structure} Vl${dungeon.veil} Pr${dungeon.presence} Rp${dungeon.rapport} | DE:${dEnergy.base} VE:${vEnergy.base}`);
    }

    // Snapshot
    const dStart = dungeon.startingValues || { structure: 20, veil: 16, presence: 14 };
    const vStart = visitor.startingValues || { vitality: 20, resolve: 16, nerve: 16 };
    const dHealthPct = Math.round(
      ((dungeon.structure / dStart.structure) + (dungeon.veil / dStart.veil) + (dungeon.presence / dStart.presence)) / 3 * 100
    );
    const vHealthPct = Math.round(
      ((visitor.vitality / (vStart.vitality || 1)) + (visitor.resolve / (vStart.resolve || 1)) + (visitor.nerve / (vStart.nerve || 1))) / 3 * 100
    );
    const snapshot = {
      round,
      dungeon: { structure: dungeon.structure, veil: dungeon.veil, presence: dungeon.presence, pct: dHealthPct },
      visitor: { vitality: visitor.vitality, resolve: visitor.resolve, nerve: visitor.nerve, pct: vHealthPct },
      lead: dHealthPct > vHealthPct ? 'dungeon' : vHealthPct > dHealthPct ? 'visitor' : 'tied',
      gap: Math.abs(dHealthPct - vHealthPct),
    };
    // v2.4: Add party member data to snapshot
    if (visitor.isParty) {
      snapshot.partyMembers = {};
      for (const [k, m] of Object.entries(visitor.members)) {
        snapshot.partyMembers[k] = { vitality: m.vitality, status: m.status };
      }
      snapshot.knockoutCount = visitor.knockoutCount;
    }
    roundSnapshots.push(snapshot);
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
  let updatedVisitorHand = null; // v2.4: Track if visitor hand changes during dungeon turn

  const decisions = ai.pickCards(remainingHand, energy, self, opp, ctx);

  for (const decision of decisions) {
    const card = decision.card;
    const idx = remainingHand.indexOf(card);
    if (idx === -1) continue;

    // React cards are held for opponent's turn
    if (card.category === 'React') continue;

    // ── ENERGY CARD PLAY (v2.2: type-aware resolution) ──
    if (card.category === 'Energy') {
      const result = resolveEnergy(card, energy, self, opp);
      remainingHand.splice(idx, 1);
      plays.push({ card, action: 'energy', energyResult: result });
      log(`  [${side}] Energy: ${card.name} (${result.type}) → ${result.description}`);
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

    // RESTRAINT
    if (decision.action === 'restrain') {
      if (plays.some(p => p.action === 'restrain')) continue;
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

    // ── PAY COST (v2.2: Attune discount applied) ──
    const baseCost = card.cost || 0;
    const attuneDiscount = consumeAttune(card, self);
    const cost = Math.max(0, baseCost - attuneDiscount);
    if (!energy.canAfford(cost)) continue;
    energy.spend(cost);
    if (attuneDiscount > 0) {
      log(`  [${side}] Attune: ${card.name} cost ${baseCost} → ${cost} (${card.type} discount)`);
    }
    remainingHand.splice(idx, 1);
    plays.push({ card, action: 'play' });
    ctx.stats.decisions++;

    switch (card.category) {
      case 'Strike':
        resolveStrike(card, side, self, opp, energy, ctx, sideData);
        checkTraps('strike_played', side, self, opp, ctx);
        // BOND v3.0: Trust decay + Betrayal conversion
        Bond.applyTrustDecay(side, self, opp, ctx);
        Bond.checkBetrayal(side, self, opp, ctx);
        // v2.7: Track dungeon strikes for Covenant suspicion
        if (side === 'dungeon') {
          ctx.stats.dStrikesPlayed = (ctx.stats.dStrikesPlayed || 0) + 1;
        }
        break;

      case 'Test':
        resolveTest(card, side, self, opp, ctx);
        break;

      case 'Empower':
        self.conditions.push({ type: 'empower', effect: card.empowerEffect || {}, source: card.name, placedBy: side });
        log(`  [${side}] Empower: ${card.name}`);
        if (card.empowerEffect?.addKeyword) log(`    Grants: ${card.empowerEffect.addKeyword} to next Strike`);
        if (card.empowerEffect?.retarget) log(`    Redirects: next Strike → ${card.empowerEffect.retarget}`);
        checkTraps('empower_played', side, self, opp, ctx);
        break;

      case 'Disrupt':
        // v2.6b: Guardian Stance — guard effect places protective conditions on self
        if (card.disruptEffect?.guard) {
          resolveGuardDisrupt(card, side, self, opp, ctx);
        } else {
          // Standard disrupt: debuff opponent
          opp.conditions.push({ type: 'disrupt', effect: card.disruptEffect || {}, source: card.name, placedBy: side });
          log(`  [${side}] Disrupt: ${card.name} → debuffing ${ctx.opponentSide}`);
          if (card.disruptEffect?.onStrike) log(`    Thorns: opponent takes ${card.disruptEffect.onStrike.selfDamage?.amount || 0} ${card.disruptEffect.onStrike.selfDamage?.resource || ''} on next Strike`);
          if (card.disruptEffect?.stripKeywords) log(`    Strips: opponent's next Strike loses all keywords`);
          if (card.disruptEffect?.randomizeTarget) log(`    Scrambles: opponent's next Strike hits random resource`);
          if (card.disruptEffect?.suppress) log(`    Suppresses: opponent cannot play ${card.disruptEffect.suppress} next turn`);
        }
        break;

      case 'Counter': {
        const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
        let removed = R.removeCondition(opp, 'empower', oppSide);
        if (!removed) removed = R.removeCondition(self, 'disrupt', oppSide);
        if (removed) {
          log(`  [${side}] Counter: ${card.name} removes ${removed.source}`);
          if (card.counterDamage) {
            let chipAmt = card.counterDamage.amount;
            if (card.counterEffect?.empowerBonus && removed.type === 'empower') {
              chipAmt = card.counterEffect.empowerBonus.chipDamage || chipAmt;
              log(`    Empower punish: ${chipAmt} chip instead of ${card.counterDamage.amount}`);
            }
            const dmg = R.applyDamage(opp, card.counterDamage.resource, chipAmt, 1);
            log(`    +chip: ${card.counterDamage.resource} -${dmg}`);
          }
          if (card.counterEffect?.steal && removed.type === 'empower') {
            self.conditions.push({ ...removed, placedBy: side });
            log(`    [Steal] ${card.name} captures ${removed.source} for own use`);
          }
          if (card.counterEffect?.applyKeyword) {
            opp.conditions.push({ type: card.counterEffect.applyKeyword, placedBy: side });
            log(`    [Setup] ${card.counterEffect.applyKeyword} applied to opponent`);
          }
          if (card.counterEffect?.applyEntangle) {
            opp.conditions.push({ type: 'entangled', placedBy: side, source: card.name });
            log(`    [Setup] Entangle applied to opponent`);
          }
          if (card.counterEffect?.applyFortify) {
            self.conditions.push({
              type: 'fortify', resource: card.counterEffect.fortifyResource || 'structure',
              reduction: card.counterEffect.applyFortify, duration: 1, source: card.name, fresh: true
            });
            log(`    [Setup] Fortify ${card.counterEffect.applyFortify} applied to self`);
          }
          // v2.6b: Spread Fortify to ally (Mana Shield)
          if (card.counterEffect?.spreadFortify) {
            resolveSpreadFortify(card, side, self, opp, ctx);
          }
        } else {
          log(`  [${side}] Counter: ${card.name} → nothing to remove`);
          // v2.6b: Even with nothing to remove, still attempt spread Fortify
          // (the Counter still fires, it just didn't find a condition to strip)
          if (card.counterEffect?.spreadFortify) {
            resolveSpreadFortify(card, side, self, opp, ctx);
          }
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

  return { plays, remainingHand, updatedVisitorHand };
}

// ═══════════════════════════════════════════════════════════════
// v2.6b: GUARDIAN STANCE — Guard Disrupt Resolution
// ═══════════════════════════════════════════════════════════════
// Guard Disrupts are unique: they place protective conditions on SELF
// rather than debuffing the opponent. This creates the tank mechanic:
// the dungeon must either accept reduced power on the guarded target
// or switch to hitting the Warden (which the party wants).

function resolveGuardDisrupt(card, side, self, opp, ctx) {
  const log = ctx.log;
  const guard = card.disruptEffect.guard;

  log(`  [${side}] Disrupt: ${card.name} (Guardian Stance)`);

  // Determine which ally to guard
  let guardTargetKey = null;
  if (guard.target === 'lowest_vitality_ally' && self.isParty) {
    // Find the lowest-vitality active ally (not the card's own member)
    const active = Object.entries(self.members)
      .filter(([k, m]) => m.status === 'active' && k !== card.member)
      .sort(([_, a], [__, b]) => a.vitality - b.vitality);
    if (active.length > 0) guardTargetKey = active[0][0];
  } else if (guard.target === 'specific' && guard.memberKey) {
    guardTargetKey = guard.memberKey;
  }

  if (guardTargetKey && self.isParty) {
    const guardedMember = self.members[guardTargetKey];
    // Remove any existing guard first (one guard at a time)
    self.conditions = self.conditions.filter(c => c.type !== 'guarded');

    self.conditions.push({
      type: 'guarded',
      memberKey: guardTargetKey,
      powerReduction: guard.powerReduction || 2,
      duration: guard.duration || 2,
      source: card.name,
      placedBy: side,
      fresh: true,  // v2.6c: survives first end-of-round tick
    });
    log(`    [Guard] ${guardedMember.name} is now Guarded (-${guard.powerReduction || 2}P to Strikes targeting them) for ${guard.duration || 2} rounds`);
  } else {
    log(`    [Guard] No valid target for Guardian Stance`);
  }

  // Self-Fortify component (Warden gains Fortify)
  if (card.disruptEffect.selfFortify) {
    const sf = card.disruptEffect.selfFortify;
    self.conditions.push({
      type: 'fortify',
      resource: 'vitality',  // Protects Warden from vitality damage
      reduction: sf.reduction || 1,
      duration: sf.duration || 1,
      source: card.name,
      placedBy: side,
      fresh: true,  // v2.6c
    });
    log(`    [Guard] ${card.member ? self.members[card.member]?.name || side : side} gains Fortify ${sf.reduction || 1}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// v2.6b: SPREAD FORTIFY — Counter Fortify Propagation
// ═══════════════════════════════════════════════════════════════
// When a Counter with spreadFortify is played and the caster has
// an active Fortify, spread Fortify 1 to the weakest ally.
// (Mana Shield: the Sorcerer's ward cascades outward)

function resolveSpreadFortify(card, side, self, opp, ctx) {
  const log = ctx.log;
  const sf = card.counterEffect.spreadFortify;

  // Check spread condition
  let conditionMet = false;
  if (sf.condition === 'self_has_fortify') {
    conditionMet = self.conditions.some(c => c.type === 'fortify');
  } else {
    // Default: always spread if no condition specified
    conditionMet = true;
  }

  if (conditionMet && self.isParty) {
    // Find target ally (lowest vitality, not self)
    let targetName = 'ally';
    if (sf.target === 'lowest_vitality_ally') {
      const active = Object.entries(self.members)
        .filter(([k, m]) => m.status === 'active' && k !== card.member)
        .sort(([_, a], [__, b]) => a.vitality - b.vitality);
      if (active.length > 0) targetName = active[0][1].name;
    }

    self.conditions.push({
      type: 'fortify',
      resource: sf.resource || 'vitality',
      reduction: sf.reduction || 1,
      duration: sf.duration || 1,
      source: `${card.name} (spread)`,
      placedBy: side,
      fresh: true,  // v2.6c
    });
    log(`    [Spread] Fortify ${sf.reduction || 1} spreads to ${targetName} (${card.name})`);
  } else if (conditionMet && !self.isParty) {
    // Non-party: just add Fortify to self
    self.conditions.push({
      type: 'fortify',
      resource: sf.resource || 'vitality',
      reduction: sf.reduction || 1,
      duration: sf.duration || 1,
      source: `${card.name} (spread)`,
      placedBy: side,
      fresh: true,  // v2.6c
    });
    log(`    [Spread] Fortify ${sf.reduction || 1} applied (${card.name})`);
  }
}

// ═══ STRIKE RESOLUTION ═══

function resolveStrike(card, side, self, opp, energy, ctx, sideData) {
  const log = ctx.log;
  const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
  let advantage = 0, powerBonus = 0;
  let grantedKeywords = [];

  // Consume Empower
  const emp = R.removeCondition(self, 'empower', side);
  if (emp) {
    if (emp.effect.advantage) advantage += 1;
    if (emp.effect.powerBonus) powerBonus += emp.effect.powerBonus;
    if (emp.effect.addKeyword) {
      const kws = Array.isArray(emp.effect.addKeyword) ? emp.effect.addKeyword : [emp.effect.addKeyword];
      grantedKeywords.push(...kws);
    }
    if (emp.effect.retarget && card.target) {
      log(`    Empower redirect: ${card.target} → ${emp.effect.retarget}`);
      card = { ...card, target: emp.effect.retarget };
    }
    if (emp.effect.conditionalAdvantage) {
      const ca = emp.effect.conditionalAdvantage;
      if (ca.hasCondition && R.hasCondition(opp, ca.hasCondition)) {
        advantage += 1;
        log(`    Empower conditional: +Advantage (opponent ${ca.hasCondition})`);
      }
    }
  }

  // v2.7 Bond v3.0: Betrayed power bonus
  powerBonus += Bond.getBetrayedBonus(self);

  // Consume Disrupt on self
  const dis = R.removeCondition(self, 'disrupt', oppSide);
  if (dis) {
    if (dis.effect.disadvantage) advantage -= 1;
    if (dis.effect.onStrike) {
      const penalty = dis.effect.onStrike;
      if (penalty.selfDamage) {
        const dmg = R.applyDamage(self, penalty.selfDamage.resource, penalty.selfDamage.amount, 1);
        log(`    Disrupt penalty: ${side} ${penalty.selfDamage.resource} -${dmg} (${dis.source})`);
      }
    }
    if (dis.effect.stripKeywords) {
      grantedKeywords = [];
      card = { ...card, keywords: [] };
      log(`    Disrupt strips all keywords (${dis.source})`);
    }
    if (dis.effect.randomizeTarget && card.target) {
      const resources = side === 'dungeon'
        ? ['vitality', 'resolve', 'nerve']
        : ['structure', 'veil', 'presence'];
      const randomTarget = resources[Math.floor(Math.random() * resources.length)];
      log(`    Disrupt randomize: ${card.target} → ${randomTarget} (${dis.source})`);
      card = { ...card, target: randomTarget };
    }
  }

  // Resonate
  const lastType = side === 'dungeon' ? ctx.stats.dLastType : ctx.stats.vLastType;
  const allKeywords = [...(card.keywords || []), ...grantedKeywords];
  let resonateBonus = 0;
  if (allKeywords.includes('Resonate') && lastType === card.type) {
    resonateBonus = 1;
    log(`    Resonate: +1P (matching ${card.type} type)`);
  }

  // Trigger evaluation
  let triggerBonus = 0;
  if (card.trigger && evaluateTrigger(card.trigger, self, opp, ctx)) {
    triggerBonus = getTriggerBonus(card.trigger, self, opp, ctx);
    log(`    Trigger: ${card.trigger.description} → +${triggerBonus}P`);
  }

  // ── ATTACKER ROLL ──
  const atkRoll = R.contestedRoll(advantage);
  const atkMod = R.getModifierBonus(card, self);
  const atkTotal = atkRoll.total + atkMod + resonateBonus;
  const atkRollStr = advantage > 0
    ? `3d6kh2[${atkRoll.dice}]→[${atkRoll.kept}]`
    : advantage < 0
      ? `3d6kl2[${atkRoll.dice}]→[${atkRoll.kept}]`
      : `2d6[${atkRoll.kept}]`;

  // ── DEFENDER ROLL ──
  const defRoll = R.contestedRoll(0);
  const defMod = R.getModifierBonus(card, opp);
  // v2.7 Bond v3.0: Scorned bonus adds to defender's roll
  const scornedBonus = Bond.getScornedBonus(opp);
  const defTotal = defRoll.total + defMod + scornedBonus;

  const result = R.resolveTier(atkTotal, defTotal);
  const damagePower = (card.power || 0) + powerBonus + triggerBonus;

  log(`  [${side}] Strike: ${card.name} (P:${card.power}${powerBonus ? `+${powerBonus}e` : ''}${triggerBonus ? `+${triggerBonus}t` : ''} = ${damagePower} dmg) | Roll: ${atkRollStr}+${atkMod}mod = ${atkTotal} vs 2d6[${defRoll.kept}]+${defMod}mod${scornedBonus ? `+${scornedBonus}scorned` : ''} = ${defTotal} → ${result.tier}`);

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
    if (damagePower > 0 && rawDmg < 1) rawDmg = 1;

    // v2.7 Bond v3.0: Exposure bonus damage
    const exposureBonus = Bond.checkExposure(opp, card);
    if (exposureBonus > 0) {
      rawDmg += exposureBonus;
      log(`    [Exposure] +${exposureBonus} bonus damage`);
    }

    // Fortify reduction
    let fortifyReduction = 0;
    const fortifyConds = opp.conditions.filter(c => c.type === 'fortify' && c.resource === card.target);
    for (const fc of fortifyConds) {
      fortifyReduction += fc.reduction;
    }

    // v2.6b: Guard reduction — applies when targeting a guarded party member
    let guardReduction = 0;
    let guardedMemberName = null;

    // Self-cost
    if (card.selfCost) {
      const sCost = R.applyDamage(self, card.selfCost.resource, card.selfCost.amount, 1);
      log(`    Self-cost: ${card.selfCost.resource} -${sCost}`);
    }

    // v2.4: PARTY VITALITY ROUTING
    let applied;
    let partyKnockout = null;
    if (opp.isParty && card.target === 'vitality') {
      // Route to specific party member
      const strategy = ctx.memberTargetStrategy || 'lowest_vitality';
      const memberKey = R.selectPartyTarget(opp, strategy);
      if (memberKey) {
        // v2.6b: Check if this member is Guarded
        const guardCond = opp.conditions.find(c => c.type === 'guarded' && c.memberKey === memberKey);
        if (guardCond) {
          guardReduction = guardCond.powerReduction || 0;
          guardedMemberName = opp.members[memberKey]?.name || memberKey;
        }

        const finalDmg = Math.max(0, rawDmg - reactMitigation - fortifyReduction - guardReduction);
        const memberResult = R.damagePartyMember(opp, memberKey, finalDmg);
        applied = memberResult.damaged;
        const memberName = opp.members[memberKey].name;

        const mitigationParts = [];
        if (reactMitigation > 0) mitigationParts.push(`${reactMitigation} React`);
        if (fortifyReduction > 0) mitigationParts.push(`${fortifyReduction} Fortify`);
        if (guardReduction > 0) mitigationParts.push(`${guardReduction} Guard`);
        const mitigationStr = mitigationParts.length > 0 ? ` (${rawDmg} raw - ${mitigationParts.join(' - ')})` : '';
        log(`    → ${memberName} vitality -${applied}${mitigationStr} [${result.tier}: ${damagePower}×${result.atkMult}=${rawDmg}]`);

        if (memberResult.knockout) {
          partyKnockout = { memberKey, memberName, moraleCascade: memberResult.moraleCascade };
          log(`    >>> ${memberName} KNOCKED OUT!`);
          if (memberResult.moraleCascade) {
            log(`    [Morale] Resolve -${memberResult.moraleCascade.resolveHit}, Nerve -${memberResult.moraleCascade.nerveHit}`);
          }
          // Remove knocked-out member's cards
          const removal = R.removeKnockedOutCards(memberKey, ctx.sides.visitor.hand, ctx.vPile, ctx.vDiscard);
          ctx.sides.visitor.hand = removal.newHand;
          log(`    [Deck] Removed ${removal.removed.length} cards (hand:${removal.from.hand} draw:${removal.from.draw} discard:${removal.from.discard})`);
          if (removal.removed.length > 0) log(`    [Deck] Removed: ${removal.removed.join(', ')}`);
          log(`    [Party] ${opp.knockoutCount}/${opp.killThreshold} knockouts toward Kill`);

          // v2.6b: Remove guard conditions referencing knocked-out member
          opp.conditions = opp.conditions.filter(c => {
            if (c.type === 'guarded' && c.memberKey === memberKey) {
              log(`    [Guard] ${c.source} expires (${memberName} knocked out)`);
              return false;
            }
            return true;
          });
        }
      } else {
        applied = 0;
      }
    } else {
      // Standard path: collective pool damage
      const finalDmg = Math.max(0, rawDmg - reactMitigation - fortifyReduction);
      applied = R.applyDamage(opp, card.target, finalDmg, 1);
      const mitigationParts = [];
      if (reactMitigation > 0) mitigationParts.push(`${reactMitigation} React`);
      if (fortifyReduction > 0) mitigationParts.push(`${fortifyReduction} Fortify`);
      const mitigationStr = mitigationParts.length > 0 ? ` (${rawDmg} raw - ${mitigationParts.join(' - ')})` : '';
      log(`    → ${card.target} -${applied}${mitigationStr} [${result.tier}: ${damagePower}×${result.atkMult}=${rawDmg}]`);
    }

    const tracker = side === 'dungeon' ? ctx.stats.dDamageDealt : ctx.stats.vDamageDealt;
    tracker[card.target] = (tracker[card.target] || 0) + applied;

    if (applied > 0) {
      const keywordCard = { ...card, keywords: allKeywords };
      R.applyKeywords(keywordCard, opp, self, { autoResource: ctx.autoResource, log, activeSide: side });

      // Drain
      if (allKeywords.includes('Drain')) {
        const drainTarget = card.drainTarget || (side === 'dungeon' ? 'presence' : 'vitality');
        const healed = Math.min(applied, 2);
        R.applyBenefit(self, drainTarget, healed);
        log(`    [KW] Drain: ${side} ${drainTarget} +${healed}`);
      }

      // Overwhelm
      if (allKeywords.includes('Overwhelm') && opp[card.target] <= 0) {
        const spill = card.overwhelmTarget || (card.target === 'vitality' ? 'resolve' : card.target === 'nerve' ? 'resolve' : 'nerve');
        const spillDmg = Math.abs(opp[card.target]);
        if (spillDmg > 0) {
          const spillApplied = R.applyDamage(opp, spill, spillDmg, 1);
          log(`    [KW] Overwhelm: excess spills → ${spill} -${spillApplied}`);
        }
      }

      // Rally
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

  // Exhaust
  if (card.exhaust) {
    log(`    [Exhaust] ${card.name} removed from game`);
    card._exhausted = true;
  }
}

// ═══ REACT RESOLUTION ═══

function tryReact(defenderSide, defenderHand, defenderState, attackerState, incomingCard, result, ctx) {
  const log = ctx.log;
  const reactCards = defenderHand.filter(c => c.category === 'React');
  if (reactCards.length === 0) return null;
  if (result.tier !== 'Strong' && result.tier !== 'Devastating') return null;

  const react = reactCards.sort((a, b) => (b.power || 0) - (a.power || 0))[0];

  let reactPower = react.power || 1;
  if (react.reactEffect?.conditionalPower) {
    const cp = react.reactEffect.conditionalPower;
    if (cp.condition === 'self_resource_below_half') {
      const val = defenderState[cp.resource] || 0;
      const start = defenderState.startingValues?.[cp.resource] || 20;
      if (val <= start * 0.5) {
        reactPower = cp.power;
      }
    }
  }

  const reactRoll = R.contestedRoll(0);
  const reactMod = R.getModifierBonus(react, defenderState);
  const reactTotal = reactRoll.total + reactMod + reactPower;
  const threshold = 7;
  const success = reactTotal >= threshold;

  // Absorb: gain Fortify regardless of success
  if (react.reactEffect?.absorb) {
    const fortRes = react.reactEffect.fortifyResource || incomingCard.target;
    const fortAmt = react.reactEffect.fortifyAmount || 1;
    defenderState.conditions.push({
      type: 'fortify', resource: fortRes,
      reduction: fortAmt, duration: 1, source: react.name, fresh: true  // v2.6c
    });
    log(`    [${defenderSide}] React: ${react.name} → Fortify ${fortAmt} (${fortRes})`);
  }

  if (success) {
    let mitigation = reactPower;
    log(`    [${defenderSide}] React: ${react.name} → SUCCESS (2d6[${reactRoll.kept}]+${reactMod}mod+${reactPower}pwr = ${reactTotal} vs ${threshold}) mitigates ${mitigation}`);

    if (react.reactEffect?.reflect && result.tier === 'Devastating') {
      const reflectDmg = 1;
      const reflectTarget = attackerState.side === 'dungeon' ? 'structure' : 'vitality';
      const applied = R.applyDamage(attackerState, reflectTarget, reflectDmg, 1);
      log(`    [Reflect] Attacker ${reflectTarget} -${applied}`);
    }

    // v2.6b: On-success Fortify (Arcane Barrier snowball defense)
    if (react.reactEffect?.onSuccess?.selfFortify) {
      const sf = react.reactEffect.onSuccess.selfFortify;
      defenderState.conditions.push({
        type: 'fortify',
        resource: sf.resource || 'vitality',
        reduction: sf.reduction || 1,
        duration: sf.duration || 1,
        source: react.name,
        placedBy: defenderSide,
        fresh: true,  // v2.6c
      });
      log(`    [${defenderSide}] React Fortify: ${react.name} → Fortify ${sf.reduction || 1} (${sf.resource || 'vitality'}) for ${sf.duration || 1} round`);
    }

    return { card: react, mitigation };
  } else {
    log(`    [${defenderSide}] React: ${react.name} → FAILED (2d6[${reactRoll.kept}]+${reactMod}mod+${reactPower}pwr = ${reactTotal} vs ${threshold})`);
    return { card: react, mitigation: 0 };
  }
}

// ═══ RESHAPE RESOLUTION ═══

function resolveReshape(card, side, self, opp, ctx) {
  const log = ctx.log;
  log(`  [${side}] Reshape: ${card.name}`);

  if (!card.reshapeEffect) return;
  const eff = card.reshapeEffect;

  // v2.6b: Handle `restore` for party knockout recovery (Nature's Renewal, Restoration)
  // This handles both the legacy `restoreMember` flag and the new `restore` object format.
  if ((eff.restoreMember || eff.restore) && self.isParty) {
    const knockedOut = Object.entries(self.members)
      .filter(([_, m]) => m.status === 'knocked_out');

    if (knockedOut.length > 0) {
      const [targetKey, targetMember] = knockedOut[0];

      // Determine heal amount: `restore.amount` is a percentage (0.4 = 40%)
      let healAmount;
      if (eff.restore && eff.restore.amount) {
        // Percentage-based restore (e.g., 0.4 = 40% of max vitality)
        healAmount = Math.max(1, Math.floor(targetMember.maxVitality * eff.restore.amount));
      } else {
        // Legacy: fixed heal amount from heal array
        healAmount = (Array.isArray(eff.heal) ? eff.heal[0]?.amount : eff.heal?.amount) || 4;
      }

      const restoreResult = R.restorePartyMember(self, targetKey, healAmount);

      if (restoreResult.restored) {
        const returned = R.returnMemberCards(targetKey, ctx.fullVisitorDeck, ctx.vDiscard);
        log(`    [Restore] ${targetMember.name} returns at ${restoreResult.vitality} vitality!`);
        log(`    [Deck] ${returned.length} cards returned to discard${returned.length > 0 ? ': ' + returned.join(', ') : ''}`);
      }
      return; // Restoration consumes the full Reshape action
    }
    // No one knocked out — fall through to normal heal effects
    log(`    [Restore] No knocked-out members to restore — applying standard effects`);
  }

  // v2.6b: Track which member was healed (for extendFortify)
  let healedMemberKey = null;

  // v2.4 + v2.6b: Self-member healing and weakest_member routing
  if (eff.heal && self.isParty) {
    const heals = Array.isArray(eff.heal) ? eff.heal : [eff.heal];
    for (const h of heals) {
      if (h.target === 'self_member' && card.member) {
        const m = self.members[card.member];
        if (m && m.status === 'active') {
          const heal = Math.min(h.amount, m.maxVitality - m.vitality);
          m.vitality += heal;
          self.vitality = Object.values(self.members)
            .filter(m2 => m2.status === 'active')
            .reduce((s, m2) => s + m2.vitality, 0);
          log(`    → ${m.name} vitality +${heal} (${m.vitality - heal}→${m.vitality})`);
          healedMemberKey = card.member;
        }
        continue;
      }
      // v2.6b: Handle weakest_member same as select_member
      if ((h.target === 'select_member' || h.target === 'weakest_member') && self.isParty) {
        const active = Object.entries(self.members)
          .filter(([_, m]) => m.status === 'active')
          .sort(([_, a], [__, b]) => a.vitality - b.vitality);
        if (active.length > 0) {
          const [targetKey, targetMember] = active[0];
          const heal = Math.min(h.amount, targetMember.maxVitality - targetMember.vitality);
          targetMember.vitality += heal;
          self.vitality = Object.values(self.members)
            .filter(m => m.status === 'active')
            .reduce((s, m) => s + m.vitality, 0);
          log(`    → ${targetMember.name} vitality +${heal} (now ${targetMember.vitality}/${targetMember.maxVitality})`);
          healedMemberKey = targetKey;
        }
        continue;
      }
      // Standard collective pool heal (resolve, nerve, etc.)
      const before = self[h.resource];
      R.applyBenefit(self, h.resource, h.amount);
      const after = self[h.resource];
      const gained = after - before;
      if (gained > 0) log(`    → ${h.resource} +${gained} (${before}→${after})`);
    }
  } else if (eff.heal) {
    // Non-party standard heal
    const heals = Array.isArray(eff.heal) ? eff.heal : [eff.heal];
    for (const h of heals) {
      const before = self[h.resource];
      R.applyBenefit(self, h.resource, h.amount);
      const after = self[h.resource];
      const gained = after - before;
      if (gained > 0) log(`    → ${h.resource} +${gained} (${before}→${after})`);
    }
  }

  // Shift
  if (eff.shift) {
    const fromVal = self[eff.shift.from];
    const take = Math.min(eff.shift.amount, fromVal);
    if (take > 0) {
      R.applyDamage(self, eff.shift.from, take, 1);
      R.applyBenefit(self, eff.shift.to, take);
      log(`    → ${eff.shift.from} -${take}, ${eff.shift.to} +${take}`);
    }
  }

  // Fortify
  if (eff.fortify) {
    const fortifyData = Array.isArray(eff.fortify) ? eff.fortify : [eff.fortify];
    for (const f of fortifyData) {
      self.conditions.push({
        type: 'fortify',
        resource: f.resource || 'vitality',  // v2.6b: default to vitality for party self-buffs
        reduction: f.reduction || f.amount || 1,
        duration: f.duration || 2,
        source: card.name,
        placedBy: side,
        fresh: true,  // v2.6c
      });
      log(`    → Fortified: ${f.resource || 'vitality'} -${f.reduction || f.amount || 1} incoming for ${f.duration || 2} rounds`);
    }
  }

  // v2.6b: Extend Fortify duration on healed target (Healing Touch + Guard/Ward synergy)
  if (eff.extendFortify) {
    const extensionRounds = eff.extendFortify.rounds || 1;
    // Find active Fortify conditions to extend
    const fortifyConds = self.conditions.filter(c => c.type === 'fortify');
    if (fortifyConds.length > 0) {
      let extended = 0;
      for (const fc of fortifyConds) {
        fc.duration += extensionRounds;
        extended++;
      }
      if (extended > 0) {
        log(`    [Extend] Fortify extended by ${extensionRounds} round${extensionRounds > 1 ? 's' : ''} (${extended} effect${extended > 1 ? 's' : ''})`);
      }
    }
    // Also extend Guard conditions if present
    const guardConds = self.conditions.filter(c => c.type === 'guarded');
    if (guardConds.length > 0) {
      for (const gc of guardConds) {
        gc.duration += extensionRounds;
      }
      log(`    [Extend] Guard extended by ${extensionRounds} round${extensionRounds > 1 ? 's' : ''}`);
    }
  }
}

// ═══ TRAP TRIGGER CHECK ═══
function checkTraps(triggerType, actingSide, self, opp, ctx) {
  const log = ctx.log;
  const oppSide = actingSide === 'dungeon' ? 'visitor' : 'dungeon';
  const traps = opp.conditions.filter(c => c.type === 'trap' && c.trigger === triggerType);
  for (const trap of traps) {
    log(`    TRAP SPRINGS: ${trap.card.name} (triggered by ${triggerType})`);
    opp.conditions = opp.conditions.filter(c => c !== trap);
    if (trap.card.trapEffect) {
      const effects = Array.isArray(trap.card.trapEffect) ? trap.card.trapEffect : [trap.card.trapEffect];
      for (const eff of effects) {
        if (eff.applyEntangle) {
          self.conditions.push({ type: 'entangled', placedBy: oppSide, source: trap.card.name });
          log(`      → Entangle applied`);
        }
        if (eff.damage) {
          const t = self;
          const dmg = R.applyDamage(t, eff.damage.resource, eff.damage.amount, 1);
          log(`      → ${eff.damage.resource} -${dmg}`);
        }
        if (eff.resource) {
          const t = eff.target === 'triggerer' ? self : opp;
          const dmg = R.applyDamage(t, eff.resource, Math.abs(eff.amount), 1);
          log(`      → ${eff.resource} -${dmg}`);
        }
      }
    }
    if (trap.card.keywords?.length) {
      R.applyKeywords(trap.card, self, opp, { autoResource: ctx.autoResource, log, activeSide: oppSide });
    }
  }
}

// ═══ TEST RESOLUTION ═══

function resolveTest(card, side, self, opp, ctx) {
  const log = ctx.log;
  const trustLevel = side === 'dungeon' ? opp.trust : self.trust;
  const rapportLevel = side === 'dungeon' ? self.rapport : opp.rapport;

  const coopChance = Math.min(0.85, 0.4 + (trustLevel * 0.05) + (rapportLevel * 0.03));
  const cooperates = Math.random() < coopChance;

  const testReward = card.testReward || { trust: 2, rapport: 2 };
  const defectPenalty = card.defectPenalty || { trustCrash: 0.5, powerGain: 2 };

  const visitorState = side === 'dungeon' ? opp : self;
  const dungeonState = side === 'dungeon' ? self : opp;

  if (cooperates) {
    log(`  [${side}] Test: ${card.name} → COOPERATE (trust:${trustLevel}, chance:${(coopChance * 100).toFixed(0)}%)`);
    const truGain = applyPromoterGain(visitorState, 'trust', testReward.trust, ctx);
    const rapGain = applyPromoterGain(dungeonState, 'rapport', testReward.rapport, ctx);
    log(`    → trust +${truGain}, rapport +${rapGain}`);
    if (card.exposureCost) {
      const dmg = R.applyDamage(self, card.exposureCost.resource, card.exposureCost.amount, 1);
      log(`    → Exposure: ${card.exposureCost.resource} -${dmg}`);
    }
  } else {
    log(`  [${side}] Test: ${card.name} → DEFECT (trust:${trustLevel}, chance:${(coopChance * 100).toFixed(0)}%)`);
    const oppSide = side === 'dungeon' ? 'visitor' : 'dungeon';
    opp.conditions.push({
      type: 'empower',
      effect: { advantage: false, powerBonus: defectPenalty.powerGain },
      source: `${card.name} (defection)`,
      placedBy: oppSide,
    });
    log(`    → Defector gains +${defectPenalty.powerGain} power on next strike`);
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
  const result = Bond.resolveTransactionalOffer(card, side, self, opp, ctx);
  if (result.bond) {
    ctx.bondTriggered = true;
  }
  return result;
}

// ═══ TRIGGER EVALUATION ═══

function evaluateTrigger(trigger, self, opponent, ctx) {
  if (!trigger?.condition) return false;
  const c = trigger.condition;
  const target = c.target === 'self' ? self : opponent;

  switch (c.type) {
    case 'resource_below': {
      const val = target[c.resource];
      const threshold = c.value !== undefined ? c.value
        : Math.floor((target.startingValues?.[c.resource] || 20) * (c.pct || 0.5));
      return val <= threshold;
    }
    case 'resource_above':
      return (target[c.resource] || 0) >= c.value;
    case 'has_condition':
      return R.hasCondition(target, c.condition);
    case 'no_condition':
      return !R.hasCondition(target, c.condition);
    case 'discard_count': {
      const discard = ctx?.discard || [];
      const count = discard.filter(card => card.category === c.category).length;
      return count >= (c.min || 1);
    }
    case 'discard_count_value': {
      const discard = ctx?.discard || [];
      return discard.filter(card => card.category === c.category).length > 0;
    }
    case 'round_threshold':
      return (ctx?.round || 1) >= (c.value || 1);
    default:
      return false;
  }
}

function getTriggerBonus(trigger, self, opponent, ctx) {
  if (!trigger) return 0;
  const c = trigger.condition;
  if (c?.type === 'discard_count_value') {
    const discard = ctx?.discard || [];
    const count = discard.filter(card => card.category === c.category).length;
    return Math.min(count * (trigger.bonusPerCount || 1), trigger.maxBonus || 4);
  }
  return trigger.bonus || 0;
}

module.exports = { runEncounter };