# Rally Offline

Double-click **Play Rally.cmd**, or use the **Rally Offline** shortcut on your Desktop. It starts a small server on this PC and opens the game in an Edge app window. Internet access is not needed, including the first launch. You can also visit http://127.0.0.1:8787 after launching.

Quick matches against the computer, practice, and enter tournaments. The original game menus, 3D stadium, characters, sounds, rules, and controls are preserved from the browser-delivered version of https://paddleup.ph/ captured on October 29, 2026. This is a locally adapted copy of the published game, not a newly authored game engine. Taplinc sponsor cards, links, credits, and court lettering have been removed in this local edition. Bundled notices remain with their respective authors.

## Career, Rival Ladder and Blitz Rush

Android adds **LAN multiplayer**: one phone hosts and two to four phones play singles/doubles over shared Wi-Fi or a hotspot, without a PC or internet. Version **2.1.0** adds a ready host QR code and in-app scan-to-join; manual address/room-code entry remains available. See [Android setup](android/README.md) for instructions and current device-test coverage. The PC launcher retains its offline CPU modes.

**Career & rewards** tracks eight medals and unlocks six paddle finishes plus badges. Rewards are cosmetic. Completed CPU matches count with target 7 or higher, power-ups off and auto-swing off; movement assist is allowed. Practice, abandoned games and restarts do not earn rewards. Career progress saves locally on each device.

**Rival Ladder** has separate singles and doubles tracks with ten opponents. Matches use Traditional scoring to 11, win by two. Select your character, court and Classic/Blitz pace for each stage. Wins unlock the next rival; losses never remove progress. Cleared stages remain replayable.

**Blitz Rush** is a three-minute Rally-scoring match at Blitz pace. Pause and background time do not count. The current rally finishes after expiry; a tie triggers one golden rally. A positioned server automatically makes a normal drive serve after five seconds. The scoreboard shows team points once, with a Rush timer or the ordinary pace/target/scoring format alongside.

## Scenery

Choose **Scenery** in **Quick match**. Ladder and Rush provide their own court selection and offline previews:

- **Championship stadium:** the original packed arena.
- **Palm Beach:** a seaside hard court, palms, sand, and turquoise water.
- **Sunset Rooftop:** safety rails, a city skyline, and warm evening lighting.
- **Moonlit Grove:** a blue court with green borders, warm floodlights, a full moon, woodland and distant mountains.

Your choice is saved on this device and applies when starting the next match, tournament game, or practice drill. All courts use the same playing dimensions and rules. These sceneries are also bundled in the Android 1.2.0 APK; install that APK to update your phone.

## Match pace and controls

Rally doubles now rotates court positions when the receiving team earns a point, so every new service turn after a side-out begins from the right court. Traditional doubles also starts new service turns on the right; a second server within the same turn may serve from either side. This correction is included on PC and in Android 1.2.2.

In **Quick match → Match pace**, choose **Classic** or **Blitz**. Blitz runs the simulation 20% faster for both sides and shortens the point-reset wait from 2.2 to 1.05 simulation seconds. Traditional and Rally scoring and the target score remain independent choices. Practice and tournaments use their original pace. The match pace selection is saved for your next quick match.

In **Settings → Keyboard controls**, select an action and press a replacement key. Duplicate assignments are rejected; Escape cancels capture. Reset keyboard defaults restores the original mappings. The shot buttons display your saved keys. Under **Touch shot positions**, swap the four shots between their existing button positions, or restore the defaults. Keyboard and touch preferences are stored separately on each device.

## AI opponents

Under **Quick match → AI opponent**, select a named rival or random character personalities. The description changes with your choice. Easy, Normal, and Hard control reaction time and accuracy independently of personality. The opponent choice is saved, and a rematch retains that opponent. Both scoring options and Classic/Blitz work with all rivals.

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

The four new rivals now have distinct 3D character variants based on the original rigs and proportions: Rafi has a navy/cyan cap and sports glasses; Nika wears teal/coral with a headband and braid; Enzo has a clean face, a shaped baseball cap, a blue jersey with white chevrons and number 7, and dark shorts with white stripes; Maya has a purple/mint outfit, twin buns and glasses. They are also available in the character picker. CPU partners and tournament opponents follow their character styles; practice drills keep their teaching behavior. These changes are also bundled in the Android 1.2.0 APK. Install the updated APK over the existing phone app to use them.

The editable glTF model collection is `site/rally/rival-characters.gltf`, with `rival-characters.bin` and the original colormap alongside it. `tools/build-rival-models.cjs` regenerates the four variants from the unchanged original models. The generated collection contains the original six plus the four new models; the original `characters.gltf` and `characters.bin` remain available as references.

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

