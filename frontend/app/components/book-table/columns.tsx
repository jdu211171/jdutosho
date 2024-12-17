import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './data-table-column-header'
import type { Book } from '~/types/book'
import { DataTableRowActions } from './data-table-row-actions'

export const columns: ColumnDef<Book>[] = [
	{
		accessorKey: 'id',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='ID' />
		),
		cell: ({ row }) => <div>{row.getValue('id')}</div>,
		enableSorting: false,
		enableHiding: true,
	},
	{
		accessorKey: 'code',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Book Code' />
		),
		cell: ({ row }) => <div className='w-[80px]'>{row.getValue('code')}</div>,
		enableSorting: false,
		enableHiding: false,
	},
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
		accessorKey: 'language',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Language' />
		),
		cell: ({ row }) => <div>{row.getValue('language')}</div>,
	},
	{
		accessorKey: 'category',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category' />
		),
		cell: ({ row }) => <div>{row.getValue('category')}</div>,
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Status' />
		),
		cell: ({ row }) => <div>{row.getValue('status')}</div>,
	},
	{
		id: 'actions',
		cell: ({ row }) => <DataTableRowActions row={row} />,
	},
]

export const studentBookColumns: ColumnDef<Book>[] = [
	{
		accessorKey: 'id',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='ID' />
		),
	},
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Name' />
		),
	},
	{
		accessorKey: 'author',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Author' />
		),
	},
	{
		accessorKey: 'language',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Language' />
		),
	},
	{
		accessorKey: 'category',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category' />
		),
	},
	{
		accessorKey: 'available',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Available' />
		),
	},
]
