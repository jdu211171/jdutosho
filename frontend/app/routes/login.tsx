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
import { Form, json, Link, useNavigation } from '@remix-run/react'
import { ActionFunctionArgs } from '@remix-run/node'
import axios, { isAxiosError } from 'axios'
import { useActionData } from 'react-router'
import { LoginFormData, loginSchema } from '~/lib/validation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SessionData } from '~/types/auth'
import { createUserSession } from '~/services/auth.server'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const loginID = formData.get('loginID')
	const password = formData.get('password')

	try {
		const response = await axios.post<SessionData>(
			`${process.env.API_URL}/login`,
			{ loginID, password }
		)

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
	const navigation = useNavigation()
	const isSubmitting = navigation.state === 'submitting'
	const {
		register,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	})
	return (
		<div className='flex h-screen w-full items-center justify-center px-4'>
			<Card className='mx-auto max-w-sm'>
				<CardHeader>
					<CardTitle className='text-2xl'>Login</CardTitle>
					<CardDescription>
						Enter your login ID below to access your account
					</CardDescription>
					{actionData?.error && (
						<p className='text-sm font-medium text-red-500 dark:text-red-400'>
							{actionData.error}
						</p>
					)}
				</CardHeader>
				<CardContent>
					<Form method='post' className='grid gap-4'>
						<div className='grid gap-2'>
							<Label htmlFor='loginID'>Login ID</Label>
							<Input
								{...register('loginID')}
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
							<Input {...register('password')} id='password' type='password' />
							{errors.password && (
								<p className='text-sm text-red-500'>
									{errors.password.message}
								</p>
							)}
						</div>
						<Button type='submit' className='w-full' disabled={isSubmitting}>
							{isSubmitting ? 'Logging in...' : 'Login'}
						</Button>
						<Button variant='outline' className='w-full'>
							Login with Google
						</Button>
						<div className='mt-4 text-center text-sm'>
							Don&apos;t have an account?{' '}
							<Link to='#' className='underline'>
								Sign up
							</Link>
						</div>
					</Form>
				</CardContent>
			</Card>
		</div>
	)
}
