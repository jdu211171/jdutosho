import { useLoaderData, useSearchParams } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireLibrarianUser } from '~/services/auth.server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen, CalendarDays, User } from 'lucide-react'

type RentBook = {
	id: number
	book_code: string
	status: string
	book: string
	taken_by: string
	given_by: string
	given_date: string
	passed_days: number
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	try {
		const response = await api.get<{ data: RentBook[] }>('/rents', {
			params: {
				page,
				search,
			},
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		})
		return {
			rents: response.data.data,
			meta: response.data.meta,
			currentPage: parseInt(page),
			search,
		}
	} catch (error) {
		console.error('Error fetching rents:', error)
		return { rents: [], meta: {}, currentPage: 1, search: '' }
	}
}

function RentCard({ rent }: { rent: RentBook }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-lg font-bold'>{rent.book}</CardTitle>
				<p className='text-sm text-muted-foreground'>Code: {rent.book_code}</p>
			</CardHeader>
			<CardContent className='space-y-3'>
				<div className='flex items-center space-x-2'>
					<User className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Borrowed by: {rent.taken_by}</span>
				</div>
				<div className='flex items-center space-x-2'>
					<User className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Given by: {rent.given_by}</span>
				</div>
				<div className='flex items-center space-x-2'>
					<CalendarDays className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>
						Borrowed on: {rent.given_date} ({rent.passed_days} days ago)
					</span>
				</div>
				<div className='flex items-center space-x-2'>
					<BookOpen className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Status: {rent.status}</span>
				</div>
			</CardContent>
		</Card>
	)
}

export default function LibrarianRentsPage() {
	const { rents, meta, currentPage, search } = useLoaderData<typeof loader>()
	const [, setSearchParams] = useSearchParams()

	const handlePageChange = (page: number) => {
		setSearchParams(prev => {
			prev.set('page', page.toString())
			return prev
		})
	}

	const handleSearch = (search: string) => {
		setSearchParams(prev => {
			if (search) {
				prev.set('search', search)
			} else {
				prev.delete('search')
			}
			prev.set('page', '1')
			return prev
		})
	}

	return (
		<div className='space-y-6'>
			<div className='flex justify-between items-center'>
				<h1 className='text-3xl font-bold'>All Rentals</h1>
				<div className='flex items-center gap-2'>
					<input
						type='text'
						placeholder='Search rentals...'
						className='px-3 py-1 border rounded-md'
						value={search}
						onChange={e => handleSearch(e.target.value)}
					/>
				</div>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{rents.map(rent => (
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
