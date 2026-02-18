module.exports = {
  name: 'Root Hollow',
  description: 'A tangled chamber of ancient roots. Unstable and crushing — dangerous for both sides.',
  initiative: 'dungeon',
  autoEffects: [
    { resource: 'vitality', amount: -1, target: 'visitor', frequency: 'every' },
    { resource: 'structure', amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Physical', 'Natural', 'Enclosed'],
};