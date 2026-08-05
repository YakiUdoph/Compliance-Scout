import { z } from 'zod';

export const NormalizedStatusEnum = z.enum([
  'GOOD_STANDING',
  'DELINQUENT',
  'FORFEITED',
  'UNKNOWN'
]);

export type NormalizedStatus = z.infer<typeof NormalizedStatusEnum>;

export const BusinessInputSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  state: z.string().length(2, 'State code must be 2 characters (e.g., DE, CA)'),
  entity_number: z.string().min(1, 'Entity number is required')
});

export type BusinessInput = z.infer<typeof BusinessInputSchema>;

export const NormalizationOutputSchema = z.object({
  status: NormalizedStatusEnum,
  amountOwed: z.string().nullable().default(null),
  summaryNote: z.string()
});

export type NormalizationOutput = z.infer<typeof NormalizationOutputSchema>;

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
