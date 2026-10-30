# Topspin and slice: proposed first release

## Player experience

Add Flat, Topspin and Slice to the existing shots, including paddle-contact serves. Flat is the default and preserves current behavior. Topspin produces a more pronounced dip and forward bounce; slice/chop floats more and stays lower after the bounce. Keep effects modest enough for the existing fast matches. Sidespin is a later release.

The proposed phone control is a compact three-state selector beside the existing shot controls, mirrored in left-handed mode. It must not cover the joystick, scoreboard, ball or court centre. Keyboard selection must support remapping through existing Settings. User approved the Flat / Topspin / Slice selector. Swipe control mode uses the same selector above its swipe hint.

Show spin using a small visual cue on the ball/trail, with shape or motion as well as colour. Keep the landing marker's established appearance and height above court paint.

## Physics and fairness

Implement spin in the shared ball representation and integrator, not a render-only effect. Retain it when cloning predicted balls, saving historical state and returning ball snapshots. Live flight, net checks, bounce simulation, AI interception and landing-guide prediction must agree. Apply spin at racket contact; new shots replace incoming spin instead of stacking it indefinitely.

Use deterministic, bounded effects. Topspin increases downward acceleration and forward bounce; slice reduces downward acceleration modestly and reduces bounce height. Preserve Flat physics exactly. Calibrate launch arcs to avoid making routine selected-spin shots unplayable. Spin cannot bypass kitchen, double-bounce, net or serving-box checks.

AI spin decisions use existing seeded randomness, shot type, contact height, rival personality and fixed difficulty. Power rivals favour topspin drives; defensive/control rivals can use slice. Easy rivals use less spin, later fixed ladder stages use it more deliberately. No hidden adjustment based on the score. Preserve scripted practice behavior initially.

## Verification

Compare identical Flat/topspin/slice launches for measurable flight and bounce differences. Verify cloned predictions match live integration and landing guides. Exercise net crossings, court edges, both team directions, serves and repeated bounces. Check finite coordinates and bounded effects through seeded matches in both formats and paces. Verify controls in portrait, landscape and left-handed layouts, pause/background behavior and keyboard remapping. Build the offline Android update after checks pass.

## Inspection findings

The current ball uses an analytic gravity trajectory with separate flight, ground-time and net-crossing calculations. The native integrator is reused for AI samples, but the landing guide also has a direct gravity equation. All these paths must change together. A ball-only visual change would leave AI and the guide predicting the wrong bounce.
