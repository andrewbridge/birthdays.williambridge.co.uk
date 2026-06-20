import { css } from '../deps/goober.mjs';
import { saleModalOpen, closeSaleModal } from '../services/ui.mjs';
import { sellCatalogue } from '../game/engine.mjs';

// Confirmation for the Stage-2 → Stage-3 capstone. Spells out exactly what's
// kept and what resets, so it's a deliberate choice rather than a trap.
const styles = css`
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.78);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    .sheet { width: min(94vw, 460px); background: var(--card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.4rem; }
    .badge { font-size: 0.78rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--accent); }
    h2 { margin: 0.3rem 0 0.6rem; }
    p { margin: 0 0 0.7rem; color: var(--muted); font-size: 0.92rem; }
    ul { margin: 0 0 0.4rem; padding-left: 1.1rem; font-size: 0.86rem; }
    li { margin: 0.2rem 0; }
    .keep { color: var(--accent); }
    .lose { color: var(--danger); }
    .actions { display: flex; gap: 0.5rem; margin-top: 1.1rem; }
    .primary { all: unset; flex: 1; text-align: center; cursor: pointer; padding: 0.85rem; border-radius: 0.7rem; font-weight: 800; color: #04210f; background: var(--accent); }
    .ghost { all: unset; cursor: pointer; padding: 0.85rem 1rem; border-radius: 0.7rem; border: 1px solid var(--border); text-align: center; }
`;

export default {
    name: 'CatalogueSaleModal',
    data: () => ({ open: saleModalOpen }),
    methods: {
        cancel() { closeSaleModal(); },
        confirm() { sellCatalogue(); closeSaleModal(); },
    },
    template: `
        <div class="${styles}" v-if="open">
            <div class="sheet">
                <div class="badge">One last decision</div>
                <h2>Sell the back catalogue?</h2>
                <p>You buy yourself out of the deal. No more label, no more cut. But the head start you built goes with it.</p>
                <ul>
                    <li class="keep">Keep: your money, your fans, your lifetime numbers.</li>
                    <li class="lose">Reset: your career moves — production drops to zero and you rebuild.</li>
                    <li class="keep">Clear: every debt, and the label's cut. You're free.</li>
                </ul>
                <div class="actions">
                    <button class="ghost" @click="cancel">Not yet</button>
                    <button class="primary" @click="confirm">Sell &amp; walk away</button>
                </div>
            </div>
        </div>`,
};
