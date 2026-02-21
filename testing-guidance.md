Tuning Playbook
Here's how to use the matrix runner as you iterate on balance. Think of this as three tiers of investigation: quick checks, targeted dives, and full sweeps.
Tier 1: Quick Checks (after any balance change)
bash# 20 random matchups, 100 iterations — takes ~1-2 seconds
node run-matrix.js
This is your smoke test. Run it after every meaningful change to cards, encounter stats, AI profiles, or Short Rest values. You're looking at the Quality Averages line — if agency, closeness, or diversity move in the right direction, the change is probably good. If they get worse or stay flat, dig deeper.
What to watch: Agency trending toward 1.5+, diversity trending toward 0.35+, Survive dropping below 50% average, dungeon profile spread narrowing (all profiles in the 35-65% DWR range rather than 20-70%).
Tier 2: Targeted Probes (investigating specific issues)
bash# "Is the Knight too tanky?"
node run-matrix.js --probe-member knight -n 200 --combos --json

# "Is Honeyed Hollow too weak as an opener?"
node run-matrix.js --probe-encounter honeyed-hollow -n 200 --combos --json

# "Is nurturing AI fundamentally broken?"
node run-matrix.js --probe-dungeon nurturing -n 200 --json

# "How do creatures compare to parties?"
node run-matrix.js --creatures-only --sample 30 -n 200 --json
Use --combos for member/encounter probes to keep run times reasonable (unordered sequences cut the space by 6x). Use --json so you can compare before/after results.
The workflow: Make a change → run the relevant probe → compare the Quality Averages and anomaly counts against the previous run. If anomalies drop and metrics improve, commit the change. If not, revert.
Tier 3: Full Sweeps (milestone validation)
bash# Full combination space — ~1 minute
node run-matrix.js --all --combos -n 100 --json

# Full ordered space — ~6 minutes
node run-matrix.js --all -n 100 --json
Run these at milestones: after finishing a round of balance changes, before/after adding new content, or when you want a definitive ecosystem health read. The JSON output gives you the complete heatmap.
Combos vs ordered: For balance tuning, --combos is usually sufficient. Encounter ordering effects (does Root Hollow as Room 1 vs Room 3 matter?) are a second-order concern. Use full ordered sweeps when you specifically want to investigate ordering sensitivity.
What to Tune First (Based on Your Data)
Priority 1: Room attrition. The 80-92% entry states are the root cause of most issues. Options:

Reduce dungeon Short Rest recovery (currently floor 40%, heal 25%)
Increase encounter damage output (card power values)
Reduce visitor Short Rest recovery
Increase encounter round caps so rooms have more time to deal damage

Run node run-matrix.js after each adjustment. You want Room 2 entry at 55-70% and Room 3 entry at 35-55%.
Priority 2: Nurturing/Deceptive profiles. These need to create real pressure, not just be "weak aggressive." The deceptive profile should win through accumulated Trap damage and information asymmetry, not through direct combat. Nurturing needs the Bond path to function as a real threat — without it, nurturing is just "dungeon that doesn't fight back." This is a design issue more than a numbers issue.
Priority 3: Outcome diversity. Once rooms attrit properly, you should see more Kill/Break/Panic because visitors will enter later rooms with depleted resources. If diversity stays low even after fixing attrition, look at whether specific dungeon resources (structure, veil, presence) are too symmetrical — the dungeon may need more differentiated weakness profiles per encounter.
Reading the Report
When you run the matrix, focus on these sections in order:

Quality Averages — Are agency, closeness, and diversity in healthy ranges? This is the single most important check.
By Dungeon Profile — Are all profiles competitive? Target: every profile has DWR between 30-65% and agency above 1.0.
Anomalies — How many HIGH vs LOW? HIGH anomalies (red dots) are systemic. LOW anomalies (blue dots) are individual matchup quirks. A few LOW anomalies are fine; any HIGH anomaly means a systemic problem.
Top/Bottom tables — Extremes tell you where to probe. If the same member appears in all 5 lowest-agency matchups, that member needs investigation.

Before/After Workflow
bash# Before change
node run-matrix.js --sample 50 -n 200 --json
# → saves output/matrix-2026-02-21T...json

# Make your balance change

# After change
node run-matrix.js --sample 50 -n 200 --json
# → compare Quality Averages, anomaly counts, profile breakdowns
For reproducible comparisons, you can fix the dungeon profile:
bashnode run-matrix.js --probe-dungeon tactical --combos -n 200 --json
This gives you a consistent slice to compare across changes.