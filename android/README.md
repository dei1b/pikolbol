# Rally Offline for Android

The signed installer is `Rally-Offline.apk`. It installs as **Rally Offline**. Version 1.2.2 was built on the PC; the phone was disconnected, so it has not been installed or copied to the phone yet.

Open the app from the phone's app drawer. It runs independently of the PC and internet. Touch controls, matches against the computer, practice, and tournaments use the same bundled game as the desktop edition. Sponsor removal is included. Progress is saved privately in the app and is separate from desktop progress. Uninstalling or clearing app data erases it.

The phone can be held vertically or horizontally. Android Back offers to close the game. Switching away pauses an active match. Online menus remain unavailable.

Version 1.1 adds Classic/Blitz match pace, with both Traditional and Rally scoring available, and saved touch shot-button position swaps in Settings. Keyboard remapping is also available when a physical keyboard is connected. Install this APK over the existing app to keep its saved progress.

Version 1.2.0 bundles the current game: ten AI personalities, the four new rival models, Enzo's smaller head and light-brown skin, Maya's fitted glasses, and Palm Beach, Sunset Rooftop, and Neon Night Court. Choose Scenery in match setup or Settings. The original stadium remains available. This APK supersedes earlier PC-only feature notes in the main README.

Version 1.2.1 fixes the new courts covering the landing guide, player marker, and ground shadows. The floor paint now sits beneath the game's existing ground effects.

Version 1.2.2 fixes Rally doubles serving after a side-out: the receiving point rotates that team's court positions, and its new service turn starts from the right court with the correct receiver opposite. Traditional scoring and singles keep their existing serving sequence.

## Rebuilding

Run `build.ps1` using the installed Android SDK build tools 35.0.0 and JDK 21. It packages the current `../site` directory, compiles the Java WebView wrapper, and signs the installer with `rally-local.keystore`. Keep that keystore to install future updates without clearing progress. This is a personal development build with WebView debugging enabled for USB inspection.

The app intercepts its HTTPS asset origin and serves every file from the APK. It requests vibration permission and has no internet permission. No Node server is included or needed on Android.
