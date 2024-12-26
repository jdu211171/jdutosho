import { redirect } from '@remix-run/node'
import { useEffect } from 'react'
import { Form, useSubmit } from '@remix-run/react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { logout } from '~/services/auth.server'

export async function action({ request }: ActionFunctionArgs) {
  return await logout(request)
}

export async function loader({ request }: LoaderFunctionArgs) {
  // If they somehow get here via a normal page load, redirect them to home
  return redirect('/')
}

export default function LogoutRoute() {
  const submit = useSubmit()

  useEffect(() => {
    // Automatically submit the logout form when this component mounts
    const formData = new FormData()
    submit(formData, { method: 'post' })
  }, [submit])

  return null
}
