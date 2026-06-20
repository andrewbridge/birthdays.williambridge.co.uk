// The predatory bit. Each loan drops `principal` into your Bank immediately and
// adds `principal * (1 + interestRate)` to your Debt. Every `intervalMs` a
// `repayPerInterval` chunk is skimmed off your money until the Debt clears.
// Bank never goes negative — if income can't cover a repayment, it simply waits.
// `unlockAt` gates each loan behind a gross money-earned milestone, so you can't
// borrow your way to the top from the start.
export const LOANS = [
    {
        id: 'payday',
        name: 'Payday Advance',
        principal: 50,
        interestRate: 0.5,
        repayPerInterval: 5,
        intervalMs: 8_000,
        unlockAt: 50,
        pitch: 'NEED CASH NOW? 💸',
        sub: 'Money in your account today. Representative 1,200% APR.',
    },
    {
        id: 'credit-card',
        name: 'Musician’s Credit Card',
        principal: 500,
        interestRate: 0.4,
        repayPerInterval: 25,
        intervalMs: 8_000,
        unlockAt: 2_000,
        pitch: '0% FOR 3 MONTHS*',
        sub: '*Then a number we’d rather not print. Treat yourself to some gear.',
    },
    {
        id: 'advance',
        name: 'Label Advance',
        principal: 5_000,
        interestRate: 0.3,
        repayPerInterval: 150,
        intervalMs: 8_000,
        unlockAt: 25_000,
        pitch: 'SIGN HERE FOR £5,000 🖊️',
        sub: 'Recoupable, obviously. Against everything you will ever earn.',
    },
];

export const loanById = Object.fromEntries(LOANS.map((l) => [l.id, l]));
