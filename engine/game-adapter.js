/**
 * SHATTERED DUNGEON — Game Adapter v1.1 (Phase 2 Core)
 *
 * v1.1 FIXES:
 * [FIX] Always spread arrays when returning hand data (React state compat)
 * [FIX] Energy pool snapshot returns current available (not stale)
 * [ADD] advanceToNextEncounter() for multi-room gauntlet with short rest
 * [ADD] getPlayableCards() accounts for committed energy in selection queue
 * [ADD] Event counter on snapshots (forces React re-render)
 */

import * as R from './rules.js';
import { resolveEnergy, consumeAttune } from './energy.js';
import * as Bond from './bond.js';
import {
  resolveStrike,
  resolveReshape,
  resolveOffer,
  resolveTest,
  resolveGuardDisrupt,
  resolveSpreadFortify,
  checkTraps,
  clearEntangle,
  applyPromoterGain,
} from './encounter.js';


// ═══════════════════════════════════════════════════════════════
// STATE SNAPSHOT & DIFF
// ═══════════════════════════════════════════════════════════════

let _eventCounter = 0;

function snapshotState(dungeon, visitor, dEnergy, vEnergy) {
  _eventCounter++;
  const snap = {
    _eventId: _eventCounter,
    dungeon: {
      structure: dungeon.structure, veil: dungeon.veil,
      presence: dungeon.presence, rapport: dungeon.rapport,
      conditions: dungeon.conditions.map(c => ({ ...c })),
    },
    visitor: {
      vitality: visitor.vitality, resolve: visitor.resolve,
      nerve: visitor.nerve, trust: visitor.trust,
      conditions: visitor.conditions.map(c => ({ ...c })),
    },
    dEnergy: { base: dEnergy.base, available: dEnergy.available, temp: dEnergy.tempBonus, spent: dEnergy.spent },
    vEnergy: { base: vEnergy.base, available: vEnergy.available, temp: vEnergy.tempBonus, spent: vEnergy.spent },
  };
  if (visitor.isParty) {
    snap.members = {};
    for (const [k, m] of Object.entries(visitor.members)) {
      snap.members[k] = { vitality: m.vitality, maxVitality: m.maxVitality, status: m.status, name: m.name, role: m.role };
    }
    snap.knockoutCount = visitor.knockoutCount;
  }
  return snap;
}

function diffSnapshots(before, after) {
  const changes = {};
  for (const key of ['structure', 'veil', 'presence', 'rapport']) {
    if (before.dungeon[key] !== after.dungeon[key]) {
      changes[`dungeon.${key}`] = { before: before.dungeon[key], after: after.dungeon[key], delta: after.dungeon[key] - before.dungeon[key] };
    }
  }
  for (const key of ['vitality', 'resolve', 'nerve', 'trust']) {
    if (before.visitor[key] !== after.visitor[key]) {
      changes[`visitor.${key}`] = { before: before.visitor[key], after: after.visitor[key], delta: after.visitor[key] - before.visitor[key] };
    }
  }
  if (before.dEnergy.available !== after.dEnergy.available) {
    changes['dungeon.energy'] = { before: before.dEnergy.available, after: after.dEnergy.available, delta: after.dEnergy.available - before.dEnergy.available, base: after.dEnergy.base };
  }
  if (before.vEnergy.available !== after.vEnergy.available) {
    changes['visitor.energy'] = { before: before.vEnergy.available, after: after.vEnergy.available, delta: after.vEnergy.available - before.vEnergy.available, base: after.vEnergy.base };
  }
  if (before.members && after.members) {
    for (const key of Object.keys(before.members)) {
      const bm = before.members[key]; const am = after.members[key];
      if (bm.vitality !== am.vitality || bm.status !== am.status) {
        changes[`member.${key}`] = { before: { vitality: bm.vitality, status: bm.status }, after: { vitality: am.vitality, status: am.status }, delta: am.vitality - bm.vitality, knockout: bm.status === 'active' && am.status === 'knocked_out', restored: bm.status === 'knocked_out' && am.status === 'active', name: am.name };
      }
    }
  }
  return changes;
}

function createLogCapture() {
  const lines = [];
  return { log: (msg) => lines.push(msg), getLines: () => [...lines], clear: () => { lines.length = 0; } };
}


// ═══════════════════════════════════════════════════════════════
// GAME ENGINE
// ═══════════════════════════════════════════════════════════════

class GameEngine {

  constructor(scenario, playerSide, config = {}) {
    this.scenario = scenario;
    this.playerSide = playerSide;
    this.aiSide = playerSide === 'dungeon' ? 'visitor' : 'dungeon';
    this.config = {
      maxRounds: 15, handSize: 7, drawPerRound: 2, minHandSize: 3,
      bondThreshold: 12, dungeonBaseEnergy: 2, visitorBaseEnergy: 2,
      promoterGainCap: 2, ...config,
    };
    this._phase = 'idle';
    this._encounterIndex = -1;
    this._eventQueue = [];
    this._cardQueue = [];
    this._cardQueueIndex = 0;
    this._currentTurnSide = null;
    this._firstSide = null;
    this._secondSide = null;
    this._turnNumber = 0;
    this._outcome = null;
    this._carryover = null;
    this._dungeon = null; this._visitor = null;
    this._dEnergy = null; this._vEnergy = null;
    this._dHand = null; this._vHand = null;
    this._dPile = null; this._vPile = null;
    this._dDiscard = null; this._vDiscard = null;
    this._fullVisitorDeck = null;
    this._round = 0; this._stats = null; this._cardTracker = null;
    this._encounter = null; this._autoEffects = null; this._autoResource = null;
    this._dungeonAI = null; this._visitorAI = null;
    this._roundStartTrust = 0; this._roundStartRapport = 0; this._roundStartDungeonStrikes = 0;
    this._memberTargetStrategy = null;
    // Store AI refs for multi-room
    this._storedDungeonAI = null; this._storedVisitorAI = null;
  }


  // ─── PUBLIC API ──────────────────────────────────────────────

  startEncounter(encounterIndex, dungeonAI, visitorAI) {
    this._encounterIndex = encounterIndex;
    if (dungeonAI) this._storedDungeonAI = dungeonAI;
    if (visitorAI) this._storedVisitorAI = visitorAI;
    this._dungeonAI = this._storedDungeonAI;
    this._visitorAI = this._storedVisitorAI;

    const enc = this.scenario.encounters[encounterIndex];
    this._encounter = enc.encounter;

    this._visitor = this._carryover?.visitor || (
      this.scenario.visitorTemplate.type === 'party'
        ? R.createPartyVisitorState(this.scenario.visitorTemplate)
        : R.createVisitorState(this.scenario.visitorTemplate)
    );
    this._dungeon = this._carryover?.dungeon || R.createDungeonState(this.scenario.dungeonTemplate);
    this._dEnergy = R.createEnergyPool(this.config.dungeonBaseEnergy);
    this._vEnergy = R.createEnergyPool(this.config.visitorBaseEnergy);

    const dDraw = R.drawOpeningHand(enc.dungeonDeck, this.config.handSize);
    const vDraw = R.drawOpeningHand(enc.visitorDeck, this.config.handSize);
    this._dHand = dDraw.hand;
    this._dPile = dDraw.drawPile;
    this._dDiscard = this._carryover?.dungeonDiscard || [];
    this._vHand = vDraw.hand;
    this._vPile = vDraw.drawPile;
    this._vDiscard = this._carryover?.visitorDiscard || [];
    this._fullVisitorDeck = [...enc.visitorDeck];

    if (typeof this._dungeonAI.initDeck === 'function') this._dungeonAI.initDeck(enc.dungeonDeck);
    if (typeof this._visitorAI.initDeck === 'function') this._visitorAI.initDeck(enc.visitorDeck);

    this._autoEffects = this._encounter.autoEffects || (this._encounter.autoEffect ? [this._encounter.autoEffect] : []);
    this._autoResource = this._autoEffects.find(ae => ae.target === 'visitor')?.resource || null;

    this._round = 0;
    this._stats = { rounds: 0, dCardsPlayed: 0, vCardsPlayed: 0, decisions: 0, dDamageDealt: {}, vDamageDealt: {}, dLastType: null, vLastType: null, dStrikesPlayed: 0, roundsSinceDungeonStrike: 0 };
    this._cardTracker = {
      dungeon: { Strike: 0, Empower: 0, Disrupt: 0, Counter: 0, React: 0, Trap: 0, Offer: 0, Reshape: 0, Test: 0 },
      visitor: { Strike: 0, Empower: 0, Disrupt: 0, Counter: 0, React: 0, Trap: 0, Offer: 0, Reshape: 0, Test: 0 },
    };
    this._outcome = null;

    const dungeonFirst = this._encounter.initiative === 'dungeon';
    this._firstSide = dungeonFirst ? 'dungeon' : 'visitor';
    this._secondSide = dungeonFirst ? 'visitor' : 'dungeon';

    this._phase = 'encounter_start';
    this._eventQueue = [{
      type: 'encounter_start', phase: 'encounter_start',
      data: { encounterIndex, name: this._encounter.name, description: this._encounter.description, initiative: this._encounter.initiative },
      stateSnapshot: this._fullSnapshot(), resourceChanges: {},
      logLines: [`═══ ${this._encounter.name} ═══`, `  Initiative: ${this._encounter.initiative}`],
      awaitingInput: false,
    }];
  }

  /** Advance to next encounter with short rest. Returns false if no more rooms. */
  advanceToNextEncounter() {
    if (this._encounterIndex >= this.scenario.encounters.length - 1) return false;

    const carryover = { visitor: this._visitor, dungeon: this._dungeon, dungeonDiscard: [], visitorDiscard: [] };

    // Dungeon short rest (sequence.js v2.9: floor 85%, heal 50%)
    const d = carryover.dungeon;
    const dsv = d.startingValues || {};
    for (const res of ['structure', 'veil', 'presence']) {
      const starting = dsv[res] || 0;
      if (starting <= 0) continue;
      d[res] = Math.max(d[res], Math.max(1, Math.round(starting * 0.85)));
      const missing = starting - d[res];
      if (missing > 0) { d[res] += Math.round(missing * 0.50); d[res] = Math.min(d[res], starting); }
    }
    d.conditions = [];

    // Visitor short rest (party: downed 25%, active heal 15%, pools 15%)
    const v = carryover.visitor;
    if (v.isParty) {
      const vsv = v.startingValues || {};
      for (const [, member] of Object.entries(v.members)) {
        if (member.status === 'knocked_out') {
          member.status = 'active';
          member.vitality = Math.max(1, Math.round(member.maxVitality * 0.25));
          v.knockoutCount = Math.max(0, v.knockoutCount - 1);
        }
      }
      for (const [, member] of Object.entries(v.members)) {
        if (member.status === 'active' && member.vitality < member.maxVitality) {
          member.vitality += Math.round((member.maxVitality - member.vitality) * 0.15);
          member.vitality = Math.min(member.vitality, member.maxVitality);
        }
      }
      v.vitality = Object.values(v.members).reduce((s, m) => s + m.vitality, 0);
      if (vsv.resolve > 0) v.resolve = Math.min(vsv.resolve, v.resolve + Math.round(vsv.resolve * 0.15));
      if (vsv.nerve > 0) v.nerve = Math.min(vsv.nerve, v.nerve + Math.round(vsv.nerve * 0.15));
    }
    v.conditions = [];

    this._carryover = carryover;
    this.startEncounter(this._encounterIndex + 1);
    return true;
  }

  nextStep() {
    if (this._eventQueue.length > 0) return this._eventQueue.shift();
    switch (this._phase) {
      case 'encounter_start':      return this._advanceToRoundStart();
      case 'round_start':          return this._processRoundStart();
      case 'auto_effects':         return this._processAutoEffects();
      case 'post_auto_win_check':  return this._checkWinAfterAuto();
      case 'first_turn_start':     return this._startTurn(this._firstSide, 1);
      case 'awaiting_player_cards':
        return {
          type: 'awaiting_input', phase: 'awaiting_player_cards',
          data: { side: this.playerSide, hand: [...this._getPlayerHand()], energy: this._energySnap() },
          stateSnapshot: this._fullSnapshot(), resourceChanges: {}, logLines: [],
          awaitingInput: true, inputType: 'card_selection',
        };
      case 'resolving_cards':      return this._resolveNextCard();
      case 'post_first_turn':      return this._postTurnWinCheck(1);
      case 'second_turn_start':    return this._startTurn(this._secondSide, 2);
      case 'post_second_turn':     return this._postTurnWinCheck(2);
      case 'round_end':            return this._processRoundEnd();
      case 'encounter_over':       return null;
      default:                     return null;
    }
  }

  submitCardSelections(decisions) {
    if (this._phase !== 'awaiting_player_cards') throw new Error(`Cannot submit in phase: ${this._phase}`);
    this._cardQueue = decisions;
    this._cardQueueIndex = 0;
    this._currentTurnSide = this.playerSide;
    this._phase = 'resolving_cards';
  }

  getPhase() { return this._phase; }
  getOutcome() { return this._outcome; }
  getEncounterIndex() { return this._encounterIndex; }
  getTotalEncounters() { return this.scenario.encounters.length; }
  getState() { return this._fullSnapshot(); }
  getPlayerHandCopy() { return [...this._getPlayerHand()]; }

  /** Get playable card info accounting for energy already committed in queue. */
  getPlayableCards(currentQueue = []) {
    const hand = this._getPlayerHand();
    const energy = this.playerSide === 'dungeon' ? this._dEnergy : this._vEnergy;
    const self = this.playerSide === 'dungeon' ? this._dungeon : this._visitor;

    let committedCost = 0;
    let queuedGain = 0;
    for (const q of currentQueue) {
      if (q.action === 'play') {
        const bc = q.card.cost || 0;
        const disc = this._peekAttune(q.card, self);
        committedCost += Math.max(0, bc - disc);
      }
      if (q.action === 'energy' || q.action === 'activate') queuedGain += 1;
    }
    const projected = energy.available + queuedGain - committedCost;

    return hand.map(card => {
      const bc = card.cost || 0;
      const disc = this._peekAttune(card, self);
      const eff = Math.max(0, bc - disc);
      const isQueued = currentQueue.some(q => q.card === card);
      return {
        card, effectiveCost: eff, attuneDiscount: disc, isReact: card.category === 'React', isQueued,
        canPlay: !isQueued && (card.category === 'Energy' || card.category === 'React' || eff <= projected),
        canActivate: !isQueued && card.category !== 'React',
      };
    });
  }

  getCarryover() { return { visitor: this._visitor, dungeon: this._dungeon, dungeonDiscard: this._dDiscard, visitorDiscard: this._vDiscard }; }


  // ─── PHASE HANDLERS ──────────────────────────────────────────

  _advanceToRoundStart() { this._phase = 'round_start'; return this.nextStep(); }

  _processRoundStart() {
    this._round++;
    this._stats.rounds = this._round;
    this._roundStartTrust = this._visitor.trust || 0;
    this._roundStartRapport = this._dungeon.rapport || 0;
    this._roundStartDungeonStrikes = this._stats.dStrikesPlayed || 0;
    if (this._visitor.isParty) {
      this._memberTargetStrategy = (typeof this._dungeonAI.selectMemberTarget === 'function')
        ? this._dungeonAI.selectMemberTarget(this._visitor, this._dungeon) : 'lowest_vitality';
    }
    this._phase = 'auto_effects';
    return {
      type: 'round_start', phase: 'round_start', data: { round: this._round },
      stateSnapshot: this._fullSnapshot(), resourceChanges: {},
      logLines: [`\n──────── Round ${this._round} ────────`], awaitingInput: false,
    };
  }

  _processAutoEffects() {
    const before = this._fullSnapshot();
    const lc = createLogCapture();
    for (const ae of this._autoEffects) {
      const fires = ae.frequency === 'every' || (ae.frequency === 'other' && this._round % 2 === 1);
      if (fires && ae.resource && ae.amount !== 0) {
        const tgt = ae.target === 'visitor' ? this._visitor : this._dungeon;
        if (ae.amount < 0) {
          if (tgt.isParty && ae.resource === 'vitality') {
            const tk = R.selectPartyTarget(tgt, 'random');
            if (tk) { const r = R.damagePartyMember(tgt, tk, Math.abs(ae.amount)); lc.log(`  ⚙ Auto: ${tgt.members[tk].name} vitality ${ae.amount}`); if (r.knockout) { lc.log(`    💀 ${tgt.members[tk].name} KNOCKED OUT!`); const rem = R.removeKnockedOutCards(tk, this._vHand, this._vPile, this._vDiscard); this._vHand = rem.newHand; } }
          } else { R.applyDamage(tgt, ae.resource, Math.abs(ae.amount), 1); lc.log(`  ⚙ Auto: ${ae.target} ${ae.resource} ${ae.amount}`); }
        } else { R.applyBenefit(tgt, ae.resource, ae.amount); lc.log(`  ⚙ Auto: ${ae.target} ${ae.resource} +${ae.amount}`); }
      }
    }
    R.resolveErode(this._visitor, this._autoResource, lc.log);
    R.resolveErode(this._dungeon, this._autoResource, lc.log);
    const esc = R.getEscalation(this._round, this.config);
    if (esc) {
      if (this._visitor.isParty) { const et = R.selectPartyTarget(this._visitor, 'random'); if (et) R.damagePartyMember(this._visitor, et, esc.damage); }
      else R.applyDamage(this._visitor, 'vitality', esc.damage, 1);
      R.applyDamage(this._dungeon, 'structure', esc.damage, 1);
      lc.log(`  ⚡ Escalation: Both sides take ${esc.damage}`);
    }
    const after = this._fullSnapshot();
    this._phase = 'post_auto_win_check';
    return { type: 'auto_effects', phase: 'auto_effects', data: { round: this._round }, stateSnapshot: after, resourceChanges: diffSnapshots(before, after), logLines: lc.getLines(), awaitingInput: false };
  }

  _checkWinAfterAuto() {
    const o = R.checkWinConditions(this._visitor, this._dungeon, this.config);
    if (o) { this._outcome = o; this._phase = 'encounter_over'; return this._endEvent(o); }
    this._phase = 'first_turn_start';
    return this.nextStep();
  }

  _startTurn(side, turnNumber) {
    this._currentTurnSide = side;
    this._turnNumber = turnNumber;
    const isHuman = side === this.playerSide;
    const lc = createLogCapture();
    clearEntangle(side === 'dungeon' ? this._dungeon : this._visitor, side, lc.log);

    if (isHuman) {
      this._phase = 'awaiting_player_cards';
      return {
        type: 'turn_start', phase: 'awaiting_player_cards',
        data: { side, isHuman: true, turnNumber, hand: [...this._getPlayerHand()], energy: this._energySnap() },
        stateSnapshot: this._fullSnapshot(), resourceChanges: {}, logLines: lc.getLines(),
        awaitingInput: true, inputType: 'card_selection',
      };
    }
    // AI turn
    const sd = this._sd(side);
    const ctx = this._ctx(side);
    const decisions = sd.ai.pickCards([...sd.hand], sd.energy, sd.self, sd.opp, ctx);
    this._cardQueue = decisions;
    this._cardQueueIndex = 0;
    this._currentTurnSide = side;
    this._phase = 'resolving_cards';
    return {
      type: 'turn_start', phase: 'resolving_cards',
      data: { side, isHuman: false, turnNumber, cardCount: decisions.filter(d => d.card.category !== 'React').length },
      stateSnapshot: this._fullSnapshot(), resourceChanges: {}, logLines: lc.getLines(), awaitingInput: false,
    };
  }

  _resolveNextCard() {
    const side = this._currentTurnSide;
    const sd = this._sd(side);
    const hand = sd.hand;

    while (this._cardQueueIndex < this._cardQueue.length) {
      const decision = this._cardQueue[this._cardQueueIndex];
      this._cardQueueIndex++;
      const card = decision.card;
      const idx = hand.indexOf(card);
      if (idx === -1) continue;
      if (card.category === 'React') continue;

      const before = this._fullSnapshot();
      const lc = createLogCapture();
      const ctx = this._ctx(side, lc.log);
      let ed = { side, card: this._csum(card), action: decision.action };

      if (card.category === 'Energy') {
        const res = resolveEnergy(card, sd.energy, sd.self, sd.opp);
        hand.splice(idx, 1); sd.discard.push(card);
        lc.log(`  ⚡ [${side}] Energy: ${card.name} → ${res.description || res.type}`);
        this._stats.decisions++; ed.action = 'energy'; ed.energyResult = res;
        return this._cardEvt(ed, before, this._fullSnapshot(), lc.getLines());
      }

      if (decision.action === 'activate') {
        hand.splice(idx, 1); sd.energy.addTemp(1); sd.discard.push(card);
        lc.log(`  🔄 [${side}] Activate: ${card.name} → +1 temp Energy`);
        this._stats.decisions++;
        return this._cardEvt(ed, before, this._fullSnapshot(), lc.getLines());
      }

      if (decision.action === 'restrain') {
        hand.splice(idx, 1); sd.discard.push(card);
        if (side === 'dungeon') { const g = applyPromoterGain(sd.self, 'rapport', 1, ctx); lc.log(`  🤝 [${side}] Restrain: ${card.name} → rapport +${g}`); }
        else { const g = applyPromoterGain(sd.self, 'trust', 1, ctx); lc.log(`  🤝 [${side}] Restrain: ${card.name} → trust +${g}`); }
        this._stats.decisions++;
        return this._cardEvt(ed, before, this._fullSnapshot(), lc.getLines());
      }

      const bc = card.cost || 0;
      const disc = consumeAttune(card, sd.self);
      const cost = Math.max(0, bc - disc);
      if (!sd.energy.canAfford(cost)) continue;
      sd.energy.spend(cost);
      if (disc > 0) lc.log(`  ✨ [${side}] Attune: ${card.name} cost ${bc} → ${cost}`);
      hand.splice(idx, 1);
      this._stats.decisions++;

      switch (card.category) {
        case 'Strike':
          resolveStrike(card, side, sd.self, sd.opp, sd.energy, ctx, sd);
          checkTraps('strike_played', side, sd.self, sd.opp, ctx);
          Bond.applyTrustDecay(side, sd.self, sd.opp, ctx);
          Bond.checkBetrayal(side, sd.self, sd.opp, ctx);
          if (side === 'dungeon') { this._stats.dStrikesPlayed = (this._stats.dStrikesPlayed || 0) + 1; this._stats.roundsSinceDungeonStrike = 0; }
          break;
        case 'Test': resolveTest(card, side, sd.self, sd.opp, ctx); break;
        case 'Empower':
          sd.self.conditions.push({ type: 'empower', effect: card.empowerEffect || {}, source: card.name, placedBy: side });
          lc.log(`  💪 [${side}] Empower: ${card.name}`);
          checkTraps('empower_played', side, sd.self, sd.opp, ctx); break;
        case 'Disrupt':
          if (card.disruptEffect?.guard) resolveGuardDisrupt(card, side, sd.self, sd.opp, ctx);
          else { sd.opp.conditions.push({ type: 'disrupt', effect: card.disruptEffect || {}, source: card.name, placedBy: side }); lc.log(`  🛡 [${side}] Disrupt: ${card.name}`); }
          break;
        case 'Counter': {
          const os = side === 'dungeon' ? 'visitor' : 'dungeon';
          let rem = R.removeCondition(sd.opp, 'empower', os);
          if (!rem) rem = R.removeCondition(sd.self, 'disrupt', os);
          if (rem) {
            lc.log(`  ⚔ [${side}] Counter: ${card.name} removes ${rem.source}`);
            if (card.counterDamage) { const ca = card.counterEffect?.empowerBonus && rem.type === 'empower' ? (card.counterEffect.empowerBonus.chipDamage || card.counterDamage.amount) : card.counterDamage.amount; R.applyDamage(sd.opp, card.counterDamage.resource, ca, 1); }
            if (card.counterEffect?.steal && rem.type === 'empower') sd.self.conditions.push({ ...rem, placedBy: side });
            if (card.counterEffect?.applyEntangle) sd.opp.conditions.push({ type: 'entangled', placedBy: side, source: card.name });
            if (card.counterEffect?.applyFortify) sd.self.conditions.push({ type: 'fortify', resource: card.counterEffect.fortifyResource || 'structure', reduction: card.counterEffect.applyFortify, duration: 1, source: card.name, fresh: true });
            if (card.counterEffect?.spreadFortify) resolveSpreadFortify(card, side, sd.self, sd.opp, ctx);
          } else {
            lc.log(`  ⚔ [${side}] Counter: ${card.name} → nothing to remove`);
            if (card.counterEffect?.spreadFortify) resolveSpreadFortify(card, side, sd.self, sd.opp, ctx);
          }
          checkTraps('counter_played', side, sd.self, sd.opp, ctx); break;
        }
        case 'Trap':
          sd.self.conditions.push({ type: 'trap', card, trigger: card.trapTrigger, placedBy: side });
          lc.log(`  🪤 [${side}] Trap set: ${card.name}`); break;
        case 'Offer': resolveOffer(card, side, sd.self, sd.opp, ctx); break;
        case 'Reshape': resolveReshape(card, side, sd.self, sd.opp, ctx); break;
        default: lc.log(`  [${side}] Play: ${card.name}`);
      }

      if (!card._exhausted) sd.discard.push(card);
      if (card.category && this._cardTracker[side]) this._cardTracker[side][card.category] = (this._cardTracker[side][card.category] || 0) + 1;
      if (side === 'dungeon') this._stats.dCardsPlayed++; else this._stats.vCardsPlayed++;

      if (ctx.bondTriggered) {
        this._outcome = { winner: 'both', condition: 'Bond', desc: 'Covenant accepted' };
        this._phase = 'encounter_over';
        const evt = this._cardEvt(ed, before, this._fullSnapshot(), lc.getLines());
        evt.data.outcome = this._outcome; return evt;
      }

      const wc = R.checkWinConditions(this._visitor, this._dungeon, this.config);
      if (wc) {
        this._outcome = wc; this._phase = 'encounter_over';
        const evt = this._cardEvt(ed, before, this._fullSnapshot(), lc.getLines());
        evt.data.winCondition = wc; return evt;
      }

      return this._cardEvt(ed, before, this._fullSnapshot(), lc.getLines());
    }

    this._phase = this._turnNumber === 1 ? 'post_first_turn' : 'post_second_turn';
    return { type: 'turn_end', phase: this._phase, data: { side, turnNumber: this._turnNumber }, stateSnapshot: this._fullSnapshot(), resourceChanges: {}, logLines: [], awaitingInput: false };
  }

  _postTurnWinCheck(tn) {
    const o = R.checkWinConditions(this._visitor, this._dungeon, this.config);
    if (o) { this._outcome = o; this._phase = 'encounter_over'; return this._endEvent(o); }
    this._phase = tn === 1 ? 'second_turn_start' : 'round_end';
    return this.nextStep();
  }

  _processRoundEnd() {
    const before = this._fullSnapshot();
    const lc = createLogCapture();

    const dDC = Math.max(this.config.drawPerRound, this.config.minHandSize - this._dHand.length);
    const vDC = Math.max(this.config.drawPerRound, this.config.minHandSize - this._vHand.length);
    if (dDC > 0) this._dHand.push(...R.drawCards(this._dPile, this._dDiscard, dDC));
    if (vDC > 0) this._vHand.push(...R.drawCards(this._vPile, this._vDiscard, vDC));

    this._dEnergy.refresh(); this._vEnergy.refresh();

    for (const state of [this._dungeon, this._visitor]) {
      state.conditions = state.conditions.filter(c => {
        if (c.type === 'fortify') { if (c.fresh) { c.fresh = false; return true; } c.duration--; if (c.duration <= 0) { lc.log(`  [Fortify] ${c.source} expires`); return false; } }
        if (c.type === 'guarded') { if (c.fresh) { c.fresh = false; return true; } c.duration--; if (c.duration <= 0) { lc.log(`  [Guard] ${c.source} expires`); return false; } }
        return true;
      });
    }

    Bond.resolveBindings(this._visitor, { log: lc.log });
    Bond.resolveBindings(this._dungeon, { log: lc.log });
    Bond.checkDependencies(this._visitor, { log: lc.log });
    Bond.tickBondConditions(this._visitor);
    Bond.tickBondConditions(this._dungeon);

    if (this._stats.dStrikesPlayed === this._roundStartDungeonStrikes) this._stats.roundsSinceDungeonStrike = (this._stats.roundsSinceDungeonStrike || 0) + 1;

    if (this._round >= this.config.maxRounds) {
      this._outcome = { winner: 'visitor', condition: 'Survive', desc: 'Round limit reached' };
      this._phase = 'encounter_over';
    } else { this._phase = 'round_start'; }

    const after = this._fullSnapshot();
    return {
      type: 'round_end', phase: this._phase,
      data: { round: this._round, dungeonDrew: dDC, visitorDrew: vDC, playerHand: [...this._getPlayerHand()], encounterOver: this._phase === 'encounter_over', outcome: this._outcome },
      stateSnapshot: after, resourceChanges: diffSnapshots(before, after), logLines: lc.getLines(), awaitingInput: false,
    };
  }


  // ─── HELPERS ─────────────────────────────────────────────────

  _sd(side) {
    return side === 'dungeon'
      ? { hand: this._dHand, energy: this._dEnergy, self: this._dungeon, opp: this._visitor, ai: this._dungeonAI, discard: this._dDiscard }
      : { hand: this._vHand, energy: this._vEnergy, self: this._visitor, opp: this._dungeon, ai: this._visitorAI, discard: this._vDiscard };
  }

  _ctx(side, logFn) {
    const os = side === 'dungeon' ? 'visitor' : 'dungeon';
    const od = this._sd(os); const sd = this._sd(side);
    return {
      encounter: this._encounter, round: this._round, stats: this._stats,
      autoResource: this._autoResource, log: logFn || (() => {}),
      activeSide: side, opponentReactHand: od.hand, opponentSide: os,
      cardTracker: this._cardTracker, bondThreshold: this.config.bondThreshold,
      roundStartTrust: this._roundStartTrust, roundStartRapport: this._roundStartRapport,
      promoterGainCap: this.config.promoterGainCap,
      memberTargetStrategy: side === 'dungeon' ? this._memberTargetStrategy : null,
      fullVisitorDeck: this._fullVisitorDeck, vPile: this._vPile, vDiscard: this._vDiscard,
      sides: { dungeon: this._sd('dungeon'), visitor: this._sd('visitor') },
      bondTriggered: false, discard: sd.discard,
    };
  }

  _getPlayerHand() { return this.playerSide === 'dungeon' ? this._dHand : this._vHand; }

  _energySnap() {
    const e = this.playerSide === 'dungeon' ? this._dEnergy : this._vEnergy;
    return { base: e.base, available: e.available, temp: e.tempBonus, spent: e.spent };
  }

  _peekAttune(card, self) {
    if (!card.type) return 0;
    const c = self.conditions.find(c => c.type === 'attune' && c.cardType === card.type);
    return c ? (c.discount || 1) : 0;
  }

  _fullSnapshot() { return snapshotState(this._dungeon, this._visitor, this._dEnergy, this._vEnergy); }

  _csum(card) {
    return { name: card.name, category: card.category, type: card.type, cost: card.cost, power: card.power, target: card.target, keywords: card.keywords, description: card.description, member: card.member };
  }

  _cardEvt(ed, before, after, lines) {
    return { type: 'card_played', phase: this._phase, data: ed, stateSnapshot: after, resourceChanges: diffSnapshots(before, after), logLines: lines, awaitingInput: false };
  }

  _endEvent(outcome) {
    return { type: 'encounter_end', phase: 'encounter_over', data: { outcome, stats: { ...this._stats }, round: this._round }, stateSnapshot: this._fullSnapshot(), resourceChanges: {}, logLines: [`  >>> ${outcome.condition}: ${outcome.desc}`], awaitingInput: false };
  }
}


// ═══════════════════════════════════════════════════════════════
// AUTO-COMPOSE
// ═══════════════════════════════════════════════════════════════

function autoCompose(side, allEncounters, allMembers) {
  if (side === 'dungeon') {
    const pool = [...allEncounters]; const enc = [];
    for (let i = 0; i < 3; i++) { const idx = Math.floor(Math.random() * pool.length); enc.push(pool.splice(idx, 1)[0]); }
    return { encounters: enc };
  } else {
    const pool = [...allMembers]; const mem = [];
    for (let i = 0; i < 4; i++) { const idx = Math.floor(Math.random() * pool.length); mem.push(pool.splice(idx, 1)[0]); }
    return { members: mem };
  }
}

export { GameEngine, autoCompose, snapshotState, diffSnapshots };
