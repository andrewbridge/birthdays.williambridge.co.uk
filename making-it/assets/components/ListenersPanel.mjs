import { css } from '../deps/goober.mjs';
import { fansByCountry } from '../game/state.mjs';
import { COUNTRIES, countryByName } from '../game/countries.mjs';
import { formatStreams } from '../game/format.mjs';

// A real "listeners by country" breakdown: the engine maintains integer counts
// per country (summing to your listener total), so the percentages are honest
// and shift organically as fans grow and country events fire.
const styles = css`
    h3 { margin: 0 0 0.6rem; font-size: 1rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    td { padding: 0.4rem 0; border-bottom: 1px solid var(--border); }
    .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 0.5rem; }
    .num { text-align: right; font-variant-numeric: tabular-nums; color: var(--muted); }
    .pct { text-align: right; font-variant-numeric: tabular-nums; width: 3rem; }
    .empty { font-size: 0.82rem; color: var(--muted); }
`;

export default {
    name: 'ListenersPanel',
    data: () => ({ byCountry: fansByCountry }),
    computed: {
        total() {
            return COUNTRIES.reduce((s, c) => s + (this.byCountry[c.name] ?? 0), 0);
        },
        rows() {
            return COUNTRIES
                .map((c) => ({ country: c.name, dot: c.dot, count: this.byCountry[c.name] ?? 0 }))
                .filter((r) => r.count > 0)
                .sort((a, b) => b.count - a.count);
        },
    },
    methods: {
        formatStreams,
        pct(count) { return this.total > 0 ? Math.round((count / this.total) * 100) : 0; },
        dotFor(country) { return countryByName[country]?.dot ?? '#9a9aa5'; },
    },
    template: `
        <div class="${styles}">
            <h3>Listeners <span style="color:var(--muted);font-size:0.8rem;font-weight:400">by country</span></h3>
            <p class="empty" v-if="!rows.length">No listeners yet. Post something — someone, somewhere, is about to press play.</p>
            <table v-else>
                <tr v-for="r in rows" :key="r.country">
                    <td><span class="dot" :style="{ background: r.dot }"></span>{{ r.country }}</td>
                    <td class="num">{{ formatStreams(r.count) }}</td>
                    <td class="pct">{{ pct(r.count) }}%</td>
                </tr>
            </table>
        </div>`,
};
