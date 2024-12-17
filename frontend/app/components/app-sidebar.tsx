import type * as React from 'react'
import {
	Book,
	Library,
	UsersRound,
	BookCopy,
	GraduationCap,
} from 'lucide-react'
import { NavUser } from '~/components/nav-user'
import { NavMain } from '~/components/nav-main'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '~/components/ui/sidebar'
import type { User } from '~/types/auth'
import { TeamSwitcher } from './team-switcher'

const navConfig = {
	teams: [
		{
			name: 'JDU Library',
			logo: Library,
			plan: 'Librarian', // Plan visible in TeamSwitcher
		},
	],
	librarian: [
		{
			title: 'Books Management',
			url: '#',
			icon: Book,
			isActive: true,
			items: [
				{
					title: 'All Books',
					url: '/librarian/books', // View all books
				},
				{
					title: 'Add New Book',
					url: '/librarian/books/new', // Add a new book
				},
				{
					title: 'Pending Requests',
					url: '/librarian/rents/pending', // View pending book rents
				},
				{
					title: 'Borrowed Books',
					url: '/librarian/rents/borrowed', // Track borrowed books
				},
			],
		},
		{
			title: 'Categories',
			url: '#',
			icon: GraduationCap,
			items: [
				{
					title: 'All Categories',
					url: '/librarian/categories', // Manage book categories
				},
				{
					title: 'Add New Category',
					url: '/librarian/categories/new', // Add a new book category
				},
			],
		},
		{
			title: 'Students',
			url: '#',
			icon: UsersRound,
			items: [
				{
					title: 'All Students',
					url: '/librarian/students', // List all students
				},
				{
					title: 'Add New Student',
					url: '/librarian/students/new', // Add a new student
				},
			],
		},
	],
	student: [
		{
			title: 'Books',
			url: '#',
			icon: BookCopy,
			isActive: true,
			items: [
				{
					title: 'Available Books',
					url: '/student/books', // View all available books
				},
				{
					title: 'My Borrowed Books',
					url: '/student/rents/borrowed', // View student's borrowed books
				},
				{
					title: 'Rent History',
					url: '/student/rents/history', // View rent history
				},
			],
		},
	],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	user: User
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
	const navItems = navConfig[user.role] || []

	return (
		<Sidebar className='z-20' collapsible='icon' {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={navConfig.teams} userRole={user.role} />
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={navItems} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	)
}
