import { usePathname } from "next/navigation"

export type AppPathName = "views" | "memberships" | "files"
export interface AppPathValues extends AppPathBase {
    projectId: string
    path: AppPathName | null
    resourceId?: string
    error: null
}

export interface AppPathError extends AppPathBase {
    error: Error
}

export interface AppPathBase {
    value: string
}

export type AppPath = AppPathValues | AppPathError

export const AppPathRegex = /\/projects\/(?<projectId>[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})(?:\/(?<path>views|memberships|files)(?:\/(?<resourceId>[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}))?)?/i

export function useAppPath(): AppPath {
    const pathname = usePathname()
    const match = pathname.match(AppPathRegex)

    if (!match?.groups) {
        return {
            value: pathname,
            error: new Error("No app path found"),
        }
    }

    return {
        projectId: match.groups.projectId,
        path: match.groups.path as AppPathName || null,
        resourceId: match.groups.resourceId,
        value: pathname,
        error: null,
    }
}