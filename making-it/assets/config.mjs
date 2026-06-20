// Single place to point the client at the payout backend. Update this to the
// deployed Deno Deploy URL (see server/making-it-achievements.ts). Kept as a
// constant so the app stays portable if the site moves to a subdomain.
export const SERVER_ENDPOINT = 'https://making-it-game.andrewbridge.deno.net';

// The gag: plays convert to money at real-world streaming rates — pitiful.
export const PLAY_RATE = 0.003; // £ earned per play

// The lesson: a single fan supporting you directly is worth far more than a
// stream. Each fan contributes this much money every second, forever.
export const FAN_SUPPORT_RATE = 0.01; // £ per fan per second

// Game loop cadence and the career-move cost growth factor.
export const TICK_MS = 250;
export const COST_GROWTH = 1.15;

// The game pauses while you're away — no time is made up on return. A single
// tick can never advance more than this many seconds (so a backgrounded/frozen
// tab doesn't dump a huge catch-up when it resumes).
export const MAX_TICK_SECONDS = 1;

// If you've been away at least this long, returning shows a "welcome back" toast
// and throws a small warm event your way — a nice hello, not a windfall.
export const WELCOME_BACK_MIN_MS = 90 * 1000;

// Auth tokens from the server last 24h; mirror that client-side.
export const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

// --- Levelling / gating ----------------------------------------------------
// Career moves unlock by owning this many of the previous tier in the track
// (per-generator overridable via an `unlockAt` field).
export const UNLOCK_PREV_COUNT = 10;

// --- Random events ---------------------------------------------------------
// Mean time between events, lerped by progression (how much of the career tree
// you've started). Early game: rare and gentle. Late game: frequent.
export const EVENT_MEAN_SLOW_MS = 90_000; // sparse, early
export const EVENT_MEAN_FAST_MS = 25_000; // relentless, late
export const EVENT_JITTER = 0.5; // ± fraction applied to each scheduled interval

// "Wellness" reference: bank-minus-debt at which you're considered fully
// thriving. Drives warm-vs-dark weighting (broke → warm bail-outs; rich → dark).
export const WEALTH_REF = 50_000;

// Repayment floor so event-added debt actually clears instead of lingering.
export const MIN_REPAY = 1; // £/s minimum while any debt remains

// Dark-event magnitude ranges, lerped [start, end] by progression so late-game
// hits really bite even at high income.
export const CASH_LOSS_PCT = [0.05, 0.25]; // fraction of bank
export const RATE_HIT_MULT = [0.8, 0.5]; // multiplier applied to a track
export const RATE_HIT_MS = [30_000, 90_000]; // duration of a rate hit
export const DEBT_ADD_PCT = [0.05, 0.20]; // fraction of bank added as debt
export const DEBT_ADD_MIN = 50; // floor for a surprise debt
export const UNIT_LOSS_PCT = [0.10, 0.25]; // fraction of owned units removed
export const UNIT_LOSS_MIN_PROGRESS = 0.7; // only possible once deep in

// Warm-event magnitudes (kept small — a hand up, not a windfall).
export const CASH_GAIN_PCT = [0.04, 0.12]; // fraction of bank, capped below
export const CASH_GAIN_MIN = 5; // £ floor for a warm cash gift
export const CASH_GAIN_CAP = 500; // £ ceiling so it can't break the game
export const FAN_GAIN_PCT = [0.05, 0.15]; // fraction of current fans
export const FAN_GAIN_MIN = 3; // fans floor
export const RATE_BOOST_MULT = 1.1; // gentle warm tailwind
export const RATE_BOOST_MS = 45_000;

// --- Loans: ramping interest ----------------------------------------------
// Each loan ever taken makes future loans nastier: effective interest =
// base * (1 + LOAN_INTEREST_RAMP * loansTaken). Preys on serial borrowing.
export const LOAN_INTEREST_RAMP = 0.1;

// --- Three-act career ------------------------------------------------------
// Stage 1 (early career) → Stage 2 (signed: a punishing label cut) → Stage 3
// (sold the catalogue: free, but production reset). Thresholds are gross
// money earned. Stage 3 is a player-pressed action, not automatic.
export const STAGE2_AT = 100_000; // forced record deal at this gross earned
export const STAGE3_UNLOCK_AT = 500_000; // "sell your catalogue" unlocks here
export const LABEL_REVENUE_SHARE = 0.15; // fraction of revenue that reaches Bank in Stage 2

// On signing, a hefty recoupable advance lands on your Debt — scaled to your
// earnings so it always stings: max(floor, mult × money earned so far).
export const LABEL_ADVANCE_MIN = 250_000;
export const LABEL_ADVANCE_MULT = 2;

// How event weighting shifts per stage (added to darkChance): label years
// lean dark; freedom leans warm. A genuine crisis still skews warm because the
// wellness term collapses when you're broke.
export const STAGE_DARK_BIAS = { 1: 0, 2: 0.12, 3: -0.2 };
