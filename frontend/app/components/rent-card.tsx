import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { BookOpen, CalendarDays, User } from 'lucide-react'
import type { RentBook } from '~/types/rents'

export function RentCard({ rent }: { rent: RentBook }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className='text-lg font-bold'>{rent.book}</CardTitle>
				<p className='text-sm text-muted-foreground'>Code: {rent.book_code}</p>
			</CardHeader>
			<CardContent className='space-y-3'>
				<div className='flex items-center space-x-2'>
					<User className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Borrowed by: {rent.taken_by}</span>
				</div>
				<div className='flex items-center space-x-2'>
					<User className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Given by: {rent.given_by}</span>
				</div>
				<div className='flex items-center space-x-2'>
					<CalendarDays className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>
						Borrowed on: {rent.given_date} ({rent.passed_days} days ago)
					</span>
				</div>
				<div className='flex items-center space-x-2'>
					<BookOpen className='h-4 w-4 shrink-0 text-muted-foreground' />
					<span className='text-sm'>Status: {rent.status}</span>
				</div>
			</CardContent>
		</Card>
	)
}
