import { z } from 'zod'

export const bookSchema = z.object({
	id: z.number(),
	name: z.string(),
	author: z.string(),
	language: z.string(),
	category: z.string(),
	count: z.number(),
})

export const booksResponseSchema = z.object({
	data: z.array(bookSchema),
	pageCount: z.number(),
	currentPage: z.number(),
	totalItems: z.number(),
})

export type Book = z.infer<typeof bookSchema>
export type BooksResponse = z.infer<typeof booksResponseSchema>
