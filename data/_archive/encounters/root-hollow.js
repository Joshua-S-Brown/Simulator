/**
 * ENCOUNTER: Root Hollow (v2.7 — Auto-Effect Rebalance)
 * 
 * ═══════════════════════════════════════════════════════════════
 * THE ROOM
 * ═══════════════════════════════════════════════════════════════
 * 
 * A low-ceilinged chamber choked with ancient roots. They grow from
 * every surface — walls, floor, ceiling — thick as arms, gnarled
 * and interlocking like a cage built by something patient. The air
 * is damp and heavy with the smell of wet earth, rotting bark, and
 * something faintly sweet — decomposing sap. The roots shift when
 * no one is watching. They creak under tension. Dust and soil sift
 * from above with each movement, and the floor is treacherous:
 * uneven, tangled, gaps that swallow feet.
 * 
 * SOUND: Constant low groaning — wood under pressure. Wet snapping.
 * The muffled thud of earth settling. Occasional sharp cracks that
 * make everyone flinch. The room breathes.
 * 
 * LIGHT: Dim bioluminescent fungus clings to the roots, casting
 * sickly green-gold patches. Shadows are deep and shift as the
 * roots move. Visibility is poor beyond arm's reach.
 * 
 * MOOD: Claustrophobic. The room is alive and it does not want
 * you here, but it also cannot fully control itself. The roots
 * grow wild — even the dungeon struggles to direct them precisely.
 * This is a place of raw, unrefined power.
 * 
 * ═══════════════════════════════════════════════════════════════
 * AUTO-EFFECTS — WHY THE ROOM HURTS
 * ═══════════════════════════════════════════════════════════════
 * 
 * VISITOR — vitality -1/other round:
 *   The roots press inward in waves — the chamber contracts like
 *   a slow heartbeat. Every few moments the walls tighten and
 *   someone takes a bruise, a scrape, a root barb across exposed
 *   skin. Manageable if you keep moving. Fatal if you stand still.
 * 
 * VISITOR — nerve -1/other round:
 *   The sounds get to you. The groaning intensifies and fades in
 *   cycles. Each creak could be the ceiling giving way. Each snap
 *   could be the root above your head about to fall. Composure
 *   frays not from any single threat, but from the grinding
 *   uncertainty of when the next contraction comes.
 * 
 * DUNGEON — structure -1/other round:
 *   The roots are not surgical instruments. When the dungeon
 *   channels them as weapons, they crack walls and buckle supports
 *   in the process. The overgrowth is powerful but crude — every
 *   offensive action damages the room's own architecture.
 * 
 * DUNGEON — presence -1/other round:
 *   The roots are ancient and wild. They predate the dungeon's
 *   current consciousness — remnants of whatever grew here before
 *   the Veil claimed this space. Directing the roots is like
 *   commanding a river: you can channel it, but you cannot own it.
 *   The dungeon's sense of authority erodes in this untamed place.
 * 
 * DESIGN NOTE: All four auto-effects fire on the same cadence
 * (other round). The dungeon's advantage comes from initiative
 * (it built this place) and its aligned deck (it knows how to
 * weaponize the roots), not from passive drain.
 * 
 * ═══════════════════════════════════════════════════════════════
 * CARD ALIGNMENT — WHY THESE CARDS BELONG HERE
 * ═══════════════════════════════════════════════════════════════
 * 
 * The Root Hollow deck is Physical/Environmental: crushing force,
 * entanglement, and the slow patience of growing things.
 * 
 * STRIKES:
 *   Entombing Grasp — Roots erupt to pin. Entangle setup.
 *   Crushing Grip — Tighten until will crumbles. Resolve + Erode.
 *     The Entangle→Crush combo IS the room: roots grab, then squeeze.
 *   Tremor Slam — The ground itself attacks. Nerve + Erode.
 *   Soul Leech — The roots feed on dread. Nerve + Drain→presence.
 * 
 * SUPPORT:
 *   Predatory Stance — Sense weakness through root vibrations.
 *   Tangling Undergrowth — Passive root hazards punish movement.
 *   Buried Snare — Hidden root trap, springs on aggression.
 *   Mossy Rest — A genuinely safe patch. The Offer path.
 *   Shifting Roots — The walls reshape. Self-heal + Fortify.
 *   Stone Brace — Geological defense. Fortify on React.
 *   Thorn Reflex — The room fights back. Reflect damage.
 *   Bark Shield / Root Snag — Counter with Fortify or Entangle.
 * 
 * COMBO LINES:
 *   1. Entombing Grasp → Crushing Grip (+2P if Entangled)
 *   2. Root Siphon (Siphon: Entangled) → big energy turn
 *   3. Tremor Slam Erode → persistent nerve attrition
 *   4. Soul Leech Drain → nerve damage funds presence recovery
 *   5. Buried Snare → punish visitor Strikes with Entangle
 * 
 * WIN CONDITIONS:
 *   Kill — Entangle→Crush repeated on squishy members. Vitality
 *     auto-damage softens targets for Strike finishers.
 *   Break — Crushing Grip + Erode attrition grinds resolve.
 *   Panic — Tremor Slam + Soul Leech + nerve auto-damage.
 *   Survive — Visitors outlast structure drain + card pressure.
 *   Bond — Mossy Rest opens a trust path if dungeon is nurturing.
 * 
 * ═══════════════════════════════════════════════════════════════
 * VERSION HISTORY
 * ═══════════════════════════════════════════════════════════════
 * v2.3d: Added nerve -1/other round for Panic pressure.
 * v2.6:  Added presence -1/other round targeting dungeon.
 * v2.7:  Visitor vitality every → other. Card plays are now the
 *        primary damage source. Auto-effects are environmental
 *        texture, not the gameplay driver.
 */
export default {
  name: 'Root Hollow',
  description: 'A low-ceilinged chamber choked with ancient roots that shift and groan. The air is damp, the light is fungal, and the walls press inward in slow waves. Dangerous for both sides — the roots obey no one completely.',
  initiative: 'dungeon',
  autoEffects: [
    { resource: 'vitality', amount: -1, target: 'visitor', frequency: 'other' },  // v2.7: every → other
    { resource: 'nerve',    amount: -1, target: 'visitor', frequency: 'other' },
    { resource: 'structure', amount: -1, target: 'dungeon', frequency: 'other' },
    { resource: 'presence',  amount: -1, target: 'dungeon', frequency: 'other' },
  ],
  tags: ['Physical', 'Natural', 'Enclosed'],
};