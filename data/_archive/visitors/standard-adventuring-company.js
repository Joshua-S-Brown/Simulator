/**
 * VISITOR: Standard Adventuring Company (v2.6b)
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
 *   v2.6b → Divine Ward bug fix (alwaysFortify → absorb). No stat changes.
 *           Results (3-room, 1000 iterations each):
 *             Aggressive: Kill 17.2%, Panic 18%, Break 33.8%, Survive 31%
 *             Nurturing:  Kill 27.9%, Panic 23.3%, Break 11.7%, Survive 37.1%
 *             Deceptive:  Kill 33.6%, Panic 22.3%, Break 15.9%, Survive 28.2%
 *             Tactical:   Kill 37.5%, Panic 20.9%, Break 15.2%, Survive 26.4%
 * 
 * ═══════════════════════════════════════════════════════════════
 * CLASS PROFILES
 * ═══════════════════════════════════════════════════════════════
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ KNIGHT (Tank / Setup)                                       │
 * │ Vitality: 10 | Resolve +5, Nerve +4                        │
 * ├─────────────────────────────────────────────────────────────┤
 * │ PURPOSE: The Knight is the party's frontline — she absorbs  │
 * │ hits, sets up Entangle combos for the Battlemage, and       │
 * │ provides the party's only Empower (Defensive Stance). Her   │
 * │ high resolve contribution makes her knockout the single     │
 * │ most destabilizing event for Break vulnerability.           │
 * │                                                             │
 * │ STRENGTHS:                                                  │
 * │  • Highest vitality (10) — primary damage soak              │
 * │  • Shield Bash (Entangle) → Battlemage Chain Lightning      │
 * │    is the party's best combo line                            │
 * │  • Defensive Stance grants Advantage + Ward to next Strike  │
 * │  • Shield Wall (Disrupt) forces Disadvantage on dungeon     │
 * │  • Raise Shield (React, Power 2) — strongest raw React      │
 * │  • Highest resolve contribution (+5) — party backbone       │
 * │  • Righteous Blow (3P Overwhelm) for burst when needed      │
 * │                                                             │
 * │ WEAKNESSES:                                                 │
 * │  • Only Physical/Social cards — no Mystical access          │
 * │  • No healing beyond Second Wind (self only, 2 vitality)   │
 * │  • If knocked out, party loses biggest resolve chunk (+5)   │
 * │    AND Entangle setup — Battlemage combo line breaks        │
 * │  • Defensive Stance costs a turn of offense                 │
 * │  • Second Wind is weak (2 HP self-heal, no party utility)  │
 * │                                                             │
 * │ PLAY PATTERN: Energy first, then Shield Bash to set up      │
 * │ Battlemage combos. Alternate between Defensive Stance       │
 * │ (safe aggression) and Shield Wall (disrupt dungeon). Save   │
 * │ Righteous Blow for when structure is pressured. Challenging │
 * │ Roar for presence damage with Resonate. Second Wind only    │
 * │ when critically wounded.                                     │
 * │                                                             │
 * │ KNOCKOUT FREQUENCY: 0.4-7.4% first KO across all profiles  │
 * │ Almost never the first to fall — vitality pool works.       │
 * │ Nurturing AI knocks her out first most often (7.4%) due to  │
 * │ longer encounters giving attrition time to matter.          │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ BATTLEMAGE (DPS / Control)                                  │
 * │ Vitality: 7 | Resolve +3, Nerve +4                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ PURPOSE: The Battlemage is the party's primary damage and   │
 * │ control engine. She delivers veil/structure pressure through │
 * │ Arcane Bolt (Erode), Chain Lightning (Entangle combo), and  │
 * │ Shatter Point (finisher). Her Disrupts strip dungeon buffs  │
 * │ and deter aggression. Spell Amplification turns any party   │
 * │ Strike into burst.                                           │
 * │                                                             │
 * │ STRENGTHS:                                                  │
 * │  • Chain Lightning (3P + 2P from Entangle) — highest combo  │
 * │    ceiling in the party                                      │
 * │  • Shatter Point finisher (+2P when structure < 50%)         │
 * │  • Arcane Bolt provides persistent veil Erode                │
 * │  • Spell Amplification (+2P + Overwhelm) amplifies ANY      │
 * │    party member's Strike, not just Battlemage's own          │
 * │  • Counterspell strips keywords — neutralizes dungeon combos │
 * │  • Hex deters dungeon Strikes (veil thorns)                  │
 * │  • 3 energy cards — most self-sufficient energy economy      │
 * │  • Arcane Shield conditionally Power 3 (nerve > 50%)         │
 * │                                                             │
 * │ WEAKNESSES:                                                 │
 * │  • Mid-tier vitality (7) — targetable if Knight is occupied │
 * │  • Expensive burst (Chain Lightning 2, Shatter Point 2)     │
 * │  • No healing or protection for allies                       │
 * │  • Arcane Shield drops to Power 1 when nerve is low — less  │
 * │    reliable in late game when party is pressured              │
 * │  • If knocked out, party loses ALL veil pressure, Erode,    │
 * │    and Spell Amplification burst potential                    │
 * │                                                             │
 * │ PLAY PATTERN: Energy early (Elemental Attunement discounts  │
 * │ Mystical cards), Hex to deter aggression, then cycle Arcane │
 * │ Bolt (Erode) and Chain Lightning (when Entangled). Save     │
 * │ Shatter Point for when structure is below half. Spell       │
 * │ Amplification before a big Strike from any party member.    │
 * │ Counterspell when dungeon plays threatening Empowers.        │
 * │                                                             │
 * │ KNOCKOUT FREQUENCY: 12.6-26.2% first KO depending on       │
 * │ profile. Aggressive AI targets her ~26%, others less.       │
 * │ Not the primary target for any profile — she's the          │
 * │ "secondary threat" that falls when Rogue or Cleric is       │
 * │ unavailable or already down.                                 │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ CLERIC (Support / Bond Path)                                │
 * │ Vitality: 7 | Resolve +4, Nerve +4                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ PURPOSE: The Cleric is the party's sustain and diplomacy    │
 * │ engine. She provides the only knockout restoration (Healing │
 * │ Word), the only cooperative pathway (Offer/Test), and       │
 * │ resolve Fortify (Fortify Spirit). She's the most important  │
 * │ member for long-game survival and the only path to Bond.    │
 * │                                                             │
 * │ STRENGTHS:                                                  │
 * │  • Healing Word restores downed allies at 4 vitality —      │
 * │    the party's only knockout recovery                        │
 * │  • Fortify Spirit provides resolve Fortify for 2 rounds —   │
 * │    unique Break protection                                   │
 * │  • Peaceful Parley (Offer) + Leap of Faith (Test) = only   │
 * │    Bond pathway. Party literally cannot Bond without her.    │
 * │  • Divine Ward grants Fortify regardless of React success   │
 * │    (v2.6b: absorb mechanic now correctly fires)              │
 * │  • Purifying Light heals lowest resource when Countering    │
 * │  • Sacred Rites (Attune Social) discounts her own cards     │
 * │  • Faith's Wellspring (Siphon) rewards cooperation          │
 * │  • Tied highest resolve contribution (+4)                   │
 * │                                                             │
 * │ WEAKNESSES:                                                 │
 * │  • Healing Word is extremely expensive (3 energy) — often   │
 * │    needs 2+ turns of energy buildup before it's castable    │
 * │  • Only 1 Strike (Holy Light, 2P presence) — minimal damage │
 * │  • Divine Ward Power 1 — weakest React in the party         │
 * │  • If knocked out, party loses ALL healing, restoration,    │
 * │    Fortify, Bond pathway, and a huge resolve chunk (+4)     │
 * │  • Bond path requires trust buildup — fails vs aggressive   │
 * │    or deceptive dungeons                                     │
 * │                                                             │
 * │ PLAY PATTERN: Energy first (Sacred Rites → Attune Social    │
 * │ discount), then read dungeon intent. Against nurturing:     │
 * │ Peaceful Parley → Leap of Faith pipeline toward Bond.       │
 * │ Against aggressive: save energy for Healing Word, play      │
 * │ Fortify Spirit to buffer resolve, Holy Light for modest     │
 * │ pressure. Save Healing Word until a member is knocked out — │
 * │ don't waste 3 energy on a heal when Second Wind suffices.   │
 * │                                                             │
 * │ KNOCKOUT FREQUENCY: 16.2-62% first KO — HUGE profile       │
 * │ variance. Tactical AI targets her 62% of the time (highest  │
 * │ strategic value per HP). Deceptive only 16.2%. This is the  │
 * │ key indicator that smart AIs recognize Cleric as the party's│
 * │ lynchpin while brute-force profiles chase low-HP Rogue.     │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │ ROGUE (Flex / Anti-Deception)                               │
 * │ Vitality: 6 | Resolve +2, Nerve +4                         │
 * ├─────────────────────────────────────────────────────────────┤
 * │ PURPOSE: The Rogue is the party's flex slot — she adapts to │
 * │ the dungeon's strategy. Against deceptive dungeons, she     │
 * │ punishes Offers (Flash Bomb), converts traps into trust     │
 * │ (Disarm Trap), and steals Empowers (Sleight of Hand).       │
 * │ Against aggressive dungeons, she provides veil Erode        │
 * │ pressure and Entangle setup via Tripwire.                   │
 * │                                                             │
 * │ STRENGTHS:                                                  │
 * │  • Flash Bomb (Trap) punishes deceptive Offer-Trap combos — │
 * │    the hard counter to deceptive dungeon identity            │
 * │  • Disarm Trap converts dungeon traps into +2 trust — turns │
 * │    the enemy's tools into Bond progress                      │
 * │  • Sleight of Hand steals dungeon Empowers — swing play     │
 * │  • Backstab scales with dungeon pressure (Exploit Weakness   │
 * │    +2P when presence < 75%)                                  │
 * │  • Tripwire provides secondary Entangle for Battlemage      │
 * │  • Shadow Sense (Siphon) rewards sustained veil pressure    │
 * │  • Evasion conditionally Power 3 React (nerve > 50%)        │
 * │  • Smoke Screen randomizes dungeon targeting                │
 * │                                                             │
 * │ WEAKNESSES:                                                 │
 * │  • Lowest vitality (6) — primary knockout target for        │
 * │    aggressive/deceptive AIs                                  │
 * │  • Lowest resolve contribution (+2) — least impactful loss  │
 * │    for morale, but her knockout still costs the party its   │
 * │    anti-deception toolkit                                    │
 * │  • Flash Bomb is useless vs non-deceptive dungeons           │
 * │  • Disarm Trap requires dungeon to play Traps — conditional │
 * │  • Poisoned Blade low power (1P) — slow pressure            │
 * │  • No healing, no Fortify, no party protection               │
 * │                                                             │
 * │ PLAY PATTERN: Adapt to dungeon identity. Against deceptive: │
 * │ Flash Bomb early (trap for their Offers), Disarm Trap their │
 * │ traps, Sleight of Hand their Empowers. Against aggressive:  │
 * │ Tripwire to punish Strikes and set up Battlemage combos,    │
 * │ Backstab for scaled damage, Smoke Screen to scramble their  │
 * │ targeting. Energy via Shadow Sense mid-game when veil        │
 * │ pressure makes it permanent.                                 │
 * │                                                             │
 * │ KNOCKOUT FREQUENCY: 22.2-70.1% first KO — default target   │
 * │ for unsophisticated AIs. Deceptive hits her 70.1% (lowest   │
 * │ HP, dungeon doesn't prioritize strategic value). Tactical   │
 * │ only 22.2% (prefers Cleric). This 48-point swing in         │
 * │ targeting preference is the clearest signal of AI            │
 * │ sophistication in the simulation.                            │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * ═══════════════════════════════════════════════════════════════
 * PARTY-LEVEL STRATEGY
 * ═══════════════════════════════════════════════════════════════
 * 
 * VULNERABILITY PROFILE (vs Arcane Expedition):
 *   Vitality: 30 (vs 29) → Slightly more Kill-resistant
 *   Resolve:  14 (vs 12) → Significantly more Break-resistant
 *   Nerve:    16 (vs 17) → Slightly more Panic-vulnerable
 * 
 * DEFENSIVE TOOLKIT:
 *   Shield Wall (Knight Disrupt) → Disadvantage on next dungeon Strike
 *   Defensive Stance (Knight Empower) → Advantage + Ward on next Strike
 *   Fortify Spirit (Cleric Reshape) → Fortify resolve for 2 rounds
 *   Divine Ward (Cleric React) → Fortify 1 regardless of success
 *   Raise Shield (Knight React, Power 2) → Strongest raw React
 *   NO Guardian Stance equivalent — no member-specific protection
 *   NO Arcane Ward equivalent — no self-shielding for squishies
 *   Defense is collective (Disrupt/Empower) not individual (Guard/Fortify)
 * 
 * COMBO LINES:
 *   Knight Shield Bash (Entangle) → Battlemage Chain Lightning (+2P)
 *   Rogue Tripwire (Entangle on Strike) → Battlemage Chain Lightning (+2P)
 *   Battlemage Spell Amplification → ANY party Strike (+2P + Overwhelm)
 *   Battlemage Hex → deters dungeon Strikes (veil thorns)
 *   Rogue Flash Bomb → punishes deceptive Offers (2 nerve)
 *   Rogue Disarm Trap → converts traps into +2 trust (Bond progress)
 *   Knight Defensive Stance → Advantage + Ward on next party Strike
 * 
 * TARGETING DILEMMA (dungeon perspective, validated by v2.6b data):
 *   Kill Rogue first → 51.9% (Aggressive), 70.1% (Deceptive)
 *     Lowest HP (6), least morale impact (+2 resolve)
 *     Costs party anti-deception suite + secondary Entangle
 *   Kill Cleric first → 62% (Tactical), 26.7% (Nurturing)
 *     Mid HP (7), high strategic value (healing + Bond + Fortify)
 *     Costs party ALL sustain — most devastating single loss
 *   Kill Battlemage first → 12.6-26.2% across profiles
 *     Mid HP (7), moderate strategic value (damage + Erode)
 *     Costs party offensive teeth — less decisive than losing Cleric
 *   Kill Knight first → 0.4-7.4% across profiles
 *     Highest HP (10) — almost never achieved first
 *     If somehow killed, catastrophic resolve loss (+5) + combo setup
 * 
 *   KEY INSIGHT: Tactical AI targets Cleric 62% vs Rogue 22%.
 *   Aggressive/Deceptive AIs target Rogue 52-70% vs Cleric 16-21%.
 *   This 40-point swing in targeting preference is the clearest
 *   signal of AI sophistication in the simulation — smart play
 *   means ignoring the low-HP bait and killing the sustain engine.
 * 
 * OUTCOME SIGNATURES (v2.6b, 3-room, 1000 iterations each):
 *   vs Aggressive: Kill 17.2%, Panic 18%, Break 33.8%, Survive 31%
 *     → Break is PRIMARY dungeon win condition (resolve 14 crumbles
 *       when Knight or Cleric go down). Low Kill despite aggression
 *       because party vitality pool (30) is deep enough to outlast.
 *   vs Nurturing: Kill 27.9%, Panic 23.3%, Break 11.7%, Survive 37.1%
 *     → Highest Survive (37.1%). Nurturing doesn't pressure resolve
 *       hard enough for Break, falls into Kill through attrition.
 *   vs Deceptive: Kill 33.6%, Panic 22.3%, Break 15.9%, Survive 28.2%
 *     → Kill climbs because Rogue (anti-deception specialist) is the
 *       first knockout 70% of the time — party loses its counter.
 *   vs Tactical: Kill 37.5%, Panic 20.9%, Break 15.2%, Survive 26.4%
 *     → Highest Kill (37.5%). Tactical AI targeting Cleric first (62%)
 *       removes healing → second KO follows quickly → Kill.
 *     → Lowest Survive (26.4%). Outcome diversity 0.641 — healthy.
 * 
 * QUALITY METRICS (all profiles):
 *   Agency: 1.25-1.33 avg lead changes — all HEALTHY
 *   Closeness: 18.6-24.4% — all HEALTHY
 *   Outcome Diversity: 0.632-0.649 — all HEALTHY
 *   Knockout Entropy: 0.615-0.899 — all HEALTHY
 */
export default {
  name: 'Standard Adventuring Company',
  type: 'party',
  partySize: 4,

  // ── COLLECTIVE POOLS ──
  resolve: 22,
  nerve: 20,
  trust: 0,

  // ── INDIVIDUAL MEMBERS ──
  members: {
    knight: {
      name: 'Knight',
      role: 'tank',
      vitality: 10,
      resolveContribution: 7,
      nerveContribution: 5,
    },
    battlemage: {
      name: 'Battlemage',
      role: 'dps',
      vitality: 7,
      resolveContribution: 5,
      nerveContribution: 5,
    },
    cleric: {
      name: 'Cleric',
      role: 'support',
      vitality: 7,
      resolveContribution: 6,
      nerveContribution: 5,
    },
    rogue: {
      name: 'Rogue',
      role: 'flex',
      vitality: 6,
      resolveContribution: 4,
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
  modifiers: {
    strength: 1,      // Knight contribution
    cunning: 1,       // Rogue contribution
    perception: 1,    // Battlemage contribution
    resilience: 0,    // No dedicated healer bonus
  },
};