import { columns } from '~/components/book-table/columns'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import { getSessionToken } from 'app/services/auth.server'
import { useLoaderData } from '@remix-run/react'
import { DataTable } from '~/components/book-table/data-table'
import { useBooksQuery } from '~/hooks/use-books-query'
import type { BooksResponse, BooksPaginationMeta } from '~/types/books'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'

type LoaderData = {
	data: BooksResponse['data']
	meta: BooksPaginationMeta
	error: string | null
}

export const metadata = {
	title: 'Books Management',
	description: 'Manage library books inventory',
}

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const token = await getSessionToken(request)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	try {
		const response = await api.get<BooksResponse>('/books/codes', {
			params: {
				page,
				search,
			},
			headers: {
				Authorization: `Bearer ${token}`,
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
		console.error('API Error:', error)
		return json<LoaderData>(
			{
				error: 'Failed to fetch books',
				data: [],
				meta: {
					current_page: 1,
					last_page: 1,
					per_page: 10,
					total: 0,
				},
			},
			{
				status: 500,
			}
		)
	}
}

export default function BooksPage() {
	const { data, meta, error } = useLoaderData<typeof loader>()
	const { currentPage, search, handlePageChange, handleSearch } =
		useBooksQuery()

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
				<div>
					<h2 className='text-3xl font-bold'>Books</h2>
					<p className='text-muted-foreground'>Manage your books</p>
				</div>
				<Button asChild>
					<a href='/librarian/books/new'>
						<Plus className='h-4 w-4 mr-2' />
						Add Book
					</a>
        </Button>
			</div>

			<DataTable
				data={data}
				columns={columns}
				pageCount={meta.last_page}
				currentPage={currentPage}
				onPageChange={handlePageChange}
				onSearch={handleSearch}
				initialSearch={search}
			/>
		</div>
	)
}
