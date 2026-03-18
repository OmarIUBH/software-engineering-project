import { describe, it, expect } from 'vitest';
import { scaleIngredients } from '../engines/scalingEngine.js';
import { filterByTags } from '../engines/filterEngine.js';
import { searchRecipes } from '../engines/searchEngine.js';
import { generateGroceryList, deductPantry, computeWeeklyCost } from '../engines/groceryEngine.js';
import { normalise } from '../engines/ingredientNormalizer.js';
import { convert, toBase } from '../engines/unitConversions.js';

// ── TC-04: Scaling Engine ─────────────────────────────────────────────────────
describe('ScalingEngine', () => {
    const ingredients = [
        { name: 'Chicken breast', qty: 300, unit: 'g' },
        { name: 'Olive oil', qty: 2, unit: 'tbsp' },
    ];

    it('TC-04a: doubles quantities when servings go from 2 to 4', () => {
        const scaled = scaleIngredients(ingredients, 2, 4);
        expect(scaled[0].qty).toBe(600);
        expect(scaled[1].qty).toBe(4);
    });

    it('TC-04b: halves quantities when scaling from 4 to 2', () => {
        const scaled = scaleIngredients(ingredients, 4, 2);
        expect(scaled[0].qty).toBe(150);
    });

    it('TC-04c: returns original if base or desired servings is 0', () => {
        const scaled = scaleIngredients(ingredients, 0, 4);
        expect(scaled).toEqual(ingredients);
    });
});

// ── TC-02: Filter Engine ──────────────────────────────────────────────────────
describe('FilterEngine', () => {
    const recipes = [
        { id: 'r1', name: 'A', dietTags: ['vegetarian', 'vegan'], ingredients: [] },
        { id: 'r2', name: 'B', dietTags: ['high-protein'], ingredients: [] },
        { id: 'r3', name: 'C', dietTags: ['vegetarian'], ingredients: [] },
    ];

    it('TC-02a: returns all recipes when no tags active', () => {
        expect(filterByTags(recipes, [])).toHaveLength(3);
    });

    it('TC-02b: filters to vegetarian only', () => {
        const res = filterByTags(recipes, ['vegetarian']);
        expect(res).toHaveLength(2);
        expect(res.every((r) => r.dietTags.includes('vegetarian'))).toBe(true);
    });

    it('TC-02c: AND logic – vegetarian AND vegan returns only r1', () => {
        const res = filterByTags(recipes, ['vegetarian', 'vegan']);
        expect(res).toHaveLength(1);
        expect(res[0].id).toBe('r1');
    });
});

// ── TC-03: Search Engine ──────────────────────────────────────────────────────
describe('SearchEngine', () => {
    const recipes = [
        { id: 'r1', name: 'Pasta Bolognese', dietTags: [], ingredients: [{ name: 'Spaghetti', qty: 200, unit: 'g' }] },
        { id: 'r2', name: 'Lentil Soup', dietTags: [], ingredients: [{ name: 'Red lentils', qty: 250, unit: 'g' }] },
        { id: 'r3', name: 'Pasta Primavera', dietTags: [], ingredients: [{ name: 'Penne pasta', qty: 200, unit: 'g' }] },
    ];

    it('TC-03a: returns all recipes for empty query', () => {
        expect(searchRecipes(recipes, '')).toHaveLength(3);
    });

    it('TC-03b: finds recipes by name substring (case-insensitive)', () => {
        const res = searchRecipes(recipes, 'pasta');
        expect(res).toHaveLength(2);
    });

    it('TC-03c: finds recipe by ingredient name', () => {
        const res = searchRecipes(recipes, 'lentil');
        expect(res).toHaveLength(1);
        expect(res[0].id).toBe('r2');
    });
});

// ── TC-07: Grocery Engine – aggregation ──────────────────────────────────────
describe('GroceryEngine – generateGroceryList', () => {
    const recipes = [
        {
            id: 'rA', name: 'A', servings: 2, estimatedCostPerServing: 3,
            dietTags: [], category: 'Test', instructions: [],
            ingredients: [
                { name: 'Spaghetti', qty: 200, unit: 'g' },
                { name: 'Olive oil', qty: 1, unit: 'tbsp' },
            ],
        },
        {
            id: 'rB', name: 'B', servings: 2, estimatedCostPerServing: 2,
            dietTags: [], category: 'Test', instructions: [],
            ingredients: [
                { name: 'Spaghetti', qty: 150, unit: 'g' },
                { name: 'Tomato passata', qty: 400, unit: 'ml' },
            ],
        },
    ];

    const plan = {
        weekOf: '2026-02-23',
        budget: 40,
        plan: {
            Monday: { breakfast: null, lunch: 'rA', dinner: 'rB' },
        },
    };

    it('TC-07: aggregates shared ingredient Spaghetti to 350g', () => {
        const list = generateGroceryList(plan, recipes);
        // Spaghetti is in both; base unit is g; 200+150 = 350
        const spaghetti = list.find((i) => i.canonicalName === 'spaghetti');
        expect(spaghetti).toBeDefined();
        expect(spaghetti.qty).toBe(350);
        expect(spaghetti.unit).toBe('g');
    });

    it('produces distinct items for non-shared ingredients', () => {
        const list = generateGroceryList(plan, recipes);
        const names = list.map((i) => i.canonicalName);
        expect(names).toContain('olive oil');
        expect(names).toContain('tomato passata');
    });
});

// ── TC-09 & TC-10: Pantry Deduction ──────────────────────────────────────────
describe('GroceryEngine – deductPantry', () => {
    const groceryList = [
        { id: 'olive oil', name: 'Olive oil', canonicalName: 'olive oil', qty: 30, unit: 'ml', category: 'Condiments', checked: false },
        { id: 'chicken breast', name: 'Chicken breast', canonicalName: 'chicken breast', qty: 500, unit: 'g', category: 'Meat', checked: false },
        { id: 'spaghetti', name: 'Spaghetti', canonicalName: 'spaghetti', qty: 200, unit: 'g', category: 'Dry Goods', checked: false },
    ];

    it('TC-09: fully covered pantry item is removed from grocery list', () => {
        // Pantry: 500 ml olive oil; need 30 ml → fully covered → removed
        const pantry = [{ id: 'p1', name: 'Olive oil', qty: 500, unit: 'ml' }];
        const result = deductPantry(groceryList, pantry);
        expect(result.find((i) => i.canonicalName === 'olive oil')).toBeUndefined();
    });

    it('TC-10: partially covered pantry item shows remaining quantity', () => {
        // Need 500g chicken; have 200g → remaining 300g
        const pantry = [{ id: 'p2', name: 'Chicken breast', qty: 200, unit: 'g' }];
        const result = deductPantry(groceryList, pantry);
        const chicken = result.find((i) => i.canonicalName === 'chicken breast');
        expect(chicken).toBeDefined();
        expect(chicken.qty).toBe(300);
    });

    it('TC-10b: item not in pantry is unchanged', () => {
        const pantry = [];
        const result = deductPantry(groceryList, pantry);
        const spaghetti = result.find((i) => i.canonicalName === 'spaghetti');
        expect(spaghetti.qty).toBe(200);
    });
});

// ── TC-11: Budget / Cost Computation ─────────────────────────────────────────
describe('GroceryEngine – computeWeeklyCost', () => {
    const recipes = [
        { id: 'rX', servings: 2, estimatedCostPerServing: 3.00, name: 'X', dietTags: [], category: 'T', instructions: [], ingredients: [] },
        { id: 'rY', servings: 1, estimatedCostPerServing: 5.50, name: 'Y', dietTags: [], category: 'T', instructions: [], ingredients: [] },
    ];

    const plan = {
        budget: 10,
        plan: {
            Monday: { breakfast: 'rX', lunch: null, dinner: 'rY' },
        },
    };

    it('TC-11: total cost = sum of (costPerServing * servings) across all planned meals', () => {
        // rX: 3.00 * 2 = 6.00; rY: 5.50 * 1 = 5.50 → total 11.50
        expect(computeWeeklyCost(plan, recipes)).toBe(11.50);
    });
});

// ── Ingredient Normaliser ─────────────────────────────────────────────────────
describe('IngredientNormalizer', () => {
    it('maps "tomatoes" to "tomato"', () => expect(normalise('Tomatoes')).toBe('tomato'));
    it('passes unknown names through as lowercase', () => expect(normalise('Quinoa')).toBe('quinoa'));
});

// ── Unit Conversions ──────────────────────────────────────────────────────────
describe('UnitConversions', () => {
    it('converts L to ml correctly', () => expect(convert(0.5, 'L', 'ml')).toBe(500));
    it('converts tbsp to ml (1 tbsp = 15 ml)', () => expect(convert(2, 'tbsp', 'ml')).toBe(30));
    it('returns null for incompatible dimensions (g vs ml)', () => expect(convert(100, 'g', 'ml')).toBeNull());
    it('toBase converts 2 tbsp → 30 ml', () => {
        const { qty, unit } = toBase(2, 'tbsp');
        expect(qty).toBe(30);
        expect(unit).toBe('ml');
    });
});
