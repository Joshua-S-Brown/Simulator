/**
 * MEMBER DECK: Knight (Standard Adventuring Company)
 * Role: Tank / Setup — 10 cards
 *
 * Primary: Structure/Presence Strikes, Reshapes
 * Strengths: Highest vitality (10), Entangle setup, only party Empower
 * Weaknesses: Low damage ceiling, no Mystical access
 */
export default [
  // ── Energy (2) ──
  { name: 'Steadfast Resolve', category: 'Energy', type: 'Physical', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'knight',
    description: 'Discipline forged in a hundred battles. Reliable energy, turn after turn.' },

  { name: 'Battle Cry', category: 'Energy', type: 'Physical', cost: 0,
    energyType: 'surge', energyGain: 0, surgeGain: 2, member: 'knight',
    description: 'A shout that rallies the blood. Burst of energy that fades with the echo.' },

  // ── Strikes (3) ──
  { name: 'Shield Bash', category: 'Strike', type: 'Physical', cost: 1,
    power: 2, target: 'structure', keywords: ['Entangle'], member: 'knight',
    description: 'Slam the shield edge-first into stone. Deal 2 structure. Entangle: pin the dungeon\'s defenses.' },

  { name: 'Righteous Blow', category: 'Strike', type: 'Physical', cost: 2,
    power: 3, target: 'structure', keywords: ['Overwhelm'], overwhelmTarget: 'presence', member: 'knight',
    description: 'A two-handed overhead strike with conviction behind it. Deal 3 structure. Overwhelm: excess crashes into presence.' },

  { name: 'Challenging Roar', category: 'Strike', type: 'Social', cost: 1,
    power: 2, target: 'presence', keywords: ['Resonate'], member: 'knight',
    description: 'Assert dominance over the dungeon\'s will. Deal 2 presence. Resonate: +1P if Social played last round.' },

  // ── Empower (1) ──
  { name: 'Defensive Stance', category: 'Empower', type: 'Physical', cost: 1,
    empowerEffect: { advantage: true, addKeyword: 'Ward' }, member: 'knight',
    description: 'Plant feet and raise shield. Next Strike gains Advantage and Ward (+1 structure defense, 1 round).' },

  // ── Disrupt (1) ──
  { name: 'Shield Wall', category: 'Disrupt', type: 'Physical', cost: 1,
    disruptEffect: { disadvantage: true }, member: 'knight',
    description: 'Interpose the shield between dungeon and party. Opponent\'s next Strike has Disadvantage.' },

  // ── Counter (1) ──
  { name: 'Parry and Riposte', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: { resource: 'structure', amount: 1 }, member: 'knight',
    description: 'Deflect the blow and punish the opening. Remove condition. Chip 1 structure.' },

  // ── React (1) ──
  { name: 'Raise Shield', category: 'React', type: 'Physical', cost: 0,
    power: 2, member: 'knight',
    description: 'Iron-bound oak absorbs the impact. Contest with Power 2.' },

  // ── Reshape (1) ──
  { name: 'Second Wind', category: 'Reshape', type: 'Physical', cost: 1,
    reshapeEffect: {
      heal: [{ resource: 'vitality', amount: 2, target: 'self_member' }],
    }, member: 'knight',
    description: 'Grit teeth and push through the pain. Restore 2 vitality to self.' },
];
