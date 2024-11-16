import { json, Outlet } from '@remix-run/react'
import { AppSidebar } from '~/components/app-sidebar'
import { SidebarInset, SidebarTrigger } from '~/components/ui/sidebar'
import { Separator } from '~/components/ui/separator'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { requireLibrarianAuth } from '~/lib/utils/auth'
import { LoaderFunction } from 'react-router'

export const loader: LoaderFunction = async ({ request }) => {
	const { user } = await requireLibrarianAuth(request)
	return json({ user })
}

export default function LibrarianLayout() {
	return (
		<>
			<AppSidebar userRole='librarian' />
			<SidebarInset>
				<header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
					<div className='flex items-center gap-2 px-4'>
						<SidebarTrigger className='-ml-1' />
						<Separator orientation='vertical' className='mr-2 h-4' />
						<Breadcrumb>
							<BreadcrumbList>
								<BreadcrumbItem className='hidden md:block'>
									<BreadcrumbLink href='#'>
										Building Your Application
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className='hidden md:block' />
								<BreadcrumbItem>
									<BreadcrumbPage>Data Fetching</BreadcrumbPage>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>
				</header>

				<div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
					<Outlet />
				</div>
			</SidebarInset>
		</>
	)
}
