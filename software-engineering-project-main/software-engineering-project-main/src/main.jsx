import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { storageService } from './services/storageService.js';
import { RECIPES, PANTRY_ITEMS, WEEKLY_PLAN } from './data/seedData.js';

// Seed localStorage on first run
if (!storageService.isInitialized()) {
    storageService.setRecipes(RECIPES);
    storageService.setPantry(PANTRY_ITEMS);
    storageService.setPlan(WEEKLY_PLAN);
    storageService.setSettings({ budget: WEEKLY_PLAN.budget, currency: '€' });
    storageService.setInitialized();
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
