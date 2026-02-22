// ==========================================
// SETTINGS & DEVICE ACTIVATION
// Settings panel, activation code, decaf modal
// ==========================================

import { CONFIG } from './config.js';
import { coffees, sanitizeHTML } from './state.js';

export function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
    const token = localStorage.getItem('token');
    const statusDiv = document.getElementById('activationStatus');

    if (token) {
        statusDiv.style.display = 'block';
        statusDiv.style.background = 'rgba(40, 167, 69, 0.1)';
        statusDiv.style.border = '1px solid rgba(40, 167, 69, 0.3)';
        statusDiv.style.color = '#5fda7d';
        statusDiv.innerHTML = '✅ Device already activated';
    } else {
        statusDiv.style.display = 'none';
    }
}

export function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

function showActivationError(message) {
    const statusDiv = document.getElementById('activationStatus');
    statusDiv.style.display = 'block';
    statusDiv.style.background = 'rgba(220, 53, 69, 0.1)';
    statusDiv.style.border = '1px solid rgba(220, 53, 69, 0.3)';
    statusDiv.style.color = '#ff6b7a';
    statusDiv.innerHTML = '❌ ' + sanitizeHTML(message);
}

export async function activateDevice() {
    const accessCode = document.getElementById('accessCodeInput').value.trim();
    const statusDiv = document.getElementById('activationStatus');

    if (!accessCode) { showActivationError('Please enter an access code'); return; }

    const getOrCreateDeviceId = () => {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            const fingerprint = [
                navigator.userAgent, navigator.language,
                screen.width + 'x' + screen.height,
                new Date().getTimezoneOffset(),
                navigator.hardwareConcurrency || 'unknown'
            ].join('|');
            deviceId = 'device-' + btoa(fingerprint).substring(0, 32).replace(/[^a-zA-Z0-9]/g, '');
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    };

    try {
        const deviceId = getOrCreateDeviceId();
        const response = await fetch(`${CONFIG.backendUrl}/api/auth/validate`, {
            headers: {
                'Authorization': `Bearer ${accessCode}`,
                'X-Device-ID': deviceId
            }
        });

        if (!response.ok) {
            const error = await response.json();
            showActivationError(error.error || 'Token validation failed');
            return;
        }

        const data = await response.json();

        if (data.valid) {
            localStorage.setItem('token', accessCode);
            localStorage.setItem('deviceId', deviceId);

            statusDiv.style.display = 'block';
            statusDiv.style.background = 'rgba(40, 167, 69, 0.1)';
            statusDiv.style.border = '1px solid rgba(40, 167, 69, 0.3)';
            statusDiv.style.color = '#5fda7d';
            statusDiv.innerHTML = '✅ Success! Device linked.<br>You can now use all features.';

            if (typeof initBackendSync === 'function') await initBackendSync();
            setTimeout(() => { closeSettings(); location.reload(); }, 2000);
        } else {
            showActivationError(data.error || 'Invalid access code');
        }
    } catch (error) {
        showActivationError(error.message || 'Activation failed');
    }
}

export function openDecafModal() {
    renderDecafList();
    document.getElementById('decafModal').classList.add('active');
}

export function closeDecafModal() {
    document.getElementById('decafModal').classList.remove('active');
}

export function renderDecafList() {
    const decafListEl = document.getElementById('decafList');
    const decafEmptyEl = document.getElementById('decafEmpty');

    const deletedCoffees = coffees
        .map((coffee, index) => ({ coffee, index }))
        .filter(item => item.coffee.deleted === true);

    if (deletedCoffees.length === 0) {
        decafListEl.innerHTML = '';
        decafEmptyEl.style.display = 'block';
        return;
    }

    decafEmptyEl.style.display = 'none';

    const sorted = deletedCoffees.sort((a, b) => {
        return new Date(b.coffee.deletedAt || 0).getTime() - new Date(a.coffee.deletedAt || 0).getTime();
    });

    decafListEl.innerHTML = sorted.map(item => `
        <div class="decaf-card">
            <div class="decaf-card-info">
                <div class="decaf-card-name">${sanitizeHTML(item.coffee.name)}</div>
                <div class="decaf-card-origin">${sanitizeHTML(item.coffee.origin)}</div>
            </div>
            <div class="decaf-card-actions">
                <button class="restore-btn" onclick="restoreCoffee(${item.index})">Restore</button>
                <button class="permanent-delete-btn" onclick="permanentDeleteCoffee(${item.index})">Delete</button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// MAGIC LINK – Auto-login from URL token
// Call this once on app start from app.js:
//   import { handleMagicLink } from './settings.js';
//   handleMagicLink();
// ==========================================

export async function handleMagicLink() {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get('token');
    if (!token) return;

    // Clean URL immediately
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);

    // Already logged in with same token → skip
    if (localStorage.getItem('token') === token) return;

    try {
        const getOrCreateDeviceId = () => {
            let deviceId = localStorage.getItem('deviceId');
            if (!deviceId) {
                const fingerprint = [
                    navigator.userAgent, navigator.language,
                    screen.width + 'x' + screen.height,
                    new Date().getTimezoneOffset(),
                    navigator.hardwareConcurrency || 'unknown'
                ].join('|');
                deviceId = 'device-' + btoa(fingerprint).substring(0, 32).replace(/[^a-zA-Z0-9]/g, '');
                localStorage.setItem('deviceId', deviceId);
            }
            return deviceId;
        };

        const deviceId = getOrCreateDeviceId();

        const response = await fetch(`${CONFIG.backendUrl}/api/auth/validate`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Device-ID': deviceId
            }
        });

        const data = await response.json();

        if (data.valid) {
            localStorage.setItem('token', token);
            localStorage.setItem('deviceId', deviceId);

            // Show activation popup
            showActivationPopup();

            if (typeof initBackendSync === 'function') await initBackendSync();
        }
    } catch (err) {
        console.error('Magic link error:', err.message);
    }
}

function showActivationPopup() {
    // Remove existing popup if any
    const existing = document.getElementById('activation-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'activation-popup';
    popup.style.cssText = `
        position: fixed;
        bottom: 32px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        padding: 20px 24px;
        max-width: 340px;
        width: calc(100% - 48px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        z-index: 9999;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        font-family: 'Sora', sans-serif;
    `;

    popup.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:14px;">
            <div style="font-size:1.6rem;flex-shrink:0;">☕</div>
            <div>
                <p style="margin:0 0 6px;font-size:0.85rem;font-weight:600;color:#1a1a1a;letter-spacing:0.02em;">
                    drip·mate activated!
                </p>
                <p style="margin:0;font-size:0.78rem;color:#666666;line-height:1.6;font-weight:300;">
                    You can now add your first Coffee Card and start your experience with drip·mate.
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            popup.style.opacity = '1';
            popup.style.transform = 'translateX(-50%) translateY(0)';
        });
    });

    // Animate out after 5 seconds
    setTimeout(() => {
        popup.style.opacity = '0';
        popup.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => popup.remove(), 400);
    }, 5000);
}
