import { css } from '../deps/goober.mjs';

// "Slopify" — a legally distinct parody of a streaming analytics lockup. The mark
// is deliberately NOT the Spotify three-arcs: a green blob oozing a drip, with a
// declining chart line inside (your numbers, going the wrong way).
const styles = css`
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    font-weight: 700;
    .mark { width: 1.7em; height: 1.7em; display: block; }
    .word { font-size: 1.05em; letter-spacing: -0.01em; }
    .divider { opacity: 0.4; font-weight: 300; margin: 0 0.1em; }
    .sub { font-weight: 800; letter-spacing: 0.14em; font-size: 0.82em; }
`;

export default {
    name: 'Logo',
    template: `
        <span class="${styles}">
            <svg class="mark" viewBox="0 0 168 188" aria-hidden="true">
                <circle cx="84" cy="84" r="84" fill="#3ad17a" />
                <path fill="#3ad17a" d="M84 150 C92 168 96 182 84 185 C72 182 76 168 84 150 Z" />
                <polyline points="34,58 66,88 92,74 134,120" fill="none"
                    stroke="#0b0b0d" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span class="word">Slopify</span>
            <span class="divider">|</span>
            <span class="sub">ANALYTICS</span>
        </span>`,
};
