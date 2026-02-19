/**
 * SHATTERED DUNGEON — AI Utilities (v2.2)
 * 
 * Shared helpers for all AI modules.
 * Import with: const { getEffectiveCost } = require('./ai-utils');
 */

/**
 * Get the effective cost of a card, accounting for active Attune conditions.
 * Does NOT consume the attune — just peeks to see if a discount is available.
 * Used by AI budget loops to avoid skipping affordable cards.
 * 
 * @param {object} card - The card to check cost for
 * @param {object} self - Playing side's state (has .conditions array)
 * @returns {number} Effective cost after any applicable Attune discount
 */
function getEffectiveCost(card, self) {
  const baseCost = card.cost || 0;
  if (baseCost === 0) return 0;
  if (!card.type || !self || !self.conditions) return baseCost;

  const attune = self.conditions.find(
    c => c.type === 'attune' && c.cardType === card.type
  );
  if (!attune) return baseCost;

  return Math.max(0, baseCost - (attune.discount || 1));
}

module.exports = { getEffectiveCost };