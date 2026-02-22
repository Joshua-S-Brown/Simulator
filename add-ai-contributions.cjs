#!/usr/bin/env node
/**
 * ADD aiContributions — Patches encounter and member data files
 *
 * Run from project root:  node add-ai-contributions.cjs
 *
 * Adds the aiContributions field to each data file, right before
 * the deck array. Does NOT modify any existing fields.
 *
 * Values from: shattered-dungeon-frontend-plan.md §1.3 and §1.4
 * New encounters (broodmother, forge, grotto) designed to match themes.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
let patchCount = 0;

// ═══════════════════════════════════════════════════════════════
// ENCOUNTER aiContributions (from spec + new encounter designs)
// ═══════════════════════════════════════════════════════════════

const ENCOUNTER_AI = {
  'root-hollow': {
    baseWeights: { Strike: 1.2, Empower: 0.8, Disrupt: 0.5, Counter: 0.5, Trap: 0.5, Offer: 0, Reshape: 0.2, React: 0.3, Test: 0, Energy: 0.5 },
    preferredTargets: ['vitality', 'nerve'],
    comboAwareness: 0.25,
    energyEagerness: 0.22,
    bondAffinity: 0,
    betrayalAffinity: 0,
  },
  'whispering-gallery': {
    baseWeights: { Strike: 0.8, Empower: 0.5, Disrupt: 0.8, Counter: 1.0, Trap: 0.8, Offer: 0.3, Reshape: 0.7, React: 0.3, Test: 0, Energy: 0.5 },
    preferredTargets: ['resolve', 'presence'],
    comboAwareness: 0.35,
    energyEagerness: 0.25,
    bondAffinity: 0,
    betrayalAffinity: 0,
  },
  'veil-breach': {
    baseWeights: { Strike: 0.8, Empower: 0.5, Disrupt: 0.7, Counter: 1.0, Trap: 0.7, Offer: 0.3, Reshape: 0.7, React: 0.4, Test: 0, Energy: 0.5 },
    preferredTargets: ['nerve', 'veil'],
    comboAwareness: 0.30,
    energyEagerness: 0.23,
    bondAffinity: 0,
    betrayalAffinity: 0,
  },
  'living-root-sanctuary': {
    baseWeights: { Strike: 0, Empower: 0.2, Disrupt: 0.1, Counter: 0.3, Trap: 0, Offer: 1.8, Reshape: 1.0, React: 0.3, Test: 1.5, Energy: 0.5 },
    preferredTargets: ['trust', 'rapport'],
    comboAwareness: 0.15,
    energyEagerness: 0.17,
    bondAffinity: 1.0,
    betrayalAffinity: 0,
  },
  'honeyed-hollow': {
    baseWeights: { Strike: 0.3, Empower: 0.3, Disrupt: 0.1, Counter: 0.3, Trap: 0.8, Offer: 1.2, Reshape: 0.5, React: 0.3, Test: 0.8, Energy: 0.5 },
    preferredTargets: ['trust', 'rapport'],
    comboAwareness: 0.25,
    energyEagerness: 0.17,
    bondAffinity: 0.5,
    betrayalAffinity: 1.0,
  },

  // ── NEW ENCOUNTERS ──
  // Designed to complement existing encounters and fill archetype gaps.

  // Broodmother's Web: Physical + Trap-heavy, creature-spawning aggression.
  // Kill/Panic winCon. Entangle-focused control with direct damage.
  // Similar to Root Hollow's aggression but with more trap/control.
  'broodmothers-web': {
    baseWeights: { Strike: 1.0, Empower: 0.6, Disrupt: 0.4, Counter: 0.6, Trap: 1.0, Offer: 0, Reshape: 0.3, React: 0.4, Test: 0, Energy: 0.5 },
    preferredTargets: ['vitality', 'nerve'],
    comboAwareness: 0.30,
    energyEagerness: 0.25,
    bondAffinity: 0,
    betrayalAffinity: 0,
  },

  // Construct's Forge: Mechanical precision, structure-focused.
  // Kill/Break winCon. Empowers and reshapes aggressively. High energy use.
  // Fills the "Empower-heavy" niche no original encounter owned.
  'constructs-forge': {
    baseWeights: { Strike: 0.9, Empower: 1.0, Disrupt: 0.3, Counter: 0.4, Trap: 0.4, Offer: 0, Reshape: 0.8, React: 0.5, Test: 0, Energy: 0.7 },
    preferredTargets: ['vitality', 'resolve'],
    comboAwareness: 0.35,
    energyEagerness: 0.30,
    bondAffinity: 0,
    betrayalAffinity: 0,
  },

  // Hollow Siren's Grotto: Psychological + mystical manipulation.
  // Break/Panic winCon. Disruption-heavy with some deceptive undertones.
  // Bridges the gap between Whispering Gallery and Honeyed Hollow.
  'hollow-sirens-grotto': {
    baseWeights: { Strike: 0.5, Empower: 0.4, Disrupt: 1.0, Counter: 0.7, Trap: 0.5, Offer: 0.5, Reshape: 0.6, React: 0.3, Test: 0.3, Energy: 0.5 },
    preferredTargets: ['resolve', 'nerve'],
    comboAwareness: 0.28,
    energyEagerness: 0.20,
    bondAffinity: 0.2,
    betrayalAffinity: 0.3,
  },
};

// ═══════════════════════════════════════════════════════════════
// MEMBER aiContributions (from spec)
// ═══════════════════════════════════════════════════════════════

const MEMBER_AI = {
  knight: {
    baseWeights: { Strike: 0.8, Empower: 0.6, Disrupt: 0.5, Counter: 0.4, React: 0.5, Trap: 0.3, Offer: 0.1, Reshape: 0.3, Test: 0.1, Energy: 0.5 },
    preferredTargets: ['structure'],
    comboAwareness: 0.20,
    bondAffinity: 0.0,
    cooperationSensitivity: 0.2,
  },
  battlemage: {
    baseWeights: { Strike: 0.9, Empower: 0.7, Disrupt: 0.4, Counter: 0.3, React: 0.3, Trap: 0.3, Offer: 0.1, Reshape: 0.2, Test: 0.1, Energy: 0.6 },
    preferredTargets: ['veil'],
    comboAwareness: 0.25,
    bondAffinity: 0.0,
    cooperationSensitivity: 0.2,
  },
  cleric: {
    baseWeights: { Strike: 0.3, Empower: 0.3, Disrupt: 0.4, Counter: 0.4, React: 0.4, Trap: 0.3, Offer: 0.4, Reshape: 0.8, Test: 0.3, Energy: 0.5 },
    preferredTargets: ['presence'],
    comboAwareness: 0.18,
    bondAffinity: 0.3,
    cooperationSensitivity: 0.6,
  },
  rogue: {
    baseWeights: { Strike: 0.5, Empower: 0.4, Disrupt: 0.5, Counter: 0.4, React: 0.3, Trap: 0.6, Offer: 0.2, Reshape: 0.2, Test: 0.3, Energy: 0.5 },
    preferredTargets: ['veil', 'presence'],
    comboAwareness: 0.22,
    bondAffinity: 0.0,
    cooperationSensitivity: 0.3,
  },
  warden: {
    baseWeights: { Strike: 0.6, Empower: 0.5, Disrupt: 0.5, Counter: 0.5, React: 0.5, Trap: 0.3, Offer: 0.1, Reshape: 0.4, Test: 0.1, Energy: 0.5 },
    preferredTargets: ['structure'],
    comboAwareness: 0.18,
    bondAffinity: 0.1,
    cooperationSensitivity: 0.3,
  },
  sorcerer: {
    baseWeights: { Strike: 1.0, Empower: 0.7, Disrupt: 0.3, Counter: 0.2, React: 0.2, Trap: 0.2, Offer: 0.1, Reshape: 0.2, Test: 0.1, Energy: 0.7 },
    preferredTargets: ['veil'],
    comboAwareness: 0.25,
    bondAffinity: 0.0,
    cooperationSensitivity: 0.15,
  },
  druid: {
    baseWeights: { Strike: 0.3, Empower: 0.3, Disrupt: 0.2, Counter: 0.2, React: 0.3, Trap: 0.2, Offer: 0.5, Reshape: 0.8, Test: 0.4, Energy: 0.5 },
    preferredTargets: ['veil'],
    comboAwareness: 0.20,
    bondAffinity: 0.5,
    cooperationSensitivity: 0.8,
  },
  ranger: {
    baseWeights: { Strike: 0.7, Empower: 0.5, Disrupt: 0.4, Counter: 0.3, React: 0.3, Trap: 0.4, Offer: 0.2, Reshape: 0.3, Test: 0.2, Energy: 0.5 },
    preferredTargets: ['structure', 'presence'],
    comboAwareness: 0.22,
    bondAffinity: 0.1,
    cooperationSensitivity: 0.35,
  },
};

// ═══════════════════════════════════════════════════════════════
// PATCH LOGIC
// ═══════════════════════════════════════════════════════════════

function formatAiContributions(ai) {
  const bw = ai.baseWeights;
  const bwStr = Object.entries(bw)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');

  const targets = ai.preferredTargets.map(t => `'${t}'`).join(', ');

  let fields = [
    `    baseWeights: { ${bwStr} }`,
    `    preferredTargets: [${targets}]`,
    `    comboAwareness: ${ai.comboAwareness}`,
  ];

  // Encounter-specific fields
  if ('energyEagerness' in ai) {
    fields.push(`    energyEagerness: ${ai.energyEagerness}`);
    fields.push(`    bondAffinity: ${ai.bondAffinity}`);
    fields.push(`    betrayalAffinity: ${ai.betrayalAffinity}`);
  }

  // Member-specific fields
  if ('cooperationSensitivity' in ai) {
    fields.push(`    bondAffinity: ${ai.bondAffinity}`);
    fields.push(`    cooperationSensitivity: ${ai.cooperationSensitivity}`);
  }

  return `  aiContributions: {\n${fields.join(',\n')},\n  }`;
}

function patchFile(filePath, aiData) {
  if (!fs.existsSync(filePath)) {
    console.log(`  ⏭️  ${path.relative(ROOT, filePath)} — not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT, filePath);

  // Skip if already has aiContributions
  if (content.includes('aiContributions')) {
    console.log(`  ⏭️  ${rel} — already has aiContributions`);
    return;
  }

  const block = formatAiContributions(aiData);

  // Strategy: insert aiContributions before the deck array.
  // Look for "  deck: [" and insert before it.
  if (content.includes('  deck: [')) {
    content = content.replace(
      '  deck: [',
      `${block},\n\n  deck: [`
    );
  }
  // Alternative: some files might have deck at different indentation
  else if (content.includes('deck: [')) {
    content = content.replace(
      'deck: [',
      `${block},\n\n  deck: [`
    );
  }
  // Fallback: insert before the closing of the default export
  // Find the last "};" or "}" that closes the export default
  else {
    console.log(`  ⚠️  ${rel} — no deck field found, inserting before closing brace`);
    const lastBrace = content.lastIndexOf('};');
    if (lastBrace >= 0) {
      content = content.slice(0, lastBrace) + `${block},\n` + content.slice(lastBrace);
    } else {
      console.log(`  ❌ ${rel} — could not find insertion point, skipping`);
      return;
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`  ✅ ${rel}`);
  patchCount++;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  Add aiContributions to Data Files                  ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  if (!fs.existsSync(path.join(ROOT, 'data', 'encounters-combined'))) {
    console.error('ERROR: Run from project root (where data/encounters-combined/ exists).');
    process.exit(1);
  }

  console.log('\n── Encounters ──\n');
  for (const [key, ai] of Object.entries(ENCOUNTER_AI)) {
    const filePath = path.join(ROOT, 'data', 'encounters-combined', `${key}.js`);
    patchFile(filePath, ai);
  }

  console.log('\n── Members ──\n');
  for (const [key, ai] of Object.entries(MEMBER_AI)) {
    const filePath = path.join(ROOT, 'data', 'members', `${key}.js`);
    patchFile(filePath, ai);
  }

  // Calibration verification
  console.log('\n── Calibration Check ──\n');

  // Sum Root Hollow + Whispering Gallery + Veil Breach
  const tactical3 = ['root-hollow', 'whispering-gallery', 'veil-breach'];
  const tSum = {};
  for (const key of tactical3) {
    for (const [cat, val] of Object.entries(ENCOUNTER_AI[key].baseWeights)) {
      tSum[cat] = (tSum[cat] || 0) + val;
    }
  }
  console.log('  Root+Whisper+Veil (should ≈ tactical profile):');
  console.log(`    ${Object.entries(tSum).map(([k,v]) => `${k}:${v.toFixed(1)}`).join(', ')}`);

  // Sum Standard Party
  const stdParty = ['knight', 'battlemage', 'cleric', 'rogue'];
  const pSum = {};
  let totalCoop = 0;
  for (const key of stdParty) {
    for (const [cat, val] of Object.entries(MEMBER_AI[key].baseWeights)) {
      pSum[cat] = (pSum[cat] || 0) + val;
    }
    totalCoop += MEMBER_AI[key].cooperationSensitivity;
  }
  console.log('  Knight+Battlemage+Cleric+Rogue (should ≈ party_balanced):');
  console.log(`    ${Object.entries(pSum).map(([k,v]) => `${k}:${v.toFixed(1)}`).join(', ')}`);
  console.log(`    cooperationSensitivity sum: ${totalCoop.toFixed(2)}`);

  console.log(`\n╔══════════════════════════════════════════════════════╗`);
  console.log(`║  COMPLETE — ${patchCount} files patched${' '.repeat(Math.max(0, 27 - String(patchCount).length))}║`);
  console.log(`╚══════════════════════════════════════════════════════╝`);
  console.log('\nVerify:');
  console.log('  node run.js --verbose        (engine still works)');
  console.log('  cd web && npm run dev        (archetypes show in composition screen)');
  console.log('\nThen delete this script:');
  console.log('  del add-ai-contributions.cjs');
}

main();
