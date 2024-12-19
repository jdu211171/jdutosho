import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import { useFetcher } from '@remix-run/react'
import { toast } from '~/hooks/use-toast'
import { useEffect } from 'react'
import type { Category } from '~/types/categories'

export function CategoryCard({ category }: { category: Category }) {
	const fetcher = useFetcher()
	const isDeleting = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.success) {
			toast({
				title: 'Category deleted',
				description: 'The category has been deleted successfully',
			})
		} else if (fetcher.state === 'idle' && fetcher.data?.error) {
			toast({
				title: 'Error',
				description: fetcher.data.error,
				variant: 'destructive',
			})
		}
	}, [fetcher.state, fetcher.data])

	return (
		<Card>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-lg font-bold'>{category.name}</CardTitle>
				<div className='flex gap-2'>
					<Button size='icon' variant='ghost' className='h-8 w-8' asChild>
						<a href={`/librarian/book-categories/${category.id}/edit`}>
							<Pencil className='h-4 w-4' />
						</a>
					</Button>
					<fetcher.Form method='delete'>
						<input type='hidden' name='categoryId' value={category.id} />
						<Button
							type='submit'
							size='icon'
							variant='ghost'
							className='h-8 w-8 text-destructive'
							disabled={isDeleting}
						>
							<Trash className='h-4 w-4' />
						</Button>
					</fetcher.Form>
				</div>
			</CardHeader>
			<CardContent>
				<p className='text-sm text-muted-foreground'>
					Created at: {new Date(category.created_at).toLocaleDateString()}
				</p>
			</CardContent>
		</Card>
	)
}
