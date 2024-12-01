import { columns } from '~/components/book-table/columns'
import { ActionFunctionArgs, json } from '@remix-run/node'
import { api } from '~/lib/api'
import { getSessionToken } from 'app/services/auth.server'
import { useLoaderData, useSearchParams } from '@remix-run/react'
import { DataTable } from '~/components/book-table/data-table'

export const metadata = {
	title: 'Tasks',
	description: 'A task and issue tracker build using Tanstack Table.',
}

export const loader = async ({ request }: ActionFunctionArgs) => {
	const url = new URL(request.url)
	const token = await getSessionToken(request)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	try {
		const response = await api.get(`/books/codes`, {
			params: {
				page,
				search,
			},
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		return json({
			data: response.data.data || [],
			meta: response.data.meta || {},
			currentPage: parseInt(page),
			search,
		})
	} catch (error) {
		console.error('API Error:', error)
		return json(
			{
				error: 'Failed to fetch books',
				data: [],
				meta: {},
				currentPage: 1,
				search: '',
			},
			{
				status: 500,
			}
		)
	}
}

export default function TaskPage() {
	const {
		data,
		meta,
		currentPage,
		search: initialSearch,
	} = useLoaderData<typeof loader>()
	const [searchParams, setSearchParams] = useSearchParams()
	const pageCount = meta?.last_page || 1

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

	if (!data) {
		return <div>No data available</div>
	}

	return (
		<DataTable
			data={data}
			columns={columns}
			pageCount={pageCount}
			currentPage={currentPage}
			onPageChange={handlePageChange}
			onSearch={handleSearch}
			initialSearch={initialSearch}
		/>
	)
}
