# Shattered Dungeon — Local Simulation Framework

**Zero dependencies. Just Node.js.**

## Quick Start

```bash
# Run with defaults (1000 iterations, tactical dungeon vs aggressive boar)
node run.js

# Single verbose run (see every card play, every roll)
node run.js --verbose

# 5000 iterations with CSV + JSON output
node run.js -n 5000 --csv --json

# Change AI profiles
node run.js -d aggressive -v cautious_explorer -n 3000
```

## Setup

1. Install Node.js from https://nodejs.org (LTS version is fine)
2. Open terminal, navigate to this folder
3. Run `node run.js` — that's it. No npm install, no packages.

## Project Structure

```
shattered-dungeon-sim/
├── run.js                  ← CLI runner (start here)
├── engine/
│   ├── rules.js            ← Game physics (dice, resolution, resources, energy)
│   ├── encounter.js        ← Single encounter execution
│   └── sequence.js         ← Multi-encounter run + batch aggregation
├── ai/
│   ├── dungeon-ai.js       ← Dungeon card selection strategies
│   └── visitor-ai.js       ← Visitor card selection strategies
├── data/
│   ├── encounters/         ← Encounter definitions (auto-effect, initiative, tags)
│   ├── decks/              ← Card pools (dungeon + visitor decks per encounter)
│   ├── visitors/           ← Visitor stat blocks + modifier attributes
│   ├── scenarios/          ← Multi-encounter run configurations
│   └── dungeon-*.js        ← Dungeon stat blocks
└── output/                 ← Simulation results (CSV, JSON)
```

## The Four Layers

### 1. Rules Engine (`engine/rules.js`)
Game physics. Changes **rarely**. Implements:
- Contested 2d6 with 5 outcome tiers
- Advantage/Disadvantage (3d6 keep best/worst 2)
- 4v4 asymmetric resources (visitor: vitality/resolve/nerve/trust, dungeon: structure/veil/presence/rapport)
- Energy system with permanent pool growth + temporary boosts
- Keyword resolution (Entangle, Erode, Drain, etc.)
- Mulligan-guaranteed opening hands

### 2. AI Logic (`ai/`)
Parameterizable. Change by **tweaking weights**.

**Dungeon profiles:** aggressive, nurturing, tactical, deceptive
**Visitor profiles:** feral_aggressive, cautious_explorer, cooperative, desperate

Each profile is a set of weights:
```js
{
  strikeWeight: 3,      // How much the AI values Strike cards
  empowerWeight: 2,     // How much it values Empower
  offerWeight: 0,       // How much it values Offers
  preferredTargets: ['vitality', 'nerve'],  // Which resources to focus
  comboAwareness: 0.7,  // Probability of playing Empower before Strike
  // ... etc
}
```

### 3. Data Files (`data/`)
Where **90% of iteration happens**. Edit a deck, re-run, see what changes.

**Card format:**
```js
{
  name: 'Root Crush',
  category: 'Strike',     // Strike|Empower|Disrupt|Counter|React|Trap|Offer|Reshape|Energy
  type: 'Physical',       // Physical|Environmental|Social|Mystical
  cost: 2,                // Energy cost
  power: 3,               // Base damage/effect magnitude
  target: 'vitality',     // Which resource this targets
  keywords: ['Entangle'], // Mechanical keywords
  trigger: {              // Conditional bonus (optional)
    description: 'If entangled: +2 Power',
    condition: { type: 'has_condition', condition: 'entangled' },
    bonus: 2,
  },
}
```

### 4. Output (`output/`)
Results land here. Bring `latest.json` or a CSV back to Claude for analysis.

## Workflow

```
You                                Claude
 │                                   │
 ├─ Edit deck/AI/encounter ──────►   │
 ├─ node run.js -n 5000 --json      │
 ├─ Read output/latest.json         │
 ├─ Paste results ──────────────►   │
 │                              Interprets, suggests changes
 │   ◄──────────────────────── Returns updated deck/AI/config
 ├─ Apply changes                    │
 ├─ Re-run                          │
 └─ (repeat)                        │
```

## CLI Reference

| Flag | Short | Default | Description |
|------|-------|---------|-------------|
| `--iterations` | `-n` | 1000 | Number of simulation runs |
| `--dungeon` | `-d` | tactical | Dungeon AI profile |
| `--visitor` | `-v` | feral_aggressive | Visitor AI profile |
| `--scenario` | `-s` | verdant-maw-vs-boar | Scenario file path |
| `--verbose` | | false | Full log of single run |
| `--csv` | | false | Write CSV to output/ |
| `--json` | | false | Write JSON to output/ |
| `--help` | `-h` | | Show help |

## What To Tweak

**Deck balance:** Edit card pools in `data/decks/`. Change power values, costs, keywords, add/remove cards.

**AI behavior:** Edit weights in `ai/dungeon-ai.js` or `ai/visitor-ai.js`. Or create custom profiles.

**Resource tuning:** Edit starting values in `data/visitors/` and `data/dungeon-*.js`.

**Encounter properties:** Edit auto-effects and initiative in `data/encounters/`.

**New scenarios:** Create a new file in `data/scenarios/` following the existing pattern.
