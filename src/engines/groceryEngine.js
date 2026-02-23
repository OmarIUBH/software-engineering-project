/**
 * groceryEngine.js
 * Core logic: aggregates ingredients from the weekly plan,
 * deducts pantry items, and categorises the result.
 */

import { normalise } from './ingredientNormalizer.js';
import { toBase, baseUnit } from './unitConversions.js';
import { scaleIngredients } from './scalingEngine.js';

/** Maps ingredient canonical name → grocery aisle category */
const CATEGORY_MAP = {
    // Produce
    avocado: 'Produce', banana: 'Produce', broccoli: 'Produce',
    carrot: 'Produce', 'cherry tomato': 'Produce', cucumber: 'Produce',
    lemon: 'Produce', mushrooms: 'Produce', onion: 'Produce',
    'red onion': 'Produce', 'baby spinach': 'Produce',
    'sweet potato': 'Produce', tomato: 'Produce', 'bell pepper': 'Produce',
    'fresh basil': 'Produce', 'mixed berries': 'Produce',
    'shredded lettuce': 'Produce', 'black olives': 'Produce',

    // Meat
    'minced beef': 'Meat', 'chicken breast': 'Meat',

    // Fish
    'salmon fillet': 'Fish', 'tuna (canned)': 'Fish',

    // Dairy & Eggs
    egg: 'Dairy & Eggs', butter: 'Dairy & Eggs', milk: 'Dairy & Eggs',
    'parmesan cheese': 'Dairy & Eggs', mozzarella: 'Dairy & Eggs',
    'feta cheese': 'Dairy & Eggs', 'cheddar cheese': 'Dairy & Eggs',
    'sour cream': 'Dairy & Eggs',

    // Dry Goods
    spaghetti: 'Dry Goods', 'penne pasta': 'Dry Goods',
    'jasmine rice': 'Dry Goods', 'rolled oats': 'Dry Goods',
    'red lentils': 'Dry Goods', 'chickpeas (canned)': 'Dry Goods',
    'black beans (canned)': 'Dry Goods', 'sweetcorn (canned)': 'Dry Goods',
    'diced tomatoes (canned)': 'Dry Goods', 'tomato passata': 'Dry Goods',
    'coconut milk': 'Dry Goods', 'vegetable stock': 'Dry Goods',
    'chia seeds': 'Dry Goods',

    // Bakery
    'wholegrain bread': 'Bakery', 'corn tortillas': 'Bakery',

    // Condiments & Spices
    'olive oil': 'Condiments', 'sesame oil': 'Condiments',
    'vegetable oil': 'Condiments', 'soy sauce': 'Condiments',
    salsa: 'Condiments', honey: 'Condiments', mayonnaise: 'Condiments',
    'chilli flakes': 'Spices', 'chilli powder': 'Spices',
    cumin: 'Spices', 'curry powder': 'Spices',
    'dried oregano': 'Spices', 'italian herbs': 'Spices',
};

const CATEGORY_ORDER = [
    'Produce', 'Meat', 'Fish', 'Dairy & Eggs', 'Dry Goods', 'Bakery',
    'Condiments', 'Spices', 'Other',
];

/** @param {string} canonicalName @returns {string} */
function getCategory(canonicalName) {
    return CATEGORY_MAP[canonicalName] ?? 'Other';
}

/**
 * Generate an aggregated grocery list from the weekly plan.
 * @param {{ plan: Record<string,Record<string,string|null>> }} weeklyPlan
 * @param {Array} recipes
 * @returns {Array<{name:string,qty:number,unit:string,category:string,checked:boolean}>}
 */
export function generateGroceryList(weeklyPlan, recipes) {
    const recipeMap = Object.fromEntries(recipes.map((r) => [r.id, r]));
    /** @type {Record<string, {qty:number,unit:string,displayName:string}>} */
    const totals = {};

    for (const day of Object.values(weeklyPlan.plan)) {
        for (const recipeId of Object.values(day)) {
            if (!recipeId) continue;
            const recipe = recipeMap[recipeId];
            if (!recipe) continue;
            const scaled = scaleIngredients(
                recipe.ingredients,
                recipe.servings,
                recipe.servings // use default servings for plan aggregate
            );
            for (const ing of scaled) {
                const key = normalise(ing.name);
                const { qty: baseQty, unit: bUnit } = toBase(ing.qty, ing.unit);
                if (totals[key]) {
                    totals[key].qty += baseQty;
                } else {
                    totals[key] = { qty: baseQty, unit: bUnit, displayName: ing.name };
                }
            }
        }
    }

    return Object.entries(totals).map(([key, { qty, unit, displayName }]) => ({
        id: key,
        name: displayName,
        canonicalName: key,
        qty: Math.round(qty * 100) / 100,
        unit,
        category: getCategory(key),
        checked: false,
    }));
}

/**
 * Deduct pantry items from the grocery list.
 * @param {Array} groceryList
 * @param {Array} pantryItems
 * @returns {Array} – items with qty > 0 after deduction; 0-qty items removed
 */
export function deductPantry(groceryList, pantryItems) {
    const pantryMap = {};
    for (const item of pantryItems) {
        const key = normalise(item.name);
        const { qty: baseQty, unit: bUnit } = toBase(item.qty, item.unit);
        if (pantryMap[key]) {
            pantryMap[key].qty += baseQty;
        } else {
            pantryMap[key] = { qty: baseQty, unit: bUnit };
        }
    }

    return groceryList
        .map((item) => {
            const pantry = pantryMap[item.canonicalName];
            if (!pantry) return item;
            // Only deduct if units are in the same base dimension
            const { unit: groceryBase } = toBase(0, item.unit);
            if (pantry.unit !== groceryBase && pantry.unit !== item.unit) return item;
            const remaining = Math.max(0, item.qty - pantry.qty);
            return { ...item, qty: Math.round(remaining * 100) / 100 };
        })
        .filter((item) => item.qty > 0);
}

/**
 * Group a flat grocery list by category, respecting CATEGORY_ORDER.
 * @param {Array} groceryList
 * @returns {Array<{category:string, items:Array}>}
 */
export function groupByCategory(groceryList) {
    const grouped = {};
    for (const item of groceryList) {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
    }
    return CATEGORY_ORDER
        .filter((cat) => grouped[cat])
        .map((cat) => ({ category: cat, items: grouped[cat] }));
}

/**
 * Compute the estimated total cost of the weekly plan.
 * @param {{ plan: Record<string,Record<string,string|null>> }} weeklyPlan
 * @param {Array} recipes
 * @returns {number}
 */
export function computeWeeklyCost(weeklyPlan, recipes) {
    const recipeMap = Object.fromEntries(recipes.map((r) => [r.id, r]));
    let total = 0;
    for (const day of Object.values(weeklyPlan.plan)) {
        for (const recipeId of Object.values(day)) {
            if (!recipeId) continue;
            const recipe = recipeMap[recipeId];
            if (!recipe) continue;
            total += recipe.estimatedCostPerServing * recipe.servings;
        }
    }
    return Math.round(total * 100) / 100;
}
