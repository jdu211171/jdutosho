import { useLoaderData, useRevalidator } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { api } from '~/lib/api'
import {
	requireStudentUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { useEffect } from 'react'
import { StatCard } from '~/components/dashboard/stat-card'
import { getStudentDashboardConfig } from '~/config/dashboard'
import type { StudentDashboardData } from '~/types/dashboard'

export function meta() {
	return [
		{ title: 'Dashboard' },
		{ description: 'Student dashboard for JDUTOSHO' },
	]
}

const REFRESH_INTERVAL = 30000 // 30 seconds

export async function loader({ request }: LoaderFunctionArgs) {
	await requireStudentUser(request)

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<{ data: StudentDashboardData }>(
			'/student/dashboard'
		)

		return {
			stats: response.data.data,
			timestamp: Date.now(),
			error: null,
		}
	})
}

export default function StudentDashboard() {
	const { stats, timestamp, error } = useLoaderData<typeof loader>()
	const { revalidate } = useRevalidator()

	useEffect(() => {
		const interval = setInterval(revalidate, REFRESH_INTERVAL)
		return () => clearInterval(interval)
	}, [revalidate])

	const statsConfig = getStudentDashboardConfig(stats)

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h2 className='text-3xl font-bold tracking-tight'>Dashboard</h2>
				<p className='text-sm text-muted-foreground'>
					Last updated: {new Date(timestamp).toLocaleTimeString()}
				</p>
			</div>

			{error && (
				<div className='bg-destructive/15 text-destructive p-4 rounded-md'>
					{error}
				</div>
			)}

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				{statsConfig.map(stat => (
					<StatCard key={stat.title} {...stat} />
				))}
			</div>
		</div>
	)
}
