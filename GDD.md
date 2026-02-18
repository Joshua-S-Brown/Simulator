# GAME DESIGN DOCUMENT

# SHATTERED DUNGEON

*A Dungeon Identity Sim*

> "You are not the hero. You are what the hero fears."
>
> "You are not the dungeon master. You are the dungeon."

**Second Self Studios**

**Design Document v2.1 • February 2026**

*Set in The Shattered Veil*

---

## CHANGES FROM v2.0

Card depth overhaul: all 7 decks redesigned with mechanically distinct cards. Every card now has a unique description and at least one interesting property beyond power + cost. Engine extended with 13 new mechanical capabilities (Drain, Overwhelm, Empower keyword grants, Disrupt thorns/strip/randomize, Counter steal/punish/setup, React conditional-power/absorb/reflect, Strike self-cost, Exhaust). AI updated with keyword-aware card evaluation. Simulation re-validated across all matchups.

## CHANGES FROM v1.8

Expanded card system (9 categories), Bond rework, simulation-validated resource model, bidirectional encounters, AI architecture, Test cards as prisoner's dilemma mechanic.

---

## 1. Executive Summary

Shattered Dungeon is a dungeon identity simulation that puts the player on the other side of the tabletop RPG experience. Instead of playing the adventuring party, you are the dungeon itself—a sentient tear in the boundary between planes that is slowly awakening to consciousness. You design encounters, deploy resources, and make choices that shape not only how visitors experience your dungeon, but who you fundamentally become.

The game combines strategic encounter architecture with round-by-round tactical card play at a depth comparable to Magic: The Gathering. During each encounter, visitors and the dungeon exchange actions in a turn-based sequence with **nine card categories**—Strike, Empower, Disrupt, Counter, React, Trap, Offer, Test, and Reshape—each serving a distinct tactical role. Cards carry keywords, triggered abilities, and activated abilities that produce emergent combos and skill-expressive decisions. The Advantage/Disadvantage system (roll 3d6 keep best or worst 2) creates dramatic swings without arithmetic stacking.

Cards are mechanically distinct within categories—no two Strikes in a deck play the same way. Each card carries at least one keyword, trigger condition, or special mechanic that creates unique board states and combo possibilities. The player asks "which Strike do I play here?" based on board state, not "which Strike has the biggest number." This mechanical depth is validated through simulation across 9,000+ encounters with 15 distinct keywords and conditions firing at meaningful rates.

The dungeon's card choices express identity through a **bidirectional resource system**. Both sides have three targetable reducer resources and one cooperative promoter. The dungeon targets visitor Vitality, Resolve, and Nerve while building Rapport. The visitor targets dungeon Structure, Veil, and Presence while building Trust. The direction of targeting defines what kind of dungeon you become, with seven distinct win conditions emerging from resource trajectories rather than menu selections.

**Genre:** Dungeon Identity Sim / Narrative Roguelike / Strategic Deckbuilder

**Platform:** PC (Steam) primary, with future console consideration

**Target Price:** $15–20 USD

**Engine:** Godot 4

**Development Timeline:** 18–24 months to Early Access; 30–36 months to 1.0

---

## 2. Core Vision & Thesis

**The Elevator Pitch**

You are a sentient dungeon. Things wander inside you. What you do to them—and what you choose not to do—determines who you become. Every encounter is a contested card game between the dungeon and whatever walks through the door. Every card you play is a sentence in the story of what you are.

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

Each side has three **reducer resources** (targeted by the opponent, depleted toward zero for a win condition) and one **promoter resource** (built cooperatively toward Bond). This creates seven distinct win conditions that emerge from resource trajectories rather than being chosen from a menu.

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

Starting values have been validated across 9,000+ simulated encounters. Asymmetric visitor stats create distinct encounter profiles:

| Creature | Vitality | Resolve | Nerve | Trust | Profile |
|----------|:--------:|:-------:|:-----:|:-----:|---------|
| Thornback Boar | 28 | 16 | 16 | 0 | High HP aggressor, targets structure |
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

The card system uses **nine categories** organized into three functional groups. Each category serves a distinct mechanical role that cannot be replicated by another category. Cards follow a universal anatomy standard with Energy costs, Power values, Type alignment, Keywords, conditional Triggers, and unique descriptions that express both narrative and mechanics.

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

Action cards have Energy costs. Energy cards in the deck generate permanent Energy when played. Any action card can be **activated** (discarded) to generate 1 temporary Energy. This creates a meaningful resource management layer: you can sacrifice an action for the energy to play a better one.

Starting hand guarantee: opening hand of 7 always contains at least 2 Energy cards and 3 action cards, with up to 3 mulligans. Target deck ratio: 30–40% Energy cards (4–5 in a 15-card deck).

Energy pools are permanent and grow each round as Energy cards are played. Both sides draw 2 cards per round (minimum hand size 3). Energy refreshes each round (spent energy returns, temporary bonuses expire).

### 4.3 Card Mechanical Depth

Every card must pass the **Description Test**: no two cards in the same category may share a description. If a card's description could be written for another card, it is mechanically identical and must be redesigned. Cards achieve distinction through five mechanical layers:

**Keywords.** On-hit or on-play effects that change the board state. Entangle pins the opponent, Erode creates persistent damage, Drain converts damage to self-healing, Overwhelm spills excess damage to secondary targets, Resonate rewards type-consistent play.

**Triggers.** Conditional bonuses that fire when a specific board state is met. "If visitor is Entangled, +2 Power" rewards setup. "If vitality below half, +2 Power" creates comeback potential. Triggers reward reading board state and create decision points—do I set up the trigger condition first, or go for immediate damage?

**Empower Keyword Grants.** Empower cards can add keywords to the next Strike, not just grant Advantage or +Power. "Next Strike gains Erode" or "Next Strike gains Overwhelm" creates fundamentally different Empower decisions—you choose which keyword you want based on the current situation.

**Disrupt Variants.** Disrupts can inflict Disadvantage, apply thorns (opponent takes damage when striking), strip all keywords from the opponent's next Strike, or randomize the opponent's Strike target. Each creates a different defensive decision.

**Counter Variants.** Counters can remove + chip (standard), steal an Empower for your own use, deal bonus chip if an Empower was removed, apply Entangle to the opponent after removing, or grant yourself Fortify after removing. Each creates different follow-up opportunities.

**React Variants.** Reacts can block with flat power (standard), gain Fortify regardless of success (absorb), reflect damage back on Devastating defense, or have conditional power that scales when a resource is low (desperate defense).

**Risk/Reward.** Some Strikes carry a self-cost (lose your own resource to deal more damage) or Exhaust (removed from the game after one use, not recycled through the deck). These create high-stakes decisions—save the Exhaust card for the perfect moment, or use it now before it's too late?

### 4.4 Card Combo Lines

Distinct mechanical cards create **combo lines**—multi-card sequences where order matters and the combination produces effects neither card produces alone. Each deck supports 2–3 distinct combo lines:

**Setup → Payoff:** Entombing Grasp (Entangle) → Crushing Grip (+2P if Entangled). The first card creates the condition the second card exploits. Playing them in reverse order wastes the trigger.

**Attrition:** Tremor Slam (Erode nerve) into repeated Erode stacking creates persistent damage that bypasses React mitigation and pressures nerve toward Panic. Different from burst damage—slower but harder to stop.

**Sustain:** Veil Siphon (Drain to vitality) converts offensive damage into defensive healing. Changes the math of trading—the Moth deals 2 veil damage AND heals 2 vitality, making 1-for-1 trades favor the Moth.

**Modifier Combos:** Fear Resonance (Empower: +2P and Overwhelm) → Nightmare Surge (already has Overwhelm) creates stacked Overwhelm that annihilates a depleted resource and spills catastrophically to the secondary target.

### 4.5 Test Cards: The Prisoner's Dilemma

Test cards are the primary tactical mechanic for Bond-building. When a Test is played, the opponent must choose to **cooperate** or **defect**. This choice is made probabilistically based on existing Trust and Rapport levels:

*Cooperation chance = min(85%, 40% + (Trust × 5%) + (Rapport × 3%))*

**On cooperation:** Both Trust and Rapport advance (typically +2 each). The test-giver pays an exposure cost—a small amount of reducer damage representing the vulnerability of extending trust. This ensures Bond-building has a real resource cost.

**On defection:** The defector gains a combat advantage (Empower with +2 power on next Strike). Trust and Rapport crash by 50%, potentially wiping out multiple rounds of cooperative investment. This makes every Test a genuine risk.

The Test mechanic creates the core strategic tension of the Bond path: early Tests are risky (low cooperation probability), but each successful Test raises the probability of future cooperation. Building toward Bond requires sustained investment through multiple successful Tests, making it the slowest and riskiest win condition as designed.

### 4.6 Betrayal Mechanic

If either side plays a Strike while the opponent has accumulated cooperative promoter resources (Trust > 3 or Rapport > 3), a **Betrayal** triggers. Both the attacker's and the victim's cooperative promoters crash by 50%. This mechanic prevents hedging—you cannot simultaneously build toward Bond and attack. You must commit to a strategy.

The threshold of > 3 (raised from > 0 in v1.4) prevents false-positive betrayals when visitors start with small Trust values and normal combat Strikes are played before any cooperation is established.

### 4.7 Offer Resolution

Offers bypass contested rolls. When an Offer is played, the opponent evaluates it based on Trust level:

*Acceptance chance = min(90%, 30% + (Trust × 10%))*

Accepted offers deliver their payload (beneficial, harmful, or mixed). Refused offers cost the offerer 1 Rapport—the awkwardness of rejection. Offers can trigger face-down Traps on acceptance, enabling deception combos (Trap → Offer → Trap springs).

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

Each encounter room has bidirectional auto-effects that apply environmental pressure every round (or every other round). These create the encounter's baseline difficulty and thematic identity. Example: Root Hollow applies "visitor vitality -1/round" and "dungeon structure -1/other round." The visitor slowly weakens while the dungeon's walls slowly crack.

### 5.3 Multi-Room Sequences

A run consists of a sequence of 1–3 encounter rooms. Resource states carry over between rooms—a visitor who enters the second room wounded from the first faces compounding pressure. The sequence ends when a terminal win condition is reached (Kill, Break, Panic, Bond) or after all rooms are cleared.

Room progression is determined by outcome: different results in Room 1 route to different Room 2 encounters. This creates branching narrative arcs where a single run tells a complete story.

### 5.4 Escalation

After round 8, both sides take escalating damage each round (starting at 1, increasing by 1 every 2 rounds). This prevents infinite stalling and compresses late-game decisions. Combined with auto-effects and resource carryover, escalation ensures every encounter resolves within 12–15 rounds.

### 5.5 Simulation-Validated Encounter Pacing

Across 9,000+ simulated encounters, the system produces the following pacing profiles:

| Matchup | Avg Rounds | Avg Decisions | Dungeon Win % | Balance Assessment |
|---------|:---:|:---:|:---:|---|
| Boar (aggressive) | 14.7 | 56.9 | 71.5% | Dungeon-favored (intended) |
| Moth (cautious) | 16.2 | 61.5 | 44.8% | Moth-favored (evasive identity) |
| Symbiote (cooperative) | 12.7 | 44.2 | Bond 73% | Bond with tension (intended) |

The Boar's dungeon-favored outcome reflects the design intent: aggressive creatures that lack secondary win conditions and defensive tools should be punished by experienced dungeon play. The Moth's slight visitor-favoring validates that Drain sustain and keyword-stripping create genuine evasive identity—the Moth is hard to kill but vulnerable to psychological warfare (Panic tripled from v2.0 due to Erode nerve pressure). The Symbiote's Bond rate of 73% (down from 98.5% in v1.4) confirms that card mechanical depth creates genuine tension in cooperative encounters without changing any thresholds.

---

## 6. Bond: The Mutual Win Condition

Bond is the most complex, slowest, riskiest, and most rewarding win condition. It requires both promoters at threshold simultaneously: **Trust ≥ 12 AND Rapport ≥ 12**, checked at end of round. Bond represents genuine mutual understanding between dungeon and visitor.

### 6.1 Why Bond Must Be Hard

If Bond were easy or fast, it would dominate every encounter. Why risk combat when you can cooperate to mutual victory? The Bond system uses six interlocking mechanics to ensure Bond requires real investment and carries real risk:

**1. High threshold.** Trust and Rapport must both reach 12. With Offers providing +1 to +2 per play and Tests providing +2 on cooperation, reaching threshold requires 8–12 rounds of dedicated cooperative play. This is longer than most combat encounters resolve.

**2. Vulnerability cost.** Cards that build Trust and Rapport don't defend reducers. Every Test played costs the initiator 1 point of a reducer resource (exposure cost). Offers consume energy that could have been spent on Strikes or Reshapes. Bond-building leaves you mechanically exposed.

**3. Fragile promoters.** Trust and Rapport crash by 50% on betrayal (either side striking during cooperation) or Test defection. One aggressive play after five rounds of cooperation can destroy accumulated progress.

**4. Prisoner's dilemma tension.** Tests present the opponent with a genuine choice: cooperate (both advance) or defect (gain combat advantage at the cost of crashing trust). Neither side can be certain the other will cooperate.

**5. Opportunity cost.** The Betrayal mechanic prevents hedging. You cannot build toward Bond while maintaining an aggressive fallback—any Strike crashes your cooperative progress by 50%. Committing to Bond means genuinely committing.

**6. Per-round promoter cap.** Trust and Rapport gains are capped at +4 per side per round. Even with a perfect draw of multiple Offers and Tests, Bond cannot be rushed through favorable card luck.

### 6.2 Simulation Validation

| Metric | Pre-Rework (v1.0) | Post-Rework (v2.0) | Card Depth (v2.1) | Design Target |
|--------|:---:|:---:|:---:|:---:|
| Bond rate | 100% | 98.5% | 73.4% | 70–90% |
| Average rounds | 2.6 | 10.4 | 12.7 | 8–12 |
| Kill rate | 0% | 1.5% | 26.5% | 10–30% |
| Trust at Bond trigger | 6 | 19 | 19+ | ≥ 12 |
| Test cooperations to Bond | 0 | 2–4 | 2–4 | 2–5 |

The v2.1 Card Depth overhaul brought Bond rate into the design target (73.4%) without changing any thresholds. The increased Kill rate (26.5%) comes from: early defection cascades destroying cooperative momentum, escalation pressure in longer games, and Erode nerve pressure from defensive Strikes during dead turns. Bond encounters now produce genuine multi-round narratives with real tension.

---

## 7. AI Architecture

The game uses a three-tier AI architecture designed to scale from early creature encounters to late-game intelligent visitors.

### 7.1 Heuristic AI (Creature Phase)

Creature visitors use weighted heuristic selection with profile-specific base weights for each card category. The AI evaluates each playable card against the current board state, applying multipliers for strategic mode (aggressive/balanced/defensive/desperate based on win probability), target selection (preferred resources, lethal detection, auto-effect synergy), opponent tracking (React exhaustion, Counter history, active buffs), and combo awareness (Empower-before-Strike ordering, Trap-before-Offer combos).

**Keyword-Aware Scoring (v2.1).** The AI now evaluates card keywords and triggers against current board state. Entangle Strikes are valued higher when the opponent is not already Entangled (setup value). Erode Strikes gain persistent pressure value. Drain Strikes are valued higher when the attacker is damaged (sustain value). Overwhelm Strikes gain bonus value when the target resource is near-depleted (spill potential). Triggers that are currently active (e.g., "If Entangled, +2P" when opponent IS Entangled) receive 1.5× their bonus value. Self-cost Strikes are penalized when the sacrificed resource is low, and Exhaust Strikes are saved for lethal pushes.

Three visitor profiles are defined: Feral Aggressive (Boar—high Strike weight, targets structure/presence, desperate scaling at low vitality), Cautious Explorer (Moth—high Disrupt/Counter weight, targets veil/presence, Drain sustain), and Cooperative (Symbiote—high Offer/Test weight, targets trust, strike-suppressed during cooperation).

Four dungeon profiles are defined: Aggressive (Kill-focused), Nurturing (Bond-focused, strike-suppressed during cooperation), Tactical (balanced, reads board state), and Deceptive (Trust-then-betray, Offer-Trap combos).

### 7.2 Smart AI (Monte Carlo)

Smart AI replaces heuristic scoring with Monte Carlo evaluation. For each playable card, the AI simulates 12 random playouts from the resulting board state and evaluates the final position. This produces measurably different behavior from heuristic AI: in the Boar matchup, Smart AI achieves +7.5% Panic outcomes by correctly identifying nerve as a vulnerable reducer in specific board states.

Smart AI includes a deck tracker that monitors draw probabilities, depleted categories, and opponent card history. The evaluation function assesses position based on resource health ratios, vulnerability detection (opponent's lowest reducer vs. own lowest), and time pressure from escalation.

With the v2.1 card depth overhaul, Smart AI has a richer decision space—keyword combos, trigger conditions, and risk/reward tradeoffs create board states where Monte Carlo evaluation finds fundamentally different lines than heuristic play. The AI ceiling is no longer limited by flat card design.

### 7.3 Cooperative AI Behavior

Cooperative profiles (nurturing dungeon, cooperative visitor) implement **strike suppression**: when the side has accumulated promoter resources above a threshold, Strike cards are hard-suppressed (scored at 0) regardless of other board considerations. This prevents the thematic absurdity of a cooperative creature attacking the dungeon's walls during a bonding encounter.

AI also incorporates Trust-aware Offer evaluation (wary of Offers when traps are detected), Test timing (prefer Tests when cooperation probability is in the 50–80% sweet spot), and Betrayal avoidance (never pivot to aggression once invested in cooperation).

### 7.4 Intelligent Visitor AI (Planned)

The intelligent visitor phase will introduce visitors with their own deck-building, adaptation, and strategic goals. This requires card designs that create fundamentally different board states—established in v2.1 with keyword combos, triggers, and risk/reward mechanics.

Intelligent visitors will need: multi-encounter planning (sacrifice resources in Room 1 to set up Room 2), bluffing and information warfare (face-down Traps, hidden hand contents), adaptive strategy (recognize dungeon identity mid-run and adjust approach), and social intelligence (evaluate Offer sincerity based on dungeon reputation and behavior history).

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

Each deck has a distinct mechanical identity expressed through keyword and combo choices:

| Deck | Cards | Primary Mechanic | Secondary Mechanic | Combo Lines |
|------|:-----:|-----------------|-------------------|-------------|
| **Root Hollow** (dungeon) | 16 | Entangle → Crush combo | Erode attrition + Drain sustain | Entombing Grasp→Crushing Grip (+2P), Tremor Slam Erode stack, Soul Leech sustain |
| **Whispering Gallery** (dungeon) | 15 | Steal Empowers + Erode resolve | Randomize targets | Absorbing Silence steals buffs, Echoing Confusion scrambles aim, Crushing Silence punishes unbuffed |
| **Veil Breach** (dungeon) | 16 | Overwhelm burst + Exhaust alpha | Strip keywords | Fear Resonance→Nightmare Surge Overwhelm, Veil Rend 4P Exhaust, Spatial Distortion strips |
| **Living Root Sanctuary** (dungeon) | 15 | Tests + Offers (Bond path) | Reluctant Strikes + Ward | Trust Trial→Offer pipeline, Protective Thorns weaken at high rapport, Calming Presence grants Ward |
| **Thornback Boar** (visitor) | 15 | Desperate scaling + Overwhelm | Erode + Thorns disruption | Gore +2P at low vitality, Rampaging Charge Overwhelm, Dig In grants Erode, Bellowing Roar thorns |
| **Veil Moth** (visitor) | 15 | Drain sustain + keyword stripping | Erode presence + conditional dodge | Veil Siphon Drain→vitality, Confusing Dust strips keywords, Spectral Dodge Power 3 when desperate |
| **Drift Symbiote** (visitor) | 15 | Tests + Offers (Bond path) | Trust-scaled Strikes + Ward | Symbiotic Probe→Mutual Nourishment pipeline, Psychic Prod +1P at high trust, Harmonize grants Ward |

### 8.3 Opening Hand Guarantee

Opening hand of 7 cards. Must contain at least 2 Energy cards and 3 action cards. Up to 3 mulligans allowed. With 4–5 Energy cards in a 15-card deck, the guarantee fires on the first draw approximately 85% of the time.

### 8.4 Card Activation

Any action card can be activated (discarded) to generate 1 temporary Energy. This means you are never truly stuck—you can sacrifice an action you don't need for the energy to play one you do. This is a meaningful tradeoff, not a free solution. Activation makes dead cards into live energy and introduces hand management decisions: hold a situational card for later, or activate it now to power a stronger play?

---

## 9. Keywords & Conditions

| Keyword | Effect | Applied By | Duration |
|---------|--------|-----------|----------|
| **Entangle** | Target cannot flee until their next turn | Strikes, Counters, Traps | Clears on target's turn start |
| **Erode** | Target loses 1 of specified resource next round | Strikes, Empowers (grant) | 1 round (suppressed if matches auto-effect) |
| **Drain** | Damage dealt converts to self-healing (capped at 2) | Strikes, Empowers (grant) | Immediate on hit |
| **Overwhelm** | Excess damage spills to secondary resource when target depleted | Strikes, Empowers (grant) | Immediate on hit |
| **Resonate** | If same Type as last card played, +1 power | Strikes | Immediate (checked on play) |
| **Ward** | Reduce next incoming damage by ward amount | Empowers (grant), Reshapes | 1 round |
| **Fortify** | Reduce incoming damage to specified resource | Counters (setup), Reacts (absorb), Reshapes | 1–2 rounds |
| **Exhaust** | Card removed from game after use (not recycled) | Strikes | Permanent (one use) |

**Conditions (applied by Disrupt cards):**

| Condition | Effect | Applied By | Duration |
|-----------|--------|-----------|----------|
| **Disadvantage** | Roll 3d6 keep lowest 2 on next Strike | Disrupt | Consumed on next Strike |
| **Thorns** | Take N damage to specified resource when next striking | Disrupt | Consumed on next Strike |
| **Strip Keywords** | Next Strike loses all keywords | Disrupt | Consumed on next Strike |
| **Randomize Target** | Next Strike hits random resource instead of chosen | Disrupt | Consumed on next Strike |

**Counter Secondary Effects:**

| Effect | Description | Applied By |
|--------|------------|-----------|
| **Steal** | Captured Empower becomes your own | Absorbing Silence |
| **Punish** | Bonus chip damage if removed condition was Empower | Echoing Rebuke |
| **Setup (Entangle)** | Apply Entangle after removal | Root Snag |
| **Setup (Fortify)** | Gain Fortify after removal | Bark Shield, Phase Shift |

**Erode Suppression Rule:** Erode does not stack with auto-effects targeting the same resource. If the encounter's auto-effect already damages visitor vitality, an Erode on vitality is suppressed. This prevents double-counting and forces strategic targeting of resources the environment isn't already pressuring.

**Trigger System:** Cards can carry conditional triggers: "If [condition], [bonus effect]." Conditions include: opponent has specific condition (e.g., Entangled), self resource below percentage (e.g., vitality ≤ 50%), opponent resource above threshold, and discard pile card count. Triggers reward reading the board state and create setup → payoff decision trees.

---

## 10. Simulation-Validated Findings

The following findings are derived from 9,000+ simulated encounters across three matchups, validated at 3,000 iterations for statistical stability.

### 10.1 Encounter Pacing

Target encounter length of 6–10 meaningful rounds is achieved. Average rounds range from 12.7 (cooperative Bond encounters) to 16.2 (contested multi-room combat). Average decisions per encounter range from 44 (cooperative) to 62 (combat), producing 3–4 meaningful decisions per round per side.

### 10.2 Win Condition Distribution

All seven win conditions fire at non-trivial rates across the matchup matrix. Kill is the most common dungeon win (18–56%), with Break (3–9%) and Panic (16–27%) as viable secondary paths. Visitor outcomes include Survive (25–47%), Overcome (3–8%), Dominate (5%), and Inert (22–27% in Moth matchup). Bond triggers 73% in dedicated cooperative scenarios.

### 10.3 Momentum Dynamics

Encounters show dynamic momentum shifts rather than one-sided domination. In the Boar matchup, the visitor leads early (rounds 1–3) before the dungeon's Entangle combos and Erode pressure pull ahead by rounds 4–6. In the Moth matchup, the visitor maintains a consistent edge through Drain sustain (Veil Siphon heals vitality from veil damage) while the dungeon's Erode and Overwhelm mechanics drive nerve toward Panic. In the Symbiote matchup, both sides remain healthy throughout (90%+ health for 8+ rounds), with resource investment going into promoters rather than reducer combat, but escalation creates genuine late-game pressure.

### 10.4 Carryover Effects

Multi-room carryover produces dramatic narrative arcs. In validated 3-room sequences, the visitor enters the final room with single-digit stats on multiple resources after accumulated combat. Late-room encounters feel genuinely different from early-room encounters due to resource compression, creating emergent storytelling through mechanical state.

### 10.5 Bond System Validation

Bond requires genuine commitment and produces authentic tension. The cooperative matchup (Symbiote) achieves Bond 73.4% of the time (within the 70–90% design target), with 26.5% Kill as a real alternative outcome. Bond encounters average 12.7 rounds with defection setbacks, refused Offers, Restraint actions filling dead turns, and escalation creating late-game urgency.

### 10.6 Card Depth Impact

The v2.1 card depth overhaul produced measurable changes across all matchups without modifying any threshold values, auto-effects, or starting resources:

| Matchup | Key Change | Cause |
|---------|-----------|-------|
| Boar: Break 12% → 3% | Dungeon now has Entangle combos and Fortify from counters that slow the Boar's structure assault | Card mechanics, not numbers |
| Boar: Panic 9% → 16% | Erode keyword on Tremor Slam creates persistent nerve pressure independent of direct Strikes | New keyword application |
| Moth: Kill 43% → 18% | Moth Drain sustain (Veil Siphon heals vitality from veil damage) makes it genuinely hard to kill | Drain mechanic creating sustain loop |
| Moth: Panic 8% → 27% | Dungeon Erode and Overwhelm drive nerve damage through new mechanical paths | Overwhelm spill to nerve |
| Symbiote: Bond 98% → 73% | Card mechanics create real setback potential during cooperation (defections, refused offers, Erode pressure) | Card depth creating tension |

---

## 11. Open Questions & Next Steps

### 11.1 Resolved from v1.8

**Card Categories:** Expanded from 5 to 9. Trap, Offer, Test, and Reshape add four mechanical verbs that enable deception, cooperation, prisoner's dilemma, and environment manipulation. Validated through simulation.

**Bidirectional Resources:** Both sides now have targetable resources rather than the dungeon being an untargetable force. Creates symmetric strategic depth.

**Bond Pacing:** Resolved through threshold increase, Test cards, Betrayal mechanic, Offer payload reduction, per-round promoter cap (+4), and Restraint action. Bond is now the slowest win condition as intended.

**Energy System (Design Committed).** Mana-like resource with deck-integrated Energy cards, Energy costs on all action cards, activation as emergency energy, and opening hand guarantees. Design is locked. Simulation currently uses a simplified 2-card-per-round model and does not yet enforce Energy costs or pool management. Full Energy implementation is folded into the AI combo sequencing work (see 11.3).

### 11.2 Resolved from v2.0

**Card Design Depth.** All 7 decks redesigned with mechanically distinct cards. Every card passes the Description Test (no two cards in the same category share a description). 15 keywords and conditions defined. Triggers, keyword grants, Disrupt variants, Counter variants, and React variants create distinct combo lines per deck. Validated through simulation—card depth directly impacted win condition distributions without changing any threshold values.

**Symbiote Tension.** Bond rate dropped from 98.5% to 73.4% purely through card mechanical depth creating genuine setback potential during cooperation. No threshold adjustments needed.

### 11.3 Remaining Open Questions

**AI Combo Sequencing & Energy Implementation (Priority).** The AI scores cards independently and does not sequence combos—it may play a triggered Strike before its setup card, wasting the trigger bonus. The card depth overhaul only produces its intended tactical variety if plays get ordered correctly. This work also includes implementing the Energy cost system in the simulation: replacing the 2-card-per-round simplification with actual Energy pool management, Energy card plays, and activation decisions. Both touch the same card-selection logic and should ship together.

**Symbiote Parasitism Mechanic.** The Symbiote's cooperation currently has no hidden cost. Adding a corruption or parasitism mechanic where Symbiote cooperation slowly drains a dungeon resource would create genuine cost/benefit tension during Bond-building. Design needed, not yet prototyped.

**Cooperative Deck Diversity.** Restraint fills some dead turns during cooperation, but Rounds 3–4 can still have minimal activity when waiting for Offer/Test cards to cycle from discard. Connected to card design—adding 2–3 cards per cooperative deck that aren't Offers/Tests but contribute to Bond (e.g., Commune category for low-cost trust building) would address this.

**Intelligent Visitor Design.** Creature-phase AI validates systems and pacing. Intelligent visitors require cards and AI that stress-test combinatorial depth: multi-encounter planning, bluffing, adaptation, and social intelligence.

**Deception Path Testing.** The deceptive dungeon profile (Trust-then-betray, Offer-Trap combos) exists in AI profiles but has not been validated through dedicated scenario testing. The deceptive tree narrative from the Card Redesign Synthesis needs a full encounter simulation.

**Cognitive Load.** Nine card categories, multi-card turns, reaction timing, keywords, triggers, and persistent conditions are substantially complex. Progressive introduction (Strike + Empower + Energy first, then Disrupt/Counter/React, then Trap/Offer/Test/Reshape, then keywords/triggers) should mitigate this, but paper playtest must verify.

**Emotional States.** The Card Redesign Synthesis describes visitor emotional states (Enraged from betrayal, Cautious from trap awareness, Grateful from beneficial offers) that modify AI behavior qualitatively. Not yet designed in detail.

**Environmental Hazards During Cooperation.** Adding threats that pressure both sides during cooperative encounters would increase tension—the dungeon and visitor must cooperate while the environment works against them both.

---

## 12. Scope & Development Roadmap

**Phase 1 (Months 1–6): Core Loop.** Card engine with 9 categories, encounter system, turn-based resolution, Energy system, 3 base encounters, 3 creature visitors, economy, attribute growth. Simulation engine for validation. *Status: Card system validated with mechanical depth. 15 keywords/conditions, triggers, keyword grants, Disrupt/Counter/React variants designed. 7 decks with distinct combo lines. Energy system designed but not yet validated in simulation (see 11.3).*

**Phase 2 (Months 7–12): Content & Polish.** 5 base encounters with morph paths, 5 creature visitors, companion cards, card evolution, architecture branching. Deception scenario validation. Parasitism mechanic for cooperative encounters.

**Phase 3 (Months 13–18): Intelligent Visitors.** Tier 1–2 visitor templates with modular deck construction, narrative framework, Veil crafting, offering market. This phase stress-tests card design depth. Early Access launch.

**Phase 4 (Months 19–24): Challenge Mode & Endgame.** Player-vs-player Challenge Mode (human controls visitor side), Tier 3 visitors, advanced encounter designs, scoring system. Balance passes.

**Phase 5 (Months 25–36): 1.0 & Beyond.** Full content pass, modding support, additional morph paths, community-designed encounters.

---

## 13. Design Principles (Commitments)

These 15 principles guide all card and system design decisions. They are not aspirational—they are constraints that every card must satisfy.

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

### 13.1 Description Test (v2.1 Addition)

**A card is mechanically distinct if and only if its description cannot be written for any other card in the same category.** This test is the operational enforcement of Principle #1. Every card in the current decks passes this test. If a redesign or new card fails the Description Test, it must be revised before entering the card pool.