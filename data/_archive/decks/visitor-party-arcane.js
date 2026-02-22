/**
 * PARTY DECK: The Arcane Expedition (v2.6b — Defensive Rework)
 * Combined 40-card deck from 4 members: Warden, Sorcerer, Druid, Ranger
 * 
 * ═══════════════════════════════════════════════════════════════
 * v2.6b CHANGES (Defensive Rework)
 * ═══════════════════════════════════════════════════════════════
 * 
 * PROBLEM: v2.6 Kill rate was 45–57% across all profiles — glass cannon
 * casters had no mechanical defenses to offset low vitality. The Sorcerer
 * survived by luck, not by player skill. Party was strictly dominated by
 * Standard in PVP (lower Survive rate in every matchup).
 * 
 * PHILOSOPHY: Squishy classes need mechanics to offset low health, not
 * just more HP. A glass cannon who survives because the player made smart
 * defensive plays is engaging gameplay. A glass cannon who survives because
 * we quietly gave them more health is just number inflation.
 * 
 * CARDS REMOVED:
 *   - Nature's Authority (Warden Strike, 2P presence) → Replaced by Guardian Stance
 *   - Mind Blast (Sorcerer Strike, 2P nerve + Erode) → Replaced by Arcane Ward
 *   - Spell Amplification (Sorcerer Empower, +2P + Overwhelm) → Replaced by Mana Shield
 * 
 * CARDS ADDED:
 *   + Guardian Stance (Warden Disrupt) → Guarded condition on lowest-vit ally
 *   + Arcane Ward (Sorcerer Reshape) → Fortify 2 self for 2 rounds + heal
 *   + Mana Shield (Sorcerer Counter) → Condition removal + Fortify spread
 * 
 * CARDS MODIFIED:
 *   ~ Arcane Barrier (Sorcerer React) → On success, also grants Fortify 1
 *   ~ Healing Touch (Druid Reshape) → If target has Fortify, extend by 1 round
 * 
 * ═══════════════════════════════════════════════════════════════
 * CARD DISTRIBUTION (40 cards)
 * ═══════════════════════════════════════════════════════════════
 * 
 *   Energy:   10 (25%)    — Standard ×4, Surge ×2, Attune ×2, Siphon ×2
 *   Strike:    9 (22.5%)  — was 11, traded 2 for defensive tools
 *   Empower:   1 (2.5%)   — was 2, traded Spell Amp for Mana Shield
 *   Disrupt:   4 (10%)    — was 3, +Guardian Stance
 *   Counter:   3 (7.5%)   — was 2, +Mana Shield
 *   React:     4 (10%)    — unchanged (Arcane Barrier upgraded in-place)
 *   Trap:      1 (2.5%)   — unchanged
 *   Offer:     1 (2.5%)   — unchanged
 *   Test:      1 (2.5%)   — unchanged
 *   Reshape:   6 (15%)    — was 5, +Arcane Ward
 * 
 * vs STANDARD ADVENTURING COMPANY:
 *   Strikes:   9 vs 9   — now equal (was +2)
 *   Counters:  3 vs 4   — still fewer (was -2)
 *   Disrupts:  4 vs 3   — now MORE (was equal)
 *   Reshapes:  6 vs 3   — still much more sustain
 *   Traps:     1 vs 2   — still fewer
 * 
 * TARGET SPREAD (Strikes only):
 *   structure: 4 (Shield of Thorns, Root Strike, Precise Shot, Piercing Arrow)
 *   veil:      4 (Arcane Bolt, Chain Lightning, Eldritch Burst, Poisoned Arrow)
 *   vitality:  1 (Thorn Whip — setup/entangle only)
 *   presence:  0 (removed Nature's Authority — presence comes from auto-effects)
 *   nerve:     0 (removed Mind Blast — Panic resistance is the party identity)
 * 
 * IDENTITY: Heavy structure+veil pressure with layered active defenses.
 * The party hits two dungeon resources hard and protects its glass cannons
 * through Guardian Stance, Arcane Ward, and Fortify chains. Dominate and
 * Break outcomes come from auto-effects pressuring presence/nerve, not
 * from the deck.
 * 
 * ═══════════════════════════════════════════════════════════════
 * DEFENSIVE COMBO CHAINS (v2.6b)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Chain 1: Warden Guardian Stance → protects Sorcerer → Sorcerer safely
 *          plays Eldritch Burst instead of Arcane Ward → maximum damage
 * 
 * Chain 2: Sorcerer Arcane Ward (Fortify 2) → Druid Healing Touch
 *          (extends Fortify) → 3-round defensive window on Sorcerer
 * 
 * Chain 3: Sorcerer Arcane Ward → Mana Shield → spreads Fortify 1 to
 *          an ally → defensive cascade from one character to party
 * 
 * Chain 4: Arcane Barrier success → auto Fortify 1 → reduces NEXT
 *          hit too → successful React snowballs into multi-round defense
 * 
 * Chain 5: Guardian Stance + Nature's Snare → dungeon faces: hit the
 *          Guarded target at -2P, hit the Warden (what party wants),
 *          or hit anyone and trigger a 2-structure trap. Three bad options.
 * 
 * ═══════════════════════════════════════════════════════════════
 * OFFENSIVE COMBO CHAINS (unchanged from v2.6)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Warden Shield of Thorns (Entangle) → Sorcerer Chain Lightning (+2P)
 * Druid Thorn Whip (Entangle) → Sorcerer Chain Lightning (+2P)
 * Sorcerer Hex (veil thorns) → deters dungeon Strikes → protects casters
 * Ranger Siphon (entangle/veil) → permanent energy when pressure active
 * Ranger Nature's Snare (trap) → punishes aggressive dungeon play
 * Druid Restoration / Warden Nature's Renewal → double restore capability
 * 
 * ═══════════════════════════════════════════════════════════════
 * ENERGY BUDGET
 * ═══════════════════════════════════════════════════════════════
 * 
 * 10 Energy cards in 40 = 25% (same as Standard)
 * Attune[Environmental] discounts Warden/Ranger; Attune[Mystical] discounts Sorcerer
 * Siphon ×2 rewards veil pressure (veil < 50%) and entangle combos
 * Average action cost: ~1.3 energy
 * Expensive plays: Nature's Renewal (3), Restoration (3), Eldritch Burst (3),
 *                   Piercing Arrow (2), Chain Lightning (2), Root Strike (2),
 *                   Arcane Ward (2), Guardian Stance (2), Healing Touch (2)
 * Cheap plays: All Reacts (0), Thorn Whip (1), Arcane Bolt (1), Poisoned Arrow (1)
 */
export default [

  // ═══════════════════════════════════════════════════════════
  // WARDEN — Tank / Guardian / Setup (10 cards)
  //
  // Role: Party anchor. Protects squishy casters through Guardian
  // Stance and high vitality. Sets up Entangle for Sorcerer combos.
  // Provides knockout recovery with Nature's Renewal.
  //
  // Strong: Absorbing damage, protecting allies, Entangle setup
  // Weak:   Low damage output, no Mystical access, offense costs
  //         come at the price of defensive turns
  // Bring:  You need a frontline that makes the dungeon choose
  //         between hitting a protected target or the Warden
  // Helps:  Sorcerer (Entangle for Chain Lightning, Guardian Stance
  //         protection), whole party (Stone Wall deterrent)
  // ═══════════════════════════════════════════════════════════

  // ── Energy (2) ──
  { name: 'Steadfast Will', category: 'Energy', type: 'Physical', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'warden',
    description: 'Disciplined resolve fuels the party. Reliable energy.' },
  { name: 'Iron Bark', category: 'Energy', type: 'Physical', cost: 0,
    energyType: 'surge', surgeGain: 2, member: 'warden',
    description: 'The Warden channels the forest\'s strength in a burst of power.' },

  // ── Strikes (2) ──  [was 3 — removed Nature's Authority]
  { name: 'Shield of Thorns', category: 'Strike', type: 'Physical', cost: 1,
    power: 2, target: 'structure', keywords: ['Entangle'], member: 'warden',
    description: 'A shield bash that pins the enemy in thorny vines. Deal 2 structure. Entangle.' },
  { name: 'Root Strike', category: 'Strike', type: 'Environmental', cost: 2,
    power: 3, target: 'structure', member: 'warden',
    description: 'Command the roots to crush the dungeon\'s foundation. Deal 3 structure.' },

  // ── Empower (1) ──
  { name: 'Stalwart Guard', category: 'Empower', type: 'Physical', cost: 1,
    empowerEffect: { advantage: true, addKeyword: 'Ward' }, member: 'warden',
    description: 'Set a defensive stance. Next Strike gains Advantage and Ward.' },

  // ── Disrupt (2) ──  [was 1 — added Guardian Stance]
  { name: 'Stone Wall', category: 'Disrupt', type: 'Environmental', cost: 1,
    disruptEffect: { onStrike: { selfDamage: { resource: 'structure', amount: 1 } } }, member: 'warden',
    description: 'Raise a wall of living stone. Opponent\'s next Strike deals 1 structure to themselves.' },

  // ── NEW: Guardian Stance (v2.6b) ──
  // The tank finally tanks. Forces the dungeon to either burn through -2P
  // reduction on the Guarded target or switch to hitting the Warden — which
  // is exactly what the party wants. Creates a real decision for both sides.
  { name: 'Guardian Stance', category: 'Disrupt', type: 'Physical', cost: 2,
    disruptEffect: {
      guard: { target: 'lowest_vitality_ally', powerReduction: 2, duration: 2 },
      selfFortify: { resource: 'vitality', reduction: 1, duration: 1 },
    }, member: 'warden',
    description: 'The Warden plants herself between danger and her allies. Weakest ally gains Guarded (Strikes targeting them have -2 Power) for 2 rounds. Warden gains Fortify 1.' },

  // ── React (1) ──
  { name: 'Bark Skin', category: 'React', type: 'Environmental', cost: 0, power: 2,
    member: 'warden',
    description: 'Skin hardens to bark, absorbing the blow. Contest with Power 2.' },

  // ── Reshape (2) ──
  { name: 'Earthen Recovery', category: 'Reshape', type: 'Physical', cost: 2,
    reshapeEffect: {
      heal: [{ resource: 'vitality', amount: 3, target: 'weakest_member' }],
      fortify: [{ resource: 'vitality', reduction: 1, duration: 1 }],
    }, member: 'warden',
    description: 'Draw strength from the earth. Heal weakest member 3 vitality. Fortify structure 1.' },
  { name: 'Nature\'s Renewal', category: 'Reshape', type: 'Environmental', cost: 3,
    reshapeEffect: {
      restore: { target: 'knocked_out', amount: 0.4 },
    }, member: 'warden',
    description: 'The forest reclaims what was lost. Restore a downed ally at 40% vitality.' },

  // ═══════════════════════════════════════════════════════════
  // SORCERER — Burst DPS / Glass Cannon (10 cards)
  //
  // Role: Primary damage threat. Delivers devastating veil burst
  // damage through Eldritch Burst and Chain Lightning combos.
  // v2.6b adds layered active defenses (Ward, Shield, Barrier)
  // so survival depends on player skill, not just luck.
  //
  // Strong: Highest burst damage, veil pressure, Hex deterrence,
  //         self-shielding when played proactively
  // Weak:   Lowest vitality (5), expensive cards, defensive turns
  //         cost offensive output, morale cascade on knockout
  // Bring:  You need burst veil damage to crack dungeon barriers
  //         and Overwhelm spillover to pressure resolve
  // Helps:  Self (Ward/Shield survival), allies (Mana Shield
  //         spreads Fortify), party (Hex deters all dungeon Strikes)
  // ═══════════════════════════════════════════════════════════

  // ── Energy (2) ──
  { name: 'Arcane Focus', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'sorcerer',
    description: 'Channel arcane energy through a crystalline focus.' },
  { name: 'Mana Surge', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'surge', surgeGain: 2, member: 'sorcerer',
    description: 'A burst of raw mana floods the party\'s reserves.' },

  // ── Strikes (3) ──  [was 4 — removed Mind Blast]
  { name: 'Arcane Bolt', category: 'Strike', type: 'Mystical', cost: 1,
    power: 2, target: 'veil', member: 'sorcerer',
    description: 'A focused beam of arcane energy tears at the Veil. Deal 2 veil.' },
  { name: 'Chain Lightning', category: 'Strike', type: 'Environmental', cost: 2,
    power: 2, target: 'veil', member: 'sorcerer',
    trigger: {
      description: 'If entangled: +2 Power',
      condition: { type: 'has_condition', condition: 'entangled' },
      bonus: 2,
    },
    description: 'Lightning arcs through grounded targets. Deal 2 veil. +2 Power if entangled.' },
  { name: 'Eldritch Burst', category: 'Strike', type: 'Mystical', cost: 3,
    power: 4, target: 'veil', keywords: ['Overwhelm'],
    overwhelmTarget: 'resolve', member: 'sorcerer',
    description: 'Devastating arcane detonation. Deal 4 veil. Overwhelm: excess → resolve.' },

  // ── Disrupt (1) ──
  { name: 'Hex', category: 'Disrupt', type: 'Mystical', cost: 1,
    disruptEffect: { onStrike: { selfDamage: { resource: 'veil', amount: 1 } } }, member: 'sorcerer',
    description: 'A curse that punishes aggression. Opponent\'s next Strike costs 1 veil.' },

  // ── Counter (2) ──  [was 1 — added Mana Shield]
  { name: 'Counterspell', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'veil', amount: 1 }, member: 'sorcerer',
    description: 'Unravel the opponent\'s preparation. Remove condition. Chip 1 veil.' },

  // ── NEW: Mana Shield (v2.6b) ──
  // Replaces Spell Amplification. Trades raw offensive power for defensive
  // utility. The key synergy: when the Sorcerer has Arcane Ward's Fortify
  // active, Mana Shield spreads Fortify 1 to an ally — the ward cascades
  // outward from one character to the party.
  { name: 'Mana Shield', category: 'Counter', type: 'Mystical', cost: 1,
    counterDamage: { resource: 'veil', amount: 1 },
    counterEffect: {
      spreadFortify: { condition: 'self_has_fortify', target: 'lowest_vitality_ally',
                       resource: 'vitality', reduction: 1, duration: 1 },
    }, member: 'sorcerer',
    description: 'Raw magical energy deflects hostile intent. Remove condition. Chip 1 veil. If Sorcerer has Fortify, also grant Fortify 1 to weakest ally.' },

  // ── React (1) ──  [MODIFIED v2.6b: gains Fortify 1 on success]
  // Previously a standard React. Now on SUCCESS, grants Fortify 1 to self
  // for 1 round. A successful block cascades into reduced damage next round,
  // rewarding smart reactive play. The snowball effect: block → Fortify →
  // survive next hit → Druid extends Fortify with Healing Touch.
  { name: 'Arcane Barrier', category: 'React', type: 'Mystical', cost: 0, power: 2,
    reactEffect: {
      onSuccess: { selfFortify: { resource: 'vitality', reduction: 1, duration: 1 } },
    }, member: 'sorcerer',
    description: 'A shimmering barrier of arcane energy. Contest with Power 2. On success: Fortify 1 to self for 1 round.' },

  // ── Reshape (1) ──  [NEW: added Arcane Ward]
  // The classic mage shield. Fortify 2 for 2 rounds means the next two
  // Strikes deal 2 less damage each — potentially absorbing 4 total damage
  // on a 5-vitality character. But it costs 2 energy and a turn that could
  // have been Eldritch Burst. The player has to read the board and decide:
  // burst now or shield up for the incoming hit? That's the glass cannon
  // decision point that makes the archetype fun.
  { name: 'Arcane Ward', category: 'Reshape', type: 'Mystical', cost: 2,
    reshapeEffect: {
      fortify: [{ resource: 'vitality', reduction: 2, duration: 2 }],
      heal: [{ resource: 'vitality', amount: 1, target: 'self_member' }],
    }, member: 'sorcerer',
    description: 'Shimmering arcane energy absorbs incoming blows. Fortify 2 to self for 2 rounds. Heal 1 vitality.' },

  // ═══════════════════════════════════════════════════════════
  // DRUID — Support / Healer / Sustain Amplifier (10 cards)
  //
  // Role: Sustain engine and defensive amplifier. Heals damage,
  // extends Fortify buffs placed by Warden/Sorcerer, restores
  // downed allies, provides the only cooperative pathway.
  //
  // Strong: Healing, Fortify extension, dual Attune energy,
  //         Restoration for knockout recovery, Entangle backup
  // Weak:   Very low damage, reactive not preventive, expensive
  //         restoration, if knocked out party loses ALL sustain
  // Bring:  You need healing, buff extension, and knockout
  //         insurance — the glue that holds glass cannons together
  // Helps:  Sorcerer (extends Arcane Ward Fortify), Warden
  //         (extends Guardian Stance Fortify), whole party
  //         (Restoration, Peaceful Offering for Bond path)
  // ═══════════════════════════════════════════════════════════

  // ── Energy (3) ──
  { name: 'Natural Harmony', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Environmental', discount: 1 }, member: 'druid',
    description: 'Attune to the natural world. +1 permanent. Next Environmental card costs 1 less.' },
  { name: 'Spiritual Attunement', category: 'Energy', type: 'Mystical', cost: 0,
    energyType: 'attune', energyGain: 1,
    attune: { cardType: 'Mystical', discount: 1 }, member: 'druid',
    description: 'Open the mind to mystical currents. +1 permanent. Next Mystical card costs 1 less.' },
  { name: 'Grounding Roots', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'druid',
    description: 'Draw steady energy from the earth beneath.' },

  // ── Strike (1) ──
  { name: 'Thorn Whip', category: 'Strike', type: 'Environmental', cost: 1,
    power: 1, target: 'vitality', keywords: ['Entangle'], member: 'druid',
    description: 'Thorny vines lash out and bind. Deal 1 vitality. Entangle. Setup for combos.' },

  // ── Offer (1) ──
  { name: 'Peaceful Offering', category: 'Offer', type: 'Social', cost: 1,
    target: 'trust',
    offerPayload: [
      { resource: 'trust', amount: 1, target: 'self' },
      { resource: 'rapport', amount: 1, target: 'opponent' },
      { resource: 'nerve', amount: 2, target: 'self' },
    ], member: 'druid',
    description: 'Extend an olive branch. Accept: +1 trust, +1 rapport, heal 2 nerve.' },

  // ── Test (1) ──
  { name: 'Commune with Nature', category: 'Test', type: 'Social', cost: 1,
    target: 'rapport', testAmount: 2, member: 'druid',
    description: 'Open a channel between dungeon and party. Build rapport through shared understanding.' },

  // ── Reshape (3) ──  [Healing Touch MODIFIED v2.6b]
  // MODIFIED: Now extends Fortify duration on the healed target by 1 round.
  // Creates Warden/Sorcerer → Druid synergy: Guardian Stance or Arcane Ward
  // puts up Fortify, Druid extends it with Healing Touch. The support class
  // amplifies defensive plays rather than just topping off HP bars.
  { name: 'Healing Touch', category: 'Reshape', type: 'Social', cost: 2,
    reshapeEffect: {
      heal: [
        { resource: 'vitality', amount: 3, target: 'weakest_member' },
        { resource: 'resolve', amount: 1, target: 'self' },
      ],
      extendFortify: { target: 'healed_member', rounds: 1 },
    }, member: 'druid',
    description: 'Warm hands mend wounds and sustain wards. Heal weakest member 3 vit, +1 resolve. If target has Fortify, extend duration by 1 round.' },
  { name: 'Barkskin Blessing', category: 'Reshape', type: 'Environmental', cost: 1,
    reshapeEffect: {
      fortify: [{ resource: 'vitality', reduction: 1, duration: 1 }],
      heal: [{ resource: 'vitality', amount: 1, target: 'weakest_member' }],
    }, member: 'druid',
    description: 'Gift bark-like protection and minor healing. Fortify structure 1. Heal 1 vitality.' },
  { name: 'Restoration', category: 'Reshape', type: 'Environmental', cost: 3,
    reshapeEffect: {
      restore: { target: 'knocked_out', amount: 0.4 },
    }, member: 'druid',
    description: 'Nature reclaims the fallen. Restore a downed ally at 40% vitality.' },

  // ── React (1) ──
  { name: 'Wild Growth', category: 'React', type: 'Environmental', cost: 0, power: 1,
    reactEffect: { reflect: { amount: 1, resource: 'resolve' } }, member: 'druid',
    description: 'Vines surge to deflect. Contest Power 1. On Devastating defense, reflect 1 resolve.' },

  // ═══════════════════════════════════════════════════════════
  // RANGER — Ranged DPS / Pressure / Deterrent (10 cards)
  //
  // Role: Consistent, efficient damage with persistent effects.
  // The "steady hand" — less flashy than the Sorcerer but more
  // reliable. Erode creates ongoing pressure, traps deter
  // aggression, and Siphon energy rewards team synergy.
  //
  // Strong: Structure Erode, Siphon energy permanence, trap
  //         deterrent, Evasive Counter with Entangle
  // Weak:   No party protection, no healing, no Fortify, only
  //         Physical/Environmental cards, trap is one-shot
  // Bring:  You need reliable structure damage that compounds
  //         over time and punishes aggressive dungeon play
  // Helps:  Sorcerer (Entangle via Evasive Counter enables
  //         Chain Lightning), party (Nature's Snare deters all
  //         dungeon Strikes, Siphon rewards veil pressure)
  // ═══════════════════════════════════════════════════════════

  // ── Energy (3) ──
  { name: 'Focused Aim', category: 'Energy', type: 'Physical', cost: 0,
    energyType: 'standard', energyGain: 1, member: 'ranger',
    description: 'Patient precision generates steady energy.' },
  { name: 'Siphon Shot', category: 'Energy', type: 'Environmental', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: {
      condition: { type: 'resource_below', resource: 'veil', pct: 0.5 },
      target: 'opponent',
    }, member: 'ranger',
    description: 'Draw energy from the thinning Veil. Permanent if veil < 50%, temp otherwise.' },
  { name: 'Hunter\'s Draw', category: 'Energy', type: 'Physical', cost: 0,
    energyType: 'siphon', energyGain: 1, siphonFallback: 1,
    siphon: {
      condition: { type: 'has_condition', condition: 'entangled' },
      target: 'opponent',
    }, member: 'ranger',
    description: 'Exploit a pinned target. Permanent if opponent entangled, temp otherwise.' },

  // ── Strikes (3) ──
  { name: 'Precise Shot', category: 'Strike', type: 'Physical', cost: 1,
    power: 2, target: 'structure', member: 'ranger',
    description: 'A carefully placed arrow finds a structural weakness. Deal 2 structure.' },
  { name: 'Piercing Arrow', category: 'Strike', type: 'Physical', cost: 2,
    power: 3, target: 'structure', keywords: ['Erode'], member: 'ranger',
    description: 'An arrow that bores deep and keeps working. Deal 3 structure. Erode 1.' },
  { name: 'Poisoned Arrow', category: 'Strike', type: 'Environmental', cost: 1,
    power: 1, target: 'veil', keywords: ['Erode'], member: 'ranger',
    description: 'A toxin-laced arrow that corrodes magical barriers. Deal 1 veil. Erode 1.' },

  // ── Disrupt (1) ──
  { name: 'Ensnaring Shot', category: 'Disrupt', type: 'Physical', cost: 1,
    disruptEffect: { onStrike: { applyEntangle: true } }, member: 'ranger',
    description: 'A bola-tipped arrow. Opponent\'s next Strike triggers Entangle on themselves.' },

  // ── Trap (1) ──
  { name: 'Nature\'s Snare', category: 'Trap', type: 'Environmental', cost: 1,
    trapTrigger: 'strike_played',
    trapEffect: [
      { resource: 'structure', amount: -2, target: 'triggerer' },
    ], member: 'ranger',
    description: 'Hidden snare springs when the dungeon attacks. Deal 2 structure on Strike.' },

  // ── Counter (1) ──
  { name: 'Evasive Counter', category: 'Counter', type: 'Physical', cost: 1,
    counterDamage: { resource: 'structure', amount: 1 },
    counterEffect: { applyEntangle: true }, member: 'ranger',
    description: 'Dodge and counterattack. Remove condition. Chip 1 structure. Apply Entangle.' },

  // ── React (1) ──
  { name: 'Quick Dodge', category: 'React', type: 'Physical', cost: 0, power: 1,
    member: 'ranger',
    description: 'A nimble sidestep. Contest with Power 1.' },
];