import type { LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData, useSearchParams } from '@remix-run/react'
import { studentBookColumns } from '~/components/book-table/columns'
import { DataTable } from '~/components/book-table/data-table'
import { api } from '~/lib/api'
import { requireStudentUser } from '~/services/auth.server'

type StudentBooksLoaderData = {
	data: any[]
	meta: any
	currentPage: number
	search: string
}

export async function loader({
	request,
}: LoaderFunctionArgs): Promise<StudentBooksLoaderData> {
	const user = await requireStudentUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	try {
		const token = user.token

		const response = await api.get<StudentBooksLoaderData>('/student/books', {
			params: {
				page,
				search,
			},
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		if (response.status !== 200) {
			throw new Error('Failed to fetch books')
		}
		return { ...response.data }
	} catch (error) {
		console.error('Error fetching books:', error)
		return { data: [], meta: {}, currentPage: 1, search: '' }
	}
}

export default function StudentBooksPage() {
	const { data, meta } = useLoaderData<typeof loader>()
	const [searchParams, setSearchParams] = useSearchParams()
	const pageCount = meta?.last_page || 1
	const currentPage = Number(searchParams.get('page')) || 1
	const initialSearch = searchParams.get('search') || ''

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
			}
			return prev
		})
	}

	return (
		<div>
			<DataTable
				columns={studentBookColumns}
				data={data}
				pageCount={pageCount}
				currentPage={currentPage}
				onPageChange={handlePageChange}
				onSearch={handleSearch}
				initialSearch={initialSearch}
			/>
		</div>
	)
}
