import axios from 'axios';

const apiClient = axios.create({
    baseURL: '', // Defaults to proxy
    headers: {
        "Content-type": "application/json"
    }
});

// Add a request interceptor to include the Auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Or however you store your JWT
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;