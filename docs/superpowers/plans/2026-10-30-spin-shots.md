# Spin Shots Implementation Plan

**Goal:** Add selectable Flat, Topspin and Slice to offline shots and serves.
**Spec:** ../specs/2026-10-30-topspin-and-slice.md
**Approved controls:** User selected the three-state selector. Flat remains default. Sidespin is deferred.
**Architecture:** Shared spin-aware analytic gravity and bounce calculation used by native live simulation, clone predictions and landing guides. Apply bounded spin at paddle contact, retaining Flat calculations exactly. Native scoring, legal-contact rules and fixed AI difficulty remain.

- [x] Add failing physics tests: Flat parity, distinct spin flight/bounces, mirrored directions, finite net/bounce events, deterministic AI spin selection.
- [x] Add spin module and exact idempotent bundle hooks, keeping physics/prediction consistent and scripted practice unchanged.
- [x] Add compact mirrored touch selector, keyboard cycle binding and ball motion/colour cues; test portrait, landscape and remapping.
- [x] Validate actual spin serves/rallies, AI interception and landing markers across courts, formats and pace. Review, fix findings, build/sign/install phone update and commit locally.

## Execution ledger

- Continue on the existing local progression-and-competition feature branch; the PC server and Android signing key are tied to this checkout.
- Ruling: this first release includes topspin and slice on paddle-contact serves, drives, drops and dinks. Lobs, overhead smashes, power shots and scripted practice stay Flat for predictable balance.
- Ruling: selector changes apply to the next human paddle contact and remain selected within the match; reset Flat when entering a different match. Keyboard cycling is remappable through existing settings.
- Ruling: add moderate constant vertical acceleration to the analytic model, plus a bounded bounce change. This is an arcade approximation of spin, not a full fluid-dynamics simulation. Preserve seeded randomness and no score-based difficulty changes.

- Verification: observed missing spin module failure before implementation, then green shared physics and native-integrator tests. Native tests cover mirrored trajectories, clone/live equality, analytic landing vs actual bounce and net collisions.
- Browser: sixteen seeded spin matches across singles/doubles, Traditional/Rally and Classic/Blitz (eight repeated in portrait/landscape), live Flat/topspin/slice serves from both teams, pause hiding/resume, keyboard migration/rebind/save and mirrored selector all passed. Existing fixed-AI, Rush browser/lifecycle, court-guide and 32,768 serving transition checks passed.
- Review: fresh reviewer found one P2: Swipe mode lacked the selector. Added a failing actual Swipe browser test, anchored selector above swipe hint, and passed both handedness modes. No other concrete findings.
- Delivery: signed offline APK 1.8.0 (code31) installed in place. Actual connected phone test passed touch Topspin selection, spin serve with103 predicted samples, pause hiding and return-home career-save preservation. Subjective spin strength remains open to play feedback.
- Ruling: preserve spin through smoothed view velocities and choose an unused default keyboard key when old saved remaps occupy Q. Flat stays default for every new match.
- Keep local feature branch; no merge/push requested.
