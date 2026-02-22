/**
 * ENCOUNTER: The Construct's Forge (Combined Format)
 *
 * A working forge, impossibly active. Bellows pump with no hands. Metal
 * glows in crucibles. The Forge Warden — seven feet of molten iron and
 * purpose — attends its anvil. It was a smith once, before the dungeon
 * fused it with its workshop. Now it is the room and the room is it.
 *
 * DUNGEON RESOURCES IN THIS ROOM:
 *   Structure = forge infrastructure (anvil, bellows, crucibles, stone hearth)
 *   Veil = enchantments keeping the forge running (runes, animated weapons)
 *   Presence = the Warden's physical coherence (cool it, break it, it collapses)
 *
 * PRIMARY WIN CON: Kill (vitality from hammer strikes, thrown slag, forge heat)
 * SECONDARY: Break (resolve from relentless mechanical pressure — it doesn't tire)
 *
 * COMBO LINES:
 *   1. Slag Throw (Erode) → Hammer of Making (Resonate Physical +1P) = attrition into burst
 *   2. Master Stroke (Empower/Advantage) → Hammer of Making = devastating finisher
 *   3. Chain Snare (Counter/Entangle) → Hammer of Making (+1P if Entangled) = punish→kill
 *   4. Forge Eruption (Trap) + Blade Tempest (Disrupt) = aggression punished from both angles
 *
 * DECK: 17 cards
 *   Energy: 5 | Strike: 4 | Empower: 1 | Disrupt: 1 | Counter: 2
 *   React: 2 | Trap: 1 | Reshape: 1
 */
export default {
  name: 'The Construct\'s Forge',
  description: 'A working forge, impossibly active — bellows pumping with no hands, metal glowing in crucibles, hammer strikes ringing from an anvil attended by something made of slag and flame. The Forge Warden. Seven feet of molten iron and purpose. It doesn\'t speak. It makes.',
  initiative: 'dungeon',
  autoEffects: [
    { resource: 'vitality', amount: -1, target: 'visitor', frequency: 'other' },
    { resource: 'structure', amount: -1, target: 'dungeon', frequency: 'other' },
    { resource: 'veil', amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Physical', 'Construct', 'Fire'],
  contributions: { structure: 6, veil: 4, presence: 4 },
  modifierContributions: {
    dominion: 1,
    resonance: 0,
    presence_attr: 0,
    memory: 1,
  },
  resourceContext: {
    structure: {
      name: 'Forge Infrastructure',
      attackVerb: 'smashing forge equipment',
      lowDesc: 'The bellows stutter. A crucible cracks, leaking molten metal across the floor. The anvil lists sideways.',
      criticalDesc: 'The forge is wrecked. Crucibles shattered, bellows torn, runes dark. The Warden has no tools left.',
    },
    veil: {
      name: 'Forge Enchantments',
      attackVerb: 'disrupting the rune sequences',
      lowDesc: 'Animated weapons clatter to the floor, suddenly just metal. The fire dims to embers.',
      criticalDesc: 'Every rune is dark. The forge is cold iron and dead stone. Nothing moves but the Warden itself.',
    },
    presence: {
      name: 'The Forge Warden',
      attackVerb: 'breaking the construct apart',
      lowDesc: 'Slag weeps from cracks in its torso. Joints seize. It leans on the ruined anvil for support.',
      criticalDesc: 'The Warden collapses — eight hundred pounds of cooling metal folding in on itself. The hammer falls last.',
    },
  },
  aiContributions: {
    baseWeights: { Strike: 0.9, Empower: 1, Disrupt: 0.3, Counter: 0.4, Trap: 0.4, Offer: 0, Reshape: 0.8, React: 0.5, Test: 0, Energy: 0.7 },
    preferredTargets: ['vitality', 'resolve'],
    comboAwareness: 0.35,
    energyEagerness: 0.3,
    bondAffinity: 0,
    betrayalAffinity: 0,
  },

  deck: [

    // ═══ ENERGY (5) ═══
    { name: 'Stoke the Forge', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'standard',
      energyGain: 1,
      description: 'The Warden drives the bellows with one massive arm. Cinders float upward. Temperature rises. The room becomes its weapon.' },
    { name: 'Crucible Heat', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'standard',
      energyGain: 1,
      description: 'Molten metal churns in the stone basins. Each crucible is a reservoir of liquid violence waiting to be directed.' },
    { name: 'Runic Resonance', category: 'Energy', type: 'Physical', cost: 0, energyType: 'attune',
      energyGain: 1, attune: { cardType: 'Physical', discount: 1 },
      description: 'The runes along the forge walls pulse in sequence — ancient smithing enchantments aligning with the Warden\'s rhythm. Next Physical card costs 1 less.' },
    { name: 'Forge Blast', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'surge',
      energyGain: 0, surgeGain: 2,
      description: 'A crucible overflows. Liquid iron hits the stone floor and the whole room flashes white. A burst of raw thermal energy — brief and blinding.' },
    { name: 'Heat Siphon', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'siphon',
      energyGain: 1, siphonFallback: 1,
      siphon: {
        condition: { type: 'resource_below', resource: 'vitality', pct: 0.5 },
        target: 'opponent',
      },
      description: 'The Warden absorbs heat from cooling blood on the floor. Wounded visitors fuel the forge. +1 permanent if visitor vitality below half, else +1 temp.' },

    // ═══ STRIKES (4) ═══
    // Chip: P2 vitality, Erode — slag burns underneath armor
    { name: 'Slag Throw', category: 'Strike', type: 'Physical', cost: 1, power: 2,
      target: 'vitality', keywords: ['Erode'],
      description: 'The Warden scoops molten metal from a crucible barehanded and hurls it. It spatters across shield and armor, cooling into a crust that keeps burning underneath. Deal 2 vitality. Erode 1.' },
    // Chip: P2 resolve, Resonate — the relentless rhythm breaks will
    { name: 'Anvil Ring', category: 'Strike', type: 'Physical', cost: 1, power: 2,
      target: 'resolve', keywords: ['Resonate'],
      description: 'The Warden strikes the anvil — not at you, at the anvil. The ring is deafening and it doesn\'t stop. The vibration enters your teeth, your skull. It is a sound that says: I will never tire. Deal 2 resolve. Resonate: +1P if Physical last round.' },
    // Threat: P3 vitality, bonus if Entangled — pinned by chains, the hammer falls
    { name: 'Hammer of Making', category: 'Strike', type: 'Physical', cost: 2, power: 3,
      target: 'vitality',
      trigger: {
        condition: { type: 'has_condition', condition: 'entangled' },
        bonus: 1,
        description: 'If Entangled (chained to the anvil), +1 Power',
      },
      description: 'A single, perfect strike — the same motion the Warden uses to shape metal, aimed at a person. Centuries of craft behind eight hundred pounds of purpose. The impact rings through the floor. Deal 3 vitality. If chained, deal 4.' },
    // Secondary: P3 resolve, Overwhelm → nerve — the heat and pressure compound
    { name: 'Furnace Breath', category: 'Strike', type: 'Environmental', cost: 2, power: 3,
      target: 'resolve', keywords: ['Overwhelm'], overwhelmTarget: 'nerve',
      description: 'The Warden opens a vent in its chest and exhales forge heat directly at the party. Not fire — superheated air that makes thought impossible. Will crumbles, and what\'s left is animal panic. Deal 3 resolve. Overwhelm: excess spills to nerve.' },

    // ═══ EMPOWER (1) ═══
    { name: 'Master Stroke', category: 'Empower', type: 'Physical', cost: 2,
      empowerEffect: { advantage: true },
      description: 'The Warden raises its hammer and holds it there. The forge roars. Every weapon on the wall vibrates in sympathetic resonance. The room holds its breath. Whatever comes next will be shaped by centuries of craft. Next Strike gains Advantage.' },

    // ═══ DISRUPT (1) ═══
    // Disadvantage: animated weapons create a steel storm
    { name: 'Blade Tempest', category: 'Disrupt', type: 'Physical', cost: 1,
      disruptEffect: { disadvantage: true },
      description: 'Three unfinished swords rip free of their wall mounts and orbit the Warden in a defensive storm of spinning steel. Try to get close and you\'re flinching through a blender. Opponent\'s next Strike at Disadvantage.' },

    // ═══ COUNTERS (2) ═══
    // Anvil block: the Warden catches the blow on the anvil + chains wrap around
    { name: 'Chain Snare', category: 'Counter', type: 'Physical', cost: 1,
      counterDamage: { resource: 'vitality', amount: 1 },
      counterEffect: { applyEntangle: true },
      description: 'The Warden catches the incoming blow on the anvil face with a clang that shakes the room. Before the attacker can pull back, forge chains whip around their weapon arm. You\'re chained to the anvil now. Remove condition. Chip 1 vitality. Entangle.' },
    // Forge armor: the Warden shapes its own body + fortify
    { name: 'Reforged Plate', category: 'Counter', type: 'Physical', cost: 1,
      counterDamage: { resource: 'resolve', amount: 1 },
      counterEffect: { applyFortify: 1, fortifyResource: 'structure' },
      description: 'The blow lands and the Warden barely notices. It reaches to the wound, pulls molten metal from its own core, and patches the dent. Watching a construct repair itself mid-combat is deeply disheartening. Remove condition. Chip 1 resolve. Fortify structure 1.' },

    // ═══ REACTS (2) ═══
    // Absorb: the Warden shapes a shield from the anvil
    { name: 'Anvil Guard', category: 'React', type: 'Physical', cost: 0, power: 2,
      reactEffect: { absorb: true, fortifyResource: 'structure', fortifyAmount: 1 },
      description: 'The Warden rips a plate of hot iron from the anvil surface and interposes it. The metal deforms on impact, absorbing force. It\'ll be reshaped and used again before the round is over. Contest Power 2. Fortify structure 1 regardless.' },
    // Reflect: molten splash on contact
    { name: 'Molten Splash', category: 'React', type: 'Environmental', cost: 0, power: 1,
      reactEffect: { reflect: true },
      description: 'The blow connects and the Warden\'s body ruptures at the impact point — but what sprays out is liquid iron. The attacker recoils, slag burning through gloves. Contest Power 1. On Devastating defense, reflect damage.' },

    // ═══ TRAP (1) ═══
    // Triggers on Strike: the forge erupts when disturbed
    { name: 'Forge Eruption', category: 'Trap', type: 'Environmental', cost: 1,
      trapTrigger: 'strike_played',
      trapEffect: [
        { damage: { resource: 'vitality', amount: 2 } },
      ],
      description: 'The forge is pressurized. Strike the wrong surface and a geyser of sparks and molten droplets erupts from a seam in the stone. When visitor Strikes, vitality -2.' },

    // ═══ RESHAPE (1) ═══
    { name: 'Self-Repair', category: 'Reshape', type: 'Physical', cost: 2,
      reshapeEffect: {
        heal: [{ resource: 'structure', amount: 2 }],
        fortify: [{ resource: 'presence', amount: 1 }],
      },
      description: 'The Warden pauses, pulls a white-hot ingot from the crucible, and presses it against its own damaged torso. Metal flows like water, filling cracks and sealing joints. It straightens. It is whole again. Heal 2 structure. Fortify presence 1.' },
  ],
};
