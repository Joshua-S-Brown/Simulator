/**
 * DUNGEON DECK: Whispering Gallery (v2.2)
 * Identity: Echoes, psychological warfare, redirected reality
 * Combo lines: Erode resolve via whispers (persistent attrition)
 *              Redirect opponent Strikes via Spatial Distortion
 *              Steal Empowers via Absorbing Silence
 * 
 * v2.2 ENERGY CHANGES:
 *   3→5 Energy cards (2 Standard, 1 Surge, 1 Attune[Social], 1 Siphon)
 *   Crushing Silence cost 2→3 (premium no-Empower punish)
 *   15→17 cards total
 */
module.exports = [
  // ── ENERGY (5) ──
  { name: 'Memory Fragment', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'A half-remembered scream crystallizes into energy.' },
  { name: 'Whisper Shard', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'Fractured voices coalesce into focused will.' },
  { name: 'Echoing Void', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Social', discount: 1 },
    description: 'Empty spaces amplify intent. Next Social card costs 1 less.' },
  { name: 'Psychic Surge', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'surge', surgeGain: 2,
    description: 'A sudden cacophony of overlapping voices erupts into raw power.' },
  { name: 'Echo Siphon', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'has_condition', condition: 'empower' }, target: 'opponent' },
    description: 'Feed on their preparations. +1 permanent if opponent is Empowered, else +1 temp.' },

  // ── STRIKES (3) — Each mechanically distinct ──
  { name: 'Crushing Silence', category: 'Strike', type: 'Social', cost: 3,
    power: 3, target: 'resolve',
    trigger: { condition: { type: 'no_condition', target: 'opponent', condition: 'empower' }, bonus: 1,
      description: 'If opponent has no Empower, +1 Power' },
    description: 'Absolute quiet crushes the will. Deal 3 resolve. If opponent has no active Empower, deal 4. Cost 3: requires setup.' },
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
      fortify: [{ resource: 'presence', reduction: 1, duration: 1 }],
    },
    description: 'Rearrange the gallery\'s acoustics. Convert 2 presence to veil. Fortify presence 1.' },
];