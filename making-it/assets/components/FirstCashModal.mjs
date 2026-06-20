import { css } from '../deps/goober.mjs';
import AndrewNote from './AndrewNote.mjs';
import { formatMoney } from '../game/format.mjs';
import { seenCashIntro } from '../game/state.mjs';
import { pendingCashTotal, pendingCashIds } from '../services/cash.mjs';
import { goTo } from '../services/ui.mjs';

// Fires once: the first time real cash is waiting and the intro hasn't shown.
// Drops the comic tone to make crystal clear the money is genuinely real.
const styles = css`
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.72);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    .sheet { width: min(94vw, 460px); background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.4rem; }
    .badge { font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); }
    h2 { margin: 0.3rem 0 0.2rem; }
    .amt { color: var(--accent); }
    hr { border: none; border-top: 1px solid var(--border); margin: 1rem 0; }
    .actions { display: flex; gap: 0.5rem; margin-top: 1.1rem; }
    .primary { all: unset; flex: 1; text-align: center; cursor: pointer; padding: 0.85rem; border-radius: 0.7rem; font-weight: 800; color: #04210f; background: var(--accent); }
    .ghost { all: unset; cursor: pointer; padding: 0.85rem 1rem; border-radius: 0.7rem; border: 1px solid var(--border); text-align: center; }
`;

export default {
    name: 'FirstCashModal',
    components: { AndrewNote },
    data: () => ({ open: false, pendingCashTotal }),
    computed: {
        pendingCount() { return pendingCashIds.value.length; },
    },
    watch: {
        pendingCount: {
            immediate: true,
            handler(n) {
                if (n > 0 && !seenCashIntro.value) this.open = true;
            },
        },
    },
    methods: {
        formatMoney,
        dismiss() { seenCashIntro.value = true; this.open = false; },
        goPayout() { this.dismiss(); goTo('payout'); },
    },
    template: `
        <div class="${styles}" v-if="open">
            <div class="sheet">
                <div class="badge">This part is real</div>
                <h2>You've earned <span class="amt">{{ formatMoney(pendingCashTotal) }}</span> of actual money.</h2>
                <hr />
                <AndrewNote />
                <div class="actions">
                    <button class="ghost" @click="dismiss">Later</button>
                    <button class="primary" @click="goPayout">Take me to it</button>
                </div>
            </div>
        </div>`,
};
