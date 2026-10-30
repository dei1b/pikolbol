# Blitz Rush Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a three-minute timed Rally mode with Blitz pace and one golden rally when tied.

**Architecture:** A separate Rush controller observes unscaled active frame time and controls timed completion at engine phase boundaries. It uses the existing rally physics, serving placement, AI and results pipeline while disabling ordinary score-limit completion for Rush only.

**Tech Stack:** Existing JavaScript engine, browser animation loop, Android lifecycle bridge, Career results, Playwright/Edge.

**Spec:** `../specs/2026-10-30-progression-and-competition.md`.

## Global Constraints

- All Shared requirements and milestone 3 timer/serving values in the spec apply verbatim.
- Start only after Ladder review. Keep ordinary Classic/Blitz scoring and timers unchanged.
- No new voice generation, remote services, gameplay power-ups or auto-swing.

## File Map

- Create `site/blitz-rush.js`: clock, expiry/golden-rally state machine, serve clock and results.
- Create `site/blitz-rush-ui.js`: mode setup, scoreboard clock and existing serve-hint countdown.
- Create `tools/add-blitz-rush.cjs`: exact-match engine/runner/snapshot/result hooks.
- Modify `site/career.js`, `site/match-medals.js`, `site/career.css`, `site/index.html`.
- Tests: `tools/check-blitz-rush.cjs`, `tools/check-blitz-rush-browser.cjs`.

## Review Focus

- Pausing/backgrounding must not consume time or cause a catch-up jump (task 1).
- Expiry during a rally must count that rally exactly once, including the tying point (task 1).
- Serve timeout must behave identically for human and CPU servers (task 2).
- Rush must finish once without fabricated points or duplicate Career rewards (tasks 1/3).
- Clock/countdown must stay readable without covering controls in either orientation (task 3).

### Task 1: Clock and completion rules

**Interfaces:** `RallyRush.create(config) -> state`; `advance(state,{deltaSeconds,paused,visible,phase}) -> void`; `afterRally(state,score) -> {action:'continue'|'golden'|'finish',winner:null|0|1}`; `betweenRallies(state,score)` returns the same action type. State has `remainingSeconds`, `expired`, `golden`, `finished`, `winner`. Initial time is exactly 180 seconds. Delta is unscaled and clamped to 0..0.25 seconds per accepted active frame.

- [ ] Write deterministic tests: 180 seconds of accepted deltas expires; intro/paused/hidden deltas do not decrement; Blitz 1.2× simulation does not accelerate the clock; a large resumed delta cannot drain minutes; expiry between rallies with a lead finishes immediately; expiry mid-rally waits; a tying final point starts exactly one golden rally; golden winner produces exactly one finish.
- [ ] Confirm failure, then implement controller and hook unscaled time at the active match runner. For Rush only, bypass the ordinary target-score winner check. Add a dedicated `finishTimedMatch(winner)` engine hook that sets the winner/over phase, emits match-over and says Game once without awarding invented points.
- [ ] Test winning/tying/losing final rallies for both teams, including no active ball at expiry, and repeated completion callbacks. Run ordinary serving tests to confirm no scoring changes outside Rush.
- [ ] Commit the timer and timed result hooks.

### Task 2: Five-second serve clock

**Interfaces:** `RallyRush.advanceServe(state,{deltaSeconds,ready,phase,serverId,serveStarted}) -> {remainingSeconds,autoServe}`. Reset for each service turn; advance only when positioned/ready and match is active. `autoServe` fires once at 0.

- [ ] Write tests for no countdown before ready, exactly five seconds after readiness, human/CPU parity, pause freeze, manual serve at the boundary, reset after a side-out and no extra serve after match completion.
- [ ] Confirm failure, then hook the existing normal drive-serve action once on timeout. Reuse legal server placement and launch logic; do not teleport players or penalize the score.
- [ ] Verify Traditional quick matches and ordinary Blitz have no new serve clock. Verify a Rush CPU starts its normal early serve rather than waiting for timeout.
- [ ] Commit serve-clock logic and tests.

### Task 3: Setup, scoreboard, results and rewards

**Interfaces:** `RallyRushUI.mountHome(host)`, `createPlan(setup) -> MatchPlan`, `mountClock(host,state)`, `mountServeCountdown(host,state)`, `mountResults(host,record)`. Rush plans specify `mode:'rush'`, Rally scoring, Blitz pace and 180 seconds. Career totals store Rush bests per format and difficulty: wins, best winning margin, lead changes and longest rally.

- [ ] Write browser tests for selecting rival/difficulty/court/format, a clock within the existing scoreboard, final-three-second service hint, golden-rally status, results/rematch, one reward receipt and separate bests by format/difficulty.
- [ ] Confirm failure, then implement UI, career eligibility and result metrics. Track lead changes only when a team gains a lead over the other; transitions into a tie do not count as a new lead.
- [ ] Check 393×852 and 915×412, left/right-handed controls, pause, Android Back and screen rotation. Keep medals/collection elements off the live court.
- [ ] Run Rush deterministic/browser tests, Career/medal/Ladder suites, serving, recorded score calls, tied-score calls and landing-guide checks. Require exit 0 and no browser errors.
- [ ] Commit the UI and career integration.

### Task 4: Real-device time and release gate

- [ ] Build/sign the new APK after updating its version and manifest.
- [ ] When connected, install over the existing game. Compare a real three-minute match with a stopwatch; pause and background it, then confirm the clock resumes without skipping ahead. Test human serve timeout and a tied expiry.
- [ ] Verify one completed Rush result and its reward persist after closing/reopening the app. Preserve earlier Ladder/medal saves.
- [ ] Report tested behavior and any outstanding limitations; do not mark the three-stage project complete while required real-device or lifecycle checks remain unresolved.
