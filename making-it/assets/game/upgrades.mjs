// "Promos" — one-off, money-priced boosts dressed up as the slightly grubby ads
// that follow musicians around. Each multiplies something:
//   target 'tap'   -> plays per tap
//   target 'plays' -> all Reach (plays/sec) output
//   target 'fans'  -> all Audience (fans/sec) output
// `pitch`/`sub` drive the predatory banner styling in the UI. `minStage` gates a
// promo to its act (default 1); the lineup changes as your career does.
export const UPGRADES = [
    {
        id: 'boost-post',
        target: 'tap',
        mult: 2,
        cost: 5,
        pitch: 'BOOST THIS POST',
        sub: 'Reach up to 10,000 more people!* Just tap to pay.',
    },
    {
        id: 'playlist-payola',
        target: 'plays',
        mult: 3,
        cost: 150,
        pitch: 'GET ON THE PLAYLIST 🔥',
        sub: '“Editorial” placement. Totally legit. Definitely not payola.',
    },
    {
        id: 'engagement-pod',
        target: 'tap',
        mult: 3,
        cost: 1_200,
        pitch: 'JOIN AN ENGAGEMENT POD',
        sub: '500 creators liking each other’s posts at 3am. The dream.',
    },
    {
        id: 'superfan-tier',
        target: 'fans',
        mult: 2,
        cost: 4_000,
        pitch: 'UNLOCK SUPERFAN TIERS 💖',
        sub: 'Let your most loyal listeners pay you even more. They want to!',
    },

    // --- Label-funded (Stage 2). Huge reach, billed straight to your recoup. ---
    {
        id: 'tv-sync',
        target: 'plays',
        mult: 4,
        cost: 50_000,
        minStage: 2,
        pitch: 'SYNC TO A TV ADVERT 📺',
        sub: 'Your song under a car commercial. The “exposure” is priceless. You’ll see none of it.',
    },
    {
        id: 'stadium-support',
        target: 'fans',
        mult: 3,
        cost: 80_000,
        minStage: 2,
        pitch: 'OPEN FOR A LEGEND 🏟️',
        sub: 'A stadium support slot. The label books it; you owe every penny back.',
    },

    // --- Grassroots (Stage 3). Smaller, genuine, no catch. ---
    {
        id: 'word-of-mouth',
        target: 'plays',
        mult: 2,
        cost: 30_000,
        minStage: 3,
        pitch: 'JUST LET IT SPREAD',
        sub: 'No spend, no plugger. Good songs and patient people doing the work.',
    },
    {
        id: 'fan-funded',
        target: 'fans',
        mult: 3,
        cost: 60_000,
        minStage: 3,
        pitch: 'A FAN-FUNDED CAMPAIGN 💚',
        sub: 'Your people chip in to make it happen. You owe them nothing but the music.',
    },
];
