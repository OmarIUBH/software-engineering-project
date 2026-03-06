import { useState, useMemo, useEffect } from 'react';
import { recipesApi } from '../../services/recipesApi.js';
import { pantryApi } from '../../services/pantryApi.js';
import { storageService } from '../../services/storageService.js';
import { generateGroceryList, deductPantry, groupByCategory, computeWeeklyCost } from '../../engines/groceryEngine.js';
import styles from './GroceryList.module.css';

const CATEGORY_ICONS = {
    Produce: '🥦', Meat: '🥩', Fish: '🐟', 'Dairy & Eggs': '🥛',
    'Dry Goods': '🥫', Bakery: '🍞', Condiments: '🫙', Spices: '🧂', Other: '📦',
};

export default function GroceryList() {
    const [plan] = useState(() => storageService.getPlan());
    const [recipes, setRecipes] = useState([]);
    const [pantry, setPantry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [grouped, setGrouped] = useState(true);
    const [deductEnabled, setDeductEnabled] = useState(true);
    const [checked, setChecked] = useState({});

    useEffect(() => {
        Promise.all([recipesApi.getAll(), pantryApi.getAll()])
            .then(([recipeData, pantryData]) => {
                setRecipes(recipeData);
                setPantry(pantryData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch grocery data:', err);
                setError('Failed to load data.');
                setLoading(false);
            });
    }, []);

    const rawList = useMemo(() => generateGroceryList(plan, recipes), [plan, recipes]);
    const finalList = useMemo(
        () => deductEnabled ? deductPantry(rawList, pantry) : rawList,
        [rawList, pantry, deductEnabled]
    );
    const categories = useMemo(() => groupByCategory(finalList), [finalList]);
    const cost = useMemo(() => computeWeeklyCost(plan, recipes), [plan, recipes]);
    const budget = storageService.getSettings().budget ?? 40;

    function toggleCheck(id) {
        setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
    }

    function handlePrint() {
        window.print();
    }

    const items = grouped
        ? categories.flatMap((g) => g.items)
        : finalList;

    return (
        <div className={styles.groceryContainer}>
            <div className={styles.screenOnly}>
                <div className={styles.header}>
                    <div>
                        <h1 className="section-title">Grocery List</h1>
                        <p className="section-subtitle">
                            {finalList.length} items · Est. weekly cost:{' '}
                            <span className={cost > budget ? styles.overBudget : styles.underBudget}>
                                €{cost.toFixed(2)}
                            </span>
                            {cost > budget && <span className={styles.overLabel}> (over budget!)</span>}
                        </p>
                    </div>
                    <button className="btn btn-ghost" onClick={handlePrint} aria-label="Print grocery list">
                        🖨 Print / Export
                    </button>
                </div>

                {/* Toggles */}
                <div className={styles.toggleRow}>
                    <label className={styles.toggle}>
                        <input type="checkbox" checked={grouped} onChange={(e) => setGrouped(e.target.checked)} />
                        <span>Group by category</span>
                    </label>
                    <label className={styles.toggle}>
                        <input type="checkbox" checked={deductEnabled} onChange={(e) => setDeductEnabled(e.target.checked)} />
                        <span>Deduct pantry items</span>
                    </label>
                </div>

                {finalList.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">🛒</div>
                        <p className="empty-state__text">
                            {rawList.length === 0
                                ? 'Add recipes to your weekly plan to generate a grocery list.'
                                : 'All ingredients are covered by your pantry!'}
                        </p>
                    </div>
                ) : grouped ? (
                    <div className={styles.categoryList}>
                        {categories.map(({ category, items: catItems }) => (
                            <div key={category} className={styles.categoryGroup}>
                                <div className={styles.categoryHeader}>
                                    <span>{CATEGORY_ICONS[category] ?? '📦'}</span>
                                    <span>{category}</span>
                                    <span className="badge">{catItems.length}</span>
                                </div>
                                <ul className={styles.itemList}>
                                    {catItems.map((item) => (
                                        <GroceryItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggleCheck} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ul className={styles.itemList}>
                        {finalList.map((item) => (
                            <GroceryItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggleCheck} />
                        ))}
                    </ul>
                )}
            </div>

            {/* Print-only view */}
            <div className={styles.printView}>
                <h2>🛒 MealMate Grocery List</h2>
                <p>Week of: {plan.weekOf} · Est. cost: €{cost.toFixed(2)}</p>
                {categories.map(({ category, items: catItems }) => (
                    <div key={category}>
                        <h3>{CATEGORY_ICONS[category]} {category}</h3>
                        <ul>
                            {catItems.map((item) => (
                                <li key={item.id}>☐ {item.name} – {item.qty} {item.unit}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GroceryItem({ item, checked, onToggle }) {
    return (
        <li
            className={`${styles.item} ${checked ? styles.itemChecked : ''}`}
            onClick={() => onToggle(item.id)}
        >
            <span className={`${styles.checkbox} ${checked ? styles.checkboxDone : ''}`}>
                {checked ? '✓' : ''}
            </span>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemQty}>{item.qty} {item.unit}</span>
        </li>
    );
}
