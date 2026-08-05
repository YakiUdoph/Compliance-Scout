import { BusinessInput, ComplianceResult, BatchSummaryReport } from '../normalizer/schema.js';
export type AuditJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export interface AuditJobLog {
    taskId: string;
    message: string;
    timestamp: string;
}
export interface AuditJob {
    jobId: string;
    status: AuditJobStatus;
    totalCount: number;
    completedCount: number;
    businesses: BusinessInput[];
    results: ComplianceResult[];
    summary: BatchSummaryReport | null;
    activeLogs: AuditJobLog[];
    createdAt: string;
    updatedAt: string;
    error: string | null;
}
/**
 * Initializes a new job record in the registry and returns it.
 */
export declare function createJob(businesses: BusinessInput[]): AuditJob;
/**
 * Retrieves a job record by jobId.
 */
export declare function getJob(jobId: string): AuditJob | undefined;
/**
 * Returns all registered jobs sorted by recency.
 */
export declare function getAllJobs(): AuditJob[];
/**
 * Updates an active job record with an audited result item.
 */
export declare function updateJobProgress(jobId: string, result: ComplianceResult, message: string): void;
/**
 * Marks a job as COMPLETED and sets the final summary report.
 */
export declare function markJobCompleted(jobId: string, summary: BatchSummaryReport): void;
/**
 * Marks a job as FAILED with an error message.
 */
export declare function markJobFailed(jobId: string, errorMsg: string): void;
//# sourceMappingURL=job-store.d.ts.map