"use client"

import { Button } from "@/components/ui/button"
import { ChartColumnBig } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import EvaluationResults from "./evaluation/evaluation-results"; // Adjusted path

export function AnalyticsSheet({ projectId, viewId }: { projectId: string, viewId: string }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost">
                    <ChartColumnBig className="h-4 w-4" />
                    <span className="sr-only">Evaluation</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-[864px] max-h-screen flex-1 flex flex-col overflow-hidden gap-4 w-full">
                <SheetHeader>
                    <SheetTitle>Evaluation Results</SheetTitle>
                    <SheetDescription>
                        Detailed evaluation metrics and data overview.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto p-1">
                    <EvaluationResults projectId={projectId} viewId={viewId} />
                </div>
            </SheetContent>
        </Sheet>
    );
}