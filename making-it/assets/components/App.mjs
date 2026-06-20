import { css } from '../deps/goober.mjs';
import { view } from '../services/ui.mjs';
import Logo from './Logo.mjs';
import BalanceBar from './BalanceBar.mjs';
import Sidebar from './Sidebar.mjs';
import DashboardView from './DashboardView.mjs';
import AchievementsView from './AchievementsView.mjs';
import PayoutView from './PayoutView.mjs';
import FirstCashModal from './FirstCashModal.mjs';
import RecordDealModal from './RecordDealModal.mjs';
import CatalogueSaleModal from './CatalogueSaleModal.mjs';
import MobileStatusBar from './MobileStatusBar.mjs';
import Toasts from './Toasts.mjs';

const styles = css`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    header.top {
        display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        padding: 0.8rem 1.1rem;
        border-bottom: 1px solid var(--border);
        background: #0c0c0e;
        flex-wrap: wrap;
    }
    .shell { flex: 1; display: grid; grid-template-columns: 220px 1fr; }
    @media (max-width: 860px) { .shell { grid-template-columns: 1fr; } }
    main { padding: 1.1rem; min-width: 0; }
`;

export default {
    name: 'App',
    components: { Logo, BalanceBar, Sidebar, DashboardView, AchievementsView, PayoutView, FirstCashModal, RecordDealModal, CatalogueSaleModal, MobileStatusBar, Toasts },
    data: () => ({ view, headerOut: false }),
    mounted() {
        // Reveal the mobile status bar once the header scrolls out of view.
        const el = this.$refs.topHeader;
        if (el && 'IntersectionObserver' in window) {
            this._io = new IntersectionObserver(
                ([entry]) => { this.headerOut = !entry.isIntersecting; },
                { threshold: 0 },
            );
            this._io.observe(el);
        }
    },
    beforeUnmount() {
        if (this._io) this._io.disconnect();
    },
    template: `
        <div class="${styles}">
            <MobileStatusBar v-show="headerOut" />
            <header class="top" ref="topHeader">
                <Logo />
                <BalanceBar />
            </header>
            <div class="shell">
                <Sidebar />
                <main>
                    <DashboardView v-if="view === 'dashboard'" />
                    <AchievementsView v-else-if="view === 'achievements'" />
                    <PayoutView v-else-if="view === 'payout'" />
                </main>
            </div>
            <FirstCashModal />
            <RecordDealModal />
            <CatalogueSaleModal />
            <Toasts />
        </div>`,
};
