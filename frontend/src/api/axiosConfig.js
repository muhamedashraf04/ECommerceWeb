// frontend/src/api/axiosConfig.js
import axios from 'axios';

// The URL from your api-docs.html
const BASE_URL = 'https://deployment.mangoisland-dd0744d7.italynorth.azurecontainerapps.io'; 

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically add the Token if the user is logged in
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;