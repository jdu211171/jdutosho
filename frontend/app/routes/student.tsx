import { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, useLoaderData } from '@remix-run/react'
import { AppSidebar } from '~/components/app-sidebar'
import { DynamicBreadcrumb } from '~/components/breadcrumb'
import { Separator } from '~/components/ui/separator'
import { SidebarInset, SidebarTrigger } from '~/components/ui/sidebar'
import { requireStudentUser } from '~/services/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
	const { user } = await requireStudentUser(request)
	return { user }
}

export default function StudentLayout() {
	const { user } = useLoaderData<typeof loader>()

	return (
		<div className='flex min-h-screen w-full'>
			<AppSidebar user={user} />
			<SidebarInset className='flex-1 grow'>
				<header className='sticky top-0 z-10 flex h-16 w-full shrink-0 items-center border-b bg-background px-4'>
					<div className='flex items-center gap-2'>
						<SidebarTrigger className='-ml-2' />
						<Separator orientation='vertical' className='h-4' />
						<DynamicBreadcrumb />
					</div>
				</header>
				<main className='flex-1 p-4'>
					<Outlet />
				</main>
			</SidebarInset>
		</div>
	)
}
