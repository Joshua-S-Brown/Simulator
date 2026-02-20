/**
 * SCENARIO: Verdant Maw vs Arcane Expedition (3-Room Gauntlet)
 * 
 * Second party in the matchup matrix. Same encounter sequence as Standard:
 *   Room 1: Root Hollow (Physical) → carryover →
 *   Room 2: Whispering Gallery (Social) → carryover →
 *   Room 3: Veil Breach (Mystical)
 * 
 * All three rooms now have v2.6 bidirectional auto-effects (agency fix).
 * 
 * Tests:
 *   - Caster-heavy party resource management across 3 encounters
 *   - Break rate with resolve 12 (vs Standard's 14)
 *   - Panic rate with nerve 17 (vs Standard's 16)
 *   - Knockout patterns with glass-cannon Sorcerer (5 vit)
 *   - Agency improvement from bidirectional auto-effects
 *   - 2×4 matchup matrix: Arcane × {aggressive, nurturing, deceptive, tactical}
 * 
 * Expected outcome signature differences from Standard:
 *   Standard: Kill ~41%, Panic ~29%, Break ~23%, Survive ~6%
 *   Arcane:   More Break, Less Panic, potentially higher agency (more sustain)
 * 
 * RUN:
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-arcane-3room -d tactical -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-arcane-3room -d aggressive -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-arcane-3room -d nurturing -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-arcane-3room -d deceptive -v party_balanced
 *   node run.js --verbose -s data/scenarios/verdant-maw-vs-party-arcane-3room -d tactical -v party_balanced
 */
const rootHollow = require('../encounters/root-hollow');
const whisperingGallery = require('../encounters/whispering-gallery');
const veilBreach = require('../encounters/veil-breach');
const deckRootHollow = require('../decks/dungeon-root-hollow');
const deckWhisperingGallery = require('../decks/dungeon-whispering-gallery');
const deckVeilBreach = require('../decks/dungeon-veil-breach');
const partyDeck = require('../decks/visitor-party-arcane');
const party = require('../visitors/arcane-expedition');
const dungeon = require('../dungeon-verdant-maw');

module.exports = {
  name: 'Verdant Maw vs Arcane Expedition (3-Room)',
  description: 'Caster-heavy party gauntlet: Physical → Social → Mystical. Tests multi-room attrition with different vulnerability profile.',
  visitorTemplate: party,
  dungeonTemplate: dungeon,
  encounters: [
    { encounter: rootHollow,        dungeonDeck: deckRootHollow,        visitorDeck: partyDeck, config: { bondThreshold: 12 } },
    { encounter: whisperingGallery, dungeonDeck: deckWhisperingGallery, visitorDeck: partyDeck, config: { bondThreshold: 12 } },
    { encounter: veilBreach,        dungeonDeck: deckVeilBreach,        visitorDeck: partyDeck, config: { bondThreshold: 12 } },
  ],
};