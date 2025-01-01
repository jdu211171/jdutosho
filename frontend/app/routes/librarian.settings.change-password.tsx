import { ActionFunctionArgs, json } from '@remix-run/node'
import { useActionData } from '@remix-run/react'
import { ChangePasswordForm } from '~/components/account/change-password-form'
import { Separator } from '~/components/ui/separator'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { api } from '~/lib/api'

interface ActionData {
	success: boolean
	message: string
}

export async function action({ request }: ActionFunctionArgs) {
	await requireLibrarianUser(request)
	const formData = await request.formData()
	const currentPassword = formData.get('currentPassword') as string
	const newPassword = formData.get('newPassword') as string
	const confirmPassword = formData.get('confirmPassword') as string

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.post<{ message: string }>('/change-password', {
			current_password: currentPassword,
			new_password: newPassword,
			new_password_confirmation: confirmPassword,
		})

		return json<ActionData>({
			success: true,
			message: response.data.message || 'Password changed successfully',
		})
	})
}

export default function SettingsChangePasswordPage() {
	const actionData = useActionData<typeof action>()

	return (
		<div className='space-y-6'>
			<div>
				<h3 className='text-lg font-medium'>Change Password</h3>
				<p className='text-sm text-muted-foreground'>
					Change your password to keep your account secure. Make sure to use a
					strong password that you don't use elsewhere.
				</p>
			</div>
			<Separator />
			<ChangePasswordForm actionData={actionData} />
		</div>
	)
}
