import { type ColumnDef } from '@tanstack/react-table'
import type { Category } from '~/types/categories'
import { CategoryActions } from './category-actions'
import { cleanText } from '~/lib/utils'

export const columns: ColumnDef<Category>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		cell: ({ row }) => {
			return cleanText(row.original.name)
		},
	},
	{
		accessorKey: 'book_count',
		header: 'Books',
		cell: ({ row }) => {
			return row.original.book_count
		},
	},
	{
		id: 'actions',
		cell: ({ row }) => <CategoryActions category={row.original} />,
	},
]
