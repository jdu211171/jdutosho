import type { LoaderFunctionArgs } from '@remix-run/node'
import { getSessionToken } from '~/services/auth.server'
import { api } from '~/lib/api'

interface Book {
	id: number
	code: string
}

interface ApiResponse {
	data: Book[]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const token = await getSessionToken(request)
	const url = new URL(request.url)
	const search = url.searchParams.get('q') || ''

	try {
		const response = await api.get<ApiResponse>('/books/codes', {
			params: {
				search,
				status: 'exist', // Only show available books
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		return {
			data: response.data.data,
			ok: true,
		}
	} catch (error: any) {
		return {
			data: [],
			ok: false,
			error: error.response?.data?.message || 'Failed to fetch books',
		}
	}
}
