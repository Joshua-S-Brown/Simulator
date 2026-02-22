/**
 * DUNGEON DECK: Honeyed Hollow (v3.0 — Bond System Integration)
 * 
 * Identity: Deceptive — Trap→Offer engine, hidden damage behind trust
 * Tags: Social, Environmental, Deceptive
 * 
 * ═══════════════════════════════════════════════════════════════
 * v3.0 BOND INTEGRATION — NO COVENANT (EXPLICIT)
 * ═══════════════════════════════════════════════════════════════
 * 
 * The betrayal room. A Covenant would be antithetical. This room
 * BUILDS trust to EXPLOIT it — through Trap→Offer combos or the
 * Deceptive AI's betrayal conversion at trust >= 6.
 * 
 * All 3 Offers updated to transactional format with costs that
 * SEEM mild but compound through the Trap→Offer engine:
 *   Amber Draught: Binding (resolve -1, 1 round)
 *   Soothing Light: Exposure (next Social Strike +2)
 *   Gilded Fruit: Binding (nerve -1/round, 2 rounds)
 * 
 * TRAP→OFFER ENGINE:
 *   1. Play Trap (Venomous Nectar / Binding Threads / Dulling Mist)
 *   2. Play Offer (Amber Draught / Soothing Light / Gilded Fruit)
 *   3. Visitor accepts → benefit + cost + trap damage
 *   4. Visible: "Healed! Trust +1!" Actual: net resource loss
 * 
 * WIN CONDITIONS:
 *   Kill — Via betrayal conversion at trust >= 6.
 *   Break — Dulling Mist + Binding resolve costs.
 *   Panic — Binding Threads + Gilded Fruit nerve costs.
 *   Bond — EXPLICITLY NOT A WIN CONDITION. No Covenant.
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.3: Initial deck creation. Trap→Offer engine design.
 * v3.0: All 3 Offers → transactional format with hidden costs.
 *       Explicitly NO Covenant — betrayal specialist room.
 */
export default [
  // ═══ ENERGY (5) ═══
  { name: 'Amber Glow', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'Warm light pools in the hollow, inviting and constant.' },
  { name: 'Sweet Resin', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'Fragrant sap flows steadily from the walls.' },
  { name: 'Welcoming Warmth', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Social', discount: 1 },
    description: 'The hollow radiates hospitality. Next Social card costs 1 less.' },
  { name: 'Honeyed Words', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Social', discount: 1 },
    description: 'Every sound here drips with sweetness. Next Social card costs 1 less.' },
  { name: 'Trust Harvest', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'resource_above', resource: 'trust', threshold: 3 }, target: 'opponent' },
    description: 'Draw sustenance from growing confidence. +1 permanent if trust > 3, else +1 temp.' },

  // ═══ TRAPS (3) — Core identity: hidden damage on Offer acceptance ═══
  { name: 'Venomous Nectar', category: 'Trap', type: 'Environmental', cost: 1,
    trapTrigger: 'offer_accepted',
    trapEffect: [
      { damage: { resource: 'vitality', amount: 2 } },
    ],
    description: 'Poison laced into the next offering. Triggers on Offer accepted: visitor vitality -2.' },
  { name: 'Binding Threads', category: 'Trap', type: 'Environmental', cost: 1,
    trapTrigger: 'offer_accepted',
    trapEffect: [
      { damage: { resource: 'nerve', amount: 1 } },
      { applyEntangle: true },
    ],
    description: 'Silken strands woven into the gift. Triggers on Offer accepted: nerve -1, Entangle.' },
  { name: 'Dulling Mist', category: 'Trap', type: 'Social', cost: 1,
    trapTrigger: 'offer_accepted',
    trapEffect: [
      { damage: { resource: 'resolve', amount: 2 } },
    ],
    description: 'A calming haze that clouds judgment. Triggers on Offer accepted: resolve -2.' },

  // ═══ OFFERS (3) — v3.0 Transactional — Bait for the traps ═══
  { name: 'Amber Draught', category: 'Offer', type: 'Environmental', cost: 1,
    offer: {
      benefit: { resource: 'vitality', amount: 2 },
      cost: { type: 'binding', resource: 'resolve', amount: 1, duration: 1 },
      investment: { trust: 1 },
    },
    description: 'Warm honeyed liquid from the hollow\'s heart. Restorative — though the sweetness lingers too long. Heal 2 vitality. Binding: resolve -1 for 1 round.' },

  { name: 'Soothing Light', category: 'Offer', type: 'Social', cost: 1,
    offer: {
      benefit: { resource: 'nerve', amount: 2 },
      cost: { type: 'exposure', strikeType: 'Social', amount: 2, duration: 1 },
      investment: { trust: 1 },
    },
    description: 'Soft luminescence that calms fear. But lowered guard invites deeper influence. Heal 2 nerve. Exposure: next Social Strike deals +2.' },

  { name: 'Gilded Fruit', category: 'Offer', type: 'Environmental', cost: 2,
    offer: {
      benefit: { resource: 'vitality', amount: 3 },
      cost: { type: 'binding', resource: 'nerve', amount: 1, duration: 2 },
      investment: { trust: 2 },
    },
    description: 'An irresistible offering — golden fruit that heals deeply. The aftertaste, though, creeps into your courage. Heal 3 vitality. Binding: nerve -1/round for 2 rounds.' },

  // ═══ TEST (1) ═══
  { name: 'Offering of Self', category: 'Test', type: 'Social', cost: 1,
    target: 'trust',
    testReward: { trust: 2, rapport: 2 },
    defectPenalty: { trustCrash: 0.5, powerGain: 2 },
    exposureCost: { resource: 'presence', amount: 1 },
    description: 'Reveal something true about yourself. Cooperate: +2 trust, +2 rapport, lose 1 presence. Defect: trust crashes.' },

  // ═══ STRIKE (1) — Trust-scaled betrayal weapon ═══
  { name: 'Hidden Thorn', category: 'Strike', type: 'Environmental', cost: 1,
    power: 2, target: 'vitality',
    trigger: {
      description: 'If trust > 3: +2 Power (the deeper the trust, the sharper the thorn)',
      condition: { type: 'resource_above', target: 'opponent', resource: 'trust', threshold: 3 },
      bonus: 2,
    },
    description: 'A thorn hidden beneath soft petals. Deal 2 vitality. If trust > 3, deal 4 instead.' },

  // ═══ DISRUPT (1) ═══
  { name: 'Lulling Scent', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { disadvantage: true },
    description: 'A drowsy fragrance dulls the senses. Opponent\'s next Strike rolls at Disadvantage.' },

  // ═══ COUNTER (1) ═══
  { name: 'Gentle Deflection', category: 'Counter', type: 'Social', cost: 1,
    counterDamage: { resource: 'vitality', amount: 0 },
    counterEffect: { applyFortify: 1, fortifyResource: 'presence' },
    description: 'Redirect hostility with warmth. Remove condition. Fortify presence 1. No chip damage.' },

  // ═══ REACT (1) ═══
  { name: 'Cushioning Moss', category: 'React', type: 'Environmental', cost: 0,
    power: 2,
    description: 'Soft moss absorbs the blow. Contest with Power 2.' },

  // ═══ RESHAPE (1) ═══
  { name: 'Mend the Mask', category: 'Reshape', type: 'Social', cost: 1,
    reshapeEffect: { heal: { resource: 'presence', amount: 2 } },
    description: 'Restore the welcoming facade. Heal 2 presence.' },
];