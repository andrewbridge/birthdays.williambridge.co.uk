import { ref } from '../deps/vue.mjs';
import {
    TICK_MS, MAX_TICK_SECONDS, WELCOME_BACK_MIN_MS, PLAY_RATE,
    EVENT_MEAN_SLOW_MS, EVENT_MEAN_FAST_MS, EVENT_JITTER, WEALTH_REF, MIN_REPAY,
    CASH_LOSS_PCT, RATE_HIT_MULT, RATE_HIT_MS, DEBT_ADD_PCT, DEBT_ADD_MIN,
    UNIT_LOSS_PCT, UNIT_LOSS_MIN_PROGRESS,
    CASH_GAIN_PCT, CASH_GAIN_MIN, CASH_GAIN_CAP, FAN_GAIN_PCT, FAN_GAIN_MIN,
    RATE_BOOST_MULT, RATE_BOOST_MS,
    STAGE2_AT, STAGE_DARK_BIAS, LABEL_ADVANCE_MIN, LABEL_ADVANCE_MULT,
} from '../config.mjs';
import { ACHIEVEMENTS } from './achievements.mjs';
import { GENERATORS, REACH_GENERATORS, AUDIENCE_GENERATORS } from './generators.mjs';
import { loanById } from './loans.mjs';
import { COUNTRIES, HOME_COUNTRY } from './countries.mjs';
import { DARK_EVENTS, WARM_EVENTS, pickMessage, weightedPick } from './events.mjs';
import { formatStreams, formatMoney } from './format.mjs';
import {
    plays, totalPlays, fans, totalFans, moneyEarned, bank, debt,
    activeLoanBalances, eventDebt, loansTaken, generatorOwned, upgradesBought,
    unlocked, lastSeen, activeModifiers, recentEvents, stage, fansByCountry,
    ownedOf, costOf, perTap, playsPerSecond, fansPerSecond, moneyPerSecond,
    ownsEveryGenerator, ownsAnyAudience, canAfford, revenueShare,
    generatorUnlocked, upgradeUnlocked, loanUnlocked, loanActive, loanEffectiveOwed,
} from './state.mjs';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// --- Toast bus -------------------------------------------------------------
export const toasts = ref([]);
let toastSeq = 0;
export const pushToast = ({ title, body, kind = 'info', ttl = 6000 }) => {
    const id = ++toastSeq;
    toasts.value = [...toasts.value, { id, title, body, kind }];
    if (ttl) setTimeout(() => dismissToast(id), ttl);
    return id;
};
export const dismissToast = (id) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
};

// --- Live plays-per-second history (for the dashboard chart) ---------------
// Sampled once a second over a wide window so trends are visible rather than a
// solid block.
const HISTORY_LEN = 150; // samples
const SAMPLE_MS = 1000; // one sample per second -> ~2.5 min window
export const playsHistory = ref(Array(HISTORY_LEN).fill(0));
let sampleAccum = 0;
const pushHistory = (rate) => {
    const next = playsHistory.value.slice(1);
    next.push(rate);
    playsHistory.value = next;
};

// --- Tap-burst tracking (for the hidden "Hustle" achievement) --------------
let tapTimes = [];
export const tapBurst = () => {
    const cutoff = Date.now() - 3000;
    tapTimes = tapTimes.filter((t) => t >= cutoff);
    return tapTimes.length;
};

// Gifts & loan principal: full amount lands in the Bank (not label-recouped).
const earn = (amount) => {
    moneyEarned.value += amount;
    bank.value += amount;
};

// Streaming/fan revenue: gross Money earned climbs in full (the headline lie),
// but only `revenueShare` reaches the Bank (the label takes the rest in Stage 2).
const earnRevenue = (amount) => {
    moneyEarned.value += amount;
    bank.value += amount * revenueShare.value;
};

// --- Core actions ----------------------------------------------------------
export const tap = () => {
    tapTimes.push(Date.now());
    const gain = perTap.value;
    plays.value += gain;
    totalPlays.value += gain;
    earnRevenue(gain * PLAY_RATE);
    // The moment you start, you have one (local) listener — kills the "0 fans
    // while plays roll in" dissonance and seeds the country breakdown.
    if (totalFans.value === 0) {
        fans.value = 1;
        totalFans.value = 1;
        fansByCountry.value = { ...fansByCountry.value, [HOME_COUNTRY]: (fansByCountry.value[HOME_COUNTRY] ?? 0) + 1 };
    }
};

export const buyGenerator = (generator) => {
    if (!generatorUnlocked(generator)) return false;
    const cost = costOf(generator);
    if (!canAfford(cost)) return false;
    bank.value -= cost;
    generatorOwned.value = {
        ...generatorOwned.value,
        [generator.id]: ownedOf(generator.id) + 1,
    };
    return true;
};

export const buyUpgrade = (upgrade) => {
    if (!upgradeUnlocked(upgrade)) return false;
    if (upgradesBought.value.includes(upgrade.id)) return false;
    if (!canAfford(upgrade.cost)) return false;
    bank.value -= upgrade.cost;
    upgradesBought.value = [...upgradesBought.value, upgrade.id];
    return true;
};

// Loans: cash now, a per-type Debt balance that repays itself over time. You
// can't take a second of a type until the first is repaid (the block), and
// interest ramps with every loan ever taken. Owed amount is locked in at the
// moment you borrow (so it doesn't drift as loansTaken grows).
export const takeLoan = (loan) => {
    if (!loanUnlocked(loan) || loanActive(loan.id)) return false;
    const owed = loanEffectiveOwed(loan);
    bank.value += loan.principal;
    activeLoanBalances.value = { ...activeLoanBalances.value, [loan.id]: owed };
    loansTaken.value += 1;
    pushToast({
        kind: 'debt',
        title: `🏦 ${formatMoney(loan.principal)} in your account`,
        body: `You now owe ${formatMoney(owed)}. Repayments start immediately.`,
        ttl: 8000,
    });
    return true;
};

// Clear an active loan outright (must cover the full remaining balance from the
// Bank). The interest you already locked in stays paid — and `loansTaken` still
// counts, so future loans of any type remain pricier. Settling early just frees
// the type to be borrowed again.
export const repayLoan = (id) => {
    const remaining = activeLoanBalances.value[id] ?? 0;
    if (remaining <= 0 || bank.value < remaining) return false;
    bank.value -= remaining;
    const next = { ...activeLoanBalances.value };
    delete next[id];
    activeLoanBalances.value = next;
    pushToast({
        kind: 'info',
        title: '✅ Loan cleared',
        body: `You settled ${formatMoney(remaining)} in one go. The lender is, once again, disappointed in you.`,
        ttl: 6000,
    });
    return true;
};

const loanRepayRate = (id) => {
    const loan = loanById[id];
    return loan ? loan.repayPerInterval / (loan.intervalMs / 1000) : MIN_REPAY;
};

// Skim repayments out of the Bank (never below zero). Each active loan repays at
// its own rate; event debt repays at a floor (scaled with income) so it always
// clears even with no loan running.
const serviceDebt = (dt) => {
    const balances = activeLoanBalances.value;
    const ids = Object.keys(balances);
    if (ids.length) {
        const next = { ...balances };
        let changed = false;
        for (const id of ids) {
            if (bank.value <= 0) break;
            const due = Math.min(loanRepayRate(id) * dt, next[id], bank.value);
            if (due > 0) { bank.value -= due; next[id] -= due; changed = true; }
            if (next[id] <= 0.0001) delete next[id];
        }
        if (changed) activeLoanBalances.value = next;
    }
    if (eventDebt.value > 0 && bank.value > 0) {
        const rate = Math.max(MIN_REPAY, moneyPerSecond.value * 0.1);
        const due = Math.min(rate * dt, eventDebt.value, bank.value);
        if (due > 0) { bank.value -= due; eventDebt.value -= due; }
        if (eventDebt.value <= 0.0001) eventDebt.value = 0;
    }
};

// --- Random events ---------------------------------------------------------
// Progression 0..1: the share of career-move *types* you've started buying.
// Drives both how often events fire and how hard the dark ones hit.
const progress = () => {
    // Measured over the generators available in the current act, so each stage
    // can still reach full progression (and the ceiling rises as you advance).
    const avail = GENERATORS.filter((g) => stage.value >= (g.minStage ?? 1));
    if (!avail.length) return 0;
    const started = avail.filter((g) => ownedOf(g.id) > 0).length;
    return started / avail.length;
};

// Drop expired temporary modifiers so the computeds recompute to full rate.
const pruneModifiers = () => {
    const now = Date.now();
    if (activeModifiers.value.some((m) => m.expiresAt <= now)) {
        activeModifiers.value = activeModifiers.value.filter((m) => m.expiresAt > now);
    }
};

const addModifier = (affects, mult, ms) => {
    activeModifiers.value = [
        ...activeModifiers.value,
        { affects, mult, expiresAt: Date.now() + ms },
    ];
};

const randomTrack = () => (Math.random() < 0.5 ? 'plays' : 'fans');

// Remove a fraction of owned units across one track (permanent — the rare sting).
const stripUnits = (track, frac) => {
    const list = track === 'fans' ? AUDIENCE_GENERATORS : REACH_GENERATORS;
    const next = { ...generatorOwned.value };
    for (const g of list) {
        const owned = next[g.id] ?? 0;
        if (owned > 0) next[g.id] = Math.max(0, Math.floor(owned * (1 - frac)));
    }
    generatorOwned.value = next;
};

// Add/remove listeners to a specific country, keeping the `fans` total in step
// (so the country sync sees no gap and won't fight the change). Lifetime
// `totalFans` only ever grows.
const addCountryFans = (country, n) => {
    if (n <= 0) return;
    fans.value += n;
    totalFans.value += n;
    fansByCountry.value = { ...fansByCountry.value, [country]: (fansByCountry.value[country] ?? 0) + n };
};
const removeCountryFans = (country, n) => {
    const have = fansByCountry.value[country] ?? 0;
    const take = Math.min(have, n);
    if (take <= 0) return 0;
    fans.value = Math.max(0, fans.value - take);
    fansByCountry.value = { ...fansByCountry.value, [country]: have - take };
    return take;
};

// Warm country picks favour a smaller market (a fun surprise); dark picks the
// country you currently have the most listeners in (so the loss is felt).
const pickWarmCountry = () => {
    const others = COUNTRIES.filter((c) => c.name !== HOME_COUNTRY);
    return Math.random() < 0.75 && others.length
        ? others[Math.floor(Math.random() * others.length)].name
        : HOME_COUNTRY;
};
const pickDarkCountry = () => {
    let best = HOME_COUNTRY;
    let max = -1;
    for (const c of COUNTRIES) {
        const n = fansByCountry.value[c.name] ?? 0;
        if (n > max) { max = n; best = c.name; }
    }
    return best;
};

// Each helper mutates state and returns a short human-readable impact summary.
const APPLY = {
    cashLoss(p) {
        const amount = bank.value * lerp(CASH_LOSS_PCT[0], CASH_LOSS_PCT[1], p);
        bank.value = Math.max(0, bank.value - amount);
        return `Lost ${formatMoney(amount)} from your bank.`;
    },
    rateHit(p) {
        const mult = lerp(RATE_HIT_MULT[0], RATE_HIT_MULT[1], p);
        const ms = lerp(RATE_HIT_MS[0], RATE_HIT_MS[1], p);
        const affects = Math.random() < 0.4 ? 'all' : randomTrack();
        addModifier(affects, mult, ms);
        const what = affects === 'all' ? 'everything' : (affects === 'plays' ? 'plays' : 'fans');
        return `${Math.round((1 - mult) * 100)}% off ${what} for ${Math.round(ms / 1000)}s.`;
    },
    debtAdd(p) {
        const amount = Math.max(DEBT_ADD_MIN, bank.value * lerp(DEBT_ADD_PCT[0], DEBT_ADD_PCT[1], p));
        eventDebt.value += amount;
        return `Added ${formatMoney(amount)} to your debt.`;
    },
    unitLoss(p) {
        const frac = lerp(UNIT_LOSS_PCT[0], UNIT_LOSS_PCT[1], Math.random());
        const track = randomTrack();
        stripUnits(track, frac);
        return `Lost ${Math.round(frac * 100)}% of your ${track === 'fans' ? 'Audience' : 'Reach'} moves.`;
    },
    cashGain(p) {
        const amount = clamp(bank.value * lerp(CASH_GAIN_PCT[0], CASH_GAIN_PCT[1], p), CASH_GAIN_MIN, CASH_GAIN_CAP);
        earn(amount);
        return `+${formatMoney(amount)} straight to your bank.`;
    },
    fanGain(p) {
        const amount = Math.max(FAN_GAIN_MIN, fans.value * lerp(FAN_GAIN_PCT[0], FAN_GAIN_PCT[1], p));
        fans.value += amount;
        totalFans.value += amount;
        return `+${formatStreams(amount)} new listeners.`;
    },
    rateBoost() {
        addModifier('all', RATE_BOOST_MULT, RATE_BOOST_MS);
        return `+${Math.round((RATE_BOOST_MULT - 1) * 100)}% to everything for ${Math.round(RATE_BOOST_MS / 1000)}s.`;
    },
    countryFanGain(p, country) {
        const amount = Math.max(FAN_GAIN_MIN, Math.round(fans.value * lerp(FAN_GAIN_PCT[0], FAN_GAIN_PCT[1], p)));
        addCountryFans(country, amount);
        return `+${formatStreams(amount)} new listeners in ${country}.`;
    },
    countryFanLoss(p, country) {
        const want = Math.max(FAN_GAIN_MIN, Math.round(fans.value * lerp(FAN_GAIN_PCT[0], FAN_GAIN_PCT[1], p)));
        const lost = removeCountryFans(country, want);
        return lost > 0 ? `Lost ${formatStreams(lost)} listeners in ${country}.` : `${country} barely noticed.`;
    },
};

let eventSeq = 0;
const RECENT_CAP = 12;

// Resolve, apply and announce one event of the given polarity.
const runEvent = (isDark) => {
    const p = progress();
    let pool = isDark ? DARK_EVENTS : WARM_EVENTS;
    if (isDark && p < UNIT_LOSS_MIN_PROGRESS) {
        pool = pool.filter((t) => t.effect !== 'unitLoss');
    }
    const template = weightedPick(pool);
    let message = pickMessage(template);
    let title = template.title;

    // Country-targeted events resolve a country and interpolate it into the copy.
    let country = null;
    if (template.effect === 'countryFanGain') country = pickWarmCountry();
    else if (template.effect === 'countryFanLoss') country = pickDarkCountry();
    if (country) {
        message = message.replaceAll('{country}', country);
        title = title.replaceAll('{country}', country);
    }

    const detail = APPLY[template.effect](p, country);

    const kind = isDark ? 'dark' : 'warm';
    const text = `${message} ${detail}`;
    pushToast({
        kind: `event-${kind}`,
        title: `${isDark ? '⚠️' : '✨'} ${title}`,
        body: text,
        ttl: 9000,
    });
    recentEvents.value = [
        { id: ++eventSeq, kind, title, text, ts: Date.now() },
        ...recentEvents.value,
    ].slice(0, RECENT_CAP);
};

const fireEvent = () => {
    // Wellness: broke/indebted → ~0 (warm bail-outs); thriving → ~1 (dark hits).
    // Stage biases the mix: label years lean dark, freedom leans warm.
    const wellness = clamp((bank.value - debt.value) / WEALTH_REF, 0, 1);
    const bias = STAGE_DARK_BIAS[stage.value] ?? 0;
    const darkChance = clamp(0.2 + 0.6 * wellness + bias, 0.05, 0.95);
    runEvent(Math.random() < darkChance);
};

// In-memory schedule (events don't carry across reloads).
let nextEventAt = 0;
const scheduleNextEvent = () => {
    const mean = lerp(EVENT_MEAN_SLOW_MS, EVENT_MEAN_FAST_MS, progress());
    const jitter = 1 + (Math.random() * 2 - 1) * EVENT_JITTER;
    nextEventAt = Date.now() + mean * jitter;
};

const tickEvents = () => {
    if (progress() <= 0) return; // nothing happens until you own a career move
    if (nextEventAt === 0) { scheduleNextEvent(); return; }
    if (Date.now() >= nextEventAt) {
        fireEvent();
        scheduleNextEvent();
    }
};

// --- Listener geography ----------------------------------------------------
// Keep the per-country integer counts summing to floor(fans). New listeners are
// allocated by (jittered) country weights so the breakdown is real and drifts
// organically; shortfalls (from a country event) are removed largest-first.
const pickWeightedCountry = (weights, wsum) => {
    let r = Math.random() * wsum;
    for (let i = 0; i < COUNTRIES.length; i++) {
        r -= weights[i];
        if (r <= 0) return COUNTRIES[i].name;
    }
    return HOME_COUNTRY;
};
const syncFansByCountry = () => {
    const target = Math.floor(fans.value);
    const cur = COUNTRIES.reduce((s, c) => s + (fansByCountry.value[c.name] ?? 0), 0);
    const delta = target - cur;
    if (delta === 0) return;
    const next = { ...fansByCountry.value };
    if (delta > 0) {
        const weights = COUNTRIES.map((c) => Math.max(0.001, c.weight * (0.8 + Math.random() * 0.4)));
        const wsum = weights.reduce((a, b) => a + b, 0);
        let allocated = 0;
        COUNTRIES.forEach((c, i) => {
            const give = Math.floor((delta * weights[i]) / wsum);
            if (give > 0) { next[c.name] = (next[c.name] ?? 0) + give; allocated += give; }
        });
        let rem = delta - allocated; // small; scatter by weight for natural drift
        while (rem-- > 0) {
            const n = pickWeightedCountry(weights, wsum);
            next[n] = (next[n] ?? 0) + 1;
        }
    } else {
        let toRemove = -delta;
        const sorted = COUNTRIES.map((c) => c.name)
            .filter((n) => (next[n] ?? 0) > 0)
            .sort((a, b) => next[b] - next[a]);
        for (const n of sorted) {
            if (toRemove <= 0) break;
            const take = Math.min(next[n], toRemove);
            next[n] -= take; toRemove -= take;
            if (next[n] <= 0) delete next[n];
        }
    }
    fansByCountry.value = next;
};

// --- Three-act career ------------------------------------------------------
// Stage 1 → 2 is automatic at the threshold (the forced record deal); the modal
// itself opens off `stage===2 && !seenDealIntro` in the UI.
const checkStageTransition = () => {
    if (stage.value === 1 && moneyEarned.value >= STAGE2_AT) {
        stage.value = 2;
        // The advance: a hefty recoupable debt, clawed back out of everything you
        // earn. Scaled to your earnings so it always stings. Cleared by selling up.
        eventDebt.value += Math.max(LABEL_ADVANCE_MIN, moneyEarned.value * LABEL_ADVANCE_MULT);
    }
};

// Stage 2 → 3: the player chooses to sell. Keep the money, fans and lifetime
// figures; wipe production so it's a genuine rebuild; clear debts and the label
// cut — you walk away free. The £90 capstone fires off `stage>=3`.
export const sellCatalogue = () => {
    if (stage.value !== 2) return false;
    generatorOwned.value = {};
    activeModifiers.value = [];
    activeLoanBalances.value = {};
    eventDebt.value = 0;
    plays.value = 0;
    nextEventAt = 0;
    stage.value = 3;
    pushToast({
        kind: 'info',
        title: '🕊️ You sold the back catalogue',
        body: "The label's gone. The cut's gone. So is your head start — but it's all yours again now.",
        ttl: 10000,
    });
    checkAchievements();
    return true;
};

// --- Achievement evaluation ------------------------------------------------
const buildSnapshot = () => ({
    totalPlays: totalPlays.value,
    moneyEarned: moneyEarned.value,
    fans: fans.value,
    debt: debt.value,
    loansTaken: loansTaken.value,
    stage: stage.value,
    ownsEveryGenerator: ownsEveryGenerator.value,
    ownsAnyAudience: ownsAnyAudience.value,
    tapBurst: tapBurst(),
});

export const checkAchievements = () => {
    const snapshot = buildSnapshot();
    const fresh = [];
    for (const ach of ACHIEVEMENTS) {
        if (unlocked.value.includes(ach.id)) continue;
        if (!ach.condition(snapshot)) continue;
        unlocked.value = [...unlocked.value, ach.id];
        fresh.push(ach.id);
        pushToast({
            kind: ach.cash > 0 ? 'cash' : 'achievement',
            title: ach.cash > 0 ? `🏆 ${ach.name} — £${ach.cash} unlocked!` : `🏆 ${ach.name}`,
            body: ach.message,
            ttl: 9000,
        });
    }
    return fresh;
};

// --- Lifecycle -------------------------------------------------------------
// The game pauses while you're away — nothing is made up. If you've been gone a
// little while, say hello and (if you're underway) throw a small warm event your
// way. `awayMs` is passed on tab-resume; on cold load we measure from lastSeen.
const welcomeBack = (awayMs) => {
    const elapsed = awayMs ?? (Date.now() - lastSeen.value);
    if (!Number.isFinite(elapsed) || elapsed < WELCOME_BACK_MIN_MS) return;
    pushToast({
        title: '👋 Welcome back',
        body: "If you're not here, the fans aren't here, so you're right where you left off. Here's a little something to get you going.",
        ttl: 8000,
    });
    if (progress() > 0) runEvent(false); // a warm hello, not a windfall
};

let tickHandle = null;
export const startGame = () => {
    welcomeBack();
    lastSeen.value = Date.now();
    checkAchievements();
    let last = Date.now();
    tickHandle = setInterval(() => {
        const now = Date.now();
        // Clamp dt so a frozen/backgrounded tab can't dump a huge catch-up.
        const dt = Math.min((now - last) / 1000, MAX_TICK_SECONDS);
        last = now;

        const dPlays = playsPerSecond.value * dt;
        const dFans = fansPerSecond.value * dt;
        if (dPlays > 0) { plays.value += dPlays; totalPlays.value += dPlays; }
        if (dFans > 0) { fans.value += dFans; totalFans.value += dFans; }
        const income = moneyPerSecond.value * dt;
        if (income > 0) earnRevenue(income);
        serviceDebt(dt);
        syncFansByCountry();
        pruneModifiers();
        tickEvents();
        checkStageTransition();

        sampleAccum += dt * 1000;
        if (sampleAccum >= SAMPLE_MS) {
            sampleAccum = 0;
            pushHistory(playsPerSecond.value);
        }
        lastSeen.value = now;
        checkAchievements();
    }, TICK_MS);

    // Pause-on-leave / greet-on-return. When the tab hides we note the time; when
    // it comes back we reset the tick clock (so no catch-up dump), reschedule
    // events fresh (no backlog), and — if you were gone a while — say hello.
    let hiddenAt = 0;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            hiddenAt = Date.now();
            lastSeen.value = hiddenAt;
        } else {
            last = Date.now();
            nextEventAt = 0;
            if (hiddenAt) welcomeBack(Date.now() - hiddenAt);
            hiddenAt = 0;
            lastSeen.value = Date.now();
        }
    });
    window.addEventListener('beforeunload', () => { lastSeen.value = Date.now(); });
};

export const stopGame = () => {
    if (tickHandle) clearInterval(tickHandle);
    tickHandle = null;
};
