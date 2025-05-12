"use client"

import { UserSheet } from "./user-sheet"
import { UploadSheet } from "./upload-sheet"

export interface NavActionsProps {
    projectId: string
    userId: string
}

export function NavActions({ projectId, userId }: NavActionsProps) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <UploadSheet projectId={projectId} userId={userId} />
            <UserSheet projectId={projectId} />
        </div>
    )
}
