import * as React from 'react'
import { useMatches } from '@remix-run/react'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { navConfig } from '~/lib/navConfig'

interface RouteMapItem {
	title: string
	path: string
}

const routeMap: Record<string, RouteMapItem> = {
	'routes/librarian': { title: 'Librarian', path: '/librarian' },
	'routes/librarian.users.userId.edit': {
		title: 'Edit Student',
		path: '/librarian/users/userId/edit',
	},
	'routes/librarian.books.new': { title: 'New Book', path: '/librarian/books/new' },
	'routes/librarian.books.id.edit': {
		title: 'Edit Book',
		path: '/librarian/books/bookId/edit',
	},
	'routes/librarian.book-categories.categoryId.edit': {
		title: 'Edit Category',
		path: '/librarian/book-categories/categoryId/edit',
	},
	'routes/student': { title: 'Student', path: '/student' },
	...navConfig.librarian.reduce(
		(acc, section) => ({
			...acc,
			...section.items.reduce(
				(items, item) => ({
					...items,
					[`routes/${item.url.slice(1).replace(/\//g, '.')}`]: {
						title: item.title,
						path: item.url,
					},
				}),
				{}
			),
		}),
		{}
	),
	...navConfig.student.reduce(
		(acc, section) => ({
			...acc,
			...section.items.reduce(
				(items, item) => ({
					...items,
					[`routes/${item.url.slice(1).replace(/\//g, '.')}`]: {
						title: item.title,
						path: item.url,
					},
				}),
				{}
			),
		}),
		{}
	),
}

export function DynamicBreadcrumb() {
	const matches = useMatches()

	const breadcrumbs = matches
		.filter(match => match.id !== 'root')
		.filter(match => !match.id.includes('._index'))
		.map(match => {
			const routeId = match.id.replace(/\$/g, '')
			if (routeId.includes('._index')) return null
			return {
				id: match.id,
				title: routeMap[routeId]?.title || routeId.split('/').pop() || '',
				path: routeMap[routeId]?.path || match.pathname,
			}
		})

	if (breadcrumbs.length === 0) return null

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbs.map((crumb, index) => {
					const isLast = index === breadcrumbs.length - 1
					return (
						<React.Fragment key={crumb?.path}>
							<BreadcrumbItem>
								{isLast ? (
									<BreadcrumbPage>{crumb?.title}</BreadcrumbPage>
								) : (
									<BreadcrumbLink href={crumb?.path}>
										{crumb?.title}
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
