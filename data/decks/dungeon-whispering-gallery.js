/**
 * DUNGEON DECK: Whispering Gallery
 * Identity: Echoes, psychological warfare, redirected reality
 * Combo lines: Erode resolve via whispers (persistent attrition)
 *              Redirect opponent Strikes via Spatial Distortion
 *              Steal Empowers via Absorbing Silence
 */
module.exports = [
  // ── ENERGY (3) ──
  { name: 'Echoing Void', category: 'Energy', type: 'Social', cost: 0,
    description: 'Empty spaces amplify intent into power.' },
  { name: 'Memory Fragment', category: 'Energy', type: 'Social', cost: 0,
    description: 'A half-remembered scream crystallizes into energy.' },
  { name: 'Whisper Shard', category: 'Energy', type: 'Social', cost: 0,
    description: 'Fractured voices coalesce into focused will.' },

  // ── STRIKES (3) — Each mechanically distinct ──
  { name: 'Crushing Silence', category: 'Strike', type: 'Social', cost: 2,
    power: 3, target: 'resolve',
    trigger: { condition: { type: 'no_condition', target: 'opponent', condition: 'empower' }, bonus: 1,
      description: 'If opponent has no Empower, +1 Power' },
    description: 'Absolute quiet crushes the will. Deal 3 resolve. If opponent has no active Empower, deal 4.' },
  { name: 'Dread Whisper', category: 'Strike', type: 'Social', cost: 1,
    power: 2, target: 'nerve', keywords: ['Erode'],
    description: 'A voice from nowhere speaks their name. Deal 2 nerve. Erode 1.' },
  { name: 'Sonic Lash', category: 'Strike', type: 'Environmental', cost: 1,
    power: 2, target: 'vitality', keywords: ['Resonate'],
    description: 'Sound made sharp enough to cut. Deal 2 vitality. Resonate: +1P if same type played last round.' },

  // ── EMPOWER (1) — Keyword grant ──
  { name: 'Voices in Chorus', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { powerBonus: 1, addKeyword: 'Erode' },
    description: 'Many whispers become one command. Next Strike gains +1 Power and Erode.' },

  // ── DISRUPT (1) — Randomize target ──
  { name: 'Echoing Confusion', category: 'Disrupt', type: 'Social', cost: 1,
    disruptEffect: { disadvantage: true, randomizeTarget: true },
    description: 'Echoes turn directions inside out. Disadvantage. Next Strike hits a random resource.' },

  // ── COUNTERS (2) — Steal vs Punish ──
  { name: 'Absorbing Silence', category: 'Counter', type: 'Environmental', cost: 1,
    counterDamage: { resource: 'resolve', amount: 1 },
    counterEffect: { steal: true },
    description: 'Consume their preparation. Remove condition. Chip 1 resolve. If Empower, steal it.' },
  { name: 'Echoing Rebuke', category: 'Counter', type: 'Social', cost: 1,
    counterDamage: { resource: 'nerve', amount: 1 },
    counterEffect: { empowerBonus: { chipDamage: 2 } },
    description: 'Turn their words against them. Remove condition. Chip 1 nerve. If Empower, chip 2 instead.' },

  // ── REACTS (2) — Block vs Redirect ──
  { name: 'Wall of Whispers', category: 'React', type: 'Social', cost: 0, power: 2,
    description: 'A wall of overlapping voices deflects the blow. Contest with Power 2.' },
  { name: 'Echoing Deflection', category: 'React', type: 'Social', cost: 0, power: 1,
    reactEffect: { reflect: { amount: 1, resource: 'resolve' } },
    description: 'Bounce the attack back as psychic echo. Contest Power 1. On Devastating defense, reflect 1 resolve.' },

  // ── TRAP (1) ──
  { name: 'Echo Snare', category: 'Trap', type: 'Social', cost: 1,
    trapTrigger: 'counter_played',
    trapEffect: [{ resource: 'resolve', amount: -2, target: 'triggerer' }],
    description: 'A false silence invites a counter that springs the real trap. Triggers on Counter. Deal 2 resolve.' },

  // ── OFFER (1) ──
  { name: 'Comforting Lie', category: 'Offer', type: 'Social', cost: 2,
    target: 'trust',
    offerPayload: [
      { resource: 'nerve', amount: 3, target: 'opponent' },
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ],
    description: 'A soothing falsehood that calms the spirit. Accept: heal 3 nerve, build trust.' },

  // ── RESHAPE (1) ──
  { name: 'Shifting Echoes', category: 'Reshape', type: 'Social', cost: 2,
    reshapeEffect: {
      shift: { from: 'presence', to: 'veil', amount: 2 },
      fortify: { resource: 'presence', reduction: 1, duration: 1 },
    },
    description: 'Rearrange the gallery\'s acoustics. Convert 2 presence to veil. Fortify presence 1.' },
];