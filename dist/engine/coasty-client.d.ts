export interface CoastyTaskRequest {
    task: string;
    max_steps?: number;
    metadata?: Record<string, any>;
}
export interface CoastyTaskResponse {
    id: string;
    taskId: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    runUrl: string;
    createdAt: string;
}
export interface CoastyRunStep {
    stepNumber: number;
    action: 'type_text' | 'click' | 'scroll' | 'wait' | 'screenshot' | 'assert' | 'extract';
    description: string;
    selector?: string;
    status: 'SUCCESS' | 'FAILED';
    timestamp: string;
}
export interface CoastyRunResult {
    id: string;
    taskId: string;
    status: 'completed' | 'failed';
    runUrl: string;
    stepCount: number;
    steps: CoastyRunStep[];
    screenshotUrl?: string;
    certPdfUrl?: string;
    rawOutputText?: string;
    rawAmountOwedText?: string;
    executionTimeMs: number;
}
export interface CoastyClientOptions {
    apiKey?: string;
    baseUrl?: string;
    pollIntervalMs?: number;
}
export declare class CoastyClient {
    private apiKey;
    private baseUrl;
    private pollIntervalMs;
    constructor(options?: CoastyClientOptions);
    /**
     * Submits a browser automation task to Coasty's official API endpoint POST /v1/tasks
     */
    createTask(request: CoastyTaskRequest): Promise<CoastyTaskResponse>;
    /**
     * Polls Coasty run status endpoint GET /v1/runs/{id} until task is completed or failed
     */
    pollRunUntilCompletion(taskId: string, onStepProgress?: (step: CoastyRunStep, current: number, total: number) => void): Promise<CoastyRunResult>;
    private simulateCoastyRun;
    private isLiveKeyConfigured;
}
//# sourceMappingURL=coasty-client.d.ts.map