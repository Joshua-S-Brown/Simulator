/**
 * SCENARIO: Verdant Maw vs Standard Adventuring Company (v2.4)
 * 
 * First party encounter test. Single room (Root Hollow) against the
 * standard Knight/Battlemage/Cleric/Rogue party.
 * 
 * This scenario validates:
 *   - Party state initialization (individual vitality, collective pools)
 *   - Dungeon member targeting (which party member gets attacked?)
 *   - Member knockout mechanics (card removal, morale cascade)
 *   - Kill threshold (2 knockouts = Kill)
 *   - Healing Word restoration (downed member returns)
 *   - All 8 win conditions are possible (Kill, Break, Panic, Bond, Overcome, Inert, Dominate, Survive)
 * 
 * RUN:
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-standard -d tactical -v party_balanced
 *   node run.js --verbose -s data/scenarios/verdant-maw-vs-party-standard -d tactical -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-standard -d aggressive -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-standard -d nurturing -v party_balanced
 *   node run.js -n 1000 --json -s data/scenarios/verdant-maw-vs-party-standard -d deceptive -v party_balanced
 */
import rootHollow from '../_archive/encounters/root-hollow.js';
import dungeonDeck from '../_archive/decks/dungeon-root-hollow.js';
import partyDeck from '../_archive/decks/visitor-party-standard.js';
import party from '../_archive/visitors/standard-adventuring-company.js';
import dungeon from '../_archive/dungeon-verdant-maw.js';
export default {
  name: 'Verdant Maw vs Standard Adventuring Company',
  description: 'Single room test: Root Hollow tactical dungeon vs 4-member party.',
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