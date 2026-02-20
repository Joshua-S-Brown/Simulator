/**
 * ENCOUNTER: Veil Breach (v2.6 — Agency Fix)
 * 
 * v2.6: Added structure -1/other round auto-effect targeting DUNGEON.
 *       Thematic: Where reality fractures, the walls crack too. The Veil
 *       Breach destabilizes not just magical barriers but the physical
 *       architecture anchoring them.
 *       Mechanical: Dungeon now takes veil other + structure other, matching
 *       the visitor's nerve every. Visitor still has initiative advantage
 *       (visitor goes first in Veil Breach) balanced by higher total pressure.
 * 
 * AUTO-EFFECT SUMMARY:
 *   Visitor: nerve -1/round
 *   Dungeon: veil -1/other round, structure -1/other round
 * 
 * DESIGN NOTE: Over a 3-room gauntlet with these v2.6 changes, each dungeon
 * resource is hit by auto-effects in exactly 2 of 3 rooms:
 *   Structure: Root Hollow + Veil Breach
 *   Veil:      Whispering Gallery + Veil Breach
 *   Presence:  Root Hollow + Whispering Gallery
 * This ensures no single resource is disproportionately pressured while
 * maintaining meaningful attrition across the full run.
 */
module.exports = {
  name: 'Veil Breach',
  description: 'Reality fractures where the Veil is thin. The instability threatens the dungeon too.',
  initiative: 'visitor',
  autoEffects: [
    { resource: 'nerve', amount: -1, target: 'visitor', frequency: 'every' },
    { resource: 'veil', amount: -1, target: 'dungeon', frequency: 'other' },
    { resource: 'structure', amount: -1, target: 'dungeon', frequency: 'other' },  // v2.6: Agency fix
  ],
  tags: ['Mystical', 'Environmental', 'Unstable'],
};