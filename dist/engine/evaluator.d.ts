import { BusinessInput, ExecutionStepLog } from '../normalizer/schema.js';
import { CoastyClientOptions } from './coasty-client.js';
export interface EvaluatorOptions {
    outputDir?: string;
    coastyClientOptions?: CoastyClientOptions;
    coastyApiKey?: string;
}
export interface RawEvaluationOutput {
    business: BusinessInput;
    taskId: string;
    runUrl: string;
    rawStatusText: string;
    rawAmountOwedText: string | null;
    screenshotPath: string;
    certPdfPath: string | null;
    filingUrl: string | null;
    executionSteps: ExecutionStepLog[];
    stepCount: number;
    executionTimeMs: number;
}
export declare class CoastyWorkflowEvaluator {
    private outputDir;
    private coastyClient;
    constructor(options?: EvaluatorOptions);
    /**
     * Evaluates business entity compliance via official Coasty REST API browser automation
     */
    evaluateEntity(business: BusinessInput, onStepProgress?: (step: ExecutionStepLog, currentStep: number, totalSteps: number) => void): Promise<RawEvaluationOutput>;
    private ensureDummyImage;
    private ensureDummyPdf;
}
//# sourceMappingURL=evaluator.d.ts.map