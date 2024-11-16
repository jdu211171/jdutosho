import { json, Outlet } from '@remix-run/react'
import { AppSidebar } from '~/components/app-sidebar'
import { SidebarTrigger } from '~/components/ui/sidebar'
import { LoaderFunction } from 'react-router'
import { requireLibrarianUser } from '~/services/auth.server'

export const loader: LoaderFunction = async ({ request }) => {
	const { user } = await requireLibrarianUser(request)
	return json({ user })
}

export default function StudentLayout() {
	return (
		<div className='flex'>
			{/* Sidebar */}
			<AppSidebar userRole='student' />

			{/* Main content area */}
			<main className='flex-1'>
				<SidebarTrigger />
				<Outlet />
			</main>
		</div>
	)
}
