import axios from 'axios'
import { booksResponseSchema } from '~/components/book-table/schema'

export const api = axios.create({
	baseURL: process.env.API_URL,
})

export const fetchBooks = async (token: string, page: number = 1) => {
	const response = await api.get(`/books?page=${page}`, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	})

	return booksResponseSchema.parse(response.data)
}
