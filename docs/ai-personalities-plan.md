# AI personalities (PC only)

Implement character-based CPU behavior for the six existing characters and four selectable named rivals. Match setup provides an opponent selector with a live strength/weakness description. Easy/Normal/Hard continues to control reaction time, error, and accuracy independently. Classic/Blitz and Traditional/Rally scoring stay independent as well.

Keep the current ball physics, contact prediction, two-bounce rule, kitchen rule, and scoring. Each CPU receives its own copy of its difficulty tuning, modified for its character. Add a shot-selection hook that uses visible opponent positions and the seeded match RNG. Match plans store opponent profiles so rematches use the same rival. Practice drills retain their scripted teaching behavior. Tournament CPUs inherit their existing character's personality.

Existing characters: Bea (Kitchen queen), Migo (Big hitter), Tala (Lob artist), Paco (Speedster), Isay (Steady hands), Jojo (Smash happy).

New named rivals reuse existing character appearances: Rafi (Baseline sniper), Nika (Counterpuncher), Enzo (Net rusher), Maya (Mix-up master). They are new opponents and behaviors, not new 3D meshes.

Validate seeded shot tendencies against the descriptions, difficulty scaling and private tuning copies, legal overhead choices, actual simulated matches in both scoring/pace variants, and UI selection/persistence. Do not rebuild or install the phone APK.
