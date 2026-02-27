const flashTimers = new WeakMap();

export function flashClass(element, className = 'btn-pressed', duration = 300) {
    if (!element) return;

    const existing = flashTimers.get(element);
    if (existing) {
        clearTimeout(existing);
    }

    element.classList.add(className);

    const timer = setTimeout(() => {
        element.classList.remove(className);
        flashTimers.delete(element);
    }, duration);

    flashTimers.set(element, timer);
}
