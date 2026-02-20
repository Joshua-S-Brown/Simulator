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
const rootHollow = require('../encounters/root-hollow');
const dungeonDeck = require('../decks/dungeon-root-hollow');
const partyDeck = require('../decks/visitor-party-arcane');
const party = require('../visitors/arcane-expedition');
const dungeon = require('../dungeon-verdant-maw');

module.exports = {
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