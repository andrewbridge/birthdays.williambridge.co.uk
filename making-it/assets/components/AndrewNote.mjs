import { css } from '../deps/goober.mjs';

// EDIT ME — Andrew's sincere note. This deliberately drops the game's comic tone.
// Rewrite the paragraphs in `lines` in your own words; the gravatar matches the
// holding pages. Each string is one paragraph.
const lines = [
    "Happy Birthday, William!",
    "The game's a bit daft and glib but the unlike the music industry, this pays out!",
    "Enter your phone number to verify it's you and unlock achievements to earn the cash prizes!",
];

const styles = css`
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    img { width: 56px; height: 56px; border-radius: 100em; flex: none; }
    .body p { margin: 0 0 0.6rem; line-height: 1.5; }
    .body p:last-child { margin-bottom: 0; }
    .sig { color: var(--muted); font-style: italic; }
`;

export default {
    name: 'AndrewNote',
    data: () => ({ lines }),
    template: `
        <div class="${styles}">
            <img src="https://secure.gravatar.com/avatar/d77441592e91fb2c571a0b9bba5e25da?size=120" alt="Andrew" />
            <div class="body">
                <p v-for="(line, i) in lines" :key="i">{{ line }}</p>
                <p class="sig">— Andrew</p>
            </div>
        </div>`,
};
