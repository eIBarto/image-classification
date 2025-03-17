import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ClassificationCandidateTable } from "./components/classification-candidate-table"
export interface ClassificationPageProps {
  params: {
    projectId: string
    classificationId: string
  }
}


// todo do this




export default function ClassificationPage({ params: { projectId, classificationId } }: ClassificationPageProps) {

  console.log("projectId", projectId)
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Classification</CardTitle>
          <CardDescription>Manage your project classifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <ClassificationCandidateTable classificationId={classificationId} />
          </CardContent>
      </Card>
    </div>
  ) 
}