import { SidebarInset } from "@/components/ui/sidebar"
import { PropsWithChildren } from "react"

export default function MembersLayout({ children }: PropsWithChildren) {
    return (
        <SidebarInset>
            {children}
        </SidebarInset>
    )
}