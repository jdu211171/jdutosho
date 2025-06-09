import { z } from 'zod'

export const loginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		loginID: z.string().min(1, 'Username is required'),
		password: z.string().min(4, 'Password must be at least 4 characters long'),
		password_confirmation: z
			.string()
			.min(4, 'Confirm Password must be at least 4 characters long'),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.password_confirmation) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['password_confirmation'],
				message: 'Passwords do not match',
			})
		}
	})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
