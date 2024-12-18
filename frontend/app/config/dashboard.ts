import { BookOpen, Users, History, Clock, BookMarked } from 'lucide-react'
import type { LibrarianDashboardData, StudentDashboardData } from '~/types/dashboard'

export const getLibrarianDashboardConfig = (stats: LibrarianDashboardData) => [
	{
		title: 'Total Books',
		value: stats.totalBooks,
		description: 'Books in library',
		icon: BookOpen,
	},
	{
		title: 'Active Students',
		value: stats.activeStudents,
		description: 'Students with borrowed books',
		icon: Users,
	},
	{
		title: 'Total Rents',
		value: stats.totalRents,
		description: 'All time rentals',
		icon: History,
	},
	{
		title: 'Average Rent Time',
		value: `${stats.averageRentDays} days`,
		description: 'Per book',
		icon: Clock,
	},
]

export const getStudentDashboardConfig = (stats: StudentDashboardData) => [
	{
		title: 'Currently Borrowed',
		value: stats.totalBorrowed,
		description: 'Active books',
		icon: BookMarked,
	},
	{
		title: 'Available Books',
		value: stats.availableBooks,
		description: 'Books you can borrow',
		icon: BookOpen,
	},
	{
		title: 'Total Borrowed',
		value: stats.rentHistory,
		description: 'All time borrows',
		icon: History,
	},
	{
		title: 'Average Rent Time',
		value: `${stats.averageRentDays} days`,
		description: 'Per book',
		icon: Clock,
	},
]
