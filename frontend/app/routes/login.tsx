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
import { Form, Link, useNavigation } from '@remix-run/react'
import type { ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { isAxiosError } from 'axios'
import { useActionData, useNavigate } from 'react-router'
import type { LoginFormData } from '~/lib/validation'
import { loginSchema } from '~/lib/validation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SessionData } from '~/types/auth'
import { createUserSession } from '~/services/auth.server'
import { api } from '~/lib/api'
import { transformBackendUser } from '~/lib/user-transform'
import { ArrowLeft } from 'lucide-react'
import { Footer } from '~/components/Footer'
import { useSearchParams, useLoaderData } from '@remix-run/react'
import { LoaderFunctionArgs } from '@remix-run/node'
import { useState } from 'react'
import { GoogleIcon } from '~/components/icons/google-icon'
import { FacebookIcon } from '~/components/icons/facebook-icon'

export function meta() {
	return [{ title: 'Login' }, { description: 'Login to your account' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const error = url.searchParams.get('error')
	const returnTo = url.searchParams.get('returnTo')

	// Get OAuth URLs from backend
	let googleAuthUrl = null
	let facebookAuthUrl = null

	try {
		const [googleResponse, facebookResponse] = await Promise.all([
			api.get('/auth/oauth-url/google').catch(() => null),
			api.get('/auth/oauth-url/facebook').catch(() => null),
		])

		googleAuthUrl = googleResponse?.data?.url || null
		facebookAuthUrl = facebookResponse?.data?.url || null
	} catch (error) {
		console.error('Failed to get OAuth URLs:', error)
	}

	return json({ error, googleAuthUrl, facebookAuthUrl, returnTo })
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const username = formData.get('username')
	const password = formData.get('password')
	const returnTo = formData.get('returnTo')

	if (!username || !password) {
		return json(
			{ error: 'Please enter your username and password' },
			{ status: 400 }
		)
	}

	try {
		const response = await api.post('/auth/login', {
			username,
			password,
		})

		const { token, user } = response.data
		const transformedUser = transformBackendUser(user)
		return createUserSession(
			token,
			transformedUser,
			returnTo ? String(returnTo) : null
		)
	} catch (error) {
		if (isAxiosError(error)) {
			return json(
				{ error: error.response?.data?.message || 'Invalid credentials' },
				{ status: 400 }
			)
		}
		return json({ error: 'Login failed' }, { status: 500 })
	}
}

export default function LoginPage() {
	const actionData = useActionData() as { error?: string }
	const loaderData = useLoaderData<typeof loader>()
	const navigation = useNavigation()
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const isSubmitting = navigation.state === 'submitting'
	const [isGoogleLoading, setIsGoogleLoading] = useState(false)
	const [isFacebookLoading, setIsFacebookLoading] = useState(false)
	const {
		register,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			username: '',
			password: '',
		},
	})
	return (
		<div className='relative flex h-screen w-full items-center justify-center px-4'>
			<Button
				variant='ghost'
				onClick={() => navigate('/')}
				className='absolute left-4 top-4'
			>
				<ArrowLeft className='mr-2 h-4 w-4' />
				Go Back
			</Button>
			<Card className='mx-auto max-w-sm'>
				<CardHeader>
					<CardTitle className='text-2xl'>Login</CardTitle>
					<CardDescription>
						Enter your username below to access your account
					</CardDescription>
					{(actionData?.error ||
						loaderData?.error ||
						searchParams.get('error')) && (
						<p className='text-sm font-medium text-red-500 dark:text-red-400'>
							{actionData?.error ||
								loaderData?.error ||
								searchParams.get('error')}
						</p>
					)}
				</CardHeader>
				<CardContent>
					<Form method='post' className='grid gap-4'>
						{loaderData?.returnTo && (
							<input
								type='hidden'
								name='returnTo'
								value={loaderData.returnTo}
							/>
						)}
						<div className='grid gap-2'>
							<Label htmlFor='username'>Username</Label>
							<Input
								{...register('username')}
								required
								id='username'
								placeholder='Enter your username'
							/>
							{errors.username && (
								<p className='text-sm text-red-500'>
									{errors.username.message}
								</p>
							)}
						</div>
						<div className='grid gap-2'>
							<div className='flex items-center'>
								<Label htmlFor='password'>Password</Label>
								<Link to='#' className='ml-auto inline-block text-sm underline'>
									Forgot your password?
								</Link>
							</div>
							<Input
								{...register('password')}
								required
								id='password'
								type='password'
								placeholder='Enter password'
							/>
							{errors.password && (
								<p className='text-sm text-red-500'>
									{errors.password.message}
								</p>
							)}
						</div>
						<div className='text-right mb-4'>
							<Link
								to='/forgot-password'
								className='text-sm text-primary hover:underline'
							>
								Forgot password?
							</Link>
						</div>
						<Button type='submit' className='w-full' disabled={isSubmitting}>
							{isSubmitting ? 'Logging in...' : 'Login'}
						</Button>

						{(loaderData?.googleAuthUrl || loaderData?.facebookAuthUrl) && (
							<>
								<div className='relative'>
									<div className='absolute inset-0 flex items-center'>
										<span className='w-full border-t' />
									</div>
									<div className='relative flex justify-center text-xs uppercase'>
										<span className='bg-background px-2 text-muted-foreground'>
											Or continue with
										</span>
									</div>
								</div>

								<div className='grid gap-2'>
									{loaderData?.googleAuthUrl && (
										<Button
											variant='outline'
											className='w-full'
											disabled={isGoogleLoading || isFacebookLoading}
											onClick={() => {
												setIsGoogleLoading(true)
												const url = new URL(loaderData.googleAuthUrl)
												if (loaderData?.returnTo) {
													url.searchParams.set('state', loaderData.returnTo)
												}
												window.location.href = url.toString()
											}}
										>
											<GoogleIcon className='mr-2 h-4 w-4' />
											{isGoogleLoading
												? 'Redirecting...'
												: 'Continue with Google'}
										</Button>
									)}

									{loaderData?.facebookAuthUrl && (
										<Button
											variant='outline'
											className='w-full'
											disabled={isGoogleLoading || isFacebookLoading}
											onClick={() => {
												setIsFacebookLoading(true)
												const url = new URL(loaderData.facebookAuthUrl)
												if (loaderData?.returnTo) {
													url.searchParams.set('state', loaderData.returnTo)
												}
												window.location.href = url.toString()
											}}
										>
											<FacebookIcon className='mr-2 h-4 w-4' />
											{isFacebookLoading
												? 'Redirecting...'
												: 'Continue with Facebook'}
										</Button>
									)}
								</div>
							</>
						)}
						<div className='mt-4 text-center text-sm'>
							Don&apos;t have an account?{' '}
							<Link to='/register' className='underline'>
								Sign up
							</Link>
						</div>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
