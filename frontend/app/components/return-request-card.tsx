import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen, CalendarDays, User } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { useFetcher } from '@remix-run/react'
import { toast } from '~/hooks/use-toast'
import { useEffect } from 'react'
import type { PendingReturn } from '~/types/rents'

export function ReturnRequestCard({
	pendingReturn,
}: {
	pendingReturn: PendingReturn
}) {
	const fetcher = useFetcher<{ success: boolean }>()
	const isAccepting = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.success === true) {
			toast({
				title: 'Return accepted',
				description: 'The book return has been accepted successfully',
			})
		} else if (fetcher.state === 'idle' && fetcher.data?.success === false) {
			toast({
				title: 'Failed to accept return',
				description: 'There was an error accepting the return',
				variant: 'destructive',
			})
		}
	}, [fetcher.state, fetcher.data?.success])

	return (
		<Card
			className={`relative ${pendingReturn.status === 'pending' ? 'border-yellow-500' : ''}`}
		>
			<CardHeader>
				<div className='flex justify-between items-start'>
					<div>
						<CardTitle className='text-lg font-bold'>
							{pendingReturn.book}
						</CardTitle>
						<p className='text-sm text-muted-foreground'>
							Code: {pendingReturn.book_code}
						</p>
					</div>
					<span className='px-2 py-1 shrink-0 absolute right-2 top-2 rounded-full bg-yellow-100 text-yellow-800 text-xs font-medium'>
						Pending Return
					</span>
				</div>
			</CardHeader>
			<CardContent className='space-y-3'>
				<div className='flex items-center space-x-2'>
					<User className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Student: {pendingReturn.taken_by}</span>
				</div>
				<div className='flex items-center space-x-2'>
					<CalendarDays className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>
						Return requested: {pendingReturn.return_date}
					</span>
				</div>
				<div className='flex items-center space-x-2'>
					<CalendarDays className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>
						Borrowed on: {pendingReturn.given_date}
						<span className='ml-1 text-muted-foreground'>
							({pendingReturn.passed_days} days ago)
						</span>
					</span>
				</div>
				<fetcher.Form method='post'>
					<input type='hidden' name='rentId' value={pendingReturn.id} />
					<input
						type='hidden'
						name='loginId'
						value={pendingReturn.taken_by_login_id}
					/>
					<input
						type='hidden'
						name='bookCode'
						value={pendingReturn.book_code}
					/>
					<div className='flex gap-2'>
						<Button type='submit' className='flex-1' disabled={isAccepting}>
							Accept Return
						</Button>
						<Button
							type='submit'
							name='action'
							value='reject'
							variant='destructive'
							className='flex-1'
							disabled={isAccepting}
						>
							Reject
						</Button>
					</div>
				</fetcher.Form>
			</CardContent>
		</Card>
	)
}
