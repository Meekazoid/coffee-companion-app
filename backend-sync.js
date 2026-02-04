// ==========================================
// BREWBUDDY BACKEND SYNC MODULE V3
// Mit Token-System + Fehlertoleranz
// ==========================================

const BACKEND_CONFIG = {
    url: 'https://brew-buddy-backend-production.up.railway.app',
    syncEnabled: true,
    offlineFirst: true
};

function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || 'unknown'
        ].join('|');
        
        deviceId = 'device-' + btoa(fingerprint).substring(0, 32).replace(/[^a-zA-Z0-9]/g, '');
        localStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
}

async function validateAndSaveToken(token) {
    try {
        const deviceId = getOrCreateDeviceId();
        
        const response = await fetch(`${BACKEND_CONFIG.url}/api/auth/validate?token=${token}&deviceId=${deviceId}`);
        
        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.error || 'Token validation failed' };
        }
        
        const data = await response.json();
        
        if (data.valid) {
            localStorage.setItem('token', token);
            localStorage.setItem('deviceId', deviceId);
            console.log('✅ Token valid and saved');
            return { success: true, user: data.user };
        } else {
            return { success: false, error: data.error || 'Invalid token' };
        }
    } catch (error) {
        console.error('Token validation error:', error);
        return { success: false, error: 'Could not reach server. Check your internet connection.' };
    }
}

async function checkUserStatus() {
    const token = localStorage.getItem('token');
    const deviceId = localStorage.getItem('deviceId');
    
    if (!token || !deviceId) {
        return { hasToken: false, valid: false };
    }
    
    try {
        const response = await fetch(`${BACKEND_CONFIG.url}/api/auth/validate?token=${token}&deviceId=${deviceId}`);
        const data = await response.json();
        
        return {
            hasToken: true,
            valid: data.valid || false,
            user: data.user
        };
    } catch (error) {
        console.warn('Could not check token status:', error);
        return { hasToken: true, valid: false, error: error.message };
    }
}

async function syncCoffeesToBackend(coffees) {
    if (!BACKEND_CONFIG.syncEnabled) return;
    if (!navigator.onLine) {
        console.log('⏸️ Offline - Sync pausiert');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const deviceId = localStorage.getItem('deviceId');
        
        if (!token || !deviceId) {
            console.warn('⚠️ Kein Token - Backend-Sync deaktiviert');
            return;
        }
        
        const response = await fetch(`${BACKEND_CONFIG.url}/api/coffees`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, deviceId, coffees })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Sync erfolgreich:', data.saved, 'coffees');
            localStorage.setItem('lastSync', new Date().toISOString());
        } else {
            console.error('❌ Sync fehlgeschlagen:', data.error);
        }
    } catch (err) {
        console.error('❌ Sync Fehler:', err.message);
    }
}

async function loadCoffeesFromBackend() {
    if (!BACKEND_CONFIG.syncEnabled) return null;
    if (!navigator.onLine) {
        console.log('⏸️ Offline - Lade aus localStorage');
        return null;
    }
    
    try {
        const token = localStorage.getItem('token');
        const deviceId = localStorage.getItem('deviceId');
        
        if (!token || !deviceId) {
            console.log('⚠️ Kein Token - kein Backend-Load möglich');
            return null;
        }
        
        const response = await fetch(
            `${BACKEND_CONFIG.url}/api/coffees?token=${token}&deviceId=${deviceId}`
        );
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Coffees vom Backend geladen:', data.coffees.length);
            return data.coffees;
        } else {
            console.error('❌ Backend-Load fehlgeschlagen:', data.error);
            return null;
        }
    } catch (err) {
        console.error('❌ Backend-Load Fehler:', err.message);
        return null;
    }
}

function mergeCoffees(localCoffees, backendCoffees) {
    if (!backendCoffees || backendCoffees.length === 0) {
        return localCoffees;
    }
    
    if (!localCoffees || localCoffees.length === 0) {
        return backendCoffees;
    }
    
    const merged = [...backendCoffees];
    
    localCoffees.forEach(local => {
        const existsInBackend = backendCoffees.some(
            backend => backend.name === local.name && 
                       backend.addedDate === local.addedDate
        );
        
        if (!existsInBackend) {
            merged.push(local);
        }
    });
    
    return merged;
}

async function initBackendSync() {
    console.log('🔄 Initialisiere Backend-Sync...');
    
    try {
        const status = await checkUserStatus();
        
        if (!status.hasToken) {
            console.log('⚠️ Kein Token vorhanden - Aktivierung erforderlich');
            BACKEND_CONFIG.syncEnabled = false;
            return;
        }
        
        if (!status.valid) {
            console.warn('⚠️ Token ungültig - Backend-Sync pausiert bis zur Aktivierung');
            BACKEND_CONFIG.syncEnabled = false;
            return;
        }
        
        const backendCoffees = await loadCoffeesFromBackend();
        const localCoffees = JSON.parse(localStorage.getItem('coffees') || '[]');
        const mergedCoffees = mergeCoffees(localCoffees, backendCoffees);
        
        localStorage.setItem('coffees', JSON.stringify(mergedCoffees));
        
        if (typeof coffees !== 'undefined') {
            coffees.length = 0;
            coffees.push(...mergedCoffees);
        }
        
        if (mergedCoffees.length > 0) {
            await syncCoffeesToBackend(mergedCoffees);
        }
        
        if (typeof renderCoffees === 'function') {
            renderCoffees();
        }
        
        console.log('✅ Backend-Sync initialisiert');
        
    } catch (error) {
        console.error('❌ Backend-Sync Init Fehler:', error);
        BACKEND_CONFIG.syncEnabled = false;
        console.log('⚠️ Backend-Sync deaktiviert - App läuft im Offline-Modus');
    }
}

if (typeof window !== 'undefined') {
    const originalSaveCoffeeManual = window.saveCoffeeManual;
    if (originalSaveCoffeeManual) {
        window.saveCoffeeManual = async function() {
            originalSaveCoffeeManual();
            if (BACKEND_CONFIG.syncEnabled) {
                await syncCoffeesToBackend(coffees);
            }
        };
    }
}

window.addEventListener('online', async () => {
    console.log('🌐 Verbindung wieder hergestellt');
    if (BACKEND_CONFIG.syncEnabled) {
        const localCoffees = JSON.parse(localStorage.getItem('coffees') || '[]');
        await syncCoffeesToBackend(localCoffees);
    }
});

window.addEventListener('offline', () => {
    console.log('📴 Offline-Modus');
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initBackendSync().catch(err => {
            console.error('Backend-Sync Init Error:', err);
            console.log('⚠️ App läuft im Offline-Modus');
        });
    });
} else {
    initBackendSync().catch(err => {
        console.error('Backend-Sync Init Error:', err);
        console.log('⚠️ App läuft im Offline-Modus');
    });
}

console.log('📦 Backend-Sync Modul geladen');

if (typeof window !== 'undefined') {
    window.validateAndSaveToken = validateAndSaveToken;
    window.checkUserStatus = checkUserStatus;
    window.initBackendSync = initBackendSync;
    window.BACKEND_CONFIG = BACKEND_CONFIG;
}
