import { useLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireLibrarianUser } from '~/services/auth.server'
import { Card, CardContent } from '~/components/ui/card'
import { BookOpen } from 'lucide-react'
import { useRentsQuery } from '~/hooks/use-rents-query'
import type { PendingReturnsResponse } from '~/types/rents'
import { ReturnRequestCard } from '~/components/return-request-card'

type LoaderData = {
	data: PendingReturnsResponse['data']
	meta: PendingReturnsResponse['meta']
	error: string | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	try {
		const response = await api.get<PendingReturnsResponse>('/rents/pending', {
			params: { page, search },
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
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
	} catch (error) {
		console.error('Error fetching pending returns:', error)
		return json<LoaderData>(
			{
				data: [],
				meta: {
					current_page: 1,
					last_page: 1,
					per_page: 10,
					total: 0,
				},
				error: 'Failed to fetch pending returns',
			},
			{ status: 500 }
		)
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireLibrarianUser(request)
	const formData = await request.formData()
	const rentId = formData.get('rentId')
	const loginId = formData.get('loginId')
	const bookCode = formData.get('bookCode')
	const action = formData.get('action')

	try {
		if (action === 'reject') {
			return json({ success: false, message: 'Reject not implemented yet' })
		}

		const response = await api.put(
			`/rents/${rentId}/accept`,
			{
				login_id: loginId,
				book_code: bookCode,
			},
			{
				headers: {
					Authorization: `Bearer ${user.token}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			}
		)

		return json({ success: response.status === 200 })
	} catch (error: any) {
		console.error('Accept return error:', error)
		return json({
			success: false,
			message: error.response?.data?.message || 'Failed to process return',
		})
	}
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
