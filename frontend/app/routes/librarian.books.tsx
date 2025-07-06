import { Outlet } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireLibrarianUser } from '~/services/auth.server'

export function meta() {
	return [{ title: 'Librarian Books' }, { description: 'Librarian Books' }]
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	return null
}

export default function LibrarianBookLayout() {
	return <Outlet />
}
