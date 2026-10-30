# Progression and competition design

Status: approved by the user's "implement" instruction and implemented on branch `progression-and-competition`. Verification and execution decisions are recorded in `../execution-ledger.md`.

## Requested order

1. Match medals and cosmetic rewards.
2. Rival Ladder.
3. Blitz Rush.

The user requested this order and a plan before implementation. The specific numbers, rewards, ladder order and timer rules below are proposed defaults, not previously approved requirements.

## Shared requirements

- Work fully offline on PC and Android; no account, API key, ads or purchases.
- Preserve existing saves, settings, unlocked characters, courts, umpire recordings and controls.
- Keep existing quick-match Classic/Blitz pace and Traditional/Rally scoring choices.
- Existing characters and courts remain available; do not relock them behind progression.
- Rewards change appearance only; no speed, reach, accuracy, paddle-size or ball-physics bonuses.
- Show rewards in results and Career, not floating over the court.
- Court selection stays in match setup, not Settings.
- No new GLB exports.
- PC and Android progress remain separate, as today.
- Build, test and review each milestone before beginning the next; one APK per accepted milestone.
- Re-check USB availability before installing an APK over the existing app; do not uninstall or clear app data.
- Use descriptive Git branches without a codex/ prefix if a new branch is needed.

## Current code evidence

The game is a modified browser bundle, not a conventional application source project. The engine `pv` in `site/_next/static/chunks/0axfra5kwz6z1.js` exposes `stepPlayers(dt, inputs)`, `snapshot(localPlayer=0)`, `stats(localPlayer=0)`, `endRally(winningTeam, reason)` and `serverReady()`.

`stats()` already returns winners, errors, aces, longest rally, local shot counts and perfect contacts. Events include serve, hit (player, shot, volley, quality), rally-end and match-over. Live results flow from the match runner through `A.current({winner,points,stats})`. Progression must observe actual engine events and completed results, not infer outcomes from DOM text.

`site/game-mods.js` holds the current engine reference and quick-match pace. `site/ai-personalities.js` defines all ten rivals and creates quick-match plans. `site/sceneries.js` chooses local venues. `site/_next/static/chunks/3t2nbery9uokx.js` owns shared roster data and model-rendered portraits. The renderer actor `sF` owns a paddle object; cosmetic materials must be cloned per equipped human actor to avoid modifying other characters.

New logic should live in ordinary readable JS files. Use small, idempotent bundle-hook installers with exact-match checks. Keep the original match, tournament, portrait and voice behavior intact.

## Milestone 1: Match medals and cosmetics

### Player flow

Finish a match → existing result screen plus newly earned medals/rewards → Rematch, Career or Home. Home gains a Career entry. Career contains medal progress and a small paddle/badge collection with preview and Equip buttons.

### First medal set

| Medal | Exact proposed trigger | Reward |
| --- | --- | --- |
| First victory | First completed win against CPU opponents | Lime paddle finish |
| Finding form | Five completed CPU wins, cumulative | Coral paddle finish |
| Rival collector | Completed wins against three distinct lead rival IDs | Gold paddle finish |
| Long rally | Complete a match containing a rally of at least 15 contacts | Midnight paddle finish |
| Comeback | Win after trailing by at least four points in that match | Sunset paddle finish |
| Clean server | Complete at least five human serves with zero human service faults in one completed match | Mint paddle finish |
| Sweet spot | At least five human contacts with quality >= 0.9 in one completed match | Precision badge |
| Hard-earned | Win a completed match against Hard CPU opponents | Competitor badge |

The default paddle and no-badge appearance remain available. Each medal unlocks once; repeated wins still update totals but never duplicate unlocks. No currency, shop, random drops, daily streaks or XP system in this first release.

Equipment IDs/colors: `paddle-default` (original material), `paddle-lime` #D4F25A, `paddle-coral` #FF8B6E, `paddle-gold` #E7B64D, `paddle-midnight` #243B67, `paddle-sunset` #DB7956, `paddle-mint` #9CF2C2. The two medal badges are `badge-precision` (target motif) and `badge-competitor` (star motif), using existing vector icons. Medal IDs are the lowercase hyphenated names in the table.

Quick matches and tournament games against CPUs count, with target score >= 7, power-ups off and auto-swing off. Practice, spectating, online play, developer simulations, quits, restarts and abandoned matches do not count. Movement assist remains allowed. Ladder results count after milestone 2. Rush results count after milestone 3 except target-score eligibility is replaced with its valid completed timed-mode result.

Team achievements use the human's team result; Clean server and Sweet spot use human input-controlled players only, excluding the CPU partner. Count a service fault only when the human was the last server and the rally ends before a legal receiving return (out, net, kitchen or another serving fault). Confirm this attribution with real engine serve/return sequences before shipping.

Paddle finishes change only the human-controlled paddle's material color. Do not recolor AI paddles, jerseys or portraits. Badges appear in Career and results only.

### Save behavior

Use the new key `rally.offline.career.v1` with `version`, `medals`, `totals`, `rivalWins`, `unlocked`, `equipped`, `ladder` and recent completed-match receipts. Keep at most 200 receipts. A match gets a stable ID on creation and is finalized once; repeated callbacks and rematches must not reuse that ID. Duplicate completion callbacks must not grant rewards or advance the ladder twice.

Validate loaded data. Preserve malformed content in a backup key before starting a clean career; do not touch unrelated saves. If storage cannot be written, keep the current in-memory result and clearly state that career progress was not saved. Do not show a permanently unlocked reward until its write succeeds.

## Milestone 2: Rival Ladder

### Player flow and rules

Home → Rival Ladder → Singles or Doubles track → next rival → character, court and Classic/Blitz selection → match → results → next rival or retry.

Two independently saved tracks, one per format. Each is ten stages; one win clears a stage and opens the next. A loss keeps the current stage available with no lost progress or lives. Cleared stages can be replayed without repeated first-clear rewards. Use Traditional scoring to 11, win by two, power-ups off and auto-swing off. The user explicitly selected Traditional-to-11 for Ladder. This fixed scoring applies only to Ladder; quick-match choices stay unchanged. Doubles uses the existing first/second-server sequence, including the opening team's single-server exception; only the serving team scores.

| Stage | Rival | Difficulty |
| --- | --- | --- |
| 1 | Bea — Kitchen queen | Easy |
| 2 | Migo — Big hitter | Easy |
| 3 | Tala — Lob artist | Normal |
| 4 | Paco — Speedster | Normal |
| 5 | Isay — Steady hands | Normal |
| 6 | Jojo — Smash happy | Normal |
| 7 | Enzo — Net rusher | Hard |
| 8 | Nika — Counterpuncher | Hard |
| 9 | Rafi — Baseline sniper | Hard |
| 10 | Maya — Mix-up master | Hard |

Use existing AI personalities and their configured doubles partners. Allow the player to choose their own character and partner. Before each stage, show one short tactical hint based on the rival's existing strength/weakness description. No hidden reaction or accuracy buffs beyond the displayed difficulty.

First-clear badges at stages 3 and 6, and a format-specific champion badge at stage 10. Badge IDs are `ladder-{format}-stage-3`, `ladder-{format}-stage-6` and `ladder-{format}-champion`, using existing trophy/star vector motifs. Store stage clears and highest unlocked stage per track in the Career save. Resume returns to the next stage, not an in-progress rally. No auto-start after results. Balance through seeded matches and hands-on review; do not claim the proposed stage order is balanced until tested.

## Milestone 3: Blitz Rush

### Rules

- A separate mode, not a replacement for ordinary Blitz pace.
- Three minutes (180 seconds) of unscaled active match time, Blitz simulation speed, Rally scoring, singles or doubles, selectable rival/difficulty/court, power-ups off and auto-swing off.
- Exclude the intro, pause menu and time spent backgrounded. Include service setup and point-reset time after the intro.
- If time expires during a rally, finish that rally and award its point before deciding the winner.
- If time expires between rallies, compare the current scores immediately.
- A tie triggers one golden rally; its winner wins the match. No win-by-two requirement for the timed result.
- Once the server is positioned and ready, give both human and CPU servers five seconds to serve. If no serve occurs, automatically launch the normal drive serve. Show a small countdown only during the final three seconds; no service-fault penalty.
- A compact clock replaces the redundant Call score in the existing scoreboard (user feedback during implementation). Place service countdown next to the existing serve hint. Keep them clear of controls, court and announcements in portrait and landscape.
- Use the actual unscaled frame delta supplied to the match runner, capped consistently with the engine's 0.25-second frame clamp. Never use the accelerated engine `t` as the Rush clock. Android backgrounding and return must not consume the clock or produce a catch-up jump.
- Use a dedicated timed-mode match-over event compatible with the existing result and umpire flow. Do not fake a score-limit victory by inventing points.

Results show score, lead changes, longest rally, personal best winning margin and earned medals. Bests are separated by singles/doubles and difficulty. No artificial celebration during active play and no new voice generation is required.

## Delivery and review gates

Each milestone must have a passing functional test set, PC/browser visual review in 393×852 portrait and 915×412 landscape, an APK signature check and a real-phone smoke test when USB is available. Confirm installed version after an in-place update. Inspect previously fixed serving, recorded score calls, character appearances and landing guides after adding shared engine hooks.

Implementation plans:

1. `../plans/2026-10-30-medals-and-cosmetics.md`
2. `../plans/2026-10-30-rival-ladder.md`
3. `../plans/2026-10-30-blitz-rush.md`

Deferred: practice challenge courses, contextual coaching, broad match-history dashboards, extra skins, daily tasks, online accounts and leaderboards. Those were suggestions, not part of the three-step build order.
