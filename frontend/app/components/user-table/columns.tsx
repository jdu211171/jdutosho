import { type ColumnDef } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import type { User } from '~/types/users'
import { useFetcher } from '@remix-run/react'

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
	},
	{
		accessorKey: 'login_id',
		header: 'Login ID',
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ row }) => {
			return row.original.role === 'student' ? 'Student' : 'Librarian'
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => {
			const user = row.original
			const fetcher = useFetcher()
			const isDeleting = fetcher.state !== 'idle'

			return (
				<div className='flex gap-2 justify-end'>
					<Button size='icon' variant='ghost' className='h-8 w-8' asChild>
						<a href={`/librarian/users/${user.id}/edit`}>
							<Pencil className='h-4 w-4' />
						</a>
					</Button>
					<fetcher.Form method='delete'>
						<input type='hidden' name='userId' value={user.id} />
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
