// Import Axios
import axios from 'axios';

// Create an Axios instance with a base URL
const api = axios.create({
    baseURL: 'http://localhost:8000/api/',  // Ensure this matches your backend server URL
    headers: {
        'Content-Type': 'application/json',
    },
});


// Optional: Add an interceptor to automatically add the Authorization header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
