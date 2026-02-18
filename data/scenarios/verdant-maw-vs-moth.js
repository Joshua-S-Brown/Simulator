const veilBreach = require('../encounters/veil-breach');
const whisperingGallery = require('../encounters/whispering-gallery');
const rootHollow = require('../encounters/root-hollow');
const deckVB = require('../decks/dungeon-veil-breach');
const deckWG = require('../decks/dungeon-whispering-gallery');
const deckRH = require('../decks/dungeon-root-hollow');
const visitorDeck = require('../decks/visitor-veil-moth');
const moth = require('../visitors/veil-moth');
const dungeon = require('../dungeon-verdant-maw');

module.exports = {
  name: 'Verdant Maw vs Veil Moth (3-Room)',
  description: 'Fragile moth enters mystical room first (strength), then social, then physical (weakness).',
  visitorTemplate: moth, dungeonTemplate: dungeon,
  encounters: [
    { encounter: veilBreach, dungeonDeck: deckVB, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: whisperingGallery, dungeonDeck: deckWG, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: rootHollow, dungeonDeck: deckRH, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
  ],
};