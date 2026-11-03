# Android LAN multiplayer design

## Approved scope

Two to four Android phones on the same Wi-Fi network or phone hotspot. One Android phone hosts; no PC, original online service, account or internet connection is required. Singles supports two humans. Doubles supports two to four humans, with AI filling unoccupied seats. The user selected this scope on November 4, 2026.

## Player flow

Add a distinct LAN multiplayer entry to the home screen while retaining all offline modes. It opens Host game and Join game.

The host chooses a display name, character, singles/doubles, Traditional/Rally scoring, target score, Classic/Blitz pace and court. The lobby shows connected players, teams and CPU seats. The host can assign doubles seats before starting. Character choice and readiness belong to each player; match settings belong to the host.

Hosting displays the phone's local IPv4 address, port and a fresh six-digit room code. Joining requires the host address and code. Manual address entry is the first-release connection method; it works without multicast discovery or location access. Display all usable local addresses when a phone has multiple network interfaces. Include concise same-Wi-Fi/hotspot help and a clear wrong-code, room-full, version-mismatch or connection-failed message.

Phones must use a compatible game build. A host starts only with at least two connected humans and all guests ready. All players receive the same configuration before simulation starts. Guests cannot alter the host's match settings or begin a match.

## Runtime architecture

Use the existing authoritative game engine on the host phone. It owns scoring, legal-contact checks, CPU players, serving order, spin physics and outcomes. Guests send their controls and selected spin to the host, rather than sending positions or points. Human inputs are tied to the authenticated connection's assigned seat, preventing a guest from controlling another player.

Reuse the native touch controls, camera, renderer, umpire, ambience and HUD. The existing online seat-view transformation can map each device's player to the near side and local player zero. Preserve spin metadata when rotating ball positions and velocities, including the angular velocity vector, so screwball direction remains correct from either end of court.

Host snapshots and ordered events are sent approximately twenty times a second and immediately for important events. Guests interpolate snapshots for smooth movement; they do not independently score or choose ball outcomes. Coalesce movement updates while preserving one-shot shot/serve actions in ordered bounded queues. Clear stale input on pause, timeout and disconnect. Host input validation restricts axes, shot types, spin modes and payload sizes.

Each human carries an independent spin selection and movement-assist preference. Curve Left/Right remain serve-only. One player's curve serve must not reset another player's spin selection. Power-ups and automatic swinging are off for the initial LAN release. LAN matches do not award CPU-match Career medals or advance Rival Ladders.

## Android transport

Add a small native TCP transport and a narrowly scoped JavaScript bridge. The host opens a local listening socket; guests connect only to literal private-network addresses. A connection first verifies room code, protocol and compatible build before it is assigned a seat. Bound message size, connection count and queues, and close sockets cleanly on exit or activity destruction.

Only bundled trusted pages retain access to the bridge. Continue blocking external navigation, telemetry and original online services. Add the Android network permission required for LAN sockets, without relaxing the WebView's existing external-request restrictions or loading remote scripts. The permission name INTERNET is Android's socket permission and does not imply the game needs an internet connection. No port forwarding, public server or router configuration is part of the player flow.

Local-network protection differs by Android version and target SDK. The current installer targets API35; verify official Android guidance during implementation, handle permission-denied failures and avoid promising support for untested future permission modes.

## Pause, leaving and interruption

Pausing or backgrounding any participant freezes the shared match; everyone sees who paused. Continue processing connection/control messages while simulation is paused. Resume only after all participants are ready to continue. No timer may silently advance on one device.

If a guest disconnects unexpectedly, abandon the current match without recording a win or loss, return remaining participants to the lobby, and explain who disconnected. The host can refill a slot or start a fresh match with AI in an empty doubles seat. Do not silently substitute AI mid-rally. If the host leaves or the hosting activity is destroyed, end the room and return guests to the LAN screen with an explanation. Initial release does not migrate hosting or restore a partially played match after a process restart.

Rematches use the lobby and a new shared match identifier. Disable the native single-player Restart control in a LAN match so one device cannot restart by itself.

## Validation and delivery

Unit and transport checks cover room authentication, full rooms, wrong versions, malformed/oversized input, seat ownership, duplicate/stale input, lifecycle cleanup and disconnect paths. Browser checks exercise two and four participants, singles/doubles, both scoring modes and paces, local camera/controls, serving and spin, shared scores/results, pause and lobby return. Confirm LAN never advances CPU Career or Ladder saves.

Build and sign the same Android package for all phones, preserving existing saved progress. Test one physical Android host and a second peer when available. If only one Android device is connected, use transport/browser peers for functional coverage and explicitly report that two-physical-phone Wi-Fi/hotspot validation remains outstanding. Do not describe USB-forwarded testing as a real Wi-Fi test.

The existing PC-only launcher remains operational; this release's host/join transport is an Android capability, and the PC menu should explain that rather than present a nonworking join screen.

## Repository policy

Create a descriptive feature branch such as android-lan-multiplayer from the current clean master checkout. Preserve the Android signing key and local launcher paths. Commit locally after checks; do not push, merge or publish without an instruction.

## Supporting documentation

- Android local network permission: https://developer.android.com/privacy-and-security/local-network-permission
- Android network service discovery (a later optional enhancement): https://developer.android.com/develop/connectivity/wifi/use-nsd

## Approval status

User approved this design with “proceed” on November 4, 2026. Implementation is tracked in ../plans/2026-11-04-android-lan-multiplayer.md.
