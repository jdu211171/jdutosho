import { useLoaderData } from '@remix-run/react'
import { LoaderFunctionArgs } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireStudentUser } from '~/services/auth.server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { CalendarDays, BookOpen, User } from 'lucide-react'

type BorrowedBook = {
	id: number
	book_code: string
	status: string
	book: string
	taken_by: string
	given_by: string
	given_date: string
	passed_days: number
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const user = await requireStudentUser(request)

	try {
		const response = await api.get<{ data: BorrowedBook[] }>('/student/rents', {
			headers: {
				Authorization: `Bearer ${user.token}`,
			},
		})
		return { books: response.data.data }
	} catch (error) {
		return { books: [] }
	}
}

export default function StudentBorrowedBooks() {
	const { books } = useLoaderData<typeof loader>()

	if (books.length === 0) {
		return (
			<Card className='mx-auto max-w-md text-center'>
				<CardHeader>
					<CardTitle>No Borrowed Books</CardTitle>
				</CardHeader>
				<CardContent>
					<BookOpen className='mx-auto h-12 w-12 text-muted-foreground opacity-50' />
					<p className='mt-4 text-sm text-muted-foreground'>
						You haven't borrowed any books yet.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
			{books.map(book => (
				<Card key={book.id}>
					<CardHeader>
						<CardTitle className='text-lg font-bold'>{book.book}</CardTitle>
						<p className='text-sm text-muted-foreground'>
							Code: {book.book_code}
						</p>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='flex items-center space-x-2'>
							<User className='h-4 w-4 text-muted-foreground' />
							<span className='text-sm'>Given by: {book.given_by}</span>
						</div>
						<div className='flex items-center space-x-2'>
							<CalendarDays className='h-4 w-4 text-muted-foreground' />
							<span className='text-sm'>
								Borrowed on: {book.given_date} ({book.passed_days} days ago)
							</span>
						</div>
						<div className='flex items-center space-x-2'>
							<BookOpen className='h-4 w-4 text-muted-foreground' />
							<span className='text-sm'>Status: {book.status}</span>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
