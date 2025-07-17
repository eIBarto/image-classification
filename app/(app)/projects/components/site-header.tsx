"use client"

import { HelpCircle } from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex flex-1 items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Projects</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="px-4">
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
                            <DialogDescription>This is a video tutorial for creating a project.</DialogDescription>
                        </DialogHeader>
                        <video autoPlay muted loop preload="auto" className="rounded-sm">
                            <source src="/videos/create-project.mp4" type="video/mp4" />
                            Dein Browser unterstützt das Video-Tag nicht.
                        </video>
                    </DialogContent>
                </Dialog>
            </div>
        </header>
    )
}