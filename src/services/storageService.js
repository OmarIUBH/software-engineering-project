/**
 * StorageService – wraps all localStorage read/write operations.
 * All keys are prefixed with 'mealmate_' to avoid collisions.
 */

const PREFIX = 'mealmate_';

const keys = {
    RECIPES: `${PREFIX}recipes`,
    PLAN: `${PREFIX}plan`,
    PANTRY: `${PREFIX}pantry`,
    SETTINGS: `${PREFIX}settings`,
    INITIALIZED: `${PREFIX}initialized`,
};

/** @param {string} key @returns {any|null} */
function read(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/** @param {string} key @param {any} value */
function write(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('MealMate: localStorage write failed', e);
    }
}

/** @param {string} key */
function remove(key) {
    try {
        localStorage.removeItem(key);
    } catch { /* noop */ }
}

export const storageService = {
    keys,

    isInitialized: () => read(keys.INITIALIZED) === true,
    setInitialized: () => write(keys.INITIALIZED, true),

    getRecipes: () => read(keys.RECIPES) ?? [],
    setRecipes: (recipes) => write(keys.RECIPES, recipes),

    getPlan: () => read(keys.PLAN) ?? { weekOf: '', budget: 40, plan: {} },
    setPlan: (plan) => write(keys.PLAN, plan),

    getPantry: () => read(keys.PANTRY) ?? [],
    setPantry: (items) => write(keys.PANTRY, items),

    getSettings: () => read(keys.SETTINGS) ?? { budget: 40, currency: '€' },
    setSettings: (s) => write(keys.SETTINGS, s),

    clearAll: () => {
        Object.values(keys).forEach(remove);
    },
};
