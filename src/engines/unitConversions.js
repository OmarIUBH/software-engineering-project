/**
 * unitConversions.js
 * Converts quantities between compatible units within the same dimension.
 * Dimensions: volume (ml base), mass (g base), count (pcs base).
 */

/** @type {Record<string, number>} unit → base-unit multiplier */
const TO_BASE = {
    // Volume (base: ml)
    ml: 1,
    l: 1000,
    L: 1000,
    tbsp: 15,
    tsp: 5,
    cup: 240,

    // Mass (base: g)
    g: 1,
    kg: 1000,

    // Count (base: pcs)
    pcs: 1,
    slices: 1,
};

/** Dimension classification */
const DIMENSION = {
    ml: 'volume', l: 'volume', L: 'volume', tbsp: 'volume', tsp: 'volume', cup: 'volume',
    g: 'mass', kg: 'mass',
    pcs: 'count', slices: 'count',
};

/**
 * Convert a value from one unit to another.
 * Returns null if units are incompatible (different dimensions).
 * @param {number} value
 * @param {string} fromUnit
 * @param {string} toUnit
 * @returns {number|null}
 */
export function convert(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value;
    const fromDim = DIMENSION[fromUnit];
    const toDim = DIMENSION[toUnit];
    if (!fromDim || !toDim || fromDim !== toDim) return null;
    const baseValue = value * (TO_BASE[fromUnit] ?? 1);
    return baseValue / (TO_BASE[toUnit] ?? 1);
}

/**
 * Return the base unit for a given unit's dimension.
 * @param {string} unit
 * @returns {string}
 */
export function baseUnit(unit) {
    const dim = DIMENSION[unit];
    if (dim === 'volume') return 'ml';
    if (dim === 'mass') return 'g';
    return 'pcs';
}

/**
 * Convert a value to its base unit value.
 * @param {number} qty
 * @param {string} unit
 * @returns {{ qty: number, unit: string }}
 */
export function toBase(qty, unit) {
    const multiplier = TO_BASE[unit] ?? 1;
    return { qty: qty * multiplier, unit: baseUnit(unit) };
}
