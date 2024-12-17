import { useLoaderData, useRevalidator } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireStudentUser } from '~/services/auth.server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen, BookMarked, History, Clock } from 'lucide-react'
import { useEffect } from 'react'
import { Skeleton } from '~/components/ui/skeleton'

type DashboardData = {
	totalBorrowed: number
	availableBooks: number
	rentHistory: number
	averageRentDays: number
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireStudentUser(request)

	try {
		const response = await api.get<{ data: DashboardData }>(
			'/student/dashboard',
			{
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}
		)
		console.log(response.data)
		return { stats: response.data.data, timestamp: Date.now() }
	} catch (error) {
		return {
			stats: {
				totalBorrowed: 0,
				availableBooks: 0,
				rentHistory: 0,
				averageRentDays: 0,
			},
			timestamp: Date.now(),
		}
	}
}

function StatCard({
	title,
	value,
	description,
	icon: Icon,
	isLoading,
}: {
	title: string
	value: number | string
	description: string
	icon: typeof BookOpen
	isLoading?: boolean
}) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				<Icon className='h-4 w-4 text-muted-foreground shrink-0' />
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<>
						<Skeleton className='h-8 w-20 mb-1' />
						<Skeleton className='h-4 w-32' />
					</>
				) : (
					<>
						<div className='text-2xl font-bold'>{value}</div>
						<p className='text-xs text-muted-foreground'>{description}</p>
					</>
				)}
			</CardContent>
		</Card>
	)
}

export default function StudentDashboard() {
	const { stats, timestamp } = useLoaderData<typeof loader>()
	const { revalidate } = useRevalidator()

	// Revalidate data every 30 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			revalidate()
		}, 30000)

		return () => clearInterval(interval)
	}, [revalidate])

	const stats_config = [
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

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
				<p className='text-sm text-muted-foreground'>
					Last updated: {new Date(timestamp).toLocaleTimeString()}
				</p>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{stats_config.map(stat => (
					<StatCard key={stat.title} {...stat} />
				))}
			</div>
		</div>
	)
}
