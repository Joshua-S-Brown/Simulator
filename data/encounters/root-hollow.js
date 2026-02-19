/**
 * ENCOUNTER: Root Hollow (v2.3d)
 * 
 * v2.3d CHANGES:
 *   Added nerve -1/other round auto-effect.
 *   Thematic: being trapped in crushing roots frays courage.
 *   Mechanical: creates passive Panic pressure without changing deck identity.
 *   Softens nerve for later rooms — Boar enters Veil Breach at ~10-11 nerve
 *   instead of 14, making Panic specialist room more effective.
 */
module.exports = {
  name: 'Root Hollow',
  description: 'A tangled chamber of ancient roots. Unstable and crushing — dangerous for both sides.',
  initiative: 'dungeon',
  autoEffects: [
    { resource: 'vitality', amount: -1, target: 'visitor', frequency: 'every' },
    { resource: 'nerve', amount: -1, target: 'visitor', frequency: 'other' },
    { resource: 'structure', amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Physical', 'Natural', 'Enclosed'],
};