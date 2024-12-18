import { useLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireLibrarianUser } from '~/services/auth.server'
import { useRentsQuery } from '~/hooks/use-rents-query'
import type { RentBook, RentsResponse } from '~/types/rents'
import { RentCard } from '~/components/rent-card'

type LoaderData = {
	data: RentBook[]
	meta: RentsResponse['meta']
	error: string | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	try {
		const response = await api.get<RentsResponse>('/rents', {
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
		console.error('Error fetching rents:', error)
		return json<LoaderData>(
			{
				data: [],
				meta: {
					current_page: 1,
					last_page: 1,
					per_page: 10,
					total: 0,
				},
				error: 'Failed to fetch rentals',
			},
			{ status: 500 }
		)
	}
}

export default function LibrarianRentsPage() {
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

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-bold'>All Rentals</h1>
				<input
					type='text'
					placeholder='Search rentals...'
					className='px-3 py-1 border rounded-md'
					value={search}
					onChange={e => handleSearch(e.target.value)}
				/>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{data.map(rent => (
					<RentCard key={rent.id} rent={rent} />
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
