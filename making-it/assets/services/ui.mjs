import { ref } from '../deps/vue.mjs';

// Which dashboard pane is showing. Not persisted — always boot on the dashboard.
export const view = ref('dashboard');
export const goTo = (v) => { view.value = v; };

// Whether the "sell your back catalogue" confirmation is open.
export const saleModalOpen = ref(false);
export const openSaleModal = () => { saleModalOpen.value = true; };
export const closeSaleModal = () => { saleModalOpen.value = false; };
