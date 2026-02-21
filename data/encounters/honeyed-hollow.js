/**
 * ENCOUNTER: Honeyed Hollow
 * Identity: Deceptive — invites trust, hides danger
 * 
 * The Venus flytrap of dungeon rooms. Warm bioluminescence, sweet-scented
 * amber, soft moss underfoot. Everything here says "you're safe." The auto-
 * effects reinforce this: visitor trust builds passively, making Offers more
 * likely to be accepted. Meanwhile the dungeon's Presence slowly erodes —
 * thematically, the act of performing welcome costs the dungeon its authentic
 * authority. The real damage comes from Traps hidden behind accepted Offers.
 * 
 * Designed as Room 1 in a deceptive encounter sequence. The visitor leaves
 * with high trust, subtle resource damage from Trap triggers, and no idea
 * what's coming in Room 2.
 * 
 * AUTO-EFFECTS:
 *   trust +1/other round (visitor) — Offers get accepted more easily as
 *     trust climbs, feeding the Trap→Offer engine
 *   presence -1/other round (dungeon) — the cost of performing warmth.
 *     Creates a real vulnerability: if the deception stalls, the dungeon's
 *     presence erodes and the visitor can Dominate
 */
module.exports = {
  name: 'Honeyed Hollow',
  description: 'A fragrant chamber dripping with amber light. Everything here invites trust.',
  initiative: 'dungeon',
  autoEffects: [
  { resource: 'nerve', amount: -1, target: 'visitor', frequency: 'other' },
  { resource: 'veil', amount: -1, target: 'dungeon', frequency: 'other' },
],
  tags: ['Social', 'Environmental', 'Deceptive'],
};