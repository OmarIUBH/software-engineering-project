import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { recipesApi } from '../../services/recipesApi.js';
import { RecipeModal } from '../RecipeLibrary/RecipeLibrary.jsx';

export default function CommunityRecipes() {
    const { t } = useTranslation();
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    useEffect(() => {
        recipesApi.getCommunity()
            .then(data => {
                setRecipes(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>{t('community.loading', 'Loading Community Recipes...')}</div>;

    return (
        <div>
            <h1 className="section-title">{t('community.title', 'Community Recipes')}</h1>
            <p className="section-subtitle">{t('community.subtitle', 'Discover meals shared by other MealMate users globally!')}</p>
            
            {recipes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🌍</div>
                    <p className="empty-state__text">{t('community.empty', 'No community recipes yet. Be the first to share one!')}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    {recipes.map(r => (
                        <div 
                            key={r.id} 
                            className="card" 
                            style={{ 
                                padding: '15px 20px', 
                                cursor: 'pointer', 
                                transition: 'all 0.2s ease-in-out',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            onClick={() => setSelectedRecipe(r)}
                        >
                            <h3 style={{ margin: 0, color: 'var(--text-color)', fontSize: '1.2rem' }}>{r.name}</h3>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {t('community.shared_by', 'Shared by')}: {r.author_name || t('community.anonymous', 'Anonymous')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedRecipe && (
                <RecipeModal 
                    recipe={selectedRecipe} 
                    onClose={() => setSelectedRecipe(null)}
                    // We don't pass onSaveServings because it's a community recipe, but we could if we wanted to allow saving preferences for them too.
                />
            )}
        </div>
    );
}
