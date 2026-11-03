# Rally Offline for Android

The signed installer is `Rally-Offline.apk`. It installs as **Rally Offline**. Version 2.0.2 is the current installer.

Open the app from the phone's app drawer. It runs independently of the PC and internet. Touch controls, matches against the computer, practice, and tournaments use the same bundled game as the desktop edition. Sponsor removal is included. Progress is saved privately in the app and is separate from desktop progress. Uninstalling or clearing app data erases it.

The phone can be held vertically or horizontally. Android Back offers to close the game. Switching away pauses an active match. Online menus remain unavailable.

Version 1.1 adds Classic/Blitz match pace, with both Traditional and Rally scoring available, and saved touch shot-button position swaps in Settings. Keyboard remapping is also available when a physical keyboard is connected. Install this APK over the existing app to keep its saved progress.

Version 1.2.0 bundles the current game: ten AI personalities, the four new rival models, Enzo's smaller head and light-brown skin, Maya's fitted glasses, and Palm Beach, Sunset Rooftop, and Neon Night Court. Choose Scenery in match setup or Settings. The original stadium remains available. This APK supersedes earlier PC-only feature notes in the main README.

Version 1.2.1 fixes the new courts covering the landing guide, player marker, and ground shadows. The floor paint now sits beneath the game's existing ground effects.

Version 1.2.2 fixes Rally doubles serving after a side-out: the receiving point rotates that team's court positions, and its new service turn starts from the right court with the correct receiver opposite. Traditional scoring and singles keep their existing serving sequence.

Version 1.2.3 groups the Blitz indicator and opponent names/titles in a compact match-details panel beside the scoreboard, or below it on narrow screens. The panel yields to announcements and controls when space is tight, and hides while paused.

## Rebuilding

Run `build.ps1` using the installed Android SDK build tools 35.0.0 and JDK 21. It packages the current `../site` directory, compiles the Java WebView wrapper, and signs the installer with `rally-local.keystore`. Keep that keystore to install future updates without clearing progress. This is a personal development build with WebView debugging enabled for USB inspection.

The app intercepts its HTTPS asset origin and serves every file from the APK. It requests vibration and Android's INTERNET permission for native LAN sockets. LAN needs no internet connection; external WebView requests and the original online services remain blocked. No Node server is included or needed on Android.

## LAN multiplayer (2.0.0)

1. Install this same APK on every Android phone. Install over the existing app to preserve saves.
2. Connect all phones to the same Wi-Fi, or enable a phone hotspot and connect the other phones to it. Mobile data is not needed.
3. On one phone, open **LAN multiplayer → Host game**. Choose the court, singles/doubles, Traditional/Rally scoring, target and Classic/Blitz pace.
4. On the other phones, open **LAN multiplayer → Join game**. Enter an address and six-digit room code shown by the host, then select **Ready**.
5. The host assigns doubles seats and selects **Start LAN match**. Singles needs two phones; doubles accepts two to four and fills empty seats with AI.

One phone owns the match simulation and score; other phones send their own controls. Curve Left/Right are serve-only, and each human keeps an independent spin selection. Any player pausing or backgrounding freezes everyone until the pauses are cleared. If a guest disconnects, the match is abandoned and remaining players return to the lobby. If the host leaves, the room ends. LAN matches do not award CPU Career medals or advance Ladders.

If joining fails, check the address, port, six-digit code and game version. Guest/public Wi-Fi may isolate devices; try a hotspot. No router port forwarding, public server, account or PC is required. This release uses manual address entry and does not automatically discover rooms. The PC edition shows an Android-feature explanation for this menu.

Validation covered two/four browser participants, native TCP authentication/version/capacity/framing, shared scores/results, both scoring/pace options, CPU seats, long host pause, disconnect paths, spin controls and saved data. One physical Android host was tested with three TCP-connected browser peers through USB forwarding, including actual Android background/resume. Two physical Android phones over Wi-Fi/hotspot remain to be verified; USB-forwarded tests are not Wi-Fi coverage.

Version 1.2.5 replaces live HUD details with flat sideline court lettering: opponent names/titles on one side and pace, format and scoring on the other. Shared by all four venues.

Version 1.2.8 adds bundled court preview images to the quick-match scenery picker. Images update with court selection and require no internet connection.

Version 1.2.9 replaces Neon Night Court with Moonlit Grove: blue court, green borders, warm left-side LED lighting, moonlight, woodland, chain-link fencing, mountain silhouettes and valley lights. Includes a refreshed offline preview.

Version 1.3.0 bundles the supplied ElevenLabs umpire recordings: zero through ninety-nine, score calls and seven match calls. No API key, online speech service or device TTS is used when the recordings are ready.

Version 1.3.1 fixes silent recorded score announcements. Live matches now pass numeric scores to the recorded umpire instead of formatting them for device text-to-speech.

Version 1.3.2 uses the supplied All recording for positive tied scores: One all, one / Two all, two; Rally and singles omit the server number. The opening zero-zero call stays unchanged.

Version 1.3.3 replaces Rafi's inherited head and duplicate eyewear with a clean head, fitted sports shades and a rounded baseball cap with a curved bill. No GLB export was generated.

Version 1.3.4 replaces Nika's oversized square headband frame with a thin chamfered band fitted to the head.

Version 1.3.5 fits Maya's frames to the measured face surface and eye height, with connected hinges and arms reaching the temples.

Version 1.3.6 replaces illustrated avatars with portraits rendered from all ten current game models. Includes Maya's fitted glasses from 1.3.5. Regenerate portraits using tools/build-character-portraits.cjs after model changes.

Version 1.3.7 redesigns Sunset Rooftop with a blue court, glass railings, protective fencing, warm LEDs, planters, a dense lit skyline and a tall dark landmark tower against an orange-pink sunset. Includes the refreshed court preview.

Version 1.3.8 adds the complete building beneath the rooftop deck, including facade windows, floor bands, corner columns and a base. Nearby skyline buildings extend to the same ground level, removing the floating platform appearance during the opening orbit.

Version 1.4.0 adds offline Career medals, unlockable paddle finishes, badges and results rewards.

Version 1.5.0 adds ten-stage Rival Ladders in singles and doubles using Traditional scoring to 11. Each stage has a rival, difficulty and tactical description, with independent saved progress and milestone badges.

Version 1.6.0 adds Blitz Rush: three minutes of unscaled active time, Blitz pace, Rally scoring, a final rally at expiry, golden rally for ties and five-second automatic serving. The clock occupies the scoreboard target area. Career tracks bests by format/difficulty.

Version 1.6.1 replaces Rush's redundant score-call display with the large countdown clock. Includes malformed-save recovery and precise pre-serve deadline handling.

Version 1.6.2 removes the redundant Call score across Traditional/Rally and Classic/Blitz. The serving indicator stays; the right column displays pace, target and scoring, or the large Rush timer.

Version 1.6.3 adds shared preview/in-game patterns to all six cosmetic paddle finishes: lime diagonals, coral chevrons, gold sunburst, midnight stars, sunset bands and mint checks. Original retains the plain stock design. Pattern overlays are disposed when switching finishes or leaving a match.

Version 1.6.4 adds the supplied Beach, Sunset Rooftop and Moonlit Grove ambience recordings as normalized, crossfaded AAC loops (3.6 MB combined). They follow master volume and the Crowd & ambience setting, pause with the game or backgrounding, and duck during recorded umpire calls. Stadium retains its original crowd.

Version 1.7.0 adds position-aware rival tactics, open-space targeting and non-hitter doubles coverage. The ten Ladder stages have fixed interpolated opponent skill, with faster reactions, more reliable placement and fewer mistakes at later stages; the local AI partner stays consistent. Difficulty never changes based on score or win history. Existing ladder clears and rewards remain valid.

Version 1.8.0 adds Flat / Topspin / Slice selection for paddle-contact serves, drives, drops and dinks. Topspin increases dip and forward bounce; slice/chop floats and stays lower. CPU rivals use spin according to personality and fixed skill. Shared physics keeps AI interception and the landing guide consistent. Select spin above the shot buttons or cycle with Q (remappable in Settings); existing key remaps are preserved. Flat remains the default, scripted practice stays unchanged, and sidespin is deferred.

Version 1.9.0 adds visible screwball-style Curve Left / Right choices for serves only, from the hitter's view. The choices disable during rallies and reset to Flat after serving; Topspin and Slice remain available in rallies. Spinning shots use shared 3D flight with velocity-dependent spin forces, air drag, spin decay and contact friction; the guide and AI predict the same trajectory. Standard serve checks showed about 30 cm lateral bow. This is a tuned gameplay approximation, not experimentally calibrated pickleball aerodynamics. Flat and scripted practice retain previous behavior. Existing selector, swipe, left-handed mode, keyboard cycling and saved mappings remain supported.

Version 2.0.1 groups Settings into Controls, Keyboard, Audio, Display and Progress tabs. The category bar stays available while scrolling; pause-menu Settings hides Progress where reset is unavailable. Categories preserve native save/reset handlers, and the last category is remembered on each device. Removed the ElevenLabs description from Settings at the user's request.

Version 2.0.2 focuses the main menu on Quick match, LAN, Rival Ladder, Blitz Rush and Tournament. Practice/Career remain available, Settings/How to play are quieter, and unavailable original online links are removed from home. The animated bouncing ball above Rally is preserved. Play match is renamed Quick match in the home and setup actions; tournament continuation is retained.
