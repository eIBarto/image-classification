"use client"

import * as React from "react"

import { NavProject } from "./nav-project"
import { NavUser } from "./nav-user"
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

// todo alternatively wrap in server component and retrive projectId through params

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const appPath = useAppPath()

  if (appPath.error) { // todo this must be moved 
    notFound()
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProject />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}