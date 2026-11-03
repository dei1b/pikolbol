# Android LAN Multiplayer Implementation Plan

**Goal:** Host/join 2–4 Android phones without a PC or internet.
**Spec:** ../specs/2026-11-04-android-lan-multiplayer.md (approved by user: proceed).
**Architecture:** Native bounded TCP transport and trusted WebView bridge; JS lobby/protocol; host-authoritative existing engine with local-seat views and guest snapshot interpolation. No external service.
**Tech stack:** Java8-compatible Android26+/target35, bundled JS, existing renderer/controls, Node/Playwright, JDK test harness.

## Tasks

- [x] 1. Native transport: tests first, authenticated bounded framing, private-IP join validation, version/room/full/timeout cleanup; Android bridge and network permission.
- [x] 2. JS protocol: tests first, seat ownership, readiness/settings, bounded one-shot input queues and snapshot/event ordering, shared pause, disconnect-to-lobby, per-human spin/assists.
- [x] 3. Runtime: exact hooks into existing match runner; host steps all players; guests send input/render authoritative snapshots; map local view including angular velocity; prevent CPU rewards/restarts, lifecycle cleanup.
- [x] 4. Lobby UI: Home LAN entry, host/join/address/code/name/character, host settings/court preview/seats/start, guests ready; pause/disconnect/results/lobby transitions.
- [x] 5. End-to-end tests: 2/4 peers, both formats/scoring/pace, spin serves, shared scores, pause/lifecycle, malicious input, cleanup and saves. Fresh review, fix findings, signed APK and local commit.

## Constraints and review focus

- Native bridge only on bundled origin; retain external navigation/CSP restrictions.
- No public hostnames or public IP destinations in Join. Manual private IPv4 address/port first release.
- Guest never supplies its authoritative seat, position, score or outcome.
- Bound message bytes, queue size, packet sequences and connection count.
- Host/config/version/room mismatch fail with readable status.
- Any pause freezes simulation, clears pending input; background networking does not advance game time.
- Any unexpected guest loss returns all remaining players to lobby; host loss ends room.
- Curve Left/Right serves only, per-human spin selection; rotate 3D spin with seat view.
- Preserve Career/Ladder/tournament saves and single-player behavior; LAN gives no CPU medals.

## Ledger

- Branch android-lan-multiplayer created from current clean master; only approved spec was untracked. Continue in place because signing key and launcher paths are established here.
- User approved concrete design on November4. No more feature approvals needed inside this scope.
- Manual address entry avoids discovery/location permissions; INTERNET permits native sockets but no original online requests are enabled.
- One fresh whole-feature review at end; implement sequentially in this session.

- Task1: missing LanTransport compilation failure observed before native implementation; JVM socket checks now pass auth, wrong version/code, room capacity, ordered bidirectional messaging, oversized framing rejection and cleanup. Native bridge preserves bundled-origin CSP/navigation restrictions.
- Task2/3: missing protocol module failure observed before implementation. Protocol sanitation/queue/seat tests passed. Browser2-phone singles,2-phone co-op doubles with2CPU slots,3-phone doubles with1CPU,4-phone doubles, both scoring modes and paces, shared score/result, human spin independence, long host pause, guest/host disconnect, lobby return and CPU-save exclusion passed.
- Review found host-pause timeout(P1) and offline-spin override(P2); both reproduced with failing regressions and fixed. Follow-up found slow-loader input timeout(P2), reproduced at6 seconds, fixed by resetting participant liveness when loading completes. Lifecycle/loading/offline-spin checks now pass.
- Per-seat mapping retains ball spin/angular velocity metadata; guest input is applied only to that connection's assigned world seat. Inputs older than1 simulation second are ignored, stale movement stops, a nonresponding guest returns room to lobby, and the loading barrier has a bounded timeout.
- Actual Android host +3 browser TCP peers passed four humans, native PIN handshake, remote input/spin, native background/resume freeze, guest disconnect to lobby, host exit and unchanged Career save. This used USB forwarding and does not constitute two-physical-phone Wi-Fi coverage.
- Regression checks passed Career mobile/results/equipment, fixed nativeAI stages, Rush timer/background/results, Ladder saves/40 seeded stages, swipe spin, 32768 serving transitions, and112 recorded umpire clips/queue/volume/cancel/live playback. APK2.0.0/code33 built and verified with v2/v3 signatures; install uses replace-preserve-data.
- Ruling: Native TCP build tag lan-1 is the compatibility boundary for this protocol/asset generation. Bump it and the JS build tag together for incompatible future builds.
- Ruling: manual private IPv4 address entry is intentionally first release; no multicast discovery, PC host mode, host migration or mid-match reconnect is claimed.

- Final delivery: rebuilt/signed APK2.0.0/code33 installed; installed version and packed LAN assets verified. Repeated actual Android host+3browser TCP-peer test after slow-loader fix passed background/resume, inputs/spin, disconnect and Career preservation. No second Android phone was available, so Wi-Fi/hotspot two-phone coverage remains explicitly unverified. Project remains on android-lan-multiplayer; no push/merge requested.
