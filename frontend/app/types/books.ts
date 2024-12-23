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

export interface BookCode {
	id: number
	code: string
	status: string
}

export interface Category {
	id: number
	name: string
}

export interface BookFormFieldErrors {
	name?: string
	author?: string
	language?: string
	category?: string
	codes?: string
}

export interface BookFormValues {
	name?: string
	author?: string
	language?: string
	category?: string
	codes?: string[]
}
