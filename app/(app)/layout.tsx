import { SidebarProvider } from "@/components/ui/sidebar"
import { PropsWithChildren } from "react";
import { AppSidebar } from "./components/app-sidebar"

export default async function Layout({ children }: PropsWithChildren) {

    return (
        <div className="flex flex-1 flex-col">
            <SidebarProvider>
                <AppSidebar />
                {children}
            </SidebarProvider >
        </div>
    )
}