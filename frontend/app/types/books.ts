export type Book = {
	id: number
	code: string
	title: string
	author: string
	publisher: string
	year: number
	status: 'pending' | 'exist'
	name: string
	language: string
	category: string
	count: number
	created_at: string
	updated_at: string
}

export type BooksPaginationMeta = {
	current_page: number
	last_page: number
	per_page: number
	total: number
}

export type BooksResponse = {
	data: Book[]
	meta: BooksPaginationMeta
}
