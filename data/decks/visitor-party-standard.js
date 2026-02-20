/**
 * PARTY DECK: The Standard Adventuring Company (v2.6b)
 * Combined 40-card deck from 4 members: Knight, Battlemage, Cleric, Rogue
 * 
 * This is the assembled party deck used by the encounter engine.
 * Individual member files exist for design reference; this file is what
 * the simulator loads.
 * 
 * v2.6b CHANGES:
 * [FIX] Divine Ward: alwaysFortify → absorb: true (engine checks `absorb`,
 *       not `alwaysFortify`; Fortify-on-React was silently doing nothing)
 * 
 * CARD DISTRIBUTION (40 cards):
 *   Energy:  10 (25%)  — Standard ×4, Surge ×2, Attune ×2, Siphon ×2
 *   Strike:   9 (22.5%) — structure ×3, veil ×3, presence ×2, presence(social) ×1
 *   Empower:  2 (5%)   — Knight defensive, Battlemage offensive
 *   Disrupt:  4 (10%)  — Shield Wall, Counterspell, Hex, Smoke Screen
 *   Counter:  4 (10%)  — Parry, Purifying Light, Sleight of Hand, Disarm Trap
 *   React:    4 (10%)  — one per member
 *   Trap:     2 (5%)   — Tripwire (Entangle), Flash Bomb (anti-deception)
 *   Offer:    1 (2.5%) — Peaceful Parley
 *   Test:     1 (2.5%) — Leap of Faith
 *   Reshape:  3 (7.5%) — Second Wind, Healing Word, Fortify Spirit
 * 
 * TARGET SPREAD (Strikes only):
 *   structure: 3 (Shield Bash, Righteous Blow, Shatter Point)
 *   veil:      3 (Arcane Bolt, Chain Lightning, Backstab)
 *   presence:  2 (Challenging Roar, Holy Light)
 *   veil(erode): 1 (Poisoned Blade)
 * 
 * CROSS-MEMBER COMBOS:
 *   Knight Shield Bash (Entangle) → Battlemage Chain Lightning (+2P)
 *   Rogue Tripwire (Entangle on strike) → Battlemage Chain Lightning (+2P)
 *   Battlemage Hex (veil thorns) → deters dungeon strikes → protects party
 *   Rogue Flash Bomb (nerve dmg on offer) → punishes deceptive Offers
 *   Rogue Disarm Trap (+2 trust) → converts traps into Bond progress
 *   Rogue Sleight of Hand (steal Empower) → steals dungeon buffs
 *   Cleric Healing Word → restore downed members (3 energy, signature)
 *   Battlemage Spell Amplification (+2P, Overwhelm) → any Strike becomes burst
 *   Knight Defensive Stance (Advantage + Ward) → safe aggression turn
 * 
 * ENERGY BUDGET ANALYSIS:
 *   10 Energy cards in 40 = 25% (target: 25-35% for party decks)
 *   Drawing 2/round from 40-card deck: ~50% chance of Energy card per draw
 *   Standard ×4 provides reliable growth; Surge ×2 enables burst turns
 *   Attune[Mystical] discounts Battlemage; Attune[Social] discounts Cleric
 *   Siphon ×2 rewards winning (veil < 50%) and cooperating (rapport > 3)
 *   Average action cost: 1.17 energy — sustainable at 3+ pool
 *   Expensive plays: Healing Word (3), Righteous Blow (2), Chain Lightning (2), Shatter Point (2)
 *   Cheap plays: All Reacts (0), Poisoned Blade (1), Shield Bash (1)
 */
module.exports = [

  // ═══════════════════════════════════════════════════════════
  // KNIGHT — Tank / Setup (10 cards)
  // ═══════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════
  // BATTLEMAGE — DPS / Control (10 cards)
  // ═══════════════════════════════════════════════════════════

  // ── Energy (3) ──
  { name: 'Arcane Focus', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'battlemage',
    description: 'Center the mind and draw from the ley lines. Steady arcane power.' },

  { name: 'Mana Surge', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'surge', energyGain: 0, surgeGain: 2, member: 'battlemage',
    description: 'Crack open the reserves for a single devastating volley. Burns bright, burns fast.' },

  { name: 'Elemental Attunement', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Mystical', discount: 1 }, member: 'battlemage',
    description: 'Align with the Veil\'s frequency. +1 energy. Next Mystical card costs 1 less.' },

  // ── Strikes (3) ──
  { name: 'Arcane Bolt', category: 'Strike', type: 'Mystical', cost: 1,
    power: 2, target: 'veil', keywords: ['Erode'], member: 'battlemage',
    description: 'A focused lance of raw magic that frays the Veil. Deal 2 veil. Erode: 1 persistent bleed next round.' },

  { name: 'Chain Lightning', category: 'Strike', type: 'Mystical', cost: 2,
    power: 3, target: 'veil', member: 'battlemage',
    trigger: { condition: { type: 'has_condition', condition: 'entangled' }, bonus: 2,
      description: 'Conductor: +2P if opponent is Entangled' },
    description: 'Arcing electricity seeks grounded targets. Deal 3 veil. Conductor: +2P if opponent is Entangled.' },

  { name: 'Shatter Point', category: 'Strike', type: 'Mystical', cost: 2,
    power: 2, target: 'structure', member: 'battlemage',
    trigger: { condition: { type: 'resource_below', target: 'opponent', resource: 'structure', pct: 0.5 }, bonus: 2,
      description: 'Finishing Blow: +2P if dungeon structure below half' },
    description: 'Identify the fracture line and strike with precision. Deal 2 structure. Finishing Blow: +2P if structure below half.' },

  // ── Empower (1) ──
  { name: 'Spell Amplification', category: 'Empower', type: 'Mystical', cost: 1,
    empowerEffect: { powerBonus: 2, addKeyword: 'Overwhelm' }, member: 'battlemage',
    description: 'Layer enchantments for maximum devastation. Next Strike gains +2 Power and Overwhelm.' },

  // ── Disrupts (2) ──
  { name: 'Counterspell', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { stripKeywords: true }, member: 'battlemage',
    description: 'Unravel the enchantment before it lands. Strip all keywords from opponent\'s next Strike.' },

  { name: 'Hex', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { disadvantage: false, onStrike: { selfDamage: { resource: 'veil', amount: 1 } } }, member: 'battlemage',
    description: 'Curse the dungeon — every act of violence drains its magic. Opponent takes 1 veil when next striking.' },

  // ── React (1) ──
  { name: 'Arcane Shield', category: 'React', type: 'Mystical', cost: 0,
    power: 1, member: 'battlemage',
    reactEffect: { conditionalPower: { condition: 'self_resource_above_half', resource: 'nerve', power: 3 } },
    description: 'A shimmering barrier fueled by steady nerves. Power 1. If party nerve above half, Power 3.' },

  // ═══════════════════════════════════════════════════════════
  // CLERIC — Support / Bond Path (10 cards)
  // ═══════════════════════════════════════════════════════════

  // ── Energy (3) ──
  { name: 'Prayer of Devotion', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'cleric',
    description: 'Quiet words to a distant god. Steady faith, steady power.' },

  { name: 'Sacred Rites', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Social', discount: 1 }, member: 'cleric',
    description: 'Ritual invocation channels divine favor. +1 energy. Next Social card costs 1 less.' },

  { name: 'Faith\'s Wellspring', category: 'Energy', type: 'Social', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: { condition: { type: 'resource_above', resource: 'rapport', threshold: 3 }, target: 'opponent' },
    member: 'cleric',
    description: 'Draw strength from growing mutual understanding. +1 permanent if rapport > 3, else +1 temp.' },

  // ── Strike (1) ──
  { name: 'Holy Light', category: 'Strike', type: 'Social', cost: 1,
    power: 2, target: 'presence', member: 'cleric',
    trigger: { condition: { type: 'resource_above', target: 'self', resource: 'trust', threshold: 4 }, bonus: 0,
      description: 'Merciful: if trust > 4, gain Ward after striking',
      onTrigger: { addKeyword: 'Ward' } },
    description: 'Divine radiance tests the dungeon\'s will. Deal 2 presence. Merciful: gain Ward if trust > 4.' },

  // ── Reshapes (2) ──
  { name: 'Healing Word', category: 'Reshape', type: 'Social', cost: 3,
    reshapeEffect: {
      restoreMember: true,
      heal: [{ resource: 'vitality', amount: 4, target: 'select_member' }],
    }, member: 'cleric',
    description: 'Speak life back into fallen flesh. Restore a downed ally at 4 vitality, or heal an active ally by 4. Expensive but irreplaceable.' },

  { name: 'Fortify Spirit', category: 'Reshape', type: 'Social', cost: 1,
    reshapeEffect: {
      fortify: { resource: 'resolve', reduction: 1, duration: 2 },
    }, member: 'cleric',
    description: 'Steel the party\'s will against despair. Fortify resolve: reduce Break damage by 1 for 2 rounds.' },

  // ── Offer (1) ──
  { name: 'Peaceful Parley', category: 'Offer', type: 'Social', cost: 1,
    target: 'trust',
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
      { resource: 'nerve', amount: 1, target: 'opponent' },
    ], member: 'cleric',
    description: 'Extend an open hand and speak without guile. Accept: build mutual trust and soothe the dungeon\'s fear.' },

  // ── Test (1) ──
  { name: 'Leap of Faith', category: 'Test', type: 'Social', cost: 1,
    target: 'trust',
    testReward: { trust: 2, rapport: 2 },
    defectPenalty: { trustCrash: 0.5, powerGain: 2 },
    exposureCost: { resource: 'resolve', amount: 1 },
    member: 'cleric',
    description: 'Lower all defenses and trust the darkness. Cooperate: +2 trust, +2 rapport, lose 1 resolve. Defect: trust crashes, defector empowered.' },

  // ── Counter (1) ──
  { name: 'Purifying Light', category: 'Counter', type: 'Social', cost: 1,
    counterDamage: { resource: 'presence', amount: 0 },
    counterEffect: { healLowest: 1 },
    member: 'cleric',
    description: 'Cleanse the corruption and mend what it touched. Remove condition. Restore 1 to party\'s lowest reducer. No chip damage.' },

  // ── React (1) ──
  // v2.6b FIX: alwaysFortify → absorb (engine checks reactEffect.absorb)
  { name: 'Divine Ward', category: 'React', type: 'Social', cost: 0,
    power: 1, member: 'cleric',
    reactEffect: { absorb: true, fortifyAmount: 1 },
    description: 'A prayer answered in the nick of time. Contest Power 1. Gain Fortify 1 regardless of outcome.' },

  // ═══════════════════════════════════════════════════════════
  // ROGUE — Flex / Anti-Deception (10 cards)
  // ═══════════════════════════════════════════════════════════

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