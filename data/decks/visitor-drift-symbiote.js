module.exports = [
  // Identity: Cooperative symbiote seeking mutual Bond. Tests > Offers for trust-building.
  // Template: 5E / 2S / 1Te / 2Em / 2Of / 1Co / 2Re = 15

  // ENERGY (5)
  { name: 'Symbiotic Pulse', category: 'Energy', type: 'Social',        cost: 0, energyGain: 1 },
  { name: 'Adaptive Core',   category: 'Energy', type: 'Environmental', cost: 0, energyGain: 1 },
  { name: 'Trust Filament',  category: 'Energy', type: 'Social',        cost: 0, energyGain: 1 },
  { name: 'Root Anchor',     category: 'Energy', type: 'Physical',      cost: 0, energyGain: 1 },
  { name: 'Resonant Thread', category: 'Energy', type: 'Mystical',      cost: 0, energyGain: 1 },
  // STRIKES (2) — defensive only, low power. Suppressed during cooperation.
  { name: 'Tendril Lash', category: 'Strike', type: 'Physical', cost: 1, power: 1,
    target: 'structure', keywords: [] },
  { name: 'Psychic Prod', category: 'Strike', type: 'Social', cost: 1, power: 1,
    target: 'presence', keywords: [] },
  // TEST (1) — prisoner's dilemma. High reward on cooperation, crash on defection.
  { name: 'Symbiotic Probe', category: 'Test', type: 'Social', cost: 1,
    testReward: { trust: 2, rapport: 2 },
    defectPenalty: { trustCrash: 0.5, powerGain: 2 },
    exposureCost: { resource: 'vitality', amount: 1 },
    target: 'trust', power: 0, keywords: [] },
  // EMPOWER (2)
  { name: 'Symbiotic Bond', category: 'Empower', type: 'Social', cost: 1,
    empowerEffect: { advantage: false, powerBonus: 2 }, target: null, power: 0, keywords: [] },
  { name: 'Harmonize', category: 'Empower', type: 'Mystical', cost: 1,
    empowerEffect: { advantage: true, powerBonus: 0 }, target: null, power: 0, keywords: [] },
  // OFFER (2) — reduced payloads. Slow trust-building, not instant.
  { name: 'Mutual Nourishment', category: 'Offer', type: 'Social', cost: 1,
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'self' },
      { resource: 'rapport', amount: 1, target: 'opponent' },
    ], target: 'trust', power: 0, keywords: [] },
  { name: 'Shared Warmth', category: 'Offer', type: 'Social', cost: 2,
    offerPayload: [
      { resource: 'trust', amount: 2, target: 'self' },
      { resource: 'rapport', amount: 2, target: 'opponent' },
      { resource: 'vitality', amount: 1, target: 'self' },
    ], target: 'trust', power: 0, keywords: [] },
  // COUNTER (1)
  { name: 'Absorb Impact', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: { resource: 'structure', amount: 1 }, target: null, power: 0, keywords: [] },
  // REACT (2)
  { name: 'Elastic Membrane', category: 'React', type: 'Physical', cost: 1, power: 2,
    target: null, keywords: [] },
  { name: 'Adaptive Shell', category: 'React', type: 'Environmental', cost: 0, power: 1,
    target: null, keywords: [] },
];