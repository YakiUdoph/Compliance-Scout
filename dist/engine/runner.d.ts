import { BusinessInput, ComplianceResult, BatchSummaryReport } from '../normalizer/schema.js';
import { EvaluatorOptions } from './evaluator.js';
import { AgentRouterConfig } from '../normalizer/agent-router.js';
export interface BatchRunnerOptions {
    concurrency?: number;
    evaluatorOptions?: EvaluatorOptions;
    agentRouterConfig?: AgentRouterConfig;
    onProgressUpdate?: (result: ComplianceResult, index: number, total: number) => void;
}
export declare class BatchComplianceRunner {
    private concurrency;
    private evaluator;
    private normalizer;
    private onProgressUpdate?;
    constructor(options?: BatchRunnerOptions);
    /**
     * Executes compliance checks across a batch of businesses concurrently
     */
    runBatch(businesses: BusinessInput[]): Promise<BatchSummaryReport>;
}
//# sourceMappingURL=runner.d.ts.map