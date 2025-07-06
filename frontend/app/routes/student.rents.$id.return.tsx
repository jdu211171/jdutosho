import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import { makeAuthenticatedRequest } from '~/services/auth.server'

export async function action({ request, params }: ActionFunctionArgs) {
	const formData = await request.formData()
	const action = formData.get('action')

	if (action !== 'return') {
		return json({ success: false, message: 'Invalid action' }, { status: 400 })
	}

	return await makeAuthenticatedRequest(request, async () => {
		try {
			await api.put(`/student/${params.id}/return`, {
				action: 'return',
			})
			return json({ success: true })
		} catch (error) {
			return json({ success: false }, { status: 400 })
		}
	})
}
