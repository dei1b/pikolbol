# Match Medals and Cosmetics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reward completed CPU matches with persistent medals and cosmetic paddle finishes.

**Architecture:** Readable modules own career storage, match metrics, medal evaluation and UI. Exact-match bundle hooks feed actual engine events and mount React-owned UI hosts; a per-human-actor material override equips finishes.

**Tech Stack:** Existing JavaScript/Turbopack static game, Three.js renderer, localStorage, Node test runner, Playwright/Edge, Android WebView.

**Spec:** `../specs/2026-10-30-progression-and-competition.md` — read before executing.

## Global Constraints

- All Shared requirements and milestone 1 values in the spec apply verbatim.
- Planning only until the user approves. Do not add the deferred features.
- Implement sequentially in the existing chat; no delegated agents are needed.

## File Map

- `site/career.js`: versioned persistence, validation, receipt deduplication and equipment selection.
- `site/match-medals.js`: event-derived metrics, eligibility and the eight medal rules.
- `site/career-ui.js`, `site/career.css`: Career, rewards on results, equipment preview and badges.
- `site/equipment.js`: cloned paddle materials for human actors and resource cleanup.
- `tools/add-career.cjs`: idempotent, exact-match bundle installer; fail on missing or ambiguous anchors.
- Modify `site/index.html` to load modules; modify both existing game chunks only via installer.
- Tests: `tools/check-career.cjs`, `tools/check-match-medals.cjs`, `tools/check-career-browser.cjs`.

## Review Focus

- Duplicate result callbacks, rerenders and rematches must not grant the same receipt twice (task 1).
- Lost, restarted and CPU-only simulation matches must not create false rewards (task 2).
- A CPU partner's service faults/perfect hits must not count as human actions (task 2).
- Missing/corrupt/full storage must not damage existing progress or promise unsaved unlocks (task 1).
- Equipping one paddle must not recolor an AI actor or leak materials across rematches (task 3).

### Task 1: Career storage and idempotent rewards

**Interfaces:** `RallyCareer.load() -> CareerState`; `finalizeMatch(record) -> {saved,duplicate,newMedalIds,newItemIds,error?}`; `equip(slot,itemId) -> {saved,error?}`. `MatchRecord` contains `id`, `mode`, `format`, `scoring`, `target`, `difficulty`, `pace`, `rivalId`, `winner`, `points`, `eligible`, `metrics` and optional `ladderStageId`. Modes are quick, tournament, ladder or rush. Metrics are defined in task 2. `CareerState` has the exact fields from the spec.

- [ ] Write `tools/check-career.cjs`: first win unlocks lime once; a repeated receipt leaves totals unchanged; a new rematch ID increments wins; unknown equipment IDs are rejected; old unrelated keys remain byte-for-byte unchanged; malformed data is backed up; a failing write returns `saved:false` without publishing permanent unlocks; receipts retain at most 200 entries.
- [ ] Run `node tools/check-career.cjs` and confirm failure before implementation.
- [ ] Implement `site/career.js`; stage state changes until the storage write succeeds, with in-memory unsaved match data separate from committed equipment/unlocks. Use crypto-generated IDs once per actual match.
- [ ] Run the test and require all assertions to pass.
- [ ] Commit the storage module and its tests with a descriptive message.

### Task 2: Metrics, medals and results hook

**Interfaces:** `RallyMedals.begin(engine,context) -> tracker`; `observe(tracker,events,snapshot) -> void`; `finish(tracker,result) -> MatchRecord`; `abandon(tracker) -> void`. Context includes stable `matchId`, mode/config, human player IDs and lead rival ID. Metrics: `maxDeficit`, `longestRally`, `humanServes`, `humanServiceFaults`, `humanPerfectHits`. Existing team win totals and distinct rival wins come from Career. `finalizeMatch` evaluates the spec's eight rules using the record and prior state.

- [ ] Write tests for every medal threshold, including deficit 3 versus 4, contacts 14 versus 15, four versus five perfect human hits, five clean serves versus one service fault, normal versus hard wins, three distinct rivals versus duplicate rival wins. Losses may earn Long rally/Sweet spot only. Assert assists eligibility, target >= 7, power-ups exclusion and quit/restart/practice/simulation exclusions.
- [ ] Add event fixtures for a human serve into net, a CPU-partner serve fault, and an opponent error after a legal return. Only the first increments `humanServiceFaults`.
- [ ] Run `node tools/check-match-medals.cjs`; confirm the intended failure.
- [ ] Implement `site/match-medals.js` and `tools/add-career.cjs`: begin once per live match, observe each event batch once after `step`, finalize once at the actual result callback, abandon on uncompleted teardown. Keep tournament result handling intact. Add dedicated title/results hosts rather than parsing rendered scores.
- [ ] Run both functional suites and a real browser match that completes into results. Require one receipt and one medal grant across rerenders/reopening results.
- [ ] Commit the event hooks and medal implementation.

### Task 3: Career UI and equipped paddle finishes

**Interfaces:** `RallyCareerUI.mountHome(host)`, `mountResults(host,award)`, `openCareer()`; `RallyEquipment.apply(actor,itemId)` and `dispose(actor)`.

- [ ] Write browser assertions: Career is reachable; locked rewards explain the exact medal trigger; Equip accepts only unlocked items; a selected finish survives reload; only human-controlled actor paddles change; CPU materials and paddle dimensions are unchanged; repeated rematches dispose cloned materials.
- [ ] Confirm failure, then implement the two UI files and equipment module. Use the existing lime/dark-green theme, model portraits, and familiar large touch buttons. Add no in-match reward panel. Show unsaved progress explicitly when persistence fails.
- [ ] Review Career/results at 393×852 and 915×412, including long medal text and all eight unlocked medals. Ensure the result actions and Android Back/pause flow remain reachable.
- [ ] Run `node tools/check-career-browser.cjs`, `node tools/check-serving.cjs`, `node tools/check-recorded-umpire.cjs`, `node tools/check-tied-score-calls.cjs`, `node tools/check-rival-animations.cjs`, and `node tools/check-landing-guide.cjs` from the directory each tool expects. Require exit 0.
- [ ] Commit the UI/equipment changes.

### Task 4: Package and milestone review

- [ ] Run `node tools/prepare.mjs`, increment Android version from the then-current version, run `android/build.ps1`, and require successful signature verification.
- [ ] If USB is available, install in place with `adb install -r`; verify package version and test one earned reward plus restart persistence on the phone. Do not clear data.
- [ ] Save review screenshots and report the unlocks, tests and any remaining limitations. Wait for milestone review before starting Ladder.
