import { useState, useMemo, useEffect, useRef } from 'react';
import { pantryApi } from '../../services/pantryApi.js';
import { recipesApi } from '../../services/recipesApi.js';
import { storageService } from '../../services/storageService.js';
import styles from './PantryManager.module.css';

const UNITS = ['g', 'kg', 'ml', 'L', 'pcs', 'slices', 'tbsp', 'tsp', 'cup'];

function getExpiryInfo(dateString) {
    if (!dateString) return null;

    const [year, month, day] = dateString.split('-');
    const expiry = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let color = 'var(--color-text-muted, #666)';
    let text = `(Expires: ${dateString})`;
    let fontWeight = 'normal';

    if (diffDays < 0) {
        color = 'var(--color-danger, #ef4444)';
        text = `(Expired ${Math.abs(diffDays)} days ago)`;
        fontWeight = 'bold';
    } else if (diffDays <= 3) {
        color = '#f59e0b'; // Orange for warning
        text = diffDays === 0 ? '(Expires Today!)' : `(Expires in ${diffDays} days)`;
        fontWeight = 'bold';
    } else if (diffDays <= 7) {
        text = `(Expires in ${diffDays} days)`;
    }

    return { color, text, fontWeight };
}

export default function PantryManager() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({ name: '', qty: '', unit: 'g', expiry_date: '' });
    const [formError, setFormError] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Autocomplete state
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const suggestionRef = useRef(null);

    // Initial load
    useEffect(() => {
        Promise.all([pantryApi.getAll(), recipesApi.getAll()])
            .then(([pantryData, recipesData]) => {
                setItems(pantryData.map(item => ({
                    ...item,
                    name: item.name || item.ingredient_name, // Support both new and old API structures
                    qty: item.quantity,
                    expiry_date: item.expiry_date || ''
                })));
                setRecipes(recipesData);
                setLoading(false);
            })
            .catch(err => {
                console.error('Pantry load failed:', err);
                setError('Failed to load pantry data.');
                setLoading(false);
            });
    }, []);

    // Load unique ingredients from recipes for suggestions
    const allIngredients = useMemo(() => {
        const names = new Set();
        recipes.forEach(r => {
            // Check if ingredients exist (might be minimized list)
            if (r.ingredients) {
                r.ingredients.forEach(ing => names.add(ing.name));
            }
        });
        return Array.from(names).sort();
    }, [recipes]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleNameChange(e) {
        const val = e.target.value;
        setForm(f => ({ ...f, name: val }));

        if (val.trim()) {
            const matches = allIngredients.filter(n =>
                n.toLowerCase().includes(val.toLowerCase()) &&
                n.toLowerCase() !== val.toLowerCase()
            ).slice(0, 5);
            setSuggestions(matches);
            setShowSuggestions(matches.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }

    function selectSuggestion(name) {
        setForm(f => ({ ...f, name }));
        setSuggestions([]);
        setShowSuggestions(false);
    }

    async function handleAdd(e) {
        e.preventDefault();
        const name = form.name.trim();
        const qty = parseFloat(form.qty);
        if (!name) { setFormError('Please enter an ingredient name.'); return; }
        if (!qty || qty <= 0) { setFormError('Please enter a valid quantity.'); return; }
        setFormError('');

        // Find ingredient ID from recipes
        // Search through all recipes.ingredients for a matching name to find its real ingredient_id
        let foundIngredientId = null;
        for (const r of recipes) {
            if (r.ingredients) {
                const match = r.ingredients.find(i => i.name.toLowerCase() === name.toLowerCase());
                if (match && match.ingredient_id) {
                    foundIngredientId = match.ingredient_id;
                    break;
                }
            }
        }

        // If we still can't find an exact ID map, we set it to null and let the backend 
        // use the 'name' field to either find it in the DB or create it on the fly.
        const finalIngredientId = foundIngredientId || null;

        setIsAdding(true);
        try {
            const newItem = {
                ingredient_id: finalIngredientId,
                name: name, // Send the name so the backend can create it if missing
                quantity: qty,
                unit: form.unit,
                expiry_date: form.expiry_date
            };
            const result = await pantryApi.create(newItem);
            const added = {
                id: result.id,
                name: name,
                qty: qty,
                unit: form.unit,
                expiry_date: form.expiry_date
            };
            setItems(prev => [...prev, added]);
            setForm({ name: '', qty: '', unit: 'g', expiry_date: '' });
            setShowSuggestions(false);

            // Show success feedback
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (err) {
            setFormError('Failed to add item to pantry.');
        } finally {
            setIsAdding(false);
        }
    }

    async function handleRemove(id) {
        try {
            await pantryApi.delete(id);
            setItems(items.filter((i) => i.id !== id));
        } catch (err) {
            alert('Failed to delete item.');
        }
    }

    async function handleUpdateQty(id, qty) {
        const val = parseFloat(qty) || 0;
        try {
            await pantryApi.update(id, { quantity: val });
            setItems(items.map((i) => i.id === id ? { ...i, qty: val } : i));
        } catch (err) {
            console.error('Update failed');
        }
    }

    if (loading) return <div className="loading">Loading pantry...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div>
            <h1 className="section-title">My Pantry</h1>
            <p className="section-subtitle">
                Add what you already have at home · pantry items are deducted from your grocery list automatically
            </p>

            {/* Add form */}
            <form onSubmit={handleAdd} className={styles.addForm} noValidate>
                <div className={styles.formRow}>
                    <div className={styles.formField} style={{ flex: 2, position: 'relative' }} ref={suggestionRef}>
                        <label htmlFor="pantry-name">Ingredient</label>
                        <input
                            id="pantry-name"
                            type="text"
                            placeholder="e.g. Olive oil"
                            value={form.name}
                            onChange={handleNameChange}
                            onFocus={() => form.name.trim() && suggestions.length > 0 && setShowSuggestions(true)}
                            autoComplete="off"
                        />
                        {showSuggestions && (
                            <ul className={styles.suggestions}>
                                {suggestions.map((s) => (
                                    <li key={s} onClick={() => selectSuggestion(s)}>
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className={styles.formField}>
                        <label htmlFor="pantry-qty">Quantity</label>
                        <input
                            id="pantry-qty"
                            type="number"
                            min="0.01"
                            step="any"
                            placeholder="0"
                            value={form.qty}
                            onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
                        />
                    </div>
                    <div className={styles.formField}>
                        <label htmlFor="pantry-unit">Unit</label>
                        <select
                            id="pantry-unit"
                            value={form.unit}
                            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                        >
                            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div className={styles.formField}>
                        <label htmlFor="pantry-expiry">Expiry</label>
                        <input
                            id="pantry-expiry"
                            type="date"
                            value={form.expiry_date}
                            onChange={(e) => setForm((f) => ({ ...f, expiry_date: e.target.value }))}
                        />
                    </div>
                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.addBtn}`}
                        disabled={isAdding}
                    >
                        {isAdding ? 'Adding...' : '+ Add'}
                    </button>
                </div>
                {formError && <p className={styles.error}>{formError}</p>}
                {showSuccess && <p className={styles.success} style={{ color: 'var(--color-success, #22c55e)', fontWeight: 'bold' }}>✓ Added successfully!</p>}
            </form>

            <div className="divider" />

            {/* Pantry list */}
            {items.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🧀</div>
                    <p className="empty-state__text">Your pantry is empty. Add items above to get started.</p>
                </div>
            ) : (
                <ul className={styles.pantryList}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.pantryItem}>
                            <div className={styles.itemInfo}>
                                <span className={styles.itemName}>{item.name}</span>
                                {item.expiry_date && (() => {
                                    const info = getExpiryInfo(item.expiry_date);
                                    if (!info) return null;
                                    return (
                                        <span style={{ fontSize: '0.85em', color: info.color, fontWeight: info.fontWeight, marginLeft: '8px' }}>
                                            {info.text}
                                        </span>
                                    );
                                })()}
                            </div>
                            <div className={styles.itemControls}>
                                <input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={item.qty}
                                    onChange={(e) => handleUpdateQty(item.id, e.target.value)}
                                    className={styles.qtyInput}
                                    aria-label={`Quantity of ${item.name}`}
                                />
                                <span className={styles.unitLabel}>{item.unit}</span>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleRemove(item.id)}
                                    aria-label={`Remove ${item.name} from pantry`}
                                >
                                    🗑
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <div className={styles.footer}>
                <span className={styles.footerNote}>
                    💡 Tip: Pantry quantities are subtracted from your grocery list. Go to{' '}
                    <a href="/grocery">Grocery List</a> and enable "Deduct pantry items" to see the effect.
                </span>
            </div>
        </div>
    );
}
