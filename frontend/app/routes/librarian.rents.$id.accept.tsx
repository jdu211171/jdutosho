import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { requireLibrarianUser } from '~/services/auth.server'
import { api } from '~/lib/api'

export async function action({ request, params }: ActionFunctionArgs) {
	const user = await requireLibrarianUser(request)
	const { id } = params

	try {
		await api.post(`/rents/${id}/accept`, null, {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		})

		return json({
			success: true,
			message: 'Return accepted successfully',
		})
	} catch (error: any) {
		console.error('Accept return error:', error.response?.data)
		return json(
			{
				success: false,
				message: error.response?.data?.message || 'Failed to accept return',
			},
			{
				status: error.response?.status || 500,
			}
		)
	}
}

export async function loader() {
	return redirect('/librarian/rents/pending')
}
