"use client"

import { UserSheet } from "./user-sheet"
import { UploadSheet } from "./upload-sheet"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface NavActionsProps {
    projectId: string
    userId: string
}

export function NavActions({ projectId, userId }: NavActionsProps) {
    return (
        <div className="flex items-center gap-2 text-sm">
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
                            This is a video tutorial for project actions.
                        </DialogDescription>
                    </DialogHeader>
                    <Tabs defaultValue="project-images" className="relative">
                        <TabsList className="absolute z-10 grid w-auto grid-cols-3 bottom-2 right-2">
                            <TabsTrigger value="project-images">Bilder</TabsTrigger>
                            <TabsTrigger value="project-users">Nutzer</TabsTrigger>
                            <TabsTrigger value="project-actions">Details</TabsTrigger>
                        </TabsList>
                        <TabsContent value="project-actions">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/project-actions.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                        <TabsContent value="project-images">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/project-images.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                        <TabsContent value="project-users">
                            <video autoPlay muted loop preload="auto" className="rounded-sm aspect-video">
                                <source
                                    src="/videos/project-users.mp4"
                                    type="video/mp4"
                                />
                                Dein Browser unterstützt das Video-Tag nicht.
                            </video>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
            <UploadSheet projectId={projectId} userId={userId} />
            <UserSheet projectId={projectId} />
        </div>
    )
}
