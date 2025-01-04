import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { api } from '~/lib/api'

export function meta() {
	return [
		{ title: 'Accept Return' },
		{ description: 'Accept a return request' },
	]
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireLibrarianUser(request)
	const { id } = params

	return await makeAuthenticatedRequest(request, async () => {
		await api.post(`/rents/${id}/accept`, null)
		return json({
			success: true,
			message: 'Return accepted successfully',
		})
	})
}

export async function loader() {
	return redirect('/librarian/rents/pending')
}
