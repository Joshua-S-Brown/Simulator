import rootHollow from '../_archive/encounters/root-hollow.js';
import whisperingGallery from '../_archive/encounters/whispering-gallery.js';
import veilBreach from '../_archive/encounters/veil-breach.js';
import deckRootHollow from '../_archive/decks/dungeon-root-hollow.js';
import deckWhisperingGallery from '../_archive/decks/dungeon-whispering-gallery.js';
import deckVeilBreach from '../_archive/decks/dungeon-veil-breach.js';
import visitorDeck from '../_archive/decks/visitor-thornback-boar.js';
import boar from '../_archive/visitors/thornback-boar.js';
import dungeon from '../_archive/dungeon-verdant-maw.js';
export default {
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