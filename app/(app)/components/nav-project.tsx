"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { NavMembersItem } from "./nav-members-item"
import { NavFilesItem } from "./nav-files-item"
import { NavViewsItem } from "./nav-views-item"
import { NavPromptsItem } from "./nav-prompts-item"
import { NavClassificationsItem } from "./nav-classifications-item"

interface NavProjectProps {
  projectId: string
  path?: string | null
  resourceId?: string | null
}

export function NavProject({ projectId, path, resourceId }: NavProjectProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Project</SidebarGroupLabel>
      <SidebarMenu>
        <NavMembersItem
          isActive={path === "memberships"}
          projectId={projectId}
        />
        <NavFilesItem
          isActive={path === "files"}
          projectId={projectId}
        />
        <NavViewsItem
          isActive={path === "views"}
          projectId={projectId}
          viewId={resourceId}
        />
        <NavPromptsItem
          isActive={path === "prompts"}
          projectId={projectId}
          promptId={resourceId}
        />
        <NavClassificationsItem
          isActive={path === "classifications"}
          projectId={projectId}
          classificationId={resourceId}
        />
      </SidebarMenu>
    </SidebarGroup>
  )
}
