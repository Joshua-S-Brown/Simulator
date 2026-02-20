/**
 * DUNGEON DECK: Root Hollow (v2.7 — Strike Power Rebalance)
 * 
 * Identity: Crushing earth, ensnaring roots, slow decay
 * Tags: Physical, Environmental, Enclosed
 * 
 * ═══════════════════════════════════════════════════════════════
 * v2.7 STRIKE POWER PHILOSOPHY
 * ═══════════════════════════════════════════════════════════════
 * 
 * With v2.7's reduced auto-effects, card plays must be the primary
 * damage source. Each deck has a three-tier Strike hierarchy:
 * 
 *   CHIP (P2, cost 1): Cheap, frequent, setup-oriented. Maintains
 *     pressure while setting up combos. Every roll matters but
 *     Partials are survivable.
 * 
 *   THREAT (P3, cost 1–2): Reliably dangerous. Devastatings hurt,
 *     Strongs are significant, Partials are chip. The bread and butter.
 * 
 *   COMBO FINISHER (P4+ after setup): Demands a response. The payoff
 *     for executing the room's combo line. Visitors MUST Counter,
 *     React, or Fortify — or take serious damage.
 * 
 * Root Hollow's hierarchy:
 *   Chip:     Entombing Grasp (P2) — the grab. Setup, not finisher.
 *   Chip:     Tremor Slam (P2) — cheap nerve attrition.
 *   Threat:   Soul Leech (P3) — Drain sustain. Feeds the dungeon.
 *   Finisher: Crushing Grip (P3 base, P5 with Entangle) — the crush.
 * 
 * ═══════════════════════════════════════════════════════════════
 * COMBO LINES
 * ═══════════════════════════════════════════════════════════════
 * 
 * PRIMARY: Entombing Grasp → Crushing Grip
 *   Cost: 2+2 = 4 energy. Setup: Entangle target.
 *   Payoff: P5 resolve damage + Erode. Strong hit = 5 resolve,
 *   nearly 36% of Standard's resolve 14 in one shot.
 *   Counterplay: Counter the Entangle, Disrupt before Crush,
 *   React the Strike, or Fortify in advance. The visitors have
 *   tools — but they have to use them.
 * 
 * SECONDARY: Predatory Stance → Any Strike (Advantage)
 *   Cost: 2 + Strike cost. Better rolls = more Devastatings.
 *   Combo: Predatory Stance + Entangled = Double Advantage.
 *   With Crushing Grip: Double Advantage on P5 Strike. Terrifying.
 * 
 * SUSTAIN: Soul Leech Drain
 *   Cost: 2 energy. P3 nerve damage, Drain converts to presence.
 *   The dungeon heals while dealing damage. Rewards aggression.
 * 
 * ATTRITION: Tremor Slam Erode
 *   Cost: 1 energy. P2 nerve + Erode 1 next round.
 *   Cheap, persistent, grinds nerve over time.
 * 
 * TRAP: Buried Snare → Entombing Grasp → Crushing Grip
 *   Set snare, wait for visitor Strike, spring for Entangle,
 *   then follow up with Crushing Grip next round. Three-card
 *   sequence that punishes visitor aggression.
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.2: Energy system integration. 5 Energy cards added.
 * v2.3: Crushing Grip retargeted vitality → resolve. Tremor Slam
 *       buffed P1→P2. Soul Leech cost 3→2.
 * v2.7: Strike power rebalance for card-driven outcomes.
 *       Crushing Grip P2→P3 (P5 with Entangle conditional).
 *       Soul Leech P2→P3 (Drain sustain worth the investment).
 *       Auto-effects reduced; cards are now primary damage source.
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

  // ── STRIKES (4) — Three-tier hierarchy ──

  // CHIP: The grab. Setup for Crushing Grip combo.
  { name: 'Entombing Grasp', category: 'Strike', type: 'Environmental', cost: 2,
    power: 2, target: 'vitality', keywords: ['Entangle'],
    description: 'Roots erupt to pin the intruder. Deal 2 vitality damage. Entangle.' },

  // COMBO FINISHER: The crush. P3 base, P5 with Entangle.
  // v2.7: P2→P3. The Entangle→Crush payoff must be worth the setup.
  // v2.3: retargeted vitality → resolve. Opens Break path.
  { name: 'Crushing Grip', category: 'Strike', type: 'Environmental', cost: 2,
    power: 3, target: 'resolve', keywords: ['Erode'],
    trigger: { condition: { type: 'has_condition', condition: 'entangled' }, bonus: 2,
      description: 'If Entangled, +2 Power' },
    description: 'Tighten the hold until resistance crumbles. Deal 3 resolve. Erode 1. If Entangled, deal 5.' },

  // CHIP: Cheap nerve attrition. Persistent grind.
  { name: 'Tremor Slam', category: 'Strike', type: 'Environmental', cost: 1,
    power: 2, target: 'nerve', keywords: ['Erode'],
    description: 'The ground shakes with malice. Deal 2 nerve damage. Erode 1.' },

  // THREAT: Drain sustain. Nerve damage funds presence recovery.
  // v2.7: P2→P3. Drain is the dungeon's sustain engine — worth investment.
  { name: 'Soul Leech', category: 'Strike', type: 'Social', cost: 2,
    power: 3, target: 'nerve', keywords: ['Drain'], drainTarget: 'presence',
    description: 'Feed on the visitor\'s dread. Deal 3 nerve damage. Drain to presence (max 2).' },

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