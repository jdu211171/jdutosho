import { BookCopy, GraduationCap, Book, UsersRound, Library } from 'lucide-react'
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
				{ title: 'Pending Requests', url: '/librarian/rents/pending' },
				{ title: 'Borrowed Books', url: '/librarian/rents/borrowed' },
			],
		},
		{
			title: 'Categories',
			url: '/librarian/categories',
			icon: GraduationCap,
			items: [
				{ title: 'All Categories', url: '/librarian/categories' },
				{ title: 'Add New Category', url: '/librarian/categories/new' },
			],
		},
		{
			title: 'Students',
			url: '/librarian/students',
			icon: UsersRound,
			items: [
				{ title: 'All Students', url: '/librarian/students' },
				{ title: 'Add New Student', url: '/librarian/students/new' },
			],
		},
	],
	student: [
		{
			title: 'Books',
			url: '/student/books',
			icon: BookCopy,
			items: [
				{ title: 'Available Books', url: '/student/books' },
				{ title: 'My Borrowed Books', url: '/student/borrowed' },
				{ title: 'Rent History', url: '/student/history' },
			],
		},
	],
}
