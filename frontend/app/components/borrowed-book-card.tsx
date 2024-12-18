import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen, CalendarDays, User } from 'lucide-react'
import { useFetcher } from '@remix-run/react'
import { toast } from '~/hooks/use-toast'
import { useEffect } from 'react'
import type { RentBook } from '~/types/rents'

export function BorrowedBookCard({ book }: { book: RentBook }) {
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
		<Card>
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
