module.exports = {
  name: 'Whispering Gallery',
  description: 'Echoing halls of murmurs. The whispers erode everyone — even the dungeon loses its sense of self.',
  initiative: 'dungeon',
  autoEffects: [
    { resource: 'resolve', amount: -1, target: 'visitor', frequency: 'every' },
    { resource: 'presence', amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Social', 'Mystical', 'Open'],
};