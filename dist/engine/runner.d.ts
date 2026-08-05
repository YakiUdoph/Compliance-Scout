import { BusinessInput, ComplianceResult, BatchSummaryReport } from '../normalizer/schema.js';
import { EvaluatorOptions } from './evaluator.js';
export interface BatchRunnerOptions {
    concurrency?: number;
    evaluatorOptions?: EvaluatorOptions;
    onProgressUpdate?: (result: ComplianceResult, index: number, total: number) => void;
}
export declare class BatchComplianceRunner {
    private concurrency;
    private evaluator;
    private onProgressUpdate?;
    constructor(options?: BatchRunnerOptions);
    /**
     * Asynchronously executes entity audits for a job, updating job-store.ts incrementally.
     */
    runJobAsync(jobId: string, businesses: BusinessInput[]): Promise<BatchSummaryReport>;
    /**
     * Executes compliance checks across a batch of businesses concurrently using Coasty API
     * and local native TypeScript parsing.
     */
    runBatch(businesses: BusinessInput[], onProgress?: (result: ComplianceResult, index: number, total: number) => void): Promise<BatchSummaryReport>;
}
//# sourceMappingURL=runner.d.ts.map