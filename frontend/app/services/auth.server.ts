import { createCookieSessionStorage, redirect } from '@remix-run/node'
import type { User } from '~/types/auth'
import { isAxiosError } from 'axios'
import { api } from '~/lib/api'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
	throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
	cookie: {
		name: 'app_session',
		maxAge: 60 * 60 * 24 * 30, // 30 days
		path: '/',
		sameSite: 'lax',
		// httpOnly: true,
		secrets: [sessionSecret],
		secure: process.env.NODE_ENV === 'production',
	},
})

async function handleApiError(error: unknown, request: Request) {
	if (isAxiosError(error)) {
		if (error.response?.status === 401) {
			const session = await storage.getSession(
				request.headers.get('Cookie'),
			)
			throw redirect('/login', {
				headers: {
					'Set-Cookie': await storage.destroySession(session),
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
	apiCall: () => Promise<T>,
): Promise<T> {
	try {
		return await apiCall()
	} catch (error) {
		await handleApiError(error, request)
		throw error // TypeScript needs this even though handleApiError always throws
	}
}

export async function createUserSession(token: string, user: User) {
	const session = await storage.getSession()
	session.set('token', token)
	session.set('user', user)

	const redirectTo = user.role === 'student'
		? '/student'
		: '/librarian'

	return redirect(redirectTo, {
		headers: {
			'Set-Cookie': await storage.commitSession(session),
		},
	})
}

export async function getUserSession(request: Request) {
	return storage.getSession(request.headers.get('Cookie'))
}

export async function getUserToken(request: Request) {
	const session = await getUserSession(request)
	const token = session.get('token')
	if (!token) return null
	return token
}

export async function getUserInfo(request: Request) {
	const session = await getUserSession(request)
	const user = session.get('user')
	if (!user) return null
	return user
}

export async function requireUserSession(request: Request) {
	const session = await getUserSession(request)
	const token = session.get('token')
	const user = session.get('user')

	if (!token || !user) {
		throw redirect('/login')
	}

	return { token, user }
}

export async function getUserFromSession(request: Request) {
	const session = await storage.getSession(
		request.headers.get('Cookie'),
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
	const session = await getUserSession(request)
	return redirect('/login', {
		headers: {
			'Set-Cookie': await storage.destroySession(session),
		},
	})
}

export async function getAuthToken(request: Request) {
	const session = await storage.getSession(
		request.headers.get('Cookie'),
	)
	return session.get('token')
}

