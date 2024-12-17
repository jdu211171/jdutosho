import { LoaderFunctionArgs } from '@remix-run/node'
import { getSessionToken } from '~/services/auth.server'
import { api } from '~/lib/api'

// Define our types for better type safety
interface Student {
	id: number
	loginID: string
}

interface ApiResponse {
	data: Student[]
}

export async function loader({ request }: LoaderFunctionArgs) {
	// Get authentication token
	const token = await getSessionToken(request)

	// Parse the search query
	const url = new URL(request.url)
	const search = url.searchParams.get('q') || ''

	try {
		// Make the API request to your Laravel backend
		const response = await api.get<ApiResponse>('/users/list', {
			params: { search },
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		// With Single Fetch, we can return the data directly
		// No need to wrap in json()
		return {
			data: response.data.data,
			ok: true,
		}
	} catch (error: any) {
		// Return a structured error response
		return {
			data: [],
			ok: false,
			error: error.response?.data?.message || 'Failed to fetch students',
		}
	}
}
