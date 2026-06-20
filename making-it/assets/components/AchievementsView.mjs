import { css } from '../deps/goober.mjs';
import { ACHIEVEMENTS } from '../game/achievements.mjs';
import { unlocked, paidCashIds } from '../game/state.mjs';
import { formatMoney } from '../game/format.mjs';

const styles = css`
    max-width: 640px;
    h2 { margin: 0 0 0.2rem; }
    .lede { color: var(--muted); margin: 0 0 1rem; font-size: 0.9rem; }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.6rem; }
    li {
        display: flex; align-items: center; gap: 0.8rem;
        padding: 0.8rem 0.95rem;
        border: 1px solid var(--border);
        border-radius: 0.8rem;
        background: var(--card);
    }
    li.locked { opacity: 0.6; }
    .icon { font-size: 1.3rem; flex: none; width: 1.6rem; text-align: center; }
    .body { flex: 1; min-width: 0; }
    .name { display: block; font-weight: 700; }
    .msg { display: block; font-size: 0.8rem; color: var(--muted); }
    .badge {
        flex: none; white-space: nowrap; font-weight: 800; font-size: 0.78rem;
        padding: 0.25rem 0.55rem; border-radius: 0.5rem;
        border: 1px solid var(--border); color: var(--muted);
    }
    .badge.ready { color: #04210f; background: var(--accent); border-color: transparent; }
    .badge.paid { color: var(--accent); border-color: var(--accent); }
`;

export default {
    name: 'AchievementsView',
    data: () => ({ unlocked, paidCashIds }),
    computed: {
        unlockedCount() { return ACHIEVEMENTS.filter((a) => this.unlocked.includes(a.id)).length; },
        total() { return ACHIEVEMENTS.length; },
        items() {
            return ACHIEVEMENTS.map((a) => {
                const isUnlocked = this.unlocked.includes(a.id);
                const isPaid = this.paidCashIds.includes(a.id);
                const secret = a.hidden && !isUnlocked;
                // Keep the amount a surprise (£££) until it's actually been paid —
                // once paid, reveal the real value since it's no longer a secret.
                let badge = null;
                if (a.cash > 0) {
                    if (isPaid) badge = { cls: 'paid', text: `${formatMoney(a.cash)} ✓` };
                    else if (isUnlocked) badge = { cls: 'ready', text: '£££ ready' };
                    else badge = { cls: '', text: '£££' };
                }
                return {
                    id: a.id,
                    icon: isUnlocked ? '🏆' : '🔒',
                    name: secret ? '???' : a.name,
                    msg: isUnlocked ? a.message : (secret ? 'Hidden — keep playing to find this one.' : 'Locked'),
                    locked: !isUnlocked,
                    badge,
                };
            });
        },
    },
    template: `
        <div class="${styles}">
            <h2>Achievements</h2>
            <p class="lede">{{ unlockedCount }} / {{ total }} unlocked. The ones marked £££ pay out real money — collect them in Payout Information.</p>
            <ul>
                <li v-for="a in items" :key="a.id" :class="{ locked: a.locked }">
                    <span class="icon">{{ a.icon }}</span>
                    <span class="body">
                        <span class="name">{{ a.name }}</span>
                        <span class="msg">{{ a.msg }}</span>
                    </span>
                    <span v-if="a.badge" class="badge" :class="a.badge.cls">{{ a.badge.text }}</span>
                </li>
            </ul>
        </div>`,
};
