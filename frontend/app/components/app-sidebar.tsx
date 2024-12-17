import type * as React from 'react'
import {
	Book,
	Library,
	UsersRound,
	BookCopy,
	GraduationCap,
} from 'lucide-react'
import { NavUser } from '~/components/nav-user'
import { NavMain } from '~/components/nav-main'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '~/components/ui/sidebar'
import type { User } from '~/types/auth'
import { TeamSwitcher } from './team-switcher'
import { navConfig } from '~/lib/navConfig'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	user: User
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
	const navItems = navConfig[user.role] || []

	return (
		<Sidebar className='z-20' collapsible='icon' {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={navConfig.teams} userRole={user.role} />
			</SidebarHeader>

			<SidebarContent>
				<NavMain items={navItems} />
			</SidebarContent>

			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	)
}
