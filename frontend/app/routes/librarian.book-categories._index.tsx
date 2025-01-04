import { useLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
import type { CategoriesResponse } from '~/types/categories'
import { DataTable } from '~/components/book-table/data-table'
import { columns } from '~/components/category-table/columns'
import { useCategoryQuery } from '~/hooks/use-category-query'

export function meta() {
	return [
		{ title: 'Book Categories' },
		{ description: 'Manage book categories' },
	]
}

type LoaderData = {
	data: CategoriesResponse['data']
	meta: CategoriesResponse['meta']
	error: string | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const query = url.searchParams.get('query') || ''

	return await makeAuthenticatedRequest(request, async () => {
		const endpoint = query ? '/book-categories/search' : '/book-categories'
		const response = await api.get<CategoriesResponse>(endpoint, {
			params: { page, query },
		})

		return json<LoaderData>({
			data: response.data.data,
			meta: response.data.meta,
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
	const categoryId = formData.get('categoryId')

	return await makeAuthenticatedRequest(request, async () => {
		await api.delete(`/book-categories/${categoryId}`)
		return json({ success: true })
	})
}

export default function BookCategoriesPage() {
	const { data: categories, meta, error } = useLoaderData<typeof loader>()
	const { currentPage, query, handlePageChange, handleSearch } =
		useCategoryQuery()

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
					<h1 className='text-3xl font-bold'>Book Categories</h1>
					<p className='text-muted-foreground'>Manage your book categories</p>
				</div>
				<Button asChild>
					<a href='/librarian/book-categories/new'>
						<Plus className='h-4 w-4 mr-2' />
						Add Category
					</a>
				</Button>
			</div>

			<DataTable
				data={categories}
				columns={columns}
				pageCount={meta.last_page}
				currentPage={currentPage}
				onPageChange={handlePageChange}
				onSearch={handleSearch}
				initialSearch={query}
			/>
		</div>
	)
}
