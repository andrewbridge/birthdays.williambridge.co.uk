import { css } from '../deps/goober.mjs';
import { bank, debt } from '../game/state.mjs';
import { formatMoney } from '../game/format.mjs';

// The grim truth next to the glossy Revenue card: what's actually in the bank,
// and (if you took a loan) what you owe. The contrast is the joke.
const styles = css`
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
    .pill {
        display: flex;
        flex-direction: column;
        padding: 0.45rem 0.8rem;
        border-radius: 0.6rem;
        border: 1px solid var(--border);
        background: var(--card);
        min-width: 120px;
    }
    .pill .k { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
    .pill .v { font-weight: 800; font-variant-numeric: tabular-nums; }
    .pill.debt { border-color: #5c1f1f; background: #1f0f10; }
    .pill.debt .v { color: var(--danger); }
`;

export default {
    name: 'BalanceBar',
    data: () => ({ bank, debt }),
    methods: { formatMoney },
    template: `
        <div class="${styles}">
            <div class="pill">
                <span class="k">Bank balance</span>
                <span class="v">{{ formatMoney(bank) }}</span>
            </div>
            <div class="pill debt" v-if="debt > 0">
                <span class="k">Debt</span>
                <span class="v">{{ formatMoney(debt) }}</span>
            </div>
        </div>`,
};
