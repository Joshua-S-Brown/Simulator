/**
 * SHATTERED DUNGEON — Energy Card Resolution (v2.2)
 * 
 * Handles the four Energy card types:
 *   Standard — +1 permanent pool
 *   Surge    — +N temporary energy (this turn only, lost on refresh)
 *   Attune   — +1 permanent, next card of specified type costs -1
 *   Siphon   — +1 permanent if condition met, else +1 temp (fallback)
 * 
 * Called by encounter.js when an Energy card is played.
 * Returns a result object describing what happened (for logging).
 */

import * as R from './rules.js';
/**
 * Check if a siphon condition is met.
 * @param {object} siphon - { condition, target } from card data
 * @param {object} self - Playing side's state
 * @param {object} opponent - Opponent's state
 * @returns {boolean}
 */
function checkSiphonCondition(siphon, self, opponent) {
  if (!siphon || !siphon.condition) return false;

  const cond = siphon.condition;
  const target = siphon.target === 'opponent' ? opponent : self;

  switch (cond.type) {
    case 'has_condition':
      return R.hasCondition(target, cond.condition);

    case 'resource_below': {
      const current = target[cond.resource] || 0;
      const start = (target.startingValues || {})[cond.resource] || 20;
      return current / start < (cond.pct || 0.5);
    }

    case 'resource_above': {
      const current = target[cond.resource] || 0;
      const threshold = cond.threshold || 0;
      return current > threshold;
    }

    default:
      return false;
  }
}

/**
 * Resolve an Energy card play.
 * @param {object} card - The Energy card being played
 * @param {object} energy - Energy pool (from rules.createEnergyPool)
 * @param {object} self - Playing side's state
 * @param {object} opponent - Opponent's state
 * @returns {object} { type, poolAfter, description }
 */
function resolveEnergy(card, energy, self, opponent) {
  const etype = card.energyType || 'standard';

  switch (etype) {
    case 'standard': {
      const gain = card.energyGain || 1;
      energy.addPermanent(gain);
      return {
        type: 'standard',
        poolAfter: energy.base,
        description: `+${gain} permanent → pool ${energy.base}`,
      };
    }

    case 'surge': {
      const gain = card.surgeGain || 2;
      energy.addTemp(gain);
      return {
        type: 'surge',
        poolAfter: energy.base,
        tempGain: gain,
        description: `+${gain} temp → available ${energy.available} (pool ${energy.base})`,
      };
    }

    case 'attune': {
      const gain = card.energyGain || 1;
      energy.addPermanent(gain);
      // Attune discount is tracked as a condition on self, consumed by next matching card
      if (card.attune) {
        const existing = (self.conditions || []).find(
          c => c.type === 'attune' && c.cardType === card.attune.cardType
        );
        if (!existing) {
          self.conditions = self.conditions || [];
          self.conditions.push({
            type: 'attune',
            cardType: card.attune.cardType,
            discount: card.attune.discount || 1,
            source: card.name,
            duration: 99, // Lasts until consumed
          });
        }
      }
      return {
        type: 'attune',
        poolAfter: energy.base,
        attuneType: card.attune?.cardType,
        description: `+${gain} permanent → pool ${energy.base}. Next ${card.attune?.cardType || '?'} card costs ${card.attune?.discount || 1} less.`,
      };
    }

    case 'siphon': {
      const conditionMet = checkSiphonCondition(card.siphon, self, opponent);
      if (conditionMet) {
        const gain = card.energyGain || 1;
        energy.addPermanent(gain);
        return {
          type: 'siphon',
          conditionMet: true,
          poolAfter: energy.base,
          description: `Siphon condition met! +${gain} permanent → pool ${energy.base}`,
        };
      } else {
        const fallback = card.siphonFallback || 1;
        energy.addTemp(fallback);
        return {
          type: 'siphon',
          conditionMet: false,
          poolAfter: energy.base,
          tempGain: fallback,
          description: `Siphon condition not met. +${fallback} temp → available ${energy.available}`,
        };
      }
    }

    default: {
      // Fallback: treat as standard
      energy.addPermanent(1);
      return {
        type: 'unknown',
        poolAfter: energy.base,
        description: `Unknown energy type "${etype}", defaulted to +1 permanent`,
      };
    }
  }
}

/**
 * Check and consume an Attune discount for a card about to be played.
 * Call this BEFORE spending energy on an action card.
 * @param {object} card - The action card being played
 * @param {object} self - Playing side's state
 * @returns {number} Discount amount (0 if no attune matches)
 */
function consumeAttune(card, self) {
  if (!card.type || !self.conditions) return 0;

  const idx = self.conditions.findIndex(
    c => c.type === 'attune' && c.cardType === card.type
  );
  if (idx === -1) return 0;

  const attune = self.conditions[idx];
  self.conditions.splice(idx, 1); // Consume it
  return attune.discount || 1;
}

export { resolveEnergy, consumeAttune, checkSiphonCondition };