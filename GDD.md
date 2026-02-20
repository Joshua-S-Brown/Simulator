\# GAME DESIGN DOCUMENT

# SHATTERED DUNGEON

*A Dungeon Identity Sim*

> "You are not the hero. You are what the hero fears."
>
> "You are not the dungeon master. You are the dungeon."

**Second Self Studios**

**Design Document v2.5 • February 2026**

*Set in The Shattered Veil*

---

## VERSION HISTORY

**v2.5** — Balance philosophy overhaul: tri-mode play framework (PVE-dungeon, PVE-party, PVP), encounter quality metrics replacing fixed percentage targets, matchup matrix ecosystem balance, combinatorial testing methodology. New Section 18 (Encounter Quality Framework). Roadmap updated through Phase 5. Duplicate party class rules added.

**v2.4** — Party system implementation: 4-member parties with individual vitality, collective resolve/nerve, member knockout, morale cascade. Standard Adventuring Company template tuned through v2.4c. Dual economy framework (Essence/World Knowledge for dungeons, Gold/Items for visitors). Smart AI benchmarked and resolved — heuristic AI confirmed as performance ceiling for Tier 0 content. Deception path validated.

**v2.3** — Energy system fully implemented: 4 energy card types (Standard, Surge, Attune, Siphon), energy costs on all action cards (0–3), card activation as emergency energy, opening hand guarantees. AI combo sequencer built. Balance patch: deck card rebalancing, visitor stat calibration (Boar resolve/nerve 16→14), encounter auto-effect tuning (Root Hollow nerve drain). All three primary win conditions hit design targets across the Boar matchup. Deck specialization philosophy established.

**v2.1** — Card depth overhaul: all 7 decks redesigned with mechanically distinct cards. 13 new mechanical capabilities (Drain, Overwhelm, Empower keyword grants, Disrupt thorns/strip/randomize, Counter steal/punish/setup, React conditional-power/absorb/reflect, Strike self-cost, Exhaust). AI updated with keyword-aware card evaluation.

**v1.8** — Expanded card system (9 categories), Bond rework, simulation-validated resource model, bidirectional encounters, AI architecture, Test cards as prisoner's dilemma mechanic.

---

## 1. Executive Summary

Shattered Dungeon is a dungeon identity simulation that puts the player on the other side of the tabletop RPG experience. Instead of playing the adventuring party, you are the dungeon itself — a sentient tear in the boundary between planes that is slowly awakening to consciousness. You design encounters, deploy resources, and make choices that shape not only how visitors experience your dungeon, but who you fundamentally become.

The game combines strategic encounter architecture with round-by-round tactical card play at a depth comparable to Magic: The Gathering. During each encounter, visitors and the dungeon exchange actions in a turn-based sequence with nine card categories — Strike, Empower, Disrupt, Counter, React, Trap, Offer, Test, and Reshape — each serving a distinct tactical role. Cards carry keywords, triggered abilities, and activated abilities that produce emergent combos and skill-expressive decisions. The Advantage/Disadvantage system (roll 3d6 keep best or worst 2) creates dramatic swings without arithmetic stacking.

Cards are mechanically distinct within categories — no two Strikes in a deck play the same way. Each card carries at least one keyword, trigger condition, or special mechanic that creates unique board states and combo possibilities. The player asks "which Strike do I play here?" based on board state, not "which Strike has the biggest number." This mechanical depth is validated through simulation across 10,000+ encounters with 15 distinct keywords and conditions firing at meaningful rates.

The dungeon's card choices express identity through a bidirectional resource system. Both sides have three targetable reducer resources and one cooperative promoter. The dungeon targets visitor Vitality, Resolve, and Nerve while building Rapport. The visitor targets dungeon Structure, Veil, and Presence while building Trust. The direction of targeting defines what kind of dungeon you become, with seven distinct win conditions emerging from resource trajectories rather than menu selections.

The game supports three play modes from a single mechanical system: PVE-Dungeon (human dungeon vs AI visitors), PVE-Party (human party vs AI dungeon), and PVP (human dungeon vs human party). Both sides are first-class player experiences — the dungeon and the adventuring party are equally valid, equally deep player roles.

**Genre:** Dungeon Identity Sim / Narrative Roguelike / Strategic Deckbuilder

**Platform:** PC (Steam) primary, with future console consideration

**Target Price:** $15–20 USD

**Engine:** Godot 4

**Development Timeline:** 18–24 months to Early Access; 30–36 months to 1.0

---

## 2. Core Vision & Thesis

**The Elevator Pitch**

You are a sentient dungeon. Things wander inside you. What you do to them — and what you choose not to do — determines who you become. Every encounter is a contested card game between the dungeon and whatever walks through the door. Every card you play is a sentence in the story of what you are.

**The Thesis**

*You discover who you are through how you treat what wanders inside you.*

This is not a metaphor bolted onto a game. It is the game. Every mechanical system exists to make this sentence playable. The nine card categories give you tactical verbs for expressing identity in the moment. Strike is violence. Offer is generosity or deception. Test is vulnerability. Reshape is adaptation. The progression system records your decisions and feeds them back as permanent changes to your dungeon's capabilities, personality, and reputation.

**Design Pillars**

**Identity Through Action.** The dungeon's identity is not chosen from a menu. It emerges from accumulated decisions. A dungeon that consistently kills visitors doesn't select "predator" from a dropdown; it becomes predatory because its Hunger attribute grew, its encounters morphed toward lethality, and its card pool accumulated killing tools.

**Meaningful Tactical Depth.** Every round of every encounter presents genuine decisions. Nine card categories with keywords, triggers, and activated abilities create a combinatorial space where experienced players find optimal lines while new players make valid choices.

**Consequence Architecture.** Nothing is free. Killing a visitor provides Essence but denies World Knowledge. Nurturing a visitor builds Trust but costs time and resources. Every gain has an opportunity cost.

**The Other Side of the Screen.** Tabletop RPGs let you be the hero. This game lets you be what the hero faces.

---

## 3. Bidirectional Resource System

Each side has three reducer resources (targeted by the opponent, depleted toward zero for a win condition) and one promoter resource (built cooperatively toward Bond). This creates seven distinct win conditions that emerge from resource trajectories rather than being chosen from a menu.

### 3.1 Visitor Resources (Dungeon Targets These)

| Resource | Direction | What It Represents | Win Trigger | Primary Cards |
|----------|-----------|-------------------|-------------|---------------|
| Vitality | Reducer ↓ | Physical health, stamina | Kill (≤ 0) | Combat Strikes |
| Resolve | Reducer ↓ | Willpower, mental fortitude | Break (≤ 0) | Social Strikes |
| Nerve | Reducer ↓ | Courage, composure | Panic (≤ 0) | Fear effects |
| Trust | Promoter ↑ | Perception of dungeon's safety | Bond (≥ 12) | Offers, Tests |

### 3.2 Dungeon Resources (Visitor Targets These)

| Resource | Direction | What It Represents | Win Trigger | Primary Cards |
|----------|-----------|-------------------|-------------|---------------|
| Structure | Reducer ↓ | Physical integrity of architecture | Overcome (≤ 0) | Combat Strikes |
| Veil | Reducer ↓ | Magical energy from Veil rift | Inert (≤ 0) | Magical attacks |
| Presence | Reducer ↓ | Sentient authority, force of will | Dominate (≤ 0) | Social resistance |
| Rapport | Promoter ↑ | Willingness to cooperate | Bond (≥ 12) | Visitor peaceful acts |

### 3.3 Simulation-Validated Starting Values

Starting values have been validated across 10,000+ simulated encounters. Asymmetric visitor stats create distinct encounter profiles:

| Creature | Vitality | Resolve | Nerve | Trust | Profile |
|----------|:--------:|:-------:|:-----:|:-----:|---------|
| Thornback Boar | 28 | 14 | 14 | 0 | High HP aggressor, targets structure |
| Veil Moth | 14 | 12 | 14 | 0 | Fragile defender, targets veil |
| Drift Symbiote | 18 | 18 | 18 | 3 | Balanced cooperator, seeks Bond |

Dungeon starting values (Verdant Maw): Structure 16, Veil 14, Presence 12, Rapport 0. The asymmetry between dungeon resources (Structure highest, Presence lowest) creates natural vulnerability targeting decisions for visitors.

### 3.4 Win Condition Summary

| Winner | Condition | How It Feels | Strategic Identity |
|--------|-----------|-------------|-------------------|
| Dungeon | Kill: Vitality ≤ 0 | Predatory, crushing | Sustained physical pressure |
| Dungeon | Break: Resolve ≤ 0 | Oppressive, suffocating | Psychological warfare |
| Dungeon | Panic: Nerve ≤ 0 | Mounting dread, horror | Terror escalation |
| Both | Bond: Trust + Rapport ≥ 12 | Cautious approach, earned trust | Mutual vulnerability |
| Visitor | Overcome: Structure ≤ 0 | Brute force, demolition | Physical dominance |
| Visitor | Inert: Veil ≤ 0 | Exorcism, de-powering | Anti-magic specialization |
| Visitor | Dominate: Presence ≤ 0 | Willpower contest | Mental fortitude |
| Visitor | Survive: Round limit | Endurance, outlasting | Conservation and React |

---

## 4. Card System

The card system uses nine categories organized into three functional groups. Each category serves a distinct mechanical role that cannot be replicated by another category. Cards follow a universal anatomy standard with Energy costs, Power values, Type alignment, Keywords, conditional Triggers, and unique descriptions that express both narrative and mechanics.

### 4.1 Card Categories

**Action Cards (proactive)**

| Category | Role | Resolution | Strategic Purpose |
|----------|------|-----------|-------------------|
| Strike | Deal damage to a specific resource | Contested 2d6 roll | Primary win condition driver |
| Offer | Present a choice to opponent | Trust-based acceptance | Build trust OR bait traps |
| Test | Prisoner's dilemma interaction | Cooperation probability | Bond-building with vulnerability |
| Trap | Placed face-down, triggers on condition | Automatic on trigger | Information asymmetry |
| Reshape | Change encounter properties | Automatic (no contest) | Healing, fortification, adaptation |

**Modifier Cards (augment actions)**

| Category | Role | Resolution | Strategic Purpose |
|----------|------|-----------|-------------------|
| Empower | Buff next Strike (advantage, power, keywords) | Persists until consumed | Investment for bigger payoff |
| Disrupt | Debuff opponent's next Strike (disadvantage, thorns, strip) | Persists until consumed | Preemptive damage reduction |

**Response Cards (reactive)**

| Category | Role | Resolution | Strategic Purpose |
|----------|------|-----------|-------------------|
| Counter | Remove opponent's Empower/Disrupt + secondary effect | Immediate removal | Tempo disruption |
| React | Mitigate incoming Strike damage | Contested roll on hit | Last-resort defense |

### 4.2 Energy System

Action cards have Energy costs (0–3). Energy cards in the deck generate permanent Energy when played. Any action card can be activated (discarded) to generate 1 temporary Energy. This creates a meaningful resource management layer: you can sacrifice an action for the energy to play a better one.

Starting hand guarantee: opening hand of 7 always contains at least 2 Energy cards and 3 action cards, with up to 3 mulligans. Target deck ratio: 30–40% Energy cards (4–5 in a 15-card deck).

Energy pools are permanent and grow each round as Energy cards are played. Both sides draw 2 cards per round (minimum hand size 3). Energy refreshes each round (spent energy returns, temporary bonuses expire).

**Energy Card Types:**

| Type | Effect | Strategic Use |
|------|--------|---------------|
| Standard | +1 permanent pool | Reliable growth, always useful |
| Surge | +N temporary energy (this turn only) | Burst turns — enables expensive combos |
| Attune | +1 permanent + next card of specified type costs -1 | Sequencing reward — plan Attune before matching card |
| Siphon | +1 permanent if condition met, else +1 temp fallback | Conditional growth — rewards reading board state |

The AI combo sequencer (ai/combo-sequencer.js) plans energy-aware turn sequences: evaluating all energy subsets to find optimal investment, sequencing Attune before matching cards, planning Surge for burst turns, and managing budgets for multi-card combos like Empower→Strike.

### 4.3 Card Mechanical Depth

Every card must pass the Description Test: no two cards in the same category may share a description. If a card's description could be written for another card, it is mechanically identical and must be redesigned. Cards achieve distinction through five mechanical layers:

**Keywords.** On-hit or on-play effects that change the board state. Entangle pins the opponent, Erode creates persistent damage, Drain converts damage to self-healing, Overwhelm spills excess damage to secondary targets, Resonate rewards type-consistent play.

**Triggers.** Conditional bonuses that fire when a specific board state is met. "If visitor is Entangled, +2 Power" rewards setup. "If vitality below half, +2 Power" creates comeback potential. Triggers reward reading board state and create decision points — do I set up the trigger condition first, or go for immediate damage?

**Empower Keyword Grants.** Empower cards can add keywords to the next Strike, not just grant Advantage or +Power. "Next Strike gains Erode" or "Next Strike gains Overwhelm" creates fundamentally different Empower decisions — you choose which keyword you want based on the current situation.

**Disrupt Variants.** Disrupts can inflict Disadvantage, apply thorns (opponent takes damage when striking), strip all keywords from the opponent's next Strike, or randomize the opponent's Strike target. Each creates a different defensive decision.

**Counter Variants.** Counters can remove + chip (standard), steal an Empower for your own use, deal bonus chip if an Empower was removed, apply Entangle to the opponent after removing, or grant yourself Fortify after removing. Each creates different follow-up opportunities.

**React Variants.** Reacts can block with flat power (standard), gain Fortify regardless of success (absorb), reflect damage back on Devastating defense, or have conditional power that scales when a resource is low (desperate defense).

**Risk/Reward.** Some Strikes carry a self-cost (lose your own resource to deal more damage) or Exhaust (removed from the game after one use, not recycled through the deck). These create high-stakes decisions — save the Exhaust card for the perfect moment, or use it now before it's too late?

### 4.4 Card Combo Lines

Distinct mechanical cards create combo lines — multi-card sequences where order matters and the combination produces effects neither card produces alone. Each deck supports 2–3 distinct combo lines:

**Setup → Payoff:** Entombing Grasp (Entangle) → Crushing Grip (+2P if Entangled). The first card creates the condition the second card exploits. Playing them in reverse order wastes the trigger.

**Attrition:** Tremor Slam (Erode nerve) into repeated Erode stacking creates persistent damage that bypasses React mitigation and pressures nerve toward Panic. Different from burst damage — slower but harder to stop.

**Sustain:** Veil Siphon (Drain to vitality) converts offensive damage into defensive healing. Changes the math of trading — the Moth deals 2 veil damage AND heals 2 vitality, making 1-for-1 trades favor the Moth.

**Modifier Combos:** Fear Resonance (Empower: +2P and Overwhelm) → Nightmare Surge (already has Overwhelm) creates stacked Overwhelm that annihilates a depleted resource and spills catastrophically to the secondary target.

### 4.5 Test Cards: The Prisoner's Dilemma

Test cards are the primary tactical mechanic for Bond-building. When a Test is played, the opponent must choose to cooperate or defect. This choice is made probabilistically based on existing Trust and Rapport levels:

*Cooperation chance = min(85%, 40% + (Trust × 5%) + (Rapport × 3%))*

**On cooperation:** Both Trust and Rapport advance (typically +2 each). The test-giver pays an exposure cost — a small amount of reducer damage representing the vulnerability of extending trust. This ensures Bond-building has a real resource cost.

**On defection:** The defector gains a combat advantage (Empower with +2 power on next Strike). Trust and Rapport crash by 50%, potentially wiping out multiple rounds of cooperative investment. This makes every Test a genuine risk.

The Test mechanic creates the core strategic tension of the Bond path: early Tests are risky (low cooperation probability), but each successful Test raises the probability of future cooperation. Building toward Bond requires sustained investment through multiple successful Tests, making it the slowest and riskiest win condition as designed.

### 4.6 Betrayal Mechanic

If either side plays a Strike while the opponent has accumulated cooperative promoter resources (Trust > 3 or Rapport > 3), a Betrayal triggers. Both the attacker's and the victim's cooperative promoters crash by 50%. This mechanic prevents hedging — you cannot simultaneously build toward Bond and attack. You must commit to a strategy.

The threshold of > 3 (raised from > 0 in v1.4) prevents false-positive betrayals when visitors start with small Trust values and normal combat Strikes are played before any cooperation is established.

### 4.7 Offer Resolution

Offers bypass contested rolls. When an Offer is played, the opponent evaluates it based on Trust level:

*Acceptance chance = min(90%, 30% + (Trust × 10%))*

Accepted offers deliver their payload (beneficial, harmful, or mixed). Refused offers cost the offerer 1 Rapport — the awkwardness of rejection. Offers can trigger face-down Traps on acceptance, enabling deception combos (Trap → Offer → Trap springs).

### 4.8 Restraint Action

During cooperative encounters, a side that has no Offer or Test cards available may discard a Strike card for +1 to their own promoter resource. This represents "I choose not to hurt you." Restraint fills dead turns during cooperation without accelerating Bond (flat +1, max one per turn, own-side promoter only, subject to per-round promoter cap of +4).

### 4.9 Resolution System

Strikes resolve through contested 2d6 rolls. Each side rolls 2d6, adds their modifier bonus (from attributes aligned to the card's Type), and compares totals. The margin determines the resolution tier:

| Tier | Margin | Attacker Mult | Defender Mult | Feel |
|------|--------|:---:|:---:|------|
| Devastating | +5 or more | ×1.5 | 0 | Crushing blow, full impact |
| Strong | +2 to +4 | ×1.0 | 0 | Clean hit, expected damage |
| Partial | -2 to +1 | ×0.5 | ×0.5 | Glancing blow, minor reversal |
| Stalemate | -4 to -3 | 0 | ×1.0 | Blocked, attacker exposed |
| Reversal | -5 or less | 0 | ×1.5 | Complete backfire |

**Advantage/Disadvantage:** Roll 3d6, keep highest 2 (Advantage) or lowest 2 (Disadvantage). Provided by Empower and Disrupt cards. Creates dramatic variance without arithmetic stacking.

**Rally:** On Strong or Devastating hits, the attacker recovers 1 point to their lowest reducer. This rewards successful aggression and prevents defensive stalling.

**Reversal Damage:** On Partial, Stalemate, or Reversal, the attacker takes damage to their primary reducer (Structure for dungeon, Vitality for visitor). This makes every Strike carry risk.

---

## 5. Encounter Structure

### 5.1 Turn Sequence

Each round follows a fixed sequence: (1) Environment pressure from auto-effects, (2) Erode resolution, (3) Escalation check, (4) Win condition check, (5) First side's turn (initiative-based), (6) Win condition check, (7) Second side's turn, (8) Win condition check, (9) Card draw and Energy refresh.

During a turn, a side may play multiple cards subject to Energy constraints. Play order matters: Empower before Strike consumes the buff. Trap before Offer sets the ambush. Counter removes an active buff immediately.

### 5.2 Auto-Effects

Each encounter room has bidirectional auto-effects that apply environmental pressure every round (or every other round). These create the encounter's baseline difficulty and thematic identity. Auto-effects are the most stable balance anchor in the system because they persist regardless of deck customization.

Example: Root Hollow applies "visitor vitality -1/round," "visitor nerve -1/other round," and "dungeon structure -1/other round." The visitor weakens physically while the oppressive environment frays their courage, and the dungeon's walls slowly crack. The nerve drain creates passive Panic pressure without requiring the deck to carry nerve-targeting strikes, demonstrating how auto-effects can support secondary win conditions independent of deck composition.

### 5.3 Multi-Room Sequences

A run consists of a sequence of 1–3 encounter rooms. Resource states carry over between rooms — a visitor who enters the second room wounded from the first faces compounding pressure. The sequence ends when a terminal win condition is reached (Kill, Break, Panic, Bond) or after all rooms are cleared.

Room progression is determined by outcome: different results in Room 1 route to different Room 2 encounters. This creates branching narrative arcs where a single run tells a complete story.

Encounter ordering is the dungeon player's primary strategic expression. The sequence of rooms defines the dungeon's approach to each visitor: a predatory dungeon might run Root Hollow → Whispering Gallery → Veil Breach (weaken physically, then break their will, then terrify the survivors). A deceptive dungeon might run a trust-building room first followed by an aggressive closer (lull them into false safety, then strike). The rooms are the building blocks; the sequence is the strategy. Each room brings its own aligned deck, so the encounter sequence also determines which card pools the dungeon draws from across the full run (see Section 15: Dungeon Strategic Architecture).

### 5.4 Escalation

After round 8, both sides take escalating damage each round (starting at 1, increasing by 1 every 2 rounds). This prevents infinite stalling and compresses late-game decisions. Combined with auto-effects and resource carryover, escalation ensures every encounter resolves within 12–15 rounds.

### 5.5 Simulation-Validated Encounter Pacing

Across 10,000+ simulated encounters (validated at 1,000 iterations per configuration), the system produces the following pacing profiles:

| Matchup | Avg Rounds | Avg Decisions | Dungeon Win % | Balance Assessment |
|---------|:---:|:---:|:---:|---|
| Boar (aggressive) | 13.8 | 51.6 | 88.4% | Dungeon-favored (intended) |
| Moth (cautious) | 16.7 | 59.9 | 53.5% | Slightly moth-favored (evasive identity) |
| Symbiote (cooperative) | 12.9 | 44.7 | Bond 63% | Bond with tension (intended) |

The energy system (v2.2) added meaningful resource management that increased average rounds compared to the pre-energy baseline. Combined with the balance patch (v2.3), encounter pacing targets approximately 10–15 rounds for combat and 12–14 rounds for cooperation.

---

## 6. Bond: The Mutual Win Condition

Bond is the most complex, slowest, riskiest, and most rewarding win condition. It requires both promoters at threshold simultaneously: Trust ≥ 12 AND Rapport ≥ 12, checked at end of round. Bond represents genuine mutual understanding between dungeon and visitor.

### 6.1 Why Bond Must Be Hard

If Bond were easy or fast, it would dominate every encounter. The Bond system uses six interlocking mechanics to ensure Bond requires real investment and carries real risk:

1. **High threshold.** Trust and Rapport must both reach 12. With Offers providing +1 to +2 per play and Tests providing +2 on cooperation, reaching threshold requires 8–12 rounds of dedicated cooperative play.

2. **Vulnerability cost.** Cards that build Trust and Rapport don't defend reducers. Every Test played costs the initiator 1 point of a reducer resource (exposure cost).

3. **Fragile promoters.** Trust and Rapport crash by 50% on betrayal or Test defection. One aggressive play after five rounds of cooperation can destroy accumulated progress.

4. **Prisoner's dilemma tension.** Tests present the opponent with a genuine choice: cooperate (both advance) or defect (gain combat advantage at the cost of crashing trust).

5. **Opportunity cost.** The Betrayal mechanic prevents hedging. You cannot build toward Bond while maintaining an aggressive fallback.

6. **Per-round promoter cap.** Trust and Rapport gains are capped at +4 per side per round.

### 6.2 Simulation Validation

| Metric | Pre-Rework (v1.0) | Post-Rework (v2.0) | Card Depth (v2.1) | Energy (v2.3) | Design Target |
|--------|:---:|:---:|:---:|:---:|:---:|
| Bond rate | 100% | 98.5% | 73.4% | 63.2% | 65–80% |
| Average rounds | 2.6 | 10.4 | 12.7 | 12.9 | 8–15 |
| Kill rate | 0% | 1.5% | 26.5% | 36.8% | 10–30% |

---

## 7. AI Architecture

The game uses a three-tier AI architecture designed to scale from early creature encounters to late-game intelligent visitors.

### 7.1 Heuristic AI (Creature Phase)

Creature visitors use weighted heuristic selection with profile-specific base weights for each card category. The AI evaluates each playable card against the current board state, applying multipliers for strategic mode (aggressive/balanced/defensive/desperate based on win probability), target selection (preferred resources, lethal detection, auto-effect synergy), opponent tracking (React exhaustion, Counter history, active buffs), and combo awareness (Empower-before-Strike ordering, Trap-before-Offer combos).

**Keyword-Aware Scoring (v2.1).** The AI evaluates card keywords and triggers against current board state. Entangle Strikes are valued higher when the opponent is not already Entangled (setup value). Erode Strikes gain persistent pressure value. Drain Strikes are valued higher when the attacker is damaged (sustain value). Overwhelm Strikes gain bonus value when the target resource is near-depleted (spill potential). Triggers that are currently active receive 1.5× their bonus value. Self-cost Strikes are penalized when the sacrificed resource is low, and Exhaust Strikes are saved for lethal pushes.

**Energy-Aware Combo Sequencing (v2.2).** The AI combo sequencer (ai/combo-sequencer.js) plans energy-aware turn sequences for both dungeon and visitor. It evaluates all energy subsets to find optimal investment, sequences Attune before matching cards, plans Surge for burst turns, checks Siphon conditions, and manages energy budgets for multi-card combos like Empower→Strike.

Three visitor profiles: Feral Aggressive (Boar), Cautious Explorer (Moth), Cooperative (Symbiote). Four dungeon profiles: Aggressive (Kill-focused), Nurturing (Bond-focused), Tactical (balanced), Deceptive (Trust-then-betray). One party profile: Party Balanced (role-aware card selection for 4-member parties).

### 7.2 Smart AI (Monte Carlo) — Benchmarked & Resolved

Smart AI replaces heuristic scoring with Monte Carlo evaluation. For each playable card, the AI simulates 12 random playouts from the resulting board state and evaluates the final position. Smart AI includes a deck tracker that monitors draw probabilities, depleted categories, and opponent card history. The evaluation function assesses position based on resource health ratios, vulnerability detection (opponent's lowest reducer vs. own lowest), and time pressure from escalation.

Smart AI v1.1 integrates the combo sequencer — MC evaluation feeds card scores into `planTurn()` via a scoreFunction closure, combining Monte Carlo position assessment with strategic energy planning. For cooperative profiles (goalType 'bond'), a cooperative override applies heuristic strike suppression and Offer/Test boosting on top of MC deltas, because MC evaluation structurally undervalues multi-turn cooperative payoff.

**Benchmark Results (v2.4, 1000 iterations per matchup):**

| Matchup | Metric | Heuristic | Smart AI | Delta |
|---------|--------|:---------:|:--------:|:-----:|
| Boar | Kill | 57.6% | 54.2% | -3.4% |
| Boar | Panic | 20.8% | 20.0% | -0.8% |
| Boar | Break | 10.4% | 11.7% | +1.3% |
| Boar | Survive | 11.2% | 14.1% | +2.9% |
| Moth | Survive | 46.1% | 43.3% | -2.8% |
| Moth | Panic | 29.4% | 31.3% | +1.9% |
| Moth | Kill | 15.2% | 17.8% | +2.6% |
| Symbiote | Bond | 65.9% | 61.6% | -4.3% |
| Symbiote | Kill | 34.1% | 38.4% | +4.3% |
| Deceptive | Kill | 99.0% | 99.7% | +0.7% |

**Conclusion:** Monte Carlo evaluation does not outperform heuristic AI with the current Tier 0 card set. The heuristic weights + combo sequencer already capture the decision space well. Smart AI becomes relevant when card complexity increases — specifically when Intelligent Visitor party mechanics introduce targeting decisions, cross-member synergies, and multi-turn strategic planning that heuristic weights cannot capture. The Smart AI infrastructure is code-complete and available for future activation.

### 7.3 Cooperative AI Behavior

Cooperative profiles implement strike suppression: when the side has accumulated promoter resources above a threshold, Strike cards are hard-suppressed regardless of other board considerations. AI also incorporates Trust-aware Offer evaluation, Test timing (prefer Tests when cooperation probability is in the 50–80% sweet spot), and Betrayal avoidance.

### 7.4 Intelligent Visitor AI

The intelligent visitor phase replaces solo creature visitors with adventuring parties — groups of 3–4 specialized members who compose a shared deck and resource pool. This is the system that transforms Shattered Dungeon from a systems prototype into its real game identity.

Intelligent visitors require: party composition (selecting members for strategic synergy), shared deck construction (each member contributes cards to a party-wide deck), individual targeting (dungeon chooses which party member to attack), member elimination and deck thinning (downed members lose their cards from the active deck), multi-encounter planning (managing party resources across a full dungeon run), adaptive strategy (recognizing dungeon identity mid-run and adjusting approach), and social intelligence (evaluating Offer sincerity based on dungeon reputation and behavior history).

The party system is defined in Section 16. The creature visitors (Boar, Moth, Symbiote) remain as Tier 0 content for early encounters and system validation.

---

## 8. Deck Architecture

Each side brings a 15–16 card deck to each encounter room. Decks follow a template that ensures viable opening hands while supporting distinct strategic identities. Every card carries a unique description and at least one mechanical distinction beyond power + cost.

### 8.1 Deck Composition Guidelines

| Deck Type | Energy | Strike | Empower | Disrupt | Counter | React | Trap | Offer | Test | Reshape |
|-----------|:------:|:------:|:-------:|:-------:|:-------:|:-----:|:----:|:-----:|:----:|:-------:|
| Aggressive | 3 | 3–4 | 1–2 | 1–2 | 1 | 1–2 | 1–2 | 0–1 | 0 | 0–1 |
| Tactical | 3–4 | 2–3 | 1 | 1–2 | 1–2 | 2 | 1–2 | 1 | 0 | 1–2 |
| Nurturing | 3–4 | 1–2 | 0–1 | 0 | 1 | 2 | 0 | 2–3 | 1 | 1 |
| Deceptive | 3 | 2 | 1 | 1 | 1 | 1 | 2–3 | 2–3 | 0 | 0–1 |

### 8.2 Deck Identities

| Deck | Cards | Primary Mechanic | Secondary Mechanic | Combo Lines |
|------|:-----:|-----------------|-------------------|-------------|
| **Root Hollow** | 18 | Entangle → Crush combo | Erode attrition + Drain sustain | Entombing Grasp→Crushing Grip, Tremor Slam Erode nerve, Soul Leech nerve+drain |
| **Whispering Gallery** | 15 | Steal Empowers + Erode resolve | Randomize targets | Absorbing Silence steals buffs, Echoing Confusion scrambles aim |
| **Veil Breach** | 16 | Overwhelm burst + Exhaust alpha | Strip keywords | Fear Resonance→Nightmare Surge Overwhelm, Veil Rend 4P Exhaust |
| **Living Root Sanctuary** | 15 | Tests + Offers (Bond path) | Reluctant Strikes + Ward | Trust Trial→Offer pipeline, Calming Presence grants Ward |
| **Thornback Boar** | 15 | Desperate scaling + Overwhelm | Erode + Thorns disruption | Gore +2P at low vitality, Rampaging Charge Overwhelm |
| **Veil Moth** | 15 | Drain sustain + keyword stripping | Erode presence + conditional dodge | Veil Siphon Drain→vitality, Confusing Dust strips keywords |
| **Drift Symbiote** | 15 | Tests + Offers (Bond path) | Trust-scaled Strikes + Ward | Symbiotic Probe→Mutual Nourishment pipeline |

### 8.3 Opening Hand Guarantee

Opening hand of 7 cards. Must contain at least 2 Energy cards and 3 action cards. Up to 3 mulligans allowed.

### 8.4 Card Activation

Any action card can be activated (discarded) to generate 1 temporary Energy. This means you are never truly stuck — you can sacrifice an action you don't need for the energy to play one you do.

### 8.5 Deck Customization & the Generic Card Pool

Each encounter room comes with an aligned deck — a default 15–18 card deck that expresses the room's mechanical identity. The dungeon player customizes encounter decks by swapping cards from a generic card pool — a shared collection of cards not tied to any specific encounter.

**Customization constraints:** Core slots (8–10 cards) are locked to preserve room identity. Flex slots (5–8 cards) are open for replacement. Deck size is fixed (1-for-1 swaps). Energy card ratio must be maintained (at least 3 Energy cards).

---

## 9. Keywords & Conditions

| Keyword | Effect | Applied By | Duration |
|---------|--------|-----------|----------|
| **Entangle** | Target cannot flee until their next turn | Strikes, Counters, Traps | Clears on target's turn start |
| **Erode** | Target loses 1 of specified resource next round | Strikes, Empowers (grant) | 1 round (suppressed if matches auto-effect) |
| **Drain** | Damage dealt converts to self-healing (capped at 2) | Strikes, Empowers (grant) | Immediate on hit |
| **Overwhelm** | Excess damage spills to secondary resource when target depleted | Strikes, Empowers (grant) | Immediate on hit |
| **Resonate** | If same Type as last card played, +1 power | Strikes | Immediate |
| **Ward** | Reduce next incoming damage by ward amount | Empowers (grant), Reshapes | 1 round |
| **Fortify** | Reduce incoming damage to specified resource | Counters (setup), Reacts (absorb), Reshapes | 1–2 rounds |
| **Exhaust** | Card removed from game after use (not recycled) | Strikes | Permanent |

**Conditions (applied by Disrupt cards):**

| Condition | Effect | Duration |
|-----------|--------|----------|
| **Disadvantage** | Roll 3d6 keep lowest 2 on next Strike | Consumed on next Strike |
| **Thorns** | Take N damage to specified resource when next striking | Consumed on next Strike |
| **Strip Keywords** | Next Strike loses all keywords | Consumed on next Strike |
| **Randomize Target** | Next Strike hits random resource instead of chosen | Consumed on next Strike |

**Erode Suppression Rule:** Erode does not stack with auto-effects targeting the same resource. This prevents double-counting and forces strategic targeting of resources the environment isn't already pressuring.

**Trigger System:** Cards can carry conditional triggers: "If [condition], [bonus effect]." Conditions include: opponent has specific condition, self resource below percentage, opponent resource above threshold, and discard pile card count.

---

## 10. Simulation-Validated Findings

The following findings are derived from 10,000+ simulated encounters across three matchups, validated at 1,000 iterations per configuration. Numbers reflect v2.3d (energy system + combo sequencer + balance patch).

### 10.1 Encounter Pacing

Average rounds range from 12.9 (cooperative Bond encounters) to 16.7 (contested multi-room combat). Average decisions per encounter range from 45 (cooperative) to 60 (combat), producing 3–4 meaningful decisions per round per side. The energy system increased round counts by approximately 4–6 rounds compared to the pre-energy baseline due to reduced cards-per-turn throughput, but this creates richer tactical decision-making rather than padding.

### 10.2 Win Condition Distribution (Boar Matchup)

The Boar matchup serves as the primary balance benchmark because it tests all three dungeon win conditions against an aggressive creature with asymmetric stats.

| Outcome | Pre-Energy | v2.2 (Energy) | v2.3d (Balanced) | Design Target |
|---------|:---:|:---:|:---:|:---:|
| Kill | 64% | 71.7% | 55.3% | 50–65% ✅ |
| Break | 12% | 1.1% | 11.5% | 8–15% ✅ |
| Panic | 16% | 4.8% | 21.6% | 12–25% ✅ |
| Survive | 8% | 22.4% | 11.6% | <10% ≈ |

Win condition diversity is achieved through room specialization rather than balanced decks. Each dungeon deck is a specialist:

| Room | Primary Win Condition | Rate When Reached |
|------|----------------------|:-:|
| Root Hollow | Kill | 35.7% |
| Whispering Gallery | Break | 15.5% |
| Veil Breach | Panic | 52.2% |

### 10.3 Moth Matchup

| Outcome | v2.3d |
|---------|:---:|
| Survive | 46.5% |
| Panic | 28.4% |
| Kill | 14.7% |
| Break | 10.4% |

The Moth's Drain sustain makes it genuinely hard to kill, creating a moth-favored matchup where Survive is the most common outcome. The dungeon's Erode and Overwhelm mechanics drive nerve toward Panic as the primary dungeon win path.

### 10.4 Party Matchup (v2.4c)

The Standard Adventuring Company (Knight/Battlemage/Cleric/Rogue) against the Verdant Maw tactical dungeon in a single-room test:

| Outcome | v2.4 (original) | v2.4b | v2.4c (FINAL) |
|---------|:---:|:---:|:---:|
| Survive | 73.5% | 23.8% | 37.8% |
| Kill | 19.5% | 35.1% | 39.8% |
| Panic | 7.0% | 40.8% | 21.8% |
| Break | 0% | 0.3% | 0.6% |
| Avg Rounds | 12 | — | ~13 |
| Avg Decisions | 42 | — | ~42 |

Break (resolve depletion) barely appears because Root Hollow's auto-effects target nerve but never resolve. The only resolve pressure comes from Erode keywords, occasional Strikes, and morale cascade. This is accepted as thematically correct — a coordinated party's willpower is their strongest asset. Breaking it requires sustained psychological warfare that a nature dungeon doesn't specialize in.

### 10.5 Momentum Dynamics

Encounters show dynamic momentum shifts rather than one-sided domination. In the Boar matchup, the dungeon leads from round 1 due to auto-effects, with the advantage accelerating through mid-game as Entangle combos and Erode pressure compound. The Boar enters Whispering Gallery at roughly 55% health on average, creating genuine late-game tension. In the Moth matchup, the visitor maintains a consistent edge through Drain sustain while the dungeon applies persistent nerve pressure. In the Symbiote matchup, both sides remain healthy throughout with resource investment going into promoters rather than reducer combat.

### 10.6 Carryover Effects

Multi-room carryover produces dramatic narrative arcs. In validated 3-room sequences, the visitor enters the final room with averaged health around 30–40%, with nerve and resolve significantly softened by earlier rooms' auto-effects and card damage.

### 10.7 Bond System Validation

The cooperative matchup (Symbiote) achieves Bond 63.2% of the time, with 36.8% Kill as a real alternative outcome. Bond encounters average 12.9 rounds with defection setbacks, refused Offers, Restraint actions filling dead turns, and escalation creating late-game urgency.

### 10.8 Energy System Impact

| Metric | Pre-Energy | Post-Energy |
|--------|:---:|:---:|
| Cards played per turn | ~3 | ~2 |
| Avg rounds (Boar) | 6.8 | 13.8 |
| Strategic depth | Dump hand | Plan energy budget, sequence combos |

### 10.9 Card Depth Impact

The v2.1 card depth overhaul produced measurable changes across all matchups without modifying any threshold values, auto-effects, or starting resources:

| Matchup | Key Change | Cause |
|---------|-----------|-------|
| Boar: Break 12% → 3% | Dungeon Entangle combos and Fortify slow the Boar's structure assault | Card mechanics, not numbers |
| Boar: Panic 9% → 16% | Erode keyword creates persistent nerve pressure independent of direct Strikes | New keyword application |
| Moth: Kill 43% → 18% | Moth Drain sustain makes it genuinely hard to kill | Drain mechanic creating sustain loop |
| Moth: Panic 8% → 27% | Dungeon Erode and Overwhelm drive nerve damage through new paths | Overwhelm spill to nerve |
| Symbiote: Bond 98% → 73% | Card mechanics create real setback potential during cooperation | Card depth creating tension |

### 10.10 Balance Methodology

Three rounds of AI scoring changes produced zero movement on win condition diversity. The breakthrough came from data-level changes: deck card retargeting, cost adjustments, visitor stat calibration, and encounter auto-effects. Key learning: when AI is making correct decisions but outcomes are wrong, the problem is game data, not AI logic. Balance levers should be applied from narrowest scope (encounter auto-effects) to broadest (visitor stats), using the narrowest lever that solves the problem.

---

## 11. Open Questions & Next Steps

### 11.1 Resolved from v1.8

**Card Categories:** Expanded from 5 to 9. Trap, Offer, Test, and Reshape add four mechanical verbs. Validated through simulation.

**Bidirectional Resources:** Both sides now have targetable resources. Creates symmetric strategic depth.

**Bond Pacing:** Resolved through threshold increase, Test cards, Betrayal mechanic, Offer payload reduction, per-round promoter cap, and Restraint action. Bond is now the slowest win condition as intended.

### 11.2 Resolved from v2.0

**Card Design Depth.** All 7 decks redesigned with mechanically distinct cards. Every card passes the Description Test. 15 keywords and conditions defined. Validated through simulation — card depth directly impacted win condition distributions without changing any threshold values.

**Symbiote Tension.** Bond rate dropped from 98.5% to 73.4% purely through card mechanical depth creating genuine setback potential during cooperation.

### 11.3 Resolved from v2.1

**Energy System.** Fully implemented with 4 energy card types, costs 0–3 on all action cards, card activation as emergency energy, opening hand guarantees.

**AI Combo Sequencing.** The combo sequencer plans energy-aware turn sequences for both dungeon and visitor AI.

**Win Condition Diversity.** The energy system initially collapsed secondary win conditions. The balance patch (v2.3) resolved it through deck card retargeting, cost reductions, visitor stat calibration, and encounter auto-effect tuning.

### 11.4 Resolved from v2.3

**Deception Path.** Validated through dedicated 2-room scenario (Honeyed Hollow → Root Hollow). Cross-room deception arc works: Room 1 builds trust while dealing hidden damage via Trap→Offer engine. Room 2 finishes the weakened visitor. Per-encounter AI profile overrides enable different strategies per room.

**Smart AI + Combo Sequencer Integration.** Completed and benchmarked. Full benchmark confirms heuristic AI + combo sequencer is the performance ceiling for the current Tier 0 card set. Smart AI infrastructure preserved for future activation.

### 11.5 Resolved from v2.4

**Party System Implementation.** Fully implemented and tuned through v2.4c. Individual vitality tracking, member knockout + card removal, morale cascade, party deck composition, targeting AI, and the Standard Adventuring Company template all validated through simulation.

### 11.6 Resolved from v2.5

**Balance Philosophy.** The original target-percentage approach has been replaced by an encounter quality framework (Section 18) that evaluates agency, closeness, outcome diversity, knockout patterns, and attrition curves. Win percentages are now matchup-specific descriptions rather than universal gates. This shift was driven by the recognition that Shattered Dungeon supports three play modes (PVE-Dungeon, PVE-Party, PVP) and that balance in the PVP context means ecosystem health across the full matchup matrix, not individual cells hitting specific numbers.

### 11.7 Remaining Open Questions

**Multi-Room Party Testing.** The party has been tested in a single room (Root Hollow). Multi-room gauntlet testing is needed to validate attrition curves, inter-room recovery, and full-run survival rates.

**Expanded Creature Content.** Currently 3 creature visitors are implemented (Boar, Moth, Symbiote). Deprioritized in favor of the party system.

**Symbiote Parasitism Mechanic.** Adding a corruption mechanic where Symbiote cooperation slowly drains a dungeon resource. Design needed.

**Cooperative Deck Diversity.** Mid-game can still have minimal activity when waiting for Offer/Test cards to cycle.

**Cognitive Load.** Progressive introduction should mitigate complexity, but paper playtest must verify.

**Emotional States.** Visitor emotional states that modify AI behavior qualitatively. Not yet designed.

**Environmental Hazards During Cooperation.** Threats that pressure both sides during cooperative encounters.

**Run Rewards & Economy.** Detailed reward scaling per encounter outcome, card morphing mechanics, and reputation-based matchmaking remain to be specified.

**Combinatorial Test Infrastructure.** The encounter quality framework defines metrics for evaluating matchups. The combinatorial test harness — which generates legal compositions and runs them automatically — is designed but not yet implemented. This is the Phase 3 milestone.

---

## 12. Scope & Development Roadmap

**Phase 1 (Months 1–6): Core Loop.** Card engine with 9 categories, encounter system, turn-based resolution, Energy system, 3 base encounters, 3 creature visitors, economy, attribute growth. Simulation engine for validation. *Status: Complete. Card system validated with mechanical depth. 15 keywords/conditions, triggers, keyword grants, Disrupt/Counter/React variants designed. 7 decks with distinct combo lines. Energy system fully implemented and validated. AI combo sequencer operational. Smart AI benchmarked — heuristic AI confirmed as performance ceiling for Tier 0 content.*

**Phase 2 (Months 7–12): Intelligent Visitors & Content.** Party system implementation (Section 16), dual economy framework (Section 17), sample standard party, party-vs-dungeon encounter testing, 2 additional creature visitors, companion cards, card evolution, architecture branching. Deception scenario validation complete. Encounter quality metrics framework and simulation diagnostics (Section 18). *Status: Party system fully implemented and tuned (v2.4c). Balance philosophy updated to tri-mode framework (PVE-dungeon, PVE-party, PVP). Encounter quality metrics defined and integrated into simulation reporting.*

**Phase 3 (Months 13–18): Content Depth & Early Access.** Additional party compositions (3–5 new member classes), class specialization trees, equipment system implementation, card morphing, reputation and matchmaking, multi-encounter party resource management, narrative framework, Veil crafting, offering market. Generic card pools for dungeon and visitor deck customization. Combinatorial test harness for automated matchup matrix exploration. Early Access launch.

**Phase 4 (Months 19–24): PVP & Endgame.** Player-vs-player mode (human controls visitor party OR dungeon side), advanced encounter designs, scoring system. PVP-specific balance pass informed by combinatorial testing data. Matchup matrix publication and meta-health monitoring. Asymmetric matchmaking using dungeon reputation and party composition signals.

**Phase 5 (Months 25–36): 1.0 & Beyond.** Full content pass, modding support, additional morph paths, community-designed encounters and party classes. Ongoing meta-health monitoring through automated combinatorial regression testing.

---

## 13. Design Principles (Commitments)

These 15 principles guide all card and system design decisions. They are not aspirational — they are constraints that every card must satisfy.

| # | Principle | What It Means |
|---|-----------|--------------|
| 1 | No Vanilla Cards | Every card has at least one interesting property beyond power + cost |
| 2 | Identity Through Cards | A nurturing deck plays differently from a predatory deck, not just numerically |
| 3 | Combinatorial Depth | Two cards together produce effects neither produces alone |
| 4 | Narrative Mechanical Identity | Fiction and mechanics are the same thing |
| 5 | Resource Impact Chains | Cards hit resources directly or set up states other cards exploit |
| 6 | Information Asymmetry | Face-down Traps, Offer payloads, bluffs |
| 7 | Tempo vs. Investment | Strike now vs. Trap that pays in 2 rounds |
| 8 | Card Advantage Matters | Draw, discard, virtual advantage as resources |
| 9 | Sequencing Dependency | Entangle→Strike ≠ Strike→Entangle |
| 10 | Dead Cards and Live Cards | Context determines usefulness; hand texture matters |
| 11 | Counterplay with Cost | Every strategy has an answer but the answer costs something |
| 12 | The Clock Is Win Conditions | Resources narrow viable outcomes as they shift |
| 13 | Multiple Viable Win Conditions | Kill/Break/Panic/Bond feel mechanically different |
| 14 | Asymmetric but Balanced | Dungeon prepares/shapes/transforms; Visitor explores/responds/overcomes |
| 15 | Narrative Coherence | Vines entangle; poison erodes; offerings bypass resistance |

### 13.1 Description Test

A card is mechanically distinct if and only if its description cannot be written for any other card in the same category. This test is the operational enforcement of Principle #1.

---

## 14. Deck Specialization & Balance Framework

### 14.1 Balance Philosophy: Ecosystem Over Matchups

Shattered Dungeon supports three play modes from a single mechanical system: PVE-Dungeon (human dungeon vs AI visitors), PVE-Party (human party vs AI dungeon), and PVP (human dungeon vs human party). Balance is not a single number — it is an ecosystem property that emerges from the full space of compositions and matchups.

**No single matchup needs to be 50/50.** A nature dungeon running physical encounters might be 70/30 favored against a standard melee party, but a party built with anti-nature tools could flip that to 40/60. A deceptive dungeon might crush naive compositions but get dismantled by a Rogue-heavy party packing Disarm Trap and Flash Bomb. Balance lives in the rock-paper-scissors across the full matchup matrix, not in forcing any individual cell to an artificial win rate.

This mirrors how competitive card games and fighting games achieve balance. Strategic depth emerges from composition decisions made before the game starts — which party members to bring, which encounter sequence to run, which cards to include — not from flattening every encounter to coin-flip odds.

**Both sides are first-class player experiences.** Unlike most asymmetric games that designate one side as "the player" and the other as "content," Shattered Dungeon treats dungeon and visitor as equally valid player roles. The dungeon player's fantasy is being a powerful, intelligent entity defending their domain. The party player's fantasy is a coordinated team overcoming a hostile environment through preparation and execution. Both fantasies require genuine agency.

**AI stands in for the absent human.** In PVE-Dungeon, the AI controls visitors. In PVE-Party, the AI controls the dungeon. In PVP, both sides are human. The underlying system is identical in all three modes. AI-vs-AI simulation results represent the PVE baseline, with the understanding that human play on either side would produce different outcomes.

**Win rate targets are matchup-specific, not universal.** A creature-tier visitor against a fully developed dungeon should be heavily dungeon-favored (80%+ dungeon win) because the creature is content, not a player. A well-composed party against a well-composed dungeon should be competitive (40–60% range per side). A mismatched composition should favor the side whose strategy is less disrupted.

### 14.2 Encounter Quality Over Win Rate

The primary evaluation metric for any matchup is encounter quality — whether the games it produces are interesting, not whether the win percentages hit a predetermined target. Encounter quality is assessed through five formal metrics defined in Section 18.

When encounter quality is high, win rate is informational rather than prescriptive. When encounter quality is low, win rate is irrelevant. The priority is always fixing encounter quality first, then evaluating win rate in context.

### 14.3 Core Principle: Deck Specialization

Each dungeon deck specializes in one primary win condition, similar to how MTG color identities define what a deck fundamentally excels at and where it's deliberately weak. Outcome diversity emerges from multi-room sequences where visitors encounter different specialist rooms, not from any single deck trying to do everything.

### 14.4 Win Condition Ownership

| Deck | Primary Win Condition | Secondary Angle | Deliberately Weak Against |
|------|----------------------|-----------------|---------------------------|
| **Root Hollow** | Kill (vitality depletion) | Light resolve/nerve splash | Can't close Break or Panic alone |
| **Whispering Gallery** | Break (resolve depletion) | Nerve chip via counters | Minimal vitality pressure |
| **Veil Breach** | Panic (nerve depletion) | Resolve via Overwhelm spill | Minimal direct vitality/resolve |
| **Living Root Sanctuary** | Bond (trust/rapport) | Stalling via heals | Not designed to Kill/Break/Panic |

### 14.5 Deck Identity Spectrum

**Specialists** — Dominant in one win condition, deliberately weak in others. Root Hollow is a Kill specialist. Veil Breach is a Panic specialist.

**Swiss Army Knives** — Not dominant in anything, but flexible across 2–3 win conditions. These decks trade peak effectiveness for optionality.

Most decks fall somewhere between these poles. A specialist with a light secondary splash is a specialist with a tool, not a generalist.

### 14.6 Design Implications

Individual decks should be lopsided. Outcome targets are measured across full runs, not per room. Room flow is the primary balance lever for outcome diversity. Deck card changes are for tuning the specialist's effectiveness, not for broadening its coverage.

### 14.7 Balance Levers (Ordered by Scope)

| Lever | Scope | What It Changes | When to Use |
|-------|-------|----------------|-------------|
| **Encounter auto-effects** | Single room | Passive resource pressure, pacing | First lever — lowest blast radius |
| **Dungeon deck cards** | Single room | Card power, costs, targets, keywords | Tuning a specialist's effectiveness |
| **Visitor deck cards** | All rooms | Visitor offensive/defensive capability | When visitor feels too strong/weak everywhere |
| **Visitor starting stats** | All rooms | Resource pools, win condition thresholds | When math structurally prevents outcomes |
| **Dungeon specialization** | All rooms (future) | Dungeon-level identity and passives | Future state — global dungeon modifiers |
| **Visitor AI profile** | All rooms | Decision-making weights and priorities | When AI behavior doesn't match identity |

### 14.8 Deck Customization & Long-Term Balance

The starter decks are reference configurations, not the final state. Core systems must produce healthy outcomes across a range of deck configurations. Auto-effects and encounter design are more stable balance anchors than specific cards. Win condition diversity should emerge from system design rather than depending on specific deck compositions. Balance is an ongoing process, not a solved state.

### 14.9 Visitor Stat Asymmetry

| Stat | Purpose | Tuning Lever |
|------|---------|--------------|
| High vitality | Makes Kill the slow, grinding path | Lower = faster Room 1 resolution = more room flow |
| Lower resolve/nerve | Makes Break/Panic achievable for specialist rooms | Must be reachable within ~4–5 rounds of focused pressure |

### 14.10 Validated Example: Thornback Boar

| Version | Vitality | Key Change | Kill | Break | Panic | Result |
|---------|:---:|-----------|:---:|:---:|:---:|--------|
| v2.2 | 28 | Energy baseline | 71.7% | 1.1% | 4.8% | Secondary conditions collapsed |
| v2.3 | 28 | Deck retargeting + stat tuning | 56.9% | 15.0% | 7.5% | Break fixed, Panic still low |
| v2.3c | 26 | Vitality compromise | 68.8% | 9.7% | 5.1% | Satisfied nothing |
| v2.3d | 28 | + Root Hollow nerve auto-effect | 55.3% | 11.5% | 21.6% | All targets hit ✅ |

Key learning: the final fix used the narrowest available lever (encounter auto-effect) to solve the remaining Panic deficit without disrupting the other metrics.

---

## 15. Dungeon Strategic Architecture

The dungeon player's strategic identity is expressed through three layers that build on each other.

### 15.1 The Three Strategic Layers

**Layer 1: Dungeon Specialization (Macro — Permanent).** The dungeon's specialization defines its global identity through passive abilities and modifiers that apply across all encounters. Specialization develops over many runs as the dungeon's identity crystallizes. *Status: Future state. Not yet implemented.*

**Layer 2: Encounter Selection & Ordering (Strategic — Per-Run).** Before each run, the dungeon player selects which encounter rooms to deploy and in what order. This is the primary strategic decision — it determines the narrative arc, available card pools, and viable win conditions.

| Strategy | Room Sequence | Arc |
|----------|--------------|-----|
| Grinding predator | Root Hollow → Whispering Gallery → Veil Breach | Physical attrition → psychological warfare → terror |
| Deceptive host | Honeyed Hollow → Root Hollow | False safety → crushing betrayal |
| Patient nurturer | Living Root Sanctuary (single room) | Sustained cooperation toward Bond |
| Psychological horror | Veil Breach → Whispering Gallery | Terror → despair |

**Layer 3: Deck Customization (Tactical — Per-Encounter).** Within each encounter, the player customizes the room's aligned deck by swapping flex-slot cards from the generic card pool.

### 15.2 How the Layers Interact

Specialization shapes encounter selection. Encounter selection determines available card pools. Deck customization fine-tunes within the strategic ceiling.

### 15.3 Deception as a Cross-Room Strategy

Deception illustrates why the multi-room architecture matters. A single-room deceptive deck would need Offers, Traps, AND Strikes in 16 cards — too many roles for too few slots. But across two rooms, Room 1 specializes at *seeming safe* while Room 2 finishes what the honeytrap started. The "betrayal" is the room transition itself.

### 15.4 Implications for AI Visitors

Intelligent visitors will need encounter recognition, cross-room planning, and reputation reading — creating an information asymmetry arms race between dungeon design and visitor adaptation.

### 15.5 Generic Card Pool Design Principles

Generic cards should be mechanically complete but not optimized, provide category coverage, avoid creating combo enablers, be balance-neutral by default, and be thematically neutral (representing fundamental capabilities rather than room-specific phenomena).

---

## 16. Intelligent Visitor Party System

### 16.1 Design Philosophy

The party system transforms the visitor side from a single entity with flat resource pools into a composed team of specialized members — mirroring how the dungeon side composes encounter rooms into a strategic sequence. Both sides now have a compositional layer (which rooms / which party members) that determines the tactical layer (which cards are available and what strategies are viable).

The party system is the inverse of dungeon encounter design. Dungeon encounters add flavor and tactics through sub-decks, auto-effects, and room-specific cards aligned to the encounter. Party members function identically: each member contributes cards to the party deck, modifies the collective resource pool, and brings a strategic focus area. Pre-match party selection — choosing which members to bring against a dungeon with a known reputation — is a core strategic decision.

This architecture supports PVE (party vs AI dungeon), PVE-inverse (dungeon vs AI party), and PVP (human party vs human dungeon) without changing the underlying mechanical systems.

### 16.2 Party Composition

Parties are fixed at 4 members for initial implementation. Each party member has:

- **Individual vitality** — their own physical health pool, targeted independently by the dungeon
- **Collective resource contribution** — each member adds to the party's shared resolve and nerve pools
- **Card contribution** — each member brings 8–12 cards to the shared party deck
- **Strategic identity** — primary focus, dual focus, or utility (see 16.4)

The party functions as a single "side" in the encounter system. One shared hand is drawn from the combined party deck. One shared energy pool funds all card plays. The party takes one unified turn per round, playing cards from the shared hand. This keeps the turn economy identical to the current system — the party is one side that plays cards each turn, not four separate actors.

**Duplicate class selection is permitted.** A party may include multiple members of the same class (e.g., two Knights or two Rogues). Each instance contributes its own vitality pool, card set, and resource pool contributions independently. Class specialization trees (future development) differentiate duplicate-class builds by providing distinct card pools and passive abilities for each specialization path, so two "Knights" with different specializations would bring meaningfully different capabilities despite sharing a base class. At the base level before specialization, running duplicate classes sacrifices role diversity for concentrated strength in that class's strategic area.

### 16.3 Resource Model

**Vitality is individual.** Each party member has their own vitality pool. The dungeon targets individual members when playing vitality-targeting Strikes. This represents physical health — each person has their own body, their own hit points.

**Resolve and nerve are collective.** The party shares a single resolve pool and a single nerve pool. These represent group morale: willpower (resolve) and courage (nerve) are contagious — one member's fear affects the whole group, one member's determination bolsters everyone.

**Collective pool composition.** Each party member contributes a defined amount to the party's resolve and nerve pools. A fighter might contribute +6 resolve / +4 nerve while a mage contributes +3 resolve / +5 nerve. Party composition directly shapes the defensive profile:

- A heavy-fighter party has deep resolve but shallow nerve — hard to Break, easy to Panic.
- A balanced party has no glaring weakness but no deep reservoir either.
- A caster-heavy party has deep nerve but shallow resolve — resistant to fear, vulnerable to psychological warfare.

Pre-match party selection is a defensive decision as much as an offensive one. The party is choosing its vulnerability profile.

**Trust is collective.** The party shares a single Trust value. Bond requires the entire party's Trust reaching threshold — the dungeon must convince the whole group, not just one member.

### 16.4 Party Member Archetypes

Party members exist on a specialization spectrum, similar to dungeon deck identities (Section 14.5):

**Primary focus** — Deep in one area. Most cards serve a single strategic function. Example: a Knight brings predominantly Strikes targeting structure/presence, with one Empower and one Reshape. High impact in their lane, minimal flexibility.

**Dual focus** — Split across two areas. Cards serve two complementary functions. Example: a Battlemage brings Strikes and Disrupts, able to pressure two resource axes but neither as hard as a specialist.

**Utility** — Spread across many functions. Cards provide support, healing, disruption, and light offense. Example: a Bard brings Reshapes, Offers, Counters, and one Disrupt. Doesn't push any win condition independently but enables specialists and shores up weaknesses.

A well-composed party has a mix: 1–2 primary focus members for win condition pressure, 1 dual focus for flexibility, and 1 utility for support and counterplay. An unbalanced party (e.g., 4 fighters) is powerful on one axis but has glaring gaps the dungeon can exploit.

### 16.5 Party Deck Construction

Each party member brings 8–12 cards to the shared party deck, creating a combined deck of 32–48 cards that carries the party through the entire dungeon run. This contrasts with the dungeon side, where each encounter room has its own 15–16 card deck.

**Why the party deck persists across rooms:** Visitors don't control the dungeon's layout. They bring one kit and adapt it to whatever rooms they encounter. This creates resource management tension across the full run — burning powerful cards early to survive Room 1 means fewer options in Room 3.

**Deck composition rules:**
- Each member's card set must include at least 1 Energy card
- The combined party deck must contain at least 4 Energy cards total
- Each member's cards should form a coherent kit (internal synergies)
- Cross-member synergies are encouraged (a healer's buff makes the fighter's Strike better)

**Future evolution:** Party member card pools can be customizable, similar to how dungeon encounter decks have core slots (locked) and flex slots (swappable). A Knight's core cards (signature Strikes) are fixed, but 2–3 flex slots allow the player to customize their Knight's secondary capabilities. Generic visitor cards may be included to fill strategic gaps — a party without a dedicated support member might slot generic healing Reshapes. Generic cards follow the same design principles as dungeon generics (Section 15.5): low-impact, category-covering, no combo enablers, balance-neutral.

### 16.6 Member Elimination

When a party member's individual vitality reaches 0, they are knocked out:

1. **Card removal.** The knocked-out member's cards are removed from the active deck. Cards currently in hand remain playable this turn but are not reshuffled. Cards in the draw pile and discard are removed.

2. **Morale cascade.** Each knockout inflicts direct damage to the party's collective resolve and nerve. The damage scales with eliminations — the first knockout is a setback, the second is devastating:
   - First knockout: -3 resolve, -3 nerve
   - Second knockout: -5 resolve, -5 nerve (and triggers Kill — see 16.7)

3. **Deck thinning.** Losing a member's cards reduces deck size, which increases draw consistency for remaining cards. This mirrors the DND dynamic where a reduced party is weaker overall but each remaining member gets more spotlight.

### 16.7 Kill Win Condition (Revised)

With parties, Kill triggers when 2 of 4 party members are knocked out (50% threshold) — the survivors flee the dungeon. The morale cascade means member elimination accelerates other win conditions too. Knocking out one member deals -3 to resolve and nerve, potentially bringing the party within Break or Panic range. The dungeon faces a genuine strategic choice:

- **Focus fire** two members for Kill (requires concentrated vitality damage on individuals)
- **Spread pressure** to trigger knockouts that cascade into Break or Panic (requires mixing vitality damage with resolve/nerve pressure)
- **Ignore vitality entirely** and pursue pure Break or Panic against the collective pools

This makes the dungeon's targeting decision — which party member to attack — one of the most important strategic choices in the game.

### 16.8 Member Restoration

Party members can be restored mid-encounter through dedicated healing cards (typically from utility/healer class members). Restoration is expensive (high energy cost, 3+), partial (restored member returns at reduced vitality), and blockable (the dungeon can Counter, Disrupt, or target the healer).

This creates the classic "kill the healer first" dynamic. If the dungeon leaves the healer alive, the party can recover from member knockouts. If the dungeon prioritizes the healer, the party loses both its restoration capability and its utility cards.

Between-encounter restoration is more generous — downed members automatically return at partial vitality between rooms, representing rest and regrouping. The dungeon's multi-room strategy must account for party recovery between encounters.

### 16.9 Targeting System

Dungeon Strikes that target vitality require a target selection — which party member to hit. This is a dungeon AI decision (or player decision in PVP) based on member threat assessment, member vulnerability (lowest remaining vitality), strategic objective (Kill focus fire vs morale cascade), and healer priority.

Strikes targeting collective resources (resolve, nerve) do not require member targeting — they hit the party's shared pool directly.

**Keyword extensions for party targeting (future design space):**
- **Cleave** — Strike hits multiple party members for reduced damage
- **Focused** — Strike must target a specific member (e.g., lowest vitality)
- **Piercing** — Strike ignores restoration effects

Initial implementation uses AI-selected targeting as the default.

### 16.10 Energy System

The party shares a single energy pool, consistent with the shared deck and shared hand. Energy cards from any party member contribute to the shared pool. This creates natural energy tension — a healer's expensive restoration card competes for energy with the fighter's finisher Strike.

Party member card pools may include specialty Energy cards (e.g., a mage's "Arcane Surge" provides 2 temp energy but only for Mystical-type cards) or standard Energy cards.

### 16.11 Bond with Parties

Bond requires the entire party's Trust reaching threshold. The dungeon must convince the whole group, not just one sympathetic member. This is the hardest path — four skeptical adventurers are harder to win over than one creature.

Knocking out party members does NOT make Bond easier — it damages morale (resolve/nerve cascade) and removes that member's potential Offer/Test cards from the deck. A dungeon pursuing Bond against a party cannot eliminate members as a shortcut — it must keep everyone alive and cooperating.

Bond with a full party is the most difficult and rewarding win condition in the game.

### 16.12 Interaction with Existing Systems

The party system integrates with existing mechanics without replacing them:

- **Card categories** — all 9 categories function identically. Party member cards use the same categories.
- **Energy system** — shared pool, same Energy card types, same costs and activation.
- **Combo sequencer** — `planTurn()` works with the party deck since it operates on hand contents, not party structure.
- **Encounter engine** — the party is one "side" with modified resource tracking. The core turn loop is unchanged.
- **Auto-effects** — auto-effects targeting visitor vitality need a targeting rule (e.g., target lowest-vitality member, or spread across all members). Auto-effects targeting resolve/nerve hit the collective pool as before.
- **Creature visitors** — Boar, Moth, and Symbiote remain as Tier 0 solo visitors. The party system applies only to Intelligent Visitors (Tier 1+).

### 16.13 Sample Party — The Standard Adventuring Company

The first party implementation, validated through v2.4c simulation:

| Role | Class | Vitality | Resolve Contrib. | Nerve Contrib. | Cards | Strategic Focus |
|------|-------|:--------:|:-----------------:|:--------------:|:-----:|----------------|
| Tank | Knight | 10 | +5 | +4 | 10 | Primary: Structure/Presence Strikes, Reshapes |
| DPS | Battlemage | 7 | +3 | +4 | 10 | Dual: Vitality Strikes + Disrupts |
| Support | Cleric | 7 | +4 | +4 | 10 | Utility: Reshapes, Offers, restoration |
| Flex | Rogue | 6 | +2 | +4 | 10 | Dual: Veil Strikes + Traps + Counters |
| **Party Total** | | **30 (individual)** | **14 (collective)** | **16 (collective)** | **40** | |

The Knight has the most vitality (10) and is the hardest to eliminate individually. The Rogue has the least vitality (6) and is the easiest knockout target, but removing the Rogue eliminates Traps and Counters — defensive tools the party needs. This creates a genuine dungeon dilemma: kill the easy target and lose your own counterplay threat, or focus the Knight for a harder but less costly elimination.

Kill threshold: 2 knockouts. Morale cascade: 1st knockout -3 resolve/-3 nerve, 2nd knockout -5/-5.

### 16.14 Design Validation Results

The party system was validated through simulation against the Verdant Maw tactical dungeon (Root Hollow, single room, 1000 iterations):

| Outcome | v2.4c |
|---------|:---:|
| Kill | 39.8% |
| Survive | 37.8% |
| Panic | 21.8% |
| Break | 0.6% |

Break barely appears because Root Hollow's auto-effects target nerve but never resolve. The only resolve pressure comes from Erode keywords, occasional Strikes, and morale cascade. This is accepted as thematically correct — a coordinated party's willpower is their strongest asset. Deceptive and nurturing dungeons should produce more Break outcomes naturally through different pressure vectors.

Multi-room party testing (3-room gauntlet) is the next validation milestone.

---

## 17. Dual Economy & Progression

### 17.1 Economic Philosophy

The economy is a two-sided marketplace. The dungeon has something visitors want (gold, items, the challenge itself). Visitors have something the dungeon wants (Essence from their life force, World Knowledge from their experiences). Every encounter outcome distributes these currencies differently, making the dungeon's identity choice — predator, nurturer, trader, deceiver — an economic decision with long-term progression consequences.

**Critical design constraint:** The economy must prevent runaway specialization. A dungeon that only kills becomes Essence-rich but Knowledge-poor — powerful rooms but no sophistication. A dungeon that only bonds becomes Knowledge-rich but Essence-poor — clever encounters but structurally weak. The system incentivizes strategic diversification naturally through currency scarcity, not through artificial rules mandating variety.

### 17.2 Dungeon Currencies

**Essence** — Raw power extracted from visitors. Represents the life force, fear, and suffering the dungeon absorbs.

Earning rates scale with encounter aggression: Kill yields high Essence (maximum extraction), Break/Panic yields moderate Essence, Survive yields low Essence (brief exposure), Bond yields minimal Essence (cooperative visitors share willingly but the dungeon takes nothing by force).

**World Knowledge** — Information, memories, and experiences visitors carry.

Earning rates scale with encounter depth and cooperation: Bond yields high World Knowledge (visitor shares freely), Survive (extended encounter) yields moderate, Break/Panic yields low (traumatized visitors reveal little), Kill (quick) yields minimal (dead visitors teach nothing).

This creates the core economic tradeoff. Predatory dungeons accumulate power fast but plateau in sophistication. Nurturing dungeons grow slowly in raw power but develop complex, adaptable strategies.

### 17.3 Dungeon Spending

**Essence buys power:** New combat-oriented cards, card morphs toward lethality, room items that boost reducer resources or amplify damage, encounter morphs that increase environmental pressure.

**World Knowledge buys sophistication:** New utility and tactical cards, card morphs toward complexity, room items that enable new strategies, encounter morphs that add mechanical depth, unlocking new encounter room templates.

**Both currencies can buy:** Energy card improvements and defensive investments.

### 17.4 Dungeon Lure Investment

The dungeon spends resources to place loot in its rooms as bait to attract visitors. Higher-value loot attracts more and better-equipped parties. The type of loot shapes which visitors arrive. This creates a genuine economic cycle: the dungeon invests in loot → attracts visitors → encounters produce Essence/Knowledge → dungeon reinvests.

### 17.5 Visitor Currencies

**Gold** — Universal currency earned from dungeon runs. Earning rates scale with encounter outcome: Bond yields highest gold, Survive (full run) yields high gold, Survive (fled early) yields moderate, Break/Panic yields low, Kill yields zero. Gold scales with dungeon difficulty — harder dungeons pay more for survival.

**Items** — Specific equipment and artifacts from dungeon-placed loot, shops, crafting (future), and rare drops.

### 17.6 Visitor Spending

**Gold buys:** Equipment, new cards for party members, card morphs, party member recruitment, and consumables. **Items are equipped** to party members or consumed during runs.

### 17.7 Equipment & Room Items

Equipment is the primary way both sides modify tactical capabilities between runs. The design principle is effect-based progression, not flat stat increases.

**Visitor Equipment Tiers:**

| Tier | Effect Type | Example |
|------|-------------|---------|
| Common (White) | Small flat stat bonus | Iron Shield: +1 vitality |
| Uncommon (Green) | Conditional stat bonus | Sturdy Boots: +2 vitality if nerve > 50% |
| Rare (Blue) | Card play modifier | Veil-Touched Blade: Physical Strikes also deal 1 veil damage |
| Epic (Purple) | New mechanic or trigger | Healer's Oath: Auto-restore 2 when ally drops below 30% vitality (once per encounter) |
| Legendary (Gold) | Game-changing effect | Crown of Defiance: Party immune to first Panic trigger per encounter |

Equipment slots per party member: Weapon (modifies offensive cards), Armor (modifies defensive stats/reactions), Accessory (provides a unique effect or trigger).

**Dungeon Room Items** — Installed in encounter rooms, providing persistent modifiers. Examples range from Common (Structure +2 in this room) to Legendary (all dungeon cards in this room gain the Drain keyword).

### 17.8 Reputation & Matchmaking

The dungeon's accumulated encounter outcomes create a reputation profile that shapes which visitors arrive.

Reputation dimensions: Lethality (ratio of Kills), Hospitality (ratio of Bonds and Survives), Deception (ratio of cooperation-to-aggression pivots), Difficulty (aggregate challenge measure).

Matchmaking uses reputation to generate appropriate challenges. A lethal dungeon faces increasingly well-equipped parties. A hospitable dungeon attracts diverse visitors. A deceptive dungeon faces parties with high starting suspicion. This creates the natural progression treadmill: as the dungeon improves, so do its opponents.

### 17.9 Card Morphing (Framework)

Both sides can invest currency to permanently modify existing cards. Morphs are permanent and irreversible. Each card has 2–3 morph paths representing different specializations. Morph paths align with the currency used (Essence morphs → power/aggression, World Knowledge morphs → utility/complexity). Morphed cards must still pass the Description Test.

**Example morph paths:**

*Entangling Grasp (base: Strike, 2 power, Entangle keyword)*
- Essence morph → **Strangling Grasp:** 3 power, Entangle + Erode. Pure lethality.
- Knowledge morph → **Binding Inquiry:** 2 power, Entangle + reveal one face-down visitor card. Information gathering.
- Dual morph → **Consuming Embrace:** 2 power, Entangle + Drain. Sustain through aggression.

Detailed morph trees per card are a future design task.

### 17.10 Economic Balance Constraints

Currency caps per encounter prevent farming. Diminishing returns on specialization push diversification. Loot investment risk means hospitable dungeons pay real ongoing costs. Equipment durability (future) keeps gold flowing. Matchmaking pressure ensures economic advantages translate into harder opponents.

### 17.11 Interaction with Party System

Party composition is an economic decision (hiring members costs gold). Equipment loadout defines run strategy. Run reward depends on encounter outcomes and member survival. Member loss has economic consequences. Dungeon lure quality affects party decisions about which dungeon to enter.

---

## 18. Encounter Quality Framework

### 18.1 Purpose

The encounter quality framework defines formal metrics for evaluating whether a matchup produces good games. These metrics replace raw win percentage targets as the primary evaluation criteria for balance decisions. Win percentages remain useful as descriptive data (characterizing which compositions favor which side), but a matchup is "balanced" when its encounter quality scores are healthy, regardless of its specific win distribution.

This framework supports all three play modes (PVE-Dungeon, PVE-Party, PVP) and evaluates matchups regardless of whether they were hand-crafted or generated by automated composition testing.

### 18.2 The Five Quality Metrics

#### 18.2.1 Agency Score

**What it measures:** Did both sides have meaningful influence on the outcome throughout the encounter?

**How it works:** Track lead changes across the full encounter — moments where the side with the higher aggregate health percentage swaps. A game where the dungeon leads from round 1 through resolution with the gap always widening has zero lead changes and represents low agency. A game where the party surges ahead in rounds 3–5, the dungeon claws back with a knockout in round 7, and the final rounds are a knife fight has multiple lead changes and represents high agency.

**Computed as:** Average number of lead changes per encounter across all iterations in a batch. Also reported as a distribution — percentage of games with 0, 1, 2, 3+ lead changes.

**Healthy range:** 1.5–4.0 average lead changes per encounter. Below 1.0 indicates one side dominates from the start. Above 5.0 may indicate outcomes feel random rather than earned.

**Party extension:** For multi-room runs, agency is also measured at the run level. A run where Room 1 is always a dungeon rout and Rooms 2–3 are formalities has low run-level agency even if individual rooms have lead changes.

#### 18.2.2 Closeness at Resolution

**What it measures:** How narrow was the margin of victory?

**How it works:** When a game resolves, capture the losing side's closest-to-depletion resource as a percentage of its starting value. A Kill that ends with resolve at 85% was not close to being a Break. A Kill that ends with resolve at 8% and nerve at 12% was close to producing three different outcomes.

**Computed as:** Average "losing side proximity" — the mean percentage of the losing side's lowest non-depleted resource at resolution. Also reported as "closest alternative outcome."

**Healthy range:** Losing side's next-closest resource at 15–40% of starting value. Below 10% indicates knife-edge games across multiple win conditions (exciting but potentially too random). Above 60% indicates the winning condition was the only one ever in play.

**Why it matters for PVP:** Games that resolve with multiple resources near depletion feel closer and more competitive. The losing player can identify moments where a different decision might have changed the outcome — essential for the "I almost had them" feeling that drives rematches.

#### 18.2.3 Outcome Diversity (Shannon Entropy)

**What it measures:** How many distinct win conditions are meaningfully occurring across iterations?

**How it works:** Compute Shannon entropy across the win condition distribution for a batch. Shannon entropy is maximized when all outcomes are equally likely and minimized when one outcome dominates.

**Computed as:** H = −Σ(p × log₂(p)) for each outcome with p > 0. Normalized to 0–1 scale by dividing by log₂(N) where N is the number of possible outcomes (8 for the full system: Kill, Break, Panic, Bond, Overcome, Inert, Dominate, Survive).

**Healthy range:** Normalized entropy 0.45–0.85. Below 0.35 indicates severe outcome concentration (one win condition at 70%+). Above 0.90 may mean no win condition has a clear strategic identity.

**Context sensitivity:** Creature-tier visitors (Boar) accept lower entropy (0.35–0.65) because creatures have fewer viable strategies. The 0.45–0.85 range applies to party-vs-dungeon matchups.

#### 18.2.4 Knockout Pattern Diversity (Party-Specific)

**What it measures:** Does the dungeon's member targeting produce varied elimination patterns?

**How it works:** Across all iterations with at least one knockout, record which member was eliminated first. Compute the distribution and its entropy.

**Computed as:** First-knockout distribution entropy, normalized. Also reported as raw percentages per member.

**Healthy range:** Normalized entropy 0.50–0.90. The dungeon AI *should* have targeting preferences, but if one member is first-knockout in 80%+ of games, the targeting system is too deterministic.

**Design insight:** The tactical dungeon profile prioritizes Cleric as a first target. Expected pattern: Cleric first-knockout at roughly 35–50% with the remainder distributed across other members depending on game state. If Cleric first-knockout is 90%, the Cleric's vitality may be too low or targeting logic needs softer prioritization.

#### 18.2.5 Multi-Room Attrition Curve

**What it measures:** Is each room contributing meaningfully to the full run, or are games decided in Room 1?

**How it works:** For multi-room scenarios, capture the visitor's aggregate resource state at the start of each room. Track per-room outcome distributions and "effective room" percentages.

**Computed as:** Average visitor resource percentages (vitality, resolve, nerve) at entry of each room. Distribution of room-specific outcomes. "Effective room" — percentage of runs reaching that room where both sides still have viable paths.

**Healthy range:** Room 2 entry at 55–75% of starting resources (meaningful attrition without predetermination). Room 3 entry at 30–55% (worn but not dead). If Room 2 entry is above 80%, Room 1 is too easy. If below 40%, the party is effectively dead and Room 2 is a formality.

**Effective room threshold:** A room is only an effective gameplay experience if at least 25% of runs that reach it have realistic paths for both sides.

### 18.3 Metric Interpretation Guidelines

These metrics are diagnostic tools, not pass/fail gates. Common patterns:

**High agency, low diversity:** Exciting back-and-forth, but games always end the same way. Suggests good moment-to-moment gameplay but card/auto-effect design funnels toward one win condition.

**High diversity, low agency:** Multiple outcomes occur but games are decided early. Suggests resource depletion rates are too fast relative to comeback potential.

**High closeness, low agency:** Games end narrowly but the leading side never changes. May feel fine for PVE (grinding war of attrition) but poor for PVP.

**Low closeness, high agency:** Dramatic swings but decisive endings. Whichever resource happens to be targeted first determines the outcome. May indicate a targeting diversity problem.

### 18.4 Composition Rules

**Party composition rules:**
- Parties are fixed at 4 members.
- Duplicate classes are permitted. Each instance contributes separate vitality, card, and resource pools.
- Class specialization trees (future) differentiate duplicate-class builds.
- Party deck size scales with composition (32–48 cards).
- Generic visitor cards may fill strategic gaps, following the same design principles as dungeon generics.

**Dungeon composition rules:**
- Encounter sequences are 2–4 rooms for standard runs.
- Duplicate encounters are not permitted. Each room must be a distinct encounter. This prevents degenerate strategies and ensures encounter ordering remains meaningful.
- Each encounter brings its own aligned deck.
- Generic dungeon cards may supplement encounter-specific decks.
- Dungeon specialization (future) applies global modifiers across all encounters.

### 18.5 The Matchup Matrix

At production scale, the space of legal compositions is large. With C available member classes and 4 party slots (duplicates permitted), the party space is C-multichoose-4. With R available encounters and 2–4 room sequences (no duplicates), the dungeon space grows combinatorially. The full matchup matrix contains thousands to tens of thousands of unique pairings.

**No matchup in this matrix is required to be 50/50.** What matters:

1. **No composition dominates all opponents.** A party or dungeon build winning 70%+ against every opposing configuration is degenerate.

2. **Every composition has at least one favorable and one unfavorable matchup.** This is the rock-paper-scissors principle.

3. **Encounter quality is maintained across the matrix.** Even lopsided matchups (70/30 or 80/20) should produce high agency and diverse outcomes when the favored side doesn't achieve their primary win condition.

4. **Partial progress is rewarded on both sides.** The dual economy (Section 17) ensures the losing side earns resources proportional to performance, softening the impact of unfavorable matchups.

### 18.6 Combinatorial Testing Methodology

Hand-crafted scenarios validate specific matchups but cannot cover the full composition space. The long-term testing methodology is automated combinatorial exploration:

**Phase 1 — Atomic Data Architecture (Current).** All game content exists as independent, composable units. Individual member files, encounter files, generic card pools, and scenario files. This architecture is already in place.

**Phase 2 — Composition Generator (Phase 3 Development).** A generator that assembles legal compositions on both sides and wires them into scenario format. Two modes: random sampling (baseline distributions across hundreds of matchups) and targeted probing (directed exploration of flagged anomalies).

**Phase 3 — Anomaly Detection (Phase 4 Development).** Automated flagging of statistical outliers: a member class with 80%+ first-knockout rate regardless of composition, an encounter ordering producing 0% of some win condition, a card appearing in every winning deck, a composition winning 70%+ against all opponents, or any matchup with agency below 1.0.

**Phase 4 — Meta-Health Monitoring (Post-Launch).** Continuous regression testing as new content is added. Each new class, encounter, or card is tested against the existing matrix. Meta-health dashboards tracking average agency, composition diversity in player selections, and win rate variance.

### 18.7 Relationship to Existing Balance Methodology

This framework does not replace Section 14's balance levers — it changes when and how they are applied.

**Section 14's levers remain the correct tools for tuning.** What changes is the trigger. Previously: "Kill is at 60% and the target is 55%." Now: "agency score is below 1.5 and the dungeon's secondary resources are never threatened." The lever applied might be the same, but the reason is encounter quality rather than percentage matching.

**Target percentages become matchup-specific character descriptions.** The Boar matchup's Kill at 55% is not a target to maintain — it describes how this matchup plays. If a system change moves Kill to 48% but agency and diversity improve, the new number is correct.

**Creature-tier matchups retain simpler evaluation.** Creature visitors are AI-controlled content, not player experiences. Their primary criteria: do all win conditions fire at non-trivial rates, does pacing hit 10–15 rounds, do momentum dynamics show mid-game behavior. The full five-metric framework applies to party-vs-dungeon matchups.

### 18.8 Simulation Reporting Requirements

The simulation engine's batch reporting must compute and output all five quality metrics alongside existing win percentage data. No changes needed to the encounter engine or rules engine — per-round snapshot data already captured (resource percentages, lead tracking, party member status) contains all necessary inputs. Changes are limited to the aggregation layer in `sequence.js` and output formatting in `run.js`.

**Required output additions:**
- `agencyScore`: average lead changes per encounter, lead change distribution
- `closenessAtResolution`: average losing-side nearest resource percentage, nearest alternative outcome
- `outcomeDiversity`: Shannon entropy (raw and normalized), per-outcome percentages
- `knockoutPatterns` (party scenarios only): first-knockout distribution, knockout order entropy
- `attritionCurve` (multi-room scenarios only): per-room entry state averages, per-room outcome distributions, effective room percentages


# GDD AMENDMENT: Bond System Redesign v3.0

**Shattered Dungeon — Second Self Studios**
**February 2026**

*Replaces GDD Sections 4.5–4.8 and Section 6. Extends Section 17.*

---

## 1. Design Problem

The current Bond system produces 0% Bond outcomes across all 8 party matchups (v2.8, 1000 iterations each). The Nurturing AI profile — specifically designed to pursue Bond — instead plays as a weak combat dungeon that occasionally offers free healing. Offers are refused ~70% of the time at low trust. When accepted, they provide unilateral gifts with no strategic depth.

**Root causes:**

1. **No motivation.** The dungeon has no reason to Offer except altruism. A sentient predator doesn't give things away.
2. **No stakes for the visitor.** Refusing an Offer is free. There's no cost to saying no, so the rational play is almost always to refuse and fight.
3. **No escalation.** Trust at 2 plays identically to trust at 8. The system has no power curve.
4. **Bond is all-or-nothing.** Reaching threshold 12 for both promoters in a single encounter requires 8-12 rounds of dedicated cooperative play with no combat — an unrealistic ask against any party that came to fight.
5. **Bond doesn't fit multi-room gauntlets.** After two rooms of combat, neither side has a credible reason to suddenly cooperate in Room 3.

## 2. Design Philosophy: Farming vs. Hunting

The Bond redesign starts from a single insight: **the dungeon is always the predator.** The question isn't whether the dungeon wants something from visitors — it's how patient it is about extracting it.

A **hunter** (aggressive dungeon) kills visitors and takes what it can from the corpse. Maximum extraction per encounter, but the resource is destroyed.

A **farmer** (nurturing dungeon) keeps visitors alive, comfortable, and returning. Less extraction per encounter, but the resource is renewable and compounds over time.

The farmer isn't kind. It's *strategic.* It discovered that a well-fed visitor comes back, brings friends, and produces more Essence over a lifetime than a single corpse ever could. The moss-covered rest chamber isn't hospitality — it's infrastructure. The warm glow isn't welcome — it's an anesthetic.

This reframe eliminates the good/evil binary that makes Bond uncompetitive. Bond isn't the "nice" win condition. It's the **long-game** win condition. The dungeon invests resources now to extract more later. The party accepts because they need the healing — and because maybe, just maybe, this dungeon really is different.

Every Offer the dungeon makes should carry a silent subtext: *"I'm helping you because you're more useful alive."* Every acceptance by the party carries the counter-subtext: *"I know what you are, but I need this."*

## 3. Core Mechanic: Offers as Transactions

### 3.1 Current System (Being Replaced)

Offers bypass contested rolls. Acceptance is probabilistic (30% + Trust × 10%). Accepted Offers deliver unilateral payloads (heal nerve, build trust). The dungeon gives; the visitor receives or refuses.

### 3.2 New System: Transactional Offers

Every Offer has three components:

| Component | Description | Example |
|---|---|---|
| **Benefit** | What the acceptor gains | Heal 3 nerve |
| **Cost** | What the acceptor pays | Binding: -1 resolve/round for 2 rounds |
| **Investment** | Trust/Rapport advancement | +1 trust, +1 rapport |

**Visibility Rules** determine what the acceptor can see before deciding, based on current Trust tier (see Section 4):

| Trust Tier | Benefit | Cost | Investment |
|---|---|---|---|
| Tier 0 (Trust 0–2) | Visible | Visible | Visible |
| Tier 1 (Trust 3–5) | Visible | **Hidden** | Visible |
| Tier 2 (Trust 6–8) | Visible | Hidden | N/A (auto-accepted) |

At **Tier 0**, both sides see everything. The party evaluates a transparent trade: "Heal 3 nerve, but lose 2 resolve over 2 rounds. Worth it?" This is strangers haggling. Acceptance depends on whether the net is positive enough given current resource pressures.

At **Tier 1**, the party sees the benefit but not the cost. "Heal 3 nerve. The cost is... unknown." The dungeon could be offering a fair trade (cost: -1 resolve once) or a terrible one (cost: Binding -1 resolve/round for 3 rounds). The party gambles based on how much they trust the dungeon and how badly they need the heal. This is the poker moment.

At **Tier 2**, Offers are **Binding** — auto-accepted. The party trusted the dungeon enough to reach Trust 6+, and now the dungeon has leverage. Binding Offers tend to be stronger in both directions — bigger heals, bigger costs. The party benefits, but the dungeon is extracting real value. This is the farm operating at full capacity.

### 3.3 Offer Card Data Format

```javascript
// Old format
{ name: 'Mossy Rest', category: 'Offer', type: 'Environmental', cost: 1,
  offerPayload: [
    { heal: { resource: 'nerve', amount: 3 } },
    { resource: 'trust', amount: 1, target: 'opponent' },
    { resource: 'rapport', amount: 1, target: 'self' },
  ],
}

// New format
{ name: 'Mossy Rest', category: 'Offer', type: 'Environmental', cost: 1,
  offer: {
    benefit: { resource: 'nerve', amount: 3 },
    cost: { type: 'binding', resource: 'resolve', amount: 1, duration: 2 },
    investment: { trust: 1, rapport: 1 },
  },
}
```

### 3.4 Cost Types

| Cost Type | Description | Example |
|---|---|---|
| **Flat** | Immediate one-time resource loss | -2 resolve |
| **Binding** | Persistent drain over N rounds | -1 resolve/round for 2 rounds |
| **Exposure** | Vulnerability — next incoming Strike of type X deals +N | Next Physical Strike deals +2 |
| **Extraction** | Dungeon gains a permanent benefit | Dungeon: +1 permanent energy next encounter |
| **Dependency** | Benefit reverses if trust drops | If trust drops below current, lose 2× the original heal |

Different cost types support different dungeon identities:

- **Nurturing** favors Flat and Extraction costs — fair trades that build long-term value.
- **Deceptive** favors Binding and Dependency costs — deals that look fair but compound.
- **Tactical** uses context-appropriate costs — Exposure when the party is healthy, Flat when they're desperate.

### 3.5 Acceptance Logic (Simulation)

In the actual game, the player decides. In simulation, the visitor AI evaluates:

**Tier 0 (transparent):** Accept if `benefit_value - cost_value > threshold`, where threshold depends on resource desperation. A party at 3 nerve accepts almost any nerve heal regardless of cost.

**Tier 1 (hidden cost):** Accept based on `benefit_value × trust_factor`, where `trust_factor` scales from 0.4 (trust 3, skeptical) to 0.7 (trust 5, cautiously trusting). The AI assumes the hidden cost is moderate and decides based on whether the visible benefit is worth the expected risk.

**Tier 2 (binding):** Auto-accepted. The dungeon has earned the leverage.

The exact formulas:

```
Tier 0: accept if (benefit_score - cost_score) > desperation_threshold
  desperation_threshold = max(0, 2 - (3 × resource_pressure))
  resource_pressure = count of resources below 40% / total resources

Tier 1: accept if benefit_score × trust_factor > risk_threshold
  trust_factor = 0.3 + (trust × 0.08)
  risk_threshold = 1.5 (lower when desperate)

Tier 2: always accept (Binding Offers)
```

## 4. Trust as Leverage

### 4.1 Trust Tier System

Trust is no longer just a threshold counter. It's a **leverage meter** that unlocks escalating mechanical advantages for the dungeon:

| Tier | Trust Range | Name | Dungeon Capability | Visitor Experience |
|---|---|---|---|---|
| 0 | 0–2 | Strangers | Transparent Offers only | Full information, low acceptance |
| 1 | 3–5 | Familiar | Veiled Offers (hidden costs) | Partial information, gambling |
| 2 | 6–8 | Entrusted | Binding Offers (auto-accept) | Loss of refusal, stronger effects |
| 3 | 9+ | Covenant | Covenant attempt eligible | Final decision: Bond or refuse |

### 4.2 Building Trust

Trust still advances through Offers (+1 per accepted), Tests (+2 on cooperation), and Restraint (+1 for discarding a Strike). The existing per-round promoter cap of +2 still applies.

**New:** Failed Offers at Tier 0 no longer cost -1 Rapport. Instead, they provide +0.5 trust (rounded down, tracked fractionally) — the act of offering, even when refused, demonstrates non-hostility. This prevents the current death spiral where early refusals prevent any trust accumulation.

### 4.3 Trust Decay

Trust is not permanent. If the dungeon plays a Strike (any Strike, not just betrayal-threshold Strikes), trust decays:

- **Trust 1–5:** -1 trust per Strike
- **Trust 6+:** -2 trust per Strike (higher trust is more fragile — one aggressive act shatters deep trust faster)

This creates a real commitment cost. Once the dungeon starts building trust, every Strike card it plays erodes that investment. The dungeon must choose: play this Strike to deal 3 nerve damage, or preserve my trust investment? That's a meaningful tactical decision every turn.

### 4.4 Trust Persistence Across Rooms

Trust carries over between rooms with decay:

- **Room transition:** Trust drops by 2 (the party's guard comes back up in a new environment)
- **Minimum carryover:** Trust floors at 1 if it was ≥ 3 in the previous room (the memory of cooperation persists even with renewed caution)

This makes multi-room Bond possible but expensive. A dungeon that builds to Trust 5 in Room 1 enters Room 2 at Trust 3 (Tier 1) — still in Veiled Offer territory, but not starting from zero. A dungeon that reached Trust 8 enters at Trust 6 — still Tier 2, still has Binding Offers. The investment partially persists.

## 5. Per-Room Bond Outcomes

### 5.1 Current System (Being Replaced)

Bond requires Trust ≥ 12 AND Rapport ≥ 12, checked at end of round. Bond ends the gauntlet as a mutual win condition.

### 5.2 New System: Room-Level Bond

Bond is now a **room-level outcome** triggered by the Covenant mechanic (see Section 6). When Bond occurs in a room, it doesn't end the gauntlet — it **transforms the trajectory.** The specific transformation depends on which room Bond occurred in:

**Bond in Room 1:**
- Visitor recovers 30% of all reducer maximums (significant heal)
- Dungeon gains a permanent Insight marker (+1 to all contested rolls for the rest of the gauntlet, representing knowledge gained from cooperation)
- Trust carries to Room 2 at full value (no transition decay)
- The dungeon may redirect the party to a different Room 2 (design space for room routing)
- Economy: Dungeon earns moderate World Knowledge, visitor earns bonus gold

**Bond in Room 2:**
- Visitor recovers 20% of all reducer maximums
- Dungeon gains 2 Insight markers
- Trust carries to Room 3 at full value
- Economy: Dungeon earns high World Knowledge, visitor earns high gold

**Bond in Room 3 (Final Room):**
- **Full Mutual Bond** — the run ends with the highest-tier cooperative outcome
- Economy: Maximum World Knowledge for dungeon, maximum gold + rare item chance for visitor
- Reputation: Large Hospitality boost, large Lethality decrease
- This is the "true ending" for a nurturing dungeon run

**Bond in ANY Room + Subsequent Betrayal:**
- If the dungeon Bonds in Room 1 then plays aggressively in Room 2, the party enters with high trust but faces a predator with Insight bonuses. This is the ultimate deceptive play — and the party should *fear* it.
- Betrayal after Bond converts ALL accumulated trust to damage (see Section 7) plus the Insight bonus makes the dungeon's Strikes more effective.
- The deceptive dream: Bond Room 1, Betray Room 2, finish in Room 3.

### 5.3 Bond No Longer Requires Dual Threshold

The old system required Trust ≥ 12 AND Rapport ≥ 12. The new system triggers Bond through the Covenant mechanic when Trust reaches Tier 3 (9+). Rapport is removed as a separate tracker — it was always mechanically redundant with Trust (both advanced simultaneously and served the same purpose). Rapport's thematic role ("dungeon's willingness to cooperate") is now expressed through the dungeon's choice to play Offers, Tests, and ultimately Covenant.

**Implication:** The dungeon side no longer has a separate promoter resource to track. The dungeon's "cooperation" is expressed through action (playing Offers/Tests) rather than a number. This simplifies the resource model and makes the dungeon's choice more legible: you can see what the dungeon *does* rather than watching a number tick up.

## 6. The Covenant Mechanic

### 6.1 Covenant: The Bond Finisher

Covenant is a new card subtype available only at Trust Tier 3 (Trust 9+). It represents the dungeon's formal proposal for mutual cooperation — the moment the dungeon says, in effect: *"I could kill you. I'm choosing not to. Here's proof."*

**Covenant cards** are powerful Offers with three distinct properties:

1. **Massive benefit:** The biggest heal or buff in the game (e.g., full restore of lowest reducer resource)
2. **Massive cost:** The biggest commitment (e.g., the dungeon permanently weakens one of its own reducers for this gauntlet)
3. **Bond trigger:** If accepted, the encounter ends with Bond outcome

### 6.2 The Final Decision

When the dungeon plays a Covenant, the party faces the single most important decision in the game:

**Accept:** Bond triggers. Both sides gain the Covenant's effects. The encounter ends. Trust carries forward at full value.

**Refuse:** The Covenant is wasted. Trust crashes by 50% (the rejection of a genuine offer of peace destabilizes the relationship). The dungeon just spent its turn and energy on a card that did nothing. The encounter continues as combat.

The acceptance logic for Covenant is unique:

```
Covenant acceptance = trust_factor × desperation_factor × suspicion_modifier

trust_factor: 0.5 + (trust × 0.04)  // 0.86 at trust 9, 0.90 at trust 10
desperation_factor: 1.0 + (0.3 × resources_below_40%)  // more desperate = more accepting
suspicion_modifier: 0.7 if dungeon played any Strikes this encounter, else 1.0
```

At Trust 9 with no dungeon Strikes this encounter and moderate desperation: ~86% acceptance. At Trust 9 after the dungeon played a Strike earlier: ~60% acceptance. The party remembers aggression.

### 6.3 Covenant Card Design

Each dungeon encounter room should have one Covenant card in its deck — expensive, powerful, and only playable at Trust 9+:

```javascript
{ name: 'Pact of Living Stone', category: 'Offer', subtype: 'Covenant',
  type: 'Environmental', cost: 4,
  covenantRequirement: { minTrust: 9 },
  offer: {
    benefit: { type: 'full_restore', resource: 'lowest_reducer' },
    cost: { type: 'extraction', effect: 'dungeon_insight_2' },
    investment: { trust: 3 },
  },
  bondTrigger: true,
  description: 'The walls part to reveal a sanctum of ancient warmth. The dungeon offers its deepest chamber — and asks only that you remember the way back.',
}
```

### 6.4 Covenant and Deception

A deceptive dungeon reaches Trust 9 through seemingly genuine cooperation. It *could* play the Covenant and Bond. Instead, it plays a Strike — triggering the Betrayal conversion (Section 7). The party trusted the dungeon enough to reach Tier 3, and now all that trust is converted to damage.

The Covenant card's existence in the deck is visible during play — the party knows the dungeon *could* Bond. The tension of watching the dungeon draw that card and choose not to play it is peak deceptive gameplay.

## 7. Betrayal Conversion

### 7.1 Current System

Betrayal triggers when either side Strikes while the opponent has Trust > 3 or Rapport > 3. Both promoters crash by 50%.

### 7.2 New System: Trust-to-Damage Conversion

Betrayal is now a devastating, calculated weapon:

**Trigger:** The dungeon plays a Strike while Trust ≥ 4 (Tier 1+). The dungeon *chooses* to betray — this is not accidental.

**Effect:**
1. The Strike resolves normally (full damage)
2. **Trust Conversion:** Each point of Trust converts to 1 damage applied to the visitor's **lowest reducer** (the resource closest to depletion)
3. Trust resets to 0
4. The visitor gains a **Betrayed** condition: +2 power on all Strikes for 3 rounds (fury response) and all future Offers from this dungeon are auto-refused for the rest of the encounter

**Example:** Trust at 8. Dungeon plays Crushing Grip (3P resolve Strike). The Strike deals its normal damage. Then 8 additional damage hits the visitor's lowest resource (say, nerve at 5 → nerve drops to 0 → Panic). The party that trusted the dungeon is destroyed by that trust.

### 7.3 Betrayal Risk Curve

| Trust at Betrayal | Conversion Damage | Risk Assessment |
|---|---|---|
| 4 | 4 | Moderate — a sharp hit to weakest resource |
| 6 | 6 | Severe — can deplete a resource from half |
| 8 | 8 | Devastating — likely triggers a win condition |
| 10+ | 10+ | Lethal — almost guaranteed immediate win |

This makes Trust a double-edged sword for the visitor. High Trust means better Offers, bigger heals, and access to Covenant/Bond — but also exponentially higher betrayal damage. The party must constantly evaluate: *"Is this dungeon building trust to Bond, or building trust to kill us?"*

### 7.4 Visitor-Side Betrayal

If the visitor plays a Strike while the dungeon is in cooperative mode (Trust ≥ 4), a smaller betrayal triggers:
- Trust crashes to 0
- The dungeon gains **Scorned** condition: +1 to all contested rolls for 3 rounds
- No damage conversion (the visitor doesn't have leveraged trust)

This is asymmetric by design. The dungeon has more to gain from betrayal because it's the one building trust as an investment. The visitor's betrayal is simpler — they just decided to fight instead of cooperate.

## 8. AI Profile Updates

### 8.1 Nurturing AI (Bond Path)

**Current problem:** Plays Offers with weight 3 but also plays Strikes, doesn't understand trust tiers, doesn't save energy for Covenant.

**Redesign priorities:**
- **Phase 1 (Trust 0–2):** Play transparent Offers aggressively. Accept the low acceptance rate. Every refused Offer still contributes +0.5 fractional trust. Play Reshapes for self-sustain. Suppress Strikes entirely — every Strike costs trust.
- **Phase 2 (Trust 3–5):** Switch to Veiled Offers with favorable benefit-to-cost ratios. Build toward Tier 2 through Tests. Save energy for expensive Offers.
- **Phase 3 (Trust 6–8):** Binding Offers extract real value while healing the party. Build energy reserve for Covenant. No Strikes under any circumstances.
- **Phase 4 (Trust 9+):** Play Covenant at first opportunity. Bond.

**Key behavior:** The Nurturing AI never plays Strikes once trust > 0. It accepts attrition from auto-effects and visitor attacks, relying on Reshapes and Binding Offer extraction to sustain itself. This creates a distinctive play pattern that is visibly different from combat dungeons.

### 8.2 Deceptive AI (Trust-and-Betray)

**Current problem:** Has `betrayalThreshold: 8` but betrayal doesn't do much. Plays Strikes alongside Offers, preventing trust accumulation.

**Redesign priorities:**
- **Phase 1 (Trust 0–5):** Mirror Nurturing behavior exactly. Play Offers, suppress Strikes, build trust. The party cannot distinguish Deceptive from Nurturing during this phase. That's the point.
- **Phase 2 (Trust 6–8):** Continue building trust. Play Binding Offers that extract Exposure costs (setting up vulnerability for the betrayal Strike). The party is getting healed but becoming fragile.
- **Betrayal (Trust reaches threshold):** Play the highest-power Strike available. Trust converts to damage. Follow up with aggressive play — the Betrayed condition prevents future Offers, so the dungeon switches to full combat mode.

**Key behavior:** Deceptive and Nurturing are *mechanically identical* until the betrayal moment. The party's only clue is meta-game: what reputation does this dungeon have? What costs were hidden in the Veiled Offers? Did those Binding Offers leave us weaker than expected?

### 8.3 Tactical AI (Adaptive)

The Tactical AI evaluates whether Bond is achievable based on resource states and trust trajectory. If Bond looks viable (party is cooperating, trust is rising, visitor AI is accepting Offers), it shifts to Nurturing-style play. If Bond looks unviable (party is aggressive, trust is stalling), it abandons the cooperative path and fights. It should never betray — that's the Deceptive identity.

### 8.4 Party Visitor AI (Acceptance Behavior)

The visitor AI's Offer acceptance logic needs to account for trust tiers and hidden costs:

- **Low trust (Tier 0):** Evaluate transparent trades rationally. Accept if net benefit exceeds threshold.
- **Mid trust (Tier 1):** Evaluate visible benefit against expected hidden cost. More desperate parties accept more readily.
- **High trust (Tier 2):** Accept automatically (Binding). This represents the party deciding to trust the dungeon — a decision they made at Tier 1 that now has consequences.
- **Covenant (Tier 3):** High acceptance rate scaled by trust, desperation, and whether the dungeon played Strikes this encounter.

## 9. Economy Integration

Bond outcomes now integrate cleanly with the Dual Economy (GDD Section 17):

| Outcome | Dungeon Earns | Visitor Earns | Strategic Value |
|---|---|---|---|
| Kill | High Essence, minimal Knowledge | Nothing | Maximum short-term extraction |
| Break/Panic | Moderate Essence, low Knowledge | Low gold | High extraction, moderate sustainability |
| Survive | Low Essence, low Knowledge | Moderate gold | Low extraction, visitor may return |
| **Bond (Room 1)** | Moderate Knowledge, low Essence | Bonus gold, minor items | Investment — visitor returns with friends |
| **Bond (Room 2)** | High Knowledge, low Essence | High gold, items | Deep investment — dungeon gains sophistication |
| **Bond (Room 3)** | Maximum Knowledge, moderate Essence | Maximum gold, rare items | Full cooperative reward |
| **Bond → Betray** | Moderate Essence + moderate Knowledge | Nothing (dead) | Deceptive extraction — best of both worlds |

The nurturing dungeon trades Essence for Knowledge. Since Knowledge buys sophistication (complex cards, new room templates, tactical flexibility), the nurturing path creates a dungeon that's harder to fight *next time* even though it was gentle *this time*. The party's reward for surviving a nurturing dungeon is gold and items — making *them* stronger too. The meta-game becomes an arms race of escalating sophistication.

The deceptive dungeon gets moderate amounts of both currencies. It's not the best at either extraction path, but it's the only strategy that collects both. The risk is reputation — a dungeon caught betraying faces suspicious parties with high starting refusal rates.

## 10. What Changes vs. What Stays

### 10.1 Removed

- **Rapport** as a separate dungeon promoter resource (trust is now the single cooperative tracker)
- **Dual-threshold Bond** (Trust ≥ 12 AND Rapport ≥ 12) → replaced by Covenant mechanic at Trust 9+
- **Unilateral Offers** (free gifts with no cost to acceptor)
- **Flat betrayal** (50% promoter crash) → replaced by trust-to-damage conversion

### 10.2 Modified

- **Offer resolution** → now transactional with benefit/cost/investment components
- **Trust** → now a tiered leverage system (0–2, 3–5, 6–8, 9+) with mechanical tier effects
- **Betrayal** → now converts trust to targeted damage against lowest reducer
- **Bond win condition** → now per-room via Covenant, not per-gauntlet via threshold
- **Trust/Rapport carry-over** → Trust carries between rooms with -2 decay (Rapport removed)
- **Restraint** → unchanged in function, still +1 trust for discarding a Strike

### 10.3 New

- **Offer cost types** (Flat, Binding, Exposure, Extraction, Dependency)
- **Trust tiers** with visibility rules (Transparent → Veiled → Binding → Covenant)
- **Trust decay** on dungeon Strikes (-1 at low trust, -2 at high trust)
- **Covenant** card subtype (Bond finisher at Trust 9+)
- **Betrayed condition** (+2 power for 3 rounds, auto-refuse all Offers)
- **Scorned condition** (+1 contested rolls for 3 rounds when visitor betrays)
- **Fractional trust** from refused Offers (+0.5)
- **Insight markers** from Bond outcomes (+1 contested roll bonus per marker)
- **Trust decay on room transition** (-2, floor at 1 if previously ≥ 3)

### 10.4 Unchanged

- **Test cards** (prisoner's dilemma mechanic, cooperation/defection)
- **Per-round promoter cap** (+2 per side per round)
- **Restraint action** (discard Strike for +1 own promoter)
- **Seven win conditions** (Kill, Break, Panic, Overcome, Inert, Dominate, Bond)
- **All combat mechanics** (Strikes, Empowers, Disrupts, Counters, Reacts, Traps, Reshapes)

## 11. Implementation Plan

### Phase 1: Single-Room Prototype (Next Sprint)

**Goal:** Get the Offer/Trust/Betrayal loop feeling right in isolation before multi-room complexity.

**Scope:**
- Implement transactional Offer format (benefit + cost + investment)
- Implement trust tiers (visibility rules, Binding at Tier 2)
- Implement trust decay on Strikes
- Implement betrayal conversion (trust → damage to lowest reducer)
- Redesign 2–3 Offer cards per dungeon encounter deck with new format
- Update Nurturing AI for trust-tier-aware play
- Update Deceptive AI for build-then-betray strategy
- Add Covenant card to one encounter deck

**Test scenario:** Verdant Maw vs Drift Symbiote (cooperative visitor, single room). This is the easiest Bond matchup — if Bond doesn't work here, the mechanics need adjustment before testing against parties.

**Success criteria:**
- Nurturing vs Symbiote: Bond rate 40–70% (down from the old 63% — harder but achievable)
- Deceptive vs Symbiote: Betrayal rate 30–50%, Bond rate 5–15%
- Trust reaches Tier 2 in at least 20% of Nurturing games
- Trust reaches Tier 3 (Covenant eligible) in at least 10% of Nurturing games
- Betrayal damage produces decisive outcomes when it fires
- Agency score ≥ 1.0 for Bond-path encounters

### Phase 2: Party Integration

**Goal:** Test the Bond system against intelligent parties that have a choice about whether to cooperate.

**Scope:**
- Update party visitor AI with tier-aware acceptance logic
- Add Offer cards to party decks (cooperative members: Cleric, Druid)
- Test Bond viability against Standard Adventuring Company and Arcane Expedition
- Tune acceptance thresholds for party context (parties are more skeptical than solo visitors)

**Success criteria:**
- Nurturing vs Standard Party: Bond rate 5–20% (rare but achievable)
- Nurturing vs Arcane Party: Bond rate 5–20%
- Deceptive betrayal produces win condition in 60%+ of betrayal attempts
- Survive rate doesn't collapse (parties that refuse cooperation should still have a path)

### Phase 3: Multi-Room Bond

**Goal:** Test per-room Bond in 3-room gauntlets.

**Scope:**
- Implement trust carry-over with decay between rooms
- Implement per-room Bond outcomes (healing, Insight markers, routing)
- Implement Bond-then-Betray deceptive arc
- Create nurturing-themed encounter rooms (not just repurposed aggressive rooms)

**Success criteria:**
- Full-gauntlet Bond (Bond in all 3 rooms) rate: 1–5% (rare, prestigious)
- Room 1 Bond + Room 2/3 combat: produces distinctive play pattern
- Bond-then-Betray arc: trust conversion damage is decisive
- Nurturing produces a visibly different gauntlet experience from other profiles