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
  const name = formData.get('name')
  const username = formData.get('loginID')
  const password = formData.get('password')
  const password_confirmation = formData.get('password_confirmation')

  if (!name || !username || !password || !password_confirmation) {
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
    const response = await api.post<SessionData>('/register', {
      name,
      username,
      password,
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
      name: '',
      loginID: '',
      password: '',
      password_confirmation: '',
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
              <Label htmlFor='name'>Name</Label>
              <Input
                {...register('name')}
                required
                id='name'
                placeholder='John Doe'
              />
              {errors.name && (
                <p className='text-sm text-red-500'>{errors.name.message}</p>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='loginID'>Username</Label>
              <Input
                {...register('loginID')}
                required
                id='loginID'
                placeholder='johndoe'
              />
              {errors.loginID && (
                <p className='text-sm text-red-500'>{errors.loginID.message}</p>
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
                <p className='text-sm text-red-500'>{errors.password.message}</p>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='password_confirmation'>Confirm Password</Label>
              <Input
                {...register('password_confirmation')}
                required
                id='password_confirmation'
                type='password'
                placeholder='Confirm password'
              />
              {errors.password_confirmation && (
                <p className='text-sm text-red-500'>{errors.password_confirmation.message}</p>
              )}
            </div>

            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Signing up...' : 'Sign Up'}
            </Button>

            <Button variant='outline' className='w-full'>
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
