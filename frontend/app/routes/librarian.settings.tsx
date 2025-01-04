import { Outlet } from '@remix-run/react'

export function meta() {
	return [
		{ title: 'Settings' },
		{
			description: 'Advanced form example using react-hook-form and Zod.',
		},
	]
}

interface SettingsLayoutProps {
	children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
	return (
		<div className='p-4 pb-16'>
			<div className='flex flex-col space-y-4 lg:flex-row lg:space-x-12 lg:space-y-0'>
				<div className='flex-1 lg:max-w-2xl'>
					<Outlet />
				</div>
			</div>
		</div>
	)
}
