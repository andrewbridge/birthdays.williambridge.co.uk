import { css } from '../deps/goober.mjs';
import { REACH_GENERATORS, AUDIENCE_GENERATORS } from '../game/generators.mjs';
import { buyGenerator } from '../game/engine.mjs';
import { ownedOf, costOf, canAfford, generatorUnlocked, stage } from '../game/state.mjs';
import { stageCopy, generatorCopy } from '../game/stages.mjs';
import { UNLOCK_PREV_COUNT } from '../config.mjs';
import { formatMoney, formatRate } from '../game/format.mjs';

const styles = css`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    @media (max-width: 720px) { grid-template-columns: 1fr; }
    .track h4 { margin: 0 0 0.2rem; font-size: 0.95rem; }
    .track .why { margin: 0 0 0.7rem; font-size: 0.78rem; color: var(--muted); }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.55rem; }
    li {
        display: flex; align-items: center; gap: 0.7rem;
        padding: 0.6rem 0.75rem;
        border: 1px solid var(--border);
        border-radius: 0.75rem;
        background: var(--card);
    }
    li.locked { opacity: 0.55; border-style: dashed; }
    .owned { min-width: 2rem; text-align: center; font-weight: 800; color: var(--accent); }
    .lock { min-width: 2rem; text-align: center; font-size: 1.1rem; }
    .body { flex: 1; min-width: 0; }
    .name { display: block; font-weight: 700; }
    .blurb { display: block; font-size: 0.74rem; color: var(--muted); }
    button {
        all: unset; cursor: pointer; white-space: nowrap;
        padding: 0.5rem 0.7rem; border-radius: 0.55rem;
        font-weight: 800; font-size: 0.8rem; text-align: center;
        color: #04210f; background: var(--accent);
    }
    button .c { display: block; font-size: 0.7rem; font-weight: 600; opacity: 0.85; }
    button:disabled { cursor: not-allowed; background: #2a2a30; color: var(--muted); }
`;

// A stage-gated move is teased without revealing its name (a reveal for later).
const stageGateTeaser = (minStage) =>
    minStage >= 3 ? '🔒 Unlocks once you go independent' : '🔒 Unlocks when you sign to a label';

// Show every unlocked move in a track, plus the first locked one as a greyed
// teaser (so there's always a visible next goal); hide anything beyond that.
// Names/blurbs are the current stage's flavour; mechanics are unchanged.
const visibleMoves = (list, stage) => {
    const out = [];
    for (let i = 0; i < list.length; i++) {
        const g = list[i];
        const c = generatorCopy(g, stage);
        if (generatorUnlocked(g)) {
            out.push({ g, name: c.name, blurb: c.blurb, locked: false, teaser: null });
        } else if (stage < (g.minStage ?? 1)) {
            // Locked by act, not by count — tease it without spoiling what it is.
            out.push({ g, name: 'New career moves', blurb: '', locked: true, teaser: stageGateTeaser(g.minStage ?? 1) });
            break;
        } else {
            const prev = list[i - 1];
            const need = prev.unlockAt ?? UNLOCK_PREV_COUNT;
            const prevName = generatorCopy(prev, stage).name;
            out.push({ g, name: c.name, blurb: c.blurb, locked: true, teaser: `🔒 Own ${need} × ${prevName} to unlock` });
            break;
        }
    }
    return out;
};

export default {
    name: 'CareerMoves',
    data: () => ({ reachList: REACH_GENERATORS, audienceList: AUDIENCE_GENERATORS, stage }),
    computed: {
        reach() { return visibleMoves(this.reachList, this.stage); },
        audience() { return visibleMoves(this.audienceList, this.stage); },
        copy() { return stageCopy(this.stage); },
    },
    methods: { buyGenerator, ownedOf, costOf, canAfford, formatMoney, formatRate },
    template: `
        <div class="${styles}">
            <section class="track">
                <h4>📈 Reach</h4>
                <p class="why">{{ copy.reachWhy }}</p>
                <ul>
                    <li v-for="m in reach" :key="m.g.id" :class="{ locked: m.locked }">
                        <span class="owned" v-if="!m.locked">{{ ownedOf(m.g.id) }}</span>
                        <span class="lock" v-else>🔒</span>
                        <span class="body">
                            <span class="name">{{ m.name }}</span>
                            <span class="blurb" v-if="!m.locked">{{ m.blurb }} (+{{ formatRate(m.g.output) }} plays/s)</span>
                            <span class="blurb" v-else>{{ m.teaser }}</span>
                        </span>
                        <button v-if="!m.locked" :disabled="!canAfford(costOf(m.g))" @click="buyGenerator(m.g)">
                            BUY <span class="c">{{ formatMoney(costOf(m.g)) }}</span>
                        </button>
                    </li>
                </ul>
            </section>
            <section class="track">
                <h4>💚 Audience</h4>
                <p class="why">{{ copy.audienceWhy }}</p>
                <ul>
                    <li v-for="m in audience" :key="m.g.id" :class="{ locked: m.locked }">
                        <span class="owned" v-if="!m.locked">{{ ownedOf(m.g.id) }}</span>
                        <span class="lock" v-else>🔒</span>
                        <span class="body">
                            <span class="name">{{ m.name }}</span>
                            <span class="blurb" v-if="!m.locked">{{ m.blurb }} (+{{ formatRate(m.g.output) }} fans/s)</span>
                            <span class="blurb" v-else>{{ m.teaser }}</span>
                        </span>
                        <button v-if="!m.locked" :disabled="!canAfford(costOf(m.g))" @click="buyGenerator(m.g)">
                            BUY <span class="c">{{ formatMoney(costOf(m.g)) }}</span>
                        </button>
                    </li>
                </ul>
            </section>
        </div>`,
};
