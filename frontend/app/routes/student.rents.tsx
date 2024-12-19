import { useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireStudentUser } from '~/services/auth.server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen } from 'lucide-react'
import type { RentBook } from '~/types/rents'
import { BorrowedBookCard } from '~/components/borrowed-book-card'

type LoaderData = {
	data: RentBook[]
	error: string | null
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireStudentUser(request)

	try {
		const response = await api.get<{ data: RentBook[] }>('/student/rents', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		})
		return json<LoaderData>({
			data: response.data.data,
			error: null,
		})
	} catch (error) {
		console.error('Error fetching borrowed books:', error)
		return json<LoaderData>(
			{
				data: [],
				error: 'Failed to fetch borrowed books',
			},
			{ status: 500 }
		)
	}
}

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireStudentUser(request)
	const formData = await request.formData()
	const bookId = formData.get('bookId')

	try {
		const response = await api.put(`/student/${bookId}/return`, null, {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		})

		return json({ success: response.status === 200 })
	} catch (error) {
		console.error('Return book error:', error)
		return json(
			{
				success: false,
				message: 'Failed to return book',
			},
			{ status: 500 }
		)
	}
}

export default function StudentBorrowedBooks() {
	const { data: books, error } = useLoaderData<typeof loader>()

	if (error) {
		return (
			<div className='p-4 bg-destructive/15 text-destructive rounded-md'>
				{error}
			</div>
		)
	}

	if (books.length === 0) {
		return (
			<Card className='mx-auto max-w-md text-center'>
				<CardHeader>
					<CardTitle>No Borrowed Books</CardTitle>
				</CardHeader>
				<CardContent>
					<BookOpen className='mx-auto h-12 w-12 text-muted-foreground opacity-50' />
					<p className='mt-4 text-sm text-muted-foreground'>
						You haven&#39;t borrowed any books yet.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
			{books.map(book => (
				<BorrowedBookCard key={book.id} book={book} />
			))}
		</div>
	)
}
