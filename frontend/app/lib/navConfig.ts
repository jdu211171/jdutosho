import {
	BookCopy,
	GraduationCap,
	Book,
	UsersRound,
	Library,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
	title: string
	url: string
}

interface NavSection {
	title: string
	url: string
	icon: LucideIcon
	isActive?: boolean
	items: NavItem[]
}

interface Team {
	name: string
	logo: LucideIcon
	plan: string
}

interface NavConfig {
	teams: Team[]
	librarian: NavSection[]
	student: NavSection[]
}

export const navConfig: NavConfig = {
	teams: [
		{
			name: 'JDU Library',
			logo: Library,
			plan: 'Librarian',
		},
	],
	librarian: [
		{
			title: 'Books Management',
			url: '/librarian',
			icon: Book,
			items: [
				{ title: 'All Books', url: '/librarian/books' },
				{ title: 'Add New Book', url: '/librarian/books/new' },
			],
		},
		{
			title: 'Rentals',
			url: '/librarian/rents',
			icon: BookCopy,
			items: [
				{ title: 'All Rentals', url: '/librarian/rents' },
				{ title: 'Pending Returns', url: '/librarian/rents/pending' },
			],
		},
		{
			title: 'Categories',
			url: '/librarian/categories',
			icon: GraduationCap,
			items: [
				{ title: 'All Categories', url: '/librarian/book-categories' },
				{ title: 'Add Category', url: '/librarian/book-categories/new' },
			],
		},
		{
			title: 'Students',
			url: '/librarian/users',
			icon: UsersRound,
			items: [
				{ title: 'All Students', url: '/librarian/users' },
				{ title: 'Add Student', url: '/librarian/users/new' },
			],
		},
	],
	student: [
		{
			title: 'Books',
			url: '/student',
			icon: BookCopy,
			items: [
				{ title: 'Available Books', url: '/student/books' },
				{ title: 'My Borrowed Books', url: '/student/rents' },
			],
		},
	],
}
