/**
 * filterEngine.js
 * Filters recipes by one or more diet tags (AND logic).
 */

/**
 * @param {Array} recipes
 * @param {string[]} activeTags – empty array means "show all"
 * @returns {Array}
 */
export function filterByTags(recipes, activeTags) {
    if (!activeTags || activeTags.length === 0) return recipes;
    return recipes.filter((recipe) =>
        activeTags.every((tag) => recipe.dietTags.includes(tag))
    );
}

export const ALL_TAGS = [
    'vegetarian',
    'vegan',
    'high-protein',
    'dairy-free',
    'gluten-free',
];
