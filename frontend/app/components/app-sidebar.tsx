import * as React from "react"
import {
  AudioWaveform, Book,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import {NavMain} from "~/components/nav-main"
import {NavProjects} from "~/components/nav-projects"
import {NavUser} from "~/components/nav-user"
import {TeamSwitcher} from "~/components/team-switcher"
import {Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail,} from "~/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/logo-dark.png",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Book Actions",
      url: "#",
      icon: Book,
      isActive: true,
      items: [
        {
          title: "List",
          url: "#",
        },
        {
          title: "Rented",
          url: "#",
        },
        {
          title: "Pending",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: 'student' | 'librarian'
}

export function AppSidebar({userRole, ...props}: AppSidebarProps) {
  return (
      <>
        <Sidebar collapsible="icon" {...props}>
          <SidebarHeader>
            {userRole === 'librarian' && (
                <TeamSwitcher teams={data.teams}/>
            )}
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={data.navMain}/>
            <NavProjects projects={data.projects}/>
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={data.user}/>
          </SidebarFooter>
          <SidebarRail/>
        </Sidebar>
      </>
  )
}
