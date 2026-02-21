const sanctuary = require('../encounters/living-root-sanctuary');
const whisperingGallery = require('../encounters/whispering-gallery');
const veilBreach = require('../encounters/veil-breach');
const deckSanc = require('../decks/dungeon-living-root-sanctuary');
const deckWG = require('../decks/dungeon-whispering-gallery');
const deckVB = require('../decks/dungeon-veil-breach');
const visitorDeck = require('../decks/visitor-drift-symbiote');
const symbiote = require('../visitors/drift-symbiote');
const dungeon = require('../dungeon-verdant-maw');

module.exports = {
  name: 'Verdant Maw vs Drift Symbiote (3-Room)',
  description: 'Cooperative visitor enters nurturing room, then hostile rooms. Tests Bond path and carryover.',
  visitorTemplate: symbiote, dungeonTemplate: dungeon,
  encounters: [
    { encounter: sanctuary, dungeonDeck: deckSanc, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: whisperingGallery, dungeonDeck: deckWG, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: veilBreach, dungeonDeck: deckVB, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
  ],
};