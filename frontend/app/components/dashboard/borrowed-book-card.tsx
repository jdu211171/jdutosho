import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { useFetcher } from '@remix-run/react'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import type { RentBook } from '~/types/rents'
import { toast } from '~/hooks/use-toast'
import { useEffect } from 'react'

export function BorrowedBookCard({ rent }: { rent: RentBook }) {
	const fetcher = useFetcher<{ success: boolean }>()
	const isReturning = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.success === true) {
			toast({
				title: 'Return Requested',
				description: 'Your return request has been submitted for approval',
			})
		} else if (fetcher.state === 'idle' && fetcher.data?.success === false) {
			toast({
				title: 'Failed to request return',
				description: 'There was an error requesting the return',
				variant: 'destructive',
			})
		}
	}, [fetcher.state, fetcher.data?.success])

	const isPending = rent.status === 'pending'

	return (
		<Card className='p-4'>
			<CardContent className='p-0 space-y-3'>
				<div className='flex items-start justify-between'>
					<div className='space-y-1'>
						<h4 className='font-medium leading-none'>{rent.book}</h4>
						<p className='text-sm text-muted-foreground'>
							Code: {rent.book_code}
						</p>
					</div>
					<BookOpen className='h-4 w-4 text-muted-foreground' />
				</div>

				<div className='flex items-center text-sm text-muted-foreground'>
					<Clock className='h-3 w-3 mr-1' />
					<span>{rent.passed_days} days</span>
				</div>

				<fetcher.Form method='put' action={`/student/rents/${rent.id}/return`}>
					<input type='hidden' name='action' value='return' />
					<Button
						type='submit'
						size='sm'
						variant={isPending ? 'secondary' : 'default'}
						className='w-full'
						disabled={isReturning || isPending}
					>
						{isPending ? 'Return Pending' : 'Return Book'}
						{!isPending && <ArrowRight className='h-3 w-3 ml-1' />}
					</Button>
				</fetcher.Form>
			</CardContent>
		</Card>
	)
}
