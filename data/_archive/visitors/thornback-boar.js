/**
 * VISITOR: Thornback Boar (v2.3d)
 * 
 * v2.3d: vitality reverted to 28 (best Kill/Break distribution)
 *   Panic addressed via encounter auto-effects, not stat compression.
 *   26 was a compromise that satisfied nothing; 24 overcorrected Kill.
 * v2.3:  resolve 16 → 14, nerve 16 → 14 (preserved)
 * 
 * Tankiest visitor: 28 vs Symbiote 18 vs Moth 14
 */
export default {
  name: 'Thornback Boar',
  vitality: 28, resolve: 14, nerve: 14, trust: 0,
  modifiers: { strength: 2, cunning: 0, perception: 1, resilience: 1 },
  motivation: 'territorial', aiProfile: 'feral_aggressive',
};