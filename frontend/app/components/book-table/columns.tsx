import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './data-table-column-header'
import type { Book } from '~/types/book'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Book>[] = [
	{
		accessorKey: 'code',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Code' />
		),
		cell: ({ row }) => (
			<div className='font-medium'>{row.getValue('code')}</div>
		),
		enableSorting: false,
		enableHiding: false, // Keep this always visible
	},
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Name' />
		),
		cell: ({ row }) => <div>{row.getValue('name')}</div>,
		enableHiding: false, // Keep this always visible
	},
	// Make other columns hideable on mobile
	{
		accessorKey: 'author',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Author' />
		),
		cell: ({ row }) => <div>{row.getValue('author')}</div>,
		enableHiding: true,
	},
	{
		accessorKey: 'language',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Language' />
		),
		cell: ({ row }) => (
			<div className='w-[80px]'>{row.getValue('language')}</div>
		),
		enableHiding: true,
	},
	{
		accessorKey: 'category',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category' />
		),
		cell: ({ row }) => <div>{row.getValue('category')}</div>,
		enableHiding: true,
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Status' />
		),
		cell: ({ row }) => <div>{row.getValue('status')}</div>,
		enableHiding: true,
	},
	{
		id: 'actions',
		cell: ({ row }) => (
			<div className='w-[20px]'>
				<DataTableRowActions row={row} />
			</div>
		),
		enableHiding: false, // Keep actions always visible
	},
]

export const studentBookColumns: ColumnDef<Book>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Name' />
		),
		cell: ({ row }) => <div>{row.getValue('name')}</div>,
	},
	{
		accessorKey: 'author',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Author' />
		),
		cell: ({ row }) => <div>{row.getValue('author')}</div>,
	},
	{
		accessorKey: 'category',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category' />
		),
		cell: ({ row }) => <div>{row.getValue('category')}</div>,
		enableHiding: true,
	},
	{
		accessorKey: 'language',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Language' />
		),
		cell: ({ row }) => <div>{row.getValue('language')}</div>,
		enableHiding: true,
	},
	{
		accessorKey: 'available',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Available' />
		),
		cell: ({ row }) => <div>{row.getValue('available') ? 'Yes' : 'No'}</div>,
		enableHiding: true,
	},
]
