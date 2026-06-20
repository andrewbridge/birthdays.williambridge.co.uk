import { css } from '../deps/goober.mjs';
import { stage, seenDealIntro, debt } from '../game/state.mjs';
import { LABEL_REVENUE_SHARE } from '../config.mjs';
import { formatMoney } from '../game/format.mjs';

// Fires once, when you cross into Stage 2: a record deal you can't decline. The
// only button signs it. Sets the tone for the label years — the revenue cut and
// the big recoupable advance that just landed on your Debt.
const styles = css`
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.78);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    .sheet { width: min(94vw, 460px); background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.4rem; }
    .badge { font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #ff9d6e; }
    h2 { margin: 0.3rem 0 0.6rem; }
    p { margin: 0 0 0.7rem; color: var(--muted); font-size: 0.92rem; }
    .terms { font-size: 0.85rem; color: #ffd1d1; background: rgba(0,0,0,0.3); border-radius: 0.6rem; padding: 0.7rem 0.85rem; }
    .actions { display: flex; margin-top: 1.1rem; }
    .primary { all: unset; flex: 1; text-align: center; cursor: pointer; padding: 0.85rem; border-radius: 0.7rem; font-weight: 800; color: #2a0f10; background: linear-gradient(90deg, #ffb27a, #ff7b5c); }
`;

export default {
    name: 'RecordDealModal',
    data: () => ({ stage, seenDealIntro, debt }),
    computed: {
        open() { return this.stage === 2 && !this.seenDealIntro; },
        cutPct() { return Math.round((1 - LABEL_REVENUE_SHARE) * 100); },
        keepPct() { return Math.round(LABEL_REVENUE_SHARE * 100); },
    },
    methods: {
        formatMoney,
        sign() { seenDealIntro.value = true; },
    },
    template: `
        <div class="${styles}" v-if="open">
            <div class="sheet">
                <div class="badge">A major label slides a contract across the table</div>
                <h2>“We'd love to take you to the next level.”</h2>
                <p>Bigger rooms. Real budgets. New doors open the moment you sign. This is what making it looks like — isn't it?</p>
                <div class="terms">
                    The fine print: a <strong>{{ formatMoney(debt) }}</strong> advance — recoupable, clawed back out of everything you earn. And from now the label takes <strong>{{ cutPct }}%</strong> of your revenue; you keep <strong>{{ keepPct }}%</strong>.
                </div>
                <div class="actions">
                    <button class="primary" @click="sign">Sign it</button>
                </div>
            </div>
        </div>`,
};
