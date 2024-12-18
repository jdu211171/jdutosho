import { useFetcher, useLoaderData } from '@remix-run/react'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { api } from '~/lib/api'
import { requireStudentUser } from '~/services/auth.server'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen, CalendarDays, User } from 'lucide-react'
import { toast } from '~/hooks/use-toast'
import { useEffect } from 'react'

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

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireStudentUser(request)
	const formData = await request.formData()
	const bookId = formData.get('bookId')

	try {
		const response = await api.put(
			`/student/${bookId}/return`,
			null, // empty body
			{
				headers: {
					Authorization: `Bearer ${user.token}`,
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
			}
		)

		if (response.status !== 200) {
			return { success: false }
		}
		return { success: true }
	} catch (error) {
		console.error('Return book error:', error)
		return { success: false }
	}
}

function BookCard({ book }: { book: BorrowedBook }) {
	const fetcher = useFetcher<{ success: boolean }>()
	const isReturning = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.success === true) {
			toast({
				title: 'Book returned successfully',
				description: 'The book has been returned successfully',
			})
		} else if (fetcher.state === 'idle' && fetcher.data?.success === false) {
			toast({
				title: 'Failed to return book',
				variant: 'destructive',
				description: 'Failed to return the book',
			})
		}
	}, [fetcher.state, fetcher.data?.success])

	return (
		<Card key={book.id}>
			<CardHeader>
				<CardTitle className='text-lg font-bold'>{book.book}</CardTitle>
				<p className='text-sm text-muted-foreground'>Code: {book.book_code}</p>
			</CardHeader>
			<CardContent className='space-y-3'>
				<div className='flex items-center space-x-2'>
					<User className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Given by: {book.given_by}</span>
				</div>
				<div className='flex items-center space-x-2'>
					<CalendarDays className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>
						Borrowed on: {book.given_date} ({book.passed_days} days ago)
					</span>
				</div>
				<div className='flex items-center space-x-2'>
					<BookOpen className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Status: {book.status}</span>
				</div>
				<fetcher.Form method='post'>
					<input type='hidden' name='bookId' value={book.id} />
					<button
						type='submit'
						disabled={isReturning}
						className='w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md'
					>
						{isReturning ? 'Returning...' : 'Return Book'}
					</button>
				</fetcher.Form>
			</CardContent>
		</Card>
	)
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
						You haven&#39;t borrowed any books yet.
					</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
			{books.map(book => (
				<BookCard key={book.id} book={book} />
			))}
		</div>
	)
}
