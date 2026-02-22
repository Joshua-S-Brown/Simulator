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
import rootHollow from '../_archive/encounters/root-hollow.js';
import whisperingGallery from '../_archive/encounters/whispering-gallery.js';
import veilBreach from '../_archive/encounters/veil-breach.js';
import deckRootHollow from '../_archive/decks/dungeon-root-hollow.js';
import deckWhisperingGallery from '../_archive/decks/dungeon-whispering-gallery.js';
import deckVeilBreach from '../_archive/decks/dungeon-veil-breach.js';
import partyDeck from '../_archive/decks/visitor-party-arcane.js';
import party from '../_archive/visitors/arcane-expedition.js';
import dungeon from '../_archive/dungeon-verdant-maw.js';
export default {
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