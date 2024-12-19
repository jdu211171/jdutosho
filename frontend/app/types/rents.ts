import { z } from 'zod'

export type RentBook = {
	id: number
	book_code: string
	status: string
	book: string
	taken_by: string
	given_by: string
	given_date: string
	passed_days: number
}

export type RentsPaginationMeta = {
	current_page: number
	last_page: number
	per_page: number
	total: number
}

// Only use Zod for API response validation
export const RentsResponseSchema = z.object({
	data: z.array(z.object({
		id: z.number(),
		book_code: z.string(),
		status: z.string(),
		book: z.string(),
		taken_by: z.string(),
		given_by: z.string(),
		given_date: z.string(),
		passed_days: z.number()
	}).nullable().transform(val => val || null)),
	meta: z.object({
		current_page: z.number(),
		last_page: z.number(),
		per_page: z.number(),
		total: z.number()
	})
})

export type RentsResponse = z.infer<typeof RentsResponseSchema>

export type PendingReturn = {
	id: number
	book_code: string
	status: string
	book: string
	taken_by: string
	taken_by_login_id: string
	given_by: string
	given_date: string
	return_date: string
	passed_days: number
}

export type PendingReturnsResponse = {
	data: PendingReturn[]
	meta: RentsPaginationMeta
}
