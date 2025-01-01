import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useActionData, useNavigate } from '@remix-run/react'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { toast } from '~/hooks/use-toast'

type ActionData = {
	error?: string
	fieldErrors?: {
		name?: string
		loginID?: string
		password?: string
	}
}

export async function action({ request }: ActionFunctionArgs) {
	await requireLibrarianUser(request)
	const formData = await request.formData()
	const name = formData.get('name')
	const loginID = formData.get('loginID')
	const password = formData.get('password')

	const fieldErrors: ActionData['fieldErrors'] = {}
	if (!name) fieldErrors.name = 'Name is required'
	if (!loginID) fieldErrors.loginID = 'Login ID is required'
	if (!password) fieldErrors.password = 'Password is required'
	if (password && password.toString().length < 6) {
		fieldErrors.password = 'Password must be at least 6 characters'
	}

	if (Object.keys(fieldErrors).length > 0) {
		return json<ActionData>({ fieldErrors }, { status: 400 })
	}

	return await makeAuthenticatedRequest(request, async () => {
		try {
			await api.post('/users', {
				name,
				loginID,
				password,
				role: 'student',
			})

			return redirect('/librarian/users')
		} catch (error: any) {
			// Check if error is about duplicate login_id
			if (error.response?.data?.message?.includes('loginID')) {
				return json<ActionData>(
					{
						fieldErrors: {
							loginID: 'This Login ID is already taken',
						},
					},
					{ status: 400 }
				)
			}
			throw error // Let makeAuthenticatedRequest handle other errors
		}
	})
}

export default function NewUserPage() {
	const actionData = useActionData<ActionData>()
	const navigate = useNavigate()

	if (actionData?.error) {
		toast({
			title: 'Error',
			description: actionData.error,
			variant: 'destructive',
		})
	}

	return (
		<div className='mx-auto max-w-lg'>
			<Card>
				<CardHeader>
					<CardTitle>New Student</CardTitle>
					<CardDescription>Create a new student account</CardDescription>
				</CardHeader>
				<CardContent>
					<form method='post' className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Full Name</Label>
							<Input
								id='name'
								name='name'
								placeholder='Enter student name'
								required
							/>
							{actionData?.fieldErrors?.name && (
								<p className='text-sm text-destructive'>
									{actionData.fieldErrors.name}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='loginID'>Login ID</Label>
							<Input
								id='loginID'
								name='loginID'
								placeholder='Enter login ID'
								required
							/>
							{actionData?.fieldErrors?.loginID && (
								<p className='text-sm text-destructive'>
									{actionData.fieldErrors.loginID}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								name='password'
								type='password'
								placeholder='Enter password'
								required
							/>
							{actionData?.fieldErrors?.password && (
								<p className='text-sm text-destructive'>
									{actionData.fieldErrors.password}
								</p>
							)}
						</div>

						<div className='flex gap-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => navigate(-1)}
							>
								Cancel
							</Button>
							<Button type='submit'>Create Student</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
