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
import { Menu } from 'lucide-react'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import { Footer } from '~/components/Footer'

export function meta() {
	return [
		{ title: 'Library Management System' },
		{
			description:
				'Efficient library resource management system for students and librarians',
		},
	]
}

export default function Index() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className='min-h-screen bg-background flex flex-col w-full'>
			{/* Navigation Bar */}
			<header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
				<div className='w-full px-4 flex h-14 items-center justify-between'>
					<NavLink to='/' className='flex items-center space-x-2'>
						<span className='font-bold text-sm sm:text-base md:text-lg'>
							Library Management System
						</span>
					</NavLink>
					<div className='flex items-center space-x-4'>
						<ModeToggle />
						<Sheet open={isOpen} onOpenChange={setIsOpen}>
							<SheetTrigger asChild>
								<Button variant='ghost' size='icon' className='md:hidden'>
									<Menu className='h-5 w-5' />
									<span className='sr-only'>Toggle menu</span>
								</Button>
							</SheetTrigger>
							<SheetContent side='right' className='w-[240px] sm:w-[300px]'>
								<nav className='flex flex-col space-y-4 mt-6'>
									<Button
										asChild
										variant='ghost'
										className='justify-start'
										onClick={() => setIsOpen(false)}
									>
										<NavLink to='/student'>Student Portal</NavLink>
									</Button>
									<Button
										asChild
										variant='ghost'
										className='justify-start'
										onClick={() => setIsOpen(false)}
									>
										<NavLink to='/librarian'>Librarian Portal</NavLink>
									</Button>
								</nav>
							</SheetContent>
						</Sheet>
						<nav className='hidden md:flex items-center space-x-4'>
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

			{/* Main Content */}
			<main className='flex-grow'>
				<div className='container mx-auto px-4 py-8 md:py-10'>
					{/* Hero Section */}
					<section className='mb-12'>
						<div className='flex flex-col items-center text-center gap-2'>
							<h1 className='text-2xl font-extrabold leading-tight tracking-tighter md:text-4xl'>
								Welcome to the Library Management System
							</h1>
							<p className='max-w-[700px] text-sm md:text-lg text-muted-foreground'>
								Efficiently manage and access library resources with our
								comprehensive system.
							</p>
						</div>
					</section>

					{/* Call to Action */}
					<section className='mb-12'>
						<div className='flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4'>
							<Button asChild size='lg' className='w-full sm:w-auto'>
								<NavLink to='/student'>Access Student Portal</NavLink>
							</Button>
							<Button
								asChild
								size='lg'
								variant='outline'
								className='w-full sm:w-auto'
							>
								<NavLink to='/librarian'>Access Librarian Portal</NavLink>
							</Button>
						</div>
					</section>

					{/* Features Section */}
					<section>
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
										Role-based access control with dedicated features for each
										user type.
									</p>
								</CardContent>
							</Card>
						</div>
					</section>
				</div>
			</main>
			<Footer />
		</div>
	)
}
