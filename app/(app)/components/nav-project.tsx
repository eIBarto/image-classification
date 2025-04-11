"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { useAppPath } from "@/hooks/use-app-path"
import { NavMembersItem } from "./nav-members-item"
import { NavFilesItem } from "./nav-files-item"
import { NavViewsItem } from "./nav-views-item"
import { NavPromptsItem } from "./nav-prompts-item"

export function NavProject() {
  const appPath = useAppPath()

  if (appPath.error) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Project</SidebarGroupLabel>
      <SidebarMenu>
        <NavMembersItem />
        <NavFilesItem />
        <NavViewsItem />
        <NavPromptsItem />
      </SidebarMenu>
    </SidebarGroup>
  )
}
