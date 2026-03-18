/**
 * searchEngine.js
 * Filters recipes by a text query matching name or ingredient names.
 */

/**
 * @param {Array} recipes
 * @param {string} query
 * @returns {Array}
 */
export function searchRecipes(recipes, query) {
    const q = query.toLowerCase().trim();
    if (!q) return recipes;
    return recipes.filter((recipe) => {
        const inName = recipe.name.toLowerCase().includes(q);
        const inIngredients = recipe.ingredients.some((ing) =>
            ing.name.toLowerCase().includes(q)
        );
        return inName || inIngredients;
    });
}
