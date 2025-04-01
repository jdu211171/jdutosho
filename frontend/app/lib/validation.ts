import { z } from 'zod'

export const loginSchema = z.object({
	loginID: z.string().min(1, 'Username or email is required'),
	password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
	.object({
		full_name: z.string().min(1, 'Full name is required'),
		username: z.string().min(1, 'Username is required'),
		email: z.string().email('Invalid email format').optional().nullable(),
		password: z.string().min(8, 'Password must be at least 8 characters long'),
		password_confirmation: z
			.string()
			.min(8, 'Confirm Password must be at least 8 characters long'),
		role: z.enum(['student', 'librarian', 'admin']).optional().default('student'),
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
