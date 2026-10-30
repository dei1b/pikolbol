# Fixed Rival Tactics Implementation Plan

**Goal:** Give rivals situational tactics and ten fixed ladder skill steps.

**Architecture:** Extend existing RallyAI hooks using visible positions and seeded randomness. Interpolate opponent tuning once at match creation; never use score or player history. Keep native physics, bounce legality and contact assignment.

**Tech stack:** Existing JavaScript engine, Node assertions, Playwright, offline Android WebView.

**Approved direction:** User selected fixed progression and asked to proceed with the recommendation. Each stage stays the same on retry. Character strengths and weaknesses remain, Traditional to 11 and saved ladder clears are preserved.

- [x] Write failing checks for ten monotonic skill steps, partner isolation, fixed retries, position-aware shot/aim decisions and doubles cover.
- [x] Implement tuning in ai-personalities.js and tactical choices using current opponent positions, leaving opening bounce-aware shots unchanged.
- [x] Add a home-position hook for the non-receiving CPU partner; retain native designated hitter and legal movement clamp.
- [x] Explain stage progression in ladder setup; verify all personalities, real engine simulations, rematches and practice.
- [x] Review changes, build signed Android update, install if connected, and commit feature locally.

## Execution ledger

- Ruling: continue in the existing progression-and-competition feature checkout, as previously established for the local server and signing key. No new worktree or relocation.
- Ruling: broad Easy/Normal/Hard labels and completion validation stay compatible; numerical opponent skill increases within those bands. Local partner tuning does not inherit ladder escalation.
- Ruling: no score-based adjustment, new physics, reaction bypass, player-data reset, or network requirement.

- Verification: observed initial ten-stage reaction assertion fail, then pass; review exposed native teammate escalation, regression failed at .16 versus .27, then passed after normal preset injection.
- Browser checks: actual native constructors for all ten stages retain identical Isay teammate tuning; 40 stage/format/pace and 80 rival/format/scoring/pace simulations passed. Ladder result/unlock/save flow, rematches, practice and personality distributions passed. Hook installer rerun twice without change.
- Review: fresh reviewer reported one P2 (teammate inherited Hard), fixed with unit and native constructor regressions; no other concrete findings.
- Balance limit: automated checks prove deterministic decisions, legality and functioning matches; subjective challenge needs player feedback and may warrant later tuning.

- Delivery: signed APK 1.7.0 (code 30) built and installed in place successfully on connected R5CR30BEB7W; package version verified. Keep changes on existing local feature branch; no merge or push requested.
