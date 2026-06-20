import { css } from '../deps/goober.mjs';
import TapButton from './TapButton.mjs';
import StatCards from './StatCards.mjs';
import PlaysChart from './PlaysChart.mjs';
import ListenersPanel from './ListenersPanel.mjs';
import CareerMoves from './CareerMoves.mjs';
import PromoBanners from './PromoBanners.mjs';
import LoanOffers from './LoanOffers.mjs';
import ActivityFeed from './ActivityFeed.mjs';
import TopTracks from './TopTracks.mjs';
import { stage, moneyEarned } from '../game/state.mjs';
import { stageCopy } from '../game/stages.mjs';
import { STAGE3_UNLOCK_AT } from '../config.mjs';
import { openSaleModal } from '../services/ui.mjs';
import { formatMoney } from '../game/format.mjs';

const styles = css`
    display: grid;
    gap: 1rem;
    .panel { background: var(--card); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1rem 1.1rem; }
    .panel > h3.head { margin: 0 0 0.2rem; font-size: 1rem; }
    .panel > .lede { margin: 0 0 0.8rem; font-size: 0.8rem; color: var(--muted); }
    .two { display: grid; grid-template-columns: 1fr 1.4fr; gap: 1rem; }
    @media (max-width: 860px) { .two { grid-template-columns: 1fr; } }
    .sell {
        border: 1px solid var(--accent);
        background: linear-gradient(120deg, #0f2417, #10241c);
        display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
    }
    .sell .body { flex: 1; min-width: 0; }
    .sell h3 { margin: 0 0 0.2rem; font-size: 1rem; }
    .sell p { margin: 0; font-size: 0.8rem; color: var(--muted); }
    .sell button {
        all: unset; cursor: pointer; white-space: nowrap; text-align: center;
        padding: 0.7rem 1.1rem; border-radius: 0.7rem; font-weight: 800;
        color: #04210f; background: var(--accent);
    }
`;

export default {
    name: 'DashboardView',
    components: {
        TapButton, StatCards, PlaysChart, ListenersPanel, CareerMoves, PromoBanners, LoanOffers, ActivityFeed, TopTracks,
    },
    data: () => ({ stage, moneyEarned }),
    computed: {
        copy() { return stageCopy(this.stage); },
        canSell() { return this.stage === 2 && this.moneyEarned >= STAGE3_UNLOCK_AT; },
    },
    methods: { openSaleModal, formatMoney },
    template: `
        <div class="${styles}">
            <div class="panel"><TapButton /></div>
            <StatCards />
            <div class="panel sell" v-if="canSell">
                <div class="body">
                    <h3>🕊️ Sell your back catalogue</h3>
                    <p>Buy yourself out. Keep your money and your fans, lose the label's cut — and start the climb again.</p>
                </div>
                <button @click="openSaleModal">Sell &amp; walk away</button>
            </div>
            <div class="two">
                <div class="panel"><ListenersPanel /></div>
                <div class="panel"><PlaysChart /></div>
            </div>
            <div class="panel">
                <h3 class="head">{{ copy.careerHead }}</h3>
                <p class="lede">{{ copy.careerLede }}</p>
                <CareerMoves />
            </div>
            <div class="two">
                <div class="panel">
                    <h3 class="head">{{ copy.promoHead }}</h3>
                    <p class="lede">{{ copy.promoLede }}</p>
                    <PromoBanners />
                </div>
                <div class="panel">
                    <h3 class="head">Cash flow solutions 🤝</h3>
                    <p class="lede">Short on funds? These nice people can help. Probably.</p>
                    <LoanOffers />
                </div>
            </div>
            <div class="two">
                <div class="panel"><ActivityFeed /></div>
                <div class="panel"><TopTracks /></div>
            </div>
        </div>`,
};
