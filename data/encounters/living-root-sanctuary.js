/**
 * ENCOUNTER: Living Root Sanctuary (v3.0)
 * 
 * v3.0 CHANGE: Removed trust auto-effect.
 * 
 * BEFORE: autoEffects: [{ resource: 'trust', amount: 1,
 *           target: 'visitor', frequency: 'other' }]
 * AFTER:  autoEffects: [] (empty — no passive trust)
 * 
 * Rationale: Passive trust +1 every other round eliminated the
 * need for card-based trust building. Combined with Symbiote
 * starting trust 3, this produced 98.5% Bond with 0.44 Agency.
 * 
 * The Sanctuary deck already has 5 trust-building cards:
 *   3 Offers (Healing Sap, Sheltering Roots, Luminous Gift)
 *   1 Test (Trust Trial)
 *   1 Covenant (Pact of the Living Root)
 * 
 * Plus the Symbiote brings 2 Offers and 1 Test of its own.
 * That's 8 trust-building cards across both decks — more than
 * enough to progress through tiers via deliberate play.
 * 
 * Trust should come from DECISIONS (playing Offers, passing
 * Tests), not from the room's ambient warmth. The room's
 * identity as "safe" is expressed through its deck composition
 * (no aggressive Strikes, healing Reshapes, Ward keywords),
 * not through free promoter accumulation.
 * 
 * If trust progression feels too slow after testing, the
 * narrower fix is to add a CONDITIONAL auto-effect:
 *   { resource: 'trust', amount: 1, target: 'visitor',
 *     frequency: 'other',
 *     condition: { type: 'no_strikes_last_2_rounds', side: 'dungeon' } }
 * This rewards peaceful BEHAVIOR rather than mere presence.
 */
module.exports = {
  name: 'Living Root Sanctuary',
  description: 'A warm alcove of bioluminescent roots. Both sides feel safe here.',
  initiative: 'dungeon',
  autoEffects: [
  { resource: 'veil', amount: -1, target: 'dungeon', frequency: 'every' },
  { resource: 'resolve', amount: -1, target: 'visitor', frequency: 'every' },
  { resource: 'trust', amount: -1, target: 'visitor', frequency: 'other' },
],
  tags: ['Social', 'Environmental', 'Nurturing'],
};