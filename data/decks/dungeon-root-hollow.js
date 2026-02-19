/**
 * DUNGEON DECK: Root Hollow (v2.2)
 * Identity: Crushing earth, ensnaring roots, slow decay
 * Combo lines: Entangle → Crushing Grip (+2P conditional)
 *              Erode attrition via Tremor Slam
 *              Drain sustain via Soul Leech (cost 3 — premium)
 * 
 * ENERGY CHANGES (v2.2):
 *   - 3 → 5 Energy cards (28% of 18-card deck)
 *   - Resonant Core redesigned as Attune (Environmental)
 *   - Added Predatory Surge (Surge) and Root Siphon (Siphon: Entangle)
 * 
 * COST CHANGES (v2.2):
 *   - Soul Leech: 2 → 3 (deals damage AND heals — premium action)
 *   - Predatory Stance: 1 → 2 (conditional double-advantage is strong)
 */
module.exports = [
  // ── ENERGY (5) ──
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

  { name: 'Soul Leech', category: 'Strike', type: 'Social', cost: 3,
    power: 2, target: 'nerve', keywords: ['Drain'], drainTarget: 'presence',
    description: 'Feed on the visitor\'s dread. Deal 2 nerve damage. Drain to presence (max 2).' },

  // ── EMPOWER (1) — Conditional double-advantage ──
  { name: 'Predatory Stance', category: 'Empower', type: 'Environmental', cost: 2,
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
    counterDamage: { resource: 'vitality', amount: 1 },
    counterEffect: { applyEntangle: true },
    description: 'Roots lash out in retaliation. Remove condition. Chip 1 vitality. Entangle opponent.' },

  // ── REACTS (2) — Absorb vs Reflect ──
  { name: 'Stone Brace', category: 'React', type: 'Physical', cost: 0, power: 2,
    reactEffect: { absorb: true, fortifyResource: 'structure', fortifyAmount: 1 },
    description: 'Brace with living stone. Contest Power 2. Fortify structure 1 regardless.' },

  { name: 'Thorn Reflex', category: 'React', type: 'Environmental', cost: 0, power: 1,
    reactEffect: { reflect: true },
    description: 'Thorns punish the attacker. Contest Power 1. On Devastating defense, reflect damage.' },

  // ── TRAP (1) ──
  { name: 'Buried Snare', category: 'Trap', type: 'Environmental', cost: 1,
    trapTrigger: 'strike_played',
    trapEffect: { applyEntangle: true, damage: { resource: 'vitality', amount: 1 } },
    description: 'Hidden roots wait for movement. When visitor Strikes, Entangle + 1 vitality damage.' },

  // ── OFFER (1) ──
  { name: 'Mossy Rest', category: 'Offer', type: 'Environmental', cost: 1,
    offerPayload: { heal: { resource: 'vitality', amount: 2 } },
    offerTrustGain: 2, offerRapportGain: 1,
    description: 'A soft patch of moss, an invitation to rest. Heal visitor 2 vitality. Trust +2, Rapport +1.' },

  // ── RESHAPE (1) ──
  { name: 'Shifting Roots', category: 'Reshape', type: 'Environmental', cost: 2,
    reshapeEffect: { heal: [{ resource: 'structure', amount: 2 }], fortify: [{ resource: 'structure', amount: 1 }] },
    description: 'The walls reshape themselves. Heal 2 structure. Fortify structure 1.' },
];