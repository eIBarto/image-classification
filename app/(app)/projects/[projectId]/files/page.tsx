import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ProjectFileTable } from "./components/project-file-table"
import { ProjectFileUpload } from "./components/project-file-upload"
import { getCurrentUserFromCookies } from "@/lib/amplify-utils"

export interface ProjectFilesPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectFilesPage({ params: { projectId } }: ProjectFilesPageProps) {
  const { userId } = await getCurrentUserFromCookies()

  return (
    <div className="flex flex-1 flex-row gap-4 p-4">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl">Project Files</CardTitle>
          <CardDescription>Manage your project files.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectFileTable projectId={projectId} />
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-xl">Upload Files</CardTitle>
          <CardDescription>Upload files to your project.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectFileUpload projectId={projectId} userId={userId} />
        </CardContent>
      </Card>
    </div>
  )
}