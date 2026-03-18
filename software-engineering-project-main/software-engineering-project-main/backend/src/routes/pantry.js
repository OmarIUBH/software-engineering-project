const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/pantry
router.get('/', (req, res) => {
    try {
        const items = db.prepare(`
            SELECT pi.*, i.name as name 
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
    let { ingredient_id, name, quantity, unit, expiry_date } = req.body;

    if (!ingredient_id && !name) {
        return res.status(400).json({ error: 'ingredient_id or name is required' });
    }

    // Auto-create missing ingredients so the pantry constraint doesn't fail
    if (!ingredient_id && name) {
        try {
            const existing = db.prepare('SELECT id FROM ingredients WHERE LOWER(name) = LOWER(?)').get(name.trim());
            if (existing) {
                ingredient_id = existing.id;
            } else {
                const newIng = db.prepare('INSERT INTO ingredients (name, default_unit) VALUES (?, ?)').run(name.trim(), unit);
                ingredient_id = newIng.lastInsertRowid;
            }
        } catch (err) {
            return res.status(500).json({ error: 'Failed to lookup/create ingredient for pantry item' });
        }
    }

    if (quantity === undefined || quantity < 0) return res.status(400).json({ error: 'Valid quantity is required' });
    if (!unit) return res.status(400).json({ error: 'Unit is required' });

    try {
        const result = db.prepare(
            'INSERT INTO pantry_items (user_id, ingredient_id, quantity, unit, expiry_date) VALUES (?, ?, ?, ?, ?)'
        ).run(1, ingredient_id, quantity, unit, expiry_date || null);
        res.status(201).json({ id: result.lastInsertRowid, message: 'Pantry item added' });
    } catch (err) {
        res.status(400).json({ error: 'Database error', message: err.message });
    }
});

// PUT /api/pantry/:id
router.put('/:id', (req, res) => {
    const { quantity, unit, expiry_date } = req.body;
    if (quantity !== undefined && quantity < 0) return res.status(400).json({ error: 'Quantity cannot be negative' });

    try {
        db.prepare('UPDATE pantry_items SET quantity = ?, unit = ?, expiry_date = ? WHERE id = ?').run(quantity, unit, expiry_date || null, req.params.id);
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
