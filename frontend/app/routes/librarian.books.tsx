import { Outlet } from '@remix-run/react'

export function meta() {
	return [{ title: 'Librarian Books' }, { description: 'Librarian Books' }]
}

export default function LibrarianBookLayout() {
	return <Outlet />
}
