import { createCookieSessionStorage, redirect } from '@remix-run/node'
import type { SessionData, SessionFlashData, User } from '~/types/auth'
import { isAxiosError } from 'axios'
import { api } from '~/lib/api'

const isProduction = process.env.NODE_ENV === 'production'

if (!process.env.SESSION_SECRET) {
	throw new Error('SESSION_SECRET must be set')
}

const authSessionStorage = createCookieSessionStorage<
	SessionData,
	SessionFlashData
>({
	cookie: {
		name: 'auth_session',
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 30,
		path: '/',
		sameSite: 'lax',
		secrets: [process.env.SESSION_SECRET],
		secure: isProduction,
	},
})

async function handleApiError(error: unknown, request: Request) {
	if (isAxiosError(error)) {
		if (error.response?.status === 401) {
			const session = await authSessionStorage.getSession(
				request.headers.get('Cookie')
			)
			throw redirect('/login', {
				headers: {
					'Set-Cookie': await authSessionStorage.destroySession(session),
				},
			})
		}
		// Handle other API errors
		throw error
	}
	throw error
}

export async function makeAuthenticatedRequest<T>(
	request: Request,
	apiCall: () => Promise<T>
): Promise<T> {
	try {
		return await apiCall()
	} catch (error) {
		await handleApiError(error, request)
		throw error // TypeScript needs this even though handleApiError always throws
	}
}

export async function createUserSession(token: string, user: User) {
	const session = await authSessionStorage.getSession()
	session.set('token', token)
	session.set('user', user)

	const redirectTo = user.role === 'librarian' ? '/librarian' : '/student'

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
		throw redirect('/login')
	}

	// Set the token for the API request
	api.defaults.headers.common['Authorization'] = `Bearer ${userSession.token}`

	return userSession
}

export async function requireStudentUser(request: Request) {
	const userSession = await requireUser(request)

	if (userSession.user.role !== 'student') {
		throw redirect('/login')
	}

	// Set the token for the API request
	api.defaults.headers.common['Authorization'] = `Bearer ${userSession.token}`

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

export async function getAuthToken(request: Request) {
	const session = await authSessionStorage.getSession(
		request.headers.get('Cookie')
	)
	return session.get('token')
}
