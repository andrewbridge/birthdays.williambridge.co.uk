import { css } from '../deps/goober.mjs';
import { tap } from '../game/engine.mjs';
import { perTap } from '../game/state.mjs';
import { formatRate } from '../game/format.mjs';

// The clicker core, dressed for the dashboard: manually grinding content.
const styles = css`
    display: flex;
    align-items: center;
    gap: 1rem;
    .blurb { flex: 1; }
    .blurb .t { font-weight: 800; }
    .blurb .s { font-size: 0.78rem; color: var(--muted); }
    button {
        all: unset;
        cursor: pointer;
        text-align: center;
        padding: 1rem 1.4rem;
        border-radius: 0.9rem;
        font-weight: 900;
        color: #04210f;
        background: radial-gradient(circle at 30% 25%, #1ed760, #1db954 60%, #14913f);
        box-shadow: 0 12px 28px -12px rgba(30, 215, 96, 0.7);
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        user-select: none;
        transition: transform 0.05s ease;
        white-space: nowrap;
    }
    button .s { display: block; font-size: 0.72rem; font-weight: 700; opacity: 0.85; }
    button:active { transform: scale(0.96); }
`;

export default {
    name: 'TapButton',
    data: () => ({ perTap }),
    methods: { tap, formatRate },
    template: `
        <div class="${styles}">
            <div class="blurb">
                <div class="t">Post a reel</div>
                <div class="s">Feed the machine. One more post. It'll be worth it eventually, right?</div>
            </div>
            <button type="button" @pointerdown.prevent="tap" aria-label="Post a reel for plays">
                ▶ POST
                <span class="s">+{{ formatRate(perTap) }} plays</span>
            </button>
        </div>`,
};
