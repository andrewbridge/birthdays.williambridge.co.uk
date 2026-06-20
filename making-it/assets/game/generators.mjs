// "Career moves" — passive producers, bought with money. Cost scales per
// purchase as base * 1.15^owned (base is in £). `output` is units per second
// from a single one. Two tracks:
//   reach    -> produces 'plays'  (vanity volume; earns the pitiful £0.003 each)
//   audience -> produces 'fans'   (each fan pays you directly, far better — the fork)
export const GENERATORS = [
    // --- Reach: chase the numbers -----------------------------------------
    {
        id: 'bedroom-demo',
        track: 'reach',
        produces: 'plays',
        name: 'Bedroom Demo',
        base: 0.1,
        output: 1,
        blurb: 'Record something in your room. A duvet for acoustic treatment.',
    },
    {
        id: 'open-mic',
        track: 'reach',
        produces: 'plays',
        name: 'Open Mic Night',
        base: 2,
        output: 8,
        blurb: 'Play your heart out to six people and a dog.',
    },
    {
        id: 'single',
        track: 'reach',
        produces: 'plays',
        name: 'Release a Single',
        base: 25,
        output: 50,
        blurb: "It's out there now. On all GOOD streaming platforms.",
    },
    {
        id: 'content-grind',
        track: 'reach',
        produces: 'plays',
        name: 'The Content Grind',
        base: 300,
        output: 300,
        blurb: 'Post reels you hate to an algorithm that barely notices.',
    },

    // --- Audience: build something that actually pays ---------------------
    {
        id: 'mailing-list',
        track: 'audience',
        produces: 'fans',
        name: 'Start a Mailing List',
        base: 3,
        output: 0.2,
        blurb: 'Old-fashioned. Owned by you, not an algorithm.',
    },
    {
        id: 'merch',
        track: 'audience',
        produces: 'fans',
        name: 'Merch Table',
        base: 30,
        output: 1,
        blurb: 'A tote bag with your face on it. People love a tote bag.',
    },
    {
        id: 'patreon',
        track: 'audience',
        produces: 'fans',
        name: 'Launch a Patreon',
        base: 300,
        output: 6,
        blurb: 'Direct support from people who actually care.',
    },
    {
        id: 'old-man-pub-tour',
        track: 'audience',
        produces: 'fans',
        name: 'Old-Man Pub Tour',
        base: 2_500,
        output: 30,
        blurb: 'Sofa surfing, scrimping, and people who will follow you anywhere.',
    },

    // --- Label tier (unlocks on signing — Stage 2). Big, glossy, recoupable. ---
    {
        id: 'radio-campaign',
        track: 'reach',
        produces: 'plays',
        name: 'Radio Campaign',
        base: 4_000,
        output: 2_500,
        minStage: 2,
        blurb: 'Plugged to every station that still takes calls. The plugger bills you.',
    },
    {
        id: 'festival-circuit',
        track: 'reach',
        produces: 'plays',
        name: 'Festival Circuit',
        base: 60_000,
        output: 20_000,
        minStage: 2,
        blurb: 'Main stages all summer. The label keeps the merch, the fees, the goodwill.',
    },
    {
        id: 'arena-residency',
        track: 'audience',
        produces: 'fans',
        name: 'Arena Residency',
        base: 40_000,
        output: 300,
        minStage: 2,
        blurb: 'A month of arenas. Half the seats are freebies the label gave away.',
    },
    {
        id: 'global-fanbase',
        track: 'audience',
        produces: 'fans',
        name: 'Global Fanbase',
        base: 500_000,
        output: 2_500,
        minStage: 2,
        blurb: 'Translated, localised, playlisted worldwide. On paper, you’re enormous.',
    },

    // --- Independent tier (unlocks once you go independent — Stage 3). Yours. ---
    {
        id: 'viral-moment',
        track: 'reach',
        produces: 'plays',
        name: 'A Genuine Viral Moment',
        base: 200_000,
        output: 80_000,
        minStage: 3,
        blurb: 'A clip takes off on its own. No budget, no plugger — all yours.',
    },
    {
        id: 'cultural-staple',
        track: 'reach',
        produces: 'plays',
        name: 'A Cultural Staple',
        base: 2_000_000,
        output: 300_000,
        minStage: 3,
        blurb: 'Your song quietly soundtracks a generation’s memories.',
    },
    {
        id: 'artist-coop',
        track: 'audience',
        produces: 'fans',
        name: 'Artist Co-op',
        base: 300_000,
        output: 8_000,
        minStage: 3,
        blurb: 'A collective of artists lifting each other. Fans who stay for life.',
    },
    {
        id: 'generational-fanbase',
        track: 'audience',
        produces: 'fans',
        name: 'A Generational Fanbase',
        base: 3_000_000,
        output: 50_000,
        minStage: 3,
        blurb: 'Kids find you through their parents. It just keeps compounding.',
    },
];

export const REACH_GENERATORS = GENERATORS.filter((g) => g.track === 'reach');
export const AUDIENCE_GENERATORS = GENERATORS.filter((g) => g.track === 'audience');
