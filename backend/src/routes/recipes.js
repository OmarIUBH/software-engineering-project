const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/recipes - Get all recipes
router.get('/', (req, res) => {
    try {
        const recipes = db.prepare('SELECT * FROM recipes').all();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// GET /api/recipes/:id - Get single recipe with ingredients and tags
router.get('/:id', (req, res) => {
    try {
        const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
        if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

        const ingredients = db.prepare(`
            SELECT i.name, ri.quantity, ri.unit 
            FROM recipe_ingredients ri 
            JOIN ingredients i ON ri.ingredient_id = i.id 
            WHERE ri.recipe_id = ?
        `).all(req.params.id);

        const tags = db.prepare(`
            SELECT t.name 
            FROM recipe_tags rt 
            JOIN tags t ON rt.tag_id = t.id 
            WHERE rt.recipe_id = ?
        `).all(req.params.id);

        res.json({ ...recipe, ingredients, tags });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// POST /api/recipes - Create recipe
router.post('/', (req, res) => {
    const { title, instructions, default_servings, ingredients, tags } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        const insertTransaction = db.transaction(() => {
            const result = db.prepare(
                'INSERT INTO recipes (user_id, title, instructions, default_servings) VALUES (?, ?, ?, ?)'
            ).run(1, title, instructions, default_servings || 1);

            const recipeId = result.lastInsertRowid;

            if (ingredients && Array.isArray(ingredients)) {
                const insertRI = db.prepare(
                    'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)'
                );
                ingredients.forEach(ing => {
                    // Assuming ingredient_id is provided or resolved elsewhere
                    // For simplicity in Phase 2, we assume ingredient_id is sent
                    if (ing.ingredient_id) {
                        insertRI.run(recipeId, ing.ingredient_id, ing.quantity, ing.unit);
                    }
                });
            }

            if (tags && Array.isArray(tags)) {
                const insertRT = db.prepare('INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)');
                tags.forEach(tagId => {
                    insertRT.run(recipeId, tagId);
                });
            }

            return recipeId;
        });

        const id = insertTransaction();
        res.status(201).json({ id, title, message: 'Recipe created' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// DELETE /api/recipes/:id
router.delete('/:id', (req, res) => {
    try {
        const result = db.prepare('DELETE FROM recipes WHERE id = ?').run(req.params.id);
        if (result.changes === 0) return res.status(404).json({ error: 'Recipe not found' });
        res.json({ message: 'Recipe deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

module.exports = router;
