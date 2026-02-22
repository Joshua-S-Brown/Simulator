/**
 * ENCOUNTER: The Hollow Siren's Grotto (Combined Format)
 *
 * A crystalline cavern where every surface is faceted and reflective.
 * Something that looks almost human hovers at the center — beautiful,
 * wrong. She slipped through when the dungeon tore the veil between
 * planes. She feeds on coherent thought. The crystals have learned her
 * song. Even if you could silence her, the room would keep singing.
 *
 * DUNGEON RESOURCES IN THIS ROOM:
 *   Structure = crystal formations (shatter them, degrade the acoustics, create silence)
 *   Veil = dimensional thinness that lets her exist (close the door, she flickers)
 *   Presence = the Siren's psychic footprint (push back, she contracts)
 *
 * PRIMARY WIN CON: Break (resolve destruction through psychic erosion)
 * SECONDARY: Panic (nerve from alien terror, identity dissolution)
 *
 * UNIQUE: Zero vitality Strikes. She doesn't touch you physically.
 *   She breaks your mind while your body stands perfectly still.
 *
 * COMBO LINES:
 *   1. Identity Erosion (Erode resolve) compounds over rounds → Panic threshold
 *   2. Harmonic Convergence (Empower) → The Unraveling (P3 resolve, Overwhelm→nerve)
 *   3. Prismatic Terror (nerve, Resonate) → back-to-back Mystical = amplifying fear
 *   4. Resonance Trap (Strike trigger) = hitting crystals feeds the song back at you
 *   5. Echoing Theft (Counter/steal) = turns the party's buffs into weapons
 *
 * DECK: 17 cards
 *   Energy: 5 | Strike: 4 | Empower: 1 | Disrupt: 1 | Counter: 2
 *   React: 2 | Trap: 1 | Reshape: 1
 */
export default {
  name: 'The Hollow Siren\'s Grotto',
  description: 'A crystalline cavern where every surface is faceted and reflective. Light has no clear source — the crystals glow from within, casting prismatic refractions that make depth perception impossible. At the center, something almost human hovers a foot above the ground. She is singing. She has been singing for a very long time.',
  initiative: 'visitor',
  autoEffects: [
    { resource: 'resolve', amount: -1, target: 'visitor', frequency: 'other' },
    { resource: 'nerve', amount: -1, target: 'visitor', frequency: 'other' },
    { resource: 'veil', amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Mystical', 'Psychic', 'Planar'],
  contributions: { structure: 4, veil: 5, presence: 4 },
  modifierContributions: {
    dominion: 0,
    resonance: 1,
    presence_attr: 0,
    memory: 1,
  },
  resourceContext: {
    structure: {
      name: 'Crystal Formations',
      attackVerb: 'shattering resonance crystals',
      lowDesc: 'Dead zones of silence spread across the cavern. The song has gaps now — moments where thought is possible.',
      criticalDesc: 'The cavern is dark and quiet. Shattered crystal dust covers the floor. The song has nowhere left to echo.',
    },
    veil: {
      name: 'Dimensional Thinness',
      attackVerb: 'sealing the boundary between planes',
      lowDesc: 'The Siren flickers like a candle in wind. Her form is translucent — you can see the wall through her.',
      criticalDesc: 'The boundary firms. She is fading, her edges dissolving. The door she came through is closing.',
    },
    presence: {
      name: 'The Siren\'s Psychic Reach',
      attackVerb: 'pushing back against her will',
      lowDesc: 'Her radius contracts. The song recedes from the edges of the room. She\'s losing her grip.',
      criticalDesc: 'She collapses inward — a last discordant note — and folds back through the veil. Silence.',
    },
  },
  aiContributions: {
    baseWeights: { Strike: 0.5, Empower: 0.4, Disrupt: 1, Counter: 0.7, Trap: 0.5, Offer: 0.5, Reshape: 0.6, React: 0.3, Test: 0.3, Energy: 0.5 },
    preferredTargets: ['resolve', 'nerve'],
    comboAwareness: 0.28,
    energyEagerness: 0.2,
    bondAffinity: 0.2,
    betrayalAffinity: 0.3,
  },

  deck: [

    // ═══ ENERGY (5) ═══
    { name: 'Crystal Resonance', category: 'Energy', type: 'Mystical', cost: 0, energyType: 'standard',
      energyGain: 1,
      description: 'The crystals pulse brighter as the song finds a new harmonic. The melody is adapting — finding the frequencies that match each listener\'s individual fears.' },
    { name: 'Psychic Well', category: 'Energy', type: 'Social', cost: 0, energyType: 'standard',
      energyGain: 1,
      description: 'The Siren draws power from the pool of confused thought filling the room. Every uncertain moment feeds her.' },
    { name: 'Harmonic Attunement', category: 'Energy', type: 'Mystical', cost: 0, energyType: 'attune',
      energyGain: 1, attune: { cardType: 'Mystical', discount: 1 },
      description: 'The song shifts key. Crystal formations along the east wall begin resonating at a frequency that makes the air shimmer. Next Mystical card costs 1 less.' },
    { name: 'Dissonance Spike', category: 'Energy', type: 'Mystical', cost: 0, energyType: 'surge',
      energyGain: 0, surgeGain: 2,
      description: 'Every crystal in the room screams the same note at once. A spike of pure sonic force that lasts two seconds and leaves ears ringing, thoughts scattered.' },
    { name: 'Doubt Siphon', category: 'Energy', type: 'Social', cost: 0, energyType: 'siphon',
      energyGain: 1, siphonFallback: 1,
      siphon: {
        condition: { type: 'resource_below', resource: 'resolve', pct: 0.5 },
        target: 'opponent',
      },
      description: 'Crumbling willpower is the Siren\'s favorite meal. She inhales doubt like perfume. +1 permanent if visitor resolve below half, else +1 temp.' },

    // ═══ STRIKES (4) — all resolve and nerve, zero vitality ═══
    // Chip: P2 resolve, Erode — doubt compounds
    { name: 'Identity Erosion', category: 'Strike', type: 'Social', cost: 1, power: 2,
      target: 'resolve', keywords: ['Erode'],
      description: 'The song strips a layer of self. The rogue forgets her mother\'s name for three seconds. It comes back — but the fact that it left is worse than if it hadn\'t. What else might she forget? Deal 2 resolve. Erode 1.' },
    // Chip: P2 nerve, Resonate — the crystals amplify fear
    { name: 'Prismatic Terror', category: 'Strike', type: 'Mystical', cost: 1, power: 2,
      target: 'nerve', keywords: ['Resonate'],
      description: 'The crystals refract the Siren\'s image into a dozen copies. They\'re all looking at you. They\'re all singing different notes. The harmonic dissonance triggers something primal — wrongness beyond articulation. Deal 2 nerve. Resonate: +1P if Mystical last round.' },
    // Threat: P3 resolve, bonus if nerve low — fear amplifies doubt
    { name: 'Absolute Conviction', category: 'Strike', type: 'Social', cost: 2, power: 3,
      target: 'resolve',
      trigger: {
        condition: { type: 'resource_below', resource: 'nerve', pct: 0.5 },
        bonus: 1,
        description: 'If nerve below half, +1 Power (fear makes the lies feel true)',
      },
      description: 'The Siren stops singing and speaks one sentence directly into your mind. It is a lie. It is the most convincing thing you have ever heard. The terrified mind cannot distinguish truth from fabrication. Deal 3 resolve. If nerve below half, deal 4.' },
    // Combo Finisher: P3 resolve, Overwhelm → nerve — the crescendo
    { name: 'The Unraveling', category: 'Strike', type: 'Mystical', cost: 2, power: 3,
      target: 'resolve', keywords: ['Overwhelm'], overwhelmTarget: 'nerve',
      description: 'The Siren opens her mouth wider than a mouth should open and the song becomes a weapon. Not sound — anti-meaning. The concept that you are a person comes apart. Overwhelm: what resolve can\'t absorb becomes raw panic. Deal 3 resolve. Excess spills to nerve.' },

    // ═══ EMPOWER (1) ═══
    { name: 'Harmonic Convergence', category: 'Empower', type: 'Mystical', cost: 2,
      empowerEffect: { advantage: true },
      description: 'Every crystal in the room aligns. Scattered refractions snap into a single beam focused on the party. The song builds to something structural — you can feel the air thicken with intent. This is the crescendo. Next Strike gains Advantage.' },

    // ═══ DISRUPT (1) ═══
    // Randomize target: the crystals scramble perception
    { name: 'Prismatic Confusion', category: 'Disrupt', type: 'Mystical', cost: 1,
      disruptEffect: { randomizeTarget: true },
      description: 'Light refracts through a hundred crystal faces at once. The Broodmother is behind you. No — the Warden. No — nothing is there. Where are the walls? The party can\'t tell what they\'re aiming at. Opponent\'s next Strike hits a random resource.' },

    // ═══ COUNTERS (2) ═══
    // Steal empower: the echoes learn the party's rhythm and turn it against them
    { name: 'Echoing Theft', category: 'Counter', type: 'Mystical', cost: 1,
      counterDamage: { resource: 'resolve', amount: 1 },
      counterEffect: { steal: true },
      description: 'The crystals record the party\'s preparation — the gathering of magical force, the focusing of intent — and play it back. Reversed. Their own power weaponized. Remove condition. Chip 1 resolve. Steal Empower for own use.' },
    // Standard counter: echo reflection + fortify veil
    { name: 'Crystal Ward', category: 'Counter', type: 'Mystical', cost: 1,
      counterDamage: { resource: 'nerve', amount: 1 },
      counterEffect: { applyFortify: 1, fortifyResource: 'veil' },
      description: 'The Siren raises a hand and the crystal nearest the attack hums at a canceling frequency. The party\'s preparation dissolves into noise. Remove condition. Chip 1 nerve. Fortify veil 1.' },

    // ═══ REACTS (2) ═══
    // Absorb: dimensional phase — she's partly not here
    { name: 'Phase Shift', category: 'React', type: 'Mystical', cost: 0, power: 2,
      reactEffect: { absorb: true, fortifyResource: 'veil', fortifyAmount: 1 },
      description: 'The blow passes through the Siren\'s torso and hits the crystal behind her. She wasn\'t fully there. For a moment you can see the other side through the hole in her chest before it closes. Contest Power 2. Fortify veil 1 regardless.' },
    // Reflect: the crystals bounce the attack back as psychic energy
    { name: 'Harmonic Reflection', category: 'React', type: 'Mystical', cost: 0, power: 1,
      reactEffect: { reflect: true },
      description: 'The attack strikes a crystal formation and the impact resonates through the room — amplified, distorted, fed back to the attacker as a wave of disorienting sound. Contest Power 1. On Devastating defense, reflect damage.' },

    // ═══ TRAP (1) ═══
    // Triggers on Strike: hitting the crystals feeds the song back at you
    { name: 'Resonance Trap', category: 'Trap', type: 'Mystical', cost: 1,
      trapTrigger: 'strike_played',
      trapEffect: [
        { damage: { resource: 'nerve', amount: 2 } },
      ],
      description: 'The crystals are acoustic amplifiers. Strike one and the vibration cascades through every faceted surface in the room, feeding back as a wall of distorted sound that hits the attacker hardest. When visitor Strikes, nerve -2.' },

    // ═══ RESHAPE (1) ═══
    { name: 'Crystal Regrowth', category: 'Reshape', type: 'Mystical', cost: 2,
      reshapeEffect: {
        heal: [{ resource: 'veil', amount: 2 }],
        fortify: [{ resource: 'structure', amount: 1 }],
      },
      description: 'New crystals push through the stone floor where old ones shattered. They hum immediately — the song teaches them before they finish forming. The room repairs its own voice. Heal 2 veil. Fortify structure 1.' },
  ],
};
