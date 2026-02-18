/**
 * DUNGEON DECK: Root Hollow
 * Identity: Crushing earth, ensnaring roots, slow decay
 * Combo lines: Entangle → Crushing Grip (+2P conditional)
 *              Erode attrition via Tremor Slam
 *              Drain sustain via Soul Leech
 */
module.exports = [
  // ── ENERGY (3) ──
  { name: 'Earthen Focus', category: 'Energy', type: 'Environmental', cost: 0,
    description: 'Draw power from the deep stone.' },
  { name: 'Hunger Pulse', category: 'Energy', type: 'Environmental', cost: 0,
    description: 'The dungeon\'s appetite sharpens into focus.' },
  { name: 'Resonant Core', category: 'Energy', type: 'Environmental', cost: 0,
    description: 'Vibrations in the bedrock become usable force.' },

  // ── STRIKES (4) — Each mechanically distinct ──
  { name: 'Entombing Grasp', category: 'Strike', type: 'Environmental', cost: 2,
    power: 2, target: 'vitality', keywords: ['Entangle'],
    description: 'Roots erupt to pin the intruder. Deal 2 vitality damage. Entangle.' },
  { name: 'Crushing Grip', category: 'Strike', type: 'Environmental', cost: 2,
    power: 2, target: 'vitality', keywords: ['Erode'],
    trigger: { condition: { type: 'has_condition', condition: 'entangled' }, bonus: 2,
      description: 'If Entangled, +2 Power' },
    description: 'Tighten the hold on trapped prey. Deal 2 vitality. Erode 1. If Entangled, deal 4.' },
  { name: 'Tremor Slam', category: 'Strike', type: 'Environmental', cost: 1,
    power: 1, target: 'nerve', keywords: ['Erode'],
    description: 'The ground shakes with malice. Deal 1 nerve damage. Erode 1.' },
  { name: 'Soul Leech', category: 'Strike', type: 'Social', cost: 2,
    power: 2, target: 'nerve', keywords: ['Drain'], drainTarget: 'presence',
    description: 'Feed on the visitor\'s dread. Deal 2 nerve damage. Drain to presence (max 2).' },

  // ── EMPOWER (1) — Conditional double-advantage ──
  { name: 'Predatory Stance', category: 'Empower', type: 'Environmental', cost: 1,
    empowerEffect: { advantage: true, conditionalAdvantage: { hasCondition: 'entangled' } },
    description: 'Sense weakness. Advantage on next Strike. Double Advantage if opponent Entangled.' },

  // ── DISRUPT (1) — Thorns ──
  { name: 'Tangling Undergrowth', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { disadvantage: true, onStrike: { selfDamage: { resource: 'vitality', amount: 1 } } },
    description: 'Hidden roots clutch at limbs. Disadvantage. Thorns: 1 vitality damage when striking.' },

  // ── COUNTERS (2) — Shield vs Snag ──
  { name: 'Bark Shield', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: { resource: 'vitality', amount: 1 },
    counterEffect: { applyFortify: 1, fortifyResource: 'structure' },
    description: 'Harden while deflecting. Remove condition. Chip 1 vitality. Fortify structure 1.' },
  { name: 'Root Snag', category: 'Counter', type: 'Environmental', cost: 1,
    counterDamage: { resource: 'nerve', amount: 1 },
    counterEffect: { applyKeyword: 'entangled' },
    description: 'Catch them off-balance. Remove condition. Chip 1 nerve. Entangle opponent.' },

  // ── REACTS (2) — Block vs Absorb ──
  { name: 'Bark Armor', category: 'React', type: 'Physical', cost: 0, power: 2,
    description: 'Hardened bark absorbs the blow. Contest with Power 2.' },
  { name: 'Ground Shift', category: 'React', type: 'Environmental', cost: 0, power: 1,
    reactEffect: { alwaysFortify: 1 },
    description: 'Earth rearranges to cushion impact. Contest Power 1. Gain Fortify 1 regardless.' },

  // ── TRAP (1) ──
  { name: 'Quaking Ground', category: 'Trap', type: 'Physical', cost: 1,
    trapTrigger: 'empower_played',
    trapEffect: [{ resource: 'nerve', amount: -2, target: 'triggerer' }],
    description: 'Floor collapses under confident feet. Triggers on Empower. Deal 2 nerve.' },

  // ── OFFER (1) ──
  { name: 'Bitter Fruit', category: 'Offer', type: 'Environmental', cost: 1,
    target: 'trust',
    offerPayload: [
      { resource: 'vitality', amount: 2, target: 'opponent' },
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ],
    description: 'Strange fruit from a gnarled root. Accept: heal 2 vitality, build trust.' },

  // ── RESHAPE (1) ──
  { name: 'Deepening Roots', category: 'Reshape', type: 'Physical', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'structure', amount: 2 }],
      fortify: { resource: 'structure', reduction: 1, duration: 1 },
    },
    description: 'Roots burrow into bedrock. Heal 2 structure. Fortify 1 for 1 round.' },
];