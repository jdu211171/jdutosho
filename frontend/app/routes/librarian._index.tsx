import { useLoaderData, useRevalidator } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireLibrarianUser } from '~/services/auth.server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen, Users, History, Clock } from 'lucide-react'
import { useEffect } from 'react'
import { Skeleton } from '~/components/ui/skeleton'

type DashboardData = {
	totalBooks: number
	activeStudents: number
	totalRents: number
	averageRentDays: number
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireLibrarianUser(request)

	try {
		const response = await api.get<{ data: DashboardData }>(
			'/librarian/dashboard',
			{
				headers: {
					Authorization: `Bearer ${user.token}`,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)
		return { stats: response.data.data, timestamp: Date.now() }
	} catch (error) {
		console.error('Auth error:', error)
		return {
			stats: {
				totalBooks: 0,
				activeStudents: 0,
				totalRents: 0,
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

export default function LibrarianDashboard() {
	const { stats, timestamp } = useLoaderData<typeof loader>()
	const { revalidate } = useRevalidator()

	useEffect(() => {
		const interval = setInterval(() => {
			revalidate()
		}, 30000)

		return () => clearInterval(interval)
	}, [revalidate])

	const stats_config = [
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
