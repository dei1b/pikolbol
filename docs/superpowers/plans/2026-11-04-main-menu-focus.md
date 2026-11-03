# Main Menu Focus

**Goal:** Put playable modes first and rename Play match to Quick match.
**Design:** Keep the stadium, Rally branding, tournament-win badge and green/lime identity. Quick match is the sole large lime action. LAN, Rival Ladder, Blitz Rush and Tournament form the next tier; Practice and Career follow, with quiet How to Play/Settings actions. Remove unavailable original Park/Online/Leaderboard entries from home. Preserve all working callbacks and tournament continuation.
**Implementation:** A DOM-owned menu host inside the native React title component; existing brand elements remain React-owned. Native quick-match setup labels use the same new name.

- [x] Failing responsive menu/navigation tests, then native host and menu implementation.
- [x] Batched portrait/landscape/desktop inspection, functional and keyboard checks; one correction pass if needed.
- [x] Build/install Android update, preserve saves, verify and commit locally.

## Ledger

- Narrow refinement follows the existing visual system. User already requested hierarchy and naming; no additional feature approval required.
- Branch main-menu-focus from latest settings-categories; no push/merge requested.
- Existing tests that locate the renamed UI label will be updated; historical docs remain unchanged unless they describe current navigation.
- User explicitly requested keeping the bouncing ball above the title; its original animation and size remain intact.
- Responsive checks passed at 393×852, 915×412, 1200×850 and 320×568, including visible primary modes, touch target sizes, animated ball and no horizontal overflow. All menu routes passed, along with settings, Career and spin-key regression checks.
- Android 2.0.2 (35) built and installed. Actual-device Quick match setup/launch/home and settings-category touch checks passed; saved settings, keys and Career remained unchanged. Initial touch checks timed out while another app was foregrounded; bringing Rally to the front resolved the test failure.
- Manual Impeccable detector returned no findings. Visual inspection completed in two rounds, with the second preserving the requested ball.
