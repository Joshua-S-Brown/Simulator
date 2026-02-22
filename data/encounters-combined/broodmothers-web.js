/**
 * ENCOUNTER: The Broodmother's Web (Combined Format)
 *
 * A cavern strung with webs thick as rope. Hundreds of pale spiders click
 * and shift across the ceiling. At the center, the Broodmother hangs —
 * ancient, intelligent, territorial. The webs are her nervous system.
 * She feels every vibration, every heartbeat.
 *
 * DUNGEON RESOURCES IN THIS ROOM:
 *   Structure = the web architecture (cut strands, collapse sections)
 *   Veil = the pheromone cloud (dispel it, brood loses coordination)
 *   Presence = the Broodmother herself (hurt her enough, she retreats)
 *
 * PRIMARY WIN CON: Kill (vitality through venom, swarming, constriction)
 * SECONDARY: Panic (nerve from arachnophobic horror, being swarmed)
 *
 * COMBO LINES:
 *   1. Cold Embrace (Entangle) → Venom Fang (+1P if Entangled, Drain)
 *   2. Broodmother's Command (Empower/Advantage) → Venom Fang = devastating burst
 *   3. Webline Snare (Trap) punishes aggression → Swarming Bite follows up
 *   4. Thorned Broodlings (Disrupt/Thorns) punishes reckless Strikes
 *
 * DECK: 17 cards
 *   Energy: 5 | Strike: 4 | Empower: 1 | Disrupt: 1 | Counter: 2
 *   React: 2 | Trap: 1 | Reshape: 1
 */
module.exports = {
  name: 'The Broodmother\'s Web',
  description: 'A cavern strung with webs thick as rope. Hundreds of pale spiders the size of dogs click and shift across the ceiling. At the center, the Broodmother hangs — ancient, intelligent, territorial. She communicates through vibration and pheromone. The webs are her nervous system. She feels every footstep, every heartbeat.',
  initiative: 'dungeon',
  autoEffects: [
    { resource: 'vitality', amount: -1, target: 'visitor', frequency: 'other' },
    { resource: 'nerve', amount: -1, target: 'visitor', frequency: 'other' },
    { resource: 'structure', amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Physical', 'Natural', 'Creature'],
  contributions: { structure: 6, veil: 3, presence: 5 },
  modifierContributions: {
    dominion: 1,
    resonance: 0,
    presence_attr: 1,
    memory: 0,
  },
  resourceContext: {
    structure: {
      name: 'The Web Network',
      attackVerb: 'cutting through anchor strands',
      lowDesc: 'Sections of web-ceiling sag. Broodlings tumble from their perches, skittering in confusion.',
      criticalDesc: 'The web architecture is collapsing. Tunnels are exposed overhead. Escape routes open.',
    },
    veil: {
      name: 'Pheromone Cloud',
      attackVerb: 'burning away the chemical fog',
      lowDesc: 'Broodlings stumble into each other, suddenly uncoordinated. The swarm is just individual spiders now.',
      criticalDesc: 'The air is clear. Without the pheromone network, the brood scatters into crevices, purposeless.',
    },
    presence: {
      name: 'The Broodmother',
      attackVerb: 'driving her back',
      lowDesc: 'She retreats up her central line, favoring a wounded leg. The clicking softens.',
      criticalDesc: 'She abandons the chamber, dragging egg sacs into the dark tunnels behind her.',
    },
  },
  deck: [

    // ═══ ENERGY (5) ═══
    { name: 'Brood Frenzy', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'standard',
      energyGain: 1,
      description: 'The Broodmother floods the web with pheromone. The swarm chittering intensifies — hundreds of legs scraping silk in unison.' },
    { name: 'Web Tension', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'standard',
      energyGain: 1,
      description: 'She tightens the anchor lines. The whole network vibrates, storing potential energy like a drawn bowstring.' },
    { name: 'Silk Attunement', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'attune',
      energyGain: 1, attune: { cardType: 'Environmental', discount: 1 },
      description: 'The Broodmother presses a forelimb to the central strand and listens. The web tells her everything. Next Environmental card costs 1 less.' },
    { name: 'Hunting Surge', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'surge',
      energyGain: 0, surgeGain: 2,
      description: 'Her eyes lock on wounded prey. Every spider in the room orients at once — a single unified predatory focus that lasts only seconds.' },
    { name: 'Venom Siphon', category: 'Energy', type: 'Environmental', cost: 0, energyType: 'siphon',
      energyGain: 1, siphonFallback: 1,
      siphon: {
        condition: { type: 'resource_below', resource: 'vitality', pct: 0.5 },
        target: 'opponent',
      },
      description: 'The brood tastes blood on the web. Weakened prey feeds the colony\'s hunger. +1 permanent if visitor vitality below half, else +1 temp.' },

    // ═══ STRIKES (4) ═══
    // Chip: P2 vitality, Entangle — broodlings web a target for the queen
    { name: 'Cold Embrace', category: 'Strike', type: 'Physical', cost: 1, power: 2,
      target: 'vitality', keywords: ['Entangle'],
      description: 'A dozen broodlings descend on silk lines and wrap the target in layers of webbing. Each strand is thin but there are so many. The silk tightens. Movement stops. Deal 2 vitality. Entangle.' },
    // Chip: P2 nerve — the horror of being swarmed
    { name: 'Swarming Bite', category: 'Strike', type: 'Physical', cost: 1, power: 2,
      target: 'nerve', keywords: ['Erode'],
      description: 'They pour over the frontline in a pale chittering wave — not large enough to wound deeply but everywhere at once. In hair. Under armor. Between fingers. Deal 2 nerve. Erode 1.' },
    // Threat: P3 vitality, bonus if Entangled — the setup pays off
    { name: 'Venom Fang', category: 'Strike', type: 'Physical', cost: 2, power: 3,
      target: 'vitality', keywords: ['Drain'],
      drain: { resource: 'presence' },
      trigger: {
        condition: { type: 'has_condition', condition: 'entangled' },
        bonus: 1,
        description: 'If Entangled, +1 Power (can\'t dodge the queen)',
      },
      description: 'The Broodmother descends on her own silk — fast, surgical, one massive fang piercing armor at the joint. She feeds, and her presence in the room grows. Deal 3 vitality. If Entangled, deal 4. Drain: damage heals presence.' },
    // Secondary threat: P3 nerve, Overwhelm → vitality
    { name: 'Skittering Swarm', category: 'Strike', type: 'Physical', cost: 2, power: 3,
      target: 'nerve', keywords: ['Overwhelm'], overwhelmTarget: 'vitality',
      description: 'The ceiling moves. All of it. Every broodling drops at once in a living rain of legs and fangs. The sheer horror is the primary weapon — but the bites add up. Deal 3 nerve. Overwhelm: excess spills to vitality.' },

    // ═══ EMPOWER (1) ═══
    { name: 'Broodmother\'s Command', category: 'Empower', type: 'Environmental', cost: 2,
      empowerEffect: { advantage: true },
      description: 'She vibrates the entire web at a frequency that means hunt. Every spider in the room stops, turns, and orients on a single target. The party can see the setup happening — all those eyes turning in unison. Next Strike gains Advantage.' },

    // ═══ DISRUPT (1) ═══
    // Thorns: broodlings coat the target — attacking them means crushing spiders onto yourself
    { name: 'Thorned Broodlings', category: 'Disrupt', type: 'Physical', cost: 1,
      disruptEffect: {
        onStrike: { selfDamage: { resource: 'vitality', amount: 1 } },
      },
      description: 'Broodlings crawl over the party\'s weapons and arms. To swing a sword means crushing them — and their dying reflex is to bite. Thorns: opponent takes 1 vitality when next striking.' },

    // ═══ COUNTERS (2) ═══
    // Web absorbs the blow + Entangle
    { name: 'Web Catch', category: 'Counter', type: 'Environmental', cost: 1,
      counterDamage: { resource: 'vitality', amount: 1 },
      counterEffect: { applyEntangle: true },
      description: 'The attack lands — but the web absorbs the impact, stretching like a net. And now the blade is tangled in silk, and more silk is wrapping the arm that holds it. Remove condition. Chip 1 vitality. Entangle.' },
    // Cocoon defense + fortify structure (web repairs around the wound)
    { name: 'Cocooning Reflex', category: 'Counter', type: 'Environmental', cost: 1,
      counterDamage: { resource: 'nerve', amount: 1 },
      counterEffect: { applyFortify: 1, fortifyResource: 'structure' },
      description: 'Silk erupts from every anchor point near the impact, wrapping the damaged section in fresh webbing before the blow fully lands. The web heals itself. Remove condition. Chip 1 nerve. Fortify structure 1.' },

    // ═══ REACTS (2) ═══
    // Absorb: web cushions + fortify structure
    { name: 'Silk Curtain', category: 'React', type: 'Environmental', cost: 0, power: 2,
      reactEffect: { absorb: true, fortifyResource: 'structure', fortifyAmount: 1 },
      description: 'Layers of web drop between the attacker and the Broodmother like a theater curtain — each layer slowing the blow, absorbing force, buying time. Contest Power 2. Fortify structure 1 regardless.' },
    // Reflect: broodling throws itself into the blow
    { name: 'Sacrificial Drone', category: 'React', type: 'Physical', cost: 0, power: 1,
      reactEffect: { reflect: true },
      description: 'A broodling hurls itself into the path of the attack, exploding on impact. Its venom sac ruptures outward. Contest Power 1. On Devastating defense, reflect damage — the venom hits the attacker.' },

    // ═══ TRAP (1) ═══
    // Triggers on Strike: hidden web tripwires
    { name: 'Webline Snare', category: 'Trap', type: 'Environmental', cost: 1,
      trapTrigger: 'strike_played',
      trapEffect: [
        { applyEntangle: true },
        { damage: { resource: 'vitality', amount: 1 } },
      ],
      description: 'Nearly invisible silk tripwires strung across the approach. Lunge to attack and your legs tangle, momentum carries you forward into a faceful of web. When visitor Strikes, Entangle + 1 vitality.' },

    // ═══ RESHAPE (1) ═══
    { name: 'Web Reconstruction', category: 'Reshape', type: 'Environmental', cost: 2,
      reshapeEffect: {
        heal: [{ resource: 'structure', amount: 2 }],
        fortify: [{ resource: 'structure', amount: 1 }],
      },
      description: 'The Broodmother works through the night shift — spinnerets blazing, anchor lines replaced, damaged sections rebuilt stronger than before. Heal 2 structure. Fortify structure 1.' },
  ],
};
