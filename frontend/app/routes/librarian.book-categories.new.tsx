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
import { useActionData, useNavigate } from '@remix-run/react'
import { api } from '~/lib/api'
import { requireLibrarianUser } from '~/services/auth.server'
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node'
import { toast } from '~/hooks/use-toast'

export async function action({ request }: ActionFunctionArgs) {
	const user = await requireLibrarianUser(request)
	const formData = await request.formData()
	const name = formData.get('name')

	try {
		await api.post(
			'/book-categories',
			{ name },
			{
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			}
		)

		return redirect('/librarian/book-categories')
	} catch (error: any) {
		console.error('Create category error:', error)
		return json(
			{
				error: error.response?.data?.message || 'Failed to create category',
			},
			{ status: 400 }
		)
	}
}

export default function NewBookCategoryPage() {
	const actionData = useActionData<typeof action>()
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
					<CardTitle>New Book Category</CardTitle>
					<CardDescription>Create a new book category</CardDescription>
				</CardHeader>
				<CardContent>
					<form method='post' className='space-y-4'>
						<div className='space-y-2'>
							<Label htmlFor='name'>Category Name</Label>
							<Input
								id='name'
								name='name'
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
							<Button type='submit'>Create Category</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	)
}
