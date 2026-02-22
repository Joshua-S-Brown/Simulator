import veilBreach from '../_archive/encounters/veil-breach.js';
import whisperingGallery from '../_archive/encounters/whispering-gallery.js';
import rootHollow from '../_archive/encounters/root-hollow.js';
import deckVB from '../_archive/decks/dungeon-veil-breach.js';
import deckWG from '../_archive/decks/dungeon-whispering-gallery.js';
import deckRH from '../_archive/decks/dungeon-root-hollow.js';
import visitorDeck from '../_archive/decks/visitor-veil-moth.js';
import moth from '../_archive/visitors/veil-moth.js';
import dungeon from '../_archive/dungeon-verdant-maw.js';
export default {
  name: 'Verdant Maw vs Veil Moth (3-Room)',
  description: 'Fragile moth enters mystical room first (strength), then social, then physical (weakness).',
  visitorTemplate: moth, dungeonTemplate: dungeon,
  encounters: [
    { encounter: veilBreach, dungeonDeck: deckVB, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: whisperingGallery, dungeonDeck: deckWG, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: rootHollow, dungeonDeck: deckRH, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
  ],
};