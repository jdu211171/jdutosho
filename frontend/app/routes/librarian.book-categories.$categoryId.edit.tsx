import { Button } from '~/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useActionData, useLoaderData, useNavigate } from '@remix-run/react'
import { api } from '~/lib/api'
import {
	requireLibrarianUser,
	makeAuthenticatedRequest,
} from '~/services/auth.server'
import {
	json,
	redirect,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { toast } from '~/hooks/use-toast'
import type { Category } from '~/types/categories'

export function meta() {
	return [
		{ title: 'Edit Book Category' },
		{ description: 'Edit a book category' },
	]
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	await requireLibrarianUser(request)
	const categoryId = params.categoryId

	return await makeAuthenticatedRequest(request, async () => {
		const response = await api.get<{ data: Category }>(
			`/book-categories/${categoryId}`
		)

		return json({ category: response.data.data })
	})
}

export async function action({ request, params }: ActionFunctionArgs) {
	await requireLibrarianUser(request)
	const formData = await request.formData()
	const name = formData.get('name')
	const categoryId = params.categoryId

	return await makeAuthenticatedRequest(request, async () => {
		await api.put(`/book-categories/${categoryId}`, { name })
		return redirect('/librarian/book-categories')
	})
}

type ActionData = {
	error?: string
}

export default function EditBookCategoryPage() {
	const { category } = useLoaderData<typeof loader>()
	const actionData = useActionData<ActionData>()
	const navigate = useNavigate()

	if (actionData?.error) {
		toast({
			title: 'Error',
			description: actionData.error,
			variant: 'destructive',
		})
	}

	return (
		<div className='mx-auto max-w-lg'>
			<Card>
				<CardHeader>
					<CardTitle>Edit Book Category</CardTitle>
					<CardDescription>Update category details</CardDescription>
				</CardHeader>
				<CardContent>
					<form method='post' className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Category Name</Label>
							<Input
								id='name'
								name='name'
								defaultValue={category.name}
								placeholder='Enter category name'
								required
							/>
						</div>
						<div className='flex gap-4'>
							<Button
								type='button'
								variant='outline'
								onClick={() => navigate(-1)}
							>
								Cancel
							</Button>
							<Button type='submit'>Update Category</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
