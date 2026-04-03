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
    lemon: 'Produce', lime: 'Produce', mushroom: 'Produce', mushrooms: 'Produce',
    onion: 'Produce', 'green onion': 'Produce', 'spring onion': 'Produce',
    'red onion': 'Produce', 'baby spinach': 'Produce', spinach: 'Produce',
    'sweet potato': 'Produce', tomato: 'Produce', 'bell pepper': 'Produce',
    'red bell pepper': 'Produce', 'green bell pepper': 'Produce',
    'fresh basil': 'Produce', basil: 'Produce', parsley: 'Produce',
    cilantro: 'Produce', 'mixed berries': 'Produce', blueberries: 'Produce',
    strawberries: 'Produce', 'shredded lettuce': 'Produce', lettuce: 'Produce',
    'black olives': 'Produce', garlic: 'Produce', 'garlic cloves': 'Produce',
    zucchini: 'Produce', eggplant: 'Produce', celery: 'Produce',
    potato: 'Produce', kale: 'Produce', asparagus: 'Produce',
    'cherry tomatoes': 'Produce', 'sun-dried tomatoes': 'Produce',
    jalapeño: 'Produce', ginger: 'Produce', 'fresh ginger': 'Produce',

    // Meat
    'minced beef': 'Meat', 'ground beef': 'Meat', 'chicken breast': 'Meat',
    'boneless skinless chicken breast': 'Meat', 'chicken thigh': 'Meat',
    'chicken thighs': 'Meat', bacon: 'Meat', 'ground turkey': 'Meat',
    'pork chop': 'Meat', 'italian sausage': 'Meat', 'beef steak': 'Meat',
    'lamb chop': 'Meat', ham: 'Meat', pancetta: 'Meat',

    // Fish & Seafood
    'salmon fillet': 'Fish', 'tuna (canned)': 'Fish', tuna: 'Fish',
    shrimp: 'Fish', cod: 'Fish', tilapia: 'Fish', salmon: 'Fish',

    // Dairy & Eggs
    egg: 'Dairy & Eggs', butter: 'Dairy & Eggs', milk: 'Dairy & Eggs',
    'heavy cream': 'Dairy & Eggs', 'heavy whipping cream': 'Dairy & Eggs',
    'sour cream': 'Dairy & Eggs', cream: 'Dairy & Eggs',
    'parmesan cheese': 'Dairy & Eggs', 'grated parmesan': 'Dairy & Eggs',
    'shredded mozzarella': 'Dairy & Eggs', mozzarella: 'Dairy & Eggs',
    'feta cheese': 'Dairy & Eggs', 'cheddar cheese': 'Dairy & Eggs',
    'cream cheese': 'Dairy & Eggs', 'ricotta cheese': 'Dairy & Eggs',
    'greek yogurt': 'Dairy & Eggs', yogurt: 'Dairy & Eggs',

    // Dry Goods
    spaghetti: 'Dry Goods', 'penne pasta': 'Dry Goods', pasta: 'Dry Goods',
    'jumbo pasta shells': 'Dry Goods', 'lasagna noodles': 'Dry Goods',
    'jasmine rice': 'Dry Goods', 'white rice': 'Dry Goods', rice: 'Dry Goods',
    'rolled oats': 'Dry Goods', oats: 'Dry Goods',
    'red lentils': 'Dry Goods', lentils: 'Dry Goods',
    'chickpeas (canned)': 'Dry Goods', chickpeas: 'Dry Goods',
    'black beans (canned)': 'Dry Goods', 'black beans': 'Dry Goods',
    'kidney beans': 'Dry Goods', 'sweetcorn (canned)': 'Dry Goods',
    'diced tomatoes (canned)': 'Dry Goods', 'tomato passata': 'Dry Goods',
    'coconut milk': 'Dry Goods', 'vegetable stock': 'Dry Goods',
    'chicken stock': 'Dry Goods', 'beef stock': 'Dry Goods',
    'chia seeds': 'Dry Goods', 'all-purpose flour': 'Dry Goods', flour: 'Dry Goods',
    'bread crumbs': 'Dry Goods', 'panko breadcrumbs': 'Dry Goods',
    'tomato sauce': 'Dry Goods', 'canned tomatoes': 'Dry Goods',

    // Bakery
    'wholegrain bread': 'Bakery', 'corn tortillas': 'Bakery',
    bread: 'Bakery', tortilla: 'Bakery', bun: 'Bakery', roll: 'Bakery',

    // Condiments
    'olive oil': 'Condiments', 'sesame oil': 'Condiments',
    'vegetable oil': 'Condiments', 'soy sauce': 'Condiments',
    salsa: 'Condiments', honey: 'Condiments', mayonnaise: 'Condiments',
    'tomato paste': 'Condiments', 'worcestershire sauce': 'Condiments',
    'hot sauce': 'Condiments', mustard: 'Condiments', vinegar: 'Condiments',
    'balsamic vinegar': 'Condiments', ketchup: 'Condiments',

    // Spices
    salt: 'Spices', pepper: 'Spices', 'black pepper': 'Spices',
    paprika: 'Spices', 'smoked paprika': 'Spices',
    'garlic powder': 'Spices', 'onion powder': 'Spices',
    'chilli flakes': 'Spices', 'red pepper flakes': 'Spices',
    'chilli powder': 'Spices', cumin: 'Spices', 'curry powder': 'Spices',
    'dried oregano': 'Spices', oregano: 'Spices', thyme: 'Spices',
    'italian herbs': 'Spices', 'italian seasoning': 'Spices',
    cinnamon: 'Spices', nutmeg: 'Spices', turmeric: 'Spices',
    'bay leaf': 'Spices', 'bay leaves': 'Spices', rosemary: 'Spices',
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
    /** @type {Record<string, {qty:number,unit:string,displayName:string,baseQty:number}>} */
    const totals = {};

    for (const day of Object.values(weeklyPlan.plan)) {
        for (const slot of Object.values(day)) {
            if (!slot) continue;

            const recipeId = (typeof slot === 'object') ? slot.id : slot;
            const plannedServings = (typeof slot === 'object') ? slot.servings : null;

            const recipe = recipeMap[recipeId];
            if (!recipe || !recipe.ingredients) continue;

            const finalServings = plannedServings || recipe.servings;
            const scaled = scaleIngredients(
                recipe.ingredients,
                recipe.servings,
                finalServings
            );
            for (const ing of scaled) {
                const key = normalise(ing.name);
                const { qty: baseQty } = toBase(ing.qty, ing.unit);
                if (totals[key]) {
                    totals[key].baseQty += baseQty;
                    totals[key].qty += ing.qty; // accumulate original qty too
                } else {
                    // Keep original unit for display; use baseQty only for pantry deduction
                    totals[key] = {
                        qty: ing.qty,
                        unit: ing.unit || 'pcs',
                        displayName: ing.name,
                        baseQty,
                    };
                }
            }
        }
    }

    return Object.entries(totals).map(([key, { qty, unit, displayName, baseQty }]) => ({
        id: key,
        name: displayName,
        canonicalName: key,
        qty: Math.round(qty * 100) / 100,
        unit,
        baseQty, // used by deductPantry
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

            // Use baseQty for comparison (both in same base unit dimension)
            const { unit: groceryBase } = toBase(0, item.unit);
            if (pantry.unit !== groceryBase && pantry.unit !== item.unit) return item;

            // Deduct proportionally from original qty
            const base = item.baseQty ?? item.qty;
            const remainingBase = Math.max(0, base - pantry.qty);
            if (remainingBase === 0) return { ...item, qty: 0 };
            // Scale original qty proportionally
            const ratio = base > 0 ? remainingBase / base : 0;
            return { ...item, qty: Math.round(item.qty * ratio * 100) / 100 };
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
        for (const slot of Object.values(day)) {
            if (!slot) continue;
            const recipeId = (typeof slot === 'object') ? slot.id : slot;
            const plannedServings = (typeof slot === 'object') ? slot.servings : null;

            const recipe = recipeMap[recipeId];
            if (!recipe) continue;

            const finalServings = plannedServings || recipe.servings;
            total += recipe.estimatedCostPerServing * finalServings;
        }
    }
    return Math.round(total * 100) / 100;
}
