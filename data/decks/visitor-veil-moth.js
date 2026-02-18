/**
 * VISITOR DECK: Veil Moth
 * Identity: Ethereal, veil-siphoning, evasive, information-gathering
 * Combo lines: Ethereal Focus → Veil Siphon (Drain veil into vitality sustain)
 *              Luminous Burst (Overwhelm spill from veil → presence)
 *              Confusing Dust strips keywords for clean siphon
 */
module.exports = [
  // ── ENERGY (4) ──
  { name: 'Flickering Wing', category: 'Energy', type: 'Mystical', cost: 0,
    description: 'Wings beat between planes, shedding sparks of power.' },
  { name: 'Dust Shimmer', category: 'Energy', type: 'Mystical', cost: 0,
    description: 'Iridescent scales catch dimensional light.' },
  { name: 'Faint Pulse', category: 'Energy', type: 'Mystical', cost: 0,
    description: 'A heartbeat synchronized to the veil\'s rhythm.' },
  { name: 'Sensory Bloom', category: 'Energy', type: 'Social', cost: 0,
    description: 'Antennae unfurl to drink ambient magic.' },

  // ── STRIKES (4) — Each mechanically distinct ──
  { name: 'Veil Siphon', category: 'Strike', type: 'Mystical', cost: 2,
    power: 2, target: 'veil', keywords: ['Drain'], drainTarget: 'vitality',
    description: 'Drink the boundary between worlds. Deal 2 veil. Drain to vitality (max 2).' },
  { name: 'Luminous Burst', category: 'Strike', type: 'Mystical', cost: 2,
    power: 3, target: 'veil', keywords: ['Overwhelm'], overwhelmTarget: 'presence',
    description: 'Blinding flash tears the veil apart. Deal 3 veil. Overwhelm: excess spills to presence.' },
  { name: 'Dissonant Flutter', category: 'Strike', type: 'Social', cost: 1,
    power: 2, target: 'presence', keywords: ['Erode'],
    description: 'Wings beat at frequencies that unravel identity. Deal 2 presence. Erode 1.' },
  { name: 'Probing Antennae', category: 'Strike', type: 'Mystical', cost: 1,
    power: 1, target: 'structure', keywords: ['Resonate'],
    description: 'Feelers test physical integrity. Deal 1 structure. Resonate: +1P if same type last round.' },

  // ── EMPOWER (1) — Drain grant ──
  { name: 'Ethereal Focus', category: 'Empower', type: 'Mystical', cost: 1,
    empowerEffect: { advantage: true, addKeyword: 'Drain' },
    description: 'Phase partially through the veil. Advantage and Drain on next Strike.' },

  // ── DISRUPTS (2) — Strip keywords vs Standard ──
  { name: 'Confusing Dust', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { disadvantage: false, stripKeywords: true },
    description: 'Hallucinogenic scales cloud the senses. Opponent\'s next Strike loses all keywords.' },
  { name: 'Dazzling Scales', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { disadvantage: true },
    description: 'Blinding iridescence disrupts focus. Opponent\'s next Strike has Disadvantage.' },

  // ── COUNTER (1) — Chip veil ──
  { name: 'Phase Shift', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'veil', amount: 1 },
    counterEffect: { applyFortify: 1, fortifyResource: 'vitality' },
    description: 'Shift between planes to sidestep. Remove condition. Chip 1 veil. Fortify vitality 1.' },

  // ── REACTS (3) — Block vs Absorb vs Evasion ──
  { name: 'Dust Veil', category: 'React', type: 'Mystical', cost: 0, power: 2,
    description: 'Cloud of shimmering dust absorbs the impact. Contest with Power 2.' },
  { name: 'Evasive Flutter', category: 'React', type: 'Physical', cost: 0, power: 1,
    reactEffect: { alwaysFortify: 1 },
    description: 'Quick wingbeat sidestep. Contest Power 1. Gain Fortify 1 regardless.' },
  { name: 'Spectral Dodge', category: 'React', type: 'Mystical', cost: 0, power: 1,
    reactEffect: { conditionalPower: { condition: 'self_resource_below_half', resource: 'vitality', power: 3 } },
    description: 'Phase out when desperate. Power 1. If vitality below half, Power 3.' },
];