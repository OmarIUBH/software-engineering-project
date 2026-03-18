const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/prices
router.get('/', (req, res) => {
    try {
        const prices = db.prepare(`
            SELECT ip.*, i.name as ingredient_name 
            FROM ingredient_prices ip
            JOIN ingredients i ON ip.ingredient_id = i.id
        `).all();
        res.json(prices);
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

// PUT /api/prices/:ingredientId
router.put('/:ingredientId', (req, res) => {
    const { price_per_unit, currency } = req.body;
    try {
        db.prepare(`
            INSERT INTO ingredient_prices (ingredient_id, price_per_unit, currency) 
            VALUES (?, ?, ?)
            ON CONFLICT(ingredient_id) DO UPDATE SET 
                price_per_unit = excluded.price_per_unit,
                currency = excluded.currency,
                updated_at = CURRENT_TIMESTAMP
        `).run(req.params.ingredientId, price_per_unit, currency || 'USD');
        res.json({ message: 'Price updated' });
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

module.exports = router;
