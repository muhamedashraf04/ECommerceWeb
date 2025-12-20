import axios from 'axios';

const apiClient = axios.create({
    // Use environment variable; fall back to '/api' for local proxy
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api', 
    headers: {
        "Content-type": "application/json"
    }
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;