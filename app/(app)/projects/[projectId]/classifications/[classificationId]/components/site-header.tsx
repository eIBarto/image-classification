"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { useMutation, useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
//import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { ClassificationOptions } from "./classification-options"

const client = generateClient<Schema>();

export interface SiteHeaderProps {
    projectId: string
    classificationId: string
}

async function getProject(projectId: string) {
    const { data, errors } = await client.models.Project.get({ id: projectId })
    if (errors) {
        console.error("Failed to get project")
        throw new Error("Failed to get project")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

async function classifyClassification(options: Schema["classifyClassificationProxy"]["args"]): Promise<void> {
    const { data, errors } = await client.mutations.classifyClassificationProxy(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to classify candidates")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }
}

async function getClassification(classificationId: string) {
    const { data, errors } = await client.models.Classification.get({ id: classificationId })
    if (errors) {
        console.error("Failed to get classification")
        throw new Error("Failed to get classification")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return data
}

//async function deleteClassification(options: Schema["deleteClassificationProxy"]["args"]) {
//    const { data, errors } = await client.mutations.deleteClassificationProxy(options)
//    if (errors) {
//        console.error("Failed to delete classification")
//        throw new Error("Failed to delete classification")
//    }
//
//    if (!data) {
//        console.error("No data returned")
//        throw new Error("No data returned")
//    }
//
//    return data
//}
// todo add loading state
export function SiteHeader({ projectId, classificationId }: SiteHeaderProps) {
    //const router = useRouter()
    //const queryClient = useQueryClient()

    const { data: classification } = useQuery({
        queryKey: ["classification", classificationId],
        queryFn: () => getClassification(classificationId),
    })

    const { data: project } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProject(projectId),
    })

    //const deleteClassificationMutation = useMutation({
    //    mutationFn: () => deleteClassification({ projectId: projectId, id: classificationId }),
    //    onSuccess: () => {
    //        toast.success("Classification deleted")
    //        router.push(`/projects/${projectId}/classifications`)
    //        queryClient.invalidateQueries({ queryKey: ["classifications", projectId] })
    //    },
    //    onError: () => {
    //        console.error("Failed to delete classification")
    //        toast.error("Failed to delete classification")
    //    }
    //})

    const classifyClassificationMutation = useMutation({
        mutationFn: () => classifyClassification({ classificationId: classificationId }),
        //onSuccess: () => {
        //    toast.success("Candidates classified")
        //    queryClient.invalidateQueries({ queryKey: ["classification-candidates", classificationId] })
        //},
        onError: () => {
            console.error("Failed to classify candidates")
            toast.error("Failed to classify candidates")
        }
    })


    //async function handleDeleteClassification() {
    //    await deleteClassificationMutation.mutateAsync()
    //}

    async function handleClassifyClassification() {
        await classifyClassificationMutation.mutateAsync()
    }

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex flex-1 items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink href={`/projects/${projectId}`}>
                                {project?.name || "Project"}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/projects/${projectId}/classifications`}>
                                Classifications
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="truncate max-w-[500px]">{classification?.name || "Classification"}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <ClassificationOptions projectId={projectId} classificationId={classificationId} />
            </div>
            <div className="ml-auto px-4">
                {/*<Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Classification</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete this classification?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button disabled={deleteClassificationMutation.isPending} variant="destructive" onClick={handleDeleteClassification}>
                                {deleteClassificationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>*/}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={classifyClassificationMutation.isPending}>
                            {classifyClassificationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                            <span className="sr-only">Run Classification</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-4 space-y-2">
                        <DialogHeader>
                            <DialogTitle>Run Classification</DialogTitle>
                            <DialogDescription>
                                This process cannot be paused or stopped and may take several minutes. Results will be displayed immediately once available. You can reload the page during the run.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button disabled={classifyClassificationMutation.isPending} variant="default" onClick={handleClassifyClassification}>
                                    {classifyClassificationMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run"}
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/*<NavActions projectId={projectId} />*/}
            </div>
        </header>
    )
}