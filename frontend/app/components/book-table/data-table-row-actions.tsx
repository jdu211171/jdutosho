import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Link, useNavigate } from '@remix-run/react'

export function DataTableRowActions({ row }: { row: any }) {
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
				{row.original.status !== 'rent' && row.original.status !== 'lost' && (
					<Link to={`/librarian/books/${row.original.code}/lend`}>
						<DropdownMenuItem>Lend</DropdownMenuItem>
					</Link>
				)}
				{(row.original.status === 'rent' || row.original.status === 'lost') && (
					<DropdownMenuItem disabled>Lend</DropdownMenuItem>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem className='text-destructive' asChild>
					<Link to={`/librarian/books/${row.original.id}/delete`}>Delete</Link>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
