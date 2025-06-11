import { useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { api } from '~/lib/api'
import {
	requireStudentUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen } from 'lucide-react'
import type { RentBook } from '~/types/rents'
import { BorrowedBookCard } from '~/components/borrowed-book-card'

export function meta() {
	return [
		{ title: 'Borrowed Books' },
		{ description: 'List of books borrowed by the student' },
	]
}

type LoaderData = {
	data: RentBook[]
	error: string | null
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireStudentUser(request)

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<{ data: RentBook[] }>('/student/rents')

		return json<LoaderData>({
			data: response.data.data,
			error: null,
		})
	})
}

export async function action({ request }: ActionFunctionArgs) {
	await requireStudentUser(request)
	const formData = await request.formData()
	const bookId = formData.get('bookId')

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.put(`/student/${bookId}/return`, {
			action: 'return'
		})
		return json({ success: response.status === 200 })
	})
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
