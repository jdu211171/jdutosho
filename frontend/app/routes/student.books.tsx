import type { LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { studentBookColumns } from '~/components/book-table/columns'
import { DataTable } from '~/components/book-table/data-table'
import { useBooksQuery } from '~/hooks/use-books-query'
import { api } from '~/lib/api'
import {
	requireStudentUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import type { BooksResponse, BooksPaginationMeta } from '~/types/books'

export function meta() {
	return [
		{ title: 'Books' },
		{ description: 'List of books available for students' },
	]
}

type LoaderData = {
	data: BooksResponse['data']
	meta: BooksPaginationMeta
	error: string | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireStudentUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<BooksResponse>('/student/books', {
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

export default function StudentBooksPage() {
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
		<div className='space-y-4'>
			<div className='flex justify-between items-center'>
				<h2 className='text-3xl font-bold tracking-tight'>Books</h2>
			</div>

			<DataTable
				columns={studentBookColumns}
				data={data}
				pageCount={meta.last_page}
				currentPage={currentPage}
				onPageChange={handlePageChange}
				onSearch={handleSearch}
				initialSearch={search}
			/>
		</div>
	)
}
