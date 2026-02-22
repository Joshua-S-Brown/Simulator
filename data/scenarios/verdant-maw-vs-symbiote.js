import sanctuary from '../_archive/encounters/living-root-sanctuary.js';
import whisperingGallery from '../_archive/encounters/whispering-gallery.js';
import veilBreach from '../_archive/encounters/veil-breach.js';
import deckSanc from '../_archive/decks/dungeon-living-root-sanctuary.js';
import deckWG from '../_archive/decks/dungeon-whispering-gallery.js';
import deckVB from '../_archive/decks/dungeon-veil-breach.js';
import visitorDeck from '../_archive/decks/visitor-drift-symbiote.js';
import symbiote from '../_archive/visitors/drift-symbiote.js';
import dungeon from '../_archive/dungeon-verdant-maw.js';
export default {
  name: 'Verdant Maw vs Drift Symbiote (3-Room)',
  description: 'Cooperative visitor enters nurturing room, then hostile rooms. Tests Bond path and carryover.',
  visitorTemplate: symbiote, dungeonTemplate: dungeon,
  encounters: [
    { encounter: sanctuary, dungeonDeck: deckSanc, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: whisperingGallery, dungeonDeck: deckWG, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
    { encounter: veilBreach, dungeonDeck: deckVB, visitorDeck: visitorDeck, config: { bondThreshold: 12 } },
  ],
};