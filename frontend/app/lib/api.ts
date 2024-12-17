import axios from 'axios'

export const api = axios.create({
	baseURL:
		typeof window !== 'undefined' ? window.ENV.API_URL : process.env.API_URL,
})
