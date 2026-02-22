/**
 * VISITOR: The Arcane Expedition (v2.6b — Defensive Rework)
 * 
 * A caster-heavy party: Warden (tank), Sorcerer (damage caster),
 * Druid (utility/heals), Ranger (ranged DPS).
 * 
 * ═══════════════════════════════════════════════════════════════
 * CLASS PROFILES
 * ═══════════════════════════════════════════════════════════════
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ WARDEN (Tank / Guardian / Setup)                            │
 * │ Vitality: 11 | Resolve +4, Nerve +3                        │
 * ├─────────────────────────────────────────────────────────────┤
 * │ PURPOSE: The Warden is the party's anchor and protector.    │
 * │ She controls the battlefield through Entangle setup and     │
 * │ Guardian Stance, forcing the dungeon to either spend extra  │
 * │ power punching through defenses or redirect aggression onto │
 * │ the Warden's deep health pool — which is exactly what the   │
 * │ party wants.                                                │
 * │                                                             │
 * │ STRENGTHS:                                                  │
 * │  • Highest vitality (11) — absorbs sustained pressure       │
 * │  • Guardian Stance protects squishy casters (-2P to Strikes │
 * │    targeting the Guarded ally)                               │
 * │  • Shield of Thorns provides Entangle for Sorcerer combos   │
 * │  • Nature's Renewal restores a downed ally at 40%           │
 * │  • Stone Wall punishes aggressive dungeon Strikes            │
 * │  • Highest resolve contribution (+4) — party backbone       │
 * │                                                             │
 * │ WEAKNESSES:                                                 │
 * │  • Low damage output — relies on others for kill pressure    │
 * │  • Only Physical/Environmental cards — no Mystical access    │
 * │  • Guardian Stance costs a full turn of offense              │
 * │  • If Warden goes down (unlikely), party loses its only     │
 * │    tank mechanic and biggest resolve chunk                   │
 * │                                                             │
 * │ PLAY PATTERN: Open with energy, set up Entangle for         │
 * │ Sorcerer combos, then alternate between Guardian Stance     │
 * │ (when dungeon is aggressive) and structure Strikes (when    │
 * │ dungeon is passive). Save Nature's Renewal for critical     │
 * │ knockout recovery moments.                                   │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ SORCERER (Burst DPS / Glass Cannon)                         │
 * │ Vitality: 5 | Resolve +2, Nerve +5                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ PURPOSE: The Sorcerer is the party's primary damage threat. │
 * │ She delivers devastating veil pressure through Eldritch     │
 * │ Burst (4P+Overwhelm) and Chain Lightning combos. Her low   │
 * │ vitality makes her the dungeon's priority target, creating  │
 * │ the central tactical tension: can the party protect her     │
 * │ long enough to deliver her burst damage?                    │
 * │                                                             │
 * │ STRENGTHS:                                                  │
 * │  • Highest single-turn damage (Eldritch Burst: 4P veil     │
 * │    with Overwhelm spillover into resolve)                    │
 * │  • Chain Lightning combos off Entangle for +2P bonus        │
 * │  • Hex deters dungeon aggression (veil thorns on Strike)    │
 * │  • Arcane Ward provides self-shielding (Fortify 2 for 2    │
 * │    rounds + 1 vitality heal)                                 │
 * │  • Mana Shield spreads Fortify to allies when warded        │
 * │  • Arcane Barrier (React) snowballs into Fortify on success │
 * │  • Highest nerve contribution (+5) — Panic anchor           │
 * │                                                             │
 * │ WEAKNESSES:                                                 │
 * │  • Lowest vitality (5) — can be knocked out in 2-3 hits    │
 * │  • Lowest resolve contribution (+2) — morale cascade hurts  │
 * │  • Defensive tools cost turns that could be burst damage    │
 * │  • Expensive cards (Eldritch Burst costs 3 energy)          │
 * │  • If knocked out, party loses primary damage threat AND    │
 * │    Hex deterrent — dungeon can attack freely                │
 * │                                                             │
 * │ PLAY PATTERN: The core glass cannon decision each round:    │
 * │ blast or shield? Against aggressive dungeons, open with     │
 * │ Arcane Ward to survive the initial onslaught, then burst    │
 * │ when the Fortify window is active. Against passive dungeons │
 * │ skip defenses and maximize damage. Hex early to deter       │
 * │ Strikes while setting up. Mana Shield when warded to        │
 * │ cascade protection to allies.                                │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ DRUID (Support / Healer / Sustain Amplifier)                │
 * │ Vitality: 6 | Resolve +3, Nerve +5                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ PURPOSE: The Druid is the party's sustain engine. She heals │
 * │ damage, extends defensive buffs placed by other members,    │
 * │ restores downed allies, and provides the only cooperative   │
 * │ pathway (Offer/Test). She amplifies the Warden and          │
 * │ Sorcerer's defensive plays through Fortify extension.       │
 * │                                                             │
 * │ STRENGTHS:                                                  │
 * │  • Healing Touch heals weakest member AND extends Fortify   │
 * │    duration — amplifies Warden/Sorcerer defensive plays     │
 * │  • Restoration brings back downed allies at 40%             │
 * │  • Thorn Whip provides secondary Entangle source for       │
 * │    Sorcerer combos (party isn't reliant solely on Warden)   │
 * │  • Two Attune energy cards (Environmental + Mystical)        │
 * │    discount the entire party's diverse card types            │
 * │  • Peaceful Offering / Commune provide Bond pathway          │
 * │  • Barkskin Blessing provides cheap Fortify + minor heal     │
 * │  • Tied highest nerve contribution (+5) — Panic anchor      │
 * │                                                             │
 * │ WEAKNESSES:                                                 │
 * │  • Low vitality (6) — second squishiest, a viable KO target │
 * │  • Minimal direct damage — only Thorn Whip (1P)             │
 * │  • Healing is reactive, not preventive (heals after damage)  │
 * │  • If knocked out, party loses ALL healing, Fortify          │
 * │    extension, restoration capability, and Bond pathway       │
 * │  • Expensive restoration (cost 3) competes with other plays  │
 * │                                                             │
 * │ PLAY PATTERN: Energy first (Attune to discount key cards),  │
 * │ then read the board. If allies have Fortify, prioritize     │
 * │ Healing Touch to extend it. If Sorcerer is wounded, heal    │
 * │ her. Play Thorn Whip when Warden can't set up Entangle and │
 * │ Sorcerer has Chain Lightning ready. Save Restoration for    │
 * │ after the first knockout. Offer/Test against nurturing      │
 * │ dungeons only.                                               │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ RANGER (Ranged DPS / Pressure / Deterrent)                  │
 * │ Vitality: 7 | Resolve +3, Nerve +4                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ PURPOSE: The Ranger provides consistent, efficient damage   │
 * │ with persistent effects (Erode) and punishes dungeon        │
 * │ aggression through traps. She's the "steady hand" —         │
 * │ less flashy than the Sorcerer but more reliable, with       │
 * │ Siphon energy rewarding sustained pressure campaigns.       │
 * │                                                             │
 * │ STRENGTHS:                                                  │
 * │  • Piercing Arrow (3P structure + Erode) — best sustained   │
 * │    structure pressure in the party                            │
 * │  • Nature's Snare deters dungeon Strikes (2 structure trap)  │
 * │  • Siphon energy becomes permanent when veil < 50% or       │
 * │    opponent is Entangled — rewards team synergy              │
 * │  • Evasive Counter removes conditions AND applies Entangle   │
 * │  • Poisoned Arrow provides cheap veil Erode                  │
 * │  • Middle-of-pack vitality (7) — not a priority target      │
 * │                                                             │
 * │ WEAKNESSES:                                                 │
 * │  • No party protection tools — can't help squishy members   │
 * │  • No healing, no Fortify, no mitigation for others          │
 * │  • Only Physical/Environmental — no Mystical damage          │
 * │  • Trap is one-shot and situational                          │
 * │  • If knocked out, party loses Erode pressure and trap       │
 * │    deterrent — less impactful than losing Sorcerer/Druid    │
 * │                                                             │
 * │ PLAY PATTERN: Consistent damage every round. Open with       │
 * │ Focused Aim, then alternate Precise Shot / Piercing Arrow   │
 * │ for structure pressure. Play Nature's Snare early against    │
 * │ aggressive profiles to create a "don't Strike" window.      │
 * │ Siphon energy mid-game once veil pressure or Entangle       │
 * │ makes it permanent. Evasive Counter when dungeon has         │
 * │ dangerous Empowers or Disrupts active.                       │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ═══════════════════════════════════════════════════════════════
 * PARTY-LEVEL STRATEGY
 * ═══════════════════════════════════════════════════════════════
 * 
 * VULNERABILITY PROFILE (vs Standard Adventuring Company):
 *   Vitality: 29 (vs 30) → Similar Kill vulnerability
 *   Resolve:  12 (vs 14) → More Break-vulnerable
 *   Nerve:    17 (vs 16) → More Panic-resistant
 * 
 * DEFENSIVE TOOLKIT (v2.6b rework):
 *   Guardian Stance (Warden) → Guarded reduces Strike power by 2
 *   Arcane Ward (Sorcerer) → Fortify 2 self for 2 rounds + heal
 *   Mana Shield (Sorcerer) → Spreads Fortify to allies, removes conditions
 *   Arcane Barrier (React) → Fortify 1 on success (snowball defense)
 *   Healing Touch (Druid) → Extends Fortify duration on target
 *   These chain: Warden Guards → Sorcerer Wards → Druid Extends
 * 
 * TARGETING DILEMMA (dungeon perspective):
 *   Kill Sorcerer → Eliminates burst damage + Hex deterrent + ward cascade
 *   Kill Druid → Eliminates healing + Fortify extension + restoration
 *   Kill Warden → Eliminates Guardian Stance protection (but very hard at 11 vit)
 *   Kill Ranger → Least impactful (loses Erode pressure + trap)
 *   Smart dungeons target Druid first (kills sustain), aggressive ones target
 *   Sorcerer (lowest HP). Both are valid, creating genuine choice.
 */
export default {
  name: 'The Arcane Expedition',
  type: 'party',
  partySize: 4,

  // ── COLLECTIVE POOLS ──
  resolve: 20,    // Lower than Standard (14) → Break-vulnerable
  nerve: 21,      // Higher than Standard (16) → Panic-resistant
  trust: 0,

  // ── INDIVIDUAL MEMBERS ──
  members: {
    warden: {
      name: 'Warden',
      role: 'tank',
      vitality: 11,
      resolveContribution: 6,
      nerveContribution: 4,
    },
    sorcerer: {
      name: 'Sorcerer',
      role: 'dps',
      vitality: 5,
      resolveContribution: 4,
      nerveContribution: 6,
    },
    druid: {
      name: 'Druid',
      role: 'support',
      vitality: 6,
      resolveContribution: 5,
      nerveContribution: 6,
    },
    ranger: {
      name: 'Ranger',
      role: 'dps',
      vitality: 7,
      resolveContribution: 5,
      nerveContribution: 5,
    },
  },

  // ── KNOCKOUT MECHANICS ──
  killThreshold: 2,       // 2 knockouts = Kill
  knockoutMorale: [
    { resolveHit: 3, nerveHit: 3 },   // First knockout: moderate shock
    { resolveHit: 5, nerveHit: 5 },    // Second knockout: severe (triggers Kill anyway)
  ],

  // ── ATTRIBUTES (modifier bonuses for card rolls) ──
  // More magical than Standard: perception/cunning from casters
  modifiers: {
    strength: 1,      // Warden contribution (lower than Standard's Knight)
    cunning: 1,       // Ranger contribution
    perception: 2,    // Sorcerer + Druid contribution (higher than Standard)
    resilience: 0,    // No dedicated tank bonus
  },
};