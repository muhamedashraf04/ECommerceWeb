import axios from 'axios';

// Ensure this matches your backend URL
const BASE_URL = 'http://localhost:5193';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// THE SHIELD: This stops the crash
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        // CHECK: Is it actually a token, or is it HTML garbage?
        if (token.startsWith('<') || token.includes('doctype')) {
            console.warn("Garbage token detected. Deleting it.");
            localStorage.removeItem('token');
            // Do NOT attach the header, just let the request go (or fail gracefully)
        } else {
            // It looks safe, attach it
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;