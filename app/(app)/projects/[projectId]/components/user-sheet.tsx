import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { UserDataTable } from "./user-data-table"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { CreateProjectMembershipForm } from "./create-project-membership-form"

export interface UserSheetProps {
    projectId: string
}

export function UserSheet({ projectId }: UserSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Users className="h-4 w-4" />
                    <span className="sr-only">Manage users</span>
                </Button>
            </SheetTrigger>
            <SheetContent
                className="sm:max-w-[560px] h-screen flex flex-col"
            >
                <SheetHeader>
                    <SheetTitle>Project Members</SheetTitle>
                    <SheetDescription>
                        Manage project members and their access levels.
                    </SheetDescription>
                </SheetHeader>
                <UserDataTable projectId={projectId} />
                <SheetFooter className="mt-auto">
                    <div className="flex flex-col gap-2 w-full">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    Add Member
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <CreateProjectMembershipForm onSubmit={() => { }} />
                            </DialogContent>
                        </Dialog>
                        <SheetClose asChild>
                            <Button variant="outline" >
                                Done
                            </Button>
                        </SheetClose>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}