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
import { DataTable } from '~/components/book-table/data-table'
import { columns } from '~/components/user-table/columns'
import { useBooksQuery } from '~/hooks/use-books-query'
import type { UsersResponse } from '~/types/users'

type LoaderData = {
	data: UsersResponse['data']
	meta: UsersResponse['meta']
	error: string | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	const url = new URL(request.url)
	const page = url.searchParams.get('page') || '1'
	const search = url.searchParams.get('search') || ''

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<UsersResponse>('/users', {
			params: { page, search },
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
	const userId = formData.get('userId')

	return await makeAuthenticatedRequest(request, async () => {
		await api.delete(`/users/${userId}`)
		return json({ success: true })
	})
}

export default function UsersPage() {
	const { data: users, meta, error } = useLoaderData<typeof loader>()
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
					<h1 className='text-3xl font-bold'>Users</h1>
					<p className='text-muted-foreground'>Manage student users</p>
				</div>
				<Button asChild>
					<a href='/librarian/users/new'>
						<Plus className='h-4 w-4 mr-2' />
						Add User
					</a>
				</Button>
			</div>

			<DataTable
				data={users}
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
