export type User = {
	id: number
	name: string
	loginID: string
	role: 'student' | 'librarian'
	created_at: string
	updated_at: string
}

export type UsersPaginationMeta = {
	current_page: number
	last_page: number
	per_page: number
	total: number
}

export type UsersResponse = {
	data: User[]
	meta: UsersPaginationMeta
}
