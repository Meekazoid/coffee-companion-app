// ==========================================
// FEEDBACK SYSTEM
// Cupping-inspired sensory feedback and parameter suggestions
// ==========================================

import { coffees, saveCoffeesAndSync, sanitizeHTML } from './state.js';
import { getBrewRecommendations } from './brew-engine.js';
import { flashClass } from './ui-flash.js';

const suggestionHideTimers = new Map();

function showResetAdjustmentsConfirmModal() {
    const modal = document.getElementById('resetAdjustmentsConfirmModal');
    const confirmBtn = document.getElementById('confirmResetAdjustmentsConfirmBtn');
    const cancelBtn = document.getElementById('cancelResetAdjustmentsConfirmBtn');
    const closeBtn = document.getElementById('closeResetAdjustmentsConfirmBtn');

    if (!modal || !confirmBtn || !cancelBtn || !closeBtn) {
        return Promise.resolve(confirm("Reset this coffee's tuning?"));
    }

    modal.classList.add('active');

    return new Promise(resolve => {
        let resolved = false;

        const cleanup = (result) => {
            if (resolved) return;
            resolved = true;
            modal.classList.remove('active');
            confirmBtn.removeEventListener('click', onConfirm);
            cancelBtn.removeEventListener('click', onCancel);
            closeBtn.removeEventListener('click', onCancel);
            modal.removeEventListener('click', onBackdrop);
            resolve(result);
        };

        const onConfirm = () => cleanup(true);
        const onCancel = () => cleanup(false);
        const onBackdrop = (e) => {
            if (e.target === modal) onCancel();
        };

        confirmBtn.addEventListener('click', onConfirm);
        cancelBtn.addEventListener('click', onCancel);
        closeBtn.addEventListener('click', onCancel);
        modal.addEventListener('click', onBackdrop);
    });
}


function clearSuggestionHideTimer(index) {
    const existing = suggestionHideTimers.get(index);
    if (existing) {
        clearTimeout(existing);
        suggestionHideTimers.delete(index);
    }
}

function sliderValueToFeedback(value) {
    const numeric = Number(value);
    if (numeric <= 33) return 'low';
    if (numeric >= 67) return 'high';
    return 'balanced';
}

function feedbackToSliderValue(value) {
    if (value === 'low') return '0';
    if (value === 'high') return '100';
    return '50';
}


function getClientXFromEvent(event) {
    if (typeof event.clientX === 'number') return event.clientX;
    const touch = event.touches && event.touches[0];
    return touch ? touch.clientX : null;
}

function isPointerNearThumb(sliderEl, clientX) {
    if (!sliderEl || clientX == null) return false;

    const rect = sliderEl.getBoundingClientRect();
    if (!rect.width) return false;

    const min = Number(sliderEl.min || 0);
    const max = Number(sliderEl.max || 100);
    const value = Number(sliderEl.value || 0);
    const ratio = max === min ? 0.5 : (value - min) / (max - min);
    const thumbCenter = rect.left + (rect.width * ratio);
    const allowedDistance = 16;

    return Math.abs(clientX - thumbCenter) <= allowedDistance;
}

export function initFeedbackSliderIntentGuards(root = document) {
    const sliders = root.querySelectorAll('.feedback-slider');

    sliders.forEach((sliderEl) => {
        if (sliderEl.dataset.intentGuardBound === '1') return;
        sliderEl.dataset.intentGuardBound = '1';

        sliderEl.style.touchAction = 'pan-y';

        const guard = (event) => {
            const clientX = getClientXFromEvent(event);
            if (!isPointerNearThumb(sliderEl, clientX)) {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        sliderEl.addEventListener('pointerdown', guard, { passive: false });
        sliderEl.addEventListener('mousedown', guard);
        sliderEl.addEventListener('touchstart', guard, { passive: false });
    });
}

export function updateFeedbackSlider(index, category, sliderValue) {
    const value = sliderValueToFeedback(sliderValue);
    selectFeedback(index, category, value, false);
}

export function snapFeedbackSlider(index, category, sliderEl) {
    if (!sliderEl) return;
    const snappedValue = feedbackToSliderValue(sliderValueToFeedback(sliderEl.value));
    sliderEl.value = snappedValue;
    updateFeedbackSlider(index, category, snappedValue);
}


export function selectFeedback(index, category, value, syncSlider = true) {
    const coffee = coffees[index];
    if (!coffee.feedback) coffee.feedback = {};

    const previousValue = coffee.feedback[category];
    coffee.feedback[category] = value;

    document.querySelectorAll(`[data-feedback="${index}-${category}"]`).forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.value === value);
    });

    const sliderEl = document.querySelector(`[data-feedback-slider="${index}-${category}"]`);
    if (sliderEl && syncSlider) sliderEl.value = feedbackToSliderValue(value);

    if (previousValue === value) return;

    generateSuggestion(index);
    localStorage.setItem('coffees', JSON.stringify(coffees));
}

function hasAnyCuppingInput(feedback) {
    return ['bitterness', 'sweetness', 'acidity', 'body'].some(key => Boolean(feedback[key]));
}

function generateSuggestion(index) {
    const coffee = coffees[index];
    const feedback = coffee.feedback || {};
    const suggestionDiv = document.getElementById(`suggestion-${index}`);
    if (!suggestionDiv) return;

    clearSuggestionHideTimer(index);

    let suggestions = [];
    let grindOffsetDelta = 0;
    let tempDelta = 0;
    let newTemp = null;

    if (!hasAnyCuppingInput(feedback)) {
        suggestionDiv.innerHTML = '';
        suggestionDiv.classList.add('hidden');
        return;
    }

    // Cupping-inspired mappings (low / balanced / high)
    const hasBitterHigh = feedback.bitterness === 'high';
    const hasSweetLow = feedback.sweetness === 'low';
    const hasAcidityHigh = feedback.acidity === 'high';
    const hasAcidityLow = feedback.acidity === 'low';

    if (hasBitterHigh) {
        suggestions.push('Bitterness is high', '→ Grind coarser', '→ Lower temperature by 2°C');
        grindOffsetDelta += +5;
        tempDelta -= 2;
    } else if (hasSweetLow && !hasBitterHigh) {
        suggestions.push('Sweetness is low', '→ Grind finer', '→ Raise temperature by 1°C');
        grindOffsetDelta += -3;
        tempDelta += 1;
    }

    if (hasAcidityHigh) {
        suggestions.push('Acidity is high', '→ Grind finer', '→ Raise temperature by 2°C');
        grindOffsetDelta += -4;
        tempDelta += 2;
    } else if (hasAcidityLow) {
        suggestions.push('Acidity is low', '→ Grind coarser', '→ Lower temperature by 1°C');
        grindOffsetDelta += +3;
        tempDelta -= 1;
    }

    if (suggestions.length === 0) {
        suggestionDiv.innerHTML = '';
        suggestionDiv.classList.add('hidden');
        return;
    }

    const cappedGrindDelta = Math.max(-10, Math.min(10, grindOffsetDelta));

    const currentParams = getBrewRecommendations(coffee);
    const previewCoffee = { ...coffee, grindOffset: (coffee.grindOffset || 0) + cappedGrindDelta };
    const previewParams = getBrewRecommendations(previewCoffee);
    const previewGrind = previewParams.grindSetting;

    if (tempDelta !== 0) {
        newTemp = adjustTemp(currentParams.temperature, tempDelta);
    }

    suggestionDiv.innerHTML = `
        <div class="suggestion-header">Suggested Adjustments</div>
        <div class="suggestion-reasons">
            ${suggestions.map(s => `<div class="suggestion-reason">${s}</div>`).join('')}
        </div>
        <div class="suggestion-preview">
            ${previewGrind ? `<div class="suggestion-value"><strong>New Grind:</strong> ${previewGrind}</div>` : ''}
            ${newTemp ? `<div class="suggestion-value"><strong>New Temp:</strong> ${newTemp}</div>` : ''}
        </div>
        <button class="apply-suggestion-btn" onclick="applySuggestion(${index}, ${cappedGrindDelta}, '${newTemp}')">
            Apply These Settings
        </button>
    `;
    suggestionDiv.classList.remove('hidden');
}

function getDefaultTemp(processType) {
    const tempCoffee = { process: processType, altitude: '1500', cultivar: 'Unknown', origin: 'Unknown' };
    return getBrewRecommendations(tempCoffee).temperature;
}

function adjustTemp(current, change) {
    const match = current.match(/(\d+)(?:-(\d+))?/);
    if (!match) return current;
    const low = parseInt(match[1]) + change;
    const high = match[2] ? parseInt(match[2]) + change : null;
    return high ? `${low}-${high}°C` : `${low}°C`;
}

export async function applySuggestion(index, grindOffsetDelta, newTemp) {
    // Import dynamically to avoid circular dependency
    const { renderCoffees } = await import('./coffee-list.js');
    
    const coffee = coffees[index];
    const before = getBrewRecommendations(coffee);

    if (grindOffsetDelta && grindOffsetDelta !== 0) {
        coffee.grindOffset = (coffee.grindOffset || 0) + grindOffsetDelta;
    }
    if (newTemp && newTemp !== 'null') coffee.customTemp = newTemp;

    const after = getBrewRecommendations(coffee);
    addHistoryEntry(coffee, {
        timestamp: new Date().toISOString(),
        previousGrind: before.grindSetting,
        previousTemp: before.temperature,
        newGrind: after.grindSetting,
        newTemp: after.temperature,
        grindOffsetDelta: grindOffsetDelta || 0,
        customTempApplied: newTemp && newTemp !== 'null' ? newTemp : null
    });

    coffee.feedback = {};
    saveCoffeesAndSync();
    renderCoffees(index);
}

function addHistoryEntry(coffee, entry) {
    if (!coffee.feedbackHistory) coffee.feedbackHistory = [];
    coffee.feedbackHistory.unshift(entry);
    if (coffee.feedbackHistory.length > 30) {
        coffee.feedbackHistory = coffee.feedbackHistory.slice(0, 30);
    }
}

function formatHistoryDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleString();
}

function formatHistoryDelta(entry) {
    if (entry.resetToInitial) {
        return 'Reset to engine baseline values';
    }

    if (entry.manualAdjust === 'grind') {
        const sign = (entry.grindOffsetDelta || 0) > 0 ? '+' : '';
        return `Manual grind adjust ${sign}${entry.grindOffsetDelta || 0}`;
    }

    if (entry.manualAdjust === 'temp') {
        return `Manual temperature adjust ${entry.customTempApplied || ''}`.trim();
    }

    const parts = [];
    if (entry.grindOffsetDelta) {
        const sign = entry.grindOffsetDelta > 0 ? '+' : '';
        parts.push(`Grind offset ${sign}${entry.grindOffsetDelta}`);
    }
    if (entry.customTempApplied) {
        parts.push(`Temp override ${entry.customTempApplied}`);
    }
    if (parts.length === 0) return 'No direct offset change';
    return parts.join(' · ');
}

export function openFeedbackHistory(index) {
    const modal = document.getElementById('feedbackHistoryModal');
    const titleEl = document.getElementById('feedbackHistoryTitle');
    const listEl = document.getElementById('feedbackHistoryList');
    const emptyEl = document.getElementById('feedbackHistoryEmpty');
    const coffee = coffees[index];

    if (!modal || !titleEl || !listEl || !emptyEl || !coffee) return;

    titleEl.textContent = `Adjustment History · ${coffee.name || 'Coffee'}`;

    const history = Array.isArray(coffee.feedbackHistory) ? coffee.feedbackHistory : [];
    if (history.length === 0) {
        listEl.innerHTML = '';
        emptyEl.style.display = 'block';
    } else {
        emptyEl.style.display = 'none';
        listEl.innerHTML = history.map(entry => `
            <div class="history-item">
                <div class="history-item-top">
                    <strong>${sanitizeHTML(formatHistoryDate(entry.timestamp))}</strong>
                    <span>${sanitizeHTML(formatHistoryDelta(entry))}</span>
                </div>
                <div class="history-item-grid">
                    <div><span>Grind</span><strong>${sanitizeHTML(entry.previousGrind)} → ${sanitizeHTML(entry.newGrind)}</strong></div>
                    <div><span>Temp</span><strong>${sanitizeHTML(entry.previousTemp)} → ${sanitizeHTML(entry.newTemp)}</strong></div>
                </div>
            </div>
        `).join('');
    }

    modal.classList.add('active');
}

export function closeFeedbackHistory() {
    const modal = document.getElementById('feedbackHistoryModal');
    if (modal) modal.classList.remove('active');
}

// Manual adjustment functions
export function adjustGrindManual(index, direction) {
    // Flash the pressed button (+/-)
    // The button that was just clicked is the active element at call time
    const activeBtn = document.activeElement;
    if (activeBtn && activeBtn.classList.contains('adjust-btn')) {
        flashClass(activeBtn);
    }

    const coffee = coffees[index];
    const before = getBrewRecommendations(coffee);
    coffee.grindOffset = (coffee.grindOffset || 0) + direction;

    const after = getBrewRecommendations(coffee);
    addHistoryEntry(coffee, {
        timestamp: new Date().toISOString(),
        previousGrind: before.grindSetting,
        previousTemp: before.temperature,
        newGrind: after.grindSetting,
        newTemp: after.temperature,
        grindOffsetDelta: direction,
        customTempApplied: null,
        manualAdjust: 'grind'
    });

    const el = document.getElementById(`grind-value-${index}`);
    if (el) el.textContent = after.grindSetting;
    saveCoffeesAndSync();
}

export function adjustTempManual(index, direction) {
    // Flash the pressed button (+/-)
    const activeBtn = document.activeElement;
    if (activeBtn && activeBtn.classList.contains('adjust-btn')) {
        flashClass(activeBtn);
    }

    const coffee = coffees[index];
    const before = getBrewRecommendations(coffee);
    const currentTemp = coffee.customTemp || getBrewRecommendations(coffee).temperature;

    const match = currentTemp.match(/(\d+)(?:-(\d+))?/);
    if (!match) return;

    const low = parseInt(match[1]) + direction;
    const high = match[2] ? parseInt(match[2]) + direction : null;
    coffee.customTemp = high ? `${low}-${high}°C` : `${low}°C`;

    const after = getBrewRecommendations(coffee);
    addHistoryEntry(coffee, {
        timestamp: new Date().toISOString(),
        previousGrind: before.grindSetting,
        previousTemp: before.temperature,
        newGrind: after.grindSetting,
        newTemp: after.temperature,
        grindOffsetDelta: 0,
        customTempApplied: coffee.customTemp,
        manualAdjust: 'temp'
    });

    const el = document.getElementById(`temp-value-${index}`);
    if (el) el.textContent = coffee.customTemp;
    saveCoffeesAndSync();
}

export async function resetCoffeeAdjustments(index) {
    const confirmed = await showResetAdjustmentsConfirmModal();
    if (!confirmed) return;

    const coffee = coffees[index];
    const before = getBrewRecommendations(coffee);

    const initial = getInitialBrewValues(coffee);

    coffee.initialGrind = initial.grind;
    coffee.initialTemp = initial.temp;

    delete coffee.customGrind;
    delete coffee.grindOffset;
    delete coffee.customTemp;
    delete coffee.feedback;

    const after = getBrewRecommendations(coffee);
    addHistoryEntry(coffee, {
        timestamp: new Date().toISOString(),
        previousGrind: before.grindSetting,
        previousTemp: before.temperature,
        newGrind: after.grindSetting,
        newTemp: after.temperature,
        grindOffsetDelta: 0,
        customTempApplied: null,
        resetToInitial: true
    });

    const grindEl = document.getElementById(`grind-value-${index}`);
    const tempEl = document.getElementById(`temp-value-${index}`);
    if (grindEl) grindEl.textContent = initial.grind;
    if (tempEl) tempEl.textContent = initial.temp;

    document.querySelectorAll(`[data-feedback^="${index}-"]`).forEach(opt => {
        opt.classList.remove('selected');
    });

    const suggestionEl = document.getElementById(`suggestion-${index}`);
    if (suggestionEl) {
        suggestionEl.innerHTML = '';
        suggestionEl.classList.add('hidden');
    }

    saveCoffeesAndSync();
}

export function getInitialBrewValues(coffee) {
    const clone = { ...coffee };
    delete clone.customGrind;
    delete clone.grindOffset;
    delete clone.customTemp;
    const rec = getBrewRecommendations(clone);
    return { grind: rec.grindSetting, temp: rec.temperature };
}

export function ensureInitialValues(coffee) {
    if (!coffee.initialGrind || !coffee.initialTemp) {
        const initial = getInitialBrewValues(coffee);
        coffee.initialGrind = initial.grind;
        coffee.initialTemp = initial.temp;
    }
}

export function migrateCoffeesInitialValues() {
    let changed = false;
    coffees.forEach(coffee => {
        if (!coffee.initialGrind || !coffee.initialTemp) {
            ensureInitialValues(coffee);
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('coffees', JSON.stringify(coffees));
    }
}

// Register functions on window for onclick handlers
window.selectFeedback = selectFeedback;
window.updateFeedbackSlider = updateFeedbackSlider;
window.snapFeedbackSlider = snapFeedbackSlider;
window.applySuggestion = applySuggestion;
window.adjustGrindManual = adjustGrindManual;
window.adjustTempManual = adjustTempManual;
window.resetCoffeeAdjustments = resetCoffeeAdjustments;
window.openFeedbackHistory = openFeedbackHistory;
window.closeFeedbackHistory = closeFeedbackHistory;
