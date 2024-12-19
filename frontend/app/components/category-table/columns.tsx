import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import type { Category } from '~/types/categories'
import { useFetcher } from '@remix-run/react'
import { cleanText } from '~/lib/utils'

export const columns: ColumnDef<Category>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => {
			return cleanText(row.original.name)
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const category = row.original
			const fetcher = useFetcher()
			const isDeleting = fetcher.state !== 'idle'

			return (
				<div className='flex gap-2 justify-end'>
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
			)
		},
	},
]
