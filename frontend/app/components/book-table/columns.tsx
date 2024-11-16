'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Book } from '~/components/book-table/data'
import { DataTableColumnHeader } from '~/components/book-table/data-table-column-header'
import { DataTableRowActions } from '~/components/book-table/data-table-row-actions'

export const columns: ColumnDef<Book>[] = [
	{
		accessorKey: 'id',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='ID' />
		),
		cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Name' />
		),
		cell: ({ row }) => {
			return (
				<div className='flex space-x-2'>
					<span className='max-w-[500px] truncate font-medium'>
						{row.getValue('name')}
					</span>
				</div>
			)
		},
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
		accessorKey: 'count',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Count' />
		),
		cell: ({ row }) => <div>{row.getValue('count')}</div>,
	},
	{
		id: 'actions',
		cell: ({ row }) => <DataTableRowActions row={row} />,
	},
]
