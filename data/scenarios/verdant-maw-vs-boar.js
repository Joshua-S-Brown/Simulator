const rootHollow = require('../encounters/root-hollow');
const whisperingGallery = require('../encounters/whispering-gallery');
const veilBreach = require('../encounters/veil-breach');
const deckRootHollow = require('../decks/dungeon-root-hollow');
const deckWhisperingGallery = require('../decks/dungeon-whispering-gallery');
const deckVeilBreach = require('../decks/dungeon-veil-breach');
const visitorDeck = require('../decks/visitor-thornback-boar');
const boar = require('../visitors/thornback-boar');
const dungeon = require('../dungeon-verdant-maw');

module.exports = {
  name: 'Verdant Maw vs Thornback Boar (3-Room)',
  description: 'Boar enters a predatory dungeon. Physical → Social → Mystical.',
  visitorTemplate: boar,
  dungeonTemplate: dungeon,
  encounters: [
    { encounter: rootHollow,        dungeonDeck: deckRootHollow,        visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: whisperingGallery, dungeonDeck: deckWhisperingGallery, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: veilBreach,        dungeonDeck: deckVeilBreach,        visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
  ],
};