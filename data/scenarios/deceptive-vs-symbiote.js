/**
 * SCENARIO: Deceptive Dungeon vs Drift Symbiote (2-Room)
 * 
 * Tests the deception strategic arc: Room 1 builds trust while dealing hidden
 * Trap damage, Room 2 is the aggressive closer.
 * 
 * v2 CHANGES:
 *   - maxRounds: 8 on Honeyed Hollow — visitor passes through before escalation
 *     kills them. This is a "passage" room, not a "resolution" room. The engine
 *     already supports config.maxRounds per encounter.
 *   - Room 2 (Root Hollow) has no maxRounds — it plays to resolution.
 * 
 * TEST TWO AI PROFILES:
 * 
 *   -d deceptive  → Within-room betrayal. AI cooperates until trust ≥ 8
 *                    (raised from 4 to give the Trap→Offer engine time to cycle).
 *                    The Symbiote starts at trust 3, auto-effect +1/other round,
 *                    Offers add +1-2. Betrayal triggers ~round 4-5.
 * 
 *   -d nurturing  → Cross-room betrayal. AI genuinely cooperates in Room 1,
 *                    never strikes. All damage is from Traps. Visitor enters
 *                    Room 2 with high trust, subtle damage, false confidence.
 * 
 * RUN:
 *   node run.js -n 1000 --json -s data/scenarios/deceptive-vs-symbiote -d deceptive -v cooperative
 *   node run.js -n 1000 --json -s data/scenarios/deceptive-vs-symbiote -d nurturing -v cooperative
 */
import honeyedHollow from '../_archive/encounters/honeyed-hollow.js';
import rootHollow from '../_archive/encounters/root-hollow.js';
import deckHoneyed from '../_archive/decks/dungeon-honeyed-hollow.js';
import deckRootHollow from '../_archive/decks/dungeon-root-hollow.js';
import visitorDeck from '../_archive/decks/visitor-drift-symbiote.js';
import symbiote from '../_archive/visitors/drift-symbiote.js';
import dungeon from '../_archive/dungeon-verdant-maw.js';
export default {
  name: 'Deceptive Dungeon vs Drift Symbiote (2-Room)',
  description: 'Room 1: nurturing facade (8 rnd cap). Room 2: tactical closer.',
  visitorTemplate: symbiote,
  dungeonTemplate: dungeon,
  encounters: [
    { encounter: honeyedHollow, dungeonDeck: deckHoneyed, visitorDeck: visitorDeck,
      config: { bondThreshold: 12, maxRounds: 8, dungeonProfile: 'nurturing' } },
    { encounter: rootHollow, dungeonDeck: deckRootHollow, visitorDeck: visitorDeck,
      config: { bondThreshold: 12, dungeonProfile: 'tactical' } },
  ],
};