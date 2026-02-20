/**
 * BOND v3.0 — Transactional Offer Card Replacements
 * 
 * Drop these into the respective deck files, replacing the existing
 * Offer cards (search for category: 'Offer' in each file).
 * 
 * NEW FORMAT:
 *   card.offer = {
 *     benefit:    { resource, amount }
 *     cost:       { type: 'flat'|'binding'|'exposure'|'extraction'|'dependency', ... }
 *     investment: { trust: N }
 *   }
 * 
 * Cards also retain the old offerPayload field commented out for reference.
 * The bond.js module detects card.offer and uses the new system; if absent,
 * falls back to legacy offerPayload handling.
 * 
 * ═══════════════════════════════════════════════════════════════
 * ROOT HOLLOW — Physical/Environmental room
 * Replaces: Mossy Rest (1 card)
 * Adds: 1 Covenant card (Pact of Living Stone)
 * ═══════════════════════════════════════════════════════════════
 */

// ── ROOT HOLLOW: Replace existing Mossy Rest ──
const rootHollowOffers = [
  {
    name: 'Mossy Rest',
    category: 'Offer',
    type: 'Environmental',
    cost: 1,
    offer: {
      benefit: { resource: 'vitality', amount: 3 },
      cost: { type: 'binding', resource: 'resolve', amount: 1, duration: 2 },
      investment: { trust: 1 },
    },
    description: 'A patch of luminous moss pulses with warmth. Rest here and recover — but the roots remember what they gave. Heal 3 vitality. Binding: resolve -1/round for 2 rounds.',
  },
  // ── ROOT HOLLOW: Add Covenant ──
  {
    name: 'Pact of Living Stone',
    category: 'Offer',
    subtype: 'Covenant',
    type: 'Environmental',
    cost: 4,
    covenantRequirement: { minTrust: 9 },
    bondTrigger: true,
    offer: {
      benefit: { type: 'full_restore', resource: 'lowest_reducer' },
      cost: { type: 'extraction', effect: 'dungeon_insight_2' },
      investment: { trust: 3 },
    },
    description: 'The walls part to reveal a sanctum of ancient warmth. The dungeon offers its deepest chamber — and asks only that you remember the way back.',
  },
];

/**
 * ═══════════════════════════════════════════════════════════════
 * WHISPERING GALLERY — Social/Mystical room
 * Replaces: Comforting Lie (1 card)
 * Adds: 1 Covenant card (Pact of Shared Silence)
 * ═══════════════════════════════════════════════════════════════
 */
const whisperingGalleryOffers = [
  {
    name: 'Comforting Lie',
    category: 'Offer',
    type: 'Social',
    cost: 2,
    offer: {
      benefit: { resource: 'nerve', amount: 3 },
      cost: { type: 'exposure', strikeType: 'Social', amount: 2, duration: 1 },
      investment: { trust: 1 },
    },
    description: 'A soothing falsehood that calms the spirit. The words feel true — but they leave you open. Heal 3 nerve. Exposure: next Social Strike deals +2.',
  },
  {
    name: 'Pact of Shared Silence',
    category: 'Offer',
    subtype: 'Covenant',
    type: 'Social',
    cost: 4,
    covenantRequirement: { minTrust: 9 },
    bondTrigger: true,
    offer: {
      benefit: { type: 'full_restore', resource: 'lowest_reducer' },
      cost: { type: 'extraction', effect: 'dungeon_insight_2' },
      investment: { trust: 3 },
    },
    description: 'The whispers fall silent. For the first time, the Gallery offers true quiet — a shared peace that costs nothing but the memory of what was said here.',
  },
];

/**
 * ═══════════════════════════════════════════════════════════════
 * VEIL BREACH — Mystical/Environmental room
 * Currently has no Offer card. Add 1 Offer + 1 Covenant.
 * These go into dungeon-veil-breach.js (requires removing one
 * existing card to maintain deck size, or expanding the deck).
 * ═══════════════════════════════════════════════════════════════
 */
const veilBreachOffers = [
  {
    name: 'Veil Mending',
    category: 'Offer',
    type: 'Mystical',
    cost: 2,
    offer: {
      benefit: { resource: 'nerve', amount: 2 },
      cost: { type: 'dependency', resource: 'nerve', amount: 4 },
      investment: { trust: 1 },
    },
    description: 'The rift stabilizes around you, dampening the alien dread. Accept the calm — but if trust shatters, the terror comes back doubled.',
  },
  {
    name: 'Pact of the Threshold',
    category: 'Offer',
    subtype: 'Covenant',
    type: 'Mystical',
    cost: 4,
    covenantRequirement: { minTrust: 9 },
    bondTrigger: true,
    offer: {
      benefit: { type: 'full_restore', resource: 'lowest_reducer' },
      cost: { type: 'extraction', effect: 'dungeon_insight_2' },
      investment: { trust: 3 },
    },
    description: 'The boundary between worlds thins to nothing. Step through — not as invader but as guest. The dungeon holds the door open.',
  },
];

/**
 * ═══════════════════════════════════════════════════════════════
 * HONEYED HOLLOW — Deceptive room
 * Existing Offers (Amber Draught, Soothing Light, Gilded Fruit)
 * already serve the deception purpose. Update to new format with
 * hidden costs that look fair at Tier 0 but compound nastily.
 * ═══════════════════════════════════════════════════════════════
 */
const honeyedHollowOffers = [
  {
    name: 'Amber Draught',
    category: 'Offer',
    type: 'Environmental',
    cost: 1,
    offer: {
      benefit: { resource: 'vitality', amount: 2 },
      cost: { type: 'binding', resource: 'resolve', amount: 1, duration: 1 },
      investment: { trust: 1 },
    },
    description: 'Warm honeyed liquid from the hollow\'s heart. Restorative — though the sweetness lingers too long. Heal 2 vitality. Binding: resolve -1 for 1 round.',
  },
  {
    name: 'Soothing Light',
    category: 'Offer',
    type: 'Social',
    cost: 1,
    offer: {
      benefit: { resource: 'nerve', amount: 2 },
      cost: { type: 'exposure', strikeType: 'Social', amount: 2, duration: 1 },
      investment: { trust: 1 },
    },
    description: 'Soft luminescence that calms fear. But lowered guard invites deeper influence. Heal 2 nerve. Exposure: next Social Strike deals +2.',
  },
  {
    name: 'Gilded Fruit',
    category: 'Offer',
    type: 'Environmental',
    cost: 2,
    offer: {
      benefit: { resource: 'vitality', amount: 3 },
      cost: { type: 'binding', resource: 'nerve', amount: 1, duration: 2 },
      investment: { trust: 2 },
    },
    description: 'An irresistible offering — golden fruit that heals deeply. The aftertaste, though, creeps into your courage. Heal 3 vitality. Binding: nerve -1/round for 2 rounds.',
  },
];

/**
 * ═══════════════════════════════════════════════════════════════
 * LIVING ROOT SANCTUARY — Nurturing room
 * Already has 3 Offers (Healing Sap, Sheltering Roots, Luminous Gift).
 * Update to new format + add Covenant.
 * ═══════════════════════════════════════════════════════════════
 */
const sanctuaryOffers = [
  {
    name: 'Healing Sap',
    category: 'Offer',
    type: 'Environmental',
    cost: 1,
    offer: {
      benefit: { resource: 'vitality', amount: 2 },
      cost: { type: 'flat', resource: 'resolve', amount: 1 },
      investment: { trust: 1 },
    },
    description: 'Amber sap with restorative properties. Accept the gift — it costs only a sliver of certainty. Heal 2 vitality. Cost: resolve -1.',
  },
  {
    name: 'Sheltering Roots',
    category: 'Offer',
    type: 'Environmental',
    cost: 1,
    offer: {
      benefit: { resource: 'nerve', amount: 2 },
      cost: { type: 'flat', resource: 'vitality', amount: 1 },
      investment: { trust: 1 },
    },
    description: 'An invitation to rest within protective coils. Safe from the dark — but the roots need something to hold. Heal 2 nerve. Cost: vitality -1.',
  },
  {
    name: 'Luminous Gift',
    category: 'Offer',
    type: 'Social',
    cost: 2,
    offer: {
      benefit: { resource: 'resolve', amount: 2 },
      cost: { type: 'extraction', effect: 'dungeon_knowledge_1' },
      investment: { trust: 2 },
    },
    description: 'A glowing offering that strengthens purpose. The dungeon watches, learns, remembers. Heal 2 resolve. Cost: dungeon learns from the experience.',
  },
  // Sanctuary Covenant
  {
    name: 'Pact of the Living Root',
    category: 'Offer',
    subtype: 'Covenant',
    type: 'Environmental',
    cost: 3,
    covenantRequirement: { minTrust: 9 },
    bondTrigger: true,
    offer: {
      benefit: { type: 'full_restore', resource: 'lowest_reducer' },
      cost: { type: 'extraction', effect: 'dungeon_insight_2' },
      investment: { trust: 3 },
    },
    description: 'The sanctuary opens fully — not as trap, not as test, but as home. The roots weave a chair that fits exactly. Stay as long as you need.',
  },
];

module.exports = {
  rootHollowOffers,
  whisperingGalleryOffers,
  veilBreachOffers,
  honeyedHollowOffers,
  sanctuaryOffers,
};