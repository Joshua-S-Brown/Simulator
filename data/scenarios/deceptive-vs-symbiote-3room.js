/**
 * SCENARIO: Deceptive Dungeon vs Drift Symbiote (3-Room)
 * 
 * Full deceptive arc: Honeytrap → Physical closer → Terror closer
 * 
 * Tests whether accumulated Trap damage from Room 1 enables diverse win
 * conditions in Rooms 2-3. The Symbiote enters Room 2 with softened vitality,
 * resolve, AND nerve from the three Trap types. Room 2 (Root Hollow) pushes
 * Kill. Room 3 (Veil Breach) pushes Panic on whatever nerve remains.
 * 
 * Compare against the 2-room variant to see if the extra room produces
 * meaningful Break/Panic rates that the 2-room version lacks.
 * 
 * RUN:
 *   node run.js -n 1000 --json -s data/scenarios/deceptive-vs-symbiote-3room -d deceptive -v cooperative
 *   node run.js -n 1000 --json -s data/scenarios/deceptive-vs-symbiote-3room -d nurturing -v cooperative
 */
const honeyedHollow = require('../encounters/honeyed-hollow');
const rootHollow = require('../encounters/root-hollow');
const veilBreach = require('../encounters/veil-breach');
const deckHoneyed = require('../decks/dungeon-honeyed-hollow');
const deckRootHollow = require('../decks/dungeon-root-hollow');
const deckVeilBreach = require('../decks/dungeon-veil-breach');
const visitorDeck = require('../decks/visitor-drift-symbiote');
const symbiote = require('../visitors/drift-symbiote');
const dungeon = require('../dungeon-verdant-maw');

module.exports = {
  name: 'Deceptive Dungeon vs Drift Symbiote (3-Room)',
  description: 'Honeytrap (8 rnd cap) → Root Hollow (kill) → Veil Breach (panic). Full deceptive arc.',
  visitorTemplate: symbiote,
  dungeonTemplate: dungeon,
  encounters: [
    { encounter: honeyedHollow, dungeonDeck: deckHoneyed, visitorDeck: visitorDeck,
      config: { bondThreshold: 12, maxRounds: 8 } },
    { encounter: rootHollow, dungeonDeck: deckRootHollow, visitorDeck: visitorDeck,
      config: { bondThreshold: 12 } },
    { encounter: veilBreach, dungeonDeck: deckVeilBreach, visitorDeck: visitorDeck,
      config: { bondThreshold: 12 } },
  ],
};