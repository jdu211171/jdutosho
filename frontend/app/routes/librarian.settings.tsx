import { Outlet } from '@remix-run/react'

export const metadata = {
	title: 'Forms',
	description: 'Advanced form example using react-hook-form and Zod.',
}

const sidebarNavItems = [
	{
		title: 'Account',
		href: '/examples/forms/account',
	},
	{
		title: 'Appearance',
		href: '/examples/forms/appearance',
	},
]

interface SettingsLayoutProps {
	children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
	return (
		<>
			<div className='md:hidden'></div>
			<div className='hidden p-4 pb-16 md:block'>
				<div className='flex flex-col space-y-4 lg:flex-row lg:space-x-12 lg:space-y-0'>
					<div className='flex-1 lg:max-w-2xl'>
						<Outlet />
					</div>
				</div>
			</div>
		</>
	)
}
