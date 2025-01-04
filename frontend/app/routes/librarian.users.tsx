import { Outlet } from '@remix-run/react'

export function meta() {
	return [
		{ title: 'Users' },
		{
			description:
				'View and manage librarian users in the library management system',
		},
	]
}

export default function LibrarianUsersLayout() {
	return <Outlet />
}
