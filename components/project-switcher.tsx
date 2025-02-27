"use client"

import * as React from "react"
import { ChevronsUpDown, FolderKanban, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ResponsiveDialogDrawer, ResponsiveDialogDrawerTitle, ResponsiveDialogDrawerClose, ResponsiveDialogDrawerFooter, ResponsiveDialogDrawerContent, ResponsiveDialogDrawerTrigger, ResponsiveDialogDrawerHeader, ResponsiveDialogDrawerDescription } from "@/components/responsive-drawer-dialog"
import { CreateProjectForm } from "./create-project-form"
import { Button } from "./ui/button"

const client = generateClient<Schema>();

async function fetchProjects() {
  const { data: projects, errors } = await client.models.Project.list({ selectionSet: ["id", "createdAt", "updatedAt", "name", "description"] });

  if (errors) {
    throw new Error("Failed to fetch projects")
  }

  return projects
}

// todo add project name
export function ProjectSwitcher() {
  const pathname = usePathname()
  const projectId = pathname.split('/')[2]

  const { isMobile } = useSidebar()

  const { data: projects, isPending } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  })

  const activeProject = projects?.find(project => project.id === projectId)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <ResponsiveDialogDrawer>
          <DropdownMenu>
            {isPending ? (
              <SidebarMenuSkeleton showIcon />
            ) : (<DropdownMenuTrigger asChild>
              {activeProject ? (
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <FolderKanban className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeProject.name}
                    </span>
                    <span className="truncate text-xs">{activeProject.description}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              ) : (<SidebarMenuButton size="lg">
                Select Project
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>)
              }
            </DropdownMenuTrigger>)}
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Teams
              </DropdownMenuLabel>
              {isPending ? Array.from({ length: 5 }).map((_, index) => ( // todo prioritize against activeProject => activeProject ist nichts ohne data
                <SidebarMenuItem key={index}>
                  <SidebarMenuSkeleton />
                </SidebarMenuItem>
              )) : (projects?.map((project, index) => (
                <DropdownMenuItem key={project.id} asChild>
                  <Link href={`/projects/${project.id}`} data-active={project.id === activeProject?.id} className="gap-2 p-2 flex shrink-0 items-center justify-center whitespace-nowrap rounded-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground">
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <FolderKanban className="size-4 shrink-0" />
                    </div>
                    {project.name}
                    {index < 10 && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>}
                  </Link>
                </DropdownMenuItem>
              )
              ))}
              <DropdownMenuSeparator />
              <ResponsiveDialogDrawerTrigger asChild>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Add project</div>
                </DropdownMenuItem>
              </ResponsiveDialogDrawerTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <ResponsiveDialogDrawerContent>
            <ResponsiveDialogDrawerHeader className="text-left">
              <ResponsiveDialogDrawerTitle>Create Project</ResponsiveDialogDrawerTitle>
              <ResponsiveDialogDrawerDescription>
                Create a new project.
              </ResponsiveDialogDrawerDescription>
            </ResponsiveDialogDrawerHeader>
            <CreateProjectForm className="md:px-0 px-4" onSubmit={console.log} />
            <ResponsiveDialogDrawerFooter className="pt-2">
              <ResponsiveDialogDrawerClose className="md:hidden" asChild>
                <Button variant="outline">Cancel</Button>
              </ResponsiveDialogDrawerClose>
            </ResponsiveDialogDrawerFooter>
          </ResponsiveDialogDrawerContent>
        </ResponsiveDialogDrawer>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

/*<SidebarMenuButton size="lg" asChild>
            <Button variant="outline" className="flex w-full justify-center items-center gap-2">
              <PlusCircle className="size-4" />
              Create Project
            </Button>
          </SidebarMenuButton>*/