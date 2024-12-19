export interface Book {
	id: string
	code: string
}

export interface Student {
	id: string
	loginID: string
}

export interface ApiResponse<T> {
	data: T[]
}
