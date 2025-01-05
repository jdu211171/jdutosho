import { Footer } from './Footer'

interface LayoutProps {
	children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
	return (
		<div className='flex flex-col min-h-screen'>
			<main className='flex-grow'>{children}</main>
			<Footer />
		</div>
	)
}
