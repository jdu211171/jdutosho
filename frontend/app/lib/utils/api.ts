import axios from 'axios'
import { logout } from './auth'

// Create axios instance with interceptors
export const api = axios.create({
	baseURL: process.env.API_URL,
	withCredentials: true,
})

// Response interceptor for global error handling
api.interceptors.response.use(
	response => response,
	error => {
		// Check for 401 (Unauthorized) errors
		if (error.response && error.response.status === 401) {
			// Global logout handler
			logout()
			return Promise.reject(error)
		}
		// Handle other error statuses
		return Promise.reject(error)
	}
)
