import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import type { StatCardProps } from '~/types/dashboard'

export function StatCard({
	title,
	value,
	description,
	icon: Icon,
	isLoading,
}: StatCardProps) {
	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				<Icon className='h-4 w-4 text-muted-foreground shrink-0' />
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<>
						<Skeleton className='h-8 w-20 mb-1' />
						<Skeleton className='h-4 w-32' />
					</>
				) : (
					<>
						<div className='text-2xl font-bold'>{value}</div>
						<p className='text-xs text-muted-foreground'>{description}</p>
					</>
				)}
			</CardContent>
		</Card>
	)
}
