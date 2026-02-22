/**
 * SCENARIO: Verdant Maw vs Arcane Expedition (Single Room)
 * 
 * Quick validation: Root Hollow vs the caster-heavy party.
 * Compare directly against verdant-maw-vs-party-standard for the
 * same room to isolate composition effects from multi-room dynamics.
 * 
 * Expected differences from Standard Adventuring Company:
 *   - More Break (resolve 12 vs 14)
 *   - Less Panic (nerve 17 vs 16)
 *   - Different knockout patterns (Sorcerer at 5 vit vs Rogue at 6)
 *   - Different agency (less reactive play, more sustain)
 * 
 * RUN:
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-arcane -d tactical -v party_balanced
 *   node run.js --verbose -s data/scenarios/verdant-maw-vs-party-arcane -d tactical -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-arcane -d aggressive -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-arcane -d nurturing -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-arcane -d deceptive -v party_balanced
 */
import rootHollow from '../_archive/encounters/root-hollow.js';
import dungeonDeck from '../_archive/decks/dungeon-root-hollow.js';
import partyDeck from '../_archive/decks/visitor-party-arcane.js';
import party from '../_archive/visitors/arcane-expedition.js';
import dungeon from '../_archive/dungeon-verdant-maw.js';
export default {
  name: 'Verdant Maw vs Arcane Expedition',
  description: 'Single room test: Root Hollow vs caster-heavy party.',
  visitorTemplate: party,
  dungeonTemplate: dungeon,
  encounters: [
    {
      encounter: rootHollow,
      dungeonDeck: dungeonDeck,
      visitorDeck: partyDeck,
      config: { bondThreshold: 12 },
    },
  ],
};