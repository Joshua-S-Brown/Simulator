/**
 * MEMBER DECK: Druid (Arcane Expedition)
 * Role: Support / Healer / Sustain Amplifier — 10 cards
 *
 * Primary: Healing, Fortify extension, dual Attune energy, Restoration for knockout recovery
 * Strengths: Healing Touch extends Fortify, Restoration brings back downed allies, Thorn Whip Entangle backup
 * Weaknesses: Low vitality (6), minimal damage (Thorn Whip 1P only), reactive not preventive
 *
 * v2.6b: Healing Touch now extends Fortify duration on healed target.
 */
module.exports = [
  // ── Energy (3) ──
  { name: 'Natural Harmony', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Environmental', discount: 1 }, member: 'druid',
    description: 'Attune to the natural world. +1 permanent. Next Environmental card costs 1 less.' },

  { name: 'Spiritual Attunement', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Mystical', discount: 1 }, member: 'druid',
    description: 'Open the mind to mystical currents. +1 permanent. Next Mystical card costs 1 less.' },

  { name: 'Grounding Roots', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'druid',
    description: 'Draw steady energy from the earth beneath.' },

  // ── Strike (1) ──
  { name: 'Thorn Whip', category: 'Strike', type: 'Environmental', cost: 1,
    power: 1, target: 'vitality', keywords: ['Entangle'], member: 'druid',
    description: 'Thorny vines lash out and bind. Deal 1 vitality. Entangle. Setup for combos.' },

  // ── Offer (1) ──
  { name: 'Peaceful Offering', category: 'Offer', type: 'Social', cost: 1,
    target: 'trust',
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'self' },
      { resource: 'rapport', amount: 1, target: 'opponent' },
      { resource: 'nerve', amount: 2, target: 'self' },
    ], member: 'druid',
    description: 'Extend an olive branch. Accept: +1 trust, +1 rapport, heal 2 nerve.' },

  // ── Test (1) ──
  { name: 'Commune with Nature', category: 'Test', type: 'Social', cost: 1,
    target: 'rapport', testAmount: 2, member: 'druid',
    description: 'Open a channel between dungeon and party. Build rapport through shared understanding.' },

  // ── Reshape (3) ──
  { name: 'Healing Touch', category: 'Reshape', type: 'Social', cost: 2,
    reshapeEffect: {
      heal: [
        { resource: 'vitality', amount: 3, target: 'weakest_member' },
        { resource: 'resolve', amount: 1, target: 'self' },
      ],
      extendFortify: { target: 'healed_member', rounds: 1 },
    }, member: 'druid',
    description: 'Warm hands mend wounds and sustain wards. Heal weakest member 3 vit, +1 resolve. If target has Fortify, extend duration by 1 round.' },

  { name: 'Barkskin Blessing', category: 'Reshape', type: 'Environmental', cost: 1,
    reshapeEffect: {
      fortify: [{ resource: 'vitality', reduction: 1, duration: 1 }],
      heal: [{ resource: 'vitality', amount: 1, target: 'weakest_member' }],
    }, member: 'druid',
    description: 'Gift bark-like protection and minor healing. Fortify structure 1. Heal 1 vitality.' },

  { name: 'Restoration', category: 'Reshape', type: 'Environmental', cost: 3,
    reshapeEffect: {
      restore: { target: 'knocked_out', amount: 0.4 },
    }, member: 'druid',
    description: 'Nature reclaims the fallen. Restore a downed ally at 40% vitality.' },

  // ── React (1) ──
  { name: 'Wild Growth', category: 'React', type: 'Environmental', cost: 0, power: 1,
    reactEffect: { reflect: { amount: 1, resource: 'resolve' } }, member: 'druid',
    description: 'Vines surge to deflect. Contest Power 1. On Devastating defense, reflect 1 resolve.' },
];
