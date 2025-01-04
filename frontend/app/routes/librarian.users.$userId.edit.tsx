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
import {
	useActionData,
	useLoaderData,
	useNavigate,
	useFetcher,
} from '@remix-run/react'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { toast } from '~/hooks/use-toast'
import type { User } from '~/types/users'
import { useEffect } from 'react'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'

export function meta() {
	return [
		{ title: 'Update User Profile' },
		{
			description:
				'Update user account details in the library management system',
		},
	]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	const userId = params.userId

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<{ data: User }>(`/users/${userId}`)
		return json({ user: response.data.data })
	})
}

type ActionData = {
	error?: string
	success?: boolean
	message?: string
	fieldErrors?: {
		name?: string
		loginID?: string
		password?: string
		role?: string
	}
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireLibrarianUser(request)
	const formData = await request.formData()
	const name = formData.get('name')
	const loginID = formData.get('loginID')
	const password = formData.get('password')?.toString()
	const role = formData.get('role')
	const userId = params.userId

	const fieldErrors: ActionData['fieldErrors'] = {}
	if (!name) fieldErrors.name = 'Name is required'
	if (!loginID) fieldErrors.loginID = 'Login ID is required'
	if (!role) fieldErrors.role = 'Role is required'
	if (password && password.length < 6) {
		fieldErrors.password = 'Password must be at least 6 characters'
	}

	if (Object.keys(fieldErrors).length > 0) {
		return json<ActionData>({ fieldErrors }, { status: 400 })
	}

	return await makeAuthenticatedRequest(request, async () => {
		const updateData: Record<string, any> = {
			name,
			loginID,
			role,
		}

		if (password && password.trim() !== '') {
			updateData.password = password
		}

		// Handle validation errors from API
		try {
			await api.put(`/users/${userId}`, updateData)
			return redirect('/librarian/users')
		} catch (error: any) {
			if (error.response?.status === 422) {
				const errors = error.response.data.errors
				const fieldErrors: ActionData['fieldErrors'] = {}

				if (errors.name) fieldErrors.name = errors.name[0]
				if (errors.loginID) fieldErrors.loginID = errors.loginID[0]
				if (errors.password) fieldErrors.password = errors.password[0]
				if (errors.role) fieldErrors.role = errors.role[0]

				return json<ActionData>({ fieldErrors }, { status: 422 })
			}
			throw error
		}
	})
}

export default function EditUserPage() {
	const { user } = useLoaderData<typeof loader>()
	const actionData = useActionData<ActionData>()
	const navigate = useNavigate()
	const fetcher = useFetcher()

	useEffect(() => {
		if (actionData?.error) {
			toast({
				title: 'Error',
				description: actionData.error,
				variant: 'destructive',
			})
		} else if (actionData?.success) {
			toast({
				title: 'Success',
				description: actionData.message,
			})
			navigate('/librarian/users')
		}
	}, [actionData, navigate])

	return (
		<div className='mx-auto max-w-lg'>
			<Card>
				<CardHeader>
					<CardTitle>Edit User</CardTitle>
					<CardDescription>Update user account details</CardDescription>
				</CardHeader>
				<CardContent>
					<fetcher.Form method='post' className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Full Name</Label>
							<Input
								id='name'
								name='name'
								defaultValue={user.name}
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
								defaultValue={user.loginID}
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
							<Label htmlFor='role'>Role</Label>
							<Select name='role' defaultValue={user.role}>
								<SelectTrigger>
									<SelectValue placeholder='Select role' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='student'>Student</SelectItem>
									<SelectItem value='librarian'>Librarian</SelectItem>
								</SelectContent>
							</Select>
							{actionData?.fieldErrors?.role && (
								<p className='text-sm text-destructive'>
									{actionData.fieldErrors.role}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<Label htmlFor='password'>New Password (optional)</Label>
							<Input
								id='password'
								name='password'
								type='password'
								placeholder='Enter new password'
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
							<Button type='submit'>Update User</Button>
						</div>
					</fetcher.Form>
				</CardContent>
			</Card>
		</div>
	)
}
