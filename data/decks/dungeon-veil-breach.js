/**
 * DUNGEON DECK: Veil Breach (v2.7 — Strike Power Rebalance)
 * 
 * Identity: Reality fractures, existential dread, high risk/reward
 * Tags: Mystical, Environmental, Unstable
 * 
 * ═══════════════════════════════════════════════════════════════
 * v2.7 STRIKE POWER PHILOSOPHY
 * ═══════════════════════════════════════════════════════════════
 * 
 * Veil Breach's hierarchy:
 *   Chip:     Veil Lash (P2) — reality cuts. Cheap vitality.
 *   Threat:   Creeping Dread (P3) — slow horror. Resolve + Erode.
 *   Finisher: Nightmare Surge (P4) — with Fear Resonance = P6.
 *             Pure terror crashes through. Overwhelm spills excess.
 *   Alpha:    Veil Rend (P4 Exhaust) — tear the boundary open.
 *             One use, self-cost 2 veil. The nuclear option.
 * 
 * COMBO LINES:
 * 
 * PRIMARY: Fear Resonance → Nightmare Surge
 *   Cost: 1+2 = 3 energy. Adds +2P + Overwhelm to P4 = P6.
 *   Strong hit = 6 nerve + Overwhelm excess → resolve spill.
 *   Devastating = 9 nerve. Against nerve 17, that's over half
 *   in one shot. The visitors MUST respond to the Empower or
 *   accept catastrophic damage.
 * 
 * ALPHA: Surge energy → Veil Rend
 *   Cost: 3 energy (typically needs Reality Spike or Warped Root).
 *   P4 nerve, Exhaust, self-cost 2 veil. One devastating strike
 *   that sacrifices dimensional integrity. Use it when the terror
 *   is close to breaking them — or don't use it at all.
 * 
 * CONTROL: Spatial Distortion → clean Strike
 *   Strip keywords from opponent's next Strike. In warped reality,
 *   their preparations fail. Follow with your own uncontested hit.
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.2: Energy system integration. 5 Energy cards. Veil Rend cost
 *       2→3 (alpha strike premium).
 * v2.7: Strike power rebalance.
 *       Nightmare Surge P3→P4. Fear Resonance combo now peaks at
 *       P6 — the most devastating combo in the gauntlet. The Veil
 *       Breach is where the dungeon goes all-in on terror.
 *       Creeping Dread P2→P3. Slow horror should still hurt.
 */
module.exports = [
  // ── ENERGY (5) ──
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

  // ── STRIKES (4) — Three-tier hierarchy + alpha ──

  // COMBO FINISHER: Pure terror. P4 base, P6 with Fear Resonance.
  // v2.7: P3→P4. The breach's signature terror must be devastating.
  { name: 'Nightmare Surge', category: 'Strike', type: 'Social', cost: 2,
    power: 4, target: 'nerve', keywords: ['Overwhelm'], overwhelmTarget: 'resolve',
    description: 'Pure terror crashes through defenses. Deal 4 nerve. Overwhelm: excess spills to resolve.' },

  // THREAT: Slow-building existential horror. Resolve attrition.
  // v2.7: P2→P3. Creeping dread should creep harder.
  { name: 'Creeping Dread', category: 'Strike', type: 'Social', cost: 1,
    power: 3, target: 'resolve', keywords: ['Erode'],
    description: 'Slow-building existential horror. Deal 3 resolve. Erode 1.' },

  // CHIP: Reality itself cuts. Cheap vitality pressure.
  { name: 'Veil Lash', category: 'Strike', type: 'Mystical', cost: 1,
    power: 2, target: 'vitality', keywords: ['Resonate'],
    description: 'Reality itself cuts. Deal 2 vitality. Resonate: +1P if same type last round.' },

  // ALPHA: Tear the boundary open. One use, massive risk/reward.
  { name: 'Veil Rend', category: 'Strike', type: 'Mystical', cost: 3,
    power: 4, target: 'nerve', exhaust: true,
    selfCost: { resource: 'veil', amount: 2 },
    description: 'Tear the boundary open. Deal 4 nerve. Self-cost: lose 2 veil. Exhaust (one use). Cost 3: requires Surge or deep pool.' },

  // ── EMPOWER (1) — Power boost + Overwhelm grant ──
  { name: 'Fear Resonance', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { powerBonus: 2, addKeyword: 'Overwhelm' },
    description: 'Channel ambient dread. Next Strike gains +2 Power and Overwhelm.' },

  // ── DISRUPT (1) — Strip keywords ──
  { name: 'Spatial Distortion', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { disadvantage: false, stripKeywords: true },
    description: 'Twist the space between. Opponent\'s next Strike loses all keywords.' },

  // ── COUNTERS (2) — Standard vs Broad reset ──
  { name: 'Veil Ward', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'nerve', amount: 1 },
    description: 'A shimmer of unreality absorbs the effect. Remove condition. Chip 1 nerve.' },
  { name: 'Reality Anchor', category: 'Counter', type: 'Mystical', cost: 2,
    counterDamage: { resource: 'resolve', amount: 1 },
    counterEffect: { removeAll: true },
    description: 'Restore baseline reality. Remove ALL conditions from both sides. Chip 1 resolve. Cost 2.' },

  // ── REACTS (2) — Strong block vs Conditional ──
  { name: 'Reality Bend', category: 'React', type: 'Mystical', cost: 0, power: 2,
    description: 'Bend the attack through folded space. Contest with Power 2.' },
  { name: 'Shadow Absorption', category: 'React', type: 'Mystical', cost: 0, power: 1,
    reactEffect: { conditionalPower: { condition: 'self_resource_below_half', resource: 'veil', power: 3 } },
    description: 'Shadows thicken to shield. Power 1. If veil below half, Power 3 instead.' },

  // ── TRAP (1) ──
  { name: 'Reality Snag', category: 'Trap', type: 'Mystical', cost: 1,
    trapTrigger: 'strike_played',
    trapEffect: [{ resource: 'nerve', amount: -2, target: 'triggerer' }],
    description: 'A fold in reality punishes aggression. Triggers on Strike. Deal 2 nerve.' },

  // ── OFFER (1) ──
  { name: 'Glimpse Beyond', category: 'Offer', type: 'Mystical', cost: 2,
    target: 'trust',
    offerPayload: [
      { resource: 'resolve', amount: 2, target: 'opponent' },
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ],
    description: 'A controlled vision of what lies beyond the veil. Accept: heal 2 resolve, build trust.' },

  // ── RESHAPE (1) ──
  { name: 'Dimensional Fold', category: 'Reshape', type: 'Mystical', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'veil', amount: 2 }],
      fortify: [{ resource: 'veil', amount: 1 }],
    },
    description: 'Fold the breach inward. Heal 2 veil. Fortify veil 1.' },
];