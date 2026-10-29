# Rally Offline

Double-click **Play Rally.cmd**, or use the **Rally Offline** shortcut on your Desktop. It starts a small server on this PC and opens the game in an Edge app window. Internet access is not needed, including the first launch. You can also visit http://127.0.0.1:8787 after launching.

Play matches against the computer, practice, and enter tournaments. The original game menus, 3D stadium, characters, sounds, rules, and controls are preserved from the browser-delivered version of https://paddleup.ph/ captured on October 29, 2026. This is a locally adapted copy of the published game, not a newly authored game engine. Taplinc sponsor cards, links, credits, and court lettering have been removed in this local edition. Bundled notices remain with their respective authors.

## Keyboard

In **Play match → Match pace**, choose **Classic** or **Blitz**. Blitz runs the simulation 20% faster for both sides and shortens the point-reset wait from 2.2 to 1.05 simulation seconds. Traditional and Rally scoring and the target score remain independent choices. Practice and tournaments use their original pace. The match pace selection is saved for your next quick match.

In **Settings → Keyboard controls**, select an action and press a replacement key. Duplicate assignments are rejected; Escape cancels capture. Reset keyboard defaults restores the original mappings. The shot buttons display your saved keys. Under **Touch shot positions**, swap the four shots between their existing button positions, or restore the defaults. Keyboard and touch preferences are stored separately on each device.

## AI opponents (PC edition)

Under **Play match → AI opponent**, select a named rival or random character personalities. The description changes with your choice. Easy, Normal, and Hard control reaction time and accuracy independently of personality. The opponent choice is saved, and a rematch retains that opponent. Both scoring options and Classic/Blitz work with all rivals.

- **Bea — Kitchen queen:** soft dinks and drops, close positioning.
- **Migo — Big hitter:** fast drives and deep serves, wider placement errors.
- **Tala — Lob artist:** high, deep lobs, particularly against opponents at the net.
- **Paco — Speedster:** faster court coverage, less precise placement.
- **Isay — Steady hands:** fewer timing/placement errors, slower drives.
- **Jojo — Smash happy:** forward positioning and overhead attacks on high contacts.
- **Rafi — Baseline sniper:** deep positioning and drives toward open corners.
- **Nika — Counterpuncher:** deep defense and controlled returns into space.
- **Enzo — Net rusher:** third-shot drops, forward movement and more volleys.
- **Maya — Mix-up master:** varied shot selection, avoiding consecutive repeats when safe alternatives exist.

The four new rivals reuse existing character appearances. CPU partners and tournament opponents also follow their character styles; practice drills keep their teaching behavior. This feature has been applied to the PC edition only. The phone app and saved APK have not been updated with it.

- WASD or arrow keys: move and aim
- J: dink; K: drop; L: drive/smash; I: lob
- Space: serve
- Esc: pause
- Shift: sprint; E: partner tag where supported

Mouse and on-screen controls also work. Enable Movement assist in Settings if you want help getting to the ball. Settings and progress are stored in this browser on this PC; they are separate from the live website.

The umpire voice uses voices available in Windows/Edge. Spoken calls may be silent if no usable offline voice is available; the score remains visible.

Park, online matchmaking, accounts, and global leaderboard depend on the original server and are unavailable offline. Their menu entries explain this. Telemetry is suppressed and a local content policy blocks external resource connections. The local server never forwards requests to the website.

Close the game window to leave. Double-click **Stop Rally.cmd** to stop the background server when desired. Launching again reuses the running server. Keep the whole folder together, especially `site` and `runtime`. The desktop shortcut must be updated if you move the folder.

## Files

`site/` contains the original browser files plus the documented local adaptation `offline.js`. `server.mjs` serves only local files on 127.0.0.1. `runtime/node.exe` is the bundled Node.js runtime so this copy can launch without downloads or an npm install. `tools/` contains capture and verification utilities; they are not required to play.

