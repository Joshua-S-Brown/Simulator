/**
 * DUNGEON DECK: Veil Breach
 * Identity: Reality fractures, existential dread, high risk/reward
 * Combo lines: Fear Resonance → Nightmare Surge (Overwhelm spill)
 *              Veil Rend (self-cost big damage)
 *              Spatial Distortion strips keywords for clean hits
 */
module.exports = [
  // ── ENERGY (3) ──
  { name: 'Veil Fracture', category: 'Energy', type: 'Mystical', cost: 0,
    description: 'Cracks in reality bleed usable power.' },
  { name: 'Warped Root', category: 'Energy', type: 'Mystical', cost: 0,
    description: 'A root twisted through dimensional folds.' },
  { name: 'Fear Essence', category: 'Energy', type: 'Social', cost: 0,
    description: 'Distilled terror becomes raw energy.' },

  // ── STRIKES (4) — Each mechanically distinct ──
  { name: 'Nightmare Surge', category: 'Strike', type: 'Social', cost: 2,
    power: 3, target: 'nerve', keywords: ['Overwhelm'], overwhelmTarget: 'resolve',
    description: 'Pure terror crashes through defenses. Deal 3 nerve. Overwhelm: excess spills to resolve.' },
  { name: 'Creeping Dread', category: 'Strike', type: 'Social', cost: 1,
    power: 2, target: 'resolve', keywords: ['Erode'],
    description: 'Slow-building existential horror. Deal 2 resolve. Erode 1.' },
  { name: 'Veil Lash', category: 'Strike', type: 'Mystical', cost: 1,
    power: 2, target: 'vitality', keywords: ['Resonate'],
    description: 'Reality itself cuts. Deal 2 vitality. Resonate: +1P if same type last round.' },
  { name: 'Veil Rend', category: 'Strike', type: 'Mystical', cost: 2,
    power: 4, target: 'nerve', exhaust: true,
    selfCost: { resource: 'veil', amount: 2 },
    description: 'Tear the boundary open. Deal 4 nerve. Self-cost: lose 2 veil. Exhaust (one use).' },

  // ── EMPOWER (1) — Power boost + Overwhelm grant ──
  { name: 'Fear Resonance', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { powerBonus: 2, addKeyword: 'Overwhelm' },
    description: 'Channel ambient dread. Next Strike gains +2 Power and Overwhelm.' },

  // ── DISRUPT (1) — Strip keywords ──
  { name: 'Spatial Distortion', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { disadvantage: false, stripKeywords: true },
    description: 'Twist the space between. Opponent\'s next Strike loses all keywords.' },

  // ── COUNTERS (2) — Standard vs Broad reset ──
  { name: 'Veil Ward', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'nerve', amount: 1 },
    description: 'A shimmer of unreality absorbs the effect. Remove condition. Chip 1 nerve.' },
  { name: 'Reality Anchor', category: 'Counter', type: 'Mystical', cost: 2,
    counterDamage: { resource: 'resolve', amount: 1 },
    counterEffect: { removeAll: true },
    description: 'Restore baseline reality. Remove ALL conditions from both sides. Chip 1 resolve. Cost 2.' },

  // ── REACTS (2) — Strong block vs Conditional ──
  { name: 'Reality Bend', category: 'React', type: 'Mystical', cost: 0, power: 2,
    description: 'Bend the attack through folded space. Contest with Power 2.' },
  { name: 'Shadow Absorption', category: 'React', type: 'Mystical', cost: 0, power: 1,
    reactEffect: { conditionalPower: { condition: 'self_resource_below_half', resource: 'veil', power: 3 } },
    description: 'Shadows thicken to shield. Power 1. If veil below half, Power 3 instead.' },

  // ── TRAP (1) ──
  { name: 'Reality Snag', category: 'Trap', type: 'Mystical', cost: 1,
    trapTrigger: 'strike_played',
    trapEffect: [{ resource: 'nerve', amount: -2, target: 'triggerer' }],
    description: 'A fold in reality punishes aggression. Triggers on Strike. Deal 2 nerve.' },

  // ── OFFER (1) ──
  { name: 'Glimpse Beyond', category: 'Offer', type: 'Mystical', cost: 2,
    target: 'trust',
    offerPayload: [
      { resource: 'resolve', amount: 2, target: 'opponent' },
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ],
    description: 'A controlled vision of what lies beyond the veil. Accept: heal 2 resolve, build trust.' },

  // ── RESHAPE (1) ──
  { name: 'Reality Fold', category: 'Reshape', type: 'Mystical', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'veil', amount: 2 }],
      fortify: { resource: 'veil', reduction: 1, duration: 1 },
    },
    description: 'Fold the breach partly closed. Heal 2 veil. Fortify veil 1 for 1 round.' },
];