import * as React from 'react'
import {
	Book,
	Library,
	UsersRound,
	BookCopy,
	GraduationCap,
} from 'lucide-react'
import { NavLink } from '@remix-run/react'
import { NavUser } from '~/components/nav-user'
import { NavMain } from '~/components/nav-main'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from '~/components/ui/sidebar'
import { User } from '~/types/auth'
import { TeamSwitcher } from './team-switcher'

const navConfig = {
	teams: [
		{
			name: 'JDU Library',
			logo: Library,
			plan: 'Librarian',
		},
	],
	librarian: [
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
					title: 'Borrowed',
					url: '/librarian/borrowed',
				},
				{
					title: 'Pending',
					url: '/librarian/pending',
				},
			],
		},
		{
			title: 'Students',
			url: '#',
			icon: UsersRound,
			items: [
				{
					title: 'All Students',
					url: '/librarian/students',
					plan: 'Free',
				},
			],
		},
	],
	student: [
		{
			title: 'Books',
			url: '#',
			icon: BookCopy,
			isActive: true,
			items: [
				{
					title: 'Available Books',
					url: '/student/books',
				},
				{
					title: 'My Borrowed Books',
					url: '/student/borrowed',
				},
			],
		},
	],
}

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
