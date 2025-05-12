import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { ProjectFileUpload } from "./project-file-upload"

export interface UploadSheetProps {
    projectId: string
    userId: string
}

export function UploadSheet({ projectId, userId }: UploadSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Upload file</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                className="h-screen flex flex-col"
            >
                <SheetHeader>
                    <SheetTitle>Uploads</SheetTitle>
                    <SheetDescription>
                        Upload files to this project.
                    </SheetDescription>
                </SheetHeader>
                <ProjectFileUpload projectId={projectId} userId={userId} />
                <SheetFooter className="mt-auto">
                    <SheetClose asChild>
                        <Button variant="outline" className="w-full">
                            Done
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}