/**
 * VISITOR DECK: Drift Symbiote (v3.0 — Bond System Integration)
 * 
 * Identity: Cooperative, symbiotic, seeks Bond, light combat
 * Tags: Social, Environmental, Cooperative
 * 
 * ═══════════════════════════════════════════════════════════════
 * v3.0 BOND INTEGRATION — OFFER UPDATE
 * ═══════════════════════════════════════════════════════════════
 * 
 * The Symbiote is the Bond-seeking visitor — the mirror to the
 * Sanctuary's Bond-seeking dungeon. Its Offers go TO the dungeon,
 * building trust from the visitor side. The dungeon decides
 * whether to accept.
 * 
 * VISITOR-SIDE OFFER RESOLUTION:
 *   Symbiote plays Offer → dungeon accepts or refuses
 *   Accept: dungeon receives benefit AND pays cost
 *   Investment: trust advances (toward shared Bond threshold)
 * 
 * v3.0 changes: Both Offers updated from legacy offerPayload
 * (which just manipulated promoters directly) to transactional
 * format with real resource effects.
 * 
 * OFFER DESIGN — HONEST COSTS (mirrors Sanctuary):
 * 
 *   Mutual Nourishment (cost 1): Flat cost
 *     Benefit: presence +2 (Symbiote bolsters dungeon identity)
 *     Cost: veil -1 (the connection thins the mystical barrier)
 *     Trust +1. Small, honest, frequent. The Symbiote's bread
 *     and butter for trust accumulation.
 * 
 *   Shared Warmth (cost 2): Extraction cost
 *     Benefit: structure +3 (Symbiote physically repairs damage)
 *     Cost: extraction (Symbiote learns about dungeon construction)
 *     Trust +2. Bigger investment, bigger payoff. The Symbiote
 *     learns from what it heals — information, not damage.
 * 
 * Compare to Honeyed Hollow's Offers (Binding/Exposure — compound
 * hidden damage). The Symbiote's costs are transparent and fair,
 * matching its cooperative identity.
 * 
 * ═══════════════════════════════════════════════════════════════
 * COMBO LINES
 * ═══════════════════════════════════════════════════════════════
 * 
 * PRIMARY: Symbiotic Probe → Mutual Nourishment
 *   Test builds trust through prisoner's dilemma, Offer follows
 *   with resource benefit + more trust. This is the core trust
 *   pipeline — 2-3 cycles gets trust to Tier 1 (3+).
 * 
 * SECONDARY: Harmonize → Psychic Prod
 *   Ward + trust-scaled Strike. Light pressure that scales with
 *   the relationship — the more you know, the sharper the nudge.
 *   Used when cooperation stalls.
 * 
 * DEFENSIVE: Elastic Membrane / Adaptive Shell → survive
 *   The Symbiote isn't built to fight. Its defense is modest —
 *   it survives long enough for trust to mature.
 * 
 * WIN CONDITIONS (as visitor):
 *   Bond — PRIMARY. Test + Offer pipeline. Requires dungeon to
 *     have Covenant in its deck (Sanctuary only post-v3.0).
 *   Dominate — Secondary. If dungeon is nurturing but lacks
 *     Covenant, presence erodes from auto-effects while trust
 *     climbs uselessly. Psychic Prod helps finish.
 *   Survive — Tertiary. Outlast via Reacts and Empowers.
 *   Overcome — Unlikely. Tendril Lash is too weak for structure.
 * 
 * ═══════════════════════════════════════════════════════════════
 * DECK COMPOSITION (15 cards)
 * ═══════════════════════════════════════════════════════════════
 * Energy:   5  (2 Standard, 2 Attune[Social], 1 Siphon[rapport])
 * Strike:   2  (reluctant, light pressure)
 * Test:     1  (prisoner's dilemma)
 * Empower:  2  (Advantage + Ward/Power)
 * Offer:    2  (v3.0 transactional — trust pipeline)
 * Counter:  1  (gentle, zero chip)
 * React:    2  (block + absorb)
 * Total:   15 (unchanged from v2.2)
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.2: Energy system integration. 5 Energy cards.
 * v3.0: Both Offers updated to transactional format.
 *       Mutual Nourishment: Flat (presence +2, veil -1, trust +1).
 *       Shared Warmth: Extraction (structure +3, learn, trust +2).
 *       Legacy offerPayload format removed.
 */
export default [
  // ── ENERGY (5) ──
  { name: 'Symbiotic Pulse', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'Life-force shared between organisms.' },
  { name: 'Adaptive Core', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1,
    description: 'The symbiote reshapes itself to gather energy.' },
  { name: 'Trust Filament', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Social', discount: 1 },
    description: 'Thin threads of trust crystallize into power. Next Social card costs 1 less.' },
  { name: 'Root Anchor', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Social', discount: 1 },
    description: 'Tendrils grip the earth to channel cooperative warmth. Next Social card costs 1 less.' },
  { name: 'Resonant Thread', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'resource_above', resource: 'rapport', threshold: 3 }, target: 'opponent' },
    description: 'Draw power from mutual rapport. +1 permanent if dungeon rapport > 3, else +1 temp.' },

  // ── STRIKES (2) — Light pressure, reluctant ──
  { name: 'Tendril Lash', category: 'Strike', type: 'Physical', cost: 1,
    power: 1, target: 'structure', keywords: ['Erode'],
    description: 'A reluctant swipe that lingers. Deal 1 structure. Erode 1.' },
  { name: 'Psychic Prod', category: 'Strike', type: 'Social', cost: 1,
    power: 1, target: 'presence',
    trigger: { condition: { type: 'resource_above', target: 'self', resource: 'trust' }, bonus: 1,
      description: 'If trust > 3, +1P (knows your weaknesses)' },
    description: 'A gentle mental nudge. Deal 1 presence. If trust > 3, deal 2 (familiar insight).' },

  // ── TEST (1) — Prisoner's dilemma ──
  { name: 'Symbiotic Probe', category: 'Test', type: 'Social', cost: 1,
    target: 'trust',
    testReward: { trust: 2, rapport: 2 },
    defectPenalty: { trustCrash: 0.5, powerGain: 2 },
    exposureCost: { resource: 'vitality', amount: 1 },
    description: 'Extend a vulnerable tendril. Cooperate: +2 trust, +2 rapport, lose 1 vitality. Defect: trust crashes.' },

  // ── EMPOWERS (2) ──
  { name: 'Symbiotic Bond', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { advantage: true },
    description: 'Deepen the connection. Next action gains Advantage.' },
  { name: 'Harmonize', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { powerBonus: 1, addKeyword: 'Ward' },
    description: 'Attune to the dungeon\'s rhythm. Next action gains +1 Power and Ward.' },

  // ── OFFERS (2) — v3.0 Transactional ──

  // OFFER 1: Small, frequent, honest. The Symbiote's trust bread-and-butter.
  // Benefit goes to dungeon (presence +2). Cost to dungeon (veil -1).
  // At Tier 0: Dungeon sees both sides — +2 presence for -1 veil. Good deal.
  // A nurturing dungeon accepts easily. An aggressive dungeon might refuse
  // (doesn't want its barrier thinned even for presence).
  { name: 'Mutual Nourishment', category: 'Offer', type: 'Social', cost: 1,
    offer: {
      benefit: { resource: 'presence', amount: 2 },
      cost: { type: 'flat', resource: 'veil', amount: 1 },
      investment: { trust: 1 },
    },
    description: 'The symbiote extends nourishing tendrils. Accept the gift — presence strengthens, though the mystical barrier thins slightly. Presence +2. Cost: veil -1.' },

  // OFFER 2: Bigger investment. Extraction cost — the Symbiote learns.
  // Benefit goes to dungeon (structure +3). Cost is informational.
  // This is the Symbiote's best trust-builder (trust +2 per acceptance).
  // Extraction is the lightest cost type — no resource damage, just
  // the dungeon reveals something about itself. Perfect for cooperative play.
  { name: 'Shared Warmth', category: 'Offer', type: 'Environmental', cost: 2,
    offer: {
      benefit: { resource: 'structure', amount: 3 },
      cost: { type: 'extraction', effect: 'visitor_knowledge_1' },
      investment: { trust: 2 },
    },
    description: 'Tendrils weave into damaged walls, mending from within. The symbiote learns the dungeon\'s architecture as it heals. Structure +3. Cost: symbiote learns about dungeon construction.' },

  // ── COUNTER (1) ──
  { name: 'Absorb Impact', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: { resource: 'structure', amount: 0 },
    counterEffect: { applyFortify: 1, fortifyResource: 'vitality' },
    description: 'Absorb the disruption into elastic tissue. Remove condition. Fortify vitality 1. No chip.' },

  // ── REACTS (2) ──
  { name: 'Elastic Membrane', category: 'React', type: 'Physical', cost: 0, power: 2,
    description: 'Stretchy membrane distributes force. Contest with Power 2.' },
  { name: 'Adaptive Shell', category: 'React', type: 'Environmental', cost: 0, power: 1,
    reactEffect: { alwaysFortify: 1 },
    description: 'Harden on impact, soften after. Contest Power 1. Gain Fortify 1 regardless.' },
];