import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { PromptTable } from "./components/prompt-table"

export interface PromptsPageProps {
  params: {
    projectId: string
  }
}

export default async function PromptsPage({ params: { projectId } }: PromptsPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Project Prompts</CardTitle>
          <CardDescription>Manage your project prompts.</CardDescription>
        </CardHeader>
        <CardContent>
          <PromptTable projectId={projectId} />
          {/*<ManagedProjectMemberList projectId={projectId} />*/}
        </CardContent>
      </Card>
    </div>
  )
}