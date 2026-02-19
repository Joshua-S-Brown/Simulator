/**
 * VISITOR: Standard Adventuring Company (v2.4c — tuned)
 * 
 * A balanced 4-member party: Knight (tank), Battlemage (dps),
 * Cleric (support), Rogue (flex).
 * 
 * TUNING HISTORY:
 *   v2.4  → Original: resolve 18, nerve 18, total vit 35
 *           Result: 73.5% Survive, 19.5% Kill, 7% Panic, 0% Break
 *           Problem: Party too survivable, only 4 of 8 outcomes
 *
 *   v2.4b → Reduced all pools: resolve 14, nerve 14, total vit 29
 *           Result: 23.8% Survive, 35.1% Kill, 40.8% Panic, 0.3% Break
 *           Problem: Nerve too shallow — Panic exploded to 41%
 *
 *   v2.4c → Nerve 14→16, Cleric vit 6→7
 *           Rationale: Nerve absorbs ~5 auto-drain + ~3 Erode + 3 cascade
 *           over a typical game. At 14, that's guaranteed depletion.
 *           At 16, Panic requires bad draws or aggressive dungeon play.
 *           Cleric at 6 dies too fast as tactical AI priority target —
 *           losing healer early removes restoration safety valve AND
 *           triggers cascade that accelerates Panic.
 *           Target: Survive ~35-45%, Kill ~30-35%, Panic ~20-28%, Break ~3-8%
 * 
 * Party mechanics:
 *   - Individual vitality per member (knockout at 0)
 *   - Collective resolve/nerve pools (Break/Panic still collective)
 *   - Kill threshold: 2 knockouts = Kill
 *   - Morale cascade: each knockout damages collective pools
 *   - Healing Word can restore knocked-out members
 */
module.exports = {
  name: 'Standard Adventuring Company',
  type: 'party',
  partySize: 4,

  // ── COLLECTIVE POOLS ──
  resolve: 14,
  nerve: 16,
  trust: 0,

  // ── INDIVIDUAL MEMBERS ──
  members: {
    knight: {
      name: 'Knight',
      role: 'tank',
      vitality: 10,
      resolveContribution: 5,
      nerveContribution: 4,
    },
    battlemage: {
      name: 'Battlemage',
      role: 'dps',
      vitality: 7,
      resolveContribution: 3,
      nerveContribution: 4,
    },
    cleric: {
      name: 'Cleric',
      role: 'support',
      vitality: 7,
      resolveContribution: 4,
      nerveContribution: 4,
    },
    rogue: {
      name: 'Rogue',
      role: 'flex',
      vitality: 6,
      resolveContribution: 2,
      nerveContribution: 4,
    },
  },

  // ── KNOCKOUT MECHANICS ──
  killThreshold: 2,       // 2 knockouts = Kill
  knockoutMorale: [
    { resolveHit: 3, nerveHit: 3 },   // First knockout: moderate shock
    { resolveHit: 5, nerveHit: 5 },    // Second knockout: severe (but triggers Kill anyway)
  ],

  // ── ATTRIBUTES (modifier bonuses for card rolls) ──
  modifiers: {
    strength: 1,      // Knight contribution
    cunning: 1,       // Rogue contribution
    perception: 1,    // Battlemage contribution
    resilience: 0,    // No dedicated healer bonus
  },
};