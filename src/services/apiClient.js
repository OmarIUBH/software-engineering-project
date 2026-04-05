import { MOCK_USER, MOCK_RECIPES } from './mockData.js';

// On Cloudflare Pages, use relative /api path (Functions are served on the same origin).
// Locally, fall back to localhost:3000/api.
const BASE_URL = import.meta.env.VITE_API_URL || (
    typeof window !== 'undefined' && window.location.hostname !== 'localhost'
        ? '/api'
        : 'http://localhost:3000/api'
);

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

    // Handle AI Assistance
    if (endpoint.includes('/ai')) {
        return Promise.resolve({ reply: '🤖 [Demo Mode]: To use the live Gemini AI, please ensure your Node backend is running (cd backend && npm start).' });
    }

    // Handle Nutrition
    if (endpoint.includes('/nutrition')) {
        return Promise.resolve({
            calories: 450,
            protein: 25,
            carbs: 55,
            fat: 15
        });
    }

    // Handle Scrape
    if (endpoint.includes('/scrape')) {
        return Promise.resolve({
            title: "Delicious Demo Recipe (Scraped)",
            ingredients: [
                "1 cup of Mock Milk",
                "2 tablespoons of Demo Sugar",
                "1 pinch of Magic Dust"
            ],
            instructions: "1. Hand-crafted because the site blocked the real scraper.\n2. Mix all ingredients.\n3. Bake for 30 minutes at 350°F."
        });
    }

    // Handle ingredients fallback payload to prevent JS map crashes
    if (endpoint.includes('/ingredients')) {
        return Promise.resolve([]);
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
        // Only fall back to mock on genuine network errors (backend unreachable)
        // Do NOT silently swallow errors from /ai or /nutrition - let them surface
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
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
