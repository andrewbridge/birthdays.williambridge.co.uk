import { css } from '../deps/goober.mjs';
import { LOANS } from '../game/loans.mjs';
import { takeLoan, repayLoan } from '../game/engine.mjs';
import { loanUnlocked, loanActive, loanEffectiveOwed, activeLoanBalances, bank } from '../game/state.mjs';
import { formatMoney } from '../game/format.mjs';

// The most predatory banners of all. Cash now; a per-type Debt balance that
// repays itself over time. You can't take a second of a type until the first is
// repaid, and the quoted repayment climbs with every loan you've ever taken.
const styles = css`
    display: grid;
    gap: 0.6rem;
    .loan {
        display: flex; align-items: center; gap: 0.8rem;
        padding: 0.7rem 0.9rem;
        border-radius: 0.75rem;
        border: 1px solid #5c1f1f;
        background: linear-gradient(120deg, #2a0f10, #1a0c0d);
    }
    .loan.locked, .loan.active {
        border-style: dashed; border-color: var(--border);
        background: var(--card); opacity: 0.7;
    }
    .body { flex: 1; min-width: 0; }
    .pitch { font-weight: 900; color: #ff9d6e; }
    .locked .pitch, .active .pitch { color: var(--muted); }
    .sub { font-size: 0.72rem; color: var(--muted); }
    .terms { font-size: 0.72rem; color: var(--muted); margin-top: 0.15rem; }
    button {
        all: unset; cursor: pointer; white-space: nowrap; text-align: center;
        padding: 0.5rem 0.85rem; border-radius: 0.55rem; font-weight: 800; font-size: 0.8rem;
        color: #2a0f10; background: linear-gradient(90deg, #ffb27a, #ff7b5c);
    }
    button .c { display: block; font-size: 0.68rem; font-weight: 600; opacity: 0.85; }
    button.settle { color: #04210f; background: var(--accent); }
    button.settle:disabled { cursor: not-allowed; background: #2a2a30; color: var(--muted); }
`;

// Show every unlocked loan (available or active/blocked) plus the next locked
// one as a teaser; hide loans beyond that.
const visibleLoans = () => {
    const out = [];
    for (const l of LOANS) {
        if (loanUnlocked(l)) {
            out.push({ l, locked: false });
        } else {
            out.push({ l, locked: true });
            break;
        }
    }
    return out;
};

export default {
    name: 'LoanOffers',
    data: () => ({ balances: activeLoanBalances, bank }),
    computed: {
        loans() { return visibleLoans(); },
    },
    methods: {
        takeLoan,
        repayLoan,
        formatMoney,
        loanActive,
        loanEffectiveOwed,
        remaining(id) { return this.balances[id] ?? 0; },
    },
    template: `
        <div class="${styles}">
            <div class="loan" :class="{ locked: row.locked, active: !row.locked && loanActive(row.l.id) }"
                 v-for="row in loans" :key="row.l.id">
                <template v-if="row.locked">
                    <div class="body">
                        <div class="pitch">🔒 {{ row.l.pitch }}</div>
                        <div class="sub">Unlocks at {{ formatMoney(row.l.unlockAt) }} earned.</div>
                    </div>
                </template>
                <template v-else-if="loanActive(row.l.id)">
                    <div class="body">
                        <div class="pitch">{{ row.l.name }}</div>
                        <div class="terms">Active · {{ formatMoney(remaining(row.l.id)) }} left to repay</div>
                    </div>
                    <button class="settle" :disabled="bank < remaining(row.l.id)" @click="repayLoan(row.l.id)">
                        PAY OFF <span class="c">{{ formatMoney(remaining(row.l.id)) }} now</span>
                    </button>
                </template>
                <template v-else>
                    <div class="body">
                        <div class="pitch">{{ row.l.pitch }}</div>
                        <div class="sub">{{ row.l.sub }}</div>
                        <div class="terms">Borrow {{ formatMoney(row.l.principal) }} · repay {{ formatMoney(loanEffectiveOwed(row.l)) }} total</div>
                    </div>
                    <button @click="takeLoan(row.l)">
                        GET IT <span class="c">+{{ formatMoney(row.l.principal) }} now</span>
                    </button>
                </template>
            </div>
        </div>`,
};
