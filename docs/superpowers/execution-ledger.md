# Progression execution ledger

- User approved implementation; Ladder is Traditional to 11, win by two.
- Branch: progression-and-competition. Baseline: cafe9c5.
- Ruling: use a feature branch in the current checkout instead of relocating the working copy. The local launcher/server and Android signing key are tied to this folder; changing them adds deployment risk without helping this single-worker implementation.
- Ruling: execute all three milestones continuously under the user's implement instruction. Each milestone gets tests, an APK and a commit; report progress without requiring repeated approvals.
- Status: milestone 1, storage and metrics underway. No feature changes before the tests below are written.

## Final verification and decisions

- All three milestones implemented: Career medals/cosmetics, Traditional-to-11 Ladder, and three-minute Blitz Rush.
- Whole-branch review found two issues. Added failing regressions, then fixed malformed Career object recovery and expiry-before-serve handling. The Rush clock is now evaluated before simulation can launch another serve.
- Added a failing partner-switch service-fault attribution case, then fixed tracking to remember human control at serve time.
- Ruling: the user requested removing repeated score counts in all modes during implementation. The scoreboard now shows team points once; the right column shows pace/target/scoring, or Time/countdown/Rush. The serving pip/number stays visible. Eight format/scoring/pace combinations passed browser checks.
- Career storage/medals, Ladder, Rush clock/serve/golden rules and tied umpire calls pass their pure checks. Career and Rush browser flows pass in 393×852 and 915×412; Ladder launch/results/save tests and 40 seeded stage/format/pace simulations pass. Serving tests cover 32,768 transitions. Audio, model rig and landing-guide regressions passed.
- Real phone: Career transaction/equipment persistence tested with a temporary namespaced save, leaving existing saved data untouched. Ladder launched in doubles with Traditional to 11. A real Rush match reached results after 181.454 seconds measured following resume; its timer reached zero, counted the final rally, and saved the result. Pause and Android background/resume excluded inactive time.
- The final scoreboard change has its own browser regression; the completed phone timing run remains applicable because the later change is display-only. No second full timer run was required.
- Initial Ladder order uses existing difficulty and personalities without hidden buffs. Forty seeded simulations verify functioning matchups, not subjective human difficulty; balance should be refined from player feedback.
- APK checkpoints 1.4.0 and 1.5.0 were built/signed and installed in place. Final version 1.6.2 includes all three features and the user's scoreboard correction.
- Ruling: retain the named local feature branch with commits; no push, PR or merge was requested. The working checkout is the user's PC runtime, so keeping it here makes the delivered game available immediately.

- Task 1: career storage tests observed missing-module failure, then passed. Receipt deduplication, safe writes, old-save preservation and unlock persistence covered.

- Milestone 1: storage/medals and mobile UI/equipment tests passed. Serving (32768 transitions), 112 audio clips, four rigs and four court guide checks passed. APK 1.4.0 built and signed. Phone USB available; installing checkpoint in place. Starting Ladder next.

- Milestone 2: Ladder progression and browser tests passed; forty seeded stage/format/pace simulations yielded finite positions and rallies. Quick-match preferences unchanged. APK 1.5.0 built for phone checkpoint. Preparing Rush timer tests next.
