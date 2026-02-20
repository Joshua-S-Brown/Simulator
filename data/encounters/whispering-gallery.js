/**
 * ENCOUNTER: Whispering Gallery (v2.6 — Agency Fix)
 * 
 * v2.6: Added veil -1/other round auto-effect targeting DUNGEON.
 *       Thematic: The whispers don't just erode minds — they thin the
 *       membrane between the dungeon and the void. The Gallery's echoes
 *       resonate at frequencies that weaken dimensional barriers.
 *       Mechanical: Both sides now take double auto-pressure. Visitor
 *       takes resolve every + (from deck) vs dungeon presence other + veil other.
 * 
 * AUTO-EFFECT SUMMARY:
 *   Visitor: resolve -1/round
 *   Dungeon: presence -1/other round, veil -1/other round
 */
module.exports = {
  name: 'Whispering Gallery',
  description: 'Echoing halls of murmurs. The whispers erode everyone — even the dungeon loses its sense of self.',
  initiative: 'dungeon',
  autoEffects: [
    { resource: 'resolve', amount: -1, target: 'visitor', frequency: 'every' },
    { resource: 'presence', amount: -1, target: 'dungeon', frequency: 'other' },
    { resource: 'veil', amount: -1, target: 'dungeon', frequency: 'other' },  // v2.6: Agency fix
  ],
  tags: ['Social', 'Mystical', 'Open'],
};