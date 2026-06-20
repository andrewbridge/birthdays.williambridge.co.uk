// Random-event templates. The engine decides *whether* an event fires and how
// hard it lands (see engine.mjs); this module just supplies the flavour and the
// weighted pools to draw from.
//
// Each template: { effect, weight, title, messages[] }.
//   effect   — which apply-helper the engine runs.
//   weight   — relative likelihood within its pool (re-normalised after filtering).
//   title    — toast/feed headline.
//   messages — flavour lines; one picked at random so repeats feel fresh.
//
// `track` (optional) restricts a rate effect to 'reach'/'audience'; omitted = 'all'.

// --- Dark events: the industry doing what the industry does -----------------
export const DARK_EVENTS = [
    {
        effect: 'cashLoss',
        weight: 35,
        title: 'A playlist quietly delisted you',
        messages: [
            'No email, no reason. Your numbers just fell off a cliff.',
            'Your distributor “adjusted” your payout. Downward, naturally.',
            'A “catalogue review” found you owed them, somehow.',
            'A playlist that once loved you dropped you. The algorithm followed.'
        ],
    },
    {
        effect: 'rateHit',
        weight: 30,
        title: 'AI slop is flooding the platform',
        messages: [
            'An AI trained on your back catalogue — your sound, everywhere, for free.',
            'Ten thousand fake artists released an album this morning. Each.',
            'The algorithm prefers the machines now. They never ask to be paid.',
            'The algorithm forgot you existed. It’s not a fan, it’s a bot. And it’s everywhere.'
        ],
    },
    {
        effect: 'debtAdd',
        weight: 25,
        title: 'A bill you didn’t see coming',
        messages: [
            'Surprise tax bill. The fun kind, with a deadline.',
            'Gear died mid-set. You financed a replacement on the spot.',
            'A “slightly cringe” old post resurfaced — the PR invoice did too.',
            'Someone started a war, now your beer money is petrol money.'
        ],
    },
    {
        effect: 'unitLoss',
        weight: 10,
        title: 'A label dispute freezes part of your catalogue',
        messages: [
            'Lawyers are involved. Some of your work is locked up for now.',
            'A “rights administration error” pulled releases offline.',
            'Your manager said “it’s fine, it’s just a formality” — but the streams are gone.'
        ],
    },
    {
        effect: 'countryFanLoss',
        weight: 12,
        title: '{country} cooled on you',
        messages: [
            'A local playlist in {country} dropped you overnight.',
            'Something you said didn’t translate well in {country}.',
            'Your distributor lost the rights in {country}. Listeners vanished.',
        ],
    },
];

// --- Warm events: the world occasionally being kind -------------------------
export const WARM_EVENTS = [
    {
        effect: 'cashGain',
        weight: 45,
        title: 'A little money came in',
        messages: [
            'Bandcamp Friday sales — people paid what they wanted, generously.',
            'A surprise Patreon donation with a lovely note attached.',
            'Arts Council funding finally came through.',
        ],
    },
    {
        effect: 'fanGain',
        weight: 45,
        title: 'New people found you',
        messages: [
            'A bigger artist shared your track to all their followers.',
            'A storming support slot won over a room full of strangers.',
            'A real human curator added you to a real playlist.',
        ],
    },
    {
        effect: 'rateBoost',
        weight: 10,
        title: 'A bit of momentum',
        messages: [
            'A blog feature gave you a little tailwind.',
            'Word of mouth is doing the quiet, lovely thing it does.',
        ],
    },
    {
        effect: 'countryFanGain',
        weight: 20,
        title: 'You blew up in {country}',
        messages: [
            'Something you made just landed with people in {country}.',
            'A tastemaker in {country} can’t stop sharing your track.',
            '{country} radio picked you up out of nowhere.',
        ],
    },
];

export const pickMessage = (template) =>
    template.messages[Math.floor(Math.random() * template.messages.length)];

// Weighted pick from a list of templates (each with a numeric `weight`).
export const weightedPick = (pool) => {
    const total = pool.reduce((s, t) => s + t.weight, 0);
    let r = Math.random() * total;
    for (const t of pool) {
        r -= t.weight;
        if (r <= 0) return t;
    }
    return pool[pool.length - 1];
};
