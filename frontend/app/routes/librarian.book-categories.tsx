import { Outlet } from '@remix-run/react'

export function meta() {
	return [
		{ title: 'Book Categories' },
		{
			description:
				'View and manage book categories. Add, edit, and delete book categories.',
		},
	]
}

export function LibrarianBookLayout() {
	return <Outlet />
}
