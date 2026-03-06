const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const recipesRouter = require('../routes/recipes');
const pantryRouter = require('../routes/pantry');
const { router: authRouter } = require('../routes/auth');
const { db } = require('../db');

// Create a small test app
const app = express();
app.use(express.json());
app.use('/api/recipes', recipesRouter);
app.use('/api/pantry', pantryRouter);
app.use('/api/auth', authRouter);

describe('API Endpoints - Core', () => {
    test('GET /api/recipes returns an array', async () => {
        const res = await request(app).get('/api/recipes');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/pantry returns an array', async () => {
        const res = await request(app).get('/api/pantry');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('POST /api/pantry validation works (negative quantity)', async () => {
        const res = await request(app)
            .post('/api/pantry')
            .send({ ingredient_id: 1, quantity: -5, unit: 'g' });

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });
});

describe('API Endpoints - Authentication', () => {
    const testEmail = `test_${Date.now()}@mealmate.test`;
    const testPassword = 'TestPass123!';
    const testName = 'Test User';

    test('POST /api/auth/register - registers a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: testName, email: testEmail, password: testPassword });

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(testEmail);
        expect(res.body.user.name).toBe(testName);
    });

    test('POST /api/auth/register - fails with missing fields', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'incomplete@test.com' }); // missing name and password

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBeDefined();
    });

    test('POST /api/auth/register - fails with duplicate email', async () => {
        // First register
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Dup User', email: 'dup@mealmate.test', password: 'pass123' });

        // Second register with same email
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Dup User 2', email: 'dup@mealmate.test', password: 'pass456' });

        expect(res.statusCode).toBe(409);
        expect(res.body.error).toContain('Email already exists');
    });

    test('POST /api/auth/login - logs in successfully after registration', async () => {
        const loginEmail = `login_${Date.now()}@mealmate.test`;
        // Register first
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Login User', email: loginEmail, password: 'mypassword' });

        // Now login
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: loginEmail, password: 'mypassword' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe(loginEmail);
    });

    test('POST /api/auth/login - fails with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body.error).toBeDefined();
    });

    test('POST /api/auth/login - fails with non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@nowhere.test', password: 'somepassword' });

        expect(res.statusCode).toBe(401);
    });
});

describe('API Endpoints - Pantry with Expiry Date', () => {
    test('POST /api/pantry returns 400 without ingredient_id', async () => {
        const res = await request(app)
            .post('/api/pantry')
            .send({ quantity: 5, unit: 'g', expiry_date: '2026-12-31' });

        expect(res.statusCode).toBe(400);
    });

    test('GET /api/pantry items include expiry_date field', async () => {
        const res = await request(app).get('/api/pantry');
        expect(res.statusCode).toBe(200);
        // Every item (if any) should have the expiry_date key (even if null)
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('expiry_date');
        }
    });
});
