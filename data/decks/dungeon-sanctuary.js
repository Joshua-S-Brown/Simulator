/**
 * DUNGEON DECK: Living Root Sanctuary (v2.2)
 * Identity: Nurturing, protective, trust-building
 * Combo lines: Test → Offer pipeline (build trust through vulnerability)
 *              Protective Thorns (defensive Strike that punishes aggression)
 *              Calming Presence → trust-scaled healing
 * 
 * v2.2 ENERGY CHANGES:
 *   4→5 Energy cards (2 Standard, 2 Attune[Social+Environmental], 1 Siphon)
 *   No Surge (sanctuary doesn't burst — it nurtures steadily)
 *   No cost bumps (nurturing deck keeps low costs for consistent offering)
 *   15→16 cards total
 */
module.exports = [
  // ── ENERGY (5) ──
  { name: 'Root Cradle', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'The sanctuary\'s embrace generates gentle warmth.' },
  { name: 'Gentle Pulse', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'A steady rhythm of life-sustaining energy.' },
  { name: 'Shelter Core', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Environmental', discount: 1 },
    description: 'The heart of the sanctuary aligns with the earth. Next Environmental card costs 1 less.' },
  { name: 'Trust Seed', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Social', discount: 1 },
    description: 'A seed that grows in willing soil. Next Social card costs 1 less.' },
  { name: 'Sanctuary Siphon', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'resource_above', resource: 'trust', threshold: 3 }, target: 'opponent' },
    description: 'Draw strength from growing trust. +1 permanent if visitor trust > 3, else +1 temp.' },

  // ── STRIKES (2) — Defensive/warning, not aggressive ──
  { name: 'Protective Thorns', category: 'Strike', type: 'Environmental', cost: 1,
    power: 2, target: 'vitality',
    trigger: { condition: { type: 'resource_above', target: 'self', resource: 'rapport' }, bonus: -1,
      description: 'If rapport high, -1 Power (reluctant force)' },
    description: 'Thorns extend to ward off threats. Deal 2 vitality. If rapport > 3, deal only 1 (reluctant).' },
  { name: 'Warning Tremor', category: 'Strike', type: 'Environmental', cost: 1,
    power: 1, target: 'nerve', keywords: ['Erode'],
    description: 'A gentle shake to discourage aggression. Deal 1 nerve. Erode 1.' },

  // ── EMPOWER (1) — Trust-based scaling ──
  { name: 'Calming Presence', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { advantage: false, powerBonus: 1, addKeyword: 'Ward' },
    description: 'Project safety. Next action gains +1 Power and Ward (+1 structure defense, 1 round).' },

  // ── COUNTER (1) — Gentle redirection ──
  { name: 'Gentle Redirection', category: 'Counter', type: 'Social', cost: 1,
    counterDamage: { resource: 'vitality', amount: 0 },
    counterEffect: { applyFortify: 1, fortifyResource: 'structure' },
    description: 'Guide the energy elsewhere without harm. Remove condition. Fortify structure 1. No chip damage.' },

  // ── REACTS (2) — Protective ──
  { name: 'Sheltering Canopy', category: 'React', type: 'Environmental', cost: 0, power: 2,
    description: 'Branches weave overhead to intercept. Contest with Power 2.' },
  { name: 'Root Buffer', category: 'React', type: 'Environmental', cost: 0, power: 1,
    reactEffect: { alwaysFortify: 1 },
    description: 'Roots form a cushion beneath. Contest Power 1. Gain Fortify 1 regardless.' },

  // ── TEST (1) — Prisoner's dilemma ──
  { name: 'Trust Trial', category: 'Test', type: 'Social', cost: 1,
    target: 'trust',
    testReward: { trust: 2, rapport: 2 },
    defectPenalty: { trustCrash: 0.5, powerGain: 2 },
    exposureCost: { resource: 'structure', amount: 1 },
    description: 'Open yourself to vulnerability. Cooperate: +2 trust, +2 rapport, lose 1 structure. Defect: trust crashes, defector gains +2P.' },

  // ── OFFERS (3) — Each heals different things ──
  { name: 'Healing Sap', category: 'Offer', type: 'Environmental', cost: 1,
    target: 'trust',
    offerPayload: [
      { resource: 'vitality', amount: 2, target: 'opponent' },
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ],
    description: 'Amber sap with restorative properties. Accept: heal 2 vitality, build trust.' },
  { name: 'Sheltering Roots', category: 'Offer', type: 'Environmental', cost: 1,
    target: 'trust',
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ],
    description: 'An invitation to rest within protective coils. Accept: build mutual trust.' },
  { name: 'Luminous Gift', category: 'Offer', type: 'Social', cost: 2,
    target: 'trust',
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
      { resource: 'nerve', amount: 1, target: 'opponent' },
    ],
    description: 'A glowing offering that soothes fear. Accept: build trust, heal 1 nerve. Cost 2.' },

  // ── RESHAPE (1) — Dual heal ──
  { name: 'Open the Way', category: 'Reshape', type: 'Environmental', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'structure', amount: 2 }, { resource: 'presence', amount: 2 }],
    },
    description: 'Reshape the sanctuary to welcome. Heal 2 structure and 2 presence.' },
];