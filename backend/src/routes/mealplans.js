const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/mealplans?weekStart=YYYY-MM-DD
router.get('/', (req, res) => {
    const { weekStart } = req.query;
    if (!weekStart) return res.status(400).json({ error: 'weekStart query param is required' });

    try {
        const plan = db.prepare('SELECT * FROM meal_plans WHERE week_start_date = ? AND user_id = ?').get(weekStart, req.user.id);
        if (!plan) return res.json({ message: 'No plan for this week', items: [] });

        const items = db.prepare(`
            SELECT mpi.*, r.title as recipe_title 
            FROM meal_plan_items mpi
            JOIN recipes r ON mpi.recipe_id = r.id
            WHERE mpi.meal_plan_id = ?
        `).all(plan.id);

        res.json({ ...plan, items });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// POST /api/mealplans - Create or get existing plan for user
router.post('/', (req, res) => {
    const { week_start_date, weekly_budget, currency } = req.body;
    try {
        const result = db.prepare(
            'INSERT INTO meal_plans (user_id, week_start_date, weekly_budget, currency) VALUES (?, ?, ?, ?)'
        ).run(req.user.id, week_start_date, weekly_budget || 0, currency || 'USD');
        res.status(201).json({ id: result.lastInsertRowid, message: 'Meal plan created' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// POST /api/mealplans/:id/items - Add item to plan
router.post('/:id/items', (req, res) => {
    const { day_of_week, meal_type, recipe_id, servings } = req.body;
    try {
        // Validate Plan exists and belongs to user
        const plan = db.prepare('SELECT id FROM meal_plans WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!plan) return res.status(404).json({ error: 'Meal plan not found or access denied' });

        // Validate Recipe exists
        const recipe = db.prepare('SELECT id FROM recipes WHERE id = ?').get(recipe_id);
        if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

        const result = db.prepare(
            'INSERT INTO meal_plan_items (meal_plan_id, day_of_week, meal_type, recipe_id, servings) VALUES (?, ?, ?, ?, ?)'
        ).run(req.params.id, day_of_week, meal_type, recipe_id, servings || 1);
        res.status(201).json({ id: result.lastInsertRowid, message: 'Item added to meal plan' });
    } catch (err) {
        res.status(400).json({ error: 'Database error', message: err.message });
    }
});

// DELETE /api/mealplans/:id/items/:itemId
router.delete('/:id/items/:itemId', (req, res) => {
    try {
        const plan = db.prepare('SELECT id FROM meal_plans WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
        if (!plan) return res.status(404).json({ error: 'Meal plan not found or access denied' });

        db.prepare('DELETE FROM meal_plan_items WHERE id = ? AND meal_plan_id = ?').run(req.params.itemId, req.params.id);
        res.json({ message: 'Item removed from meal plan' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

module.exports = router;
