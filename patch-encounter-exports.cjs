#!/usr/bin/env node
/**
 * PATCH: encounter.js — Export resolution functions for GameEngine adapter
 *
 * Phase 2 requires the game adapter to call individual resolution functions
 * (resolveStrike, resolveReshape, etc.) one card at a time. These functions
 * are already defined at module scope in encounter.js but only runEncounter
 * is exported. This patch adds them to the export statement.
 *
 * WHAT IT CHANGES:
 *   export { runEncounter };
 *   →
 *   export { runEncounter, resolveStrike, ... };
 *
 * runEncounter and all sim/CLI tools continue working identically.
 *
 * USAGE: node patch-encounter-exports.cjs
 * RUN FROM: Simulator/ (repo root)
 */

const fs = require('fs');
const path = require('path');

const ENCOUNTER_PATH = path.join(__dirname, 'engine', 'encounter.js');

// ── Read file ──
let content;
try {
  content = fs.readFileSync(ENCOUNTER_PATH, 'utf-8');
} catch (err) {
  console.error(`❌ Could not read ${ENCOUNTER_PATH}`);
  console.error(`   Run this script from the Simulator/ repo root.`);
  process.exit(1);
}

// ── Verify current export ──
const OLD_EXPORT = `export { runEncounter };`;

if (!content.includes(OLD_EXPORT)) {
  // Check if already patched
  if (content.includes('export { runEncounter,')) {
    console.log('✅ encounter.js already patched — exports are expanded.');
    process.exit(0);
  }
  console.error(`❌ Could not find expected export line: "${OLD_EXPORT}"`);
  console.error(`   encounter.js may have been modified. Check the last line.`);
  process.exit(1);
}

// ── New export statement ──
// These are all the module-scoped functions the game adapter needs.
// They're already defined in encounter.js — we're just making them accessible.
const NEW_EXPORT = `export {
  // Existing
  runEncounter,

  // Resolution functions (used by game-adapter.js for step-by-step play)
  resolveStrike,
  resolveReshape,
  resolveOffer,
  resolveTest,
  resolveGuardDisrupt,
  resolveSpreadFortify,
  checkTraps,
  tryReact,
  clearEntangle,
  applyPromoterGain,
  evaluateTrigger,
  getTriggerBonus,
  executeTurn,
};`;

// ── Apply patch ──
content = content.replace(OLD_EXPORT, NEW_EXPORT);
fs.writeFileSync(ENCOUNTER_PATH, content, 'utf-8');

console.log('✅ encounter.js patched — resolution functions now exported.');
console.log('   runEncounter still works identically for sims/CLI.');
console.log('   New exports: resolveStrike, resolveReshape, resolveOffer, resolveTest,');
console.log('   resolveGuardDisrupt, resolveSpreadFortify, checkTraps, tryReact,');
console.log('   clearEntangle, applyPromoterGain, evaluateTrigger, getTriggerBonus,');
console.log('   executeTurn');
