import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
	token: string | null
	setToken: (token: string | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({
	children,
	initialToken,
}: {
	children: React.ReactNode
	initialToken: string | null
}) => {
	const [token, setToken] = useState<string | null>(initialToken)

	return (
		<AuthContext.Provider value={{ token, setToken }}>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) throw new Error('useAuth must be used within an AuthProvider')
	return context
}
