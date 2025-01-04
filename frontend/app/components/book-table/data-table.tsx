import * as React from 'react'
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
} from '@tanstack/react-table'
import {
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '~/components/ui/table'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	pageCount?: number
	currentPage?: number
	onPageChange?: (page: number) => void
	onSearch?: (search: string) => void
	initialSearch?: string
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pageCount = 1,
	currentPage = 1,
	onPageChange,
	onSearch,
	initialSearch = '',
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = React.useState({})
	const [columnVisibility, setColumnVisibility] =
		React.useState<VisibilityState>({})
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
		[]
	)
	const [sorting, setSorting] = React.useState<SortingState>([])
	const [search, setSearch] = React.useState(initialSearch)

	React.useEffect(() => {
  const handleResize = () => {
    const isMobile = window.innerWidth < 768
    const newColumnVisibility: VisibilityState = {}

    columns.forEach(column => {
      if ('accessorKey' in column) {
        // Hide columns that are marked as hideable on mobile
        newColumnVisibility[column.accessorKey as string] =
          !isMobile || !column.enableHiding
      }
    })

    setColumnVisibility(newColumnVisibility)
  }

  handleResize() // Initial call
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [columns])

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			pagination: {
				pageIndex: currentPage - 1,
				pageSize: 10,
			},
		},
		manualPagination: true,
		pageCount: pageCount,
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
	})

	const handleSearchChange = (value: string) => {
		setSearch(value)
		onSearch?.(value)
	}

	return (
		<div className='space-y-4'>
	    <DataTableToolbar
	      table={table}
	      search={search}
	      onSearchChange={handleSearchChange}
	    />
			<div className='overflow-x-auto rounded-md border'>
      <Table>
        <TableHeader className='hidden md:table-header-group'>
						{table.getHeaderGroups().map(headerGroup => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map(header => {
									return (
										<TableHead key={header.id} colSpan={header.colSpan}>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
													)}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
		      <TableBody>
		        {table.getRowModel().rows?.length ? (
		          table.getRowModel().rows.map(row => (
		            <TableRow
		              key={row.id}
		              data-state={row.getIsSelected() && 'selected'}
		              className='w-full'
		            >
		              {row.getVisibleCells().map(cell => (
		                <TableCell
		                  key={cell.id}
		                  className='py-2 md:py-4'
		                >
		                  {flexRender(
		                    cell.column.columnDef.cell,
		                    cell.getContext()
		                  )}
		                </TableCell>
		              ))}
		            </TableRow>
		          ))
		        ) : (
		          <TableRow>
		            <TableCell
		              colSpan={columns.length}
		              className='h-24 text-center'
		            >
		              No results.
		            </TableCell>
		          </TableRow>
		        )}
		      </TableBody>
		    </Table>
		  </div>
			{onPageChange && pageCount > 1 && (
				<DataTablePagination
					table={table}
					currentPage={currentPage}
					pageCount={pageCount}
					onPageChange={onPageChange}
				/>
			)}
		</div>
	)
}
