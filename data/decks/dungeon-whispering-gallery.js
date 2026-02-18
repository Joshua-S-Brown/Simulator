module.exports = [
  // ═══ WHISPERING GALLERY — Social/psychological dungeon room ═══
  // Identity: Manipulative, isolating. Erodes willpower while deflecting with echoes.
  // Template: 3E / 3S / 1Em / 1Di / 2Co / 2Re / 1Tr / 1Of / 1Rsh = 15

  // ENERGY (3)
  { name: 'Echoing Void',    category: 'Energy', type: 'Environmental', cost: 0, energyGain: 1 },
  { name: 'Memory Fragment',  category: 'Energy', type: 'Mystical',     cost: 0, energyGain: 1 },
  { name: 'Whisper Shard',   category: 'Energy', type: 'Social',        cost: 0, energyGain: 1 },

  // STRIKES (3) — multi-resource: resolve, nerve, vitality
  { name: 'Crushing Silence', category: 'Strike', type: 'Environmental', cost: 2, power: 3,
    target: 'resolve', keywords: [] },
  { name: 'Dread Whisper', category: 'Strike', type: 'Social', cost: 1, power: 2,
    target: 'nerve', keywords: [],
    trigger: { description: 'If Resolve < 50%: +2 Power', condition: { type: 'resource_below', resource: 'resolve' }, bonus: 2 } },
  { name: 'Sonic Lash', category: 'Strike', type: 'Environmental', cost: 1, power: 2,
    target: 'vitality', keywords: [] },

  // EMPOWER (1)
  { name: 'Voices in Chorus', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { advantage: true, powerBonus: 0 }, target: null, power: 0, keywords: [] },

  // DISRUPT (1)
  { name: 'Echoing Confusion', category: 'Disrupt', type: 'Social', cost: 1,
    disruptEffect: { disadvantage: true }, target: null, power: 0, keywords: [] },

  // COUNTER (2) — the room absorbs and redirects
  { name: 'Absorbing Silence', category: 'Counter', type: 'Environmental', cost: 1,
    counterDamage: { resource: 'resolve', amount: 1 }, target: null, power: 0, keywords: [] },
  { name: 'Echoing Rebuke', category: 'Counter', type: 'Social', cost: 1,
    counterDamage: { resource: 'nerve', amount: 1 }, target: null, power: 0, keywords: ['Erode'] },

  // REACT (2) — whispers deflect incoming attacks
  { name: 'Wall of Whispers', category: 'React', type: 'Social', cost: 0, power: 2,
    target: null, keywords: [] },
  { name: 'Echoing Deflection', category: 'React', type: 'Environmental', cost: 0, power: 1,
    target: null, keywords: [] },

  // TRAP (1) — punishes defensive play
  { name: 'Echo Snare', category: 'Trap', type: 'Social', cost: 1,
    trapTrigger: 'counter_played',
    trapEffect: [{ resource: 'resolve', amount: -2, target: 'triggerer' }],
    target: null, power: 0, keywords: [] },

  // OFFER (1)
  { name: 'Comforting Lie', category: 'Offer', type: 'Social', cost: 2,
    offerPayload: [
      { resource: 'resolve', amount: 2, target: 'opponent' },
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'nerve', amount: -2, target: 'opponent' },
    ], target: 'trust', power: 0, keywords: [] },

  // RESHAPE (1) — shift presence into veil, adapting the room
  { name: 'Shifting Echoes', category: 'Reshape', type: 'Social', cost: 2,
    reshapeEffect: {
      shift: { from: 'presence', to: 'veil', amount: 2 },
      fortify: { resource: 'presence', reduction: 1, duration: 1 },
    },
    target: null, power: 0, keywords: [] },
];