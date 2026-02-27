// ==========================================
// UI FLASH UTILITY
// Adds a CSS class to a button briefly, then removes it.
// Used for: Upload/Manual, adjust +/-, Pause, Reset, edit-confirmed.
// ==========================================

/**
 * Flash a CSS class on an element for `duration` ms, then remove it.
 * @param {HTMLElement} el        - Target element
 * @param {string}      cls       - CSS class to add (default: 'btn-pressed')
 * @param {number}      duration  - How long to hold the class in ms (default: 420)
 */
export function flashClass(el, cls = 'btn-pressed', duration = 420) {
    if (!el) return;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), duration);
}
