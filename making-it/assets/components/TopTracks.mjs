import { css } from '../deps/goober.mjs';
import { totalPlays } from '../game/state.mjs';
import { formatStreams } from '../game/format.mjs';

// Flavour: a "top tracks" table like the mockup. Fixed titles + weights; play
// counts scale with your real total so the table grows as you do.
const TRACKS = [
    { title: 'Rambling Soldier', weight: 0.34 },
    { title: 'House of Dinah', weight: 0.24 },
    { title: 'Carpenter\'s Morris', weight: 0.18 },
    { title: 'Greensleeve', weight: 0.14 },
    { title: 'Midnight On The Water', weight: 0.10 },
];

const styles = css`
    h3 { margin: 0 0 0.6rem; font-size: 1rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { text-align: left; color: var(--muted); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; padding-bottom: 0.4rem; }
    td { padding: 0.45rem 0; border-bottom: 1px solid var(--border); }
    .n { color: var(--muted); width: 1.5rem; }
    .num { text-align: right; font-variant-numeric: tabular-nums; }
`;

export default {
    name: 'TopTracks',
    data: () => ({ tracks: TRACKS, totalPlays }),
    methods: {
        formatStreams,
        plays(w) { return this.totalPlays * w; },
    },
    template: `
        <div class="${styles}">
            <h3>Top tracks</h3>
            <table>
                <tr><th class="n">#</th><th>Title</th><th class="num">Plays</th></tr>
                <tr v-for="(t, i) in tracks" :key="t.title">
                    <td class="n">{{ i + 1 }}</td>
                    <td>{{ t.title }}</td>
                    <td class="num">{{ formatStreams(plays(t.weight)) }}</td>
                </tr>
            </table>
        </div>`,
};
