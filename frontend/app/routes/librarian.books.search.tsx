import type { LoaderFunctionArgs } from '@remix-run/node'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { api } from '~/lib/api'

interface Book {
	id: number
	code: string
}

interface ApiResponse {
	data: Book[]
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	const url = new URL(request.url)
	const search = url.searchParams.get('q') || ''

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<ApiResponse>('/books/codes', {
			params: {
				search,
				status: 'exist', // Only show available books
			},
		})

		return {
			data: response.data.data,
			ok: true,
		}
	})
}
