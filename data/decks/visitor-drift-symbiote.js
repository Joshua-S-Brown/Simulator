/**
 * VISITOR DECK: Drift Symbiote
 * Identity: Cooperative, symbiotic, seeks Bond, light combat
 * Combo lines: Test → Offer pipeline (build trust through vulnerability)
 *              Harmonize → scaling power from trust level
 *              Light Strikes for pressure when cooperation fails
 */
module.exports = [
  // ── ENERGY (5) ──
  { name: 'Symbiotic Pulse', category: 'Energy', type: 'Social', cost: 0,
    description: 'Life-force shared between organisms.' },
  { name: 'Adaptive Core', category: 'Energy', type: 'Environmental', cost: 0,
    description: 'The symbiote reshapes itself to gather energy.' },
  { name: 'Trust Filament', category: 'Energy', type: 'Social', cost: 0,
    description: 'Thin threads of trust crystallize into power.' },
  { name: 'Root Anchor', category: 'Energy', type: 'Environmental', cost: 0,
    description: 'Tendrils grip the earth to channel its warmth.' },
  { name: 'Resonant Thread', category: 'Energy', type: 'Social', cost: 0,
    description: 'Vibrations along connective tissue become energy.' },

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

  // ── EMPOWERS (2) — Advantage vs Trust-scaling ──
  { name: 'Symbiotic Bond', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { advantage: true },
    description: 'Deepen the connection. Next action gains Advantage.' },
  { name: 'Harmonize', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { powerBonus: 1, addKeyword: 'Ward' },
    description: 'Attune to the dungeon\'s rhythm. Next action gains +1 Power and Ward.' },

  // ── OFFERS (2) — Each offers different healing ──
  { name: 'Mutual Nourishment', category: 'Offer', type: 'Social', cost: 1,
    target: 'trust',
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ],
    description: 'Share sustenance freely. Accept: build mutual trust.' },
  { name: 'Shared Warmth', category: 'Offer', type: 'Social', cost: 2,
    target: 'trust',
    offerPayload: [
      { resource: 'structure', amount: 2, target: 'opponent' },
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ],
    description: 'Envelop damaged areas in healing warmth. Accept: heal 2 structure, build trust. Cost 2.' },

  // ── COUNTER (1) ──
  { name: 'Absorb Impact', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: { resource: 'structure', amount: 0 },
    counterEffect: { applyFortify: 1, fortifyResource: 'vitality' },
    description: 'Absorb the disruption into elastic tissue. Remove condition. Fortify vitality 1. No chip.' },

  // ── REACTS (2) — Block vs Absorb ──
  { name: 'Elastic Membrane', category: 'React', type: 'Physical', cost: 0, power: 2,
    description: 'Stretchy membrane distributes force. Contest with Power 2.' },
  { name: 'Adaptive Shell', category: 'React', type: 'Environmental', cost: 0, power: 1,
    reactEffect: { alwaysFortify: 1 },
    description: 'Harden on impact, soften after. Contest Power 1. Gain Fortify 1 regardless.' },
];