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
const rootHollow = require('../encounters/root-hollow');
const whisperingGallery = require('../encounters/whispering-gallery');
const veilBreach = require('../encounters/veil-breach');
const deckRootHollow = require('../decks/dungeon-root-hollow');
const deckWhisperingGallery = require('../decks/dungeon-whispering-gallery');
const deckVeilBreach = require('../decks/dungeon-veil-breach');
const partyDeck = require('../decks/visitor-party-standard');
const party = require('../visitors/standard-adventuring-company');
const dungeon = require('../dungeon-verdant-maw');

module.exports = {
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