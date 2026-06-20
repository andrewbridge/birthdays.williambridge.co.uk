import { css } from '../deps/goober.mjs';
import { recentEvents } from '../game/state.mjs';

// Reads the rolling `recentEvents` log (newest first) and lists fired events with
// warm/dark styling. The empty state nudges that things will start happening.
const styles = css`
    h3 { margin: 0 0 0.2rem; font-size: 1rem; }
    .lede { margin: 0 0 0.8rem; font-size: 0.8rem; color: var(--muted); }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
    li {
        display: flex; gap: 0.7rem; align-items: flex-start;
        padding: 0.55rem 0.7rem;
        border: 1px solid var(--border);
        border-left: 4px solid var(--muted);
        border-radius: 0.6rem;
        background: #121215;
    }
    li.warm { border-left-color: var(--accent); }
    li.dark { border-left-color: var(--danger); }
    .icon { font-size: 1.1rem; line-height: 1.3; flex: none; }
    .body { min-width: 0; }
    .title { display: block; font-weight: 700; font-size: 0.88rem; }
    .text { display: block; font-size: 0.78rem; color: var(--muted); }
    .empty { font-size: 0.82rem; color: var(--muted); }
`;

export default {
    name: 'ActivityFeed',
    data: () => ({ events: recentEvents }),
    methods: {
        ago(ts) {
            const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
            if (s < 60) return `${s}s ago`;
            const m = Math.round(s / 60);
            if (m < 60) return `${m}m ago`;
            return `${Math.round(m / 60)}h ago`;
        },
    },
    template: `
        <div class="${styles}">
            <h3>Recent activity</h3>
            <p class="lede">The industry, doing its thing — for better or (usually) worse.</p>
            <p class="empty" v-if="!events.length">Nothing yet. Keep building — the world will start to notice.</p>
            <ul v-else>
                <li v-for="e in events" :key="e.id" :class="e.kind">
                    <span class="icon">{{ e.kind === 'dark' ? '⚠️' : '✨' }}</span>
                    <span class="body">
                        <span class="title">{{ e.title }}</span>
                        <span class="text">{{ e.text }}</span>
                    </span>
                </li>
            </ul>
        </div>`,
};
