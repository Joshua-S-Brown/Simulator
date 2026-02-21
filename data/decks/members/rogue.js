/**
 * MEMBER DECK: Rogue (Standard Adventuring Company)
 * Role: Flex / Anti-Deception — 10 cards
 *
 * Primary: Veil Strikes + Traps + Counters
 * Strengths: Flash Bomb punishes deceptive Offers, Disarm Trap converts traps to trust, Sleight of Hand steals Empowers
 * Weaknesses: Lowest vitality (6), Flash Bomb useless vs non-deceptive, no healing/Fortify
 */
module.exports = [
  // ── Energy (2) ──
  { name: 'Quick Fingers', category: 'Energy', type: 'Physical', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'rogue',
    description: 'Nimble hands find purchase where others see smooth stone.' },

  { name: 'Shadow Sense', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'resource_below', target: 'opponent', resource: 'veil', pct: 0.5 }, target: 'opponent' },
    member: 'rogue',
    description: 'Thinning magic reveals hidden passages. +1 permanent if dungeon veil below half, else +1 temp.' },

  // ── Strikes (2) ──
  { name: 'Backstab', category: 'Strike', type: 'Physical', cost: 1,
    power: 2, target: 'veil', member: 'rogue',
    trigger: { condition: { type: 'resource_below', target: 'opponent', resource: 'presence', pct: 0.75 }, bonus: 2,
      description: 'Exploit Weakness: +2P if dungeon presence below 75%' },
    description: 'Strike where pride has already been shaken. Deal 2 veil. Exploit Weakness: +2P if presence below 75%.' },

  { name: 'Poisoned Blade', category: 'Strike', type: 'Environmental', cost: 1,
    power: 1, target: 'veil', keywords: ['Erode'], member: 'rogue',
    description: 'A nick that festers. Deal 1 veil. Erode: persistent magical decay next round.' },

  // ── Traps (2) ──
  { name: 'Tripwire', category: 'Trap', type: 'Environmental', cost: 1,
    trapTrigger: 'strike_played', member: 'rogue',
    trapEffect: {
      damage: { resource: 'presence', amount: 1 },
      applyCondition: { type: 'entangled' },
    },
    description: 'Set a cunning snare. When dungeon plays a Strike: deal 1 presence and Entangle. Sets up the party\'s combo line.' },

  { name: 'Flash Bomb', category: 'Trap', type: 'Environmental', cost: 1,
    trapTrigger: 'offer_accepted', member: 'rogue',
    trapEffect: {
      damage: { resource: 'nerve', amount: 2 },
    },
    description: 'A blinding burst rigged to a suspicious gift. When an Offer is accepted: deal 2 nerve. Punishes deceptive dungeons at their own game.' },

  // ── Counters (2) ──
  { name: 'Sleight of Hand', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: { resource: 'presence', amount: 0 },
    counterEffect: { stealEmpower: true },
    member: 'rogue',
    description: 'Pluck the enchantment from the air and claim it. Remove Empower from dungeon — gain it for the party.' },

  { name: 'Disarm Trap', category: 'Counter', type: 'Environmental', cost: 1,
    counterDamage: { resource: 'structure', amount: 0 },
    counterEffect: { trapBonus: { resource: 'trust', amount: 2 } },
    member: 'rogue',
    description: 'Spot the trap and defuse it with care. Remove condition. If a Trap was removed: +2 trust (the party sees through the deception).' },

  // ── Disrupt (1) ──
  { name: 'Smoke Screen', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { randomTarget: true }, member: 'rogue',
    description: 'Fill the room with blinding smoke. Opponent\'s next Strike targets a random resource instead of chosen.' },

  // ── React (1) ──
  { name: 'Evasion', category: 'React', type: 'Physical', cost: 0,
    power: 1, member: 'rogue',
    reactEffect: { conditionalPower: { condition: 'self_resource_above_half', resource: 'nerve', power: 3 } },
    description: 'Dodge into shadow when the blow comes. Power 1. If party nerve above half, Power 3.' },
];
