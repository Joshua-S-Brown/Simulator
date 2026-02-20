/**
 * DUNGEON DECK: Root Hollow (v3.0 — Bond System Integration)
 * 
 * Identity: Crushing earth, ensnaring roots, slow decay
 * Tags: Physical, Environmental, Enclosed
 * 
 * ═══════════════════════════════════════════════════════════════
 * v3.0 BOND INTEGRATION — OFFER UPDATE ONLY
 * ═══════════════════════════════════════════════════════════════
 * 
 * Root Hollow is a Kill specialist. It does NOT get a Covenant
 * card — Bond is not this room's job. Mossy Rest exists as a
 * secondary trust-building path for nurturing profiles, but the
 * room's primary identity is Entangle→Crush.
 * 
 * v3.0 changes: Mossy Rest updated from legacy offerPayload to
 * transactional format with Binding cost. The visitor gets a real
 * heal (3 vitality), but the roots extract a toll: resolve drains
 * for 2 rounds afterward. Even the kindness here has teeth.
 * 
 * ═══════════════════════════════════════════════════════════════
 * v2.7 STRIKE POWER PHILOSOPHY
 * ═══════════════════════════════════════════════════════════════
 * 
 * Root Hollow's hierarchy:
 *   Chip:     Entombing Grasp (P2) — the grab. Setup.
 *   Chip:     Tremor Slam (P2) — cheap nerve attrition.
 *   Threat:   Soul Leech (P3) — Drain sustain.
 *   Finisher: Crushing Grip (P3 base, P5 with Entangle).
 * 
 * PRIMARY COMBO: Entombing Grasp → Crushing Grip
 *   Cost: 2+2 = 4 energy. P5 resolve + Erode.
 * 
 * WIN CONDITIONS:
 *   Kill — Primary. Entangle→Crush + vitality auto-damage.
 *   Break — Secondary. Crushing Grip resolve + Erode.
 *   Panic — Tertiary. Tremor Slam + Soul Leech + nerve auto.
 *   Bond — Mossy Rest opens trust. No Covenant — carries forward.
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.2: Energy system integration.
 * v2.3: Crushing Grip vitality→resolve. Tremor Slam P1→P2.
 * v2.7: Strike power rebalance. Crushing Grip P2→P3.
 * v3.0: Mossy Rest → transactional format. Binding resolve cost.
 *       No Covenant — Kill specialist room.
 */
module.exports = [
  // ═══ ENERGY (5) ═══
  { name: 'Earthen Focus', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'Draw power from the deep stone.' },
  { name: 'Hunger Pulse', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'The dungeon\'s appetite sharpens into focus.' },
  { name: 'Resonant Core', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Environmental', discount: 1 },
    description: 'Vibrations in the bedrock align with the roots above. Next Environmental card costs 1 less.' },
  { name: 'Predatory Surge', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'surge', energyGain: 0, surgeGain: 2,
    description: 'A flash of killing intent — power that burns fast.' },
  { name: 'Root Siphon', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'has_condition', condition: 'entangled' }, target: 'opponent' },
    description: 'Roots drink deeper when prey cannot flee. +1 permanent if opponent Entangled, else +1 temp.' },

  // ═══ STRIKES (4) ═══
  { name: 'Entombing Grasp', category: 'Strike', type: 'Environmental', cost: 2,
    power: 2, target: 'vitality', keywords: ['Entangle'],
    description: 'Roots erupt to pin the intruder. Deal 2 vitality damage. Entangle.' },
  { name: 'Crushing Grip', category: 'Strike', type: 'Environmental', cost: 2,
    power: 3, target: 'resolve', keywords: ['Erode'],
    trigger: { condition: { type: 'has_condition', condition: 'entangled' }, bonus: 2,
      description: 'If Entangled, +2 Power' },
    description: 'Tighten the hold until resistance crumbles. Deal 3 resolve. Erode 1. If Entangled, deal 5.' },
  { name: 'Tremor Slam', category: 'Strike', type: 'Environmental', cost: 1,
    power: 2, target: 'nerve', keywords: ['Erode'],
    description: 'The ground itself attacks. Deal 2 nerve. Erode 1.' },
  { name: 'Soul Leech', category: 'Strike', type: 'Social', cost: 2,
    power: 3, target: 'nerve', keywords: ['Drain'],
    drain: { resource: 'presence' },
    description: 'The roots feed on dread. Deal 3 nerve. Drain: convert damage dealt to presence recovery.' },

  // ═══ EMPOWER (1) ═══
  { name: 'Predatory Stance', category: 'Empower', type: 'Environmental', cost: 2,
    empowerEffect: { advantage: true },
    description: 'Sense weakness through root vibrations. Next Strike gains Advantage.' },

  // ═══ DISRUPT (1) ═══
  { name: 'Tangling Undergrowth', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { disadvantage: true },
    description: 'Roots shift underfoot, tangling movement. Opponent\'s next Strike at Disadvantage.' },

  // ═══ COUNTERS (2) ═══
  { name: 'Bark Shield', category: 'Counter', type: 'Environmental', cost: 1,
    counterDamage: { resource: 'vitality', amount: 1 },
    counterEffect: { applyFortify: 1, fortifyResource: 'structure' },
    description: 'Bark hardens to absorb. Remove condition. Chip 1 vitality. Fortify structure 1.' },
  { name: 'Root Snag', category: 'Counter', type: 'Environmental', cost: 1,
    counterDamage: { resource: 'vitality', amount: 1 },
    counterEffect: { applyEntangle: true },
    description: 'Roots grab during the opening. Remove condition. Chip 1 vitality. Entangle opponent.' },

  // ═══ REACTS (2) ═══
  { name: 'Stone Brace', category: 'React', type: 'Physical', cost: 0, power: 2,
    reactEffect: { absorb: true, fortifyResource: 'structure', fortifyAmount: 1 },
    description: 'Brace with living stone. Contest Power 2. Fortify structure 1 regardless.' },
  { name: 'Thorn Reflex', category: 'React', type: 'Environmental', cost: 0, power: 1,
    reactEffect: { reflect: true },
    description: 'Thorns punish the attacker. Contest Power 1. On Devastating defense, reflect damage.' },

  // ═══ TRAP (1) ═══
  { name: 'Buried Snare', category: 'Trap', type: 'Environmental', cost: 1,
    trapTrigger: 'strike_played',
    trapEffect: { applyEntangle: true, damage: { resource: 'vitality', amount: 1 } },
    description: 'Hidden roots wait for movement. When visitor Strikes, Entangle + 1 vitality damage.' },

  // ═══ OFFER (1) — v3.0 Transactional ═══
  { name: 'Mossy Rest', category: 'Offer', type: 'Environmental', cost: 1,
    offer: {
      benefit: { resource: 'vitality', amount: 3 },
      cost: { type: 'binding', resource: 'resolve', amount: 1, duration: 2 },
      investment: { trust: 1 },
    },
    description: 'A patch of luminous moss pulses with warmth. Rest here and recover — but the roots remember what they gave. Heal 3 vitality. Binding: resolve -1/round for 2 rounds.' },

  // ═══ RESHAPE (1) ═══
  { name: 'Shifting Roots', category: 'Reshape', type: 'Environmental', cost: 2,
    reshapeEffect: { heal: [{ resource: 'structure', amount: 2 }], fortify: [{ resource: 'structure', amount: 1 }] },
    description: 'The walls reshape themselves. Heal 2 structure. Fortify structure 1.' },
];