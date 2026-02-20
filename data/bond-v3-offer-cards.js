/**
 * SHATTERED DUNGEON — Bond System v3.0
 *
 * Replaces the old charity-based Offer/Trust/Bond system with
 * transaction-based mechanics. Trust is leverage, not friendship.
 *
 * KEY CONCEPTS:
 *   - Offers are transactions with benefit, cost, and investment
 *   - Trust tiers unlock escalating dungeon capabilities
 *   - Betrayal converts accumulated trust to targeted damage
 *   - Bond triggers via Covenant cards at Trust 9+, not dual threshold
 *   - Rapport is removed as a separate tracker
 *
 * TRUST TIERS:
 *   Tier 0 (0–2)  Strangers   — Transparent Offers (both sides see everything)
 *   Tier 1 (3–5)  Familiar    — Veiled Offers (cost hidden from acceptor)
 *   Tier 2 (6–8)  Entrusted   — Binding Offers (auto-accepted)
 *   Tier 3 (9+)   Covenant    — Covenant attempt eligible (Bond finisher)
 *
 * INTEGRATION:
 *   const Bond = require('./bond');
 *   // In resolveOffer: Bond.resolveTransactionalOffer(card, side, self, opp, ctx)
 *   // After Strike:    Bond.applyTrustDecay(side, self, opp, ctx)
 *   //                  Bond.checkBetrayal(side, self, opp, ctx)
 *   // Win condition:   Bond.checkBondWin(visitor, dungeon)
 */

const R = require('./rules');

// ═══════════════════════════════════════════════════════════════
// TRUST TIER SYSTEM
// ═══════════════════════════════════════════════════════════════

function getTrustTier(trust) {
  if (trust >= 9) return 3;
  if (trust >= 6) return 2;
  if (trust >= 3) return 1;
  return 0;
}

function getTrustTierName(tier) {
  return ['Strangers', 'Familiar', 'Entrusted', 'Covenant'][tier] || 'Unknown';
}

// ═══════════════════════════════════════════════════════════════
// TRANSACTIONAL OFFER RESOLUTION
// ═══════════════════════════════════════════════════════════════

/**
 * Resolve a transactional Offer card.
 *
 * New-format card.offer = {
 *   benefit:    { resource, amount } or { type: 'full_restore', resource: 'lowest_reducer' }
 *   cost:       { type: 'flat'|'binding'|'exposure'|'extraction'|'dependency', ... }
 *   investment: { trust: N }  (rapport removed)
 * }
 *
 * Also supports legacy format (card.offerPayload) for backwards compatibility.
 *
 * Returns: { accepted: bool, bond: bool } — bond=true if Covenant accepted
 */
function resolveTransactionalOffer(card, side, self, opp, ctx) {
  const log = ctx.log;
  const visitorState = side === 'dungeon' ? opp : self;
  const dungeonState = side === 'dungeon' ? self : opp;
  const trust = visitorState.trust || 0;
  const tier = getTrustTier(trust);

  // ── Check Betrayed condition (auto-refuse all Offers) ──
  const betrayed = opp.conditions?.find(c => c.type === 'betrayed');
  if (betrayed) {
    log(`  [${side}] Offer: ${card.name} → AUTO-REFUSED (Betrayed condition active)`);
    applyRefusalTrust(visitorState, log);
    return { accepted: false, bond: false };
  }

  // ── Detect format ──
  if (!card.offer) {
    // Legacy format — use old-style resolution
    return resolveLegacyOffer(card, side, self, opp, ctx);
  }

  const offer = card.offer;
  const isCovenant = card.subtype === 'Covenant' || card.bondTrigger;

  // ── Covenant eligibility check ──
  if (isCovenant && tier < 3) {
    log(`  [${side}] Covenant: ${card.name} → INELIGIBLE (trust ${trust}, need 9+)`);
    return { accepted: false, bond: false };
  }

  // ── Determine acceptance ──
  let accepted;
  let acceptChance;

  if (tier >= 2 && !isCovenant) {
    // Binding Offers: auto-accepted at Tier 2+
    accepted = true;
    acceptChance = 1.0;
    log(`  [${side}] Offer: ${card.name} → BINDING (trust:${trust}, tier:${tier} ${getTrustTierName(tier)})`);
  } else if (isCovenant) {
    // Covenant: special acceptance formula
    acceptChance = computeCovenantAcceptance(trust, visitorState, dungeonState, ctx);
    accepted = Math.random() < acceptChance;
    log(`  [${side}] Covenant: ${card.name} → ${accepted ? 'ACCEPTED' : 'REFUSED'} (trust:${trust}, chance:${(acceptChance * 100).toFixed(0)}%)`);
  } else if (tier === 1) {
    // Veiled: party sees benefit, not cost
    acceptChance = computeVeiledAcceptance(offer.benefit, trust, visitorState);
    accepted = Math.random() < acceptChance;
    log(`  [${side}] Offer: ${card.name} → ${accepted ? 'ACCEPTED' : 'REFUSED'} (trust:${trust}, tier:1 Veiled, chance:${(acceptChance * 100).toFixed(0)}%)`);
  } else {
    // Transparent: party sees everything
    acceptChance = computeTransparentAcceptance(offer, trust, visitorState);
    accepted = Math.random() < acceptChance;
    log(`  [${side}] Offer: ${card.name} → ${accepted ? 'ACCEPTED' : 'REFUSED'} (trust:${trust}, tier:0 Transparent, chance:${(acceptChance * 100).toFixed(0)}%)`);
  }

  if (!accepted) {
    // Refused offers grant fractional trust (+0.5, tracked as 0 or 1 alternating)
    applyRefusalTrust(visitorState, log);
    if (isCovenant) {
      // Covenant refusal: trust crashes by 50%
      const lost = Math.ceil(trust * 0.5);
      visitorState.trust = Math.max(0, visitorState.trust - lost);
      log(`    [Covenant Refused] trust crashes -${lost}`);
    }
    return { accepted: false, bond: false };
  }

  // ── Apply benefit (always to opponent/visitor) ──
  const benefitTarget = side === 'dungeon' ? opp : self;
  applyOfferBenefit(offer.benefit, benefitTarget, ctx);

  // ── Apply cost (to the acceptor — the opponent of the offerer) ──
  const costTarget = side === 'dungeon' ? opp : self;
  if (offer.cost) {
    applyOfferCost(offer.cost, costTarget, ctx);
  }

  // ── Apply investment (trust advancement) ──
  if (offer.investment?.trust) {
    const gained = applyTrustGain(visitorState, offer.investment.trust, ctx);
    log(`    Investment: trust +${gained}`);
  }

  // ── Trap check on Offer acceptance ──
  const traps = self.conditions?.filter(c => c.type === 'trap' && c.trigger === 'offer_accepted') || [];
  for (const trap of traps) {
    log(`    TRAP SPRINGS: ${trap.card.name}`);
    self.conditions = self.conditions.filter(c => c !== trap);
    if (trap.card.trapEffect) {
      const effects = Array.isArray(trap.card.trapEffect) ? trap.card.trapEffect : [trap.card.trapEffect];
      for (const eff of effects) {
        if (eff.applyEntangle) {
          opp.conditions.push({ type: 'entangled', placedBy: side, source: trap.card.name });
          log(`      → Entangle applied`);
        }
        if (eff.damage) {
          const dmg = R.applyDamage(opp, eff.damage.resource, eff.damage.amount, 1);
          log(`      → ${eff.damage.resource} -${dmg}`);
        }
        if (eff.resource) {
          const t = eff.target === 'triggerer' ? opp : self;
          const dmg = R.applyDamage(t, eff.resource, Math.abs(eff.amount), 1);
          log(`      → ${eff.resource} -${dmg}`);
        }
      }
    }
  }

  // ── Bond trigger (Covenant accepted) ──
  if (isCovenant && accepted) {
    log(`    ★ COVENANT ACCEPTED — Bond triggered!`);
    return { accepted: true, bond: true };
  }

  return { accepted: true, bond: false };
}

// ═══════════════════════════════════════════════════════════════
// ACCEPTANCE FORMULAS
// ═══════════════════════════════════════════════════════════════

/**
 * Tier 0: Both benefit and cost are visible. Accept if net positive.
 */
function computeTransparentAcceptance(offer, trust, visitor) {
  const benefitVal = estimateBenefitValue(offer.benefit, visitor);
  const costVal = offer.cost ? estimateCostValue(offer.cost) : 0;
  const net = benefitVal - costVal;
  const pressure = computeResourcePressure(visitor);

  // desperation_threshold: lower when more resources are critical
  const threshold = Math.max(0, 2 - (3 * pressure));

  // Base from net value, boosted slightly by trust
  const baseChance = net > threshold ? 0.5 + (net * 0.1) + (trust * 0.05) : 0.15 + (trust * 0.05);
  return Math.min(0.9, Math.max(0.1, baseChance));
}

/**
 * Tier 1: Benefit visible, cost hidden. Party gambles.
 */
function computeVeiledAcceptance(benefit, trust, visitor) {
  const benefitVal = estimateBenefitValue(benefit, visitor);
  const trustFactor = 0.3 + (trust * 0.08);
  const pressure = computeResourcePressure(visitor);
  const riskThreshold = Math.max(0.8, 1.5 - (pressure * 2));

  const chance = (benefitVal * trustFactor) > riskThreshold
    ? 0.4 + (trust * 0.06) + (pressure * 0.2)
    : 0.2 + (trust * 0.04);
  return Math.min(0.85, Math.max(0.15, chance));
}

/**
 * Covenant: High-stakes final decision.
 */
function computeCovenantAcceptance(trust, visitor, dungeon, ctx) {
  const trustFactor = 0.5 + (trust * 0.04);
  const pressure = computeResourcePressure(visitor);
  const desperationFactor = 1.0 + (0.3 * pressure);

  // Check if dungeon played any Strikes this encounter
  const dungeonStrikes = ctx.stats?.dStrikesPlayed || 0;
  const suspicionModifier = dungeonStrikes > 0 ? 0.7 : 1.0;

  return Math.min(0.95, Math.max(0.3, trustFactor * desperationFactor * suspicionModifier));
}

// ═══════════════════════════════════════════════════════════════
// VALUE ESTIMATION (for AI acceptance decisions)
// ═══════════════════════════════════════════════════════════════

function estimateBenefitValue(benefit, visitor) {
  if (!benefit) return 0;
  if (benefit.type === 'full_restore') return 6; // Very high value
  const amount = benefit.amount || 0;
  // Value scales with how badly the resource is needed
  const current = visitor[benefit.resource] || 0;
  const starting = visitor.startingValues?.[benefit.resource] || 16;
  const pct = current / starting;
  // Below 40%: value doubles. Below 20%: triples.
  const urgency = pct < 0.2 ? 3 : pct < 0.4 ? 2 : pct < 0.6 ? 1.3 : 1;
  return amount * urgency;
}

function estimateCostValue(cost) {
  if (!cost) return 0;
  switch (cost.type) {
    case 'flat':
      return cost.amount || 0;
    case 'binding':
      return (cost.amount || 1) * (cost.duration || 1) * 1.2; // Binding is worse than flat
    case 'exposure':
      return (cost.amount || 2) * 0.6; // Conditional — might not trigger
    case 'extraction':
      return 2; // Moderate — benefits dungeon long-term
    case 'dependency':
      return (cost.amount || 2) * 0.8; // Might reverse, might not
    default:
      return cost.amount || 1;
  }
}

function computeResourcePressure(entity) {
  // What fraction of resources are below 40%?
  const resources = ['vitality', 'resolve', 'nerve'];
  const sv = entity.startingValues || {};
  let critical = 0;
  let total = 0;
  for (const r of resources) {
    if (entity[r] !== undefined && sv[r]) {
      total++;
      if (entity[r] / sv[r] < 0.4) critical++;
    }
  }
  // Also check party total vitality if party
  if (entity.isParty && entity.members) {
    let totalVit = 0, maxVit = 0;
    for (const m of Object.values(entity.members)) {
      if (m.status === 'active') {
        totalVit += m.vitality;
        maxVit += m.maxVitality || m.vitality;
      }
    }
    if (maxVit > 0 && totalVit / maxVit < 0.4) critical++;
    total++;
  }
  return total > 0 ? critical / total : 0;
}

// ═══════════════════════════════════════════════════════════════
// OFFER EFFECT APPLICATION
// ═══════════════════════════════════════════════════════════════

function applyOfferBenefit(benefit, target, ctx) {
  const log = ctx.log;
  if (!benefit) return;

  if (benefit.type === 'full_restore') {
    // Covenant-level: restore lowest reducer fully
    const resources = target.isParty
      ? ['resolve', 'nerve']
      : ['vitality', 'resolve', 'nerve'];
    const sv = target.startingValues || {};
    let lowest = null, lowestPct = 1;
    for (const r of resources) {
      if (target[r] !== undefined && sv[r]) {
        const pct = target[r] / sv[r];
        if (pct < lowestPct) { lowestPct = pct; lowest = r; }
      }
    }
    if (lowest) {
      const restored = sv[lowest] - target[lowest];
      R.applyBenefit(target, lowest, restored);
      log(`    Benefit: ${lowest} fully restored (+${restored})`);
    }
  } else if (benefit.resource && benefit.amount) {
    R.applyBenefit(target, benefit.resource, benefit.amount);
    log(`    Benefit: ${benefit.resource} +${benefit.amount}`);
  }
}

function applyOfferCost(cost, target, ctx) {
  const log = ctx.log;
  if (!cost) return;

  switch (cost.type) {
    case 'flat': {
      const dmg = R.applyDamage(target, cost.resource, cost.amount, 1);
      log(`    Cost: ${cost.resource} -${dmg} (flat)`);
      break;
    }

    case 'binding': {
      // Add a persistent drain condition
      target.conditions = target.conditions || [];
      target.conditions.push({
        type: 'binding',
        resource: cost.resource,
        amount: cost.amount || 1,
        duration: cost.duration || 2,
        source: 'Offer cost',
        placedBy: 'dungeon',
      });
      log(`    Cost: Binding ${cost.resource} -${cost.amount || 1}/round for ${cost.duration || 2} rounds`);
      break;
    }

    case 'exposure': {
      // Next incoming Strike of matching type deals bonus damage
      target.conditions = target.conditions || [];
      target.conditions.push({
        type: 'exposure',
        strikeType: cost.strikeType || null,
        bonusDamage: cost.amount || 2,
        duration: cost.duration || 1,
        source: 'Offer cost',
        placedBy: 'dungeon',
      });
      log(`    Cost: Exposure — next ${cost.strikeType || 'any'} Strike deals +${cost.amount || 2}`);
      break;
    }

    case 'extraction': {
      // Dungeon gains a permanent benefit (logged, applied elsewhere in progression)
      log(`    Cost: Extraction — ${cost.effect || 'dungeon gains permanent benefit'}`);
      // Store for economy tracking
      ctx.extractions = ctx.extractions || [];
      ctx.extractions.push(cost.effect);
      break;
    }

    case 'dependency': {
      // Benefit reverses if trust drops below current level
      target.conditions = target.conditions || [];
      const currentTrust = target.trust || 0;
      target.conditions.push({
        type: 'dependency',
        resource: cost.resource,
        reversalAmount: cost.amount || 0,
        trustFloor: currentTrust,
        source: 'Offer cost',
        placedBy: 'dungeon',
      });
      log(`    Cost: Dependency — lose ${cost.amount} ${cost.resource} if trust drops below ${currentTrust}`);
      break;
    }

    default:
      if (cost.resource && cost.amount) {
        const dmg = R.applyDamage(target, cost.resource, cost.amount, 1);
        log(`    Cost: ${cost.resource} -${dmg}`);
      }
  }
}

// ═══════════════════════════════════════════════════════════════
// TRUST MANAGEMENT
// ═══════════════════════════════════════════════════════════════

/**
 * Apply trust gain with per-round cap.
 */
function applyTrustGain(visitorState, amount, ctx) {
  const cap = ctx.promoterGainCap || 2;
  const start = ctx.roundStartTrust || 0;
  const current = visitorState.trust || 0;
  const gained = current - start;
  const room = Math.max(0, cap - gained);
  const actual = Math.min(amount, room);
  if (actual > 0) {
    visitorState.trust = (visitorState.trust || 0) + actual;
  }
  return actual;
}

/**
 * Refused Offers grant fractional trust.
 * We track fractional trust as _fractionalTrust on the visitor state.
 * When it reaches 1.0, convert to +1 trust.
 */
function applyRefusalTrust(visitorState, log) {
  visitorState._fractionalTrust = (visitorState._fractionalTrust || 0) + 0.5;
  if (visitorState._fractionalTrust >= 1.0) {
    visitorState._fractionalTrust -= 1.0;
    visitorState.trust = (visitorState.trust || 0) + 1;
    log(`    [Refusal] trust +1 (accumulated from refused Offers)`);
  } else {
    log(`    [Refusal] trust +0.5 (pending)`);
  }
}

/**
 * Trust decay when dungeon plays a Strike.
 * -1 at trust 1-5, -2 at trust 6+.
 * Called BEFORE betrayal check so betrayal uses pre-decay trust.
 */
function applyTrustDecay(side, self, opp, ctx) {
  if (side !== 'dungeon') return; // Only dungeon strikes erode trust
  const log = ctx.log;
  const visitor = opp;
  const trust = visitor.trust || 0;
  if (trust <= 0) return;

  const decay = trust >= 6 ? 2 : 1;
  const newTrust = Math.max(0, trust - decay);
  const lost = trust - newTrust;
  visitor.trust = newTrust;
  log(`    [Trust Decay] trust -${lost} (dungeon Strike while trust ${trust})`);
}

// ═══════════════════════════════════════════════════════════════
// BETRAYAL CONVERSION
// ═══════════════════════════════════════════════════════════════

/**
 * Check for and resolve betrayal when a Strike is played.
 * 
 * Dungeon betrayal (trust >= 4): Trust converts to damage on visitor's
 * lowest reducer. Trust resets to 0. Visitor gains Betrayed condition.
 *
 * Visitor betrayal (trust >= 4): Trust crashes to 0. Dungeon gains
 * Scorned condition (+1 rolls for 3 rounds). No damage conversion.
 *
 * IMPORTANT: Call this AFTER the Strike resolves and AFTER trust decay.
 * Betrayal uses the post-decay trust value (so trust decay reduces
 * betrayal damage slightly — the Strike itself costs some trust).
 *
 * Returns: { betrayed: bool, damage: number }
 */
function checkBetrayal(side, self, opp, ctx) {
  const log = ctx.log;
  const visitor = side === 'dungeon' ? opp : self;
  const dungeon = side === 'dungeon' ? self : opp;
  const trust = visitor.trust || 0;

  if (trust < 4) return { betrayed: false, damage: 0 };

  if (side === 'dungeon') {
    // ── Dungeon betrays visitor ──
    const conversionDamage = trust;

    // Find visitor's lowest reducer
    const sv = visitor.startingValues || {};
    const reducers = visitor.isParty
      ? [
          { name: 'resolve', val: visitor.resolve, start: sv.resolve || 14 },
          { name: 'nerve', val: visitor.nerve, start: sv.nerve || 16 },
        ]
      : [
          { name: 'vitality', val: visitor.vitality, start: sv.vitality || 20 },
          { name: 'resolve', val: visitor.resolve, start: sv.resolve || 16 },
          { name: 'nerve', val: visitor.nerve, start: sv.nerve || 16 },
        ];

    // Find lowest by current value
    reducers.sort((a, b) => (a.val / a.start) - (b.val / b.start));
    const target = reducers[0];

    const dmg = R.applyDamage(visitor, target.name, conversionDamage, 1);
    log(`    ★ BETRAYAL! Trust ${trust} converts to ${dmg} ${target.name} damage`);

    // Reset trust
    visitor.trust = 0;
    visitor._fractionalTrust = 0;
    log(`    [Betrayal] trust reset to 0`);

    // Apply Betrayed condition
    visitor.conditions = visitor.conditions || [];
    visitor.conditions.push({
      type: 'betrayed',
      powerBonus: 2,
      duration: 3,
      source: 'Betrayal',
      placedBy: side,
    });
    log(`    [Betrayed] visitor gains +2 Strike power for 3 rounds, auto-refuses all Offers`);

    return { betrayed: true, damage: dmg };

  } else {
    // ── Visitor betrays dungeon ──
    log(`    ★ VISITOR BETRAYAL! Trust ${trust} crashes to 0`);
    visitor.trust = 0;
    visitor._fractionalTrust = 0;

    // Dungeon gains Scorned condition
    dungeon.conditions = dungeon.conditions || [];
    dungeon.conditions.push({
      type: 'scorned',
      rollBonus: 1,
      duration: 3,
      source: 'Visitor Betrayal',
      placedBy: 'visitor',
    });
    log(`    [Scorned] dungeon gains +1 contested rolls for 3 rounds`);

    return { betrayed: true, damage: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// BINDING CONDITION RESOLUTION (called during EoR)
// ═══════════════════════════════════════════════════════════════

/**
 * Process Binding conditions at end of round.
 * Binding drains a resource each round for its duration.
 */
function resolveBindings(entity, ctx) {
  const log = ctx.log;
  const bindings = (entity.conditions || []).filter(c => c.type === 'binding');
  for (const b of bindings) {
    const dmg = R.applyDamage(entity, b.resource, b.amount, 1);
    log(`    [Binding] ${b.resource} -${dmg} (${b.duration - 1} rounds remaining)`);
    b.duration--;
  }
  // Remove expired bindings
  entity.conditions = (entity.conditions || []).filter(
    c => c.type !== 'binding' || c.duration > 0
  );
}

/**
 * Check Dependency conditions — if trust drops below floor, reverse benefit.
 */
function checkDependencies(entity, ctx) {
  const log = ctx.log;
  const trust = entity.trust || 0;
  const deps = (entity.conditions || []).filter(c => c.type === 'dependency');
  for (const d of deps) {
    if (trust < d.trustFloor) {
      const dmg = R.applyDamage(entity, d.resource, d.reversalAmount, 1);
      log(`    [Dependency] trust dropped below ${d.trustFloor}! ${d.resource} -${dmg}`);
      entity.conditions = entity.conditions.filter(c => c !== d);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// BOND WIN CONDITION
// ═══════════════════════════════════════════════════════════════

/**
 * Bond now triggers via Covenant acceptance, not threshold check.
 * This function is called from the Offer resolution when bondTrigger fires.
 * The win condition check in the encounter loop just needs to detect
 * ctx.bondTriggered === true.
 */
function checkBondWin(ctx) {
  return ctx.bondTriggered === true;
}

// ═══════════════════════════════════════════════════════════════
// TRUST CARRY-OVER (between rooms)
// ═══════════════════════════════════════════════════════════════

/**
 * Apply trust decay on room transition.
 * Trust drops by 2, floors at 1 if previously >= 3.
 */
function applyRoomTransitionDecay(visitor) {
  const trust = visitor.trust || 0;
  if (trust <= 0) return;

  const floor = trust >= 3 ? 1 : 0;
  const newTrust = Math.max(floor, trust - 2);
  visitor.trust = newTrust;
  visitor._fractionalTrust = 0; // Reset fractional on room change
  return { before: trust, after: newTrust };
}

// ═══════════════════════════════════════════════════════════════
// BETRAYED / SCORNED CONDITION PROCESSING
// ═══════════════════════════════════════════════════════════════

/**
 * Get betrayal power bonus for Strike resolution.
 * Called during Strike setup to add bonus from Betrayed condition.
 */
function getBetrayedBonus(entity) {
  const betrayed = (entity.conditions || []).find(c => c.type === 'betrayed');
  return betrayed ? (betrayed.powerBonus || 0) : 0;
}

/**
 * Get scorned roll bonus for contested rolls.
 */
function getScornedBonus(entity) {
  const scorned = (entity.conditions || []).find(c => c.type === 'scorned');
  return scorned ? (scorned.rollBonus || 0) : 0;
}

/**
 * Tick down Betrayed/Scorned durations at end of round.
 */
function tickBondConditions(entity) {
  if (!entity.conditions) return;
  for (const c of entity.conditions) {
    if (c.type === 'betrayed' || c.type === 'scorned') {
      c.duration--;
    }
  }
  entity.conditions = entity.conditions.filter(
    c => !((c.type === 'betrayed' || c.type === 'scorned') && c.duration <= 0)
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPOSURE CONDITION PROCESSING
// ═══════════════════════════════════════════════════════════════

/**
 * Check for Exposure condition on Strike target.
 * Returns bonus damage to apply, removes the condition.
 */
function checkExposure(target, card) {
  if (!target.conditions) return 0;
  const expo = target.conditions.find(c =>
    c.type === 'exposure' &&
    (!c.strikeType || c.strikeType === card.type)
  );
  if (!expo) return 0;
  target.conditions = target.conditions.filter(c => c !== expo);
  return expo.bonusDamage || 0;
}

// ═══════════════════════════════════════════════════════════════
// LEGACY FORMAT SUPPORT
// ═══════════════════════════════════════════════════════════════

/**
 * Handle old-format Offers (offerPayload array) for backward compatibility.
 * Wraps them in the new acceptance framework but applies effects the old way.
 */
function resolveLegacyOffer(card, side, self, opp, ctx) {
  const log = ctx.log;
  const visitorState = side === 'dungeon' ? opp : self;
  const trust = visitorState.trust || 0;
  const tier = getTrustTier(trust);

  // Use tier-appropriate acceptance
  let acceptChance;
  if (tier >= 2) {
    acceptChance = 1.0; // Binding
  } else if (tier === 1) {
    acceptChance = Math.min(0.8, 0.35 + (trust * 0.08));
  } else {
    acceptChance = Math.min(0.9, 0.3 + (trust * 0.1)); // Original formula
  }

  // Check Betrayed condition
  const betrayed = opp.conditions?.find(c => c.type === 'betrayed');
  if (betrayed) {
    log(`  [${side}] Offer: ${card.name} → AUTO-REFUSED (Betrayed)`);
    applyRefusalTrust(visitorState, log);
    return { accepted: false, bond: false };
  }

  const accepted = Math.random() < acceptChance;
  const tierLabel = tier >= 2 ? 'Binding' : tier === 1 ? 'Veiled' : 'Transparent';
  log(`  [${side}] Offer: ${card.name} → ${accepted ? 'ACCEPTED' : 'REFUSED'} (trust:${trust}, tier:${tier} ${tierLabel}, chance:${(acceptChance * 100).toFixed(0)}%)`);

  if (!accepted) {
    applyRefusalTrust(visitorState, log);
    return { accepted: false, bond: false };
  }

  // Apply legacy payloads
  if (card.offerPayload) {
    const payloads = Array.isArray(card.offerPayload) ? card.offerPayload : [card.offerPayload];
    for (const effect of payloads) {
      if (effect.heal) {
        R.applyBenefit(opp, effect.heal.resource, effect.heal.amount);
        log(`    Payload: ${effect.heal.resource} +${effect.heal.amount}`);
      } else if (effect.resource) {
        const target = effect.target === 'opponent' ? opp : self;
        if (effect.amount > 0) {
          if (effect.resource === 'trust' || effect.resource === 'rapport') {
            const actual = applyTrustGain(target, effect.amount, ctx);
            log(`    Payload: ${effect.resource} +${actual}${actual < effect.amount ? ` (capped)` : ''}`);
          } else {
            R.applyBenefit(target, effect.resource, effect.amount);
            log(`    Payload: ${effect.resource} +${effect.amount}`);
          }
        } else {
          R.applyDamage(target, effect.resource, Math.abs(effect.amount), 1);
          log(`    Payload: ${effect.resource} ${effect.amount}`);
        }
      }
    }
  }
  if (card.offerTrustGain) {
    const actual = applyTrustGain(visitorState, card.offerTrustGain, ctx);
    log(`    → trust +${actual}`);
  }
  // Legacy rapport gain — still process for old cards but won't affect new system
  if (card.offerRapportGain) {
    const dungeonState = side === 'dungeon' ? self : opp;
    dungeonState.rapport = (dungeonState.rapport || 0) + card.offerRapportGain;
    log(`    → rapport +${card.offerRapportGain} (legacy)`);
  }

  // Trap check
  const traps = self.conditions?.filter(c => c.type === 'trap' && c.trigger === 'offer_accepted') || [];
  for (const trap of traps) {
    log(`    TRAP SPRINGS: ${trap.card.name}`);
    self.conditions = self.conditions.filter(c => c !== trap);
    if (trap.card.trapEffect) {
      const effects = Array.isArray(trap.card.trapEffect) ? trap.card.trapEffect : [trap.card.trapEffect];
      for (const eff of effects) {
        if (eff.applyEntangle) {
          opp.conditions.push({ type: 'entangled', placedBy: side, source: trap.card.name });
          log(`      → Entangle applied`);
        }
        if (eff.damage) {
          const dmg = R.applyDamage(opp, eff.damage.resource, eff.damage.amount, 1);
          log(`      → ${eff.damage.resource} -${dmg}`);
        }
        if (eff.resource) {
          const t = eff.target === 'triggerer' ? opp : self;
          R.applyDamage(t, eff.resource, Math.abs(eff.amount), 1);
          log(`      → ${eff.resource} -${Math.abs(eff.amount)}`);
        }
      }
    }
  }

  return { accepted: true, bond: false };
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
  // Trust tier system
  getTrustTier,
  getTrustTierName,

  // Offer resolution
  resolveTransactionalOffer,

  // Trust management
  applyTrustGain,
  applyTrustDecay,
  applyRefusalTrust,
  applyRoomTransitionDecay,

  // Betrayal
  checkBetrayal,

  // Condition processing (call during EoR)
  resolveBindings,
  checkDependencies,
  tickBondConditions,

  // Strike integration
  getBetrayedBonus,
  getScornedBonus,
  checkExposure,

  // Win condition
  checkBondWin,
};