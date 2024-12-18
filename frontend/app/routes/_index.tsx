import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { NavLink } from '@remix-run/react'
import { ModeToggle } from '~/components/mode-toggle'

export default function Index() {
	return (
		<div className='min-h-screen bg-background m-auto'>
			{/* Navigation Bar */}
			<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='container flex h-14 items-center'>
					<div className='mr-4 flex'>
						<NavLink to='/' className='mr-6 flex items-center space-x-2'>
							<span className='font-bold'>Library Management System</span>
						</NavLink>
					</div>
					<div className='flex flex-1 items-center justify-end space-x-4'>
						<nav className='flex items-center space-x-4'>
							<ModeToggle />
							<Button asChild variant='ghost'>
								<NavLink to='/student'>Student Portal</NavLink>
							</Button>
							<Button asChild variant='ghost'>
								<NavLink to='/librarian'>Librarian Portal</NavLink>
							</Button>
						</nav>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className='container grid items-center gap-6 pb-8 pt-6 md:py-10'>
				<div className='flex max-w-[980px] flex-col items-start gap-2'>
					<h1 className='text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl'>
						Welcome to the Library Management System
					</h1>
					<p className='max-w-[700px] text-lg text-muted-foreground'>
						Efficiently manage and access library resources with our
						comprehensive system.
					</p>
				</div>
			</section>

			{/* Features Section */}
			<section className='container py-8'>
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					<Card>
						<CardHeader>
							<CardTitle>Book Management</CardTitle>
							<CardDescription>
								Browse and manage the library's book collection
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-muted-foreground'>
								Add, edit, and track books in the library inventory.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Rental System</CardTitle>
							<CardDescription>
								Efficient book lending and return process
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-muted-foreground'>
								Manage book rentals, returns, and track pending requests.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>User Management</CardTitle>
							<CardDescription>
								Separate portals for students and librarians
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className='text-sm text-muted-foreground'>
								Role-based access control with dedicated features for each user
								type.
							</p>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Call to Action */}
			<section className='container py-8'>
				<div className='flex justify-center space-x-4'>
					<Button asChild size='lg'>
						<NavLink to='/student'>Access Student Portal</NavLink>
					</Button>
					<Button asChild size='lg' variant='outline'>
						<NavLink to='/librarian'>Access Librarian Portal</NavLink>
					</Button>
				</div>
			</section>
		</div>
	)
}

export function meta() {
	return [
		{ title: 'Library Management System' },
		{
			description:
				'Efficient library resource management system for students and librarians',
		},
	]
}
