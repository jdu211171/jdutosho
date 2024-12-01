import {
	ChevronLeftIcon,
	ChevronRightIcon,
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '~/components/ui/button'

interface DataTablePaginationProps<TData> {
	table: Table<TData>
	currentPage: number
	pageCount: number
	onPageChange: (page: number) => void
}

export function DataTablePagination<TData>({
	currentPage,
	pageCount,
	onPageChange,
}: DataTablePaginationProps<TData>) {
	return (
		<div className='flex items-center justify-between px-2'>
			<div className='flex-1 text-sm text-muted-foreground' />
			<div className='flex items-center space-x-6 lg:space-x-8'>
				<div className='flex w-[100px] items-center justify-center text-sm font-medium'>
					Page {currentPage} of {pageCount}
				</div>
				<div className='flex items-center space-x-2'>
					<Button
						variant='outline'
						className='hidden h-8 w-8 p-0 lg:flex'
						onClick={() => onPageChange(1)}
						disabled={currentPage === 1}
					>
						<span className='sr-only'>Go to first page</span>
						<DoubleArrowLeftIcon className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						className='h-8 w-8 p-0'
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 1}
					>
						<span className='sr-only'>Go to previous page</span>
						<ChevronLeftIcon className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						className='h-8 w-8 p-0'
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage === pageCount}
					>
						<span className='sr-only'>Go to next page</span>
						<ChevronRightIcon className='h-4 w-4' />
					</Button>
					<Button
						variant='outline'
						className='hidden h-8 w-8 p-0 lg:flex'
						onClick={() => onPageChange(pageCount)}
						disabled={currentPage === pageCount}
					>
						<span className='sr-only'>Go to last page</span>
						<DoubleArrowRightIcon className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	)
}
