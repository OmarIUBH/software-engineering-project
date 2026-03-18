const express = require('express');
const router = express.Router();
const { db } = require('../db');

// GET /api/tags
router.get('/', (req, res) => {
    try {
        const tags = db.prepare('SELECT * FROM tags').all();
        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: 'Database error', message: err.message });
    }
});

module.exports = router;
