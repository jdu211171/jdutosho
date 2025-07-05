import { columns } from '~/components/book-table/columns'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { useLoaderData } from '@remix-run/react'
import { DataTable } from '~/components/book-table/data-table'
import { useBooksQuery } from '~/hooks/use-books-query'
import type { BooksResponse, BooksPaginationMeta } from '~/types/books'
import { Button } from '~/components/ui/button'
import { Plus, Upload } from 'lucide-react'
import { BookQuickAddForm } from '~/components/book-quick-add-form'

export function meta() {
	return [
		{ title: 'Books Management' },
		{ description: 'Manage library books inventory' },
	]
}

type LoaderData = {
	data: BooksResponse['data']
	meta: BooksPaginationMeta
	error: string | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<BooksResponse>('/books/codes', {
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

	if (request.method !== 'DELETE') {
		return json(
			{ success: false, message: 'Method not allowed' },
			{ status: 405 }
		)
	}

	const formData = await request.formData()
	const bookId = formData.get('bookId')

	return await makeAuthenticatedRequest(request, async () => {
		await api.delete(`/books/${bookId}`)
		return json({ success: true })
	})
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
				<div className='flex gap-2'>
					<Button variant='outline' asChild>
						<a href='/librarian/books/bulk'>
							<Upload className='h-4 w-4 mr-2' />
							Bulk Import
						</a>
					</Button>
					<Button asChild>
						<a href='/librarian/books/new'>
							<Plus className='h-4 w-4 mr-2' />
							Add Book
						</a>
					</Button>
				</div>
			</div>

			<div className='grid gap-6 md:grid-cols-4'>
				<div className='md:col-span-1'>
					<BookQuickAddForm />
				</div>
				<div className='md:col-span-3'>
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
			</div>
		</div>
	)
}
