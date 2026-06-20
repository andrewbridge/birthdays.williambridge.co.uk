import { css } from '../deps/goober.mjs';
import { moneyEarned, totalPlays, fans, stage } from '../game/state.mjs';
import { LABEL_REVENUE_SHARE } from '../config.mjs';
import { formatStreams, formatMoney } from '../game/format.mjs';

const styles = css`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    @media (max-width: 720px) { grid-template-columns: 1fr; }
    .card {
        border-radius: 0.9rem;
        padding: 1.1rem 1.25rem;
        color: #fff;
        position: relative;
        overflow: hidden;
        min-height: 92px;
    }
    .card.revenue { background: linear-gradient(120deg, #b0156b, #7a1fa2); }
    .card.plays { background: linear-gradient(120deg, #d98c1f, #c2691a); }
    .card.listeners { background: linear-gradient(120deg, #5b5bd6, #7a52c7); }
    .top { display: flex; justify-content: space-between; align-items: center; }
    .label { font-weight: 800; }
    .range { font-size: 0.72rem; opacity: 0.85; }
    .value {
        margin-top: 0.5rem;
        font-size: clamp(1.6rem, 6vw, 2.2rem);
        font-weight: 800;
        font-variant-numeric: tabular-nums;
        line-height: 1;
    }
    .cut {
        margin-top: 0.45rem;
        font-size: 0.7rem; font-weight: 800;
        display: inline-block;
        padding: 0.15rem 0.45rem; border-radius: 0.4rem;
        background: rgba(0,0,0,0.32); color: #ffd1d1;
    }
`;

export default {
    name: 'StatCards',
    data: () => ({ moneyEarned, totalPlays, fans, stage }),
    computed: {
        keepPct() { return Math.round(LABEL_REVENUE_SHARE * 100); },
        cutPct() { return Math.round((1 - LABEL_REVENUE_SHARE) * 100); },
    },
    methods: { formatStreams, formatMoney },
    template: `
        <div class="${styles}">
            <div class="card revenue">
                <div class="top"><span class="label">Revenue</span><span class="range">All time ▾</span></div>
                <div class="value">{{ formatMoney(moneyEarned) }}</div>
                <span class="cut" v-if="stage === 2">Label takes {{ cutPct }}% · you keep {{ keepPct }}%</span>
            </div>
            <div class="card plays">
                <div class="top"><span class="label">Plays</span><span class="range">All time ▾</span></div>
                <div class="value">{{ formatStreams(totalPlays) }}</div>
            </div>
            <div class="card listeners">
                <div class="top"><span class="label">Listeners</span><span class="range">All time ▾</span></div>
                <div class="value">{{ formatStreams(fans) }}</div>
            </div>
        </div>`,
};
