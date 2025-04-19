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
import { useAppPath } from "@/hooks/use-app-path"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const appPath = useAppPath()

  if (appPath.error) {
    return null
  }

  const { projectId, path, resourceId } = appPath;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher projectId={projectId} />
      </SidebarHeader>
      <SidebarContent>
        <NavProject
          projectId={projectId}
          path={path}
          resourceId={resourceId}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}