#!/usr/bin/env node
/**
 * MIGRATION: Combine Separate Files into Compositional Format
 *
 * Reads existing encounter/deck/visitor/member files and produces
 * combined files that are the new source of truth.
 *
 * RUN:
 *   node migrate-to-combined.js              # Dry run (shows what it would do)
 *   node migrate-to-combined.js --write      # Actually write files
 *   node migrate-to-combined.js --write --validate  # Write + validate
 *
 * PRODUCES:
 *   data/encounters-combined/    ← encounter def + deck + contributions
 *     root-hollow.js
 *     whispering-gallery.js
 *     veil-breach.js
 *     honeyed-hollow.js
 *     living-root-sanctuary.js
 *
 *   data/members/                ← member stats + deck + modifier contributions
 *     knight.js
 *     battlemage.js
 *     cleric.js
 *     rogue.js
 *     warden.js
 *     sorcerer.js
 *     druid.js
 *     ranger.js
 *
 *   data/creatures/              ← creature template + deck
 *     thornback-boar.js
 *     veil-moth.js
 *     drift-symbiote.js
 *
 * Does NOT modify or delete any existing files.
 */

import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = __dirname;
const resolve = (...parts) => path.join(ROOT, ...parts);

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — Encounter contributions & modifier contributions
// ═══════════════════════════════════════════════════════════════

/**
 * Dungeon resource contributions per encounter.
 *
 * Derived from existing Verdant Maw baseline (structure:16, veil:14, presence:12)
 * distributed across Root Hollow + Whispering Gallery + Veil Breach (sum matches).
 * Remaining encounters (Honeyed Hollow, Living Root Sanctuary) assigned based on
 * thematic identity.
 *
 * All 10 possible 3-encounter combinations produce:
 *   Structure: 13–17   Veil: 11–14   Presence: 11–15   Total: 40–42
 */
const ENCOUNTER_CONTRIBUTIONS = {
  'root-hollow':           { structure: 7, veil: 4, presence: 3 },
  'whispering-gallery':    { structure: 4, veil: 5, presence: 5 },
  'veil-breach':           { structure: 5, veil: 5, presence: 4 },
  'honeyed-hollow':        { structure: 4, veil: 3, presence: 6 },
  'living-root-sanctuary': { structure: 5, veil: 4, presence: 4 },
};

/**
 * Dungeon modifier contributions per encounter.
 *
 * Root Hollow + Whispering Gallery + Veil Breach sums to existing
 * Verdant Maw modifiers: dominion:2, resonance:1, presence_attr:1, memory:0.
 */
const ENCOUNTER_MODIFIER_CONTRIBUTIONS = {
  'root-hollow':           { dominion: 1, resonance: 0, presence_attr: 0, memory: 0 },
  'whispering-gallery':    { dominion: 0, resonance: 0, presence_attr: 1, memory: 0 },
  'veil-breach':           { dominion: 1, resonance: 1, presence_attr: 0, memory: 0 },
  'honeyed-hollow':        { dominion: 0, resonance: 0, presence_attr: 1, memory: 0 },
  'living-root-sanctuary': { dominion: 0, resonance: 1, presence_attr: 0, memory: 0 },
};

/**
 * Member modifier contributions.
 *
 * Standard Party (Knight, Battlemage, Cleric, Rogue) sums to
 * existing modifiers: strength:1, cunning:1, perception:1, resilience:0.
 *
 * Arcane Expedition (Warden, Sorcerer, Druid, Ranger) sums to
 * existing modifiers: strength:1, cunning:1, perception:2, resilience:0.
 */
const MEMBER_MODIFIER_CONTRIBUTIONS = {
  knight:     { strength: 1, cunning: 0, perception: 0, resilience: 0 },
  battlemage: { strength: 0, cunning: 0, perception: 1, resilience: 0 },
  cleric:     { strength: 0, cunning: 0, perception: 0, resilience: 0 },
  rogue:      { strength: 0, cunning: 1, perception: 0, resilience: 0 },
  warden:     { strength: 1, cunning: 0, perception: 0, resilience: 0 },
  sorcerer:   { strength: 0, cunning: 0, perception: 1, resilience: 0 },
  druid:      { strength: 0, cunning: 0, perception: 1, resilience: 0 },
  ranger:     { strength: 0, cunning: 1, perception: 0, resilience: 0 },
};

// ═══════════════════════════════════════════════════════════════
// SOURCE FILE MAPPINGS
// ═══════════════════════════════════════════════════════════════

const ENCOUNTER_SOURCES = {
  'root-hollow': {
    encounter: 'data/encounters/root-hollow.js',
    deck:      'data/decks/dungeon-root-hollow.js',
  },
  'whispering-gallery': {
    encounter: 'data/encounters/whispering-gallery.js',
    deck:      'data/decks/dungeon-whispering-gallery.js',
  },
  'veil-breach': {
    encounter: 'data/encounters/veil-breach.js',
    deck:      'data/decks/dungeon-veil-breach.js',
  },
  'honeyed-hollow': {
    encounter: 'data/encounters/honeyed-hollow.js',
    deck:      'data/decks/dungeon-honeyed-hollow.js',
  },
  'living-root-sanctuary': {
    encounter: 'data/encounters/living-root-sanctuary.js',
    deck:      'data/decks/dungeon-living-root-sanctuary.js',
  },
};

const CREATURE_SOURCES = {
  'thornback-boar': {
    template: 'data/visitors/thornback-boar.js',
    deck:     'data/decks/visitor-thornback-boar.js',
  },
  'veil-moth': {
    template: 'data/visitors/veil-moth.js',
    deck:     'data/decks/visitor-veil-moth.js',
  },
  'drift-symbiote': {
    template: 'data/visitors/drift-symbiote.js',
    deck:     'data/decks/visitor-drift-symbiote.js',
  },
};

// Member stats extracted from party template files
const PARTY_TEMPLATES = {
  'standard-party': 'data/visitors/standard-adventuring-company.js',
  'arcane-expedition': 'data/visitors/arcane-expedition.js',
};

const MEMBER_SOURCES = {
  knight:     { deck: 'data/decks/members/knight.js',     party: 'standard-party' },
  battlemage: { deck: 'data/decks/members/battlemage.js', party: 'standard-party' },
  cleric:     { deck: 'data/decks/members/cleric.js',     party: 'standard-party' },
  rogue:      { deck: 'data/decks/members/rogue.js',       party: 'standard-party' },
  warden:     { deck: 'data/decks/members/warden.js',     party: 'arcane-expedition' },
  sorcerer:   { deck: 'data/decks/members/sorcerer.js',   party: 'arcane-expedition' },
  druid:      { deck: 'data/decks/members/druid.js',       party: 'arcane-expedition' },
  ranger:     { deck: 'data/decks/members/ranger.js',     party: 'arcane-expedition' },
};

// ═══════════════════════════════════════════════════════════════
// SERIALIZATION
// ═══════════════════════════════════════════════════════════════

/**
 * Serialize a JS value to source code string.
 * Handles objects, arrays, strings, numbers, booleans, null, undefined.
 */
function serialize(val, indent = 0) {
  const pad = '  '.repeat(indent);
  const pad1 = '  '.repeat(indent + 1);
  const pad2 = '  '.repeat(indent + 2);

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'boolean') return String(val);
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') return quote(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';

    // If array of objects (like cards), format each on multiple lines
    if (typeof val[0] === 'object' && val[0] !== null && !Array.isArray(val[0])) {
      const items = val.map(item => `${pad1}${serializeCard(item, indent + 1)}`);
      return `[\n${items.join(',\n')},\n${pad}]`;
    }

    // Simple array (strings, numbers)
    if (val.every(v => typeof v === 'string' || typeof v === 'number')) {
      const inner = val.map(v => typeof v === 'string' ? quote(v) : String(v)).join(', ');
      if (inner.length < 70) return `[${inner}]`;
    }

    const items = val.map(item => `${pad1}${serialize(item, indent + 1)}`);
    return `[\n${items.join(',\n')},\n${pad}]`;
  }

  if (typeof val === 'object') {
    const entries = Object.entries(val).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return '{}';

    const inner = entries.map(([k, v]) => {
      const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : quote(k);
      return `${pad1}${key}: ${serialize(v, indent + 1)}`;
    });

    if (inner.join(', ').length < 70 && !inner.some(s => s.includes('\n'))) {
      const flat = entries.map(([k, v]) => {
        const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : quote(k);
        return `${key}: ${serialize(v, 0)}`;
      }).join(', ');
      if (flat.length < 70) return `{ ${flat} }`;
    }

    return `{\n${inner.join(',\n')},\n${pad}}`;
  }

  return String(val);
}

/** Serialize a card object on ~one line per property group */
function serializeCard(card, indent) {
  const pad = '  '.repeat(indent);
  const entries = Object.entries(card);
  const parts = [];

  for (const [key, val] of entries) {
    const k = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : quote(key);
    parts.push(`${k}: ${serialize(val, indent)}`);
  }

  // Try single line first
  const oneLine = `{ ${parts.join(', ')} }`;
  if (oneLine.length < 120) return oneLine;

  // Multi-line with smart grouping
  const lines = [];
  let currentLine = [];
  let lineLen = 0;

  for (const part of parts) {
    if (lineLen + part.length > 100 && currentLine.length > 0) {
      lines.push(currentLine.join(', '));
      currentLine = [part];
      lineLen = part.length;
    } else {
      currentLine.push(part);
      lineLen += part.length + 2;
    }
  }
  if (currentLine.length > 0) lines.push(currentLine.join(', '));

  if (lines.length === 1) return `{ ${lines[0]} }`;
  const pad1 = '  '.repeat(indent + 1);
  return `{ ${lines[0]},\n${lines.slice(1).map(l => `${pad1}${l}`).join(',\n')} }`;
}

function quote(s) {
  // Use single quotes, escape internal single quotes
  const escaped = s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `'${escaped}'`;
}

// ═══════════════════════════════════════════════════════════════
// ENCOUNTER MIGRATION
// ═══════════════════════════════════════════════════════════════

function migrateEncounters(dryRun) {
  console.log('\n── ENCOUNTERS ──');
  const outDir = resolve('data', 'encounters-combined');

  if (!dryRun) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const [key, src] of Object.entries(ENCOUNTER_SOURCES)) {
    const encounter = require(resolve(src.encounter));
    const deck = require(resolve(src.deck));
    const contributions = ENCOUNTER_CONTRIBUTIONS[key];
    const modContribs = ENCOUNTER_MODIFIER_CONTRIBUTIONS[key];

    const combined = {
      name: encounter.name,
      description: encounter.description,
      initiative: encounter.initiative,
      autoEffects: encounter.autoEffects,
      tags: encounter.tags,
      contributions,
      modifierContributions: modContribs,
      deck,
    };

    const outPath = path.join(outDir, `${key}.js`);

    if (dryRun) {
      console.log(`  ${key}: ${deck.length} cards, contributions: ${JSON.stringify(contributions)}`);
      console.log(`    → ${outPath}`);
    } else {
      const header = `/**\n * ENCOUNTER: ${encounter.name} (Combined Format)\n *\n * Room definition + dungeon deck + contribution stats.\n * Generated by migrate-to-combined.js from:\n *   ${src.encounter}\n *   ${src.deck}\n */\n`;
      const body = `export default ${serialize(combined, 0)};\n`;
      fs.writeFileSync(outPath, header + body);
      console.log(`  ✓ ${key} (${deck.length} cards) → ${outPath}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// MEMBER MIGRATION
// ═══════════════════════════════════════════════════════════════

function migrateMembers(dryRun) {
  console.log('\n── MEMBERS ──');
  const outDir = resolve('data', 'members');

  if (!dryRun) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Load party templates to extract member stats
  const partyData = {};
  for (const [partyKey, templatePath] of Object.entries(PARTY_TEMPLATES)) {
    partyData[partyKey] = require(resolve(templatePath));
  }

  for (const [memberKey, src] of Object.entries(MEMBER_SOURCES)) {
    const deck = require(resolve(src.deck));
    const partyTemplate = partyData[src.party];
    const memberStats = partyTemplate.members[memberKey];
    const modContribs = MEMBER_MODIFIER_CONTRIBUTIONS[memberKey];

    if (!memberStats) {
      console.log(`  ✗ ${memberKey}: member not found in ${src.party} template`);
      continue;
    }

    const combined = {
      name: memberStats.name,
      role: memberStats.role,
      vitality: memberStats.vitality,
      resolveContribution: memberStats.resolveContribution || 0,
      nerveContribution: memberStats.nerveContribution || 0,
      modifierContributions: modContribs,
      deck,
    };

    const outPath = path.join(outDir, `${memberKey}.js`);

    if (dryRun) {
      console.log(`  ${memberKey}: vit:${combined.vitality} res+${combined.resolveContribution} nrv+${combined.nerveContribution}, ${deck.length} cards`);
      console.log(`    → ${outPath}`);
    } else {
      const header = `/**\n * MEMBER: ${memberStats.name} (Combined Format)\n *\n * Member stats + 10-card deck + modifier contributions.\n * Generated by migrate-to-combined.js from:\n *   ${PARTY_TEMPLATES[src.party]} (member stats)\n *   ${src.deck} (deck)\n */\n`;
      const body = `export default ${serialize(combined, 0)};\n`;
      fs.writeFileSync(outPath, header + body);
      console.log(`  ✓ ${memberKey} (vit:${combined.vitality}, ${deck.length} cards) → ${outPath}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CREATURE MIGRATION
// ═══════════════════════════════════════════════════════════════

function migrateCreatures(dryRun) {
  console.log('\n── CREATURES ──');
  const outDir = resolve('data', 'creatures');

  if (!dryRun) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const [key, src] of Object.entries(CREATURE_SOURCES)) {
    const template = require(resolve(src.template));
    const deck = require(resolve(src.deck));

    const combined = {
      name: template.name,
      type: 'creature',
      vitality: template.vitality,
      resolve: template.resolve,
      nerve: template.nerve,
      trust: template.trust || 0,
      modifiers: template.modifiers,
      motivation: template.motivation,
      aiProfile: template.aiProfile,
      deck,
    };

    const outPath = path.join(outDir, `${key}.js`);

    if (dryRun) {
      console.log(`  ${key}: vit:${combined.vitality} res:${combined.resolve} nrv:${combined.nerve}, ${deck.length} cards`);
      console.log(`    → ${outPath}`);
    } else {
      const header = `/**\n * CREATURE: ${template.name} (Combined Format)\n *\n * Creature template + deck.\n * Generated by migrate-to-combined.js from:\n *   ${src.template}\n *   ${src.deck}\n */\n`;
      const body = `export default ${serialize(combined, 0)};\n`;
      fs.writeFileSync(outPath, header + body);
      console.log(`  ✓ ${key} (vit:${combined.vitality}, ${deck.length} cards) → ${outPath}`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════

function validate() {
  console.log('\n── VALIDATION ──');
  let pass = 0, fail = 0;

  function check(cond, msg) {
    if (cond) { pass++; console.log(`  ✓ ${msg}`); }
    else { fail++; console.log(`  ✗ ${msg}`); }
  }

  // Validate encounters
  for (const [key, src] of Object.entries(ENCOUNTER_SOURCES)) {
    const combined = require(resolve('data', 'encounters-combined', `${key}.js`));
    const origEnc = require(resolve(src.encounter));
    const origDeck = require(resolve(src.deck));

    check(combined.name === origEnc.name, `${key}: name matches`);
    check(combined.initiative === origEnc.initiative, `${key}: initiative matches`);
    check(JSON.stringify(combined.autoEffects) === JSON.stringify(origEnc.autoEffects), `${key}: autoEffects match`);
    check(JSON.stringify(combined.tags) === JSON.stringify(origEnc.tags), `${key}: tags match`);
    check(combined.deck.length === origDeck.length, `${key}: deck length ${combined.deck.length} === ${origDeck.length}`);
    check(
      combined.deck.every((c, i) => c.name === origDeck[i].name),
      `${key}: all card names match`
    );
    check(combined.contributions !== undefined, `${key}: has contributions`);
    check(combined.modifierContributions !== undefined, `${key}: has modifierContributions`);
  }

  // Validate contributions sum to Verdant Maw baseline
  const baselineEncounters = ['root-hollow', 'whispering-gallery', 'veil-breach'];
  const sums = { structure: 0, veil: 0, presence: 0 };
  const modSums = { dominion: 0, resonance: 0, presence_attr: 0, memory: 0 };
  for (const key of baselineEncounters) {
    const c = ENCOUNTER_CONTRIBUTIONS[key];
    const m = ENCOUNTER_MODIFIER_CONTRIBUTIONS[key];
    sums.structure += c.structure;
    sums.veil += c.veil;
    sums.presence += c.presence;
    for (const [mk, mv] of Object.entries(m)) modSums[mk] += mv;
  }
  check(sums.structure === 16, `baseline structure: ${sums.structure} === 16`);
  check(sums.veil === 14, `baseline veil: ${sums.veil} === 14`);
  check(sums.presence === 12, `baseline presence: ${sums.presence} === 12`);
  check(modSums.dominion === 2, `baseline dominion: ${modSums.dominion} === 2`);
  check(modSums.resonance === 1, `baseline resonance: ${modSums.resonance} === 1`);
  check(modSums.presence_attr === 1, `baseline presence_attr: ${modSums.presence_attr} === 1`);

  // Validate members
  for (const [memberKey, src] of Object.entries(MEMBER_SOURCES)) {
    const combined = require(resolve('data', 'members', `${memberKey}.js`));
    const origDeck = require(resolve(src.deck));
    const partyTemplate = require(resolve(PARTY_TEMPLATES[src.party]));
    const origStats = partyTemplate.members[memberKey];

    check(combined.name === origStats.name, `${memberKey}: name matches`);
    check(combined.vitality === origStats.vitality, `${memberKey}: vitality matches`);
    check(combined.resolveContribution === (origStats.resolveContribution || 0), `${memberKey}: resolveContribution matches`);
    check(combined.nerveContribution === (origStats.nerveContribution || 0), `${memberKey}: nerveContribution matches`);
    check(combined.deck.length === origDeck.length, `${memberKey}: deck length ${combined.deck.length} === ${origDeck.length}`);
    check(
      combined.deck.every((c, i) => c.name === origDeck[i].name),
      `${memberKey}: all card names match`
    );
  }

  // Validate member contributions sum to party stats
  for (const [partyKey, templatePath] of Object.entries(PARTY_TEMPLATES)) {
    const partyTemplate = require(resolve(templatePath));
    const memberKeys = Object.keys(partyTemplate.members);
    let resolveSum = 0, nerveSum = 0, vitalitySum = 0;
    const modSum = { strength: 0, cunning: 0, perception: 0, resilience: 0 };

    for (const mk of memberKeys) {
      const m = require(resolve('data', 'members', `${mk}.js`));
      resolveSum += m.resolveContribution;
      nerveSum += m.nerveContribution;
      vitalitySum += m.vitality;
      for (const [mod, val] of Object.entries(m.modifierContributions || {})) {
        modSum[mod] = (modSum[mod] || 0) + val;
      }
    }

    check(resolveSum === partyTemplate.resolve, `${partyKey}: resolve ${resolveSum} === ${partyTemplate.resolve}`);
    check(nerveSum === partyTemplate.nerve, `${partyKey}: nerve ${nerveSum} === ${partyTemplate.nerve}`);
    check(JSON.stringify(modSum) === JSON.stringify(partyTemplate.modifiers),
      `${partyKey}: modifiers ${JSON.stringify(modSum)} === ${JSON.stringify(partyTemplate.modifiers)}`);
  }

  // Validate creatures
  for (const [key, src] of Object.entries(CREATURE_SOURCES)) {
    const combined = require(resolve('data', 'creatures', `${key}.js`));
    const origTemplate = require(resolve(src.template));
    const origDeck = require(resolve(src.deck));

    check(combined.name === origTemplate.name, `${key}: name matches`);
    check(combined.vitality === origTemplate.vitality, `${key}: vitality matches`);
    check(combined.resolve === origTemplate.resolve, `${key}: resolve matches`);
    check(combined.nerve === origTemplate.nerve, `${key}: nerve matches`);
    check(combined.deck.length === origDeck.length, `${key}: deck length ${combined.deck.length} === ${origDeck.length}`);
    check(
      combined.deck.every((c, i) => c.name === origDeck[i].name),
      `${key}: all card names match`
    );
  }

  console.log(`\n  RESULTS: ${pass} passed, ${fail} failed`);
  return fail === 0;
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

function main() {
  const args = process.argv.slice(2);
  const doWrite = args.includes('--write');
  const doValidate = args.includes('--validate');
  const dryRun = !doWrite;

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  MIGRATION: Combine Files into Compositional Format     ║');
  console.log(`║  Mode: ${dryRun ? 'DRY RUN (use --write to execute)' : 'WRITING FILES'}${' '.repeat(dryRun ? 8 : 27)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  migrateEncounters(dryRun);
  migrateMembers(dryRun);
  migrateCreatures(dryRun);

  if (doWrite && doValidate) {
    // Clear require cache for newly written files
    Object.keys(require.cache).forEach(key => {
      if (key.includes('encounters-combined') || key.includes('data/members') || key.includes('data/creatures')) {
        delete require.cache[key];
      }
    });
    const ok = validate();
    process.exit(ok ? 0 : 1);
  } else if (dryRun) {
    console.log('\n  Dry run complete. Use --write to create files.');
    console.log('  Use --write --validate to create and validate.\n');
  } else {
    console.log('\n  Files written. Run with --validate to check correctness.\n');
  }
}

main();
