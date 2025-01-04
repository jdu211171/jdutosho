import { type ColumnDef } from '@tanstack/react-table'
import type { User } from '~/types/users'
import { UserActions } from './user-actions'

export const columns: ColumnDef<User>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
		enableHiding: true,
	},
	{
		accessorKey: 'loginID',
		header: 'Login ID',
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ row }) => {
			return row.original.role === 'student' ? 'Student' : 'Librarian'
		},
		enableHiding: true,
	},
	{
		id: 'actions',
		cell: ({ row }) => <UserActions user={row.original} />,
	},
]
