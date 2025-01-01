import { useLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { useRentsQuery } from '~/hooks/use-rents-query'
import { RentCard } from '~/components/rent-card'
import { Input } from '~/components/ui/input'
import { RentsResponseSchema } from '~/types/rents'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { BookOpen } from 'lucide-react'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get('/rents', {
			params: { page, search },
		})

		// Validate response data
		const result = RentsResponseSchema.safeParse(response.data)
		if (!result.success) {
			throw new Error('Invalid response data')
		}

		return json({
			data: result.data.data,
			meta: result.data.meta,
			error: null,
		})
	})
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

	if (data.length === 0) {
		return (
			<div className='space-y-6'>
				<h1 className='text-3xl font-bold'>All Rentals</h1>
				<Card className='mx-auto max-w-md text-center'>
					<CardContent className='pt-6'>
						<BookOpen className='mx-auto h-12 w-12 text-muted-foreground opacity-50' />
						<p className='mt-4 text-sm text-muted-foreground'>
							No rentals at the moment
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
					<h1 className='text-3xl font-bold'>All Rentals</h1>
					<p className='text-muted-foreground'>View and manage book rentals</p>
				</div>
				<Input
					type='text'
					placeholder='Search rentals...'
					className='max-w-xs'
					value={search}
					onChange={e => handleSearch(e.target.value)}
				/>
			</div>

			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{data?.map((rent: any) => <RentCard key={rent.id} rent={rent} />)}
			</div>

			{meta.last_page > 1 && (
				<div className='flex justify-center gap-2 mt-4'>
					{Array.from({ length: meta.last_page }, (_, i) => (
						<Button
							key={i + 1}
							onClick={() => handlePageChange(i + 1)}
							className={`px-3 py-1 rounded ${
								currentPage === i + 1
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary'
							}`}
						>
							{i + 1}
						</Button>
					))}
				</div>
			)}
		</div>
	)
}
