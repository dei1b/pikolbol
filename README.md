# Rally Offline

Rally Offline is a local adaptation of the PaddleUp browser pickleball game for Windows and Android. Play singles or doubles against computer opponents, practice shots, and enter tournaments without an internet connection. On Android, two to four players can also share a match over Wi-Fi or a phone hotspot.

## Getting started

### Windows

1. Keep the project folder together, including `site/` and `runtime/`.
2. Double-click **Play Rally.cmd**. It starts the local server and opens the game in Microsoft Edge app mode, or in your default browser if Edge is unavailable.
3. Choose **Quick match** to set up your first game.

The launcher uses the bundled Node.js runtime and requires no package installation. While the server is running, you can also open `http://127.0.0.1:8787` in your browser. Close the game window when finished and run **Stop Rally.cmd** when you want to shut down the local server. If the server fails to start, check `server-error.log` in the project folder.

### Android

Install the signed `Rally-Offline.apk` on a device running Android 8.0 or later, then open **Rally Offline** from the app drawer. The APK is a build output and is excluded from Git. See the [Android guide](android/README.md) for build requirements, LAN setup, and device test coverage.

For local multiplayer, connect all phones to the same Wi-Fi network or hotspot. Open **LAN** on the host phone and create a room. Joining players can scan the host QR code or enter the address and room code manually.

## Game modes

| Mode | What to expect |
| --- | --- |
| **Quick match** | Configure singles or doubles, opponent, difficulty, court, scoring, target score, and Classic or Blitz pace. Blitz speeds up play and shortens the wait between points. |
| **Rival Ladder** | Progress through ten opponents on separate singles and doubles tracks. Matches use Traditional scoring to 11, win by two. Wins unlock the next rival, and cleared stages can be replayed. |
| **Blitz Rush** | Play three minutes of active match time at Blitz pace with Rally scoring. Finish the rally in progress when time expires. A tie goes to one deciding rally. |
| **Tournament and Practice** | Play through a tournament bracket or work on individual shots in practice drills. |
| **Career** | Earn medals, badges, and cosmetic paddle finishes. Completed CPU matches qualify with a target of at least 7, power-ups off, and auto-swing off. Movement assist is allowed. |

Quick match offers ten AI opponents with different tactics, from soft shots at the net to hard drives from the baseline. Difficulty controls reaction speed and accuracy separately from the opponent's playing style. Choose from Championship Stadium, Palm Beach, Sunset Rooftop, and Moonlit Grove in modes with court selection.

## Controls

| Action | Default keyboard control |
| --- | --- |
| Move and aim | WASD or arrow keys |
| Dink, drop, drive or smash, lob | J, K, L, I |
| Serve | Space |
| Cycle spin | Q |
| Sprint or dash | Shift |
| Power or partner tag, where available | E |
| Pause | Esc |

The game also supports mouse and on-screen controls. Use **Settings → Keyboard** to remap keys and **Settings → Controls** to rearrange touch shot buttons or enable movement assist. Flat, Topspin, and Slice are available for supported shots. Curve Left and Curve Right are serve options and reset to Flat after serving.

## Offline play and saved progress

Settings and progress are saved in the browser profile on Windows and in the app's local storage on Android. They are separate from each other and from the original website. Clearing site or app data resets local progress. The original Park, online matchmaking, accounts, and global leaderboard require the upstream service and are unavailable in Rally Offline. Windows spoken score calls depend on the voices installed on the device.

## Project layout

| Path | Purpose |
| --- | --- |
| [`site/`](site/) | Shared game assets, offline adaptations, and gameplay and interface changes. |
| [`server.mjs`](server.mjs) | Windows server that serves the game on the local loopback address. |
| [`runtime/`](runtime/) | Bundled Windows Node.js runtime and license. |
| [`android/`](android/) | Android WebView wrapper, LAN features, and APK build script. |
| [`tools/`](tools/) | Asset preparation, model generation, and verification utilities. |

The original game, court, character models, and audio come from the published PaddleUp browser edition. Rally Offline packages those assets with local changes. Bundled notices remain with their respective authors.
