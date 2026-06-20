export { createApp, ref, reactive, shallowReactive, h, watchEffect, watch, computed, nextTick, markRaw, onMounted, onUnmounted } from 'https://unpkg.com/vue@3.3.4/dist/vue.esm-browser.js'
import { watchEffect } from 'https://unpkg.com/vue@3.3.4/dist/vue.esm-browser.js';

/**
 * A ref whose value is mirrored to web storage. Loads any saved value on
 * creation, then writes back on every change. `permanently` chooses
 * localStorage (survives sessions) over sessionStorage.
 * @type {(ref: import('vue').Ref<any>, persistKey: string, permanently?: boolean) => void}
 */
export const persistRef = (ref, persistKey, permanently = false) => {
    const storage = permanently ? window.localStorage : window.sessionStorage;
    if (persistKey in storage) {
        try {
            ref.value = JSON.parse(storage.getItem(persistKey));
        } catch {
            // Corrupt entry — ignore and keep the default.
        }
    }
    watchEffect(() => storage.setItem(persistKey, JSON.stringify(ref.value)));
}
