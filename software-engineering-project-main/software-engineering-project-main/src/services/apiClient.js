import { MOCK_USER, MOCK_RECIPES } from './mockData.js';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fallback handler for when the backend is unreachable (Offline/Demo Mode)
 */
function handleMockRequest(endpoint, options = {}) {
    console.warn(`[Demo Mode] Intercepted ${options.method} request to ${endpoint}`);

    // Helper for persisting state in Demo Mode
    const getState = (key, defaultVal = []) => {
        const stored = localStorage.getItem(`demo_${key}`);
        return stored ? JSON.parse(stored) : defaultVal;
    };
    const saveState = (key, val) => localStorage.setItem(`demo_${key}`, JSON.stringify(val));

    // Simulate Login
    if (endpoint.includes('/auth/login')) {
        return Promise.resolve({
            message: 'Logged in via Demo Mode',
            token: MOCK_USER.token,
            user: { ...MOCK_USER, isDemo: true }
        });
    }

    // Simulate Recipe Fetch
    if (endpoint === '/recipes' || endpoint === '/recipes/') {
        return Promise.resolve(MOCK_RECIPES);
    }

    // Helper to safely get body as object
    const getBody = () => {
        if (!options.body) return {};
        return typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    };

    // Handle Pantry Persistence
    if (endpoint.includes('/pantry')) {
        const pantry = getState('pantry');
        if (options.method === 'GET') return Promise.resolve(pantry);

        if (options.method === 'POST') {
            const body = getBody();
            const newItem = {
                id: Date.now(),
                ...body,
                name: (body.name || 'Unknown Item')
            };
            const updated = [...pantry, newItem];
            saveState('pantry', updated);
            return Promise.resolve(newItem);
        }

        if (options.method === 'DELETE') {
            const id = parseInt(endpoint.split('/').pop());
            const updated = pantry.filter(item => item.id !== id);
            saveState('pantry', updated);
            return Promise.resolve({ message: 'Deleted' });
        }
    }

    // Handle Meal Plan Persistence (Sync with storageService)
    if (endpoint.includes('/mealplans')) {
        const plans = getState('mealplans');
        if (options.method === 'GET') return Promise.resolve(plans);
        if (options.method === 'POST') {
            const newPlan = getBody();
            saveState('mealplans', newPlan);
            return Promise.resolve(newPlan);
        }
    }

    // Default empty success for other POST/PUT/DELETE
    return Promise.resolve({ message: 'Success (Demo Mode)', isDemo: true });
}

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('mealmate_token');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        },
    };

    if (config.body && typeof config.body !== 'string') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `API request failed with status ${response.status}`);
        }

        // Handle 204 No Content
        if (response.status === 204) return null;

        return response.json();
    } catch (error) {
        // If it's a network error (failed to fetch), fallback to mock
        if (error.name === 'TypeError' || error.message.includes('fetch')) {
            return handleMockRequest(endpoint, options);
        }
        throw error;
    }
}

export const apiClient = {
    get: (url, options) => request(url, { ...options, method: 'GET' }),
    post: (url, body, options) => request(url, { ...options, method: 'POST', body }),
    put: (url, body, options) => request(url, { ...options, method: 'PUT', body }),
    delete: (url, options) => request(url, { ...options, method: 'DELETE' }),
};
