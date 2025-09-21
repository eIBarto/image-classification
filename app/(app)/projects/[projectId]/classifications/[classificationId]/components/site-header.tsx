"use client"
/**
 * Header for a specific classification
 * - Breadcrumbs, help tabs, and run classification control
 */

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

import { useMutation, useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Play, Loader2, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { ClassificationOptions } from "./classification-options"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export function SiteHeader({ projectId, classificationId }: SiteHeaderProps) {

    const { data: classification } = useQuery({
        queryKey: ["classification", classificationId],
        queryFn: () => getClassification(classificationId),
    })

    const { data: project } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => getProject(projectId),
    })

    const classifyClassificationMutation = useMutation({
        mutationFn: () => classifyClassification({ classificationId: classificationId }),

        onError: () => {
            console.error("Failed to classify candidates")
            toast.error("Failed to classify candidates")
        }
    })

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
            <div className="flex items-center gap-2 ml-auto px-4">
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <HelpCircle className="h-5 w-5" />
                        <span className="sr-only">Hilfe</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="p-1.5 pt-0 overflow-hidden border-0 max-w-screen-lg">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Video-Anleitung</DialogTitle>
                        <DialogDescription>
                            This is a video tutorial for project classifications.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="classification-images" className="relative">
                        <TabsList className="absolute z-10 grid w-auto grid-cols-3 bottom-2 right-2">
                            <TabsTrigger value="classification-images">Bilder</TabsTrigger>
                            <TabsTrigger value="classification-users">Batch-Labeling</TabsTrigger>
                            <TabsTrigger value="classification-actions">Details</TabsTrigger>
                        </TabsList>
                        <TabsContent value="classification-actions">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/classification-actions.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                        <TabsContent value="classification-images">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/classification-images.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                        <TabsContent value="classification-users">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/classification-run.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

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

            </div>
        </header>
    )
}