// Achievements are data. `id` MUST match the server's ACHIEVEMENTS map exactly
// (server/making-it-achievements.ts) — the server holds the canonical GBP amount
// and enforces one-time payout. `cash` here is for display/copy only; the client
// can never set the real amount. `condition(s)` runs against a state snapshot
// (see engine.mjs buildSnapshot). `hidden` ones aren't shown until unlocked.
//
// Payout curve escalates and tops out at £250 (the loaded account balance):
//   £1 + £2 + £4 + £13 + £25 + £40 + £75 + £90 = £250
export const ACHIEVEMENTS = [
    {
        id: '45334CA5-3AA3-49D0-A813-5B90F6FBC884',
        name: 'Someone Pressed Play',
        cash: 0,
        condition: (s) => s.totalPlays >= 1,
        message: 'One play. £0.003. You are now, technically, a professional musician.',
    },
    {
        id: '07F08048-4CD2-466C-93D7-98ED6319EDF6',
        name: 'Your First Real Pound',
        cash: 1,
        condition: (s) => s.moneyEarned >= 1,
        message: "£1 of 'revenue'. You're welcome. Don't spend it all at once.",
    },
    {
        id: 'F49C0E08-5496-45F3-978A-6DE34A6646D2',
        name: 'Going Pro',
        cash: 2,
        condition: (s) => s.totalPlays >= 10_000,
        message: '10,000 plays. That is roughly £30. Before fees.',
    },
    {
        id: '79CE638C-B36D-40C2-87AD-AC9B63DD8FBA',
        name: "The Algorithm's Pet",
        cash: 4,
        condition: (s) => s.totalPlays >= 100_000,
        message: '100,000 plays. The numbers go up but you\'re still getting by on beans on toast.',
    },
    {
        id: '541E93D7-192F-47FB-8593-75DB7C83E1CE',
        name: 'A Million Plays',
        cash: 13,
        condition: (s) => s.totalPlays >= 1_000_000,
        message: 'One MILLION plays. A life-changing... three thousand pounds, on paper. In reality, here\'s a baker\'s dozen.',
    },
    {
        id: 'AE193869-13A7-4876-B6EC-765E7D6413D6',
        name: 'The Diversifier',
        cash: 40,
        condition: (s) => s.ownsAnyAudience,
        message: 'You built something the algorithm cannot take away: real fans. This is the bit that actually pays. Proof: £40.',
    },
    {
        id: '4DC90B2C-C590-4652-A364-2C3757B54B44',
        name: 'A Hundred Quid (On Paper)',
        cash: 25,
        condition: (s) => s.moneyEarned >= 100,
        message: '£100 of revenue earned. The platform thanks you for your service. We thank you with (a bit less) actual cash.',
    },
    {
        id: 'FC9FCB25-5C7A-42B9-8D2E-2D5EAA5C33F6',
        name: 'Ten Million',
        cash: 75,
        condition: (s) => s.totalPlays >= 10_000_000,
        message: 'Ten million plays. You should be rich. I\'ll owe you the rest.',
    },
    {
        // £90 capstone (server map unchanged) — repurposed from a play-count
        // milestone to the narrative finale: selling the catalogue and walking away.
        id: 'A8055D2A-4340-41B6-8A11-157EA6E7B161',
        name: 'Out of the Game',
        cash: 90,
        condition: (s) => s.stage >= 3,
        message: 'You sold the back catalogue and walked. No label, no algorithm, no cut. Just the music. Happy birthday, William!',
    },
    {
        // Flavour, client-only (cash:0 never reaches /sync). Keeps the old play
        // milestone as a badge now the £90 lives on the capstone.
        id: 'B1F2A7C4-0E55-4D21-9A38-6C2D11FE0A90',
        name: 'Hundred Million Club',
        cash: 0,
        condition: (s) => s.totalPlays >= 100_000_000,
        message: 'A hundred million plays. The numbers were always the easy part.',
    },
    {
        id: 'C7E9D3B2-44A1-4F60-8B17-90AABB2C5E11',
        name: 'Signed to the Label',
        cash: 0,
        condition: (s) => s.stage >= 2,
        message: 'They offered you a deal you couldn\'t refuse. Literally — there was no decline button.',
    },
    {
        id: '4E172157-C081-43A9-8B15-6F2BDE63AC7F',
        name: 'Full Roster',
        cash: 0,
        condition: (s) => s.ownsEveryGenerator,
        message: 'One of every career move — bedroom to house tour, demo to Patreon. A whole career, on paper.',
    },
    {
        id: '3121338E-5223-4DE8-8271-709B966D2A41',
        name: 'Hustle',
        cash: 0,
        hidden: true,
        condition: (s) => s.tapBurst >= 100,
        message: 'A hundred posts in a flurry. This is the grind they keep telling you about.',
    },
    {
        id: '5DCF5425-670B-4A1C-9DE4-6C6A1AE5B7DB',
        name: 'Debt Free',
        cash: 0,
        hidden: true,
        condition: (s) => s.loansTaken > 0 && s.debt <= 0,
        message: 'Borrowed money, paid it all back. The lender is genuinely disappointed in you.',
    },
];

export const achievementById = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
