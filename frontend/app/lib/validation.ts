import { z } from 'zod'

export const loginSchema = z.object({
	loginID: z.string().min(1, 'Login ID is required'),
	password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>
