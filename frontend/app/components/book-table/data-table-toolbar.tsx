'use client'

import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

import { DataTableViewOptions } from '~/components/book-table/data-table-view-options'

interface DataTableToolbarProps<TData> {
	table: Table<TData>
	search: string
	onSearchChange: (value: string) => void
}

export function DataTableToolbar<TData>({
	table,
	search,
	onSearchChange,
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0 || search !== ''

	const handleReset = () => {
		table.resetColumnFilters()
		onSearchChange('')
	}

	return (
		<div className='flex items-center justify-between'>
			<div className='flex flex-1 items-center space-x-2'>
				<Input
					placeholder='Search books...'
					value={search}
					onChange={event => onSearchChange(event.target.value)}
					className='h-8 w-[150px] lg:w-[250px]'
				/>
				{isFiltered && (
					<Button
						variant='ghost'
						onClick={handleReset}
						className='h-8 px-2 lg:px-3'
					>
						Reset
						<Cross2Icon className='ml-2 h-4 w-4' />
					</Button>
				)}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	)
}
