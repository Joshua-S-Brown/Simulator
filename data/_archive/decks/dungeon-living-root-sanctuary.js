/**
 * DUNGEON DECK: Living Root Sanctuary (v3.0 — Bond System Integration)
 * 
 * Identity: Nurturing, protective, trust-building — the Bond specialist
 * Tags: Social, Environmental, Nurturing
 * 
 * ═══════════════════════════════════════════════════════════════
 * v3.0 BOND INTEGRATION — FULL TREATMENT + COVENANT
 * ═══════════════════════════════════════════════════════════════
 * 
 * The Sanctuary is the dungeon's Bond specialist room. It's the
 * only encounter that carries a Covenant card — the Bond finisher.
 * Every other room CAN build trust through Offers, but only this
 * room is designed to close the deal.
 * 
 * v3.0 replaces the old charity-based Offers (free gifts) with
 * transactional mechanics. Every Offer now has:
 *   benefit:    What the visitor receives (heal, restore)
 *   cost:       What the visitor pays (flat, binding, extraction)
 *   investment: Trust advancement toward Bond
 * 
 * The Sanctuary's cost types are deliberately mild — Flat costs
 * and Extraction (dungeon learns). This room IS the safe room.
 * The costs exist to make the transaction feel real, not to hurt.
 * Compare to Honeyed Hollow where costs compound nastily behind
 * a sweet facade.
 * 
 * TRUST TIER PROGRESSION IN SANCTUARY:
 *   Tier 0 (0–2): Offers are Transparent. Both benefit and cost
 *     visible. ~30% acceptance. The Boar refuses most things.
 *     Refused offers still grant +0.5 fractional trust.
 *   Tier 1 (3–5): Offers are Veiled. Benefit visible, cost hidden.
 *     ~60-75% acceptance. The visitor gambles on goodwill.
 *   Tier 2 (6–8): Offers are Binding. Auto-accepted.
 *   Tier 3 (9+): Covenant eligible. Pact of the Living Root fires.
 * 
 * ═══════════════════════════════════════════════════════════════
 * CARD ALIGNMENT — WHY THESE CARDS BELONG HERE
 * ═══════════════════════════════════════════════════════════════
 * 
 * TRUST-BUILDING:
 *   Healing Sap — Amber restoration. Flat cost (resolve).
 *   Sheltering Roots — Protection from fear. Flat cost (vitality).
 *   Luminous Gift — Strengthens purpose. Extraction cost.
 *   Trust Trial — Prisoner's dilemma. Mutual vulnerability test.
 *   Pact of the Living Root — COVENANT. Bond finisher.
 *     Full restore of lowest reducer. Cost 3 energy (cheaper than
 *     combat Covenants at cost 4 because this IS the Bond room).
 * 
 * STRIKES (reluctant):
 *   Protective Thorns — Power DECREASES with rapport. Reluctant.
 *   Warning Tremor — Nerve chip + Erode. Gentle discouragement.
 * 
 * COMBO LINES:
 *   1. Trust Trial → Healing Sap (build trust, follow with Offer)
 *   2. Calming Presence → Sheltering Roots (Ward + trust-building)
 *   3. Open the Way → any Offer (heal self, then extend offer)
 *   4. Trust accumulation → Pact of the Living Root (Covenant)
 * 
 * WIN CONDITIONS:
 *   Bond — PRIMARY. 3 Offers + 1 Test + 1 Covenant.
 *   Survive — Outlast via Reshape healing and Ward/Fortify.
 *   Kill — NOT a goal. Reluctant Strikes for self-defense only.
 * 
 * ═══════════════════════════════════════════════════════════════
 * DECK COMPOSITION (17 cards)
 * ═══════════════════════════════════════════════════════════════
 * Energy:   5  (2 Standard, 2 Attune, 1 Siphon)
 * Strike:   2  (reluctant, defensive)
 * Empower:  1  (Ward-granting)
 * Test:     1  (prisoner's dilemma)
 * Offer:    3  (v3.0 transactional) + 1 Covenant = 4 trust cards
 * Counter:  1  (gentle, zero chip)
 * React:    2  (protective)
 * Reshape:  1  (self-heal)
 * Total:   17
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.2: Energy system integration. Trust Trial + Offers.
 * v3.0: Offers replaced with transactional format. Covenant added.
 *       Deck size 15→17. Legacy offerPayload format removed.
 */
export default [
  // ═══ ENERGY (5) ═══
  { name: 'Root Cradle', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'The sanctuary\'s embrace generates gentle warmth.' },
  { name: 'Gentle Pulse', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'A steady rhythm of life-sustaining energy.' },
  { name: 'Shelter Core', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Environmental', discount: 1 },
    description: 'The heart of the sanctuary aligns with the earth. Next Environmental card costs 1 less.' },
  { name: 'Trust Seed', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Social', discount: 1 },
    description: 'A seed that grows in willing soil. Next Social card costs 1 less.' },
  { name: 'Sanctuary Siphon', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'resource_above', resource: 'trust', threshold: 3 }, target: 'opponent' },
    description: 'Draw strength from growing trust. +1 permanent if visitor trust > 3, else +1 temp.' },

  // ═══ STRIKES (2) — Defensive/warning, not aggressive ═══
  { name: 'Protective Thorns', category: 'Strike', type: 'Environmental', cost: 1,
    power: 2, target: 'vitality',
    trigger: { condition: { type: 'resource_above', target: 'self', resource: 'rapport' }, bonus: -1,
      description: 'If rapport high, -1 Power (reluctant force)' },
    description: 'Thorns extend to ward off threats. Deal 2 vitality. If rapport > 3, deal only 1 (reluctant).' },
  { name: 'Warning Tremor', category: 'Strike', type: 'Environmental', cost: 1,
    power: 1, target: 'nerve', keywords: ['Erode'],
    description: 'A gentle shake to discourage aggression. Deal 1 nerve. Erode 1.' },

  // ═══ EMPOWER (1) ═══
  { name: 'Calming Presence', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { advantage: false, powerBonus: 1, addKeyword: 'Ward' },
    description: 'Project safety. Next action gains +1 Power and Ward (+1 structure defense, 1 round).' },

  // ═══ TEST (1) — Prisoner's dilemma ═══
  { name: 'Trust Trial', category: 'Test', type: 'Social', cost: 1,
    target: 'trust',
    testReward: { trust: 2, rapport: 2 },
    defectPenalty: { trustCrash: 0.5, powerGain: 2 },
    exposureCost: { resource: 'structure', amount: 1 },
    description: 'Open yourself to judgment. Cooperate: +2 trust, +2 rapport, lose 1 structure. Defect: trust crashes.' },

  // ═══ OFFERS (3) — v3.0 Transactional ═══
  { name: 'Healing Sap', category: 'Offer', type: 'Environmental', cost: 1,
    offer: {
      benefit: { resource: 'vitality', amount: 2 },
      cost: { type: 'flat', resource: 'resolve', amount: 1 },
      investment: { trust: 1 },
    },
    description: 'Amber sap with restorative properties. Accept the gift — it costs only a sliver of certainty. Heal 2 vitality. Cost: resolve -1.' },

  { name: 'Sheltering Roots', category: 'Offer', type: 'Environmental', cost: 1,
    offer: {
      benefit: { resource: 'nerve', amount: 2 },
      cost: { type: 'flat', resource: 'vitality', amount: 1 },
      investment: { trust: 1 },
    },
    description: 'An invitation to rest within protective coils. Safe from the dark — but the roots need something to hold. Heal 2 nerve. Cost: vitality -1.' },

  { name: 'Luminous Gift', category: 'Offer', type: 'Social', cost: 2,
    offer: {
      benefit: { resource: 'resolve', amount: 2 },
      cost: { type: 'extraction', effect: 'dungeon_knowledge_1' },
      investment: { trust: 2 },
    },
    description: 'A glowing offering that strengthens purpose. The dungeon watches, learns, remembers. Heal 2 resolve. Cost: dungeon learns from the experience.' },

  // ═══ COVENANT (1) — Bond Finisher ═══
  { name: 'Pact of the Living Root', category: 'Offer', subtype: 'Covenant',
    type: 'Environmental', cost: 3,
    covenantRequirement: { minTrust: 15 },
    bondTrigger: true,
    offer: {
      benefit: { type: 'full_restore', resource: 'lowest_reducer' },
      cost: { type: 'extraction', effect: 'dungeon_insight_2' },
      investment: { trust: 3 },
    },
    description: 'The sanctuary opens fully — not as trap, not as test, but as home. The roots weave a chair that fits exactly. Stay as long as you need.' },

  // ═══ COUNTER (1) — Gentle, zero chip ═══
  { name: 'Gentle Redirection', category: 'Counter', type: 'Social', cost: 1,
    counterDamage: { resource: 'vitality', amount: 0 },
    counterEffect: { applyFortify: 1, fortifyResource: 'structure' },
    description: 'Redirect hostility with warmth. Remove condition. Fortify structure 1. No chip damage.' },

  // ═══ REACTS (2) ═══
  { name: 'Root Buffer', category: 'React', type: 'Environmental', cost: 0, power: 2,
    description: 'Roots interpose between threat and sanctuary. Contest with Power 2.' },
  { name: 'Nurturing Bark', category: 'React', type: 'Environmental', cost: 0, power: 1,
    reactEffect: { alwaysFortify: 1 },
    description: 'Living bark absorbs the blow and heals around it. Contest Power 1. Gain Fortify 1 regardless.' },

  // ═══ RESHAPE (1) ═══
  { name: 'Open the Way', category: 'Reshape', type: 'Environmental', cost: 1,
    reshapeEffect: {
      heal: [{ resource: 'structure', amount: 2 }, { resource: 'presence', amount: 2 }],
    },
    description: 'The sanctuary reshapes around its wounds. Heal 2 structure and 2 presence.' },
];