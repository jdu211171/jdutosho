import type { User } from '~/types/auth'

// Transform backend user data to frontend User type
export function transformBackendUser(backendUser: any): User {
	return {
		id: backendUser.id,
		loginID: backendUser.loginID || backendUser.login_id || '',
		name: backendUser.full_name || backendUser.name || '',
		role: backendUser.role,
		email: backendUser.email,
		avatar: backendUser.avatar,
	}
}
