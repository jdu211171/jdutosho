import axios from 'axios';
import { logout } from './auth';
import * as process from "node:process";

// Create axios instance with interceptors
export const api = axios.create({
    baseURL: process.env.API_URL,
    withCredentials: true,
});

// Request interceptor (optional, for adding tokens)
api.interceptors.request.use(
    (config) => {
        // Add any global request modifications
        // For example, adding an auth token
        // const token = getAuthToken();
        // if (token) {
        //   config.headers['Authorization'] = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check for 401 (Unauthorized) errors
        if (error.response && error.response.status === 401) {
            // Global logout handler
            logout();

            // Optional: You can also dispatch a global notification
            // if you're using a state management solution
            return Promise.reject(error);
        }

        // Handle other error statuses
        return Promise.reject(error);
    }
);