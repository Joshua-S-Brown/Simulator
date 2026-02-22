/**
 * SHATTERED DUNGEON — Deck Tracker v1.0
 * 
 * Tracks a side's own deck composition:
 * - Full deck list (known at game start)
 * - Cards played (moved to discard)
 * - Cards in hand (currently held)
 * - Cards remaining in draw pile = full - played - inHand
 * - Draw probability estimates per category
 */

/**
 * Create a deck tracker for one side.
 * @param {Array} fullDeck - Complete deck list
 * @returns {object} Tracker with update and query methods
 */
function createDeckTracker(fullDeck) {
  // Categorize the full deck
  const deckByCategory = {};
  for (const card of fullDeck) {
    const cat = card.category || 'Unknown';
    deckByCategory[cat] = (deckByCategory[cat] || 0) + 1;
  }

  const played = [];         // Cards we've played (in discard)
  let currentHand = [];      // Cards currently in hand
  let deckRecycles = 0;      // How many times discard has been shuffled back

  return {
    fullDeck,
    deckByCategory,

    /**
     * Update tracker with current hand state.
     * Called at the start of each turn with the current hand.
     */
    updateHand(hand) {
      currentHand = [...hand];
    },

    /**
     * Record that a card was played (moved to discard).
     */
    recordPlay(card) {
      played.push(card);
    },

    /**
     * Record a deck recycle event (discard shuffled into draw pile).
     */
    recordRecycle() {
      deckRecycles++;
      // After recycle, played cards are back in the deck
      played.length = 0;
    },

    /**
     * Get cards remaining in draw pile (approximately).
     * After recycles this becomes less certain, so we estimate.
     */
    getRemaining() {
      if (deckRecycles > 0) {
        // After recycle, entire deck is back minus what's in hand
        return fullDeck.length - currentHand.length;
      }
      return fullDeck.length - played.length - currentHand.length;
    },

    /**
     * Get category counts for remaining draw pile.
     * Returns { Strike: 2, Empower: 0, ... }
     */
    getRemainingByCategory() {
      const remaining = { ...deckByCategory };

      // Subtract what's in hand
      for (const card of currentHand) {
        const cat = card.category || 'Unknown';
        if (remaining[cat]) remaining[cat]--;
      }

      // Subtract what's been played (if no recycle)
      if (deckRecycles === 0) {
        for (const card of played) {
          const cat = card.category || 'Unknown';
          if (remaining[cat]) remaining[cat]--;
        }
      }

      // Clamp to 0
      for (const cat of Object.keys(remaining)) {
        remaining[cat] = Math.max(0, remaining[cat]);
      }
      return remaining;
    },

    /**
     * Probability of drawing at least one card of a category in N draws.
     * P(at least one) = 1 - P(none in N draws)
     * Uses hypergeometric approximation.
     */
    drawProbability(category, drawCount = 2) {
      const totalRemaining = this.getRemaining();
      if (totalRemaining <= 0) return 0;

      const remaining = this.getRemainingByCategory();
      const categoryCount = remaining[category] || 0;
      if (categoryCount <= 0) return 0;

      // Hypergeometric: P(0 in N draws from pool of totalRemaining with categoryCount hits)
      // Simplified: P(miss first) * P(miss second) * ...
      let pNone = 1;
      let poolSize = totalRemaining;
      let misses = poolSize - categoryCount;
      for (let i = 0; i < Math.min(drawCount, poolSize); i++) {
        pNone *= misses / poolSize;
        misses--;
        poolSize--;
        if (poolSize <= 0) break;
      }
      return 1 - pNone;
    },

    /**
     * Get strategic summary: what's left in our deck and hand?
     */
    getSummary() {
      const handCats = {};
      for (const card of currentHand) {
        const cat = card.category || 'Unknown';
        handCats[cat] = (handCats[cat] || 0) + 1;
      }

      const remaining = this.getRemainingByCategory();
      const totalRemaining = this.getRemaining();

      return {
        handSize: currentHand.length,
        handCategories: handCats,
        deckRemaining: totalRemaining,
        deckCategories: remaining,
        deckRecycles,
        // Key strategic info
        hasStrikesInHand: (handCats.Strike || 0) > 0,
        hasReactsInHand: (handCats.React || 0) > 0,
        strikesRemaining: remaining.Strike || 0,
        reactsRemaining: remaining.React || 0,
        countersRemaining: remaining.Counter || 0,
        reshapesRemaining: remaining.Reshape || 0,
        // Draw probabilities for next draw (2 cards)
        pStrikeNextDraw: this.drawProbability('Strike', 2),
        pReactNextDraw: this.drawProbability('React', 2),
        pCounterNextDraw: this.drawProbability('Counter', 2),
        pReshapeNextDraw: this.drawProbability('Reshape', 2),
      };
    },
  };
}

export { createDeckTracker };