import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import RecipeLibrary from './components/RecipeLibrary/RecipeLibrary.jsx';
import MealPlanner from './components/MealPlanner/MealPlanner.jsx';
import GroceryList from './components/GroceryList/GroceryList.jsx';
import PantryManager from './components/PantryManager/PantryManager.jsx';
import NotFound from './components/NotFound/NotFound.jsx';
import Login from './components/Authentication/Login.jsx';
import Signup from './components/Authentication/Signup.jsx';
import { AuthProvider, useAuth } from './components/Authentication/AuthContext.jsx';
import CommunityRecipes from './components/CommunityRecipes/CommunityRecipes.jsx';
import CreateRecipeForm from './components/CreateRecipeForm/CreateRecipeForm.jsx';
import AIAssistantModal from './components/AIAssistantModal/AIAssistantModal.jsx';
import { settingsApi } from './services/settingsApi.js';
import { useEffect } from 'react';
import SettingsModal from './components/SettingsModal/SettingsModal.jsx';
import { useState } from 'react';

import { useTranslation } from 'react-i18next';

function Navbar({ onOpenSettings }) {
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    return (
        <nav className="navbar">
            <span className="navbar__logo">
                <span className="navbar__logo-icon">🥗</span> {t('app_title', 'MealMate')}
            </span>
            <ul className="navbar__links">
                {user ? (
                    <>
                        <li><NavLink to="/">{t('nav.recipes', 'Recipes')}</NavLink></li>
                        <li><NavLink to="/community">{t('recipes.community', 'Community')}</NavLink></li>
                        <li><NavLink to="/create-recipe">{t('recipes.create_new', 'Create Recipe')}</NavLink></li>
                        <li><NavLink to="/planner">{t('nav.meal_plan', 'Planner')}</NavLink></li>
                        <li><NavLink to="/grocery">{t('nav.grocery_list', 'Grocery List')}</NavLink></li>
                        <li><NavLink to="/pantry">{t('nav.pantry', 'Pantry')}</NavLink></li>
                        <li><button onClick={onOpenSettings} className="nav-btn">⚙️ {t('nav.settings', 'Settings')}</button></li>
                        <li><button onClick={logout} className="nav-logout-btn">{t('nav.logout', 'Logout')}</button></li>
                    </>
                ) : (
                    <>
                        <li><NavLink to="/">{t('nav.recipes', 'Recipes')}</NavLink></li>
                        <li><NavLink to="/community">{t('recipes.community', 'Community')}</NavLink></li>
                        <li><button onClick={onOpenSettings} className="nav-btn">⚙️ {t('nav.settings', 'Settings')}</button></li>
                        <li><NavLink to="/login">{t('nav.login', 'Login')}</NavLink></li>
                        <li><NavLink to="/signup">{t('auth.sign_up', 'Signup')}</NavLink></li>
                    </>
                )}
            </ul>
        </nav>
    );
}

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '1.2rem', color: 'var(--text-muted, #888)' }}>Loading...</div>;
    return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function DemoBanner() {
    const { user } = useAuth();
    const { t } = useTranslation();
    if (!user?.isDemo) return null;
    return (
        <div style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            textAlign: 'center',
            padding: '8px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            zIndex: 1000
        }}>
            ⚠️ {t('auth.demo', 'Running in Offline Demo Mode (Backend Unreachable)')}
        </div>
    );
}

export default function App() {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        // Sync settings down from cloud on startup
        settingsApi.syncFromServer();
    }, []);

    return (
        <AuthProvider>
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <div className="app-layout">
                    <DemoBanner />
                    <Navbar onOpenSettings={() => setIsSettingsOpen(true)} />
                    <main className="main-content">
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/" element={<RecipeLibrary />} />
                            <Route path="/community" element={<CommunityRecipes />} />
                            <Route path="/create-recipe" element={<ProtectedRoute><CreateRecipeForm /></ProtectedRoute>} />
                            <Route path="/planner" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} />
                            <Route path="/grocery" element={<ProtectedRoute><GroceryList /></ProtectedRoute>} />
                            <Route path="/pantry" element={<ProtectedRoute><PantryManager /></ProtectedRoute>} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                    <AIAssistantModal />
                    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}
