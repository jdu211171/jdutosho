import type { ColumnDef } from '@tanstack/react-table'
import { DataTableColumnHeader } from './data-table-column-header'
import type { Book } from '~/types/books'
import { DataTableRowActions } from './data-table-row-actions'
import { Button } from '~/components/ui/button'
import { Eye, FileDown, FileText } from 'lucide-react'
import { PDFPreviewButton } from '~/components/pdf-preview-button'

export const columns: ColumnDef<Book>[] = [
	{
		accessorKey: 'code',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Code' />
		),
		cell: ({ row }) => {
			const book = row.original
			// Ensure we extract the code string properly
			let firstCode = '-'
			if (book.codes && book.codes.length > 0) {
				// Handle both string array and object array cases
				const firstItem = book.codes[0]
				firstCode = typeof firstItem === 'string' ? firstItem : firstItem?.code || '-'
			} else {
				firstCode = book.code || '-'
			}
			const totalCodes = book.codes?.length || 0
			return (
				<div className='font-medium'>
					{totalCodes > 1 ? `${firstCode} (+${totalCodes - 1})` : firstCode}
				</div>
			)
		},
		enableSorting: false,
		enableHiding: false, // Keep this always visible
	},
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Name' />
		),
		cell: ({ row }) => <div>{row.getValue('name') || '–'}</div>,
		enableHiding: false, // Keep this always visible
	},
	// Make other columns hideable on mobile
	{
		accessorKey: 'author',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Author' />
		),
		cell: ({ row }) => <div>{row.getValue('author') || '–'}</div>,
		enableHiding: true,
	},
	{
		accessorKey: 'language',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Language' />
		),
		cell: ({ row }) => (
			<div className='w-[80px]'>{row.getValue('language') || '–'}</div>
		),
		enableHiding: true,
	},
	{
		accessorKey: 'category',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category' />
		),
		cell: ({ row }) => <div>{row.getValue('category') || '–'}</div>,
		enableHiding: true,
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Status' />
		),
		cell: ({ row }) => {
			const book = row.original
			const availableCount = book.available_codes_count || 0
			const status = availableCount > 0 ? 'Available' : 'Unavailable'
			const statusColor = availableCount > 0 ? 'text-green-600' : 'text-red-600'
			return (
				<div className={statusColor}>
					{status} ({availableCount})
				</div>
			)
		},
		enableHiding: true,
	},
	{
		id: 'pdf',
		header: 'PDF',
		cell: ({ row }) => {
			const book = row.original
			return <PDFPreviewButton book={book} />
		},
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
		cell: ({ row }) => <div>{row.getValue('name') || '–'}</div>,
	},
	{
		accessorKey: 'author',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Author' />
		),
		cell: ({ row }) => <div>{row.getValue('author') || '–'}</div>,
	},
	{
		accessorKey: 'category',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Category' />
		),
		cell: ({ row }) => <div>{row.getValue('category') || '–'}</div>,
		enableHiding: true,
	},
	{
		accessorKey: 'language',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Language' />
		),
		cell: ({ row }) => <div>{row.getValue('language') || '–'}</div>,
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
	{
		id: 'actions',
		header: 'PDF',
		cell: ({ row }) => {
			const book = row.original
			if (!book.has_pdf) return null
			
			return (
				<div className='flex gap-1'>
					<PDFPreviewButton book={book} variant='ghost' size='sm' />
					<Button
						variant='ghost'
						size='sm'
						onClick={() =>
							(window.location.href = `http://localhost:8000/api/books/${book.id}/pdf/download`)
						}
						title='Download PDF'
					>
						<FileDown className='h-4 w-4' />
					</Button>
				</div>
			)
		},
		enableHiding: false,
	},
]
