# Rival Ladder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ten-stage, independently saved singles and doubles ladders using the existing rivals.

**Architecture:** A data-driven stage catalog produces ordinary game plans with explicit ladder metadata. The existing match runner and Career transaction finalize results, unlock stages and grant first-clear badges together.

**Tech Stack:** Existing JavaScript game, Career localStorage module, Playwright/Edge, Android WebView.

**Spec:** `../specs/2026-10-30-progression-and-competition.md`.

## Global Constraints

- All Shared requirements and milestone 2 values in the spec apply verbatim.
- Start only after milestone 1 review. Reuse Career instead of creating another save system.
- Keep quick-match scoring, opponent selection and saved court settings intact.

## File Map

- Create `site/rival-ladder.js`: ten stages, access checks and match-plan factory.
- Create `site/rival-ladder-ui.js`: track selection, stage cards, setup and results continuation.
- Modify `site/career.js`, `site/match-medals.js`, `site/career-ui.js`, `site/career.css`, `site/index.html`.
- Modify the existing AI plan helper to accept an explicit rival ID without changing the saved quick-match choice.
- Create `tools/add-rival-ladder.cjs`, `tools/check-rival-ladder.cjs`, `tools/check-rival-ladder-browser.cjs`.

## Review Focus

- A repeat callback must not unlock two stages (task 1).
- Singles and doubles progress must remain independent (task 1).
- Locked stages and altered rival configurations must not pass as a valid clear (task 1).
- Leaving/restarting setup must not change ordinary quick-match preferences (task 2).
- Difficulty and pairing must match the stage card, including the actual CPU partner (task 2).

### Task 1: Stage plans and saved progression

**Interfaces:** `RallyLadder.stages` is the ten-row table from the spec; `getTrack(format) -> {clearedIds,nextStageId,champion}`; `createPlan({stageId,format,pace,court,character,partner,seed}) -> MatchPlan`; `validateCompletion(record) -> boolean`. Add an atomic Ladder branch to `RallyCareer.finalizeMatch(record)` using `ladderStageId`, format and stage config.

- [ ] Write `tools/check-rival-ladder.cjs`: fresh track exposes stage 1 only; winning stage 1 opens stage 2 exactly once; a loss/quit does not advance; clearing singles leaves doubles untouched; replaying a cleared stage gives no duplicate badge; stages 3/6/10 grant their specified badge once; locked or configuration-mismatched records are rejected.
- [ ] Confirm failure, then implement the catalog, plan factory and Career update. Use Traditional to 11, win by two, the exact difficulty table, existing rival personalities/partners, and selected Classic/Blitz pace. No lives or progress loss. Test that receiving-team wins do not award points and doubles follows the existing first/second-server sequence, including the opening single-server exception.
- [ ] Run the test and require all assertions to pass; reload saved state and repeat the independent-track checks.
- [ ] Commit the stage/progression implementation.

### Task 2: Ladder screens and real match integration

**Interfaces:** `RallyLadderUI.mountHome(host)`, `openTrack(format)`, `openStage(stageId,format)`, `mountResults(host,record)`. Extend `RallyAI.preparePlan(plan,opponentId?)`; omitted ID preserves today's saved quick-match behavior. Ladder passes an explicit ID.

- [ ] Write browser tests for the Home entry, two tracks, correct portraits, one tactical hint per rival, locked stage explanation, correct next/retry result action, and choosing a court only in stage setup. Assert no automatic next match.
- [ ] Confirm failure, then implement title/results hooks and stage setup using the current model portraits and court preview images.
- [ ] Run seeded CPU simulations for all ten stages in both formats and both paces. Confirm finite positions, completed rallies, stage/rival/partner/difficulty agreement and legal serving. Use these as functional checks; assess human difficulty separately.
- [ ] Complete a stage in the browser and verify one Career receipt, correct badge state and resume to the next stage after reloading.
- [ ] Compare quick-match preferences before/after a ladder run; require unchanged saved opponent, scoring and pace. Review portrait/landscape layouts.
- [ ] Commit screens and match integration.

### Task 3: Balance review and delivery

- [ ] Play representative stages 1, 5, 9 and 10. Check that their actual tactics and difficulty agree with their descriptions. If order/tuning changes are needed, document them for review; do not silently add hidden buffs.
- [ ] Run Career, medals, Ladder, serving, recorded umpire and landing-guide regressions. Require exit 0 and no JS errors in browser flows.
- [ ] Regenerate the asset manifest, increment version, build/sign the APK and perform an in-place phone update/smoke test if connected.
- [ ] Present the milestone for review before beginning Blitz Rush.
