import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { LendBookDialog } from '~/components/lend-book-dialog'

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
				<DropdownMenuItem>Edit</DropdownMenuItem>
				{row.original.status !== 'rent' && row.original.status !== 'lost' && (
					<LendBookDialog initialBookId={row.original.code}>
						<DropdownMenuItem onSelect={e => e.preventDefault()}>
							Lend
						</DropdownMenuItem>
					</LendBookDialog>
				)}
				{(row.original.status === 'rent' || row.original.status === 'lost') && (
					<DropdownMenuItem disabled>Lend</DropdownMenuItem>
				)}
				<DropdownMenuItem>Favorite</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem>Delete</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
