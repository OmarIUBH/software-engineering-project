import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import RecipeLibrary from './components/RecipeLibrary/RecipeLibrary.jsx';
import MealPlanner from './components/MealPlanner/MealPlanner.jsx';
import GroceryList from './components/GroceryList/GroceryList.jsx';
import PantryManager from './components/PantryManager/PantryManager.jsx';

function Navbar() {
    return (
        <nav className="navbar">
            <span className="navbar__logo">
                <span className="navbar__logo-icon">🥗</span> MealMate
            </span>
            <ul className="navbar__links">
                <li><NavLink to="/">Recipes</NavLink></li>
                <li><NavLink to="/planner">Planner</NavLink></li>
                <li><NavLink to="/grocery">Grocery List</NavLink></li>
                <li><NavLink to="/pantry">Pantry</NavLink></li>
            </ul>
        </nav>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <div className="app-layout">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<RecipeLibrary />} />
                        <Route path="/planner" element={<MealPlanner />} />
                        <Route path="/grocery" element={<GroceryList />} />
                        <Route path="/pantry" element={<PantryManager />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}
