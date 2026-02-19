# GAME DESIGN DOCUMENT

# SHATTERED DUNGEON

*A Dungeon Identity Sim*

> "You are not the hero. You are what the hero fears."
>
> "You are not the dungeon master. You are the dungeon."

**Second Self Studios**

**Design Document v2.3 • February 2026**

*Set in The Shattered Veil*

---

## CHANGES FROM v2.1

Energy system fully implemented: mana-like resource with 4 energy card types (Standard, Surge, Attune, Siphon), energy costs on all action cards (0-3), card activation as emergency energy generation, opening hand guarantees. AI combo sequencer built: plans Surge burst turns, sequences Attune discounts, evaluates Siphon conditions, manages energy budgets for multi-card combos. Balance patch v2.3: deck card rebalancing (Root Hollow strike retargeting, cost adjustments), visitor stat calibration (Boar resolve/nerve 16→14), encounter auto-effect tuning (Root Hollow nerve drain). All three primary win conditions now hit design targets across the Boar matchup. Deck specialization philosophy established and validated through simulation.

## CHANGES FROM v2.0

Card depth overhaul: all 7 decks redesigned with mechanically distinct cards. Every card now has a unique description and at least one interesting property beyond power + cost. Engine extended with 13 new mechanical capabilities (Drain, Overwhelm, Empower keyword grants, Disrupt thorns/strip/randomize, Counter steal/punish/setup, React conditional-power/absorb/reflect, Strike self-cost, Exhaust). AI updated with keyword-aware card evaluation. Simulation re-validated across all matchups.

## CHANGES FROM v1.8

Expanded card system (9 categories), Bond rework, simulation-validated resource model, bidirectional encounters, AI architecture, Test cards as prisoner's dilemma mechanic.

---

## 1. Executive Summary

Shattered Dungeon is a dungeon identity simulation that puts the player on the other side of the tabletop RPG experience. Instead of playing the adventuring party, you are the dungeon itself—a sentient tear in the boundary between planes that is slowly awakening to consciousness. You design encounters, deploy resources, and make choices that shape not only how visitors experience your dungeon, but who you fundamentally become.

The game combines strategic encounter architecture with round-by-round tactical card play at a depth comparable to Magic: The Gathering. During each encounter, visitors and the dungeon exchange actions in a turn-based sequence with **nine card categories**—Strike, Empower, Disrupt, Counter, React, Trap, Offer, Test, and Reshape—each serving a distinct tactical role. Cards carry keywords, triggered abilities, and activated abilities that produce emergent combos and skill-expressive decisions. The Advantage/Disadvantage system (roll 3d6 keep best or worst 2) creates dramatic swings without arithmetic stacking.

Cards are mechanically distinct within categories—no two Strikes in a deck play the same way. Each card carries at least one keyword, trigger condition, or special mechanic that creates unique board states and combo possibilities. The player asks "which Strike do I play here?" based on board state, not "which Strike has the biggest number." This mechanical depth is validated through simulation across 10,000+ encounters with 15 distinct keywords and conditions firing at meaningful rates.

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

Action cards have Energy costs (0-3). Energy cards in the deck generate permanent Energy when played. Any action card can be **activated** (discarded) to generate 1 temporary Energy. This creates a meaningful resource management layer: you can sacrifice an action for the energy to play a better one.

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

Each encounter room has bidirectional auto-effects that apply environmental pressure every round (or every other round). These create the encounter's baseline difficulty and thematic identity. Auto-effects are the most stable balance anchor in the system because they persist regardless of deck customization.

Example: Root Hollow applies "visitor vitality -1/round," "visitor nerve -1/other round," and "dungeon structure -1/other round." The visitor weakens physically while the oppressive environment frays their courage, and the dungeon's walls slowly crack. The nerve drain creates passive Panic pressure without requiring the deck to carry nerve-targeting strikes, demonstrating how auto-effects can support secondary win conditions independent of deck composition.

### 5.3 Multi-Room Sequences

A run consists of a sequence of 1–3 encounter rooms. Resource states carry over between rooms—a visitor who enters the second room wounded from the first faces compounding pressure. The sequence ends when a terminal win condition is reached (Kill, Break, Panic, Bond) or after all rooms are cleared.

Room progression is determined by outcome: different results in Room 1 route to different Room 2 encounters. This creates branching narrative arcs where a single run tells a complete story.

**Encounter ordering is the dungeon player's primary strategic expression.** The sequence of rooms defines the dungeon's approach to each visitor: a predatory dungeon might run Root Hollow → Whispering Gallery → Veil Breach (weaken physically, then break their will, then terrify the survivors). A deceptive dungeon might run a trust-building room first followed by an aggressive closer (lull them into false safety, then strike). The rooms are the building blocks; the sequence is the strategy. Each room brings its own aligned deck, so the encounter sequence also determines which card pools the dungeon draws from across the full run (see Section 15: Dungeon Strategic Architecture).

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

The Boar's dungeon-favored outcome reflects the design intent: aggressive creatures that lack secondary win conditions and defensive tools should be punished by experienced dungeon play. Importantly, the dungeon's 88% win rate includes three distinct paths (Kill 55%, Panic 22%, Break 12%) rather than concentrating on a single win condition. The Moth's evasive identity is validated by Drain sustain making it genuinely hard to kill, while the dungeon's Erode and Overwhelm mechanics drive nerve toward Panic. The Symbiote's Bond rate of 63% (down from 98.5% in v1.4) confirms that card mechanical depth creates genuine tension in cooperative encounters.

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

| Metric | Pre-Rework (v1.0) | Post-Rework (v2.0) | Card Depth (v2.1) | Energy (v2.3) | Design Target |
|--------|:---:|:---:|:---:|:---:|:---:|
| Bond rate | 100% | 98.5% | 73.4% | 63.2% | 65–80% |
| Average rounds | 2.6 | 10.4 | 12.7 | 12.9 | 8–15 |
| Kill rate | 0% | 1.5% | 26.5% | 36.8% | 10–30% |
| Trust at Bond trigger | 6 | 19 | 19+ | 19+ | ≥ 12 |
| Test cooperations to Bond | 0 | 2–4 | 2–4 | 2–4 | 2–5 |

The energy system further increased Kill rate (36.8%) by creating turns where cooperative cards are unaffordable, forcing Restraint or exposing the Symbiote to escalation pressure. Bond rate at 63.2% is slightly below the 65–80% target and may benefit from future tuning of the cooperative deck or Symbiote stats.

---

## 7. AI Architecture

The game uses a three-tier AI architecture designed to scale from early creature encounters to late-game intelligent visitors.

### 7.1 Heuristic AI (Creature Phase)

Creature visitors use weighted heuristic selection with profile-specific base weights for each card category. The AI evaluates each playable card against the current board state, applying multipliers for strategic mode (aggressive/balanced/defensive/desperate based on win probability), target selection (preferred resources, lethal detection, auto-effect synergy), opponent tracking (React exhaustion, Counter history, active buffs), and combo awareness (Empower-before-Strike ordering, Trap-before-Offer combos).

**Keyword-Aware Scoring (v2.1).** The AI evaluates card keywords and triggers against current board state. Entangle Strikes are valued higher when the opponent is not already Entangled (setup value). Erode Strikes gain persistent pressure value. Drain Strikes are valued higher when the attacker is damaged (sustain value). Overwhelm Strikes gain bonus value when the target resource is near-depleted (spill potential). Triggers that are currently active (e.g., "If Entangled, +2P" when opponent IS Entangled) receive 1.5× their bonus value. Self-cost Strikes are penalized when the sacrificed resource is low, and Exhaust Strikes are saved for lethal pushes.

**Energy-Aware Combo Sequencing (v2.2).** The AI combo sequencer (ai/combo-sequencer.js) plans energy-aware turn sequences for both dungeon and visitor. It evaluates all energy subsets to find optimal investment, sequences Attune before matching cards, plans Surge for burst turns, checks Siphon conditions, and manages energy budgets for multi-card combos like Empower→Strike. Both heuristic AI profiles call planTurn() through this module.

Three visitor profiles are defined: Feral Aggressive (Boar—high Strike weight, targets structure/presence, desperate scaling at low vitality), Cautious Explorer (Moth—high Disrupt/Counter weight, targets veil/presence, Drain sustain), and Cooperative (Symbiote—high Offer/Test weight, targets trust, strike-suppressed during cooperation).

Four dungeon profiles are defined: Aggressive (Kill-focused), Nurturing (Bond-focused, strike-suppressed during cooperation), Tactical (balanced, reads board state), and Deceptive (Trust-then-betray, Offer-Trap combos).

### 7.2 Smart AI (Monte Carlo)

Smart AI replaces heuristic scoring with Monte Carlo evaluation. For each playable card, the AI simulates 12 random playouts from the resulting board state and evaluates the final position. This produces measurably different behavior from heuristic AI: in the Boar matchup, Smart AI achieves +7.5% Panic outcomes by correctly identifying nerve as a vulnerable reducer in specific board states.

Smart AI includes a deck tracker that monitors draw probabilities, depleted categories, and opponent card history. The evaluation function assesses position based on resource health ratios, vulnerability detection (opponent's lowest reducer vs. own lowest), and time pressure from escalation.

With the v2.1 card depth overhaul, Smart AI has a richer decision space—keyword combos, trigger conditions, and risk/reward tradeoffs create board states where Monte Carlo evaluation finds fundamentally different lines than heuristic play. The AI ceiling is no longer limited by flat card design. Smart AI does not yet use the combo sequencer (planned integration).

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
| **Root Hollow** (dungeon) | 18 | Entangle → Crush combo | Erode attrition + Drain sustain | Entombing Grasp→Crushing Grip (+2P, resolve), Tremor Slam Erode nerve, Soul Leech nerve+drain |
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

### 8.5 Deck Customization & the Generic Card Pool

Each encounter room comes with an **aligned deck** — a default 15–18 card deck that expresses the room's mechanical identity and is optimized for its auto-effects and thematic purpose. These aligned decks are what the simulation validates and what new players use out of the box.

The dungeon player customizes encounter decks by swapping cards from a **generic card pool** — a shared collection of cards not tied to any specific encounter. Generic cards are mechanically sound but not optimized for any particular room's auto-effects or combo lines. Swapping in a generic Trap card to a nurturing deck gives the player a deceptive option the default deck doesn't offer; slotting in an extra Reshape gives a combat deck more sustain than its designer intended.

**Customization constraints:**

- **Core slots are locked.** Each aligned deck designates a subset of cards (typically 8–10) as core to the room's identity. These cannot be swapped out. Root Hollow's Entangling Grasp and Crushing Grip form a combo line that defines the room — removing either breaks the identity.
- **Flex slots are open.** The remaining 5–8 cards can be replaced with generic pool cards or cards from other encounter decks the dungeon has unlocked. This is where player expression lives.
- **Deck size is fixed.** Swapping is 1-for-1 replacement, not addition. The 15–18 card deck size is tuned for draw consistency and opening hand guarantees.
- **Energy card ratio must be maintained.** At least 3 Energy cards must remain in any customized deck to preserve the opening hand guarantee system.

This model means players inherit a strong, functional default from each encounter and make targeted modifications (2–5 card swaps) to express their personal strategy. They never face a blank 16-card template. The aligned decks are the floor; customization raises the ceiling.

The dungeon's full card pool across a 3-room run is the union of its three encounter decks (45–50 cards total), with flex slots allowing the player to tune each room's approach without breaking the room's core identity (see Section 15: Dungeon Strategic Architecture).

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

The Moth's Drain sustain (Veil Siphon heals vitality from veil damage) makes it genuinely hard to kill, creating a moth-favored matchup where Survive is the most common outcome. The dungeon's Erode and Overwhelm mechanics drive nerve toward Panic as the primary dungeon win path. Root Hollow's nerve auto-drain compounds in Room 3, producing 12% Panic in the final encounter.

### 10.4 Momentum Dynamics

Encounters show dynamic momentum shifts rather than one-sided domination. In the Boar matchup, the dungeon leads from round 1 due to auto-effects, with the advantage accelerating through mid-game as Entangle combos and Erode pressure compound. The Boar enters Whispering Gallery at roughly 55% health on average, creating genuine late-game tension. In the Moth matchup, the visitor maintains a consistent edge through Drain sustain while the dungeon applies persistent nerve pressure. In the Symbiote matchup, both sides remain healthy throughout (90%+ health for 8+ rounds), with resource investment going into promoters rather than reducer combat, but escalation creates genuine late-game pressure.

### 10.5 Carryover Effects

Multi-room carryover produces dramatic narrative arcs. In validated 3-room sequences, the visitor enters the final room with averaged health around 30–40%, with nerve and resolve significantly softened by earlier rooms' auto-effects and card damage. Late-room encounters feel genuinely different from early-room encounters due to resource compression, creating emergent storytelling through mechanical state.

### 10.6 Bond System Validation

Bond requires genuine commitment and produces authentic tension. The cooperative matchup (Symbiote) achieves Bond 63.2% of the time, with 36.8% Kill as a real alternative outcome. Bond encounters average 12.9 rounds with defection setbacks, refused Offers, Restraint actions filling dead turns, and escalation creating late-game urgency. The Bond rate is slightly below the 65–80% design target and may benefit from future tuning of the cooperative deck or Symbiote stats.

### 10.7 Energy System Impact

The energy system (v2.2) transformed encounter dynamics:

| Metric | Pre-Energy | Post-Energy |
|--------|:---:|:---:|
| Cards played per turn | ~3 | ~2 |
| Avg rounds (Boar) | 6.8 | 13.8 |
| Strategic depth | Dump hand | Plan energy budget, sequence combos |

Energy reduced raw throughput but created meaningful resource management decisions every turn: invest in permanent pool growth vs. burst with Surge, sequence Attune for discounts, evaluate Siphon conditions, decide whether to activate cards for emergency energy. The combo sequencer (ai/combo-sequencer.js) handles these decisions for AI opponents.

### 10.8 Card Depth Impact

The v2.1 card depth overhaul produced measurable changes across all matchups without modifying any threshold values, auto-effects, or starting resources:

| Matchup | Key Change | Cause |
|---------|-----------|-------|
| Boar: Break 12% → 3% | Dungeon now has Entangle combos and Fortify from counters that slow the Boar's structure assault | Card mechanics, not numbers |
| Boar: Panic 9% → 16% | Erode keyword on Tremor Slam creates persistent nerve pressure independent of direct Strikes | New keyword application |
| Moth: Kill 43% → 18% | Moth Drain sustain (Veil Siphon heals vitality from veil damage) makes it genuinely hard to kill | Drain mechanic creating sustain loop |
| Moth: Panic 8% → 27% | Dungeon Erode and Overwhelm drive nerve damage through new mechanical paths | Overwhelm spill to nerve |
| Symbiote: Bond 98% → 73% | Card mechanics create real setback potential during cooperation (defections, refused offers, Erode pressure) | Card depth creating tension |

### 10.9 Balance Methodology

Three rounds of AI scoring changes (combo sequencer integration, energy investment scaling, target selection rewrites) produced zero movement on win condition diversity. The breakthrough came from data-level changes: deck card retargeting, cost adjustments, visitor stat calibration, and encounter auto-effects. Key learning: when AI is making correct decisions but outcomes are wrong, the problem is game data, not AI logic. Balance levers should be applied from narrowest scope (encounter auto-effects) to broadest (visitor stats), using the narrowest lever that solves the problem.

---

## 11. Open Questions & Next Steps

### 11.1 Resolved from v1.8

**Card Categories:** Expanded from 5 to 9. Trap, Offer, Test, and Reshape add four mechanical verbs that enable deception, cooperation, prisoner's dilemma, and environment manipulation. Validated through simulation.

**Bidirectional Resources:** Both sides now have targetable resources rather than the dungeon being an untargetable force. Creates symmetric strategic depth.

**Bond Pacing:** Resolved through threshold increase, Test cards, Betrayal mechanic, Offer payload reduction, per-round promoter cap (+4), and Restraint action. Bond is now the slowest win condition as intended.

### 11.2 Resolved from v2.0

**Card Design Depth.** All 7 decks redesigned with mechanically distinct cards. Every card passes the Description Test (no two cards in the same category share a description). 15 keywords and conditions defined. Triggers, keyword grants, Disrupt variants, Counter variants, and React variants create distinct combo lines per deck. Validated through simulation—card depth directly impacted win condition distributions without changing any threshold values.

**Symbiote Tension.** Bond rate dropped from 98.5% to 73.4% purely through card mechanical depth creating genuine setback potential during cooperation. No threshold adjustments needed.

### 11.3 Resolved from v2.1

**Energy System.** Fully implemented with 4 energy card types (Standard, Surge, Attune, Siphon), costs 0–3 on all action cards, card activation as emergency energy, and opening hand guarantees (2+ Energy cards in hand of 7). Energy creates meaningful resource management decisions without paralyzing play. Pool starts at 2, grows through Energy card plays.

**AI Combo Sequencing.** The combo sequencer (ai/combo-sequencer.js) plans energy-aware turn sequences for both dungeon and visitor AI. It evaluates all energy subsets to find optimal investment, sequences Attune before matching cards, plans Surge for burst turns, checks Siphon conditions, and manages energy budgets for multi-card combos like Empower→Strike. Both heuristic AI profiles call planTurn() through this module.

**Win Condition Diversity.** The energy system initially collapsed secondary win conditions (Break 12%→1.1%, Panic 16%→4.8%) by reducing card throughput while auto-effects still favored vitality damage. Three rounds of AI tuning produced zero improvement, identifying this as a game data problem, not an AI problem. The balance patch (v2.3) resolved it through: deck card retargeting (Crushing Grip→resolve), cost reductions (Soul Leech cost 3→2, Crushing Silence cost 3→2), visitor stat calibration (Boar resolve/nerve 16→14), and encounter auto-effect tuning (Root Hollow nerve -1/other round). All three primary win conditions now hit design targets.

### 11.4 Remaining Open Questions

**Deception Path Testing.** The deceptive dungeon profile (Trust-then-betray, Offer-Trap combos) exists in AI profiles but has not been validated through dedicated scenario testing. Needs a deceptive encounter scenario and potentially a new deceptive dungeon deck.

**Smart AI + Combo Sequencer Integration.** The Monte Carlo AI (ai/smart-ai.js) exists but does not yet use the combo sequencer. Integration would provide the strongest possible opponent AI and establish a performance ceiling for the card system's tactical depth.

**Expanded Creature Content.** The GDD targets 5 creature visitors for Phase 2. Currently 3 are implemented (Boar, Moth, Symbiote). 2 more visitors with different stat profiles would validate that the balance framework generalizes beyond the initial matchups.

**Symbiote Parasitism Mechanic.** The Symbiote's cooperation currently has no hidden cost. Adding a corruption or parasitism mechanic where Symbiote cooperation slowly drains a dungeon resource would create genuine cost/benefit tension during Bond-building. Design needed, not yet prototyped.

**Cooperative Deck Diversity.** Restraint fills some dead turns during cooperation, but mid-game can still have minimal activity when waiting for Offer/Test cards to cycle from discard. Adding 2–3 cards per cooperative deck that contribute to Bond without being Offers/Tests would address this.

**Intelligent Visitor Design.** Creature-phase AI validates systems and pacing. Intelligent visitors require modular deck construction, multi-encounter planning, adaptation, social intelligence, and potentially party mechanics. This is the Phase 3 milestone and the largest remaining system expansion. Key design decisions: solo vs party, deck construction model, information model, persistence, and player agency level.

**Cognitive Load.** Nine card categories, multi-card turns, reaction timing, keywords, triggers, and persistent conditions are substantially complex. Progressive introduction (Strike + Empower + Energy first, then Disrupt/Counter/React, then Trap/Offer/Test/Reshape, then keywords/triggers) should mitigate this, but paper playtest must verify.

**Emotional States.** The Card Redesign Synthesis describes visitor emotional states (Enraged from betrayal, Cautious from trap awareness, Grateful from beneficial offers) that modify AI behavior qualitatively. Not yet designed in detail.

**Environmental Hazards During Cooperation.** Adding threats that pressure both sides during cooperative encounters would increase tension—the dungeon and visitor must cooperate while the environment works against them both.

---

## 12. Scope & Development Roadmap

**Phase 1 (Months 1–6): Core Loop.** Card engine with 9 categories, encounter system, turn-based resolution, Energy system, 3 base encounters, 3 creature visitors, economy, attribute growth. Simulation engine for validation. *Status: Card system validated with mechanical depth. 15 keywords/conditions, triggers, keyword grants, Disrupt/Counter/React variants designed. 7 decks with distinct combo lines. Energy system fully implemented and validated. AI combo sequencer operational.*

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

---

## 14. Deck Specialization & Balance Framework

### 14.1 Core Principle

Each dungeon deck specializes in one primary win condition, similar to how MTG color identities define what a deck fundamentally excels at and where it's deliberately weak. Decks are NOT designed for balanced coverage across all win conditions. Outcome diversity emerges from **multi-room sequences** where visitors encounter different specialist rooms, not from any single deck trying to do everything.

### 14.2 Win Condition Ownership

| Deck | Primary Win Condition | Secondary Angle | Deliberately Weak Against |
|------|----------------------|-----------------|---------------------------|
| **Root Hollow** | Kill (vitality depletion) | Light resolve/nerve splash | Can't close Break or Panic alone |
| **Whispering Gallery** | Break (resolve depletion) | Nerve chip via counters | Minimal vitality pressure |
| **Veil Breach** | Panic (nerve depletion) | Resolve via Overwhelm spill | Minimal direct vitality/resolve |
| **Living Root Sanctuary** | Bond (trust/rapport) | Stalling via heals | Not designed to Kill/Break/Panic |

### 14.3 Deck Identity Spectrum

Not all decks need to be pure specialists. Deck identities exist on a spectrum:

**Specialists** — Dominant in one win condition, deliberately weak in others. Root Hollow is a Kill specialist. Veil Breach is a Panic specialist. These define the extremes and form the backbone of encounter design.

**Swiss Army Knives** — Not dominant in anything, but flexible across 2–3 win conditions. A swiss army knife deck might carry one vitality strike, one resolve strike, and one nerve strike — it can't focus-fire any single resource efficiently, but it adapts to whatever the board state offers. These decks trade peak effectiveness for optionality.

Most decks fall somewhere between these poles. A deck with a clear primary identity and a light secondary splash (like Root Hollow's single resolve strike) is a specialist with a tool, not a generalist. Both archetypes are valid — specialists create room-specific identity, swiss army knives create adaptive encounters where AI decision-making drives outcomes more than deck composition.

### 14.4 Design Implications

**Individual decks should be lopsided.** A deck with 3 vitality strikes, 1 nerve strike, and 0 resolve strikes is not a problem — it's a Kill specialist doing its job. Resist the urge to "balance" each deck independently.

**A secondary splash is acceptable, not required.** Root Hollow having one resolve strike (Crushing Grip) gives the AI a tactical option when the Entangle combo creates an opening. It doesn't make Root Hollow a resolve deck. Think of it like a red MTG deck splashing a single blue counterspell — it's a tool, not an identity shift.

**Outcome targets are measured across full runs, not per room.** The target of 8–15% Break rate is for the entire Boar scenario (3 rooms), not for Root Hollow alone. Root Hollow producing 0% Break is fine as long as enough games reach the Whispering Gallery to produce Break there.

**Room flow is the primary balance lever for outcome diversity.** If Break rates are too low, the first question is "are enough games reaching the Break-specialist room?" not "should we add more resolve cards to every deck?" Solutions include adjusting visitor HP so encounters resolve faster (more games reach later rooms), reordering rooms in the scenario (put the Break room earlier), tuning auto-effects to create time pressure, and adjusting escalation timing.

**Deck card changes are for tuning the specialist's effectiveness**, not for broadening its coverage. If Whispering Gallery isn't producing enough Break when reached, the fix is making its resolve cards more effective (lower costs, higher power, better combos) — not adding resolve cards to Root Hollow.

### 14.5 Balance Levers (Ordered by Scope)

When tuning encounter outcomes, apply the narrowest lever that solves the problem:

| Lever | Scope | What It Changes | When to Use |
|-------|-------|----------------|-------------|
| **Encounter auto-effects** | Single room | Passive resource pressure, pacing | First lever — lowest blast radius |
| **Dungeon deck cards** | Single room | Card power, costs, targets, keywords | Tuning a specialist's effectiveness |
| **Visitor deck cards** | All rooms | Visitor offensive/defensive capability | When visitor feels too strong/weak everywhere |
| **Visitor starting stats** | All rooms | Resource pools, win condition thresholds | When math structurally prevents outcomes |
| **Dungeon specialization** | All rooms (future) | Dungeon-level identity and passives | Future state — global dungeon modifiers |
| **Visitor AI profile** | All rooms | Decision-making weights and priorities | When AI behavior doesn't match identity |

### 14.6 Deck Customization & Long-Term Balance

The starter decks are reference configurations, not the final state. Players will customize decks by swapping cards, and new cards will be introduced over time. This has critical implications:

1. **Core systems must produce healthy outcomes across a range of deck configurations**, not just the starter decks. If balance depends on one specific card being present, it's fragile.

2. **Auto-effects and encounter design are more stable balance anchors than specific cards**, since they persist regardless of deck customization. A room that passively drains nerve creates Panic pressure no matter what cards the player brings.

3. **New cards require balance testing against the full encounter matrix**, not just the deck they're designed for. A new nerve strike added to Root Hollow changes the Boar matchup even if Root Hollow's identity remains Kill-focused.

4. **Win condition diversity should emerge from system design** (multi-room flow, auto-effects, resource asymmetry) **rather than depending on specific deck compositions.** If removing one card from a deck collapses a win condition, the system is too card-dependent.

5. **Balance is an ongoing process, not a solved state.** Each new card, visitor, encounter, or dungeon specialization is a potential balance disruption. The simulation infrastructure exists specifically to catch these regressions early.

### 14.7 Visitor Stat Asymmetry

Visitor starting values create the "landscape" that room specialization acts on:

| Stat | Purpose | Tuning Lever |
|------|---------|--------------|
| High vitality | Makes Kill the slow, grinding path | Lower = faster Room 1 resolution = more room flow |
| Lower resolve/nerve | Makes Break/Panic achievable for specialist rooms | Must be reachable within ~4–5 rounds of focused pressure |

The ratio between vitality and resolve/nerve determines how much "airtime" specialist rooms get. If vitality is too high relative to resolve/nerve, games end in Kill or Survive before the Break/Panic rooms can do their work.

### 14.8 Validated Example: Thornback Boar

The Boar balance iteration validated the specialization framework through four iterations:

| Version | Vitality | Key Change | Kill | Break | Panic | Result |
|---------|:---:|-----------|:---:|:---:|:---:|--------|
| v2.2 | 28 | Energy baseline | 71.7% | 1.1% | 4.8% | Secondary conditions collapsed |
| v2.3 | 28 | Deck retargeting + stat tuning | 56.9% | 15.0% | 7.5% | Break fixed, Panic still low |
| v2.3c | 26 | Vitality compromise | 68.8% | 9.7% | 5.1% | Satisfied nothing |
| v2.3d | 28 | + Root Hollow nerve auto-effect | 55.3% | 11.5% | 21.6% | All targets hit ✅ |

Key learning: three rounds of AI scoring changes produced zero movement on win condition diversity because the structural problem was deck/stat design, not AI decision-making. Once the data was corrected, the AI (which was already making correct decisions) produced the target outcomes immediately. The final fix used the narrowest available lever (encounter auto-effect) to solve the remaining Panic deficit without disrupting the other metrics.

---

## 15. Dungeon Strategic Architecture

The dungeon player's strategic identity is expressed through three layers that build on each other. The deepest, most permanent decisions are at the bottom; the most tactical, per-encounter decisions are at the top.

### 15.1 The Three Strategic Layers

**Layer 1: Dungeon Specialization (Macro — Permanent)**

The dungeon's specialization defines its global identity through passive abilities and modifiers that apply across all encounters. A Predatory specialization might grant bonus damage on Kill conditions. A Deceptive specialization might increase Offer acceptance rates or boost Trap damage. A Nurturing specialization might accelerate trust-building or heal visitors between rooms.

Specialization is the slowest-changing layer — it develops over many runs as the dungeon's identity crystallizes through accumulated decisions. It amplifies whatever encounter strategy the player builds but doesn't dictate it. A Predatory dungeon that chooses to run a nurturing first room still benefits from its specialization when the aggression comes in Room 2.

*Status: Future state. Not yet implemented. Design will be informed by the encounter and deck layers being validated first.*

**Layer 2: Encounter Selection & Ordering (Strategic — Per-Run)**

Before each run, the dungeon player selects which encounter rooms to deploy and in what order. This is the primary strategic decision — it determines the narrative arc of the visitor's experience, which card pools are available, and which win conditions are viable.

Each encounter room brings its aligned deck (15–18 cards), its auto-effects, and its thematic identity. The sequence creates emergent strategies that no single room could produce:

| Strategy | Room Sequence | Arc |
|----------|--------------|-----|
| Grinding predator | Root Hollow → Whispering Gallery → Veil Breach | Physical attrition → psychological warfare → terror |
| Deceptive host | Honeyed Hollow → Root Hollow | False safety → crushing betrayal |
| Patient nurturer | Living Root Sanctuary (single room) | Sustained cooperation toward Bond |
| Psychological horror | Veil Breach → Whispering Gallery | Terror → despair |
| Endurance test | Root Hollow → Root Hollow variant → Root Hollow variant | Relentless physical grinding |

The order matters because resource carryover means Room 1's outcome shapes Room 2's starting conditions. A trust-building Room 1 leaves the visitor psychologically open (high trust, spent resources on cooperation not defense). A combat Room 1 leaves the visitor physically weakened. The dungeon player chooses which vulnerability to create in Room 1 and which Room 2 to exploit it with.

**Layer 3: Deck Customization (Tactical — Per-Encounter)**

Within each encounter, the player customizes the room's aligned deck by swapping flex-slot cards from the generic card pool (see Section 8.5). This is where fine-tuning happens — the player adapts each room's deck to their specific strategy and to the visitors they expect.

Examples of tactical customization:
- Slotting a Trap into a nurturing deck to punish aggressive visitors who refuse Offers
- Adding an extra Reshape to a combat deck for late-game sustain against tanky visitors
- Replacing a nerve Strike with a resolve Strike in Root Hollow to create a non-standard Break angle
- Adding Offers to an aggressive deck to open a deceptive fallback when facing cooperative visitors

### 15.2 How the Layers Interact

The three layers create a strategic pyramid where each level constrains and amplifies the others:

**Specialization shapes encounter selection.** A deceptive specialization makes trust-then-betray encounter sequences more effective, naturally guiding the player toward room combinations that exploit the specialization's passive bonuses.

**Encounter selection determines available card pools.** Choosing Root Hollow + Whispering Gallery + Veil Breach gives access to ~49 cards across three specialist decks. Choosing Living Root Sanctuary + Root Hollow gives access to ~33 cards with a cooperative-then-aggressive profile. The rooms selected define the strategic ceiling.

**Deck customization fine-tunes within the strategic ceiling.** The generic card pool lets players bend each room's identity without breaking it. The core-slot/flex-slot system ensures rooms remain recognizable while allowing personal expression.

### 15.3 Deception as a Cross-Room Strategy

Deception illustrates why the multi-room architecture matters. A single-room deceptive deck would need to contain Offers (bait), Traps (hidden damage), AND Strikes (kill) in 16 cards — too many roles for too few slots. But across two rooms:

**Room 1 (The Honeytrap):** Aligned deck heavy on Offers and Traps. Builds trust, deals hidden damage through trap triggers, creates a false sense of safety. The deck is a specialist at *seeming safe*. It doesn't need Strikes because it doesn't need to finish the visitor.

**Room 2 (The Closer):** An aggressive aligned deck (Root Hollow or similar). The visitor enters with accumulated Trap damage, softened resources, and high trust that made them accept Offers readily. The aggressive deck finishes what the honeytrap started.

The "betrayal" isn't a single AI switching from cooperative to aggressive mid-room — it's the *room transition itself*. The visitor's trust carried over from Room 1 is now mechanically irrelevant in a combat encounter. The dungeon didn't betray them; the dungeon was never safe. Each room's deck is a focused specialist; the deception emerges from the sequence.

This is the same architectural pattern as the Verdant Maw's win condition diversity — specialist rooms creating emergent outcomes through sequencing — applied to a completely different strategic goal.

### 15.4 Implications for AI Visitors

When intelligent visitors arrive (Phase 3), they will need to read the dungeon's strategic layers and adapt:

- **Encounter recognition:** Identifying which room they're in and what it specializes in. A visitor who recognizes a honeytrap room can refuse Offers and play defensively, denying the deceptive dungeon its setup phase.
- **Cross-room planning:** Conserving resources in Room 1 for an expected harder Room 2. Accepting the exposure cost of a cooperative Room 1 only if they believe Room 2 will also be cooperative.
- **Reputation reading:** Using the dungeon's accumulated history (previous visitor reports, specialization signals) to predict what the next room holds. A dungeon with a Predatory reputation running a nurturing first room should trigger suspicion.

This creates an information asymmetry arms race: the dungeon designs sequences to manipulate visitor expectations, while intelligent visitors learn to read and counter those designs. The card system already supports this through face-down Traps, hidden hand contents, and Offer payloads — the multi-room architecture extends it to the strategic layer.

### 15.5 Generic Card Pool Design Principles

The generic card pool serves as the connective tissue between encounter-aligned decks and player customization. Cards in the generic pool should follow these principles:

1. **Mechanically complete but not optimized.** A generic Strike should deal reasonable damage to any resource but not synergize with any specific room's auto-effects or combo lines. It's a tool, not a centerpiece.

2. **Category coverage.** The pool should contain at least 2–3 cards in every category so that players can add any tactical verb to any deck. Want Counter capability in a room that doesn't have one? The generic pool provides it.

3. **No combo enablers.** Generic cards should not create new combo lines when added to aligned decks. They fill gaps and add flexibility, not create degenerate synergies. Combo depth should come from the aligned decks that are explicitly designed and tested for it.

4. **Balance-neutral by default.** Adding a generic card to any deck should not significantly shift win condition distributions. The simulation infrastructure should validate this — run each matchup with 1–2 generic swaps and confirm metrics stay within tolerance.

5. **Thematically neutral.** Generic cards represent fundamental dungeon capabilities (basic strikes, simple reshapes, universal reactions) rather than room-specific phenomena. "Rumbling Strike" works in any room; "Entombing Grasp" only makes sense in Root Hollow.

# GDD Update — v2.4 (Party System + Economy + Smart AI Resolution)

Apply these changes to the main GDD. Each section below specifies what to find and what to replace/add.

---

## UPDATE 1: Section 7.2 — Smart AI (Replace entire section)

### 7.2 Smart AI (Monte Carlo) — Benchmarked & Resolved

Smart AI replaces heuristic scoring with Monte Carlo evaluation. For each playable card, the AI simulates 12 random playouts from the resulting board state and evaluates the final position. Smart AI includes a deck tracker that monitors draw probabilities, depleted categories, and opponent card history. The evaluation function assesses position based on resource health ratios, vulnerability detection (opponent's lowest reducer vs. own lowest), and time pressure from escalation.

Smart AI v1.1 integrates the combo sequencer — MC evaluation feeds card scores into `planTurn()` via a scoreFunction closure, combining Monte Carlo position assessment with strategic energy planning. For cooperative profiles (goalType 'bond'), a cooperative override applies heuristic strike suppression and Offer/Test boosting on top of MC deltas, because MC evaluation structurally undervalues multi-turn cooperative payoff (a single Offer yields ~1.25 pts of board eval, but cumulative Offers reaching Bond threshold wins the game).

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

**Conclusion:** Monte Carlo evaluation does not outperform heuristic AI with the current Tier 0 card set. The heuristic weights + combo sequencer already capture the decision space well. The game's contested dice rolls introduce sufficient variance that 12 random rollouts per card cannot reliably distinguish small deltas from noise. Smart AI runs 2–3× slower for no measurable benefit.

Smart AI becomes relevant when card complexity increases — specifically when Intelligent Visitor party mechanics introduce targeting decisions, cross-member synergies, and multi-turn strategic planning that heuristic weights cannot capture. The Smart AI infrastructure is code-complete and available for future activation.

---

## UPDATE 2: Section 7.4 — Intelligent Visitor AI (Replace entire section)

### 7.4 Intelligent Visitor AI

The intelligent visitor phase replaces solo creature visitors with adventuring parties — groups of 3–4 specialized members who compose a shared deck and resource pool. This is the system that transforms Shattered Dungeon from a systems prototype into its real game identity.

Intelligent visitors require: party composition (selecting members for strategic synergy), shared deck construction (each member contributes cards to a party-wide deck), individual targeting (dungeon chooses which party member to attack), member elimination and deck thinning (downed members lose their cards from the active deck), multi-encounter planning (managing party resources across a full dungeon run), adaptive strategy (recognizing dungeon identity mid-run and adjusting approach), and social intelligence (evaluating Offer sincerity based on dungeon reputation and behavior history).

The party system is defined in Section 16. The creature visitors (Boar, Moth, Symbiote) remain as Tier 0 content for early encounters and system validation.

---

## UPDATE 3: Section 11.4 — Replace with Resolved, renumber remaining

Find the current **11.4 Remaining Open Questions** and replace the entire section with:

### 11.4 Resolved from v2.3

**Deception Path.** Validated through dedicated 2-room scenario (Honeyed Hollow → Root Hollow). Cross-room deception arc works: Room 1 (nurturing profile, deceptive deck) builds trust while dealing ~6 hidden damage via Trap→Offer engine. Room 2 (tactical profile, combat deck) finishes the weakened visitor. Per-encounter AI profile overrides enable different strategies per room. Section 15 (Dungeon Strategic Architecture) documents the multi-room strategic framework.

**Smart AI + Combo Sequencer Integration.** Completed and benchmarked. Smart AI v1.1 integrates the combo sequencer via scoreFunction closure. Cooperative override added for bond profiles to prevent MC evaluation from undermining cooperative play. Full benchmark across all matchups confirms heuristic AI + combo sequencer is the performance ceiling for the current Tier 0 card set. Monte Carlo evaluation does not add measurable value at this card complexity level. Smart AI infrastructure preserved for future activation when card depth increases with Intelligent Visitors.

### 11.5 Remaining Open Questions

**Intelligent Visitor Party System — Implementation.** The party system architecture is defined in Section 16. Design decisions are locked. Implementation requires: party member data structures, individual vitality tracking, member knockout + card removal, morale cascade on elimination, party deck composition, targeting AI for dungeon side, and a sample standard party (Fighter/Mage/Healer/Rogue) for initial testing.

**Expanded Creature Content.** The GDD targets 5 creature visitors for Phase 2. Currently 3 are implemented (Boar, Moth, Symbiote). This is deprioritized in favor of the party system — the creature visitors are Tier 0 training content and the party system is the real game.

**Symbiote Parasitism Mechanic.** The Symbiote's cooperation currently has no hidden cost. Adding a corruption or parasitism mechanic where Symbiote cooperation slowly drains a dungeon resource would create genuine cost/benefit tension during Bond-building. Design needed, not yet prototyped.

**Cooperative Deck Diversity.** Restraint fills some dead turns during cooperation, but mid-game can still have minimal activity when waiting for Offer/Test cards to cycle from discard. Adding 2–3 cards per cooperative deck that contribute to Bond without being Offers/Tests would address this.

**Cognitive Load.** Nine card categories, multi-card turns, reaction timing, keywords, triggers, and persistent conditions are substantially complex. Progressive introduction (Strike + Empower + Energy first, then Disrupt/Counter/React, then Trap/Offer/Test/Reshape, then keywords/triggers) should mitigate this, but paper playtest must verify.

**Emotional States.** Visitor emotional states (Enraged from betrayal, Cautious from trap awareness, Grateful from beneficial offers) that modify AI behavior qualitatively. Not yet designed in detail.

**Environmental Hazards During Cooperation.** Adding threats that pressure both sides during cooperative encounters would increase tension — the dungeon and visitor must cooperate while the environment works against them both.

**Run Rewards & Economy.** The dual economy framework (Essence/World Knowledge for dungeons, Gold/Items for visitors) is defined in Section 17. Detailed implementation of reward scaling per encounter outcome, card morphing mechanics, and reputation-based matchmaking remain to be specified.

---

## UPDATE 4: Section 12 — Update Roadmap (Replace entire section)

---

## 12. Scope & Development Roadmap

**Phase 1 (Months 1–6): Core Loop.** Card engine with 9 categories, encounter system, turn-based resolution, Energy system, 3 base encounters, 3 creature visitors, economy, attribute growth. Simulation engine for validation. *Status: Complete. Card system validated with mechanical depth. 15 keywords/conditions, triggers, keyword grants, Disrupt/Counter/React variants designed. 7 decks with distinct combo lines. Energy system fully implemented and validated. AI combo sequencer operational. Smart AI benchmarked — heuristic AI confirmed as performance ceiling for Tier 0 content.*

**Phase 2 (Months 7–12): Intelligent Visitors & Content.** Party system implementation (Section 16), dual economy framework (Section 17), sample standard party, party-vs-dungeon encounter testing, 2 additional creature visitors, companion cards, card evolution, architecture branching. Deception scenario validation complete.

**Phase 3 (Months 13–18): Content Depth & Early Access.** Additional party compositions, class customization, equipment system implementation, card morphing, reputation and matchmaking, multi-encounter party resource management, narrative framework, Veil crafting, offering market. Early Access launch.

**Phase 4 (Months 19–24): PVP & Endgame.** Player-vs-player mode (human controls visitor party OR dungeon side), advanced encounter designs, scoring system. Balance passes across party compositions.

**Phase 5 (Months 25–36): 1.0 & Beyond.** Full content pass, modding support, additional morph paths, community-designed encounters and party classes.

---

## UPDATE 5: New Section 16 — Intelligent Visitor Party System (Add after Section 15)

---

## 16. Intelligent Visitor Party System

### 16.1 Design Philosophy

The party system transforms the visitor side from a single entity with flat resource pools into a composed team of specialized members — mirroring how the dungeon side composes encounter rooms into a strategic sequence. Both sides now have a **compositional layer** (which rooms / which party members) that determines the **tactical layer** (which cards are available and what strategies are viable).

The party system is the inverse of dungeon encounter design. Dungeon encounters add flavor and tactics through sub-decks, auto-effects, and room-specific cards aligned to the encounter. Party members function identically: each member contributes cards to the party deck, modifies the collective resource pool, and brings a strategic focus area. Pre-match party selection — choosing which members to bring against a dungeon with a known reputation — is a core strategic decision.

This architecture supports PVE (party vs AI dungeon), PVE-inverse (dungeon vs AI party), and PVP (human party vs human dungeon) without changing the underlying mechanical systems.

### 16.2 Party Composition

Parties are **fixed at 4 members** for initial implementation. Each party member has:

- **Individual vitality** — their own physical health pool, targeted independently by the dungeon
- **Collective resource contribution** — each member adds to the party's shared resolve and nerve pools
- **Card contribution** — each member brings 8–12 cards to the shared party deck
- **Strategic identity** — primary focus, dual focus, or utility (see 16.4)

The party functions as a single "side" in the encounter system. One shared hand is drawn from the combined party deck. One shared energy pool funds all card plays. The party takes one unified turn per round, playing cards from the shared hand. This keeps the turn economy identical to the current system — the party is one side that plays cards each turn, not four separate actors.

### 16.3 Resource Model

**Vitality is individual.** Each party member has their own vitality pool. The dungeon targets individual members when playing vitality-targeting Strikes. This represents physical health — each person has their own body, their own hit points.

**Resolve and nerve are collective.** The party shares a single resolve pool and a single nerve pool. These represent group morale: willpower (resolve) and courage (nerve) are contagious — one member's fear affects the whole group, one member's determination bolsters everyone.

**Collective pool composition.** Each party member contributes a defined amount to the party's resolve and nerve pools. A fighter might contribute +6 resolve / +4 nerve while a mage contributes +3 resolve / +5 nerve. Party composition directly shapes the defensive profile:

- A heavy-fighter party has deep resolve but shallow nerve — hard to Break, easy to Panic.
- A balanced party has no glaring weakness but no deep reservoir either.
- A caster-heavy party has deep nerve but shallow resolve — resistant to fear, vulnerable to psychological warfare.

This means pre-match party selection is a defensive decision as much as an offensive one. The party is choosing its vulnerability profile.

**Trust is collective.** The party shares a single Trust value. Bond requires the entire party's Trust reaching threshold — the dungeon must convince the whole group, not just one member.

### 16.4 Party Member Archetypes

Party members exist on a specialization spectrum, similar to dungeon deck identities (Section 14.3):

**Primary focus** — Deep in one area. Most cards serve a single strategic function. Example: a Knight brings predominantly Strikes targeting structure/presence, with one Empower and one Reshape. High impact in their lane, minimal flexibility.

**Dual focus** — Split across two areas. Cards serve two complementary functions. Example: a Battlemage brings Strikes and Disrupts, able to pressure two resource axes but neither as hard as a specialist.

**Utility** — Spread across many functions. Cards provide support, healing, disruption, and light offense. Example: a Bard brings Reshapes, Offers, Counters, and one Disrupt. Doesn't push any win condition independently but enables specialists and shores up weaknesses.

A well-composed party has a mix: 1–2 primary focus members for win condition pressure, 1 dual focus for flexibility, and 1 utility for support and counterplay. An unbalanced party (e.g., 4 fighters) is powerful on one axis but has glaring gaps the dungeon can exploit.

### 16.5 Party Deck Construction

Each party member brings **8–12 cards** to the shared party deck, creating a combined deck of **32–48 cards** that carries the party through the entire dungeon run. This contrasts with the dungeon side, where each encounter room has its own 15–16 card deck.

**Why the party deck persists across rooms:** Visitors don't control the dungeon's layout. They bring one kit and adapt it to whatever rooms they encounter. This creates resource management tension across the full run — burning powerful cards early to survive Room 1 means fewer options in Room 3.

**Deck composition rules:**
- Each member's card set must include at least 1 Energy card
- The combined party deck must contain at least 4 Energy cards total
- Each member's cards should form a coherent kit (internal synergies)
- Cross-member synergies are encouraged (a healer's buff makes the fighter's Strike better)

**Future evolution:** Party member card pools can be customizable, similar to how dungeon encounter decks have core slots (locked) and flex slots (swappable). A Knight's core cards (signature Strikes) are fixed, but 2–3 flex slots allow the player to customize their Knight's secondary capabilities. This is a future system — initial implementation uses fixed card sets per class.

### 16.6 Member Elimination

When a party member's individual vitality reaches 0, they are **knocked out:**

1. **Card removal.** The knocked-out member's cards are removed from the active deck. Cards currently in hand remain playable this turn but are not reshuffled. Cards in the draw pile and discard are removed.

2. **Morale cascade.** Each knockout inflicts direct damage to the party's collective resolve and nerve. The damage **scales with eliminations** — the first knockout is a setback, the second is devastating:
   - First knockout: -3 resolve, -3 nerve
   - Second knockout: -6 resolve, -6 nerve (and triggers Kill — see 16.7)

3. **Deck thinning.** Losing a member's cards reduces deck size, which increases draw consistency for remaining cards. This is a feature, not a bug — it mirrors the DND dynamic where a reduced party is weaker overall but each remaining member gets more spotlight. A 3-survivor party with a tight 24-card deck might draw their best cards more often than the original 4-member party with a diluted 32-card deck.

### 16.7 Kill Win Condition (Revised)

With parties, Kill no longer requires depleting a single vitality pool. Kill triggers when **2 of 4 party members are knocked out** (50% threshold) — the survivors flee the dungeon. This creates a clean aggressive-path victory for the dungeon.

The morale cascade means member elimination accelerates other win conditions too. Knocking out one member deals -3 to resolve and nerve, potentially bringing the party within Break or Panic range. The dungeon faces a genuine strategic choice:

- **Focus fire** two members for Kill (requires concentrated vitality damage on individuals)
- **Spread pressure** to trigger knockouts that cascade into Break or Panic (requires mixing vitality damage with resolve/nerve pressure)
- **Ignore vitality entirely** and pursue pure Break or Panic against the collective pools

This makes the dungeon's targeting decision — which party member to attack — one of the most important strategic choices in the game.

### 16.8 Member Restoration

Party members can be restored mid-encounter through dedicated healing cards (typically from utility/healer class members). Restoration is:

- **Expensive** — high energy cost (3+), representing significant resource investment
- **Partial** — restored member returns at reduced vitality (e.g., 50% of starting), not full health
- **Blockable** — the dungeon can play cards that prevent or interfere with restoration (Counter to dispel the heal, Disrupt to reduce its effectiveness, or targeting the healer to prevent the attempt)

This creates the classic "kill the healer first" dynamic from DND party tactics. If the dungeon leaves the healer alive, the party can recover from member knockouts. If the dungeon prioritizes the healer, the party loses both its restoration capability and its utility cards.

Between-encounter restoration is more generous — downed members automatically return at partial vitality between rooms, representing rest and regrouping. The dungeon's multi-room strategy must account for party recovery between encounters.

### 16.9 Targeting System

Dungeon Strikes that target vitality require a **target selection** — which party member to hit. This is a dungeon AI decision (or player decision in PVP) based on:

- **Member threat assessment** — which member's cards are most dangerous to the dungeon
- **Member vulnerability** — which member has the lowest remaining vitality
- **Strategic objective** — whether the dungeon is pursuing Kill (focus fire), Break/Panic (morale cascade), or Bond disruption
- **Healer priority** — eliminating restoration capability before focusing other members

Strikes targeting collective resources (resolve, nerve) do not require member targeting — they hit the party's shared pool directly.

**Keyword extensions for party targeting:**
- Default: dungeon AI selects target (or player chooses in PVP)
- **Cleave** keyword: Strike hits multiple party members for reduced damage
- **Focused** keyword: Strike must target a specific member (e.g., lowest vitality)
- **Piercing** keyword: Strike ignores restoration effects

These keywords are future design space. Initial implementation uses AI-selected targeting as the default.

### 16.10 Energy System

The party shares a **single energy pool**, consistent with the shared deck and shared hand. Energy cards from any party member contribute to the shared pool. This creates natural energy tension — a healer's expensive restoration card competes for energy with the fighter's finisher Strike.

Party member card pools may include specialty Energy cards (e.g., a mage's "Arcane Surge" provides 2 temp energy but only for Mystical-type cards) or standard Energy cards. The player chooses which Energy cards to include when constructing the party deck, adding another layer of pre-match composition decisions.

### 16.11 Bond with Parties

Bond requires the **entire party's Trust** reaching threshold. The dungeon must convince the whole group, not just one sympathetic member. This is the hardest path — four skeptical adventurers are harder to win over than one creature.

This creates potential narrative richness:
- The dungeon may need to address different party members' concerns differently (though mechanically Trust is one shared pool)
- Knocking out party members does NOT make Bond easier — it damages morale (resolve/nerve cascade) and removes that member's potential Offer/Test cards from the deck
- A dungeon pursuing Bond against a party cannot eliminate members as a shortcut — it must keep everyone alive and cooperating

Bond with a full party is the most difficult and rewarding win condition in the game.

### 16.12 Interaction with Existing Systems

The party system integrates with existing mechanics without replacing them:

- **Card categories** — all 9 categories function identically. Party member cards use the same Strike/Empower/Disrupt/Counter/Trap/Offer/Test/Reshape/React categories.
- **Energy system** — shared pool, same Energy card types (Standard, Surge, Attune, Siphon), same costs and activation.
- **Combo sequencer** — `planTurn()` works with the party deck since it operates on hand contents, not on party structure. No changes needed to the combo sequencer.
- **Encounter engine** — the party is one "side" with modified resource tracking. The core turn loop (draw → play → resolve → end-of-round) is unchanged.
- **Auto-effects** — encounter auto-effects that target visitor vitality need a targeting rule (e.g., target lowest-vitality member, or spread across all members). Auto-effects targeting resolve/nerve hit the collective pool as before.
- **Creature visitors** — Boar, Moth, and Symbiote remain as Tier 0 solo visitors. They use the current system unchanged. The party system applies only to Intelligent Visitors (Tier 1+).

### 16.13 Sample Party — The Standard Adventuring Company

The first party implementation will be a classic 4-member composition for testing:

| Role | Class | Vitality | Resolve Contrib. | Nerve Contrib. | Cards | Strategic Focus |
|------|-------|:--------:|:-----------------:|:--------------:|:-----:|----------------|
| Tank | Knight | 12 | +6 | +3 | 10 | Primary: Structure/Presence Strikes, Reshapes |
| DPS | Battlemage | 8 | +4 | +5 | 10 | Dual: Vitality Strikes + Disrupts |
| Support | Cleric | 8 | +5 | +4 | 10 | Utility: Reshapes, Offers, restoration |
| Flex | Rogue | 7 | +3 | +6 | 10 | Dual: Veil Strikes + Traps + Counters |
| **Party Total** | | **35 (individual)** | **18 (collective)** | **18 (collective)** | **40** | |

This gives the party: 35 combined individual vitality (dungeon must knock out 2 members from individual pools), 18 shared resolve (comparable to current creature visitors), 18 shared nerve, and a 40-card deck with mixed capabilities.

The Knight has the most vitality (12) and is the hardest to eliminate individually. The Rogue has the least vitality (7) and is the easiest knockout target, but removing the Rogue eliminates Traps and Counters — defensive tools the party needs. This creates a genuine dungeon dilemma: kill the easy target and lose your own counterplay threat, or focus the Knight for a harder but less costly elimination.

### 16.14 Design Validation Plan

The party system will be validated through the same simulation methodology used for creature visitors:

1. **Build the Knight/Battlemage/Cleric/Rogue party** with fixed card sets
2. **Run against Verdant Maw** (tactical dungeon) — 1000 iterations
3. **Evaluate targeting patterns** — does the dungeon AI make interesting targeting decisions?
4. **Evaluate win condition distribution** — do Kill, Break, Panic, and Survive all occur at meaningful rates?
5. **Evaluate member elimination patterns** — which members get knocked out first and does it vary by dungeon strategy?
6. **Evaluate deck thinning dynamics** — does the party's effectiveness change in interesting ways as members are eliminated?
7. **Test Bond path** — run against nurturing dungeon to verify Bond is achievable but hard with full party Trust requirement
8. **Test deceptive path** — run 2-room deceptive scenario against party to verify the deceptive arc still works with party mechanics

Target outcome distributions will be established after initial testing — the party system introduces enough new variables that existing Tier 0 targets may not apply directly.

---

## UPDATE 6: New Section 17 — Dual Economy & Progression (Add after Section 16)

---

## 17. Dual Economy & Progression

### 17.1 Economic Philosophy

The economy is a two-sided marketplace. The dungeon has something visitors want (gold, items, the challenge itself). Visitors have something the dungeon wants (Essence from their life force, World Knowledge from their experiences). Every encounter outcome distributes these currencies differently, making the dungeon's identity choice — predator, nurturer, trader, deceiver — an economic decision with long-term progression consequences.

**Critical design constraint:** The economy must prevent runaway specialization. A dungeon that only kills becomes Essence-rich but Knowledge-poor — powerful rooms but no sophistication. A dungeon that only bonds becomes Knowledge-rich but Essence-poor — clever encounters but structurally weak. Over time, the system incentivizes strategic diversification naturally through currency scarcity, not through artificial rules mandating variety.

### 17.2 Dungeon Currencies

**Essence** — Raw power extracted from visitors. Represents the life force, fear, and suffering the dungeon absorbs.

Earning rates scale with encounter aggression:
- Kill: High Essence (maximum extraction)
- Break/Panic: Moderate Essence (fear and broken will feed the dungeon)
- Survive (visitor escapes): Low Essence (brief exposure)
- Bond: Minimal Essence (cooperative visitors share willingly but the dungeon takes nothing by force)

**World Knowledge** — Information, memories, and experiences visitors carry. Represents the dungeon learning about the world beyond its walls.

Earning rates scale with encounter depth and cooperation:
- Bond: High World Knowledge (visitor shares freely, deep mutual exchange)
- Survive (extended encounter): Moderate World Knowledge (dungeon observes visitor behavior over many rounds)
- Break/Panic: Low World Knowledge (traumatized visitors reveal little of value)
- Kill (quick): Minimal World Knowledge (dead visitors teach nothing)

This creates the core economic tradeoff. Predatory dungeons accumulate power fast but plateau in sophistication. Nurturing dungeons grow slowly in raw power but develop complex, adaptable strategies. The most successful long-term dungeons must diversify their approach across visitors.

### 17.3 Dungeon Spending

**Essence buys power:**
- New combat-oriented cards (Strikes, Empowers, aggressive Disrupts)
- Card morphs toward lethality (existing cards gain power, keywords, or aggressive triggers)
- Room items that boost reducer resources or amplify damage (see 17.7)
- Encounter morphs that increase environmental pressure (stronger auto-effects)

**World Knowledge buys sophistication:**
- New utility and tactical cards (Traps, Offers, Tests, Reshapes, Counters)
- Card morphs toward complexity (existing cards gain conditional effects, combo enablers)
- Room items that enable new strategies (trap enhancements, offer sweeteners, environmental manipulation)
- Encounter morphs that add mechanical depth (new auto-effect types, branching room outcomes)
- Unlocking new encounter room templates

**Both currencies can buy:**
- Energy card improvements (better Attune/Siphon/Surge variants)
- Defensive investments (resource pool increases, React improvements)

### 17.4 Dungeon Lure Investment

The dungeon **spends resources to place loot in its rooms** as bait to attract visitors. This is a strategic investment:

- Placing valuable items costs the dungeon Essence or World Knowledge
- Higher-value loot attracts more and better-equipped parties
- The type of loot shapes which visitors arrive (combat gear attracts fighters, magical items attract casters)
- Loot placement is part of the dungeon's pre-run strategic setup alongside room ordering

This creates a genuine economic cycle: the dungeon invests in loot → attracts visitors → encounters produce Essence/Knowledge → dungeon reinvests. The dungeon is running a business where the product is "an interesting and potentially survivable experience" and the revenue is extracted life force and knowledge.

### 17.5 Visitor Currencies

**Gold** — Universal currency earned from dungeon runs. Represents treasure found, payment for services, and rewards for survival.

Earning rates scale with encounter outcome and difficulty:
- Bond: Highest gold (dungeon shares treasure willingly, mutual reward)
- Survive (full run completion): High gold (collected loot from all rooms)
- Survive (partial, fled early): Moderate gold (kept what you grabbed)
- Break/Panic (fled in terror): Low gold (dropped most of it running)
- Kill (party wipe): Zero gold (dead parties collect nothing)

Gold scales with dungeon difficulty — a harder dungeon pays more for survival. This creates the risk/reward calculation parties make when choosing which dungeon to enter.

**Items** — Specific equipment and artifacts found during runs.

Sources:
- Dungeon-placed loot (collected during encounters, the dungeon's bait investment)
- Between-run shops and marketplaces (purchased with gold)
- Crafting from materials gathered during runs (future system)
- Rare drops from specific encounter outcomes (e.g., defeating a powerful dungeon room)

### 17.6 Visitor Spending

**Gold buys:**
- Equipment from shops (see 17.7)
- New cards for party members (expanding card pools for deck construction)
- Card morphs (upgrading existing cards — see 17.9)
- Party member recruitment and replacement (hiring new members, reviving permanently lost ones)
- Consumables for runs (one-use items that provide temporary advantages)

**Items are equipped** to party members (see 17.7) or consumed during runs.

### 17.7 Equipment & Room Items

Equipment is the primary way both sides modify their tactical capabilities between runs. **The design principle is effect-based progression, not flat stat increases.** A +1 vitality item is boring. An item that applies Entangle on Strong hits transforms how a card plays.

**Visitor Equipment** — Equipped to individual party members, modifying their stats or card behavior.

Equipment exists on a tiered rarity scale:

| Tier | Name | Effect Type | Example |
|------|------|-------------|---------|
| Common (White) | Basic Gear | Small flat stat bonus | Iron Shield: +1 vitality |
| Uncommon (Green) | Quality Gear | Conditional stat bonus | Sturdy Boots: +2 vitality if nerve > 50% |
| Rare (Blue) | Specialized Gear | Card play modifier | Veil-Touched Blade: Physical Strikes also deal 1 veil damage |
| Epic (Purple) | Exceptional Gear | New mechanic or trigger | Healer's Oath: When ally drops below 30% vitality, auto-restore 2 (once per encounter) |
| Legendary (Gold) | Unique Artifacts | Game-changing effect | Crown of Defiance: Party is immune to first Panic trigger per encounter |

The design target is that **Common and Uncommon items are stepping stones, Rare items change how you build your deck, and Epic/Legendary items change how you approach encounters.** A party's equipment loadout should meaningfully affect their strategy, not just their numbers.

**Equipment slots per party member:** Weapon (modifies offensive cards), Armor (modifies defensive stats/reactions), Accessory (provides a unique effect or trigger). Three slots keeps it manageable while allowing meaningful customization.

**Dungeon Room Items** — Installed in encounter rooms, providing persistent modifiers to that room's encounters.

| Tier | Example | Effect |
|------|---------|--------|
| Common | Essence Crystal | Structure +2 in this room |
| Uncommon | Fear Totem | Nerve auto-effects deal +1 in this room |
| Rare | Trapweaver's Loom | Traps in this room trigger twice before expiring |
| Epic | Betrayal Mirror | When visitor Trust > 6, dungeon gains +1 power on all Strikes (deception enabler) |
| Legendary | Heart of the Veil | All dungeon cards in this room gain the Drain keyword |

Dungeon room items are the equivalent of encounter morphs but purchased/found rather than earned through progression. They let the dungeon customize individual rooms beyond the base encounter template and aligned deck.

### 17.8 Reputation & Matchmaking

The dungeon's accumulated encounter outcomes create a **reputation** that shapes which visitors arrive. Reputation is not a single number — it's a profile of the dungeon's behavior history.

Reputation dimensions:
- **Lethality** — ratio of Kills to total encounters. High lethality attracts aggressive parties who think they can win, deters cautious ones.
- **Hospitality** — ratio of Bonds and successful Survives. High hospitality attracts cooperative visitors and treasure-seekers.
- **Deception** — ratio of encounters where early cooperation was followed by aggression. High deception makes all visitors more suspicious (higher resistance to Offers, lower initial Trust).
- **Difficulty** — aggregate measure of how challenging the dungeon is. Affects gold scaling for visitors.

Matchmaking uses reputation to generate appropriate challenges:
- A lethal dungeon faces increasingly well-equipped, aggressive parties (the weak ones stopped coming)
- A hospitable dungeon attracts diverse visitors including rare cooperative ones with unique rewards
- A deceptive dungeon faces parties with high starting suspicion and anti-trap capabilities
- Rising difficulty attracts stronger parties but also increases the Essence/Knowledge yield per encounter

This creates the **natural progression treadmill**: as the dungeon gets better, so do its opponents. Progression is real (better cards, morphed encounters, room items) but the challenge scales with it. A dungeon that diversifies its approach (sometimes killing, sometimes bonding, sometimes deceiving) develops a complex reputation that attracts varied visitors — keeping gameplay fresh and preventing formulaic optimization.

### 17.9 Card Morphing (Framework)

Both sides can invest currency to permanently modify existing cards. Card morphing is the deepest progression mechanic — it transforms how individual cards play rather than just adding new cards to the pool.

**Design principles for morphing:**
- Morphs are permanent and irreversible (commitment matters)
- Each card has 2–3 morph paths representing different specializations
- Morph paths align with the currency used (Essence morphs → power/aggression, World Knowledge morphs → utility/complexity)
- Morphed cards must still pass the Description Test (the morph creates a genuinely different card, not a numerically bigger version)
- Higher-tier morphs require both currencies, incentivizing balanced play

**Example morph paths (dungeon card):**

*Entangling Grasp (base: Strike, 2 power, Entangle keyword)*
- **Essence morph → Strangling Grasp:** 3 power, Entangle + Erode. Pure lethality upgrade.
- **Knowledge morph → Binding Inquiry:** 2 power, Entangle + on hit: reveal one face-down visitor card. Tactical information gathering.
- **Dual morph → Consuming Embrace:** 2 power, Entangle + Drain (convert 1 damage dealt to structure healing). Sustain through aggression.

**Example morph paths (visitor card):**

*Holy Light (base: Strike, 2 power, targets structure)*
- **Gold morph → Searing Radiance:** 3 power, targets structure. Raw damage increase.
- **Item morph → Purifying Light:** 2 power, targets structure + removes one dungeon Empower condition. Utility upgrade.
- **Rare item morph → Revealing Light:** 2 power, targets veil instead of structure + reveals one face-down Trap. Strategic retargeting.

Detailed morph trees per card are a future design task. The framework establishes that morphing exists, uses the dual currency system, and creates meaningful specialization choices.

### 17.10 Economic Balance Constraints

Several constraints prevent the economy from breaking game balance:

**Currency caps per encounter.** Maximum Essence and World Knowledge earned per encounter prevents farming through artificial encounter extension.

**Diminishing returns on specialization.** The first Essence-purchased combat card is cheap. The tenth is expensive. This naturally pushes dungeons toward diversification over deep specialization in one currency's purchases.

**Loot investment risk.** Placed dungeon loot that visitors collect is a real cost. If the visitor Bonds or Survives, they take the loot. If the dungeon Kills them, the loot stays (recycled for the next visitor). This means hospitable dungeons pay a real ongoing cost for their visitor-friendly reputation.

**Equipment durability or charges.** Visitor equipment may degrade over runs, requiring gold to maintain. This prevents equipment stockpiling and keeps the gold economy flowing. Exact durability mechanics are a future design decision.

**Matchmaking pressure.** The reputation system ensures that economic advantages translate into harder opponents, not easier wins. Getting rich makes the game harder, not easier — but also more rewarding.

### 17.11 Interaction with Party System

The economy directly shapes party gameplay:

- **Party composition is an economic decision.** Hiring a specialized party member costs gold. Bringing a healer means investing in restoration capability at the expense of offensive gear.
- **Equipment loadout defines the run strategy.** A party equipped for anti-trap operations approaches a deceptive dungeon differently than one equipped for raw combat.
- **Run reward depends on encounter outcomes.** Which party members survive, whether Bond was achieved, and how many rooms were completed all affect gold and item rewards.
- **Member loss has economic consequences.** A knocked-out party member's equipment is at risk. Permanent member death (if implemented) means losing both the member and their gear investment.
- **Dungeon lure quality affects party decisions.** Players choose which dungeon to enter based on reputation, difficulty, and advertised rewards — creating a marketplace where dungeons compete for visitors.