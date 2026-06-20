import { css } from '../deps/goober.mjs';
import { computed } from '../deps/vue.mjs';
import { playsHistory } from '../game/engine.mjs';
import { playsPerSecond } from '../game/state.mjs';
import { formatRate } from '../game/format.mjs';

const W = 320;
const H = 90;

const styles = css`
    .panel-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.6rem; }
    .panel-head h3 { margin: 0; font-size: 1rem; }
    .now { font-size: 0.8rem; color: var(--muted); }
    svg { width: 100%; height: auto; display: block; }
    .area { fill: url(#playsFill); }
    .line { fill: none; stroke: var(--accent); stroke-width: 2; }
    .baseline { stroke: var(--border); stroke-dasharray: 3 4; }
`;

export default {
    name: 'PlaysChart',
    data: () => ({ W, H, playsPerSecond }),
    computed: {
        // Build an SVG area path from the rolling plays/sec buffer. The vertical
        // range auto-fits the window with generous padding, so a steady rate sits
        // mid-height and changes are obvious rather than pinned to the top.
        paths() {
            const data = playsHistory.value;
            const n = data.length;
            const min = Math.min(...data);
            const max = Math.max(...data);
            const pad = Math.max((max - min) * 0.4, max * 0.1, 1);
            const lo = min - pad;
            const hi = max + pad;
            const step = W / (n - 1);
            const y = (v) => H - ((v - lo) / (hi - lo)) * H;
            const pts = data.map((v, i) => [i * step, y(v)]);
            const line = pts.map(([x, yy], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${yy.toFixed(1)}`).join(' ');
            const area = `${line} L${W} ${H} L0 ${H} Z`;
            return { line, area };
        },
    },
    methods: { formatRate },
    template: `
        <div class="${styles}">
            <div class="panel-head">
                <h3>Plays</h3>
                <span class="now">{{ formatRate(playsPerSecond) }}/sec now</span>
            </div>
            <svg :viewBox="'0 0 ' + W + ' ' + H" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="playsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#1ed760" stop-opacity="0.45" />
                        <stop offset="100%" stop-color="#1ed760" stop-opacity="0" />
                    </linearGradient>
                </defs>
                <path class="area" :d="paths.area" />
                <path class="line" :d="paths.line" />
                <line class="baseline" :x1="0" :y1="H - 1" :x2="W" :y2="H - 1" />
            </svg>
        </div>`,
};
