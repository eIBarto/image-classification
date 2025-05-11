"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { CohenKappaScores } from "./evaluation-sheet" // Assuming CohenKappaScores is exported from there
import { getCohenKappaInterpretationDetails } from "./evaluation-sheet" // Assuming getInterpretationDetails is exported

interface CohenKappaTableProps {
    scores: CohenKappaScores;
}

export function CohenKappaTable({ scores }: CohenKappaTableProps) {
    if (!scores || scores.length === 0) {
        return <p className="text-center text-muted-foreground">No Cohen&apos;s Kappa scores to display in table.</p>;
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[35%]">Classifier Pair</TableHead>
                        <TableHead className="w-[15%] text-right">Kappa</TableHead>
                        <TableHead className="w-[15%] text-right">Overlap</TableHead>
                        <TableHead className="w-[35%]">Interpretation</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {scores.map((item, index) => {
                        const interpretation = getCohenKappaInterpretationDetails(item.score);
                        const pairName = `${item.classifications[0].name} vs ${item.classifications[1].name}`;
                        return (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{pairName}</TableCell>
                                <TableCell className="text-right">{item.score.toFixed(2)}</TableCell>
                                <TableCell className="text-right">N/A</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={`border-0 ${interpretation.className} text-white`}>
                                        {interpretation.name}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
} 