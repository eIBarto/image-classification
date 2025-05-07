"use client"

import { Button } from "@/components/ui/button"
import { ChartColumnBig } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose, SheetTrigger } from "@/components/ui/sheet"
import { useQuery } from "@tanstack/react-query"
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useEffect } from "react"
import { toast } from "sonner"
import { z } from "zod"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    LabelList,
    Cell,
    type LegendType,
    CartesianGrid,
} from "recharts"
import {
    ChartContainer,
    ChartTooltip,
    ChartLegend,
    type ChartConfig,
} from "@/components/ui/chart"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const client = generateClient<Schema>();

const cohenKappaInterpretationLevels = [
    { name: "Poor agreement", range: "< 0", color: "var(--kappa-poor)", className: "bg-kappa-poor", test: (score: number) => score < 0.00 },
    { name: "Slight agreement", range: "0.00 - 0.20", color: "var(--kappa-slight)", className: "bg-kappa-slight", test: (score: number) => score >= 0.00 && score <= 0.20 },
    { name: "Fair agreement", range: "0.21 - 0.40", color: "var(--kappa-fair)", className: "bg-kappa-fair", test: (score: number) => score >= 0.21 && score <= 0.40 },
    { name: "Moderate agreement", range: "0.41 - 0.60", color: "var(--kappa-moderate)", className: "bg-kappa-moderate", test: (score: number) => score >= 0.41 && score <= 0.60 },
    { name: "Substantial agreement", range: "0.61 - 0.80", color: "var(--kappa-substantial)", className: "bg-kappa-substantial", test: (score: number) => score >= 0.61 && score <= 0.80 },
    { name: "Almost perfect agreement", range: "0.81 - 1.00", color: "var(--kappa-almost-perfect)", className: "bg-kappa-almostPerfect", test: (score: number) => score >= 0.81 && score <= 1.0 },
];

function getInterpretationDetails(score: number): { name: string; color: string; className: string } {
    for (const level of cohenKappaInterpretationLevels) {
        if (level.test(score)) {
            return { name: level.name, color: level.color, className: level.className };
        }
    }
    return { name: "N/A", color: "var(--muted-foreground)", className: "bg-muted-foreground" }; // Default/fallback
}

export const cohenKappaSchema = z.object({
    cohens_kappa_scores: z.array(z.object({
        score: z.number(),
        classifications: z.array(z.object({
            name: z.string(),
            id: z.string(),
        })),
    })),
})

type CohenKappaScores = z.infer<typeof cohenKappaSchema>["cohens_kappa_scores"];

async function getCohenKappa(options: Schema["getCohenKappa"]["args"]) {
    const { data, errors } = await client.queries.getCohenKappa(options)

    if (errors) {
        console.error(errors)
        throw new Error("Failed to get Cohens Kappa")
    }

    if (!data) {
        console.error("No data returned")
        throw new Error("No data returned")
    }

    return cohenKappaSchema.parse(data)
}

// Define an interface for the custom legend item payload
interface CustomLegendItemPayload {
    legendName: string;
    legendRange: string;
}

export function EvaluationSheet({ projectId, viewId }: { projectId: string, viewId: string }) {
    const { data, error, isLoading } = useQuery({
        queryKey: ["cohen-kappa", projectId, viewId],
        queryFn: () => getCohenKappa({ projectId, viewId })
    })

    useEffect(() => {
        if (error) {
            console.error(error)
            toast.error("Failed to get Cohens Kappa")
        }
    }, [error])

    const renderChart = (scores: CohenKappaScores) => {
        const chartData = scores.map(item => ({
            pairName: `${item.classifications[0].name} vs ${item.classifications[1].name}`,
            score: parseFloat(item.score.toFixed(2)),
            // labelColor: "hsl(var(--background))", // Not needed with new approach
        }));

        if (chartData.length === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Cohen&apos;s Kappa Evaluation</CardTitle>
                        <CardDescription>Pairwise Agreement Scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">No evaluation data available to display.</p>
                    </CardContent>
                    <CardFooter>
                        <div className="text-muted-foreground text-sm">No scores to evaluate.</div>
                    </CardFooter>
                </Card>
            );
        }

        // Simplified chartConfig, colors will be dynamic per bar
        const chartConfig = {
            score: {
                label: "Score",
                // color: "hsl(var(--chart-1))", // Color will be dynamic
            },
            label: { // For labels inside the bar
                color: "hsl(var(--background))",
            }
        } satisfies ChartConfig;


        return (
            <Card>
                <CardHeader>
                    <CardTitle>Cohen&apos;s Kappa Evaluation</CardTitle>
                    <CardDescription>Pairwise Agreement Scores</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="w-full min-h-[200px] max-h-[600px] pr-2">
                        <BarChart
                            accessibilityLayer
                            data={chartData}
                            layout="vertical"
                            margin={{
                                left: 10, // Adjust left margin to give space for Y-axis labels if shown or to shift bars
                                right: 40, // Increased right margin for score labels
                                top: 5,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="pairName"
                                type="category"
                                tickLine={false}
                                axisLine={false}
                                tick={false} // Hiding ticks as labels are inside the bar
                                // tickFormatter={(value) => value.slice(0, 3)} // Example, adjust if needed or remove if labels are inside
                                hide // Hiding Y-axis, labels are inside the bar
                            />
                            <XAxis
                                type="number"
                                dataKey="score"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                domain={[0, 1]}
                                ticks={[0, 0.25, 0.5, 0.75, 1.0]}
                                tickFormatter={(value) => value.toFixed(2)}
                                fontSize={11}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <ChartTooltip
                                cursor={false}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        const score = data.score as number;
                                        const pairLabel = data.pairName; // Y-axis dataKey (pairName)
                                        const interpretationDetails = getInterpretationDetails(score);
                                        return (
                                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                                                <div className="grid grid-cols-1 gap-2">
                                                    <div className="font-semibold text-sm">{pairLabel}</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${interpretationDetails.className}`}></span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Score: {score.toFixed(2)} ({interpretationDetails.name})
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="score"
                                layout="vertical"
                                // fill="var(--color-score)" // Will be dynamic using Cell
                                radius={6} // Rounded corners on all sides
                                barSize={35} // Fixed bar size, adjust as needed
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`hsl(${getInterpretationDetails(entry.score).color})`} />
                                ))}
                                <LabelList
                                    dataKey="pairName"
                                    position="insideLeft"
                                    offset={8}
                                    className="fill-[var(--color-label)]" // Using chartConfig for label color
                                    fontSize={12}
                                    formatter={(value: string) => {
                                        const parts = value.split(' vs ');
                                        // Attempt to fit on one line if possible, or wrap.
                                        // This might need more sophisticated logic for optimal display.
                                        return parts.length > 1 ? `${parts[0]} vs\n${parts[1]}` : value;
                                    }}
                                    style={{ whiteSpace: 'pre-line' }} // Ensure newline characters are respected
                                />
                                <LabelList
                                    dataKey="score"
                                    position="right"
                                    offset={8}
                                    className="fill-foreground font-medium"
                                    fontSize={12}
                                    formatter={(value: number) => value.toFixed(2)}
                                />
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                    <div className="w-full pt-4 mt-4">
                        <ChartLegend
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            content={(_legendProps) => {
                                const customLegendPayload = cohenKappaInterpretationLevels.map(level => ({
                                    value: level.name,
                                    type: 'rect' as LegendType,
                                    color: `hsl(${level.color})`,
                                    id: level.name,
                                    payload: {
                                        legendName: level.name,
                                        legendRange: level.range,
                                    } as CustomLegendItemPayload
                                }));
                                return (
                                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                                        {customLegendPayload.map(item => (
                                            <div key={item.id} className="flex items-center gap-1.5">
                                                <span
                                                    className="w-2.5 h-2.5 shrink-0 rounded-[2px]"
                                                    style={{ backgroundColor: item.color }}
                                                />
                                                {/* Use the typed payload */}
                                                <span>{item.value} <span className="text-muted-foreground">({item.payload?.legendRange})</span></span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
                    <div className="leading-none text-muted-foreground">
                        Cohen&apos;s Kappa scores represent the degree of agreement between classifier pairs.
                    </div>
                </CardFooter>
            </Card>
        )
    }

    return <Sheet>
        <SheetTrigger asChild>
            <Button variant="ghost">
                <ChartColumnBig className="h-4 w-4" />
                <span className="sr-only">Evaluation</span>
            </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[600px]">
            <SheetHeader>
                <SheetTitle>Evaluation Metrics</SheetTitle>
                <SheetDescription>
                    Cohen&apos;s Kappa scores for pairwise classification comparisons.
                </SheetDescription>
            </SheetHeader>
            <div className="py-4">
                {isLoading && <p className="text-center">Loading evaluation data...</p>}
                {error && <p className="text-center text-destructive">Could not load evaluation data.</p>}
                {data && data.cohens_kappa_scores && renderChart(data.cohens_kappa_scores)}
            </div>
        </SheetContent>
    </Sheet>

}