import { apiClient } from './apiClient';

export const authApi = {
    register: async (name, email, password) => {
        return apiClient.post('/auth/register', { name, email, password });
    },

    login: async (email, password) => {
        return apiClient.post('/auth/login', { email, password });
    }
};
