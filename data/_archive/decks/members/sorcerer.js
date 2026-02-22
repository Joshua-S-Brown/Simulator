/**
 * MEMBER DECK: Sorcerer (Arcane Expedition)
 * Role: Burst DPS / Glass Cannon — 10 cards
 *
 * Primary: Veil burst damage, Overwhelm spillover, self-shielding
 * Strengths: Highest burst (Eldritch Burst 4P+Overwhelm), Hex deterrence, Arcane Ward self-defense
 * Weaknesses: Lowest vitality (5), expensive cards, defensive turns cost offense
 *
 * v2.6b: Traded Mind Blast + Spell Amplification for Arcane Ward + Mana Shield.
 *        Arcane Barrier gains Fortify 1 on success.
 */
export default [
  // ── Energy (2) ──
  { name: 'Arcane Focus', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'sorcerer',
    description: 'Channel arcane energy through a crystalline focus.' },

  { name: 'Mana Surge', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'surge', surgeGain: 2, member: 'sorcerer',
    description: 'A burst of raw mana floods the party\'s reserves.' },

  // ── Strikes (3) ──
  { name: 'Arcane Bolt', category: 'Strike', type: 'Mystical', cost: 1,
    power: 2, target: 'veil', member: 'sorcerer',
    description: 'A focused beam of arcane energy tears at the Veil. Deal 2 veil.' },

  { name: 'Chain Lightning', category: 'Strike', type: 'Environmental', cost: 2,
    power: 2, target: 'veil', member: 'sorcerer',
    trigger: {
      description: 'If entangled: +2 Power',
      condition: { type: 'has_condition', condition: 'entangled' },
      bonus: 2,
    },
    description: 'Lightning arcs through grounded targets. Deal 2 veil. +2 Power if entangled.' },

  { name: 'Eldritch Burst', category: 'Strike', type: 'Mystical', cost: 3,
    power: 4, target: 'veil', keywords: ['Overwhelm'],
    overwhelmTarget: 'resolve', member: 'sorcerer',
    description: 'Devastating arcane detonation. Deal 4 veil. Overwhelm: excess → resolve.' },

  // ── Disrupt (1) ──
  { name: 'Hex', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { onStrike: { selfDamage: { resource: 'veil', amount: 1 } } }, member: 'sorcerer',
    description: 'A curse that punishes aggression. Opponent\'s next Strike costs 1 veil.' },

  // ── Counter (2) ──
  { name: 'Counterspell', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'veil', amount: 1 }, member: 'sorcerer',
    description: 'Unravel the opponent\'s preparation. Remove condition. Chip 1 veil.' },

  { name: 'Mana Shield', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'veil', amount: 1 },
    counterEffect: {
      spreadFortify: { condition: 'self_has_fortify', target: 'lowest_vitality_ally',
                       resource: 'vitality', reduction: 1, duration: 1 },
    }, member: 'sorcerer',
    description: 'Raw magical energy deflects hostile intent. Remove condition. Chip 1 veil. If Sorcerer has Fortify, also grant Fortify 1 to weakest ally.' },

  // ── React (1) ──
  { name: 'Arcane Barrier', category: 'React', type: 'Mystical', cost: 0, power: 2,
    reactEffect: {
      onSuccess: { selfFortify: { resource: 'vitality', reduction: 1, duration: 1 } },
    }, member: 'sorcerer',
    description: 'A shimmering barrier of arcane energy. Contest with Power 2. On success: Fortify 1 to self for 1 round.' },

  // ── Reshape (1) ──
  { name: 'Arcane Ward', category: 'Reshape', type: 'Mystical', cost: 2,
    reshapeEffect: {
      fortify: [{ resource: 'vitality', reduction: 2, duration: 2 }],
      heal: [{ resource: 'vitality', amount: 1, target: 'self_member' }],
    }, member: 'sorcerer',
    description: 'Shimmering arcane energy absorbs incoming blows. Fortify 2 to self for 2 rounds. Heal 1 vitality.' },
];
