import { computed } from '../deps/vue.mjs';
import { SERVER_ENDPOINT } from '../config.mjs';
import { unlocked, cashToken, paidCashIds } from '../game/state.mjs';
import { achievementById } from '../game/achievements.mjs';
import { pushToast } from '../game/engine.mjs';

// Achievements that carry real cash, are unlocked, and haven't been paid yet.
export const pendingCashIds = computed(() =>
    unlocked.value.filter((id) => {
        const ach = achievementById[id];
        return ach && ach.cash > 0 && !paidCashIds.value.includes(id);
    }));

export const pendingCashTotal = computed(() =>
    pendingCashIds.value.reduce((sum, id) => sum + (achievementById[id]?.cash ?? 0), 0));

export const hasValidToken = computed(() =>
    !!cashToken.value && cashToken.value.expiresAt > Date.now());

const post = async (path, body) => {
    const res = await fetch(`${SERVER_ENDPOINT}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
};

// Step 1: ask the server to text an OTP to the authorised phone.
export const requestCode = (phoneNumber) => post('/auth', { phoneNumber });

// Step 2: exchange phone + code for a 24h token, stored for re-use.
export const verifyCode = async (phoneNumber, code) => {
    const { token } = await post('/verify', { phoneNumber, code });
    cashToken.value = {
        token,
        phoneNumber,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
    return token;
};

// Step 3: claim outstanding payouts. The server holds the canonical amount and
// enforces one-time payment; we just mark what it confirms as processed.
export const withdraw = async () => {
    if (!hasValidToken.value) throw new Error('Not verified');
    const ids = pendingCashIds.value;
    if (ids.length === 0) return { paid: 0, amount: 0 };

    const { results = [] } = await post('/sync', {
        token: cashToken.value.token,
        ids,
    });

    let amount = 0;
    const newlyPaid = [];
    for (const result of results) {
        if (result.processed && achievementById[result.id]) {
            newlyPaid.push(result.id);
            amount += achievementById[result.id].cash;
        }
    }
    if (newlyPaid.length) {
        paidCashIds.value = [...new Set([...paidCashIds.value, ...newlyPaid])];
        pushToast({
            kind: 'cash',
            title: `💸 £${amount} on its way`,
            body: 'Check your bank account soon!',
            ttl: 10000,
        });
    }

    // Every requested id is a known, unpaid cash achievement, so anything the
    // server didn't confirm as processed is a genuine failure — surface it so the
    // UI doesn't silently show "£0.00 on its way". Paid ids are already recorded
    // above, so a retry only re-attempts the ones that failed.
    const failed = ids.filter((id) => !newlyPaid.includes(id));
    if (failed.length) {
        throw new Error(
            `Couldn't process ${failed.length} payout${failed.length > 1 ? 's' : ''}. Please try again in a moment.`,
        );
    }

    return { paid: newlyPaid.length, amount };
};
