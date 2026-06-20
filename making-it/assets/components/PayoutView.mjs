import { css } from '../deps/goober.mjs';
import AndrewNote from './AndrewNote.mjs';
import { formatMoney } from '../game/format.mjs';
import { achievementById } from '../game/achievements.mjs';
import { paidCashIds } from '../game/state.mjs';
import {
    pendingCashIds, pendingCashTotal, hasValidToken,
    requestCode, verifyCode, withdraw,
} from '../services/cash.mjs';

const styles = css`
    display: grid;
    gap: 1rem;
    max-width: 640px;
    .panel { background: var(--card); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1.1rem 1.25rem; }
    h2 { margin: 0 0 0.2rem; }
    .lede { color: var(--muted); margin: 0 0 1rem; font-size: 0.9rem; }
    .row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border); }
    .row:last-child { border-bottom: none; }
    .row .amt { font-weight: 800; font-variant-numeric: tabular-nums; }
    .row.paid .amt { color: var(--muted); }
    .total { display: flex; justify-content: space-between; font-weight: 800; margin-top: 0.6rem; }
    label { display: block; font-weight: 700; font-size: 0.85rem; margin: 0.6rem 0 0.35rem; }
    input { width: 100%; padding: 0.7rem 0.8rem; font-size: 1rem; border-radius: 0.6rem; border: 1px solid var(--border); background: #0c0c0e; color: inherit; }
    .err { color: var(--danger); font-size: 0.85rem; margin-top: 0.5rem; }
    .actions { display: flex; gap: 0.5rem; margin-top: 0.9rem; }
    .primary { all: unset; flex: 1; text-align: center; cursor: pointer; padding: 0.8rem; border-radius: 0.7rem; font-weight: 800; color: #04210f; background: var(--accent); }
    .primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .muted { color: var(--muted); font-size: 0.85rem; }
`;

export default {
    name: 'PayoutView',
    components: { AndrewNote },
    data: () => ({
        pendingCashIds, pendingCashTotal, hasValidToken, paidCashIds,
        step: 'idle', // idle | code | working | done
        phone: '',
        code: '',
        error: '',
        paidAmount: 0,
    }),
    computed: {
        pending() { return this.pendingCashIds.map((id) => achievementById[id]).filter(Boolean); },
        paid() { return this.paidCashIds.map((id) => achievementById[id]).filter(Boolean); },
    },
    methods: {
        formatMoney,
        async sendCode() {
            this.error = ''; this.step = 'working';
            try { await requestCode(this.phone.trim()); this.step = 'code'; }
            catch (e) { this.error = e.message; this.step = 'idle'; }
        },
        async confirmCode() {
            this.error = ''; this.step = 'working';
            try { await verifyCode(this.phone.trim(), this.code.trim()); await this.doWithdraw(); }
            catch (e) { this.error = e.message; this.step = 'code'; }
        },
        async doWithdraw() {
            this.error = ''; this.step = 'working';
            try {
                const { amount } = await withdraw();
                this.paidAmount = amount; this.step = 'done';
            } catch (e) { this.error = e.message; this.step = 'idle'; }
        },
    },
    template: `
        <div class="${styles}">
            <div class="panel"><AndrewNote /></div>

            <div class="panel">
                <h2>Payouts</h2>

                <template v-if="pending.length">
                    <div class="row" v-for="a in pending" :key="a.id">
                        <span>{{ a.name }}</span><span class="amt">{{ formatMoney(a.cash) }}</span>
                    </div>
                    <div class="total"><span>Ready to withdraw</span><span>{{ formatMoney(pendingCashTotal) }}</span></div>
                </template>
                <p class="muted" v-else>Nothing to withdraw right now. Unlock cash prices by playing, check back here later.</p>

                <template v-if="pending.length">
                    <template v-if="step === 'idle' && hasValidToken">
                        <div class="actions"><button class="primary" @click="doWithdraw">Withdraw {{ formatMoney(pendingCashTotal) }}</button></div>
                    </template>
                    <template v-else-if="step === 'idle'">
                        <label>Your phone number</label>
                        <input v-model="phone" type="tel" inputmode="tel" placeholder="07…" autocomplete="tel" />
                        <p class="err" v-if="error">{{ error }}</p>
                        <div class="actions"><button class="primary" :disabled="!phone" @click="sendCode">Text verification code</button></div>
                    </template>
                    <template v-else-if="step === 'code'">
                        <label>Enter the code texted to {{ phone }}</label>
                        <input v-model="code" type="text" inputmode="numeric" placeholder="123456" autocomplete="one-time-code" />
                        <p class="err" v-if="error">{{ error }}</p>
                        <div class="actions"><button class="primary" :disabled="!code" @click="confirmCode">Verify &amp; withdraw</button></div>
                    </template>
                    <template v-else-if="step === 'working'">
                        <p class="muted">Unlocking prizes, hold tight!</p>
                    </template>
                </template>

                <template v-if="step === 'done'">
                    <p class="muted">{{ formatMoney(paidAmount) }} is on its way to your bank, check back soon. 🎉</p>
                </template>
            </div>

            <div class="panel" v-if="paid.length">
                <h2>Already paid</h2>
                <div class="row paid" v-for="a in paid" :key="a.id">
                    <span>{{ a.name }}</span><span class="amt">{{ formatMoney(a.cash) }} ✓</span>
                </div>
            </div>
        </div>`,
};
