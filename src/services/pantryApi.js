import { apiClient } from './apiClient.js';

export const pantryApi = {
    /**
     * Fetch all pantry items for the default user.
     * @returns {Promise<Array>}
     */
    getAll: () => apiClient.get('/pantry'),

    /**
     * Add an item to the pantry.
     * @param {Object} item { ingredient_id, quantity, unit }
     * @returns {Promise<Object>}
     */
    create: (item) => apiClient.post('/pantry', item),

    /**
     * Update an existing pantry item's quantity or unit.
     * @param {number|string} id 
     * @param {Object} updates { quantity, unit }
     * @returns {Promise<Object>}
     */
    update: (id, updates) => apiClient.put(`/pantry/${id}`, updates),

    /**
     * Remove an item from the pantry.
     * @param {number|string} id 
     * @returns {Promise<Object>}
     */
    delete: (id) => apiClient.delete(`/pantry/${id}`),
};
