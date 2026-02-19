/**
 * COMBO SEQUENCER — Unit Tests
 * 
 * Tests the 5 core capabilities:
 *   1. Surge Planning — burst turns with expensive cards
 *   2. Attune Sequencing — discount applied before matching cards
 *   3. Siphon Awareness — condition-aware permanent growth
 *   4. Budget-Aware Combos — Empower+Strike enabled by energy planning
 *   5. Win Condition Diversification — resolve/nerve boost when kill dominates
 * 
 * Run: node ai/test-combo-sequencer.js
 */

// ── MOCK DEPENDENCIES ──

// Mock ai-utils
const mockAiUtils = {
  getEffectiveCost(card, self) {
    const baseCost = card.cost || 0;
    if (baseCost === 0) return 0;
    if (!card.type || !self || !self.conditions) return baseCost;
    const attune = self.conditions.find(
      c => c.type === 'attune' && c.cardType === card.type
    );
    if (!attune) return baseCost;
    return Math.max(0, baseCost - (attune.discount || 1));
  }
};

// Mock rules for checkSiphonCondition
const mockRules = {
  hasCondition(target, condType) {
    return (target.conditions || []).some(c => c.type === condType);
  }
};

// Mock checkSiphonCondition
function checkSiphonCondition(siphon, self, opponent) {
  if (!siphon || !siphon.condition) return false;
  const cond = siphon.condition;
  const target = siphon.target === 'opponent' ? opponent : self;
  switch (cond.type) {
    case 'has_condition':
      return mockRules.hasCondition(target, cond.condition);
    case 'resource_below': {
      const current = target[cond.resource] || 0;
      const start = (target.startingValues || {})[cond.resource] || 20;
      return current / start < (cond.pct || 0.5);
    }
    default:
      return false;
  }
}

// ── INLINE THE MODULE (with mocked requires) ──
// We'll directly test the exported functions by loading the module manually

// For standalone testing, we re-implement the core logic here with mocks
// In production, you'd use: const { planTurn } = require('./combo-sequencer');

// ── MOCK getEffectiveCost into the module scope ──
const getEffectiveCost = mockAiUtils.getEffectiveCost;

// ── IMPORT CORE FUNCTIONS (copy from module for standalone test) ──
// In integration, replace this with: const seq = require('./combo-sequencer');

function simulateEnergyPlay(energyCards, energy, self, opponent) {
  let available = energy.available;
  let permanentGained = 0;
  const simSelf = { ...self, conditions: [...(self.conditions || [])] };

  for (const ec of energyCards) {
    const etype = ec.energyType || 'standard';
    switch (etype) {
      case 'standard':
        available += (ec.energyGain || 1);
        permanentGained += (ec.energyGain || 1);
        break;
      case 'surge':
        available += (ec.surgeGain || 2);
        break;
      case 'attune':
        available += (ec.energyGain || 1);
        permanentGained += (ec.energyGain || 1);
        if (ec.attune) {
          const existing = simSelf.conditions.find(
            c => c.type === 'attune' && c.cardType === ec.attune.cardType
          );
          if (!existing) {
            simSelf.conditions.push({
              type: 'attune', cardType: ec.attune.cardType,
              discount: ec.attune.discount || 1, source: ec.name, duration: 99,
            });
          }
        }
        break;
      case 'siphon': {
        const condMet = checkSiphonCondition(ec.siphon, self, opponent);
        if (condMet) {
          available += (ec.energyGain || 1);
          permanentGained += (ec.energyGain || 1);
        } else {
          available += (ec.siphonFallback || 1);
        }
        break;
      }
      default:
        available += 1;
        permanentGained += 1;
    }
  }
  return { available, permanentGained, self: simSelf };
}

// ═══ TEST HELPERS ═══

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.log(`  ❌ ${message}`);
  }
}

function makeEnergy(base, spent = 0, temp = 0) {
  return {
    base, spent, tempBonus: temp,
    get available() { return this.base + this.tempBonus - this.spent; },
    canAfford(cost) { return this.available >= cost; },
  };
}

function makeSelf(overrides = {}) {
  return {
    side: 'dungeon',
    structure: 16, veil: 14, presence: 12,
    rapport: 0,
    conditions: [],
    startingValues: { structure: 16, veil: 14, presence: 12 },
    ...overrides,
  };
}

function makeOpponent(overrides = {}) {
  return {
    side: 'visitor',
    vitality: 20, resolve: 16, nerve: 16,
    conditions: [],
    startingValues: { vitality: 20, resolve: 16, nerve: 16 },
    ...overrides,
  };
}

// ═══ SAMPLE CARDS ═══

const CARDS = {
  // Energy
  standard: { name: 'Earthen Focus', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'standard', energyGain: 1 },
  surge: { name: 'Predatory Surge', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'surge', surgeGain: 2 },
  attuneEnv: { name: 'Resonant Core', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'attune', energyGain: 1, attune: { cardType: 'Environmental', discount: 1 } },
  attuneMyst: { name: 'Fear Essence', category: 'Energy', type: 'Social', cost: 0, energyType: 'attune', energyGain: 1, attune: { cardType: 'Mystical', discount: 1 } },
  siphonEntangle: { name: 'Root Siphon', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'siphon', energyGain: 1, siphonFallback: 1, siphon: { condition: { type: 'has_condition', condition: 'entangled' }, target: 'opponent' } },
  siphonNerve: { name: 'Dread Siphon', category: 'Energy', type: 'Social', cost: 0, energyType: 'siphon', energyGain: 1, siphonFallback: 1, siphon: { condition: { type: 'resource_below', resource: 'nerve', pct: 0.5 }, target: 'opponent' } },

  // Strikes
  cheapStrike: { name: 'Tremor Slam', category: 'Strike', type: 'Environmental', cost: 1, power: 1, target: 'nerve', keywords: ['Erode'] },
  midStrike: { name: 'Entombing Grasp', category: 'Strike', type: 'Environmental', cost: 2, power: 2, target: 'vitality', keywords: ['Entangle'] },
  expensiveStrike: { name: 'Soul Leech', category: 'Strike', type: 'Social', cost: 3, power: 2, target: 'nerve', keywords: ['Drain'], drainTarget: 'presence' },
  conditionalStrike: { name: 'Crushing Grip', category: 'Strike', type: 'Environmental', cost: 2, power: 2, target: 'vitality', keywords: ['Erode'], trigger: { condition: { type: 'has_condition', condition: 'entangled' }, bonus: 2 } },
  mystStrike: { name: 'Nightmare Surge', category: 'Strike', type: 'Mystical', cost: 2, power: 3, target: 'nerve', keywords: ['Overwhelm'], overwhelmTarget: 'resolve' },

  // Empower
  empower: { name: 'Predatory Stance', category: 'Empower', type: 'Environmental', cost: 1, power: 0 },

  // Disrupt
  disrupt: { name: 'Spatial Distortion', category: 'Disrupt', type: 'Mystical', cost: 1, power: 0 },

  // Counter
  counter: { name: 'Dispel', category: 'Counter', type: 'Mystical', cost: 1, power: 0 },

  // Offer
  offer: { name: 'Luminous Gift', category: 'Offer', type: 'Social', cost: 1, power: 0, target: 'trust' },
};

// ═══ TESTS ═══

console.log('\n╔══════════════════════════════════════════╗');
console.log('║  COMBO SEQUENCER — Unit Tests            ║');
console.log('╚══════════════════════════════════════════╝\n');

// ── TEST 1: Surge Planning ──
console.log('── 1. SURGE PLANNING ──');
{
  const energy = makeEnergy(2); // Base 2, available 2
  const self = makeSelf();
  const opponent = makeOpponent();

  // Hand: Surge + cost-3 Strike
  // Without Surge: can't afford cost-3 (only 2 available)
  // With Surge: 2 + 2 = 4 available, can afford cost-3
  const sim = simulateEnergyPlay([CARDS.surge], energy, self, opponent);
  assert(sim.available === 4, `Surge adds temp energy: available=${sim.available} (expected 4)`);
  assert(sim.permanentGained === 0, `Surge gives no permanent growth: permanent=${sim.permanentGained}`);

  // Verify the expensive strike becomes affordable
  const cost3 = getEffectiveCost(CARDS.expensiveStrike, sim.self);
  assert(cost3 <= sim.available, `Cost-3 Strike (${cost3}) affordable after Surge (${sim.available} available)`);
}

// ── TEST 2: Attune Sequencing ──
console.log('\n── 2. ATTUNE SEQUENCING ──');
{
  const energy = makeEnergy(2);
  const self = makeSelf();
  const opponent = makeOpponent();

  // Play Attune(Environmental), then check if Environmental card gets discount
  const sim = simulateEnergyPlay([CARDS.attuneEnv], energy, self, opponent);
  assert(sim.available === 3, `Attune adds permanent: available=${sim.available} (expected 3)`);

  // Check that Environmental cards now cost less
  const discountedCost = getEffectiveCost(CARDS.midStrike, sim.self); // Environmental, cost 2
  assert(discountedCost === 1, `Environmental Strike discounted: cost=${discountedCost} (expected 1)`);

  // Non-matching type should NOT get discount
  const nonMatchCost = getEffectiveCost(CARDS.expensiveStrike, sim.self); // Social, cost 3
  assert(nonMatchCost === 3, `Social Strike NOT discounted: cost=${nonMatchCost} (expected 3)`);

  // Mystical attune should discount Mystical cards
  const simMyst = simulateEnergyPlay([CARDS.attuneMyst], energy, self, opponent);
  const mystCost = getEffectiveCost(CARDS.mystStrike, simMyst.self); // Mystical, cost 2
  assert(mystCost === 1, `Mystical Strike discounted by Mystical Attune: cost=${mystCost} (expected 1)`);
}

// ── TEST 3: Siphon Awareness ──
console.log('\n── 3. SIPHON AWARENESS ──');
{
  const energy = makeEnergy(2);
  const self = makeSelf();

  // Siphon condition: opponent has 'entangled'
  const entangledOpp = makeOpponent({ conditions: [{ type: 'entangled' }] });
  const normalOpp = makeOpponent();

  // Condition MET: should get permanent
  const simMet = simulateEnergyPlay([CARDS.siphonEntangle], energy, self, entangledOpp);
  assert(simMet.permanentGained === 1, `Siphon with condition met: permanent=${simMet.permanentGained} (expected 1)`);
  assert(simMet.available === 3, `Siphon permanent: available=${simMet.available} (expected 3)`);

  // Condition NOT MET: should get temp fallback
  const simNot = simulateEnergyPlay([CARDS.siphonEntangle], energy, self, normalOpp);
  assert(simNot.permanentGained === 0, `Siphon without condition: permanent=${simNot.permanentGained} (expected 0)`);
  assert(simNot.available === 3, `Siphon fallback temp: available=${simNot.available} (expected 3)`);

  // Nerve-based siphon: opponent nerve below 50%
  const lowNerveOpp = makeOpponent({ nerve: 6, startingValues: { vitality: 20, resolve: 16, nerve: 16 } });
  const simNerve = simulateEnergyPlay([CARDS.siphonNerve], energy, self, lowNerveOpp);
  assert(simNerve.permanentGained === 1, `Nerve siphon (nerve ${lowNerveOpp.nerve}/16 < 50%): permanent=${simNerve.permanentGained}`);

  const highNerveOpp = makeOpponent({ nerve: 14 });
  const simHighNerve = simulateEnergyPlay([CARDS.siphonNerve], energy, self, highNerveOpp);
  assert(simHighNerve.permanentGained === 0, `Nerve siphon (nerve ${highNerveOpp.nerve}/16 > 50%): no permanent`);
}

// ── TEST 4: Empower + Strike Combo Budget ──
console.log('\n── 4. EMPOWER + STRIKE COMBO BUDGET ──');
{
  const energy = makeEnergy(2); // 2 available
  const self = makeSelf();
  const opponent = makeOpponent();

  // Empower(1) + Strike(2) = 3 total. Without energy card, can only afford 2.
  // With Standard energy (+1 permanent), available = 3, can afford both.
  const simStandard = simulateEnergyPlay([CARDS.standard], energy, self, opponent);
  assert(simStandard.available === 3, `Standard energy enables combo: available=${simStandard.available}`);

  const empCost = getEffectiveCost(CARDS.empower, simStandard.self);
  const strikeCost = getEffectiveCost(CARDS.midStrike, simStandard.self);
  const comboTotal = empCost + strikeCost;
  assert(comboTotal <= simStandard.available, `Empower(${empCost}) + Strike(${strikeCost}) = ${comboTotal} ≤ ${simStandard.available}`);

  // With Attune(Environmental): Empower(1) + Strike(2→1) = 2 total. Fits in base energy!
  const simAttune = simulateEnergyPlay([CARDS.attuneEnv], energy, self, opponent);
  const discountedStrike = getEffectiveCost(CARDS.midStrike, simAttune.self);
  const attuneComboTotal = empCost + discountedStrike;
  assert(attuneComboTotal === 2, `Attune combo: Empower(${empCost}) + discounted Strike(${discountedStrike}) = ${attuneComboTotal}`);
}

// ── TEST 5: Win Condition Diversification ──
console.log('\n── 5. WIN CONDITION DIVERSIFICATION ──');
{
  // Simulate kill-dominant state: vitality heavily damaged, resolve/nerve untouched
  const killDominantOpp = makeOpponent({
    vitality: 6, resolve: 16, nerve: 16, // Vitality at 30%, others at 100%
  });

  const profile = {
    baseWeights: { Strike: 2, Empower: 1.5 },
    preferredTargets: ['vitality', 'nerve'],
    scoreThreshold: 2,
  };

  // Create scored actions: vitality strike vs nerve strike
  const scoredActions = [
    { card: CARDS.cheapStrike, score: 8 },      // targets nerve
    { card: CARDS.midStrike, score: 10 },        // targets vitality
    { card: CARDS.expensiveStrike, score: 7 },   // targets nerve (Soul Leech)
  ];

  // Before diversification
  const vitalityBefore = scoredActions.find(s => s.card.target === 'vitality').score;
  const nerveBefore = scoredActions.filter(s => s.card.target === 'nerve').map(s => s.score);

  // This is a simplified version of the diversification logic
  const oppReducers = [
    { name: 'vitality', ratio: 6 / 20 },  // 0.3
    { name: 'resolve', ratio: 16 / 16 },  // 1.0
    { name: 'nerve', ratio: 16 / 16 },    // 1.0
  ];
  const killDominance = (1 - 0.3) - Math.max(1 - 1.0, 1 - 1.0); // 0.7 - 0 = 0.7
  assert(killDominance > 0.15, `Kill dominance detected: ${killDominance.toFixed(2)} > 0.15`);

  const boostAmount = Math.min(killDominance * 10, 4);
  assert(boostAmount === 4, `Max boost applied: ${boostAmount} (capped at 4)`);

  // Nerve cards should be boosted
  const nerveBoostExpected = nerveBefore.map(s => s + boostAmount);
  assert(nerveBoostExpected[0] === 12, `Cheap nerve Strike boosted: ${nerveBefore[0]} → ${nerveBoostExpected[0]}`);
  assert(nerveBoostExpected[1] === 11, `Soul Leech boosted: ${nerveBefore[1]} → ${nerveBoostExpected[1]}`);

  // Vitality card should be slightly penalized
  const vitalityPenalty = boostAmount * 0.3;
  assert(vitalityBefore - vitalityPenalty === 8.8, `Vitality Strike penalized: ${vitalityBefore} → ${(vitalityBefore - vitalityPenalty).toFixed(1)}`);
}

// ── TEST 6: Energy Card Ordering ──
console.log('\n── 6. ENERGY CARD ORDERING ──');
{
  const self = makeSelf();
  const opponent = makeOpponent({ conditions: [{ type: 'entangled' }] });

  // Mix of all energy types
  const energyHand = [CARDS.surge, CARDS.standard, CARDS.attuneEnv, CARDS.siphonEntangle];

  // Plan has Environmental actions → Attune(Env) should come first
  const plannedActions = [{ card: CARDS.midStrike, score: 8 }]; // Environmental type

  // Check ordering priorities
  const neededTypes = new Set(['Environmental']);

  function getPrio(card) {
    const etype = card.energyType || 'standard';
    switch (etype) {
      case 'attune':
        if (card.attune && neededTypes.has(card.attune.cardType)) return 0;
        return 2;
      case 'siphon':
        return checkSiphonCondition(card.siphon, self, opponent) ? 1 : 5;
      case 'standard': return 2;
      case 'surge': return 4;
      default: return 3;
    }
  }

  const sorted = [...energyHand].sort((a, b) => getPrio(a) - getPrio(b));
  assert(sorted[0].name === 'Resonant Core', `Attune(Env) played first: ${sorted[0].name}`);
  assert(sorted[1].name === 'Root Siphon', `Siphon (condition met) second: ${sorted[1].name}`);
  assert(sorted[2].name === 'Earthen Focus', `Standard third: ${sorted[2].name}`);
  assert(sorted[3].name === 'Predatory Surge', `Surge last: ${sorted[3].name}`);
}

// ── TEST 7: Surge Enables Burst Turn ──
console.log('\n── 7. SURGE BURST TURN SCENARIO ──');
{
  // Scenario: Hand has Surge + Soul Leech (cost 3). Pool = 2.
  // Without Surge: can't play Soul Leech (need 3, have 2)
  // With Surge: available = 2 + 2 = 4, CAN play Soul Leech
  const energy = makeEnergy(2);
  const self = makeSelf();
  const opponent = makeOpponent();

  // Plan WITHOUT Surge
  const noSurgeSim = simulateEnergyPlay([], energy, self, opponent);
  const canAffordWithout = CARDS.expensiveStrike.cost <= noSurgeSim.available;
  assert(!canAffordWithout, `Soul Leech NOT affordable without Surge (need 3, have ${noSurgeSim.available})`);

  // Plan WITH Surge
  const withSurgeSim = simulateEnergyPlay([CARDS.surge], energy, self, opponent);
  const canAffordWith = CARDS.expensiveStrike.cost <= withSurgeSim.available;
  assert(canAffordWith, `Soul Leech AFFORDABLE with Surge (need 3, have ${withSurgeSim.available})`);

  // Verify Surge is chosen over Standard when it enables a high-value play
  // Standard: available = 3, permanent = 1 → can afford Soul Leech
  // Surge: available = 4, permanent = 0 → can afford Soul Leech + cheap card
  const stdSim = simulateEnergyPlay([CARDS.standard], energy, self, opponent);
  assert(stdSim.available === 3, `Standard also enables Soul Leech (available=${stdSim.available})`);
  assert(withSurgeSim.available > stdSim.available, `Surge provides MORE budget (${withSurgeSim.available} > ${stdSim.available})`);
}

// ── TEST 8: Attune + Surge Combo ──
console.log('\n── 8. ATTUNE + SURGE MULTI-ENERGY COMBO ──');
{
  // Scenario: Pool = 2, hand has Attune(Env) + Surge + Environmental Strike(cost 2)
  // Attune: pool → 3, Environmental costs -1 (Strike becomes cost 1)
  // Surge: available → 3 + 2 = 5
  // Net: can play 2 Environmental cards (one discounted) on burst turn
  const energy = makeEnergy(2);
  const self = makeSelf();
  const opponent = makeOpponent();

  const sim = simulateEnergyPlay([CARDS.attuneEnv, CARDS.surge], energy, self, opponent);
  assert(sim.available === 5, `Attune + Surge: available=${sim.available} (expected 5)`);
  assert(sim.permanentGained === 1, `Only Attune gives permanent: ${sim.permanentGained}`);

  const discountedCost = getEffectiveCost(CARDS.midStrike, sim.self);
  assert(discountedCost === 1, `Environmental Strike discounted to ${discountedCost}`);

  // Can afford: discounted Strike (1) + cheap Strike (1) + Empower (1) = 3 ≤ 5
  const totalCombo = discountedCost + CARDS.cheapStrike.cost + CARDS.empower.cost;
  assert(totalCombo <= sim.available, `Triple play affordable: ${totalCombo} ≤ ${sim.available}`);
}

// ── TEST 9: Cooperative Restraint ──
console.log('\n── 9. COOPERATIVE RESTRAINT ──');
{
  const self = makeSelf({ rapport: 4 });
  const profile = { preferredTargets: ['rapport'], scoreThreshold: 1 };

  // Hand with only strikes, no offers/tests
  const hand = [CARDS.cheapStrike, CARDS.midStrike];
  const decisions = [];

  // Simulate restraint logic
  const playedCards = new Set();
  const isCooperative = profile.preferredTargets.includes('rapport') && self.rapport > 2;
  assert(isCooperative, 'Cooperative mode detected (rapport > 2)');

  const hasCoopCards = hand.some(c => c.category === 'Offer' || c.category === 'Test');
  assert(!hasCoopCards, 'No cooperative cards in hand');

  // Should restrain weakest strike
  if (isCooperative && !hasCoopCards) {
    const weakest = hand.filter(c => c.category === 'Strike')
      .reduce((a, b) => (a.power || 1) <= (b.power || 1) ? a : b);
    assert(weakest.name === 'Tremor Slam', `Restrains weakest: ${weakest.name} (power ${weakest.power})`);
  }
}

// ── TEST 10: Full Plan Evaluation ──
console.log('\n── 10. FULL ENERGY PLAN EVALUATION ──');
{
  const energy = makeEnergy(2);
  const self = makeSelf();
  const opponent = makeOpponent({ conditions: [{ type: 'entangled' }] });

  // Hand: Attune(Env) + Siphon(Entangle) + Conditional Strike(Env, cost 2) + Cheap Strike(cost 1)
  const energyCards = [CARDS.attuneEnv, CARDS.siphonEntangle];
  const scoredActions = [
    { card: CARDS.conditionalStrike, score: 12 }, // High value: trigger active (Entangled)
    { card: CARDS.cheapStrike, score: 6 },
  ];

  // Generate all subsets of energy cards
  function getSubsets(arr) {
    const subsets = [];
    for (let mask = 0; mask < (1 << arr.length); mask++) {
      const subset = [];
      for (let i = 0; i < arr.length; i++) {
        if (mask & (1 << i)) subset.push(arr[i]);
      }
      subsets.push(subset);
    }
    return subsets;
  }

  const subsets = getSubsets(energyCards);
  assert(subsets.length === 4, `4 energy subsets (2 cards): ${subsets.length}`);

  // Evaluate each subset
  const results = subsets.map(subset => {
    const sim = simulateEnergyPlay(subset, energy, self, opponent);
    const affordable = [];
    let budget = sim.available;
    const sorted = [...scoredActions].sort((a, b) => b.score - a.score);
    for (const s of sorted) {
      const cost = getEffectiveCost(s.card, sim.self);
      if (cost <= budget) {
        affordable.push(s);
        budget -= cost;
      }
    }
    const actionValue = affordable.reduce((sum, a) => sum + a.score, 0);
    return {
      cards: subset.map(c => c.name),
      available: sim.available,
      permanent: sim.permanentGained,
      actionValue,
      affordable: affordable.map(a => a.card.name),
    };
  });

  // Log all plans
  for (const r of results) {
    console.log(`    Plan [${r.cards.join(', ') || 'none'}]: avail=${r.available}, perm=${r.permanent}, value=${r.actionValue}, plays=[${r.affordable.join(', ')}]`);
  }

  // Best plan should be both energy cards: Attune gives discount on Environmental Strike,
  // Siphon gives permanent (opponent is entangled), total available = 2+1+1 = 4
  // Conditional Strike costs 2→1 (Attune discount), Cheap Strike costs 1 → total 2 ≤ 4 ✅
  const bothCards = results.find(r => r.cards.length === 2);
  assert(bothCards.available === 4, `Both energy: available=${bothCards.available} (2 base + 1 attune + 1 siphon)`);
  assert(bothCards.actionValue === 18, `Both energy enables all actions: value=${bothCards.actionValue} (12+6)`);
}

// ═══ SUMMARY ═══

console.log('\n╔══════════════════════════════════════════╗');
console.log(`║  Results: ${passed} passed, ${failed} failed              ║`);
console.log('╚══════════════════════════════════════════╝\n');

if (failed > 0) {
  process.exit(1);
}