/**
 * DUNGEON DECK: Whispering Gallery (v3.0 — Bond System Integration)
 * 
 * Identity: Echoes, psychological warfare, redirected reality
 * Tags: Social, Mystical, Open
 * 
 * ═══════════════════════════════════════════════════════════════
 * v3.0 BOND INTEGRATION — OFFER UPDATE ONLY
 * ═══════════════════════════════════════════════════════════════
 * 
 * Break specialist. NO Covenant. Comforting Lie updated to v3.0
 * transactional format with Exposure cost — the soothing lie
 * lowers your guard, making the next Social Strike hit harder.
 * 
 * For Nurturing: Exposure expires unused (no followup Strike).
 * For Deceptive: Exposure → Crushing Silence/Dread Whisper = +2.
 * For Tactical: AI won't play it.
 * 
 * PRIMARY COMBO: Voices in Chorus → Crushing Silence
 *   Cost: 1+2 = 3 energy. P5 resolve + Erode.
 * 
 * WIN CONDITIONS:
 *   Break — Primary. Crushing Silence + resolve auto-drain.
 *   Panic — Secondary. Dread Whisper + nerve Erode.
 *   Bond — Comforting Lie builds trust. No Covenant — carries fwd.
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.2: Energy system integration.
 * v2.3: Crushing Silence cost 3→2.
 * v2.7: Crushing Silence P3→P4. Dread Whisper P2→P3.
 * v3.0: Comforting Lie → transactional format. Exposure cost.
 *       No Covenant — Break specialist room.
 */
export default [
  // ═══ ENERGY (5) ═══
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

  // ═══ STRIKES (3) ═══
  { name: 'Crushing Silence', category: 'Strike', type: 'Social', cost: 2,
    power: 4, target: 'resolve',
    trigger: { condition: { type: 'no_condition', target: 'opponent', condition: 'empower' }, bonus: 1,
      description: 'If opponent has no Empower, +1 Power' },
    description: 'Absolute quiet crushes the will. Deal 4 resolve. If opponent has no active Empower, deal 5.' },
  { name: 'Dread Whisper', category: 'Strike', type: 'Social', cost: 1,
    power: 3, target: 'nerve', keywords: ['Erode'],
    description: 'A voice from nowhere speaks their name. Deal 3 nerve. Erode 1.' },
  { name: 'Sonic Lash', category: 'Strike', type: 'Environmental', cost: 1,
    power: 2, target: 'vitality', keywords: ['Resonate'],
    description: 'Sound made sharp enough to cut. Deal 2 vitality. Resonate: +1P if same type played last round.' },

  // ═══ EMPOWER (1) ═══
  { name: 'Voices in Chorus', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { powerBonus: 1, addKeyword: 'Erode' },
    description: 'Many whispers become one command. Next Strike gains +1 Power and Erode.' },

  // ═══ DISRUPT (1) ═══
  { name: 'Echoing Confusion', category: 'Disrupt', type: 'Social', cost: 1,
    disruptEffect: { disadvantage: true, randomizeTarget: true },
    description: 'Echoes turn directions inside out. Disadvantage. Next Strike hits a random resource.' },

  // ═══ COUNTERS (2) ═══
  { name: 'Absorbing Silence', category: 'Counter', type: 'Environmental', cost: 1,
    counterDamage: { resource: 'resolve', amount: 1 },
    counterEffect: { steal: true },
    description: 'Consume their preparation. Remove condition. Chip 1 resolve. If Empower, steal it.' },
  { name: 'Echoing Rebuke', category: 'Counter', type: 'Social', cost: 1,
    counterDamage: { resource: 'nerve', amount: 1 },
    counterEffect: { empowerBonus: { chipDamage: 2 } },
    description: 'Turn their words against them. Remove condition. Chip 1 nerve. If Empower, chip 2 instead.' },

  // ═══ REACTS (2) ═══
  { name: 'Wall of Whispers', category: 'React', type: 'Social', cost: 0, power: 2,
    description: 'A wall of overlapping voices deflects the blow. Contest with Power 2.' },
  { name: 'Echoing Deflection', category: 'React', type: 'Social', cost: 0, power: 1,
    reactEffect: { reflect: { amount: 1, resource: 'resolve' } },
    description: 'Bounce the attack back as psychic echo. Contest Power 1. On Devastating defense, reflect 1 resolve.' },

  // ═══ TRAP (1) ═══
  { name: 'Echo Snare', category: 'Trap', type: 'Social', cost: 1,
    trapTrigger: 'counter_played',
    trapEffect: [{ resource: 'resolve', amount: -2, target: 'triggerer' }],
    description: 'A false silence invites a counter that springs the real trap. Triggers on Counter. Deal 2 resolve.' },

  // ═══ OFFER (1) — v3.0 Transactional ═══
  { name: 'Comforting Lie', category: 'Offer', type: 'Social', cost: 2,
    offer: {
      benefit: { resource: 'nerve', amount: 3 },
      cost: { type: 'exposure', strikeType: 'Social', amount: 2, duration: 1 },
      investment: { trust: 1 },
    },
    description: 'A soothing falsehood that calms the spirit. The words feel true — but they leave you open. Heal 3 nerve. Exposure: next Social Strike deals +2.' },

  // ═══ RESHAPE (1) ═══
  { name: 'Shifting Echoes', category: 'Reshape', type: 'Social', cost: 2,
    reshapeEffect: {
      shift: { from: 'presence', to: 'veil', amount: 2 },
      fortify: [{ resource: 'presence', reduction: 1, duration: 1 }],
    },
    description: 'Rearrange the gallery\'s acoustics. Convert 2 presence to veil. Fortify presence 1.' },
];