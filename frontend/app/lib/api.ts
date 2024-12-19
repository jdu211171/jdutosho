import axios from 'axios'

export const api = axios.create({
	baseURL: 'http://localhost:8000/api',
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
	}
})
