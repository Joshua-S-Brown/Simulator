module.exports = [
  // ENERGY (4)
  { name: 'Flickering Wing',  category: 'Energy', type: 'Mystical',      cost: 0, energyGain: 1 },
  { name: 'Dust Shimmer',     category: 'Energy', type: 'Environmental', cost: 0, energyGain: 1 },
  { name: 'Faint Pulse',      category: 'Energy', type: 'Social',        cost: 0, energyGain: 1 },
  { name: 'Sensory Bloom',    category: 'Energy', type: 'Mystical',      cost: 0, energyGain: 1 },
  // STRIKES (4) — multi-resource: 2 veil, 1 presence, 1 structure
  { name: 'Veil Siphon', category: 'Strike', type: 'Mystical', cost: 2, power: 2,
    target: 'veil', keywords: [] },
  { name: 'Luminous Burst', category: 'Strike', type: 'Mystical', cost: 2, power: 3,
    target: 'veil', keywords: [],
    trigger: { description: 'If Veil < 50%: +2 Power', condition: { type: 'resource_below', resource: 'veil' }, bonus: 2 } },
  { name: 'Dissonant Flutter', category: 'Strike', type: 'Social', cost: 1, power: 2,
    target: 'presence', keywords: [] },
  { name: 'Probing Antennae', category: 'Strike', type: 'Mystical', cost: 1, power: 2,
    target: 'structure', keywords: ['Erode'] },
  // EMPOWER (1)
  { name: 'Ethereal Focus', category: 'Empower', type: 'Mystical', cost: 1,
    empowerEffect: { advantage: true, powerBonus: 0 }, target: null, power: 0, keywords: [] },
  // DISRUPT (2 — moth disrupts through confusion)
  { name: 'Confusing Dust', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { disadvantage: true }, target: null, power: 0, keywords: [] },
  { name: 'Dazzling Scales', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { disadvantage: true }, target: null, power: 0, keywords: [] },
  // COUNTER (1)
  { name: 'Phase Shift', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'veil', amount: 1 }, target: null, power: 0, keywords: [] },
  // REACT (3 — moth's identity is evasion)
  { name: 'Dust Veil', category: 'React', type: 'Environmental', cost: 0, power: 2,
    target: null, keywords: [] },
  { name: 'Evasive Flutter', category: 'React', type: 'Physical', cost: 1, power: 1,
    target: null, keywords: [] },
  { name: 'Spectral Dodge', category: 'React', type: 'Mystical', cost: 0, power: 1,
    target: null, keywords: [] },
];