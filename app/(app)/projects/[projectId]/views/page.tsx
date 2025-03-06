import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ViewTable } from "./components/view-table"

export interface ViewsPageProps {
  params: {
    projectId: string
  }
}

export default async function ViewsPage({ params: { projectId } }: ViewsPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Project Views</CardTitle>
          <CardDescription>Manage your project views.</CardDescription>
        </CardHeader>
        <CardContent>
          <ViewTable projectId={projectId} />
          {/*<ManagedProjectMemberList projectId={projectId} />*/}
        </CardContent>
      </Card>
    </div>
  )
}