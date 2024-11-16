import { DataTable } from '~/components/tasks/data-table'
import { columns } from '~/components/tasks/columns'
import { useLoaderData } from '@remix-run/react'
import { ActionFunctionArgs, json } from '@remix-run/node'
import { api } from '~/lib/utils/api'
import { sessionStorage } from '~/lib/utils/auth.server'

export const metadata = {
	title: 'Tasks',
	description: 'A task and issue tracker build using Tanstack Table.',
}

export const loader = async ({ request }: ActionFunctionArgs) => {
	const url = new URL(request.url)
	const session = await sessionStorage.getSession()
	const token = session.get('token')
	const page = url.searchParams.get('page') || '1'
	try {
		const response = await api.get(`/books?page=${page}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		return response.data
	} catch (error) {
		return json({ error: 'Failed to fetch books' }, { status: 500 })
	}
}

export default function TaskPage() {
	const tasks = [
		{
			id: 'TASK-7878',
			title:
				'Try to calculate the EXE feed, maybe it will index the multi-byte pixel!',
			status: 'backlog',
			label: 'documentation',
			priority: 'medium',
		},
		{
			id: 'TASK-7839',
			title: 'We need to bypass the neural TCP card!',
			status: 'todo',
			label: 'bug',
			priority: 'high',
		},
	]
	const data = useLoaderData<typeof loader>()
	console.log(data)
	return <DataTable data={tasks} columns={columns} />
}
