import axios from 'axios'

// Define API base URL
export const API_BASE_URL = 'http://localhost:8000/api'
// export const API_BASE_URL = 'https://jdutosho.uz/api'

export const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
})
