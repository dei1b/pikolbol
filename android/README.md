# Rally Offline for Android

The signed installer is `Rally-Offline.apk`. It is installed as **Rally Offline** on the connected Samsung Galaxy A52 5G. A copy is also saved in the phone's **Downloads** folder.

Open the app from the phone's app drawer. It runs independently of the PC and internet. Touch controls, matches against the computer, practice, and tournaments use the same bundled game as the desktop edition. Sponsor removal is included. Progress is saved privately in the app and is separate from desktop progress. Uninstalling or clearing app data erases it.

The phone can be held vertically or horizontally. Android Back offers to close the game. Switching away pauses an active match. Online menus remain unavailable.

Version 1.1 adds Classic/Blitz match pace, with both Traditional and Rally scoring available, and saved touch shot-button position swaps in Settings. Keyboard remapping is also available when a physical keyboard is connected. Install this APK over the existing app to keep its saved progress.

## Rebuilding

Run `build.ps1` using the installed Android SDK build tools 35.0.0 and JDK 21. It packages the current `../site` directory, compiles the Java WebView wrapper, and signs the installer with `rally-local.keystore`. Keep that keystore to install future updates without clearing progress. This is a personal development build with WebView debugging enabled for USB inspection.

The app intercepts its HTTPS asset origin and serves every file from the APK. It requests vibration permission and has no internet permission. No Node server is included or needed on Android.
