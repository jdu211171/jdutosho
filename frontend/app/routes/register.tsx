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
import { json } from '@remix-run/node'
import { isAxiosError } from 'axios'
import { useActionData, useLoaderData, useNavigate } from 'react-router'
import type { RegisterFormData } from '~/lib/validation'
import { registerSchema } from '~/lib/validation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SessionData } from '~/types/auth'
import { createUserSession } from '~/services/auth.server'
import { API_BASE_URL, api } from '~/lib/api'
import { ArrowLeft } from 'lucide-react'
import { useIsomorphicLayoutEffect } from '~/utils/client-only-effects'

export function meta() {
  return [{ title: 'Register' }, { description: 'Create a new account' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
  // Check for any error messages passed in the URL
  const url = new URL(request.url)
  const error = url.searchParams.get('error')

  if (error) {
    return json({ error })
  }

  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const username = formData.get('username')
  const full_name = formData.get('full_name')
  const email = formData.get('email')
  const password = formData.get('password')
  const password_confirmation = formData.get('password_confirmation')

  if (!username || !full_name || !password || !password_confirmation) {
    return json(
      { error: 'Please fill in all required fields' },
      { status: 400 }
    )
  }

  try {
    const response = await api.post<SessionData>('/auth/register', {
      username,
      full_name,
      email,
      password,
      password_confirmation,
    })

    const { token, user } = response.data
    return createUserSession(token, user)
  } catch (error) {
    if (isAxiosError(error)) {
      const messages: Record<string, string[]> = error.response?.data?.errors
      if (messages) {
        const formattedErrors = Object.entries(messages).map(
          ([field, messages]) => `${field}: ${messages.join(', ')}`
        )
        return json(
          { error: formattedErrors.join('; ') },
          { status: 400 }
        )
      }
      return json(
        { error: error.response?.data?.message || 'Registration failed' },
        { status: 400 }
      )
    }
    return json({ error: 'Registration failed' }, { status: 500 })
  }
}

export default function RegisterPage() {
  const actionData = useActionData() as { error?: string }
  const loaderData = useLoaderData() as { error?: string }
  const navigation = useNavigation()
  const navigate = useNavigate()
  const isSubmitting = navigation.state === 'submitting'
  const {
    register,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  })

  useIsomorphicLayoutEffect(() => {
    if (loaderData?.error) {
      console.error('Failed to register with Google')
    }
  }, [loaderData])

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE_URL}/auth/redirect/google`
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
      <Card className='mx-auto w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl'>Create an Account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
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
              <Label htmlFor='username'>Username</Label>
              <Input
                {...register('username')}
                required
                id='username'
                placeholder='Enter your username'
              />
              {errors.username && (
                <p className='text-sm text-red-500'>{errors.username.message}</p>
              )}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='full_name'>Full Name</Label>
              <Input
                {...register('full_name')}
                required
                id='full_name'
                placeholder='Enter your full name'
              />
              {errors.full_name && (
                <p className='text-sm text-red-500'>{errors.full_name.message}</p>
              )}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email (Optional)</Label>
              <Input
                {...register('email')}
                id='email'
                type='email'
                placeholder='Enter your email'
              />
              {errors.email && (
                <p className='text-sm text-red-500'>{errors.email.message}</p>
              )}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Password</Label>
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
            <div className='grid gap-2'>
              <Label htmlFor='password_confirmation'>Confirm Password</Label>
              <Input
                {...register('password_confirmation')}
                required
                id='password_confirmation'
                type='password'
                placeholder='Confirm your password'
              />
              {errors.password_confirmation && (
                <p className='text-sm text-red-500'>
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>
            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </Button>
            <Button
              type="button"
              variant='outline'
              className='w-full'
              onClick={handleGoogleRegister}
            >
              Sign up with Google
            </Button>
            <div className='mt-4 text-center text-sm'>
              Already have an account?{' '}
              <Link to='/login' className='underline'>
                Login
              </Link>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
