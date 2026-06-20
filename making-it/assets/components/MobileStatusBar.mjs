import { css } from '../deps/goober.mjs';
import { bank, debt, totalPlays, fans } from '../game/state.mjs';
import { formatMoney, formatStreams } from '../game/format.mjs';

// A compact, mobile-only bar that pins to the top once the main header (and the
// stat cards) have scrolled away, so your Bank balance is always in reach. Plays
// and Listeners ride along, smaller. Hidden entirely on desktop, where the
// header stays close to hand.
const styles = css`
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 60;
    display: none;
    align-items: center;
    gap: 0.6rem;
    padding: 0.45rem 0.8rem;
    padding-top: max(0.45rem, env(safe-area-inset-top));
    background: rgba(12, 12, 14, 0.92);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
    font-variant-numeric: tabular-nums;
    .bank { display: flex; flex-direction: column; line-height: 1.1; }
    .bank .k { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
    .bank .v { font-weight: 800; font-size: 0.95rem; }
    .debt { color: var(--danger); font-weight: 800; font-size: 0.8rem; }
    .spacer { flex: 1; }
    .mini { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.1; }
    .mini .k { font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
    .mini .v { font-weight: 700; font-size: 0.78rem; }
    @media (max-width: 860px) { display: flex; }
`;

export default {
    name: 'MobileStatusBar',
    data: () => ({ bank, debt, totalPlays, fans }),
    methods: { formatMoney, formatStreams },
    template: `
        <div class="${styles}">
            <div class="bank">
                <span class="k">Bank</span>
                <span class="v">{{ formatMoney(bank) }}</span>
            </div>
            <span class="debt" v-if="debt > 0">-{{ formatMoney(debt) }}</span>
            <span class="spacer"></span>
            <div class="mini">
                <span class="k">Plays</span>
                <span class="v">{{ formatStreams(totalPlays) }}</span>
            </div>
            <div class="mini">
                <span class="k">Listeners</span>
                <span class="v">{{ formatStreams(fans) }}</span>
            </div>
        </div>`,
};
