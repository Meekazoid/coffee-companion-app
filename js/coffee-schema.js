// ==========================================
// CANONICAL COFFEE SCHEMA
// Defines the single source of truth for coffee data fields
// ==========================================

export const PROCESS_LABELS = {
    '': '– optional –',
    'washed': 'Washed',
    'natural': 'Natural',
    'honey': 'Honey',
    'anaerobic natural': 'Anaerobic Natural',
    'anaerobic washed': 'Anaerobic Washed',
    'carbonic maceration': 'Carbonic Maceration',
    'yeast inoculated natural': 'Yeast Inoculated Natural',
    'nitro washed': 'Nitro Washed',
    'extended fermentation': 'Extended Fermentation'
};

/**
 * Wandelt alte/beliebige Kaffee-Objekte in das strikte kanonische Schema um.
 * Entfernt alte Aliase wie 'coffee_name' oder 'tasting_notes' restlos.
 */
export function enforceCanonicalSchema(coffee) {
    if (!coffee || typeof coffee !== 'object') return {};

    // 1. Alle kanonischen Kern-Felder explizit zuweisen (inkl. Fallbacks/Aliase)
    const name = coffee.name || coffee.coffee_name || 'Unknown';
    const origin = coffee.origin || ''; 
    const process = coffee.process || ''; 
    const altitude = coffee.altitude || ''; 
    const roastery = coffee.roastery || coffee.roaster || '';
    const cultivar = coffee.cultivar || coffee.variety || 'Unknown';
    const tastingNotes = coffee.tastingNotes || coffee.tasting_notes || 'No notes';
    const colorTag = coffee.colorTag || coffee.color_tag || '';

    // 2. Kanonisches Objekt bauen (...coffee behält System-Felder wie id, feedbackHistory, roastDate etc.)
    const canonical = {
        ...coffee,
        name,
        origin,
        process,
        altitude,
        roastery,
        cultivar,
        tastingNotes,
        colorTag
    };

    // 3. Alte Schlüssel restlos löschen, damit sie nie wieder im State auftauchen
    delete canonical.coffee_name;
    delete canonical.roaster;
    delete canonical.variety;
    delete canonical.tasting_notes;
    delete canonical.color_tag;

    return canonical;
}
