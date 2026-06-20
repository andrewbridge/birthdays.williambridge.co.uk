import { css } from '../deps/goober.mjs';
import { toasts, dismissToast } from '../game/engine.mjs';

const styles = css`
    position: fixed;
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    width: min(92vw, 420px);
    display: grid;
    gap: 0.5rem;
    z-index: 50;
    pointer-events: none;
    .toast {
        pointer-events: auto;
        background: var(--card);
        border: 1px solid var(--border);
        border-left: 4px solid var(--muted);
        border-radius: 0.75rem;
        padding: 0.7rem 0.9rem;
        box-shadow: 0 12px 30px -12px rgba(0,0,0,0.6);
        cursor: pointer;
        animation: pop 0.25s ease;
    }
    .toast.cash { border-left-color: var(--accent); }
    .toast.achievement { border-left-color: #f5c518; }
    .toast.debt { border-left-color: var(--danger); }
    .toast.event-warm { border-left-color: var(--accent); }
    .toast.event-dark { border-left-color: var(--danger); }
    .title { font-weight: 800; }
    .body { font-size: 0.85rem; color: var(--muted); margin-top: 0.15rem; }
    @keyframes pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; } }
`;

export default {
    name: 'Toasts',
    data: () => ({ toasts }),
    methods: { dismissToast },
    template: `
        <div class="${styles}">
            <div v-for="t in toasts" :key="t.id" class="toast" :class="t.kind" @click="dismissToast(t.id)">
                <div class="title">{{ t.title }}</div>
                <div class="body" v-if="t.body">{{ t.body }}</div>
            </div>
        </div>`,
};
