import type { LoaderFunctionArgs } from '@remix-run/node'
import { requireStudentUser } from '~/services/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireStudentUser(request)
	return null
}

export default function StudentBooksPage() {
	return (
		<div>
			<h1>Student Books Page</h1>
		</div>
	)
}
