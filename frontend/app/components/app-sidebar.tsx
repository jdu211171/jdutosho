import * as React from 'react'
import {
	AudioWaveform,
	Book,
	Command,
	GalleryVerticalEnd,
	UsersRound,
} from 'lucide-react'

import { NavMain } from '~/components/nav-main'
import { NavUser } from '~/components/nav-user'
import { TeamSwitcher } from '~/components/team-switcher'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '~/components/ui/sidebar'

// This is sample data.
const data = {
	user: {
		name: 'Yulduzxon Sobirova',
		email: 'm@example.com',
		avatar: '/logo-dark.png',
	},
	teams: [
		{
			name: 'JDU Library',
			logo: GalleryVerticalEnd,
			plan: 'Librarian',
		},
		{
			name: 'Acme Corp.',
			logo: AudioWaveform,
			plan: 'Startup',
		},
		{
			name: 'Evil Corp.',
			logo: Command,
			plan: 'Free',
		},
	],
	navMain: [
		{
			title: 'Book Actions',
			url: '#',
			icon: Book,
			isActive: true,
			items: [
				{
					title: 'List',
					url: '/librarian/books',
				},
				{
					title: 'Rented',
					url: '#',
				},
				{
					title: 'Pending',
					url: '#',
				},
			],
		},
		{
			title: 'Students',
			url: '#',
			icon: UsersRound,
			items: [
				{
					title: 'Create',
					url: '#',
				},
			],
		},
	],
	/*projects: [
		{
			name: 'Design Engineering',
			url: '#',
			icon: Frame,
		},
		{
			name: 'Sales & Marketing',
			url: '#',
			icon: PieChart,
		},
		{
			name: 'Travel',
			url: '#',
			icon: Map,
		},
	],*/
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
	userRole: 'student' | 'librarian'
}

export function AppSidebar({ userRole, ...props }: AppSidebarProps) {
	return (
		<>
			<Sidebar collapsible='icon' {...props}>
				<SidebarHeader>
					{userRole === 'librarian' && <TeamSwitcher teams={data.teams} />}
				</SidebarHeader>
				<SidebarContent>
					<NavMain items={data.navMain} />
					{/*<NavProjects projects={data.projects} />*/}
				</SidebarContent>
				<SidebarFooter>
					<NavUser user={data.user} />
				</SidebarFooter>
				<SidebarRail />
			</Sidebar>
		</>
	)
}
