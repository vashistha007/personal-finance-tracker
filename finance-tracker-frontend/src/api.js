import axios from 'axios';

const API = axios.create({ baseURL: 'https://personal-finance-tracker-wi3r.onrender.com/api' });

// Injects the security token automatically into headers for backend verification
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;