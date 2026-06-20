import { ref, computed, persistRef } from '../deps/vue.mjs';
import {
    PLAY_RATE, FAN_SUPPORT_RATE, COST_GROWTH, UNLOCK_PREV_COUNT,
    LOAN_INTEREST_RAMP, LABEL_REVENUE_SHARE,
} from '../config.mjs';
import { GENERATORS, REACH_GENERATORS, AUDIENCE_GENERATORS } from './generators.mjs';
import { UPGRADES } from './upgrades.mjs';

export const BASE_TAP = 5; // plays per tap before upgrades

// --- Persisted state -------------------------------------------------------
// Each is a ref mirrored to localStorage by persistRef. Nested objects/arrays
// are tracked deeply (persistRef stringifies the whole value in a watchEffect).
export const plays = ref(0); // vanity volume (current)
export const totalPlays = ref(0); // lifetime plays — drives money + milestones
export const fans = ref(0); // real audience (current); each pays you per second
export const totalFans = ref(0); // lifetime fans, for flavour/milestones

export const moneyEarned = ref(0); // gross £, only ever climbs (the headline lie)
export const bank = ref(0); // spendable £, never negative

// Debt is tracked per loan type so we can block a second of a type until the
// first is repaid, plus a separate bucket for debt forced on you by events.
export const activeLoanBalances = ref({}); // { [loanId]: remainingOwed }
export const eventDebt = ref(0); // owed £ from events (no loan type)
export const loansTaken = ref(0); // count ever taken — ramps interest + "Debt Free"

export const generatorOwned = ref({}); // { [generatorId]: count }
export const upgradesBought = ref([]); // upgrade ids
export const unlocked = ref([]); // achievement ids
export const lastSeen = ref(Date.now()); // for offline earnings
export const cashToken = ref(null); // { token, expiresAt, phoneNumber }
export const paidCashIds = ref([]); // achievement ids the server has paid out
export const seenCashIntro = ref(false); // has the sincere first-cash modal shown?

// The three-act career.
export const stage = ref(1); // 1 early · 2 signed (label cut) · 3 free (sold catalogue)
export const seenDealIntro = ref(false); // has the forced record-deal modal shown?

// Real listener geography: integer count per country, summing to floor(fans).
export const fansByCountry = ref({}); // { [country]: count }

// Recent random events, newest first, capped — drives the activity feed.
export const recentEvents = ref([]); // { id, kind:'dark'|'warm', title, text, ts }

// Temporary production modifiers from events. NOT persisted: a debuff shouldn't
// survive a reload (and timers reset anyway). { affects:'plays'|'fans'|'all', mult, expiresAt }
export const activeModifiers = ref([]);

const PERSIST = [
    [plays, 'MI_plays'],
    [totalPlays, 'MI_totalPlays'],
    [fans, 'MI_fans'],
    [totalFans, 'MI_totalFans'],
    [moneyEarned, 'MI_moneyEarned'],
    [bank, 'MI_bank'],
    [activeLoanBalances, 'MI_loanBalances'],
    [eventDebt, 'MI_eventDebt'],
    [loansTaken, 'MI_loansTaken'],
    [generatorOwned, 'MI_generatorOwned'],
    [upgradesBought, 'MI_upgradesBought'],
    [unlocked, 'MI_unlocked'],
    [lastSeen, 'MI_lastSeen'],
    [cashToken, 'MI_cashToken'],
    [paidCashIds, 'MI_paidCashIds'],
    [recentEvents, 'MI_recentEvents'],
    [stage, 'MI_stage'],
    [seenDealIntro, 'MI_seenDealIntro'],
    [fansByCountry, 'MI_fansByCountry'],
];
PERSIST.forEach(([r, key]) => persistRef(r, key, true));

// Migrate a v3 save: the old single pooled `MI_debt` becomes event debt (no loan
// type), since we can't recover which loans it came from. Drop the dead keys.
try {
    const legacy = parseFloat(localStorage.getItem('MI_debt'));
    if (
        Number.isFinite(legacy) && legacy > 0 &&
        eventDebt.value === 0 && Object.keys(activeLoanBalances.value).length === 0
    ) {
        eventDebt.value = legacy;
    }
    localStorage.removeItem('MI_debt');
    localStorage.removeItem('MI_repayPerSecond');
} catch { /* localStorage unavailable — nothing to migrate */ }

// --- Helpers / derived state ----------------------------------------------
export const ownedOf = (id) => generatorOwned.value[id] ?? 0;

// cost = base * 1.15^owned (£).
export const costOf = (generator) =>
    generator.base * COST_GROWTH ** ownedOf(generator.id);

const multFor = (target) =>
    UPGRADES.reduce(
        (m, u) => (u.target === target && upgradesBought.value.includes(u.id) ? m * u.mult : m),
        1,
    );

// Product of any non-expired event modifiers affecting `target` (or 'all').
const modMult = (target) => {
    const now = Date.now();
    return activeModifiers.value.reduce(
        (m, mod) =>
            mod.expiresAt > now && (mod.affects === target || mod.affects === 'all')
                ? m * mod.mult
                : m,
        1,
    );
};

export const perTap = computed(() => BASE_TAP * multFor('tap'));

export const playsPerSecond = computed(() => {
    const mult = multFor('plays') * modMult('plays');
    return GENERATORS.reduce(
        (sum, g) => (g.produces === 'plays' ? sum + ownedOf(g.id) * g.output * mult : sum),
        0,
    );
});

export const fansPerSecond = computed(() => {
    const mult = multFor('fans') * modMult('fans');
    return GENERATORS.reduce(
        (sum, g) => (g.produces === 'fans' ? sum + ownedOf(g.id) * g.output * mult : sum),
        0,
    );
});

// --- Unlock gating ---------------------------------------------------------
// A career move is available if it's the first in its track, or you own enough
// of the previous tier (per-gen `unlockAt`, else UNLOCK_PREV_COUNT).
const trackList = (g) => (g.track === 'audience' ? AUDIENCE_GENERATORS : REACH_GENERATORS);
export const generatorUnlocked = (g) => {
    // Later-act tiers stay locked until you reach their stage.
    if (stage.value < (g.minStage ?? 1)) return false;
    const list = trackList(g);
    // Match by id, not object identity — `g` may be a Vue reactive proxy of the
    // raw module object, so indexOf would miss it.
    const i = list.findIndex((x) => x.id === g.id);
    if (i <= 0) return true;
    const prev = list[i - 1];
    return ownedOf(prev.id) >= (prev.unlockAt ?? UNLOCK_PREV_COUNT);
};

// Promos gate to their act (default stage 1) — the lineup changes as you go.
export const upgradeUnlocked = (u) => stage.value >= (u.minStage ?? 1);

// A loan is available once gross money earned crosses its milestone.
export const loanUnlocked = (loan) => moneyEarned.value >= loan.unlockAt;

// Total owed: event debt + every active loan's remaining balance.
export const debt = computed(() =>
    eventDebt.value + Object.values(activeLoanBalances.value).reduce((s, n) => s + n, 0));

// A loan type is "active" (and so can't be taken again) while it owes anything.
export const loanActive = (id) => (activeLoanBalances.value[id] ?? 0) > 0;

// Interest ramps with every loan ever taken — serial borrowing gets nastier.
export const loanEffectiveRate = (loan) =>
    loan.interestRate * (1 + LOAN_INTEREST_RAMP * loansTaken.value);
export const loanEffectiveOwed = (loan) =>
    loan.principal * (1 + loanEffectiveRate(loan));

// Fraction of revenue that actually reaches the Bank (the label cut in Stage 2).
export const revenueShare = computed(() =>
    stage.value === 2 ? LABEL_REVENUE_SHARE : 1);

// Money income per second: pitiful play revenue + (much better) fan support.
export const moneyPerSecond = computed(() =>
    playsPerSecond.value * PLAY_RATE + fans.value * FAN_SUPPORT_RATE);

// "Full Roster" keys off the base eight only — stays accurate ("bedroom to house
// tour") and reachable without signing.
export const ownsEveryGenerator = computed(() =>
    GENERATORS.filter((g) => !g.minStage).every((g) => ownedOf(g.id) > 0));

export const ownsAnyAudience = computed(() =>
    AUDIENCE_GENERATORS.some((g) => ownedOf(g.id) > 0));

export const canAfford = (cost) => bank.value >= cost;
