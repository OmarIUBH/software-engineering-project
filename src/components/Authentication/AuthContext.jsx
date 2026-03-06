import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../../services/authApi';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('mealmate_token');
        const savedUser = localStorage.getItem('mealmate_user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await authApi.login(email, password);
        localStorage.setItem('mealmate_token', response.token);
        localStorage.setItem('mealmate_user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const register = async (name, email, password) => {
        const response = await authApi.register(name, email, password);
        localStorage.setItem('mealmate_token', response.token);
        localStorage.setItem('mealmate_user', JSON.stringify(response.user));
        setUser(response.user);
    };

    const logout = () => {
        localStorage.removeItem('mealmate_token');
        localStorage.removeItem('mealmate_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
