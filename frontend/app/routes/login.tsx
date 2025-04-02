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
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { isAxiosError } from 'axios'
import { useActionData, useLoaderData, useNavigate } from 'react-router'
import type { LoginFormData } from '~/lib/validation'
import { loginSchema } from '~/lib/validation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SessionData } from '~/types/auth'
import { createUserSession } from '~/services/auth.server'
import { API_BASE_URL, api } from '~/lib/api'
import { ArrowLeft } from 'lucide-react'
import { Footer } from '~/components/Footer'
import { useIsomorphicLayoutEffect } from '~/utils/client-only-effects'

export function meta() {
	return [{ title: 'Login' }, { description: 'Login to your account' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	// Check for any error messages passed in the URL
	const url = new URL(request.url);
	const error = url.searchParams.get('error');

	if (error) {
		return json({ error });
	}

	return json({});
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const loginID = formData.get('loginID')
	const password = formData.get('password')

	if (!loginID || !password) {
		return json(
			{ error: 'Please enter your login ID and password' },
			{ status: 400 }
		)
	}

	try {
		// Check if loginID is an email or username
		const isEmail = loginID.toString().includes('@')
		const payload = isEmail
			? { email: loginID, password }
			: { username: loginID, password }

		const response = await api.post<SessionData>('/auth/login', payload)

		const { token, user } = response.data
		return createUserSession(token, user)
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
	const loaderData = useLoaderData() as { error?: string }
	const navigation = useNavigation()
	const navigate = useNavigate()
	const isSubmitting = navigation.state === 'submitting'
	const {
		register,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			loginID: '',
			password: '',
		},
	})

	const handleGoogleLogin = () => {
		 window.location.href = `${API_BASE_URL}/auth/redirect/google`;
	}

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
						Enter your login ID below to access your account
					</CardDescription>
					{(actionData?.error || loaderData?.error) && (
						<p className='text-sm font-medium text-red-500 dark:text-red-400'>
							{actionData?.error || loaderData?.error}
						</p>
					)}
				</CardHeader>
				<CardContent>
					<Form method='post' className='grid gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='loginID'>Login ID</Label>
							<Input
								{...register('loginID')}
								required
								id='loginID'
								placeholder='Enter your login ID'
							/>
							{errors.loginID && (
								<p className='text-sm text-red-500'>{errors.loginID.message}</p>
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
						<Button type='submit' className='w-full' disabled={isSubmitting}>
							{isSubmitting ? 'Logging in...' : 'Login'}
						</Button>
						<Button
							type="button"
							variant='outline'
							className='w-full'
							onClick={handleGoogleLogin}
						>
							Login with Google
						</Button>
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

