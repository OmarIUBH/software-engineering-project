import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Auth.css';

export default function Login() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || t('auth.login_failed', 'Failed to login'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>{t('auth.login_title', 'Login to MealMate')}</h2>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label>{t('auth.email', 'Email')}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>{t('auth.password', 'Password')}</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>

                <button type="submit" disabled={loading} className="auth-btn">
                    {loading ? t('auth.logging_in', 'Logging in...') : t('nav.login', 'Login')}
                </button>
                <p>{t('auth.no_account', 'Don\'t have an account?')} <a href="/signup">{t('auth.sign_up', 'Sign up')}</a></p>
            </form>
        </div>
    );
}
