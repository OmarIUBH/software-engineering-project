/**
 * Utility functions for unit conversion between Metric and Imperial systems.
 * Standardizes units to base metric internally (grams, ml) and converts for display.
 */

export const UNIT_TYPES = {
    WEIGHT: 'weight',
    VOLUME: 'volume',
    COUNT: 'count', // pcs, bunch, cloves, etc.
    UNKNOWN: 'unknown'
};

// Known units and their conversion to base (gram for weight, ml for volume)
const UNIT_DEFINITIONS = {
    // Weight (Base: g)
    'g': { type: UNIT_TYPES.WEIGHT, factor: 1, label: { metric: 'g', imperial: 'oz' } },
    'gram': { type: UNIT_TYPES.WEIGHT, factor: 1, label: { metric: 'g', imperial: 'oz' } },
    'grams': { type: UNIT_TYPES.WEIGHT, factor: 1, label: { metric: 'g', imperial: 'oz' } },
    'kg': { type: UNIT_TYPES.WEIGHT, factor: 1000, label: { metric: 'kg', imperial: 'lbs' } },
    'kilogram': { type: UNIT_TYPES.WEIGHT, factor: 1000, label: { metric: 'kg', imperial: 'lbs' } },
    'kilograms': { type: UNIT_TYPES.WEIGHT, factor: 1000, label: { metric: 'kg', imperial: 'lbs' } },
    'oz': { type: UNIT_TYPES.WEIGHT, factor: 28.3495, label: { metric: 'g', imperial: 'oz' } },
    'ounce': { type: UNIT_TYPES.WEIGHT, factor: 28.3495, label: { metric: 'g', imperial: 'oz' } },
    'ounces': { type: UNIT_TYPES.WEIGHT, factor: 28.3495, label: { metric: 'g', imperial: 'oz' } },
    'lb': { type: UNIT_TYPES.WEIGHT, factor: 453.592, label: { metric: 'kg', imperial: 'lb' } },
    'lbs': { type: UNIT_TYPES.WEIGHT, factor: 453.592, label: { metric: 'kg', imperial: 'lbs' } },
    'pound': { type: UNIT_TYPES.WEIGHT, factor: 453.592, label: { metric: 'kg', imperial: 'lbs' } },
    'pounds': { type: UNIT_TYPES.WEIGHT, factor: 453.592, label: { metric: 'kg', imperial: 'lbs' } },

    // Volume (Base: ml)
    'ml': { type: UNIT_TYPES.VOLUME, factor: 1, label: { metric: 'ml', imperial: 'fl oz' } },
    'milliliter': { type: UNIT_TYPES.VOLUME, factor: 1, label: { metric: 'ml', imperial: 'fl oz' } },
    'l': { type: UNIT_TYPES.VOLUME, factor: 1000, label: { metric: 'l', imperial: 'cups' } },
    'liter': { type: UNIT_TYPES.VOLUME, factor: 1000, label: { metric: 'l', imperial: 'cups' } },
    'liters': { type: UNIT_TYPES.VOLUME, factor: 1000, label: { metric: 'l', imperial: 'cups' } },
    'tsp': { type: UNIT_TYPES.VOLUME, factor: 4.92892, label: { metric: 'ml', imperial: 'tsp' } },
    'teaspoon': { type: UNIT_TYPES.VOLUME, factor: 4.92892, label: { metric: 'ml', imperial: 'tsp' } },
    'tbsp': { type: UNIT_TYPES.VOLUME, factor: 14.7868, label: { metric: 'ml', imperial: 'tbsp' } },
    'tablespoon': { type: UNIT_TYPES.VOLUME, factor: 14.7868, label: { metric: 'ml', imperial: 'tbsp' } },
    'cup': { type: UNIT_TYPES.VOLUME, factor: 240, label: { metric: 'ml', imperial: 'cup' } },
    'cups': { type: UNIT_TYPES.VOLUME, factor: 240, label: { metric: 'ml', imperial: 'cups' } },
    'fl oz': { type: UNIT_TYPES.VOLUME, factor: 29.5735, label: { metric: 'ml', imperial: 'fl oz' } },
    'pint': { type: UNIT_TYPES.VOLUME, factor: 473.176, label: { metric: 'ml', imperial: 'pint' } },
    'quart': { type: UNIT_TYPES.VOLUME, factor: 946.353, label: { metric: 'l', imperial: 'quart' } },
    'gallon': { type: UNIT_TYPES.VOLUME, factor: 3785.41, label: { metric: 'l', imperial: 'gallon' } }
};

/**
 * Normalizes a unit string to lowercase and removes trailing periods.
 */
function normalizeUnit(unit) {
    if (!unit) return '';
    return unit.toLowerCase().replace(/\.$/, '').trim();
}

/**
 * Gets the unit type and its base conversion factor.
 */
function getUnitInfo(unit) {
    const normalized = normalizeUnit(unit);
    return UNIT_DEFINITIONS[normalized] || { type: UNIT_TYPES.UNKNOWN, factor: 1 };
}

/**
 * Converts any known quantity/unit into the display format based on preferred system.
 * Returns { qty: number, unit: string }
 */
export function formatQuantityUnit(quantity, unit, system = 'metric') {
    if (!quantity || isNaN(quantity)) return { qty: quantity, unit };

    const info = getUnitInfo(unit);
    const numQty = Number(quantity);

    if (info.type === UNIT_TYPES.UNKNOWN || info.type === UNIT_TYPES.COUNT) {
        // Round to 2 decimals for simple display
        return { qty: Math.round(numQty * 100) / 100, unit };
    }

    // Convert to base unit (grams / ml)
    const baseValue = numQty * info.factor;

    let outQty = baseValue;
    let outUnit = unit;

    if (system === 'imperial') {
        if (info.type === UNIT_TYPES.WEIGHT) {
            // Display as lbs if >= 1 lb (453.592g), else oz
            if (baseValue >= 453.592) {
                outQty = baseValue / 453.592;
                outUnit = outQty <= 1.05 ? 'lb' : 'lbs';
            } else {
                outQty = baseValue / 28.3495;
                outUnit = 'oz';
            }
        } else if (info.type === UNIT_TYPES.VOLUME) {
            if (baseValue >= 946.353) { // Use Quarts if large
                outQty = baseValue / 946.353;
                outUnit = 'quart';
            } else if (baseValue >= 240) { // Use Cups
                outQty = baseValue / 240;
                outUnit = outQty <= 1.05 ? 'cup' : 'cups';
            } else if (baseValue >= 14.7868 && baseValue < 60) { // Tbsp
                outQty = baseValue / 14.7868;
                outUnit = 'tbsp';
            } else if (baseValue < 14.7868) { // Tsp
                outQty = baseValue / 4.92892;
                outUnit = 'tsp';
            } else { // fl oz default for middle range
                outQty = baseValue / 29.5735;
                outUnit = 'fl oz';
            }
        }
    } else {
        // Metric system (default)
        if (info.type === UNIT_TYPES.WEIGHT) {
            if (baseValue >= 1000) {
                outQty = baseValue / 1000;
                outUnit = 'kg';
            } else {
                outQty = baseValue;
                outUnit = 'g';
            }
        } else if (info.type === UNIT_TYPES.VOLUME) {
            const normUnit = normalizeUnit(unit);
            if (baseValue >= 1000) {
                outQty = baseValue / 1000;
                outUnit = 'l';
            } else if (normUnit === 'tsp' || normUnit === 'tbsp') {
                // Universally understood in culinary contexts, even in metric systems
                outQty = numQty;
                outUnit = normUnit;
            } else {
                outQty = baseValue;
                outUnit = 'ml';
            }
        }
    }

    // Rounding logic for cleaner display
    // e.g. 1.3333 -> 1.33, 1.999 -> 2
    outQty = Math.round(outQty * 100) / 100;

    return { qty: outQty, unit: outUnit };
}

/**
 * Returns a formatted string for display. Hides unit if requested or if 'pcs'.
 */
export function displayMeasurement(quantity, unit, system = 'metric', hideUnit = false) {
    if (!quantity && quantity !== 0) return '';
    const formatted = formatQuantityUnit(quantity, unit, system);
    
    if (hideUnit || formatted.unit === 'pcs' || formatted.unit === 'pc' || !formatted.unit) {
        return `${formatted.qty}`;
    }

    return `${formatted.qty} ${formatted.unit}`.trim();
}
