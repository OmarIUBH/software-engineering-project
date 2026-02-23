/**
 * ingredientNormalizer.js
 * Maps common ingredient name variants to a canonical lowercase key
 * so that aggregation treats "tomatoes" and "tomato" as the same item.
 */

/** @type {Record<string,string>} variant → canonical */
const SYNONYMS = {
    tomatoes: 'tomato',
    'cherry tomatoes': 'cherry tomato',
    eggs: 'egg',
    potatoes: 'potato',
    onions: 'onion',
    carrots: 'carrot',
    lemons: 'lemon',
    garlic: 'garlic cloves',
    bananas: 'banana',
    avocados: 'avocado',
};

/**
 * Returns the canonical name for an ingredient.
 * @param {string} name
 * @returns {string}
 */
export function normalise(name) {
    const lower = name.toLowerCase().trim();
    return SYNONYMS[lower] ?? lower;
}
