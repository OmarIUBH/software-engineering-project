const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/pantry
router.get('/', (req, res) => {
    try {
        const items = db.prepare(`
            SELECT pi.*, i.name as ingredient_name 
            FROM pantry_items pi
            JOIN ingredients i ON pi.ingredient_id = i.id
            WHERE pi.user_id = 1
        `).all();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// POST /api/pantry
router.post('/', (req, res) => {
    const { ingredient_id, quantity, unit } = req.body;
    try {
        const result = db.prepare(
            'INSERT INTO pantry_items (user_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)'
        ).run(1, ingredient_id, quantity, unit);
        res.status(201).json({ id: result.lastInsertRowid, message: 'Pantry item added' });
    } catch (err) {
        res.status(400).json({ error: 'Database error', message: err.message });
    }
});

// PUT /api/pantry/:id
router.put('/:id', (req, res) => {
    const { quantity, unit } = req.body;
    try {
        db.prepare('UPDATE pantry_items SET quantity = ?, unit = ? WHERE id = ?').run(quantity, unit, req.params.id);
        res.json({ message: 'Pantry item updated' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// DELETE /api/pantry/:id
router.delete('/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM pantry_items WHERE id = ?').run(req.params.id);
        res.json({ message: 'Pantry item deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

module.exports = router;
