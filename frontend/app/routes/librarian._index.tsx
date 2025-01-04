import { useLoaderData, useRevalidator } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { useEffect } from 'react'
import { StatCard } from '~/components/dashboard/stat-card'
import { getLibrarianDashboardConfig } from '~/config/dashboard'
import type { LibrarianDashboardData } from '~/types/dashboard'

export function meta() {
	return [{ title: 'Dashboard' }, { description: 'Librarian dashboard' }]
}

const REFRESH_INTERVAL = 30000 // 30 seconds

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<{ data: LibrarianDashboardData }>(
			'/librarian/dashboard'
		)
		return { stats: response.data.data, timestamp: Date.now(), error: null }
	})
}

export default function LibrarianDashboard() {
	const { stats, timestamp, error } = useLoaderData<typeof loader>()
	const { revalidate } = useRevalidator()

	useEffect(() => {
		const interval = setInterval(revalidate, REFRESH_INTERVAL)
		return () => clearInterval(interval)
	}, [revalidate])

	const statsConfig = getLibrarianDashboardConfig(stats)

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
				{statsConfig.map((stat: any) => (
					<StatCard key={stat.title} {...stat} />
				))}
			</div>
		</div>
	)
}
