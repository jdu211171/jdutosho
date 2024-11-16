export interface Book {
	id: number
	name: string
	author: string
	language: string
	category: string
	count: number
}

interface ApiResponse {
	data: Book[]
	meta: {
		current_page: number
		from: number
		last_page: number
		per_page: number
		to: number
		total: number
	}
}

export async function fetchBooks(
	page: number,
	perPage: number
): Promise<ApiResponse> {
	const response = await fetch(
		`https://jdutosho.uz/jdutosho/public/api/books?page=${page}&per_page=${perPage}`
	)
	if (!response.ok) {
		throw new Error('Failed to fetch books')
	}
	return await response.json()
}
