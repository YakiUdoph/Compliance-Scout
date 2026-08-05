export declare class CoastyClient {
  apiKey: string;
  mode: string;
  constructor(options?: { apiKey?: string; mode?: string });
  runStep(step: any): Promise<{ status: string; step: any; timestamp: string }>;
}

export declare class OpenCoworkDSLEvaluator {
  client: CoastyClient;
  constructor(client: CoastyClient);
  evaluate(workflow: any, params?: any): Promise<{ executedSteps: number; success: boolean }>;
}

export declare class CostEstimator {
  static estimateRun(stepCount: number, concurrency?: number): { estimatedCostUsd: string; mode: string };
}
