import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
//import { CreateClassificationForm } from "./components/create-classification-form"
import { ClassificationTable } from "./components/classification-table"

export interface ClassificationsPageProps {
  params: {
    projectId: string
  }
}

export default async function ClassificationsPage({ params: { projectId } }: ClassificationsPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Classifications</CardTitle>
          <CardDescription>Manage your classifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassificationTable projectId={projectId} />
          {/*<CreateClassificationForm projectId={projectId} />*/}
          {/*<ManagedProjectMemberList projectId={projectId} />*/}
        </CardContent>
      </Card>
    </div>
  )
}