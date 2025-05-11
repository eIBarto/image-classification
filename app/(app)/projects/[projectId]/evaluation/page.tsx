import { Main } from "./components/main";

export interface EvaluationPageProps {
    params: {
        projectId: string
        viewId: string
    }
}

export default function EvaluationPage({ params: { projectId, viewId } }: EvaluationPageProps) {
    return (
        <div>
            <h1>Evaluation</h1>
            <Main projectId={projectId} viewId={viewId} />
        </div>
    )
}