import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ViewFileTable } from "./components/view-file-table"
export interface ViewPageProps {
  params: {
    projectId: string
    viewId: string
  }
}

export default async function ViewPage({ params: { projectId, viewId } }: ViewPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">View</CardTitle>
          <CardDescription>Manage your view.</CardDescription>
        </CardHeader>
        <CardContent>
          <ViewFileTable projectId={projectId} viewId={viewId} />
          {/*<ManagedProjectMemberList projectId={projectId} />*/}
        </CardContent>
      </Card>
    </div>
  )
}