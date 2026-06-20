// The three acts. A stage only changes *copy* in the Career-moves and Promoted
// panels (plus the Stage-2 revenue cut and the Stage-3 reset, handled in the
// engine) — the buys, costs and gating are identical across acts.
//   1 — early career: hopeful, scrappy, do-it-yourself.
//   2 — signed: the label owns you; the tone curdles.
//   3 — free: you sold the catalogue and walked; quieter, lighter, yours again.
export const STAGE_COPY = {
    1: {
        careerHead: 'Career moves',
        careerLede: 'Invest your money. Reach chases plays; Audience builds fans who actually pay.',
        reachWhy: 'Rack up plays. Pays £0.003 each. You know, like the real thing.',
        audienceWhy: 'Build real fans. Each one supports you directly — worth far more than a stream.',
        promoHead: 'Promoted for you',
        promoLede: 'Sponsored. Definitely worth it.',
    },
    2: {
        careerHead: 'Career moves',
        careerLede: 'Your label sets the strategy now. Hit the numbers. Hit the targets. Smile for the camera.',
        reachWhy: 'Plays are the only KPI that counts upstairs. Feed the machine.',
        audienceWhy: 'Real fans still pay — what little of it reaches you after the recoup.',
        promoHead: 'Recommended by your label',
        promoLede: 'Approved partners. The marketing spend comes out of your account, of course.',
    },
    3: {
        careerHead: 'Building it back',
        careerLede: 'No label, no cut. Just you, the work, and whoever still wants to listen. Start again.',
        reachWhy: 'Plays for their own sake again. They never paid much, but they were never the point.',
        audienceWhy: 'The people who stuck around. This time you keep every penny they send.',
        promoHead: 'Promoted for you',
        promoLede: "You can ignore these now. You've seen where they lead.",
    },
};

export const stageCopy = (stage) => STAGE_COPY[stage] ?? STAGE_COPY[1];

// Per-move flavour overrides by stage (keyed by generator id). Stage 1 uses the
// defaults from generators.mjs; only 2 (signed) and 3 (free) restyle the copy.
// Mechanics — id, cost, output, track — never change, just the words.
export const GENERATOR_COPY = {
    2: {
        'bedroom-demo': { name: 'Studio Session', blurb: 'A proper studio, a proper engineer, a bill quietly added to your recoup.' },
        'open-mic': { name: 'Industry Showcase', blurb: 'An “intimate” showcase for people checking their phones.' },
        'single': { name: 'Lead Single', blurb: 'Chosen by committee, focus-grouped, dropped on a Friday.' },
        'content-grind': { name: 'Content Strategy', blurb: 'The social team needs three posts a day. From you. Smiling.' },
        'mailing-list': { name: 'Official Fan Club', blurb: 'A mailing list — though the label keeps the data, naturally.' },
        'merch': { name: 'Merch Line', blurb: 'A whole drop, "trendy" branding. They take a cut.' },
        'patreon': { name: 'VIP Memberships', blurb: 'Tiered superfan packages. Recoupable, of course.' },
        'old-man-pub-tour': { name: 'Support Tour', blurb: 'Opening arenas for someone bigger. The compensation don’t cover lunch.' },
    },
    3: {
        'bedroom-demo': { name: 'Back to the Bedroom', blurb: 'Just you and a duvet for acoustic treatment again. Honestly? A relief.' },
        'open-mic': { name: 'Local Open Mic', blurb: 'The small rooms again. Six people and a dog, and the dog remembers you.' },
        'single': { name: 'Self-Release', blurb: 'Out on your own terms now. You keep every £0.003 of it.' },
        'content-grind': { name: 'Post For Fun', blurb: 'You post when you’ve actually got something to say. Wild concept.' },
        'mailing-list': { name: 'Your Mailing List', blurb: 'This time the list is yours — every name, every address.' },
        'merch': { name: 'DIY Merch', blurb: 'Screen-printed at the kitchen table. Every penny comes home.' },
        'patreon': { name: 'Direct Support', blurb: 'People paying you directly, with nobody in the middle taking a slice.' },
        'old-man-pub-tour': { name: 'Back on the Pub Circuit', blurb: 'The same back rooms and sticky carpets — but every door fee is yours now, and the regulars never left.' },
        // Label-tier moves, reskinned for the independent rebuild.
        'radio-campaign': { name: 'Community Radio', blurb: 'The local stations that championed you before anyone else paid attention.' },
        'festival-circuit': { name: 'DIY Festival Run', blurb: 'Small fields, your name top of the bill, every fee yours.' },
        'arena-residency': { name: 'Hometown Residency', blurb: 'A week at the venue that first let you in. Sold out, all yours.' },
        'global-fanbase': { name: 'Worldwide, On Your Terms', blurb: 'The same reach, no middlemen — every supporter is yours now.' },
    },
};

// Per-promo flavour overrides by stage (keyed by upgrade id). Same multipliers
// and costs; the pitch just curdles in the label years and softens once free.
export const UPGRADE_COPY = {
    2: {
        'boost-post': { pitch: 'PAID MEDIA CAMPAIGN', sub: 'The label fronts the ad spend, then bills it straight back to you.' },
        'playlist-payola': { pitch: 'EDITORIAL PUSH 🔥', sub: 'A favour gets called in. The playlist calls it “curation”.' },
        'engagement-pod': { pitch: 'INFLUENCER SEEDING', sub: 'Twenty creators paid to act like they found you organically.' },
        'superfan-tier': { pitch: 'PREMIUM FAN PACKAGES 💖', sub: 'Bundle the superfans. The label takes its cut of their devotion.' },
    },
    3: {
        'boost-post': { pitch: 'JUST POST IT', sub: 'No budget, no boost. Say something true and see who hears it.' },
        'playlist-payola': { pitch: 'PITCH A REAL CURATOR', sub: 'Email an actual human who runs an actual playlist. Slow, but real.' },
        'engagement-pod': { pitch: 'ASK YOUR MATES TO SHARE', sub: 'Genuine word of mouth. Quieter. Realer.' },
        'superfan-tier': { pitch: 'THANK YOUR REGULARS 💚', sub: 'The ones who stuck around — and this time you keep all of it.' },
        // Label-funded promos, reskinned for the independent rebuild.
        'tv-sync': { pitch: 'AN INDIE FILM USES YOUR SONG 🎬', sub: 'A first-time director who actually asked — and credited you properly.' },
        'stadium-support': { pitch: 'A PEER TAKES YOU ON TOUR 🚐', sub: 'An artist who gets it, splitting the bill fairly. Imagine that.' },
    },
};

export const generatorCopy = (g, stage) => {
    const o = GENERATOR_COPY[stage]?.[g.id];
    return { name: o?.name ?? g.name, blurb: o?.blurb ?? g.blurb };
};

export const upgradeCopy = (u, stage) => {
    const o = UPGRADE_COPY[stage]?.[u.id];
    return { pitch: o?.pitch ?? u.pitch, sub: o?.sub ?? u.sub };
};
