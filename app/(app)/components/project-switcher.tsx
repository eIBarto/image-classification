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
  // SidebarMenuSkeleton,
  useSidebar,
} from "@/components/ui/sidebar"
import { useMemo } from "react"

import Link from "next/link"
import { Dialog, DialogTitle, DialogClose, DialogFooter, DialogContent, DialogTrigger, DialogHeader, DialogDescription } from "@/components/ui/dialog"
import { CreateProjectForm } from "@/app/(app)/components/create-project-form"
import { Button } from "../../../components/ui/button"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Schema } from "@/amplify/data/resource"
import { generateClient } from "aws-amplify/data";
import { useState } from "react"
import { toast } from "sonner"

const client = generateClient<Schema>();

async function fetchProjects(options: Schema["listProjectMembershipsByAccountProxy"]["args"]) {
  const { data, errors } = await client.queries.listProjectMembershipsByAccountProxy(options);

  if (errors) {
    throw new Error("Failed to fetch projects")
  }

  if (!data) {
    throw new Error("No projects returned")
  }

  return data
}

async function createProject(options: Schema["createProjectProxy"]["args"]) {
  const { data, errors } = await client.mutations.createProjectProxy(options);

  if (errors) {
    throw new Error("Failed to create project")
  }

  if (!data) {
    throw new Error("Failed to create project")
  }

  return data
}
// todo add project name

interface ProjectSwitcherProps {
  projectId: string
}

export function ProjectSwitcher({ projectId }: ProjectSwitcherProps) {
  const queryClient = useQueryClient()
  const { isMobile } = useSidebar()
  const [open, setOpen] = useState(false)

  const { data, isPending, error } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => fetchProjects({}),
    enabled: !!projectId,
  })

  const { mutateAsync: createProjectAsync } = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      setOpen(false) // alternatively revalidate the page entirely
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to create project")
    }
  })

  const projects = useMemo(() => data?.items || [], [data])

  if (error) {
    return <div>Error: {error.message}</div>
  }

  const selectedProject = projects.find(project => project.projectId === projectId)

  if (isPending) {
    return <div>Loading...</div>
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={open} onOpenChange={setOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {selectedProject ? (
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <FolderKanban className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {selectedProject.project.name}
                    </span>
                    <span className="truncate text-xs">{selectedProject.project.description}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </SidebarMenuButton>
              ) : (<SidebarMenuButton size="lg">
                Select Project
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>)
              }
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Projects
              </DropdownMenuLabel>
              {projects.map((project, index) => (
                <DropdownMenuItem key={project.projectId} asChild>
                  <Link href={`/projects/${project.projectId}`} data-active={project.projectId === selectedProject?.projectId} className="gap-2 p-2 flex shrink-0 items-center justify-center whitespace-nowrap rounded-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground">
                    <div className="flex size-6 items-center justify-center rounded-sm border">
                      <FolderKanban className="size-4 shrink-0" />
                    </div>
                    {project.project.name}
                    {index < 10 && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">Add project</div>
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader className="text-left">
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Create a new project.
              </DialogDescription>
            </DialogHeader>
            <CreateProjectForm className="md:px-0 px-4" onSubmit={async (values) => {
              await createProjectAsync({ name: values.name, description: values.description })
            }} />
            <DialogFooter className="pt-2">
              <DialogClose className="md:hidden" asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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