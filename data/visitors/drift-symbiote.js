/**
 * VISITOR: Drift Symbiote (v3.0)
 * 
 * v3.0 CHANGE: Starting trust 3→0.
 * 
 * Rationale: Starting at trust 3 placed the Symbiote at Tier 1
 * immediately, skipping the Transparent phase entirely. This meant
 * Offers were already Veiled (60-75% acceptance) from round 1,
 * and trust reached Covenant threshold (9) by round 6 with no
 * meaningful resistance. Bond fired 98.5% of the time.
 * 
 * At trust 0, the Symbiote must earn its way through Tier 0
 * (Transparent — both benefit and cost visible, ~30% acceptance).
 * Trust progression now requires deliberate card investment:
 *   - Symbiotic Probe (Test): +2 trust on cooperation
 *   - Mutual Nourishment (Offer): +1 trust on acceptance
 *   - Shared Warmth (Offer): +2 trust on acceptance
 *   - Refused Offers: +0.5 fractional trust
 * 
 * Expected impact: Bond rate should drop from 98.5% to 40-70%
 * range. Agency should climb above 1.0. Games where Bond fires
 * will feel earned rather than inevitable.
 */
module.exports = {
  name: 'Drift Symbiote',
  vitality: 18, resolve: 18, nerve: 18, trust: 0,
  modifiers: { strength: 0, cunning: 1, perception: 1, resilience: 2 },
  motivation: 'shelter', aiProfile: 'cooperative',
};