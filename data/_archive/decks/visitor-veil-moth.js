/**
 * VISITOR DECK: Veil Moth (v2.2)
 * Identity: Ethereal, veil-siphoning, evasive, information-gathering
 * Combo lines: Ethereal Focus → Veil Siphon (Drain veil into vitality sustain)
 *              Luminous Burst (Overwhelm spill from veil → presence)
 *              Confusing Dust strips keywords for clean siphon
 * 
 * v2.2 ENERGY CHANGES:
 *   4→5 Energy cards (2 Standard, 1 Surge, 1 Attune[Mystical], 1 Siphon)
 *   Veil Siphon cost 2→3 (Drain sustain is premium — heals while dealing damage)
 *   15→16 cards total
 */
export default [
  // ── ENERGY (5) ──
  { name: 'Flickering Wing', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'Wings beat between planes, shedding sparks of power.' },
  { name: 'Dust Shimmer', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'Iridescent scales catch dimensional light.' },
  { name: 'Faint Pulse', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'surge', surgeGain: 2,
    description: 'A sudden heartbeat surge synchronized to dimensional rifts.' },
  { name: 'Sensory Bloom', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Mystical', discount: 1 },
    description: 'Antennae attune to the veil\'s frequency. Next Mystical card costs 1 less.' },
  { name: 'Veil Tap', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'has_condition', condition: 'erode' }, target: 'opponent' },
    description: 'Sip energy from decaying boundaries. +1 permanent if opponent has Erode, else +1 temp.' },

  // ── STRIKES (4) — Each mechanically distinct ──
  { name: 'Veil Siphon', category: 'Strike', type: 'Mystical', cost: 3,
    power: 2, target: 'veil', keywords: ['Drain'], drainTarget: 'vitality',
    description: 'Drink the boundary between worlds. Deal 2 veil. Drain to vitality (max 2). Cost 3: premium sustain.' },
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