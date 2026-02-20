/**
 * ENCOUNTER: Whispering Gallery (v2.7 — Auto-Effect Rebalance)
 * 
 * ═══════════════════════════════════════════════════════════════
 * THE ROOM
 * ═══════════════════════════════════════════════════════════════
 * 
 * A vast domed chamber with walls of polished dark stone that curve
 * inward like the inside of a skull. The acoustics are impossible —
 * a whisper at one end arrives perfectly at the other, but distorted.
 * Words come back changed. Your own voice returns as someone else's.
 * The gallery is full of sound that has no source: fragments of
 * conversations that may have happened here centuries ago, or that
 * haven't happened yet. Half-remembered warnings. Names spoken by
 * people who aren't present. Laughter that stops abruptly.
 * 
 * SOUND: Layered whispers — never silent, never loud. Sometimes
 * a single clear voice cuts through, speaking a name or a command.
 * The echoes don't behave correctly: they arrive too late, or too
 * early, or from the wrong direction. Sound is weaponized here.
 * 
 * LIGHT: Cold blue luminescence from the stone itself, casting no
 * shadows. Everything is visible but nothing looks right — depth
 * perception fails, distances warp. The light makes faces look
 * hollow and unfamiliar, even your own allies'.
 * 
 * MOOD: Paranoid. The whispers undermine certainty. You start
 * doubting whether the plan was right, whether your allies are who
 * they seem, whether the path back still exists. The room doesn't
 * attack your body — it attacks your belief that you should be here
 * at all. The dungeon speaks through the echoes, turning the
 * party's own fears into arguments for surrender.
 * 
 * ═══════════════════════════════════════════════════════════════
 * AUTO-EFFECTS — WHY THE ROOM HURTS
 * ═══════════════════════════════════════════════════════════════
 * 
 * VISITOR — resolve -1/other round:
 *   The whispers don't stop. They're not loud enough to cover your
 *   ears against, but they're constant — a background erosion of
 *   certainty. "Why are you here?" "You can't win this." "They
 *   left you behind." Every few rounds, the doubt notches deeper.
 *   Resolve doesn't shatter from one whisper. It wears thin from
 *   a thousand.
 * 
 * DUNGEON — presence -1/other round:
 *   The gallery has its own voice, and it doesn't belong to the
 *   dungeon. The echoes carry memories from before the dungeon
 *   was sentient — whispers from previous inhabitants, previous
 *   deaths, previous versions of this place. The dungeon's
 *   commands get lost in the noise. Its authority dilutes among
 *   voices that aren't its own.
 * 
 * DUNGEON — veil -1/other round:
 *   The whispers thin the boundary between dimensions. Every echo
 *   is a tiny resonance that vibrates the Veil — the membrane
 *   between the dungeon's reality and the material world. The
 *   Gallery's acoustics are dimensionally leaky. Sound passes
 *   through the Veil in both directions, weakening it with each
 *   reflection.
 * 
 * DESIGN NOTE: Resolve drain at other-round (not every) means the
 * whispers are persistent but not overwhelming. The dungeon must
 * actively amplify them — through Crushing Silence, Dread Whisper,
 * and Voices in Chorus — to turn ambient doubt into genuine Break
 * pressure. The room sets the stage; the deck performs.
 * 
 * ═══════════════════════════════════════════════════════════════
 * CARD ALIGNMENT — WHY THESE CARDS BELONG HERE
 * ═══════════════════════════════════════════════════════════════
 * 
 * The Whispering Gallery deck is Social/Environmental: psychological
 * warfare, stolen preparations, and weaponized uncertainty.
 * 
 * STRIKES:
 *   Crushing Silence — Absolute quiet that crushes will. The room's
 *     signature card. Resolve damage, bonus when opponent is
 *     unprotected (no Empower). The dungeon silences ALL the
 *     whispers at once — and the sudden void is worse.
 *   Dread Whisper — A single voice speaks your name. Nerve + Erode.
 *     Personal, targeted, intimate. The whispers know you.
 *   Sonic Lash — Sound made sharp enough to cut. Vitality + Resonate.
 *     The acoustics can focus sound into a physical weapon.
 * 
 * SUPPORT:
 *   Voices in Chorus — Many whispers become one command. Empower
 *     that adds Erode. The dungeon conducts the echoes.
 *   Echoing Confusion — Scrambles targeting. The Gallery distorts
 *     spatial awareness; you can't tell where the threat is.
 *   Absorbing Silence — Consumes preparation. Steals Empower.
 *     The room eats intent before it becomes action.
 *   Echoing Rebuke — Turns words against the speaker. Counter
 *     that punishes buffed opponents harder.
 *   Wall of Whispers / Echoing Deflection — Defensive echoes.
 *   Echo Snare — A false silence invites a counter that springs
 *     the real trap. The room rewards patience over aggression.
 *   Comforting Lie — A soothing falsehood. The Offer path.
 *     Sometimes the kindest thing is a lie that calms.
 *   Shifting Echoes — Rearrange acoustics. Presence→Veil shift.
 * 
 * COMBO LINES:
 *   1. Voices in Chorus → Crushing Silence (boosted resolve damage)
 *   2. Echoing Confusion → any Strike (random target, unpredictable)
 *   3. Echo Siphon (Siphon: Empowered) → punish opponent buffs
 *   4. Absorbing Silence → steal Empower, then use it yourself
 *   5. Echo Snare → punish Counter plays with resolve damage
 * 
 * WIN CONDITIONS:
 *   Break — Primary. Crushing Silence + resolve auto-drain + Erode.
 *     The Gallery is built to break will, not bodies.
 *   Panic — Secondary. Dread Whisper + nerve Erode. The personal
 *     whispers are more terrifying than the ambient ones.
 *   Kill — Tertiary. Sonic Lash + vitality chip. Slow but present.
 *   Survive — Visitors outlast the psychological siege.
 *   Bond — Comforting Lie opens trust. A strange room for peace,
 *     but sometimes shared fear creates connection.
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.6: Added veil -1/other round targeting dungeon.
 * v2.7: Visitor resolve every → other. The whispers are persistent
 *       but not overwhelming. The dungeon's cards amplify them.
 */
module.exports = {
  name: 'Whispering Gallery',
  description: 'A vast domed chamber of polished dark stone where sound behaves wrong. Whispers arrive from nowhere — fragments of old conversations, names spoken by people who aren\'t here. The echoes erode certainty. Even the dungeon loses its voice among the noise.',
  initiative: 'dungeon',
  autoEffects: [
    { resource: 'resolve',   amount: -1, target: 'visitor', frequency: 'other' },  // v2.7: every → other
    { resource: 'presence',  amount: -1, target: 'dungeon', frequency: 'other' },
    { resource: 'veil',      amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Social', 'Mystical', 'Open'],
};