# Curving Spin Implementation Plan

**Goal:** Visible screwball serves and realistic-style spinning shots, with matching AI/guide prediction.
**Approved direction:** Player selected Curve Left and Curve Right added to the current selector, relative to the hitter. Use bounded spin-dependent sideways force, air drag, spin decay and bounce friction rather than a scripted lateral offset. This is a tuned game model, not a calibrated pickleball aerodynamics model.
**Architecture:** Pure spin-physics.js owns deterministic integration, net/bounce events, landing and free flight. Flat retains native physics. spin.js owns input, spin-at-contact and AI choices. Exact bundle hooks route spinning states and predictions through shared physics. Preserve native scoring, collision rules, local saves and remapped controls.

- [x] Add failing curve tests covering opposite curve directions, mirrored teams, speed dependence, no energy from air forces, spin decay, bounce friction and prediction agreement.
- [x] Implement shared 3D spin force and bounded contact launch adjustment. Preserve Flat and scripted practice, allow ordinary serve/rally errors rather than force every ball in.
- [x] Integrate clone/live/guide/smoothed rendering with curved trajectories; verify legal net crossing and bouncing.
- [x] Extend existing selector to five choices, keeping both mobile orientations, swipe and left-handed modes usable. Retain remappable keyboard cycling and add readable curved trail cues.
- [x] Run browser/native/regression checks and fresh review, fix concrete findings, build phone installer, install if connected, and commit locally.

## Decisions and evidence

- Continue in the established local feature checkout and branch rival-tactics-and-spin; no remote push or merge requested.
- User wants visibly curved flight, rather than only the existing dip/bounce approximation. NASA Glenn's curveball trajectory explanation informs the spin/speed-dependent force direction; coefficients require gameplay tuning and do not claim empirical calibration for a perforated pickleball.
- Numerical integration must retain net and ground event checks within substeps. Every predictor must use the same code; do not add a render-only curve.

- User steering: Curve Left and Curve Right apply to SERVES ONLY. Human and CPU shot selection enforce that rule; controls disable outside intro/serve, keyboard cycling skips them in rallies, and side-curve serves reset human selection to Flat.
- Verification: initial missing-module test failed before implementation; serve-only regression then failed on curve-left drive before the restriction, and now passes. Native spin forces, air energy dissipation, decay, bounce friction, clone/live/predicted landing and net checks passed. Twelve actual serves from both teams/directions showed 30.3–30.7 cm lateral bow and guide errors below .02 m.
- Browser: selector layouts, key migration/rebinding/save, left-handed and Swipe controls, serve-only disabling/enabling and rally keyboard cycle passed. Sixteen seeded format/scoring/pace simulations passed before final serve restriction; final spin suite rerun after restriction. Ladder40 simulations/result/save flow and Rush pause/timer checks passed; guide remains visible on all four courts and 32768 serving-rule transitions passed.
- Review: fresh reviewer reported no actionable correctness findings, independently confirming ordinary low blunders still net and picker fits320px portrait/landscape. New serve-only steering covered by explicit unit and browser checks.
- Performance: desktop guide benchmark averaged0.41ms per call over200 warmed calls; no extra cache added without evidence of a bottleneck.
- Physics note: air drag means comparing absolute outgoing speed across differently launched shots is not a valid isolated bounce comparison. Updated native bounce check to compare Topspin/Slice at equal incoming velocity; launch endpoint tolerance is1.5cm rather than exact analytic equality for the numerical solver.

- Delivery: final v1.9.0/code32 signed APK installed in place; packed spin.js explicitly verified to contain serve-only guard, and installed package version verified. Phone remained locked, so real-device curve touch/play check was not completed. Browser and physics checks passed; local saves were not cleared. Final16 seeded spin simulations passed after serve-only steering. No remote push/merge.
