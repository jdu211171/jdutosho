import { z } from 'zod'

export const bookSchema = z.object({
	id: z.number(),
	code: z.string(),
	name: z.string(),
	author: z.string(),
	category: z.string(),
	language: z.string(),
	status: z.string(),
})

export const booksResponseSchema = z.object({
	data: z.array(bookSchema),
	meta: z.object({
		current_page: z.number(),
		last_page: z.number(),
	}),
})

export type Book = z.infer<typeof bookSchema>
export type BooksResponse = z.infer<typeof booksResponseSchema>
