module.exports = [
  // ═══ ROOT HOLLOW — Physical dungeon room ═══
  // Identity: Ancient, patient predator. Absorbs hits, constricts, reshapes terrain.
  // Template: 3E / 3S / 1Em / 1Di / 2Co / 2Re / 1Tr / 1Of / 1Rsh = 15

  // ENERGY (3)
  { name: 'Earthen Focus',   category: 'Energy', type: 'Physical',      cost: 0, energyGain: 1 },
  { name: 'Hunger Pulse',    category: 'Energy', type: 'Physical',      cost: 0, energyGain: 1 },
  { name: 'Resonant Core',   category: 'Energy', type: 'Mystical',      cost: 0, energyGain: 1 },

  // STRIKES (3) — multi-resource: vitality, nerve, resolve
  { name: 'Root Crush', category: 'Strike', type: 'Physical', cost: 2, power: 3,
    target: 'vitality', keywords: [] },
  { name: 'Tremor Slam', category: 'Strike', type: 'Environmental', cost: 2, power: 2,
    target: 'nerve', keywords: [],
    trigger: { description: 'If Nerve < 50%: +2 Power', condition: { type: 'resource_below', resource: 'nerve' }, bonus: 2 } },
  { name: 'Crushing Grip', category: 'Strike', type: 'Physical', cost: 1, power: 2,
    target: 'resolve', keywords: ['Erode'] },

  // EMPOWER (1)
  { name: 'Predatory Stance', category: 'Empower', type: 'Environmental', cost: 1,
    empowerEffect: { advantage: true, powerBonus: 0 }, target: null, power: 0, keywords: [] },

  // DISRUPT (1)
  { name: 'Tangling Undergrowth', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { disadvantage: true }, target: null, power: 0, keywords: [] },

  // COUNTER (2) — strip visitor buffs + chip damage
  { name: 'Bark Shield', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: { resource: 'vitality', amount: 1 }, target: null, power: 0, keywords: [] },
  { name: 'Root Snag', category: 'Counter', type: 'Environmental', cost: 1,
    counterDamage: { resource: 'nerve', amount: 1 }, target: null, power: 0, keywords: ['Entangle'] },

  // REACT (2) — dungeon absorbs incoming damage
  { name: 'Bark Armor', category: 'React', type: 'Physical', cost: 0, power: 2,
    target: null, keywords: [] },
  { name: 'Ground Shift', category: 'React', type: 'Environmental', cost: 0, power: 1,
    target: null, keywords: [] },

  // TRAP (1)
  { name: 'Quaking Ground', category: 'Trap', type: 'Physical', cost: 1,
    trapTrigger: 'empower_played',
    trapEffect: [{ resource: 'nerve', amount: -2, target: 'triggerer' }],
    target: null, power: 0, keywords: [] },

  // OFFER (1)
  { name: 'Bitter Fruit', category: 'Offer', type: 'Environmental', cost: 1,
    offerPayload: [
      { resource: 'vitality', amount: 2, target: 'opponent' },
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ], target: 'trust', power: 0, keywords: [] },

  // RESHAPE (1) — heal structure + fortify
  { name: 'Deepening Roots', category: 'Reshape', type: 'Physical', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'structure', amount: 2 }],
      fortify: { resource: 'structure', reduction: 1, duration: 1 },
    },
    target: null, power: 0, keywords: [] },
];