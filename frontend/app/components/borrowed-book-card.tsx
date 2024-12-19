import { useEffect } from 'react'
import { useFetcher } from 'react-router-dom'
import { BookOpen, CalendarDays, User } from 'lucide-react'
import { toast } from '~/hooks/use-toast'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { RentBook } from '~/types/rents'

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
					<Button
						type='submit'
						disabled={isReturning || book.status === 'pending'}
						className='w-full mt-4'
					>
						{isReturning
							? 'Returning...'
							: book.status === 'pending'
								? 'Pending'
								: 'Return Book'}
					</Button>
				</fetcher.Form>
			</CardContent>
		</Card>
	)
}
