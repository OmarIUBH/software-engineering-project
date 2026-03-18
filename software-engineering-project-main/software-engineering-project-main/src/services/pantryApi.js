import { apiClient } from './apiClient.js';

/**
 * Maps backend pantry fields to frontend fields for consistency.
 */
function mapPantryItem(item) {
    if (!item) return item;
    return {
        ...item,
        qty: item.quantity !== undefined ? item.quantity : item.qty,
        quantity: item.quantity !== undefined ? item.quantity : item.qty // Keep both just in case
    };
}

export const pantryApi = {
    /**
     * Fetch all pantry items for the default user.
     * @returns {Promise<Array>}
     */
    getAll: async () => {
        const data = await apiClient.get('/pantry');
        return (Array.isArray(data) ? data : []).map(mapPantryItem);
    },

    /**
     * Add an item to the pantry.
     * @param {Object} item { ingredient_id, quantity, unit }
     * @returns {Promise<Object>}
     */
    create: async (item) => {
        const data = await apiClient.post('/pantry', item);
        return mapPantryItem(data);
    },

    /**
     * Update an existing pantry item's quantity or unit.
     */
    update: (id, updates) => apiClient.put(`/pantry/${id}`, updates),

    /**
     * Remove an item from the pantry.
     */
    delete: (id) => apiClient.delete(`/pantry/${id}`),
};
