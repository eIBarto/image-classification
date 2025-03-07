import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { PromptVersionTable } from "./components/prompt-version-table"
export interface PromptPageProps {
  params: {
    projectId: string
    promptId: string
  }
}

export default async function PromptPage({ params: { projectId, promptId } }: PromptPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Prompt Versions</CardTitle>
          <CardDescription>Manage your prompt versions.</CardDescription>
        </CardHeader>
        <CardContent>
          <PromptVersionTable projectId={projectId} promptId={promptId} />
          {/*<ManagedProjectMemberList projectId={projectId} />*/}
        </CardContent>
      </Card>
    </div>
  )
}