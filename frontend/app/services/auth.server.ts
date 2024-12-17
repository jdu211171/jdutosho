import { createCookieSessionStorage, redirect } from '@remix-run/node'
import type { SessionData, SessionFlashData, User } from '~/types/auth'

const isProduction = process.env.NODE_ENV === 'production'

const authSessionStorage = createCookieSessionStorage<
	SessionData,
	SessionFlashData
>({
	cookie: {
		name: 'auth_session',
		httpOnly: false,
		maxAge: 60 * 60 * 24 * 30,
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET!],
		secure: isProduction,
		...(isProduction ? { domain: 'jdutosho.uz' } : {}),
	},
})

export async function createUserSession(token: string, user: User) {
	const session = await authSessionStorage.getSession()
	session.set('token', token)
	session.set('user', user)

	console.log('Redirecting user with role:', user.role)

	const redirectTo =
		user.role === 'librarian' ? '/librarian/books' : '/student/books'

	return redirect(redirectTo, {
		headers: {
			'Set-Cookie': await authSessionStorage.commitSession(session),
		},
	})
}

export async function getUserFromSession(request: Request) {
	const session = await authSessionStorage.getSession(
		request.headers.get('Cookie')
	)

	const token = session.get('token')
	const user = session.get('user')

	if (!token || !user) return null

	return { token, user }
}

export async function requireUser(request: Request) {
	const userSession = await getUserFromSession(request)

	if (!userSession) {
		throw redirect('/login')
	}

	return userSession
}

export async function requireLibrarianUser(request: Request) {
	const userSession = await requireUser(request)

	if (userSession.user.role !== 'librarian') {
		throw redirect('/	login')
	}

	return userSession
}

export async function requireStudentUser(request: Request) {
	const userSession = await requireUser(request)

	if (userSession.user.role !== 'student') {
		throw redirect('/login')
	}

	return userSession
}

export async function logout(request: Request) {
	const session = await authSessionStorage.getSession(
		request.headers.get('Cookie')
	)

	return redirect('/login', {
		headers: {
			'Set-Cookie': await authSessionStorage.destroySession(session),
		},
	})
}

// Utility function to get the auth token for API calls
export async function getAuthToken(request: Request) {
	const session = await authSessionStorage.getSession(
		request.headers.get('Cookie')
	)
	return session.get('token')
}

export async function getSessionToken(request: Request) {
	const session = await authSessionStorage.getSession(
		request.headers.get('Cookie')
	)
	return session.get('token')
}
