import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { recipesApi } from '../../services/recipesApi.js';
import { pantryApi } from '../../services/pantryApi.js';
import { storageService } from '../../services/storageService.js';
import { generateGroceryList, deductPantry, groupByCategory, computeWeeklyCost } from '../../engines/groceryEngine.js';
import { formatCurrency } from '../../utils/currency.js';
import { displayMeasurement } from '../../utils/units.js';
import styles from './GroceryList.module.css';

const CATEGORY_ICONS = {
    Produce: '🥦', Meat: '🥩', Fish: '🐟', 'Dairy & Eggs': '🥛',
    'Dry Goods': '🥫', Bakery: '🍞', Condiments: '🫙', Spices: '🧂', Other: '📦',
};

export default function GroceryList() {
    const { t } = useTranslation();
    const [plan, setPlan] = useState(() => storageService.getPlan());
    const [recipes, setRecipes] = useState([]);
    const [pantry, setPantry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [grouped, setGrouped] = useState(true);
    const [deductEnabled, setDeductEnabled] = useState(true);
    const [checked, setChecked] = useState({});
    const [adjustments, setAdjustments] = useState({});
    const [pendingAction, setPendingAction] = useState(null);

    const currency = storageService.getSettings()?.currency || 'EUR';
    const budget = storageService.getSettings()?.budget ?? 40;
    const system = storageService.getSettings()?.measurementSystem || 'metric';

    useEffect(() => {
        // Re-read plan fresh on every mount so drag-drop changes from planner are picked up
        setPlan(storageService.getPlan());

        // Use getAllForPlanning() so community recipes in the plan resolve correctly
        Promise.all([recipesApi.getAllForPlanning(), pantryApi.getAll()])
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
    
    const finalList = useMemo(() => {
        const adjustedList = rawList.map(item => {
            const adj = adjustments[item.id] || 0;
            return { ...item, qty: Math.max(0, item.qty + adj) };
        });
        return deductEnabled ? deductPantry(adjustedList, pantry) : adjustedList;
    }, [rawList, pantry, deductEnabled, adjustments]);

    const categories = useMemo(() => groupByCategory(finalList), [finalList]);
    const baseCost = useMemo(() => computeWeeklyCost(plan, recipes), [plan, recipes]);

    const cost = useMemo(() => {
        const totalBaseQuantity = rawList.reduce((sum, i) => sum + i.qty, 0);
        const avgUnitCost = totalBaseQuantity > 0 ? baseCost / totalBaseQuantity : 0;
        const currentAddedQuantity = Object.values(adjustments).reduce((a, b) => a + b, 0);
        return baseCost + (currentAddedQuantity * avgUnitCost);
    }, [rawList, baseCost, adjustments]);

    function handleAdjust(id, delta) {
        const item = rawList.find(i => i.id === id);
        if (!item) return;

        const currentAdj = adjustments[id] || 0;
        const newAdj = currentAdj + delta;
        if (item.qty + newAdj < 0) return;

        const totalBaseQuantity = rawList.reduce((sum, i) => sum + i.qty, 0);
        const avgUnitCost = totalBaseQuantity > 0 ? baseCost / totalBaseQuantity : 0;
        const proposedAddedQuantity = Object.values({ ...adjustments, [id]: newAdj }).reduce((a, b) => a + b, 0);
        const proposedCost = baseCost + (proposedAddedQuantity * avgUnitCost);

        if (delta > 0 && proposedCost > budget) {
            setPendingAction({ id, newAdj, proposedCost });
            return;
        }

        setAdjustments(prev => ({ ...prev, [id]: newAdj }));
    }

    function confirmAdjustment() {
        if (pendingAction) {
            setAdjustments(prev => ({ ...prev, [pendingAction.id]: pendingAction.newAdj }));
            setPendingAction(null);
        }
    }

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
                        <h1 className="section-title">{t('grocery.title', 'Grocery List')}</h1>
                        <p className="section-subtitle">
                            {finalList.length} items · {t('grocery.total_cost', 'Est. weekly cost')}:{' '}
                            <span className={cost > budget ? styles.overBudget : styles.underBudget}>
                                {formatCurrency(cost, currency)}
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
                        <span>{t('grocery.group_category', 'Group by category')}</span>
                    </label>
                    <label className={styles.toggle}>
                        <input type="checkbox" checked={deductEnabled} onChange={(e) => setDeductEnabled(e.target.checked)} />
                        <span>{t('grocery.deduct_pantry', 'Deduct pantry items')}</span>
                    </label>
                </div>

                {finalList.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">🛒</div>
                        <p className="empty-state__text">
                            {rawList.length === 0
                                ? t('grocery.empty', 'Add recipes to your weekly plan to generate a grocery list.')
                                : t('grocery.all_covered', 'All ingredients are covered by your pantry!')}
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
                                        <GroceryItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggleCheck} onAdjust={handleAdjust} system={system} />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ul className={styles.itemList}>
                        {finalList.map((item) => (
                            <GroceryItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggleCheck} onAdjust={handleAdjust} system={system} />
                        ))}
                    </ul>
                )}
            </div>

            {/* Print-only view */}
            <div className={styles.printView}>
                <h2>🛒 MealMate Grocery List</h2>
                <p>Week of: {plan.weekOf} · Est. cost: {formatCurrency(cost, currency)}</p>
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

            {pendingAction && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>Budget Warning</h3>
                        <p className={styles.modalBody}>
                            These adjustments will push your estimated grocery cost to 
                            <strong> {formatCurrency(pendingAction.proposedCost, currency)}</strong>, 
                            which exceeds your weekly budget of <strong>{formatCurrency(budget, currency)}</strong>.
                        </p>
                        <div className={styles.modalActions}>
                            <button className="btn btn-ghost" onClick={() => setPendingAction(null)}>Revert</button>
                            <button className="btn btn-primary" onClick={confirmAdjustment}>Accept</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function GroceryItem({ item, checked, onToggle, onAdjust, system }) {
    return (
        <li className={`${styles.item} ${checked ? styles.itemChecked : ''}`}>
            <span className={`${styles.checkbox} ${checked ? styles.checkboxDone : ''}`} onClick={() => onToggle(item.id)}>
                {checked ? '✓' : ''}
            </span>
            <span className={styles.itemName} onClick={() => onToggle(item.id)}>{item.name}</span>
            <div className={styles.itemControls}>
                <button className={styles.qtyBtn} onClick={() => onAdjust(item.id, -1)}>−</button>
                <span className={styles.qtyLabel}>{displayMeasurement(item.qty, item.unit, system, true)}</span>
                <button className={styles.qtyBtn} onClick={() => onAdjust(item.id, 1)}>+</button>
            </div>
        </li>
    );
}
