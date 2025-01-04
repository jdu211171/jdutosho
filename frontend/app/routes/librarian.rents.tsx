import { Outlet } from '@remix-run/react'

export function meta() {
	return [{ title: 'Librarian Rents' }, { description: 'Librarian Rents' }]
}

const librarianRents = () => {
	return (
		<div>
			<Outlet />
		</div>
	)
}

export default librarianRents
