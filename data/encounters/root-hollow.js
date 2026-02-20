/**
 * ENCOUNTER: Root Hollow (v2.6 — Agency Fix)
 * 
 * v2.3d: Added nerve -1/other round auto-effect for Panic pressure.
 * v2.6:  Added presence -1/other round auto-effect targeting DUNGEON.
 *        Thematic: The roots are wild and uncontrolled — even the dungeon
 *        can't fully direct their growth. The chaotic overgrowth undermines
 *        the dungeon's ordered authority.
 *        Mechanical: Creates bidirectional pressure from round 1. Visitor
 *        still takes more total auto-damage (vitality every + nerve other)
 *        vs dungeon (structure other + presence other), but the dungeon
 *        is no longer untouched by its own environment.
 * 
 * AGENCY RATIONALE:
 *   Pre-fix agency scores: 0.90–1.05 across all profiles (target: 1.5–4.0).
 *   Root Hollow's one-sided auto-effects gave the dungeon an uncontested lead
 *   from round 1. Adding dungeon-targeting pressure creates windows where
 *   the visitor can pull ahead, generating the lead changes that define agency.
 * 
 * AUTO-EFFECT SUMMARY:
 *   Visitor: vitality -1/round, nerve -1/other round
 *   Dungeon: structure -1/other round, presence -1/other round
 */
module.exports = {
  name: 'Root Hollow',
  description: 'A tangled chamber of ancient roots. Unstable and crushing — dangerous for both sides.',
  initiative: 'dungeon',
  autoEffects: [
    { resource: 'vitality', amount: -1, target: 'visitor', frequency: 'every' },
    { resource: 'nerve', amount: -1, target: 'visitor', frequency: 'other' },
    { resource: 'structure', amount: -1, target: 'dungeon', frequency: 'other' },
    { resource: 'presence', amount: -1, target: 'dungeon', frequency: 'other' },  // v2.6: Agency fix
  ],
  tags: ['Physical', 'Natural', 'Enclosed'],
};