import { z } from 'zod'

export const bookSchema = z.object({
	id: z.number(),
	name: z.string(),
	author: z.string(),
	language: z.string(),
	category: z.string(),
	count: z.number(),
})

export type Book = z.infer<typeof bookSchema>
