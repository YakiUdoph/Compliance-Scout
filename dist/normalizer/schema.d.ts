import { z } from 'zod';
export declare const NormalizedStatusEnum: z.ZodEnum<["GOOD_STANDING", "DELINQUENT", "FORFEITED", "UNKNOWN"]>;
export type NormalizedStatus = z.infer<typeof NormalizedStatusEnum>;
export declare const BusinessInputSchema: z.ZodObject<{
    business_name: z.ZodString;
    state: z.ZodString;
    entity_number: z.ZodString;
}, "strip", z.ZodTypeAny, {
    business_name: string;
    state: string;
    entity_number: string;
}, {
    business_name: string;
    state: string;
    entity_number: string;
}>;
export type BusinessInput = z.infer<typeof BusinessInputSchema>;
export declare const NormalizationOutputSchema: z.ZodObject<{
    status: z.ZodEnum<["GOOD_STANDING", "DELINQUENT", "FORFEITED", "UNKNOWN"]>;
    amountOwed: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    summaryNote: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "GOOD_STANDING" | "DELINQUENT" | "FORFEITED" | "UNKNOWN";
    amountOwed: string | null;
    summaryNote: string;
}, {
    status: "GOOD_STANDING" | "DELINQUENT" | "FORFEITED" | "UNKNOWN";
    summaryNote: string;
    amountOwed?: string | null | undefined;
}>;
import { NormalizationOutput } from './parser.js';
export type { NormalizationOutput };
export interface ExecutionStepLog {
    stepNumber: number;
    action: string;
    targetSelector?: string;
    description: string;
    status: 'SUCCESS' | 'WARNING' | 'FAILED';
    timestamp: string;
}
export interface ComplianceResult {
    id: string;
    taskId: string;
    runUrl: string;
    businessName: string;
    state: string;
    stateAgency: string;
    entityNumber: string;
    rawStatus: string;
    normalizedStatus: NormalizedStatus;
    amountOwed: string | null;
    summaryNote: string;
    screenshotPath: string;
    certPdfPath: string | null;
    filingUrl: string | null;
    stepCount: number;
    executionSteps: ExecutionStepLog[];
    executionTimeMs: number;
    timestamp: string;
}
export interface BatchSummaryReport {
    totalProcessed: number;
    goodStandingCount: number;
    delinquentCount: number;
    forfeitedCount: number;
    unknownCount: number;
    totalOwedFormatted: string;
    totalExecutionTimeMs: number;
    totalAutomatedSteps: number;
    results: ComplianceResult[];
}
//# sourceMappingURL=schema.d.ts.map