import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { ProjectMembershipTable } from "./components/project-membership"

export interface ProjectMembershipsPageProps {
  params: {
    projectId: string
  }
}

export default async function ProjectMembershipsPage({ params: { projectId } }: ProjectMembershipsPageProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Project Members</CardTitle>
          <CardDescription>Manage your project members.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectMembershipTable projectId={projectId} />
          {/*<ManagedProjectMemberList projectId={projectId} />*/}
        </CardContent>
      </Card>
    </div>
  )
}