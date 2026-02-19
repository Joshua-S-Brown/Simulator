/**
 * DUNGEON DECK: Honeyed Hollow (v2.3)
 * Identity: Deceptive — Trap→Offer engine, hidden damage behind trust-building
 * 
 * Combo lines: 
 *   Trap→Offer (set trap, play offer, trap springs on acceptance = hidden damage + visible trust)
 *   Trust escalation (each accepted Offer raises acceptance probability for the next)
 *   Cross-room setup (visitor leaves with high trust + accumulated hidden damage → Room 2 closes)
 * 
 * Design philosophy: This deck is a specialist at SEEMING SAFE. It builds trust genuinely
 * through Offers and Tests while dealing hidden damage through Traps. The visitor's visible
 * experience is positive (heals, trust gains). The hidden experience is resource erosion.
 * 
 * The deck does NOT need to finish the visitor. It sets up Room 2. If run with the
 * `deceptive` AI profile, the betrayalThreshold triggers within-room aggression. If run
 * with the `nurturing` profile, it cooperates fully and lets Room 2 handle the kill.
 * 
 * ENERGY DESIGN:
 *   5 Energy cards (2 Standard, 2 Attune[Social], 1 Siphon[trust-conditional])
 *   Social Attune discounts Offers and Tests — the core action economy
 *   Siphon rewards trust-building (permanent growth when trust > 3)
 *   16 cards total
 * 
 * TRAP DAMAGE SPREAD:
 *   Venomous Nectar → vitality -2 (poison)
 *   Binding Threads → nerve -1 + Entangle (fear/restriction)
 *   Dulling Mist → resolve -2 (mental erosion)
 *   Total hidden damage per cycle: ~5 across three resources
 *   Total visible healing per cycle: ~3-4 (Offers)
 *   Net: visitor loses ~1-2 points they barely notice, trust climbs 3-6
 */
module.exports = [
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

  // ═══ OFFERS (3) — Bait for the traps ═══
  { name: 'Amber Draught', category: 'Offer', type: 'Environmental', cost: 1,
    target: 'trust',
    offerPayload: [
      { heal: { resource: 'vitality', amount: 1 } },
    ],
    offerTrustGain: 1,
    offerRapportGain: 1,
    description: 'A warm drink from the hollow\'s heart. Accept: heal 1 vitality, +1 trust, +1 rapport.' },
  { name: 'Soothing Light', category: 'Offer', type: 'Social', cost: 1,
    target: 'trust',
    offerPayload: [
      { heal: { resource: 'nerve', amount: 1 } },
    ],
    offerTrustGain: 1,
    offerRapportGain: 1,
    description: 'Soft luminescence that calms fear. Accept: heal 1 nerve, +1 trust, +1 rapport.' },
  { name: 'Gilded Fruit', category: 'Offer', type: 'Environmental', cost: 2,
    target: 'trust',
    offerPayload: [
      { heal: { resource: 'vitality', amount: 2 } },
    ],
    offerTrustGain: 2,
    offerRapportGain: 1,
    description: 'An irresistible offering — too generous to refuse. Accept: heal 2 vitality, +2 trust, +1 rapport.' },

  // ═══ TEST (1) — Genuine vulnerability to build cooperation probability ═══
  { name: 'Offering of Self', category: 'Test', type: 'Social', cost: 1,
    target: 'trust',
    testReward: { trust: 2, rapport: 2 },
    defectPenalty: { trustCrash: 0.5, powerGain: 2 },
    exposureCost: { resource: 'presence', amount: 1 },
    description: 'Reveal something true about yourself. Cooperate: +2 trust, +2 rapport, lose 1 presence. Defect: trust crashes.' },

  // ═══ STRIKE (1) — For deceptive profile within-room betrayal ═══
  { name: 'Hidden Thorn', category: 'Strike', type: 'Environmental', cost: 1,
    power: 2, target: 'vitality',
    trigger: {
      description: 'If trust > 3: +2 Power (the deeper the trust, the sharper the thorn)',
      condition: { type: 'resource_above', target: 'opponent', resource: 'trust', threshold: 3 },
      bonus: 2,
    },
    description: 'A thorn hidden beneath soft petals. Deal 2 vitality. If trust > 3, deal 4 instead.' },

  // ═══ DISRUPT (1) — Softens visitor for later ═══
  { name: 'Lulling Scent', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { disadvantage: true },
    description: 'A drowsy fragrance dulls the senses. Opponent\'s next Strike rolls at Disadvantage.' },

  // ═══ COUNTER (1) — Gentle, maintains the facade ═══
  { name: 'Gentle Deflection', category: 'Counter', type: 'Social', cost: 1,
    counterDamage: { resource: 'vitality', amount: 0 },
    counterEffect: { applyFortify: 1, fortifyResource: 'presence' },
    description: 'Redirect hostility with warmth. Remove condition. Fortify presence 1. No chip damage.' },

  // ═══ REACT (1) — Basic defense ═══
  { name: 'Cushioning Moss', category: 'React', type: 'Environmental', cost: 0,
    power: 2,
    description: 'Soft moss absorbs the blow. Contest with Power 2.' },

  // ═══ RESHAPE (1) — Self-preservation ═══
  { name: 'Mend the Mask', category: 'Reshape', type: 'Social', cost: 1,
    reshapeEffect: { heal: { resource: 'presence', amount: 2 } },
    description: 'Restore the welcoming facade. Heal 2 presence.' },
];