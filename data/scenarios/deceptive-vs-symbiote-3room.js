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
import honeyedHollow from '../_archive/encounters/honeyed-hollow.js';
import rootHollow from '../_archive/encounters/root-hollow.js';
import veilBreach from '../_archive/encounters/veil-breach.js';
import deckHoneyed from '../_archive/decks/dungeon-honeyed-hollow.js';
import deckRootHollow from '../_archive/decks/dungeon-root-hollow.js';
import deckVeilBreach from '../_archive/decks/dungeon-veil-breach.js';
import visitorDeck from '../_archive/decks/visitor-drift-symbiote.js';
import symbiote from '../_archive/visitors/drift-symbiote.js';
import dungeon from '../_archive/dungeon-verdant-maw.js';
export default {
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