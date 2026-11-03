# Settings Categories Implementation Plan

**Goal:** Replace the long mixed settings list with directly accessible categories.
**Architecture:** Preserve native React controls and save handlers. Add category state and a sticky tab bar to the shared settings component used by home and pause menus; partition the existing custom controls by category. Add keyboard tab navigation and retain selection on this device.
**Categories:** Controls (touch layout, assists, spin help), Keyboard (remaps), Audio (volume, ambience, umpire), Display (camera, guide, graphics), Progress (existing tournament reset, where available).
**Scope:** Narrow refinement of the incumbent dark-green/lime interface. No gameplay, defaults, progress or network changes. No scenery setting added.

- [x] Write failing browser coverage for category navigation, visible controls, save behavior, remap-capture cancellation, mobile/desktop layouts and paused-game Settings.
- [x] Implement native category rendering and partition custom panels. Preserve React ownership and all original setting callbacks.
- [x] Batched visual check in portrait/landscape/desktop, accessibility/keyboard checks, fix any found issues, run the UI detector once.
- [x] Build/sign/install Android update if connected; verify source/installer and commit locally.

## Ledger

- User request fully defines the narrow outcome: categorize settings so players can find tweaks without scrolling through unrelated options. Routine category choices use existing content; no additional approval needed.
- Branch settings-categories from current LAN feature, preserving the established launcher/signing-key checkout.
- Retain existing native reset confirmation; do not reset any user progress during checks.

- Initial browser check observed0tabs versus5 before implementation. Categories now preserve original React settings callbacks and reset confirmation, and custom remap/touch panels render only in the appropriate category.
- User steering: remove the ElevenLabs description. Removed the credit paragraph entirely from Settings; Audio now has only native sound controls. Updated Controls spin-help wording to point to Keyboard rather than a nonexistent section below.
- Checks passed home Settings at393x852,915x412 and1200x850: volume persistence, touch swap persistence, capture cancellation when leaving Keyboard, sticky tab viewport bounds, reset-dialog cancel, category memory and arrow navigation. Paused Settings passed portrait/landscape including remapping and absence of unavailable Progress. Existing spin key-migration test passed.
- Impeccable context allowed narrow refinement using incumbent visual system; detector returned[] for changed source/CSS. Batched visual review preserved existing theme; adjusted pause-menu tab widths for4categories.
- Signed APK2.0.1/code34 installed over the current phone app. Actual Android touch navigation through Audio/Keyboard/Display/Controls passed; ElevenLabs text absent, settings/keys/Career strings unchanged. Phone returned to home.
- Keep local settings-categories branch; no push/merge requested.
