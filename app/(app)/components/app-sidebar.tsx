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
import { NavProjects } from "./nav-projects"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const appPath = useAppPath()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ProjectSwitcher projectId={appPath.error ? null : appPath.projectId} />
      </SidebarHeader>
      <SidebarContent>
        {appPath.error ? <NavProjects /> :
          <NavProject
            projectId={appPath.projectId}
            path={appPath.path}
            resourceId={appPath.resourceId}
          />
        }
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}