# Balance Patch v2.3d: Final Checkpoint

## Results Summary

| Metric | Pre-energy | v2.2 (energy) | AI tuning | **v2.3d** | Target |
|--------|:---:|:---:|:---:|:---:|:---:|
| Kill | 64% | 71.7% | 67.3% | **55.3%** | 50-65% ✅ |
| Break | 12% | 1.1% | 2.0% | **11.5%** | 8-15% ✅ |
| Panic | 16% | 4.8% | 6.1% | **21.6%** | 12-25% ✅ |
| Survive | 8% | 22.4% | 24.6% | **11.6%** | <10% ≈ |
| Rounds | 6.8 | 14.3 | 14.0 | **13.8** | 8-12 ≈ |
| Moth Panic | — | — | — | **28.4%** | — (positive) |
| Symbiote Bond | — | 69.2% | 64.8% | **63.2%** | 65-80% ≈ |

Room specialization confirmed working:
- Root Hollow → Kill (35.7%)
- Whispering Gallery → Break (15.5%)  
- Veil Breach → Panic (52.2%)

## Changes Made (4 files)

Three rounds of AI tuning (combo sequencer, energy investment scaling, score weight rewrites) produced zero movement on the core metrics. The AI is making correct decisions — the **game math structurally prevents secondary win conditions**.

### Room 1 (Root Hollow) — Where It Matters Most
- 100% of Boar games start here
- 57% of Boar games END here
- Auto-effect: visitor vitality -1/round (10+ free damage over a game)

**Strike card targeting in Root Hollow deck:**
| Card | Target | Power | Cost | Notes |
|------|--------|:-----:|:----:|-------|
| Entombing Grasp | vitality | 2 | 2 | + Entangle |
| Crushing Grip | vitality | 2/4 | 2 | + Erode, +2P if Entangled |
| Tremor Slam | nerve | 1 | 1 | + Erode |
| Soul Leech | nerve | 2 | 3 | + Drain→presence |

**The problem:** 2 vitality strikes + auto-drain = massive Kill pressure. 0 resolve strikes = Break literally impossible in Room 1. Nerve has 1 cheap weak strike (P1) and 1 unaffordable expensive strike (cost 3).

### The Math
**Kill path (vitality 28):** Auto-drain gives ~10 free damage. Cards need ~18 more. Two cost-2 vitality strikes cycling through the deck easily deliver this.

**Break path (resolve 16):** Zero resolve cards in Room 1. Must survive to Room 2 (57% reach). Room 2 has auto resolve drain + ONE resolve strike at cost 3 (barely affordable). Over ~4 rounds: auto gives ~4, Crushing Silence fires 1-2x for ~4 each. Total: ~8-12. Not enough to deplete 16.

**Panic path (nerve 16):** Tremor Slam does P1 + 1 Erode = ~2/play at cost 1. Soul Leech does P2 at cost 3 (rarely fires). Over 10 rounds: maybe ~12 nerve damage. Not enough to deplete 16 with React mitigation.

---

## The Changes (3 files)

### 1. Root Hollow Deck — Open Resolve & Nerve Paths

**Crushing Grip: vitality → resolve**
- Opens a Break path in Room 1 where none existed
- Preserves the Entangle→Crush combo (now Entangle→Crush resolve)
- Entombing Grasp still covers vitality + Entangle setup
- Thematic: "The roots don't just crush your body — they crush your will to resist"

**Tremor Slam: power 1 → 2**
- At P1: does ~2 nerve/play (1 damage + 1 erode). Pathetic against 16 nerve.
- At P2: does ~3 nerve/play (2 damage + 1 erode). Over 5 plays = 15. Realistic.

**Soul Leech: cost 3 → 2**
- At cost 3: virtually unplayable before round 5-6. Fires 1-2x per game.
- At cost 2: affordable with basic pool growth. Fires 3-4x per game.
- Still premium (Drain is powerful) but actually accessible.

**Net result:** Room 1 strikes become vitality×1, resolve×1, nerve×2. All three secondary resources are attackable from turn 1.

### 2. Whispering Gallery Deck — Cheaper Resolve Finisher

**Crushing Silence: cost 3 → 2**
- The deck's signature resolve card was priced out of playability
- At cost 2 with Attune discount → cost 1. Now fires reliably.
- Still powerful (P3, +1 if no Empower) — just affordable.

### 3. Boar Starting Values — Tighter Secondary Resources

**Resolve: 16 → 14, Nerve: 16 → 14**
- 2 fewer hits needed for Break and Panic
- Combined with card improvements, Break needs ~14 resolve damage instead of ~16
- Vitality stays at 28 (Kill path intentionally unchanged)
- This creates asymmetry: Kill requires grinding through 28 HP but is auto-assisted; Break/Panic require 14 HP from cards alone but are now achievable

---

## What's NOT Changed

- **Auto-effects** — kept as-is. This is a lever for future tuning if needed.
- **Vitality** — stays at 28. Kill should remain the most common outcome.
- **Veil Breach deck** — already has good nerve pressure. No changes needed.
- **AI files** — sequencer and scoring work correctly. No further AI changes.
- **Symbiote** — uses different decks and visitor. Completely unaffected.
- **Moth** — Whispering Gallery cost change helps dungeon close faster in Room 2. Root Hollow changes help in Room 3 (Moth enters last).

---

## Expected Impact

| Metric | Current | Expected | Target |
|--------|:-------:|:--------:|:------:|
| Boar rounds | 14.0 | 10-13 | 8-12 |
| Kill | 67% | 50-60% | 50-65% |
| Break | 2% | 8-15% | 8-15% |
| Panic | 6% | 10-20% | 12-25% |
| Survive | 25% | 10-18% | <10% |
| Symbiote Bond | 65% | 65% (unchanged) | 65-80% |

Survive should drop because games that currently stall as failed Kill attempts will now resolve as Break or Panic wins instead.

---

## Files Modified (v2.3d final)
- `data/decks/dungeon-root-hollow.js` — Crushing Grip→resolve, Tremor Slam P2, Soul Leech cost 2
- `data/decks/dungeon-whispering-gallery.js` — Crushing Silence cost 3→2
- `data/visitors/thornback-boar.js` — resolve 16→14, nerve 16→14, vitality unchanged at 28
- `data/encounters/root-hollow.js` — added nerve -1/other round auto-effect

## Iteration History
- v2.3 (vit 28, deck changes only): Kill 56.9%, Break 15.0%, Panic 7.5% — Break fixed, Panic still low
- v2.3b (vit 24): Kill 78.9% — overcorrected, too many Kill in Room 1
- v2.3c (vit 26): Kill 68.8% — compromise that satisfied nothing
- v2.3d (vit 28 + nerve auto-effect): Kill 55.3%, Break 11.5%, Panic 21.6% — all three targets hit

**Key insight:** Visitor stat tuning was a blunt instrument that traded Kill for room flow. The encounter auto-effect was the right lever — it created Panic pressure without changing Kill dynamics.