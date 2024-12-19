import { useLoaderData } from '@remix-run/react'
import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireLibrarianUser } from '~/services/auth.server'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
import type { CategoriesResponse } from '~/types/categories'
import { useBooksQuery } from '~/hooks/use-books-query'
import { DataTable } from '~/components/book-table/data-table'
import { columns } from '~/components/category-table/columns'
import { toast } from '~/hooks/use-toast'

type LoaderData = {
	data: CategoriesResponse['data']
	meta: CategoriesResponse['meta']
	error: string | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	try {
		const response = await api.get<CategoriesResponse>('/book-categories', {
			params: { page, search },
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		})

		return json<LoaderData>({
			data: response.data.data,
			meta: response.data.meta,
			error: null,
		})
	} catch (error) {
		console.error('Error fetching categories:', error)
		return json<LoaderData>(
			{
				data: [],
				meta: {
					current_page: 1,
					last_page: 1,
					per_page: 10,
					total: 0,
				},
				error: 'Failed to fetch categories',
			},
			{ status: 500 }
		)
	}
}

export async function action({ request }: ActionFunctionArgs) {
	if (request.method !== 'DELETE') {
		return json(
			{ success: false, error: 'Method not allowed' },
			{ status: 405 }
		)
	}

	const user = await requireLibrarianUser(request)
	const formData = await request.formData()
	const categoryId = formData.get('categoryId')

	try {
		await api.delete(`/book-categories/${categoryId}`, {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		})

		toast({
			title: 'Success',
			description: 'Category deleted successfully',
		})

		return json({ success: true })
	} catch (error: any) {
		console.error('Delete category error:', error)
		return json(
			{
				success: false,
				error: error.response?.data?.message || 'Failed to delete category',
			},
			{ status: 500 }
		)
	}
}

export default function BookCategoriesPage() {
	const { data: categories, meta, error } = useLoaderData<typeof loader>()
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
				initialSearch={search}
			/>
		</div>
	)
}
