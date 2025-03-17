import { SidebarProvider } from "@/components/ui/sidebar"
import { PrefetchedAppSidebar } from "@/components/prefetched-app-sidebar"
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <SidebarProvider>
            <PrefetchedAppSidebar />
            {children}
        </SidebarProvider >
    )
}