import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import {
	Form,
	Link,
	useActionData,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'
import {
	AlertCircle,
	CheckCircle,
	Eye,
	EyeOff,
	Loader2,
	Lock,
} from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
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
import { api } from '~/lib/api'
import { Alert, AlertDescription } from '~/components/ui/alert'

const resetPasswordSchema = z
	.object({
		token: z.string().min(1, 'Reset token is required'),
		email: z.string().email('Please enter a valid email address'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		password_confirmation: z.string(),
	})
	.refine(data => data.password === data.password_confirmation, {
		message: 'Passwords do not match',
		path: ['password_confirmation'],
	})

export async function loader({ request }: LoaderFunctionArgs) {
	// Check if user is already authenticated

	const url = new URL(request.url)
	const token = url.searchParams.get('token')
	const email = url.searchParams.get('email')

	if (!token || !email) {
		throw new Response('Invalid reset link', { status: 400 })
	}

	return json({ token, email })
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const data = {
		token: formData.get('token'),
		email: formData.get('email'),
		password: formData.get('password'),
		password_confirmation: formData.get('password_confirmation'),
	}

	try {
		const validatedData = resetPasswordSchema.parse(data)

		const response = await api.post('/auth/reset-password', validatedData)

		return json({
			success: true,
			message: response.data.message || 'Password reset successfully',
		})
	} catch (error: any) {
		if (error instanceof z.ZodError) {
			return json(
				{
					errors: error.errors.reduce(
						(acc, err) => ({
							...acc,
							[err.path[0]]: err.message,
						}),
						{}
					),
				},
				{ status: 400 }
			)
		}

		if (error.response?.data?.message) {
			return json(
				{
					error: error.response.data.message,
				},
				{ status: 400 }
			)
		}

		if (error.response?.data?.errors) {
			return json(
				{
					errors: error.response.data.errors,
				},
				{ status: 400 }
			)
		}

		return json(
			{
				error: 'Failed to reset password. Please try again.',
			},
			{ status: 500 }
		)
	}
}

export default function ResetPasswordPage() {
	const { token, email } = useLoaderData<typeof loader>()
	const actionData = useActionData<typeof action>()
	const navigation = useNavigation()
	const isSubmitting = navigation.state === 'submitting'

	const [showPassword, setShowPassword] = useState(false)
	const [showPasswordConfirmation, setShowPasswordConfirmation] =
		useState(false)

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'>
			<Card className='w-full max-w-md'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-2xl font-bold text-center'>
						Reset Password
					</CardTitle>
					<CardDescription className='text-center'>
						Enter your new password below
					</CardDescription>
				</CardHeader>
				<CardContent>
					{actionData?.success ? (
						<div className='space-y-4'>
							<Alert>
								<CheckCircle className='h-4 w-4' />
								<AlertDescription>{actionData.message}</AlertDescription>
							</Alert>
							<div className='text-center'>
								<Link
									to='/login'
									className='text-sm font-medium text-primary hover:underline'
								>
									Click here to sign in with your new password
								</Link>
							</div>
						</div>
					) : (
						<>
							{actionData?.error && (
								<Alert variant='destructive' className='mb-6'>
									<AlertCircle className='h-4 w-4' />
									<AlertDescription>{actionData.error}</AlertDescription>
								</Alert>
							)}

							<Form method='post' className='space-y-4'>
								<input type='hidden' name='token' value={token} />
								<input type='hidden' name='email' value={email} />

								<div className='space-y-2'>
									<Label htmlFor='email-display'>Email Address</Label>
									<Input
										id='email-display'
										type='email'
										value={email}
										disabled
										className='bg-gray-50 dark:bg-gray-800'
									/>
								</div>

								<div className='space-y-2'>
									<Label htmlFor='password'>New Password</Label>
									<div className='relative'>
										<Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
										<Input
											id='password'
											name='password'
											type={showPassword ? 'text' : 'password'}
											placeholder='Enter new password'
											required
											className='pl-10 pr-10'
											disabled={isSubmitting}
										/>
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
										>
											{showPassword ? (
												<EyeOff className='h-4 w-4' />
											) : (
												<Eye className='h-4 w-4' />
											)}
										</button>
									</div>
									{actionData?.errors?.password && (
										<p className='text-sm text-red-500'>
											{actionData.errors.password}
										</p>
									)}
								</div>

								<div className='space-y-2'>
									<Label htmlFor='password_confirmation'>
										Confirm Password
									</Label>
									<div className='relative'>
										<Lock className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
										<Input
											id='password_confirmation'
											name='password_confirmation'
											type={showPasswordConfirmation ? 'text' : 'password'}
											placeholder='Confirm new password'
											required
											className='pl-10 pr-10'
											disabled={isSubmitting}
										/>
										<button
											type='button'
											onClick={() =>
												setShowPasswordConfirmation(!showPasswordConfirmation)
											}
											className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
										>
											{showPasswordConfirmation ? (
												<EyeOff className='h-4 w-4' />
											) : (
												<Eye className='h-4 w-4' />
											)}
										</button>
									</div>
									{actionData?.errors?.password_confirmation && (
										<p className='text-sm text-red-500'>
											{actionData.errors.password_confirmation}
										</p>
									)}
								</div>

								<Button
									type='submit'
									className='w-full'
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2 className='mr-2 h-4 w-4 animate-spin' />
											Resetting...
										</>
									) : (
										'Reset Password'
									)}
								</Button>
							</Form>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
