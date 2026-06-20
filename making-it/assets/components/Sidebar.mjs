import { css } from '../deps/goober.mjs';
import { view, goTo } from '../services/ui.mjs';
import { pendingCashIds } from '../services/cash.mjs';

// Real destinations: dashboard + payout. The rest are flavour stubs that keep
// the Spotify-for-Artists feel.
const NAV = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'payout', label: 'Payout Information' },
];

const styles = css`
    background: #0c0c0e;
    border-right: 1px solid var(--border);
    padding: 1rem 0.5rem;
    min-width: 0;
    nav { display: flex; flex-direction: column; gap: 0.15rem; }
    button {
        all: unset;
        cursor: pointer;
        padding: 0.55rem 0.8rem;
        border-radius: 0.5rem;
        color: var(--muted);
        font-weight: 600;
        font-size: 0.92rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        white-space: nowrap;
    }
    button:hover { color: #fff; background: #161619; }
    button.active { color: #fff; border-left: 3px solid var(--accent); padding-left: calc(0.8rem - 3px); }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); margin-left: auto; }
    @media (max-width: 860px) {
        border-right: none;
        border-bottom: 1px solid var(--border);
        padding: 0.5rem;
        nav { flex-direction: row; overflow-x: auto; }
        button.active { border-left: none; border-bottom: 2px solid var(--accent); border-radius: 0; }
    }
`;

export default {
    name: 'Sidebar',
    data: () => ({ nav: NAV, view, pendingCashIds }),
    methods: { goTo },
    template: `
        <aside class="${styles}">
            <nav>
                <button v-for="item in nav" :key="item.id"
                    :class="{ active: view === item.id }" @click="goTo(item.id)">
                    {{ item.label }}
                    <span class="dot" v-if="item.id === 'payout' && pendingCashIds.length"></span>
                </button>
            </nav>
        </aside>`,
};
