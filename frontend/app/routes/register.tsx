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
import type { RegisterFormData } from '~/lib/validation'
import { registerSchema } from '~/lib/validation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { SessionData } from '~/types/auth'
import { createUserSession } from '~/services/auth.server'
import { api } from '~/lib/api'
import { ArrowLeft } from 'lucide-react'

export function meta() {
  return [{ title: 'Register' }, { description: 'Create a new account' }]
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const full_name = formData.get('full_name')
  const username = formData.get('username')
  const email = formData.get('email') || null
  const password = formData.get('password')
  const password_confirmation = formData.get('password_confirmation')
  const role = formData.get('role') || 'student'

  if (!full_name || !username || !password || !password_confirmation) {
    return json(
      { error: 'Please complete all required fields' },
      { status: 400 }
    )
  }

  if (password !== password_confirmation) {
    return json(
      { error: 'Passwords do not match' },
      { status: 400 }
    )
  }

  try {
    const response = await api.post<SessionData>('/auth/register', {
      full_name,
      username,
      email,
      password,
      password_confirmation,
      role
    })

    const { token, user } = response.data
    return createUserSession(token, user)
  } catch (error) {
    if (isAxiosError(error)) {
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
  const navigation = useNavigation()
  const navigate = useNavigate()
  const isSubmitting = navigation.state === 'submitting'
  const {
    register,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'student',
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
          <CardTitle className='text-2xl'>Sign Up</CardTitle>
          <CardDescription>
            Please enter your details below to create your account.
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
              <Label htmlFor='full_name'>Full Name</Label>
              <Input
                {...register('full_name')}
                required
                id='full_name'
                name='full_name'
                placeholder='John Doe'
              />
              {errors.full_name && (
                <p className='text-sm text-red-500'>{errors.full_name.message}</p>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='username'>Username</Label>
              <Input
                {...register('username')}
                required
                id='username'
                name='username'
                placeholder='johndoe'
              />
              {errors.username && (
                <p className='text-sm text-red-500'>{errors.username.message}</p>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='email'>Email (optional)</Label>
              <Input
                {...register('email')}
                id='email'
                name='email'
                type='email'
                placeholder='john.doe@example.com'
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
                name='password'
                type='password'
                placeholder='Enter password'
              />
              {errors.password && (
                <p className='text-sm text-red-500'>{errors.password.message}</p>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='password_confirmation'>Confirm Password</Label>
              <Input
                {...register('password_confirmation')}
                required
                id='password_confirmation'
                name='password_confirmation'
                type='password'
                placeholder='Confirm password'
              />
              {errors.password_confirmation && (
                <p className='text-sm text-red-500'>{errors.password_confirmation.message}</p>
              )}
            </div>

            <input type="hidden" name="role" value="student" />

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Signing up...' : 'Sign Up'}
            </Button>

            <Button variant='outline' className='w-full' type="button"
              onClick={() => window.location.href = `${api.defaults.baseURL}/auth/redirect/google`}>
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
