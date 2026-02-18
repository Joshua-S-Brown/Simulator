module.exports = [
  // ENERGY (4 — down from 5, added Disrupt)
  { name: 'Primal Stamina',   category: 'Energy', type: 'Physical', cost: 0, energyGain: 1 },
  { name: 'Territorial Fury', category: 'Energy', type: 'Physical', cost: 0, energyGain: 1 },
  { name: 'Stubborn Will',    category: 'Energy', type: 'Social',   cost: 0, energyGain: 1 },
  { name: 'Thick Hide',       category: 'Energy', type: 'Physical', cost: 0, energyGain: 1 },
  // STRIKES (4) — multi-resource: 2 structure, 1 presence, 1 veil
  { name: 'Gore', category: 'Strike', type: 'Physical', cost: 2, power: 2,
    target: 'structure', keywords: [] },
  { name: 'Rampaging Charge', category: 'Strike', type: 'Physical', cost: 2, power: 3,
    target: 'structure', keywords: [],
    trigger: { description: 'If Vitality < 50%: +2 Power', condition: { type: 'resource_below', resource: 'vitality' }, bonus: 2 } },
  { name: 'Territorial Stomp', category: 'Strike', type: 'Physical', cost: 1, power: 2,
    target: 'presence', keywords: [] },
  { name: 'Tusk Slash', category: 'Strike', type: 'Physical', cost: 1, power: 2,
    target: 'veil', keywords: [] },
  // EMPOWER (2)
  { name: "Boar's Rage", category: 'Empower', type: 'Physical', cost: 1,
    empowerEffect: { advantage: true, powerBonus: 0 }, target: null, power: 0, keywords: [] },
  { name: 'Dig In', category: 'Empower', type: 'Physical', cost: 1,
    empowerEffect: { advantage: false, powerBonus: 2 }, target: null, power: 0, keywords: [] },
  // DISRUPT (2 — up from 1, boar now has intimidation)
  { name: 'Thrashing', category: 'Disrupt', type: 'Physical', cost: 1,
    disruptEffect: { disadvantage: true }, target: null, power: 0, keywords: [] },
  { name: 'Bellowing Roar', category: 'Disrupt', type: 'Social', cost: 1,
    disruptEffect: { disadvantage: true }, target: null, power: 0, keywords: [] },
  // COUNTER (1)
  { name: 'Shake Free', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: { resource: 'structure', amount: 1 }, target: null, power: 0, keywords: [] },
  // REACT (2)
  { name: 'Thick Bristles', category: 'React', type: 'Physical', cost: 1, power: 2,
    target: 'structure', keywords: [] },
  { name: 'Instinctive Dodge', category: 'React', type: 'Physical', cost: 1, power: 1,
    target: null, keywords: [] },
];