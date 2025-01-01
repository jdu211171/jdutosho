import type { LoaderFunctionArgs } from '@remix-run/node'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { api } from '~/lib/api'

interface Student {
	id: number
	loginID: string
}

interface ApiResponse {
	data: Student[]
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	const url = new URL(request.url)
	const search = url.searchParams.get('q') || ''

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<ApiResponse>('/users/list', {
			params: { search },
		})

		return {
			data: response.data.data,
			ok: true,
		}
	})
}
