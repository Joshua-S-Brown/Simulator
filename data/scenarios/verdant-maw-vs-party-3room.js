/**
 * SCENARIO: Verdant Maw vs Standard Adventuring Company (3-Room Gauntlet)
 * 
 * First multi-room party test. Same encounter sequence as the Boar gauntlet:
 *   Room 1: Root Hollow (Physical) → carryover →
 *   Room 2: Whispering Gallery (Social) → carryover →
 *   Room 3: Veil Breach (Mystical)
 * 
 * Tests:
 *   - Party resource management across 3 encounters
 *   - Attrition curve (do parties enter later rooms in playable state?)
 *   - Full-run survival rate (target: 5-20%)
 *   - Knockout accumulation across rooms
 *   - Quality metrics: agency, closeness, attrition curve, knockout patterns
 * 
 * Reference: Boar 3-room survival rate is ~11.7%. Party should land 5-20%.
 * 
 * RUN:
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-3room -d tactical -v party_balanced
 *   node run.js --verbose -s data/scenarios/verdant-maw-vs-party-3room -d tactical -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-3room -d aggressive -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-3room -d nurturing -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-3room -d deceptive -v party_balanced
 */
import rootHollow from '../_archive/encounters/root-hollow.js';
import whisperingGallery from '../_archive/encounters/whispering-gallery.js';
import veilBreach from '../_archive/encounters/veil-breach.js';
import deckRootHollow from '../_archive/decks/dungeon-root-hollow.js';
import deckWhisperingGallery from '../_archive/decks/dungeon-whispering-gallery.js';
import deckVeilBreach from '../_archive/decks/dungeon-veil-breach.js';
import partyDeck from '../_archive/decks/visitor-party-standard.js';
import party from '../_archive/visitors/standard-adventuring-company.js';
import dungeon from '../_archive/dungeon-verdant-maw.js';
export default {
  name: 'Verdant Maw vs Standard Adventuring Company (3-Room)',
  description: 'Party gauntlet: Physical → Social → Mystical. Tests multi-room attrition and survival.',
  visitorTemplate: party,
  dungeonTemplate: dungeon,
  encounters: [
    { encounter: rootHollow,        dungeonDeck: deckRootHollow,        visitorDeck: partyDeck, config: { bondThreshold: 12 } },
    { encounter: whisperingGallery, dungeonDeck: deckWhisperingGallery, visitorDeck: partyDeck, config: { bondThreshold: 12 } },
    { encounter: veilBreach,        dungeonDeck: deckVeilBreach,        visitorDeck: partyDeck, config: { bondThreshold: 12 } },
  ],
};