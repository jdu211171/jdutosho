import { useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { Card, CardContent } from '~/components/ui/card'
import { BookOpen } from 'lucide-react'
import { useRentsQuery } from '~/hooks/use-rents-query'
import type { PendingReturnsResponse } from '~/types/rents'
import { ReturnRequestCard } from '~/components/return-request-card'

export function meta() {
	return [
		{ title: 'Pending Returns' },
		{ description: 'Review and process book return requests from students' },
	]
}

type LoaderData = {
	data: PendingReturnsResponse['data']
	meta: PendingReturnsResponse['meta']
	error: string | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<PendingReturnsResponse>('/rents/pending', {
			params: { page, search },
		})

		const meta = response.data.meta || {
			current_page: 1,
			last_page: 1,
			per_page: 10,
			total: 0,
		}

		return json<LoaderData>({
			data: response.data.data,
			meta,
			error: null,
		})
	})
}

export async function action({ request }: ActionFunctionArgs) {
	await requireLibrarianUser(request)
	const formData = await request.formData()
	const rentId = formData.get('rentId')

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.put(`/rents/${rentId}/accept`, null)
		return json({ success: response.status === 200 })
	})
}

export default function LibrarianRentsPendingPage() {
	const { data, meta, error } = useLoaderData<typeof loader>()
	const { currentPage, search, handlePageChange, handleSearch } =
		useRentsQuery()

	if (error) {
		return (
			<div className='p-4 bg-destructive/15 text-destructive rounded-md'>
				{error}
			</div>
		)
	}

	if (data.length === 0) {
		return (
			<div className='space-y-6'>
				<h1 className='text-3xl font-bold'>Pending Returns</h1>
				<Card className='mx-auto max-w-md text-center'>
					<CardContent className='pt-6'>
						<BookOpen className='mx-auto h-12 w-12 text-muted-foreground opacity-50' />
						<p className='mt-4 text-sm text-muted-foreground'>
							No pending returns at the moment
						</p>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<div>
					<h1 className='text-3xl font-bold'>Return Requests</h1>
					<p className='text-muted-foreground'>
						Review and process book return requests from students
					</p>
				</div>
				<input
					type='text'
					placeholder='Search returns...'
					className='px-3 py-1 border rounded-md'
					value={search}
					onChange={e => handleSearch(e.target.value)}
				/>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{data.map(pendingReturn => (
					<ReturnRequestCard
						key={pendingReturn.id}
						pendingReturn={pendingReturn}
					/>
				))}
			</div>

			{meta.last_page > 1 && (
				<div className='flex justify-center gap-2 mt-4'>
					{Array.from({ length: meta.last_page }, (_, i) => (
						<button
							key={i + 1}
							onClick={() => handlePageChange(i + 1)}
							className={`px-3 py-1 rounded ${
								currentPage === i + 1
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary'
							}`}
						>
							{i + 1}
						</button>
					))}
				</div>
			)}
		</div>
	)
}
