// ==========================================
// SERVICE WORKER REGISTRATION
// Registers /sw.js for offline PWA support.
// ==========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration.scope);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            console.log('New Service Worker activated - refresh for updates');
                        }
                    });
                });
            })
            .catch(error => {
                console.warn('Service Worker registration failed:', error);
            });
    });
}