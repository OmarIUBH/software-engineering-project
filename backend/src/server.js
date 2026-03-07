require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:8080',
        'https://mealmate-835.pages.dev'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
const recipesRouter = require('./routes/recipes');
const mealplansRouter = require('./routes/mealplans');
const pantryRouter = require('./routes/pantry');
const tagsRouter = require('./routes/tags');
const pricesRouter = require('./routes/prices');
const { router: authRouter } = require('./routes/auth');

app.use('/api/recipes', recipesRouter);
app.use('/api/mealplans', mealplansRouter);
app.use('/api/pantry', pantryRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/prices', pricesRouter);
app.use('/api/auth', authRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: 'connected' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`MealMate Backend listening on port ${PORT}`);
});
