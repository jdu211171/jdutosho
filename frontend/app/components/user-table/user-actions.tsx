import { Button } from '~/components/ui/button'
import { Pencil, Trash } from 'lucide-react'
import { useFetcher } from '@remix-run/react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { toast } from '~/hooks/use-toast'
import { useEffect } from 'react'
import type { User } from '~/types/users'

export function UserActions({ user }: { user: User }) {
	const fetcher = useFetcher<{ success: boolean; error: string }>()
	const isDeleting = fetcher.state !== 'idle'

	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.success) {
			toast({
				title: 'Success',
				description: 'User deleted successfully',
			})
		} else if (fetcher.state === 'idle' && fetcher.data?.error) {
			toast({
				title: 'Error',
				description: fetcher.data.error,
				variant: 'destructive',
			})
		}
	}, [fetcher.state, fetcher.data])

	const handleDelete = () => {
		const formData = new FormData()
		formData.append('userId', user.id.toString())
		fetcher.submit(formData, { method: 'delete' })
	}

	return (
		<div className='flex gap-2 justify-end'>
			<Button size='icon' variant='ghost' className='h-8 w-8' asChild>
				<a href={`/librarian/users/${user.id}/edit`}>
					<Pencil className='h-4 w-4' />
				</a>
			</Button>
			<AlertDialog>
				<AlertDialogTrigger asChild>
					<Button
						size='icon'
						variant='ghost'
						className='h-8 w-8 text-destructive'
					>
						<Trash className='h-4 w-4' />
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this user? This action cannot be
							undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<Button
							type='button'
							variant='destructive'
							disabled={isDeleting}
							onClick={handleDelete}
						>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
