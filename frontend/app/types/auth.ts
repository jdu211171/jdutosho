export interface User {
	id: number
	loginID: string
	name: string
	role: 'librarian' | 'student'
}

export interface SessionData {
	token: string
	user: User
}

export type SessionFlashData = {
	error: string
	success: string
}
