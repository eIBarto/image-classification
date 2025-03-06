"use client"

import * as React from "react"
import {
  File,
  LayoutDashboard,
  Play,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ProjectSwitcher } from "./project-switcher"
import { notFound } from "next/navigation"
import { useAppPath } from "@/hooks/use-app-path"

const items = [
  {
    title: "Files",
    path: "files",
    icon: File,
  },
  {
    title: "Memberships",
    path: "memberships",
    icon: Users,
  },
  {
    title: "Views",
    path: "views",
    icon: LayoutDashboard,
  },
  {
    title: "Playground",
    path: "playground",
    icon: Play,
  }
]
// todo alternatively wrap in server component and retrive projectId through params
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const appPath = useAppPath()

  if (appPath.error) {
    notFound()
  }
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher/>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items.map(item => ({
          ...item,
          url: `/projects/${appPath.projectId}/${item.path}`,
        }))} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}