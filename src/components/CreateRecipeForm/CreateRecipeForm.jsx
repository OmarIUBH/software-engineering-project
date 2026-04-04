import { useState, useEffect } from 'react';
import { recipesApi } from '../../services/recipesApi.js';
import { apiClient } from '../../services/apiClient.js';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function CreateRecipeForm() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [instructions, setInstructions] = useState('');
    const [servings, setServings] = useState(2);
    const [isPublic, setIsPublic] = useState(false);
    const [authorName, setAuthorName] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [ingName, setIngName] = useState('');
    const [ingQty, setIngQty] = useState('');
    const [ingUnit, setIngUnit] = useState('pcs');
    const [loading, setLoading] = useState(false);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [scrapeUrl, setScrapeUrl] = useState('');
    const [scraping, setScraping] = useState(false);

    useEffect(() => {
        apiClient.get('/ingredients')
            .then(data => setAvailableIngredients(data || []))
            .catch(err => console.error('Failed to load ingredients', err));
    }, []);

    function handleAddIngredient(e) {
        e.preventDefault();
        if (!ingName) return;
        setIngredients([...ingredients, { name: ingName, quantity: parseFloat(ingQty) || 1, unit: ingUnit }]);
        setIngName('');
        setIngQty('');
        setIngUnit('pcs');
    }

    function handleRemoveIngredient(index) {
        setIngredients(ingredients.filter((_, i) => i !== index));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const newRecipe = {
            title,
            instructions,
            default_servings: servings,
            is_public: isPublic,
            author_name: isPublic ? authorName : 'Unknown',
            ingredients: ingredients,
            tags: []
        };

        try {
            await recipesApi.create(newRecipe);
            setLoading(false);
            if (isPublic) {
                navigate('/community');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save recipe');
            setLoading(false);
        }
    }

    async function handleScrape() {
        if (!scrapeUrl) return;
        setScraping(true);
        try {
            const data = await apiClient.post('/scrape', { url: scrapeUrl });
            if (data) {
                setTitle(data.title || '');
                setInstructions(data.instructions || '');
                if (data.ingredients && data.ingredients.length > 0) {
                    const knownUnits = ['g', 'ml', 'tbsp', 'tsp', 'cup', 'cups', 'oz', 'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds', 'can', 'cans', 'clove', 'cloves', 'piece', 'pieces', 'pinch', 'dash', 'slice', 'slices'];
                    
                    const parsedIngs = data.ingredients.map(raw => {
                        const match = raw.trim().match(/^((?:\d+\s+)?\d+(?:\.\d+)?(?:[/]\d+)?|\d+)?\s*([a-zA-Z]+)?\s*(.*)/);
                        if (!match) return { name: raw, quantity: 1, unit: 'pcs' };
                        
                        let qtyStr = match[1];
                        let unit = match[2] ? match[2].toLowerCase() : '';
                        let name = match[3] || raw;
                    
                        let quantity = 1;
                        if (qtyStr) {
                            qtyStr = qtyStr.trim();
                            if (qtyStr.includes(' ')) {
                                const [whole, frac] = qtyStr.split(' ');
                                const [num, den] = frac.split('/');
                                quantity = parseInt(whole) + (parseInt(num) / parseInt(den));
                            } else if (qtyStr.includes('/')) {
                                const [num, den] = qtyStr.split('/');
                                quantity = parseInt(num) / parseInt(den);
                            } else {
                                quantity = parseFloat(qtyStr);
                            }
                        } else {
                            // If there isn't a number at the start, don't force a unit
                            return { name: raw, quantity: '', unit: '' };
                        }
                    
                        if (unit && !knownUnits.includes(unit)) {
                            name = unit + ' ' + name;
                            unit = '';
                        }
                        
                        if (isNaN(quantity)) quantity = 1;
                        name = name.replace(/^of\s+/i, '').trim();
                    
                        return {
                            name: name,
                            quantity: Math.round(quantity * 100) / 100,
                            unit: unit
                        };
                    });
                    setIngredients(parsedIngs);
                }
            }
        } catch (err) {
            alert('Failed to import recipe from URL.');
        } finally {
            setScraping(false);
        }
    }

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h1 className="section-title">{t('recipes.create_new', 'Create a Recipe')}</h1>
            <p className="section-subtitle">Add your own recipe to MealMate</p>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', padding: '15px', backgroundColor: '#eef2ff', borderRadius: '8px' }}>
                <input 
                    type="url" 
                    placeholder="Auto-fill from URL (e.g. foodnetwork.com)" 
                    value={scrapeUrl} 
                    onChange={e => setScrapeUrl(e.target.value)} 
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #c7d2fe' }}
                />
                <button 
                    type="button" 
                    onClick={handleScrape} 
                    disabled={scraping || !scrapeUrl} 
                    style={{ padding: '10px 15px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    {scraping ? 'Importing...' : t('recipes.import_btn', 'Import')}
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{t('recipes.recipe_title', 'Recipe Title')}</label>
                    <input 
                        type="text" 
                        required 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        className="form-input" 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{t('recipes.ingredients', 'Ingredients')}</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input type="text" list="ingredients-list" placeholder="Ingredient name (e.g. Tomato)" value={ingName} onChange={e => setIngName(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <datalist id="ingredients-list">
                            {availableIngredients.map(ing => (
                                <option key={ing.id} value={ing.name} />
                            ))}
                        </datalist>
                        <input type="number" placeholder="Qty" value={ingQty} onChange={e => setIngQty(e.target.value)} style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <select value={ingUnit} onChange={e => setIngUnit(e.target.value)} style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                            <option value="pcs">pcs</option>
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                            <option value="tbsp">tbsp</option>
                            <option value="tsp">tsp</option>
                            <option value="cup">cup</option>
                        </select>
                        <button onClick={handleAddIngredient} className="btn btn-secondary" type="button" style={{ padding: '8px 15px' }}>Add</button>
                    </div>
                    {ingredients.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {ingredients.map((ing, i) => (
                                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                                    <span>
                                        {ing.quantity !== '' && ing.quantity !== null ? ing.quantity + ' ' : ''}
                                        {ing.unit && ing.unit !== 'pcs' ? ing.unit + ' ' : ''}
                                        {ing.name}
                                    </span>
                                    <button type="button" onClick={() => handleRemoveIngredient(i)} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{t('recipes.instructions', 'Instructions (One per line)')}</label>
                    <textarea 
                        required 
                        rows={5} 
                        value={instructions} 
                        onChange={(e) => setInstructions(e.target.value)} 
                        className="form-textarea"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Default Servings</label>
                    <input 
                        type="number" 
                        min="1" 
                        value={servings} 
                        onChange={(e) => setServings(parseInt(e.target.value) || 1)} 
                        style={{ width: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                    <input 
                        type="checkbox" 
                        id="isPublic" 
                        checked={isPublic} 
                        onChange={(e) => setIsPublic(e.target.checked)} 
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="isPublic" style={{ fontWeight: 'bold' }}>Share with Community?</label>
                </div>

                {isPublic && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Author Name</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="How should others know you?"
                            value={authorName} 
                            onChange={(e) => setAuthorName(e.target.value)} 
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                        />
                    </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px', fontSize: '1.1rem' }}>
                    {loading ? 'Saving...' : '💾 Save Recipe'}
                </button>
            </form>
        </div>
    );
}
