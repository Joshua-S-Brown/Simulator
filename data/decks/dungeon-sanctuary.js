module.exports = [
  // ═══ LIVING ROOT SANCTUARY — Nurturing dungeon room ═══
  // Identity: Safe haven that builds trust. Tests are the primary Bond path.
  // Template: 4E / 2S / 1Em / 1Co / 2Re / 3Of / 1Te / 1Rsh = 15

  // ENERGY (4)
  { name: 'Root Cradle',     category: 'Energy', type: 'Physical',      cost: 0, energyGain: 1 },
  { name: 'Gentle Pulse',    category: 'Energy', type: 'Environmental', cost: 0, energyGain: 1 },
  { name: 'Shelter Core',    category: 'Energy', type: 'Physical',      cost: 0, energyGain: 1 },
  { name: 'Trust Seed',      category: 'Energy', type: 'Social',        cost: 0, energyGain: 1 },

  // STRIKES (2) — gentle deterrents, suppressed during cooperation
  { name: 'Protective Thorns', category: 'Strike', type: 'Physical', cost: 1, power: 2,
    target: 'vitality', keywords: [] },
  { name: 'Warning Tremor', category: 'Strike', type: 'Environmental', cost: 1, power: 2,
    target: 'nerve', keywords: [] },

  // EMPOWER (1)
  { name: 'Calming Presence', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { advantage: true, powerBonus: 0 }, target: null, power: 0, keywords: [] },

  // COUNTER (1)
  { name: 'Gentle Redirection', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: null,
    target: null, power: 0, keywords: [] },

  // REACT (2) — sanctuary protects itself
  { name: 'Sheltering Canopy', category: 'React', type: 'Environmental', cost: 0, power: 2,
    target: null, keywords: [] },
  { name: 'Root Buffer', category: 'React', type: 'Physical', cost: 0, power: 1,
    target: null, keywords: [] },

  // TEST (1) — prisoner's dilemma. The core Bond-building interaction.
  { name: 'Trust Trial', category: 'Test', type: 'Social', cost: 1,
    testReward: { trust: 2, rapport: 2 },
    defectPenalty: { trustCrash: 0.5, powerGain: 2 },
    exposureCost: { resource: 'structure', amount: 1 },
    target: 'trust', power: 0, keywords: [] },

  // OFFERS (3) — reduced payloads. Supplement Tests, don't replace them.
  { name: 'Healing Sap', category: 'Offer', type: 'Environmental', cost: 1,
    offerPayload: [
      { resource: 'vitality', amount: 2, target: 'opponent' },
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ], target: 'trust', power: 0, keywords: [] },
  { name: 'Sheltering Roots', category: 'Offer', type: 'Physical', cost: 1,
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
    ], target: 'trust', power: 0, keywords: [] },
  { name: 'Luminous Gift', category: 'Offer', type: 'Mystical', cost: 2,
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'opponent' },
      { resource: 'rapport', amount: 1, target: 'self' },
      { resource: 'nerve', amount: 1, target: 'opponent' },
    ], target: 'trust', power: 0, keywords: [] },

  // RESHAPE (1) — heal and fortify the sanctuary
  { name: 'Open the Way', category: 'Reshape', type: 'Environmental', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'structure', amount: 2 }, { resource: 'presence', amount: 2 }],
    },
    target: null, power: 0, keywords: [] },
];