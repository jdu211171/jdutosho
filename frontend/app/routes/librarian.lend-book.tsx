import type { ActionFunctionArgs } from '@remix-run/node'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import { api } from '~/lib/api'
import { z } from 'zod'

// Define a schema for validating the incoming form data
const lendBookSchema = z.object({
	book_code: z.string().min(1, 'Book ID is required'),
	login_id: z.string().min(1, 'Student ID is required'),
})

export async function action({ request }: ActionFunctionArgs) {
	await requireLibrarianUser(request)

	// Ensure this is a POST request
	if (request.method !== 'POST') {
		return {
			ok: false,
			error: 'Method not allowed',
			status: 405,
		}
	}

	// Parse and validate the form data
	const formData = await request.formData()
	const rawData = {
		book_code: formData.get('bookId'),
		login_id: formData.get('studentId'),
	}

	try {
		// Validate the input data
		const validatedData = lendBookSchema.parse(rawData)

		// Make the authenticated API request
		return await makeAuthenticatedRequest(request, async () => {
			const response = await api.post('/rents', validatedData)

			return {
				ok: true,
				status: 200,
				data: response.data,
			}
		})
	} catch (error) {
		// Handle different types of errors
		if (error instanceof z.ZodError) {
			// Validation errors
			return {
				ok: false,
				error: 'Invalid form data',
				validationErrors: error.flatten(),
				status: 400,
			}
		}

		const err = error as any // Cast error to any to access response property

		if (err.response?.status === 403) {
			// Authorization errors
			return {
				ok: false,
				error: 'Not authorized to lend books',
				status: 403,
			}
		}

		if (err.response?.status === 404) {
			// Not found errors
			return {
				ok: false,
				error: 'Book or student not found',
				status: 404,
			}
		}

		// Generic error handling
		return {
			ok: false,
			error: err.response?.data?.message || 'Failed to lend book',
			status: 500,
		}
	}
}
