import { useLocation } from '@remix-run/react'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from '~/components/ui/sidebar'

interface NavItem {
	title: string
	url: string
	icon: LucideIcon
	isActive?: boolean
	items: {
		title: string
		url: string
	}[]
}

interface NavMainProps {
	items: NavItem[]
}

function calculateIsActive(item: NavItem) {
	const location = useLocation()
	return item.items.some(subItem => location.pathname.startsWith(subItem.url))
}

export function NavMain({ items }: NavMainProps) {
	return (
		<SidebarGroup>
			<SidebarGroupLabel>Actions</SidebarGroupLabel>
			<SidebarMenu>
				{items.map(item => (
					<Collapsible
						key={item.title}
						asChild
						defaultOpen={calculateIsActive(item)}
						className='group/collapsible'
					>
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton tooltip={item.title}>
									{item.icon && <item.icon className='size-4' />}
									<span className='truncate'>{item.title}</span>
									<ChevronRight className='ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{item.items?.map(subItem => (
										<SidebarMenuSubItem key={subItem.title}>
											<SidebarMenuSubButton asChild>
												<a href={subItem.url}>
													<span>{subItem.title}</span>
												</a>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	)
}
