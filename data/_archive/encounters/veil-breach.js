/**
 * ENCOUNTER: Veil Breach (v2.7 — Auto-Effect Rebalance)
 * 
 * ═══════════════════════════════════════════════════════════════
 * THE ROOM
 * ═══════════════════════════════════════════════════════════════
 * 
 * The room shouldn't exist. It's a wound in the architecture — a
 * place where the boundary between the dungeon's dimension and
 * the material world has torn open and scarred over badly. The
 * walls shimmer at the edges, cycling through colors that don't
 * have names. The floor is solid in the center but translucent
 * near the walls, and through it you can see... something. Movement.
 * Shapes that press against the membrane from the other side.
 * 
 * SOUND: A low harmonic drone — not heard with the ears but felt
 * in the chest. Occasional sharp crystalline chimes when something
 * on the other side touches the membrane. Your own spells echo
 * strangely — fire flickers blue, healing energy tastes of copper,
 * enchantments stutter and loop. Magic is unreliable here because
 * the rules are leaking.
 * 
 * LIGHT: Too bright and too dark simultaneously. The breach emits
 * light that illuminates surfaces but casts shadows in the wrong
 * direction. Colors shift — skin looks blue, metal looks organic,
 * wood looks like stone. Your eyes adjust and then un-adjust.
 * Depth perception is fundamentally broken.
 * 
 * MOOD: Existential dread. Not fear of a monster or a trap — fear
 * that reality itself is not reliable. The floor might not be real.
 * The exit might not lead back. Your memories of entering might
 * have been placed here by whatever is pressing against the other
 * side. The dungeon is afraid too — this room threatens its
 * existence as much as the visitors'. Neither side fully controls
 * what happens here.
 * 
 * ═══════════════════════════════════════════════════════════════
 * AUTO-EFFECTS — WHY THE ROOM HURTS
 * ═══════════════════════════════════════════════════════════════
 * 
 * VISITOR — nerve -1/other round:
 *   The shapes on the other side of the membrane move closer in
 *   waves. Every few rounds, something presses against the floor
 *   hard enough to make it flex — like stepping on ice that's too
 *   thin. The party's courage isn't broken by any single horror.
 *   It's eroded by the recurring, inescapable reminder that the
 *   ground beneath them is not ground at all.
 * 
 * DUNGEON — veil -1/other round:
 *   The breach is getting worse. Every moment the room exists, the
 *   tear widens imperceptibly. The Veil — the dungeon's membrane
 *   between dimensions — is the wound itself, and it doesn't heal
 *   while people stand in it. The dungeon can exploit the breach
 *   for power, but each exploitation weakens the barrier further.
 *   Using this room is burning your own fortifications.
 * 
 * DUNGEON — structure -1/other round:
 *   Where reality fractures, architecture fails. The walls near
 *   the breach don't obey physics consistently — stone flows like
 *   water, supports phase in and out, load-bearing structures
 *   exist in two states at once. The dungeon's physical form
 *   degrades simply by proximity to the breach.
 * 
 * DESIGN NOTE: Veil Breach is the only encounter with visitor
 * initiative. The breach destabilizes the dungeon's home-field
 * advantage — reality is too chaotic for the dungeon to fully
 * control the pace. Visitors who reach this room (typically the
 * third in a gauntlet) have earned the right to seize tempo.
 * 
 * ═══════════════════════════════════════════════════════════════
 * CARD ALIGNMENT — WHY THESE CARDS BELONG HERE
 * ═══════════════════════════════════════════════════════════════
 * 
 * The Veil Breach deck is Mystical/Social: dimensional instability,
 * existential horror, and the terrifying power of a broken boundary.
 * 
 * STRIKES:
 *   Nightmare Surge — Pure terror crashes through. Nerve + Overwhelm
 *     that spills to resolve. The breach shows what's on the other
 *     side, and the excess horror bleeds into despair.
 *   Creeping Dread — Slow-building existential horror. Resolve +
 *     Erode. Not a shock but a growing certainty that nothing is
 *     real and nothing matters.
 *   Veil Lash — Reality itself cuts. Vitality + Resonate. The
 *     boundary becomes a weapon — a whip made of dimensional edge.
 *   Veil Rend — Tear the boundary open. 4P nerve, self-cost 2 veil.
 *     Exhaust. The nuclear option: maximum terror at the cost of
 *     the dungeon's own dimensional integrity. One use only.
 * 
 * SUPPORT:
 *   Fear Resonance — Channel ambient dread. Empower + Overwhelm.
 *     The breach's natural horror amplifies the next attack.
 *   Spatial Distortion — Twist space. Strip keywords from opponent.
 *     In warped reality, their preparations fail.
 *   Veil Ward / Reality Anchor — Dimensional defenses. Anchor
 *     restores baseline reality (removes ALL conditions).
 *   Reality Bend / Shadow Absorption — Bend attacks through
 *     folded space. Shadow Absorption is stronger when veil is low
 *     (the shadows deepen as the barrier thins).
 *   Reality Snag — A fold in reality punishes aggression. Trap.
 *   Glimpse Beyond — A controlled vision. The Offer path. Show
 *     them something beautiful on the other side — if they trust.
 * 
 * COMBO LINES:
 *   1. Fear Resonance → Nightmare Surge (Overwhelm spill to resolve)
 *   2. Dread Siphon (Siphon: nerve below half) → big energy turn
 *   3. Spatial Distortion → clean Strike (no keywords to counter)
 *   4. Veil Rend as alpha strike (Surge → 4P Exhaust finisher)
 *   5. Shadow Absorption scales with veil loss (natural comeback)
 * 
 * WIN CONDITIONS:
 *   Panic — Primary. Nightmare Surge + Veil Rend + nerve auto-drain.
 *     The breach IS panic. The room exists to terrify.
 *   Break — Secondary. Creeping Dread + Overwhelm spill from nerve.
 *     When panic overflows, it becomes despair.
 *   Kill — Tertiary. Veil Lash + chip damage. Slow but persistent.
 *   Survive — Visitors outlast the dimensional instability.
 *   Bond — Glimpse Beyond shows them something worth trusting.
 *     An unusual path, but shared awe can create connection.
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.6: Added structure -1/other round targeting dungeon.
 * v2.7: Visitor nerve every → other. The breach is horrifying but
 *       survivable. The dungeon's Mystical cards are what exploit
 *       the horror into genuine Panic pressure.
 */
export default {
  name: 'Veil Breach',
  description: 'A wound in reality where the boundary between dimensions has torn open and scarred over badly. Colors shift, the floor is translucent, and shapes press against the membrane from the other side. Neither side fully controls what happens here.',
  initiative: 'visitor',
  autoEffects: [
    { resource: 'nerve',     amount: -1, target: 'visitor', frequency: 'other' },  // v2.7: every → other
    { resource: 'veil',      amount: -1, target: 'dungeon', frequency: 'other' },
    { resource: 'structure', amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Mystical', 'Environmental', 'Unstable'],
};