export interface User {
	id: number
	loginID: string
	name: string
	role: 'student' | 'librarian' | 'admin' | 'teacher'
	email: string
	avatar?: string
}

export interface SessionData {
	token: string
	user: User
}

export type SessionFlashData = {
	error: string
	success: string
}
