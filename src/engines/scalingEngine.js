/**
 * scalingEngine.js
 * Scales ingredient quantities proportionally based on desired servings.
 */

/**
 * Scale a list of ingredients from base servings to desired servings.
 * @param {Array<{name:string,qty:number,unit:string}>} ingredients
 * @param {number} baseServings – original recipe servings
 * @param {number} desiredServings – user-selected servings
 * @returns {Array<{name:string,qty:number,unit:string}>}
 */
export function scaleIngredients(ingredients, baseServings, desiredServings) {
    if (baseServings <= 0 || desiredServings <= 0) return ingredients;
    const factor = desiredServings / baseServings;
    return ingredients.map((ing) => ({
        ...ing,
        qty: Math.round(ing.qty * factor * 100) / 100,
    }));
}
