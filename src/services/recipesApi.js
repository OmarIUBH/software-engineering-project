import { apiClient } from './apiClient.js';

/**
 * Maps backend recipe fields to frontend fields for consistency.
 */
function mapRecipe(r) {
    if (!r) return r;

    // Parse instructions if it's a JSON string from the DB
    let instructions = r.instructions;
    if (typeof instructions === 'string') {
        try {
            instructions = JSON.parse(instructions);
        } catch (e) {
            // If it's not JSON, maybe it's a newline-separated list or just a string
            instructions = instructions.split('\n').filter(Boolean);
        }
    }

    return {
        ...r,
        name: r.title || r.name || 'Untitled Recipe',
        servings: r.default_servings || r.servings || 1,
        prepTime: r.prepTime || 20,
        description: r.description || 'A delicious meal.',
        category: r.category || 'Main Course',
        dietTags: r.dietTags || (r.tags ? r.tags.map(t => t.name) : []),
        ingredients: r.ingredients || [],
        instructions: Array.isArray(instructions) ? instructions : [instructions].filter(Boolean),
        estimatedCostPerServing: parseFloat(r.estimated_cost_per_serving || r.estimatedCostPerServing || 5.0)
    };
}

export const recipesApi = {
    /**
     * Fetch all recipes from the backend.
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        const data = await apiClient.get('/recipes');
        return (Array.isArray(data) ? data : []).map(mapRecipe);
    },

    /**
     * Fetch a single recipe by ID with ingredients and tags.
     * @param {number|string} id 
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        const data = await apiClient.get(`/recipes/${id}`);
        return mapRecipe(data);
    },

    /**
     * Create a new recipe.
     * @param {Object} recipe 
     * @returns {Promise<Object>}
     */
    create: (recipe) => apiClient.post('/recipes', recipe),

    /**
     * Remove a recipe by ID.
     * @param {number|string} id 
     * @returns {Promise<Object>}
     */
    delete: (id) => apiClient.delete(`/recipes/${id}`),
};
