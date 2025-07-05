import { LucideIcon } from 'lucide-react'
import type { RentBook } from '~/types/rents'

export type LibrarianDashboardData = {
	totalBooks: number
	activeStudents: number
	totalRents: number
	averageRentDays: number
}

export type StudentDashboardData = {
	totalBorrowed: number
	availableBooks: number
	rentHistory: number
	averageRentDays: number
	borrowedBooks: RentBook[]
}

export type StatCardProps = {
	title: string
	value: number | string
	description: string
	icon: LucideIcon
	isLoading?: boolean
}
