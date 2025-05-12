"use client"

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroupLabel, SidebarGroup, SidebarGroupContent, SidebarMenuSkeleton } from "@/components/ui/sidebar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ProjectForm, ProjectFormSchema } from "./project-form"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const client = generateClient<Schema>();

async function listProjects(options: Schema["listProjectsProxy"]["args"]) {
  const { data, errors } = await client.queries.listProjectsProxy(options)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to fetch projects projects")
  }

  if (!data) {
    console.error("No data returned")
    throw new Error("No data returned")
  }

  return data
}

async function createProject(input: Schema["createProjectProxy"]["args"]) {
  const { data, errors } = await client.mutations.createProjectProxy(input)

  if (errors) {
    console.error(errors)
    throw new Error("Failed to create project")
  }

  if (!data) {
    console.error("No data returned")
    throw new Error("No data returned")
  }

  return data
}

export function NavProjects() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: projects, isPending, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => listProjects({}),
  })

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      setIsOpen(false)
      router.push(`/projects/${data.project.id}`)
    },
    onError: (error) => {
      console.error(error)
      toast.error("Failed to create project")
    }
  })

  async function handleCreateProject(values: ProjectFormSchema) {
    await createProjectMutation.mutateAsync({ name: values.name, description: values.description })
  }

  useEffect(() => {
    if (error) {
      console.error(error)
      toast.error("Failed to fetch projects")
    }
  }, [error])

  console.log(projects)

  //const activeProject = projects?.items.find(project => project.id === projectId);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {(isPending || !projects) ? Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <SidebarMenuSkeleton />
            </SidebarMenuItem>
          ))
            : (projects?.items.length ? projects?.items.map(({ project }) => (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/projects/${project.id}`} /*data-active={project.id === activeProject?.id}*/ className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
                    <span>{project.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )) : (
              <SidebarMenuItem>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <SidebarMenuButton variant="outline">
                      Create Project
                    </SidebarMenuButton>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Project</DialogTitle>
                      <DialogDescription>
                        Create a new project to get started.
                      </DialogDescription>
                    </DialogHeader>
                    <ProjectForm className="md:px-0 px-4" onSubmit={handleCreateProject} />
                  </DialogContent>
                </Dialog>
              </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
