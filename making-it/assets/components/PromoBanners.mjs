import { css } from '../deps/goober.mjs';
import { UPGRADES } from '../game/upgrades.mjs';
import { buyUpgrade } from '../game/engine.mjs';
import { upgradesBought, canAfford, stage } from '../game/state.mjs';
import { upgradeCopy } from '../game/stages.mjs';
import { formatMoney } from '../game/format.mjs';

// Upgrades, dressed as the grubby ads that chase musicians around. Loud,
// banner-ish, slightly gross on purpose.
const styles = css`
    display: grid;
    gap: 0.6rem;
    .promo {
        display: flex; align-items: center; gap: 0.8rem;
        padding: 0.7rem 0.9rem;
        border-radius: 0.75rem;
        border: 1px dashed #6b5cff;
        background: repeating-linear-gradient(135deg, #1a1430, #1a1430 10px, #1d1636 10px, #1d1636 20px);
    }
    .body { flex: 1; min-width: 0; }
    .pitch { font-weight: 900; letter-spacing: 0.02em; }
    .sub { font-size: 0.74rem; color: var(--muted); }
    button {
        all: unset; cursor: pointer; white-space: nowrap;
        padding: 0.5rem 0.8rem; border-radius: 0.55rem; font-weight: 800; font-size: 0.8rem;
        color: #1a1430; background: linear-gradient(90deg, #8f7bff, #6b5cff); text-align: center;
    }
    button:disabled { cursor: not-allowed; background: #2a2a30; color: var(--muted); }
    .bought { color: var(--accent); font-weight: 800; white-space: nowrap; }
    .x{ font-size: 0.7rem; color: var(--muted); }
`;

export default {
    name: 'PromoBanners',
    data: () => ({ upgradesBought, stage }),
    computed: {
        // Only the promos available in the current act (the lineup changes per stage).
        promos() { return UPGRADES.filter((u) => this.stage >= (u.minStage ?? 1)); },
    },
    methods: {
        buyUpgrade, canAfford, formatMoney,
        copyOf(p) { return upgradeCopy(p, this.stage); },
    },
    template: `
        <div class="${styles}">
            <div class="promo" v-for="p in promos" :key="p.id">
                <div class="body">
                    <div class="pitch">{{ copyOf(p).pitch }} <span class="x">×{{ p.mult }}</span></div>
                    <div class="sub">{{ copyOf(p).sub }}</div>
                </div>
                <span class="bought" v-if="upgradesBought.includes(p.id)">ACTIVE ✓</span>
                <button v-else :disabled="!canAfford(p.cost)" @click="buyUpgrade(p)">
                    {{ formatMoney(p.cost) }}
                </button>
            </div>
        </div>`,
};
