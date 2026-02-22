/**
 * DUNGEON DECK: Veil Breach (v3.0 — Bond System Integration)
 * 
 * Identity: Reality fractures, existential dread, high risk/reward
 * Tags: Mystical, Environmental, Unstable
 * 
 * ═══════════════════════════════════════════════════════════════
 * v3.0 BOND INTEGRATION — OFFER UPDATE ONLY
 * ═══════════════════════════════════════════════════════════════
 * 
 * Panic specialist. NO Covenant. Glimpse Beyond updated to v3.0
 * with Dependency cost — the most dangerous Offer cost type.
 * If trust shatters, the suppressed terror floods back as 4 nerve.
 * 
 * For Nurturing: Dependency never triggers (no Strikes to crash trust).
 * For Deceptive: Build trust → betray → Dependency reverses for
 *   4 nerve ON TOP of betrayal conversion damage. Devastating.
 * For Tactical: AI won't play it.
 * 
 * PRIMARY COMBO: Fear Resonance → Nightmare Surge
 *   Cost: 1+2 = 3 energy. P6 nerve + Overwhelm → resolve spill.
 *   The most devastating combo in the gauntlet.
 * 
 * WIN CONDITIONS:
 *   Panic — Primary. Nightmare Surge + Veil Rend + nerve auto-drain.
 *   Break — Secondary. Creeping Dread + Overwhelm spill.
 *   Bond — Glimpse Beyond builds trust. No Covenant — carries fwd.
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.2: Energy system integration. Veil Rend cost 2→3.
 * v2.7: Nightmare Surge P3→P4. Creeping Dread P2→P3.
 * v3.0: Glimpse Beyond → transactional format. Dependency cost.
 *       No Covenant — Panic specialist room.
 */
export default [
  // ═══ ENERGY (5) ═══
  { name: 'Veil Fracture', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'Cracks in reality bleed usable power.' },
  { name: 'Fear Essence', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Mystical', discount: 1 },
    description: 'Distilled terror aligns with the veil. Next Mystical card costs 1 less.' },
  { name: 'Reality Spike', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'surge', surgeGain: 2,
    description: 'A violent tear in the boundary floods the room with raw dimensional energy.' },
  { name: 'Warped Root', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'surge', surgeGain: 2,
    description: 'A root twisted through dimensional folds releases stored chaos.' },
  { name: 'Dread Siphon', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'resource_below', resource: 'nerve', pct: 0.5 }, target: 'opponent' },
    description: 'Feed on faltering courage. +1 permanent if visitor nerve below half, else +1 temp.' },

  // ═══ STRIKES (4) ═══
  { name: 'Nightmare Surge', category: 'Strike', type: 'Social', cost: 2,
    power: 4, target: 'nerve', keywords: ['Overwhelm'], overwhelmTarget: 'resolve',
    description: 'Pure terror crashes through defenses. Deal 4 nerve. Overwhelm: excess spills to resolve.' },
  { name: 'Creeping Dread', category: 'Strike', type: 'Social', cost: 1,
    power: 3, target: 'resolve', keywords: ['Erode'],
    description: 'Slow-building existential horror. Deal 3 resolve. Erode 1.' },
  { name: 'Veil Lash', category: 'Strike', type: 'Mystical', cost: 1,
    power: 2, target: 'vitality', keywords: ['Resonate'],
    description: 'Reality itself cuts. Deal 2 vitality. Resonate: +1P if same type last round.' },
  { name: 'Veil Rend', category: 'Strike', type: 'Mystical', cost: 3,
    power: 4, target: 'nerve', exhaust: true,
    selfCost: { resource: 'veil', amount: 2 },
    description: 'Tear the boundary open. Deal 4 nerve. Self-cost: lose 2 veil. Exhaust (one use). Cost 3: requires Surge or deep pool.' },

  // ═══ EMPOWER (1) ═══
  { name: 'Fear Resonance', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { powerBonus: 2, addKeyword: 'Overwhelm' },
    description: 'Channel ambient dread. Next Strike gains +2 Power and Overwhelm.' },

  // ═══ DISRUPT (1) ═══
  { name: 'Spatial Distortion', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { disadvantage: false, stripKeywords: true },
    description: 'Twist the space between. Opponent\'s next Strike loses all keywords.' },

  // ═══ COUNTERS (2) ═══
  { name: 'Veil Ward', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'nerve', amount: 1 },
    description: 'A shimmer of unreality absorbs the effect. Remove condition. Chip 1 nerve.' },
  { name: 'Reality Anchor', category: 'Counter', type: 'Mystical', cost: 2,
    counterDamage: { resource: 'resolve', amount: 1 },
    counterEffect: { removeAll: true },
    description: 'Restore baseline reality. Remove ALL conditions from both sides. Chip 1 resolve. Cost 2.' },

  // ═══ REACTS (2) ═══
  { name: 'Reality Bend', category: 'React', type: 'Mystical', cost: 0, power: 2,
    description: 'Bend the attack through folded space. Contest with Power 2.' },
  { name: 'Shadow Absorption', category: 'React', type: 'Mystical', cost: 0, power: 1,
    reactEffect: { conditionalPower: { condition: 'self_resource_below_half', resource: 'veil', power: 3 } },
    description: 'Shadows thicken to shield. Power 1. If veil below half, Power 3 instead.' },

  // ═══ TRAP (1) ═══
  { name: 'Reality Snag', category: 'Trap', type: 'Mystical', cost: 1,
    trapTrigger: 'strike_played',
    trapEffect: [{ resource: 'nerve', amount: -2, target: 'triggerer' }],
    description: 'A fold in reality punishes aggression. Triggers on Strike. Deal 2 nerve.' },

  // ═══ OFFER (1) — v3.0 Transactional ═══
  { name: 'Glimpse Beyond', category: 'Offer', type: 'Mystical', cost: 2,
    offer: {
      benefit: { resource: 'nerve', amount: 2 },
      cost: { type: 'dependency', resource: 'nerve', amount: 4 },
      investment: { trust: 1 },
    },
    description: 'The rift stabilizes around you, dampening the alien dread. Accept the calm — but if trust shatters, the terror comes back doubled. Heal 2 nerve. Dependency: nerve -4 if trust drops.' },

  // ═══ RESHAPE (1) ═══
  { name: 'Dimensional Fold', category: 'Reshape', type: 'Mystical', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'veil', amount: 2 }],
      fortify: [{ resource: 'veil', amount: 1 }],
    },
    description: 'Fold the breach inward. Heal 2 veil. Fortify veil 1.' },
];