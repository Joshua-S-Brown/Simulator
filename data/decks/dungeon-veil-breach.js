module.exports = [
  // ═══ VEIL BREACH — Mystical dungeon room ═══
  // Identity: Reality-warping, fear-inducing. Bends space to absorb and redirect.
  // Template: 3E / 3S / 1Em / 1Di / 2Co / 2Re / 1Tr / 1Of / 1Rsh = 15

  // ENERGY (3)
  { name: 'Veil Fracture',  category: 'Energy', type: 'Mystical',      cost: 0, energyGain: 1 },
  { name: 'Warped Root',    category: 'Energy', type: 'Environmental', cost: 0, energyGain: 1 },
  { name: 'Fear Essence',   category: 'Energy', type: 'Social',        cost: 0, energyGain: 1 },

  // STRIKES (3) — multi-resource: nerve, resolve, vitality
  { name: 'Nightmare Surge', category: 'Strike', type: 'Mystical', cost: 2, power: 3,
    target: 'nerve', keywords: [] },
  { name: 'Creeping Dread', category: 'Strike', type: 'Social', cost: 1, power: 2,
    target: 'resolve', keywords: ['Erode'],
    trigger: { description: 'If Nerve < 50%: +2 Power', condition: { type: 'resource_below', resource: 'nerve' }, bonus: 2 } },
  { name: 'Veil Lash', category: 'Strike', type: 'Mystical', cost: 1, power: 2,
    target: 'vitality', keywords: [] },

  // EMPOWER (1)
  { name: 'Fear Resonance', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { advantage: false, powerBonus: 2 }, target: null, power: 0, keywords: [] },

  // DISRUPT (1)
  { name: 'Spatial Distortion', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { disadvantage: true }, target: null, power: 0, keywords: [] },

  // COUNTER (2) — reality warps to absorb and punish
  { name: 'Veil Ward', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'nerve', amount: 1 }, target: null, power: 0, keywords: [] },
  { name: 'Reality Anchor', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'resolve', amount: 1 }, target: null, power: 0, keywords: [] },

  // REACT (2) — space bends around the dungeon
  { name: 'Reality Bend', category: 'React', type: 'Mystical', cost: 0, power: 2,
    target: null, keywords: [] },
  { name: 'Shadow Absorption', category: 'React', type: 'Social', cost: 0, power: 1,
    target: null, keywords: [] },

  // TRAP (1) — strike-punishing
  { name: 'Reality Snag', category: 'Trap', type: 'Mystical', cost: 1,
    trapTrigger: 'strike_played',
    trapEffect: [{ resource: 'nerve', amount: -2, target: 'triggerer' }],
    target: null, power: 0, keywords: [] },

  // OFFER (1)
  { name: 'Glimpse Beyond', category: 'Offer', type: 'Mystical', cost: 2,
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'nerve', amount: -3, target: 'opponent' },
    ], target: 'trust', power: 0, keywords: [] },

  // RESHAPE (1) — mend the veil, fortify against mystical attacks
  { name: 'Reality Fold', category: 'Reshape', type: 'Mystical', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'veil', amount: 2 }],
      fortify: { resource: 'veil', reduction: 1, duration: 1 },
    },
    target: null, power: 0, keywords: [] },
];