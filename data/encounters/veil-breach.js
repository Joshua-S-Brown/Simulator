module.exports = {
  name: 'Veil Breach',
  description: 'Reality fractures where the Veil is thin. The instability threatens the dungeon too.',
  initiative: 'visitor',
  autoEffects: [
    { resource: 'nerve', amount: -1, target: 'visitor', frequency: 'every' },
    { resource: 'veil', amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Mystical', 'Environmental', 'Unstable'],
};