import { createApp } from './deps/vue.mjs';
import App from './components/App.mjs';
import { startGame } from './game/engine.mjs';

const root = document.getElementById('root');
root.innerHTML = '';
const app = createApp(App);
app.mount(root);

startGame();

// PWA: register the service worker scoped to this folder (so the game can move
// hosts/subdomains without clashing with the rest of the site).
if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
}
