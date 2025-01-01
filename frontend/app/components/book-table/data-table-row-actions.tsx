import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Link, useFetcher, useNavigate } from '@remix-run/react'
import { toast } from '~/hooks/use-toast'
import { useEffect, useState } from 'react'
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '../ui/alert-dialog'

export function DataTableRowActions({ row }: { row: any }) {
	const fetcher = useFetcher<{ success: boolean; error: string }>()
	const isDeleting = fetcher.state !== 'idle'
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const navigate = useNavigate()
	useEffect(() => {
		if (fetcher.state === 'idle' && fetcher.data?.success) {
			toast({
				title: 'Success',
				description: 'Book deleted successfully',
			})
			setIsDialogOpen(false)
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
		formData.append('bookId', row.original.id.toString())
		fetcher.submit(formData, { method: 'delete' })
	}
	const handleLend = () => {
		navigate(`/librarian/books/${row.original.code}/lend`)
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
				>
					<DotsHorizontalIcon className='h-4 w-4' />
					<span className='sr-only'>Open menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-[160px]'>
				<Link to={`/librarian/books/${row.original.id}/edit`}>
					<DropdownMenuItem>Edit</DropdownMenuItem>
				</Link>
				{row.original.status !== 'rent' && row.original.status !== 'lost' ? (
					<DropdownMenuItem onSelect={handleLend}>Lend</DropdownMenuItem>
				) : (
					<DropdownMenuItem disabled>Lend</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem onSelect={e => e.preventDefault()}>
							Delete
						</DropdownMenuItem>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Book</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete the book "{row.original.name}"?
								This action cannot be undone.
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
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
