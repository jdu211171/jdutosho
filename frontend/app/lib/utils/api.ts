import axios from 'axios'

// Create axios instance with interceptors
export const api = axios.create({
	baseURL: process.env.API_URL,
	withCredentials: true,
})
