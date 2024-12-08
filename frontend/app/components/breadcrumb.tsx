import * as React from 'react'
import { useMatches, Link } from '@remix-run/react'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'

const routeMap: Record<string, { title: string; path?: string }> = {
	routes: {
		title: 'Home',
		path: '/',
	},
	'routes/librarian': {
		title: 'Dashboard',
		path: '/librarian',
	},
	'routes/librarian.books': {
		title: 'Books',
		path: '/librarian/books',
	},
	'routes/librarian.students': {
		title: 'Students',
		path: '/librarian/students',
	},
	'routes/librarian.borrowed': {
		title: 'Borrowed Books',
		path: '/librarian/borrowed',
	},
	'routes/librarian.pending': {
		title: 'Pending Returns',
		path: '/librarian/pending',
	},
	'routes/student': {
		title: 'Dashboard',
		path: '/student',
	},
	'routes/student.books': {
		title: 'Books',
		path: '/student/books',
	},
	'routes/student.borrowed': {
		title: 'My Books',
		path: '/student/borrowed',
	},
	'routes/student.profile': {
		title: 'Profile',
		path: '/student/profile',
	},
}

export function DynamicBreadcrumb() {
	const matches = useMatches()

	const breadcrumbs = matches
		.filter(match => match.id !== 'root')
		.map(match => {
			const routeId = match.id.replace(/\./g, '.').replace(/^routes\./, '')
			return {
				id: match.id,
				title: routeMap[match.id]?.title || routeId,
				path: routeMap[match.id]?.path || match.pathname,
			}
		})

	if (breadcrumbs.length === 0) return null

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbs.map((crumb, index) => {
					const isLast = index === breadcrumbs.length - 1
					return (
						<React.Fragment key={crumb.path}>
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>{crumb.title}</BreadcrumbPage>
								) : (
									<BreadcrumbLink>
										<Link to={crumb.path}>{crumb.title}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isLast && <BreadcrumbSeparator />}
						</React.Fragment>
					)
				})}
			</BreadcrumbList>
		</Breadcrumb>
	)
}
