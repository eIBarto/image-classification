"use client"

import { Users, LayoutDashboard, MessagesSquare, Play, File } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
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
    title: "Prompts",
    path: "prompts",
    icon: MessagesSquare,
  },
  {
    title: "Playground",
    path: "playground",
    icon: Play,
  }
]

export function NavMain() {
  const appPath = useAppPath()

  if (appPath.error) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Project</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={appPath.path === item.path}>
              <Link href={`/projects/${appPath.projectId}/${item.path}`}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
