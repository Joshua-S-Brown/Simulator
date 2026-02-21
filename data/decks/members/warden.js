/**
 * MEMBER DECK: Warden (Arcane Expedition)
 * Role: Tank / Guardian / Setup — 10 cards
 *
 * Primary: Absorbing damage, protecting allies, Entangle setup
 * Strengths: Highest vitality (11), Guardian Stance protects squishies, Nature's Renewal restores downed allies
 * Weaknesses: Low damage output, no Mystical access, Guardian Stance costs offensive turns
 */
module.exports = [
  // ── Energy (2) ──
  { name: 'Steadfast Will', category: 'Energy', type: 'Physical', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'warden',
    description: 'Disciplined resolve fuels the party. Reliable energy.' },

  { name: 'Iron Bark', category: 'Energy', type: 'Physical', cost: 0,
    energyType: 'surge', surgeGain: 2, member: 'warden',
    description: 'The Warden channels the forest\'s strength in a burst of power.' },

  // ── Strikes (2) ──
  { name: 'Shield of Thorns', category: 'Strike', type: 'Physical', cost: 1,
    power: 2, target: 'structure', keywords: ['Entangle'], member: 'warden',
    description: 'A shield bash that pins the enemy in thorny vines. Deal 2 structure. Entangle.' },

  { name: 'Root Strike', category: 'Strike', type: 'Environmental', cost: 2,
    power: 3, target: 'structure', member: 'warden',
    description: 'Command the roots to crush the dungeon\'s foundation. Deal 3 structure.' },

  // ── Empower (1) ──
  { name: 'Stalwart Guard', category: 'Empower', type: 'Physical', cost: 1,
    empowerEffect: { advantage: true, addKeyword: 'Ward' }, member: 'warden',
    description: 'Set a defensive stance. Next Strike gains Advantage and Ward.' },

  // ── Disrupt (2) ──
  { name: 'Stone Wall', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { onStrike: { selfDamage: { resource: 'structure', amount: 1 } } }, member: 'warden',
    description: 'Raise a wall of living stone. Opponent\'s next Strike deals 1 structure to themselves.' },

  { name: 'Guardian Stance', category: 'Disrupt', type: 'Physical', cost: 2,
    disruptEffect: {
      guard: { target: 'lowest_vitality_ally', powerReduction: 2, duration: 2 },
      selfFortify: { resource: 'vitality', reduction: 1, duration: 1 },
    }, member: 'warden',
    description: 'The Warden plants herself between danger and her allies. Weakest ally gains Guarded (Strikes targeting them have -2 Power) for 2 rounds. Warden gains Fortify 1.' },

  // ── React (1) ──
  { name: 'Bark Skin', category: 'React', type: 'Environmental', cost: 0, power: 2,
    member: 'warden',
    description: 'Skin hardens to bark, absorbing the blow. Contest with Power 2.' },

  // ── Reshape (2) ──
  { name: 'Earthen Recovery', category: 'Reshape', type: 'Physical', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'vitality', amount: 3, target: 'weakest_member' }],
      fortify: [{ resource: 'vitality', reduction: 1, duration: 1 }],
    }, member: 'warden',
    description: 'Draw strength from the earth. Heal weakest member 3 vitality. Fortify structure 1.' },

  { name: 'Nature\'s Renewal', category: 'Reshape', type: 'Environmental', cost: 3,
    reshapeEffect: {
      restore: { target: 'knocked_out', amount: 0.4 },
    }, member: 'warden',
    description: 'The forest reclaims what was lost. Restore a downed ally at 40% vitality.' },
];
