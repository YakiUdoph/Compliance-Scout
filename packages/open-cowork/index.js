export class CoastyClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || process.env.SK_COASTY_KEY || '';
    this.mode = options.mode || 'managed';
  }

  async runStep(step) {
    return { status: 'SUCCESS', step, timestamp: new Date().toISOString() };
  }
}

export class OpenCoworkDSLEvaluator {
  constructor(client) {
    this.client = client;
  }

  async evaluate(workflow, params = {}) {
    return { executedSteps: workflow.steps?.length || 0, success: true };
  }
}

export class CostEstimator {
  static estimateRun(stepCount, concurrency = 1) {
    return { estimatedCostUsd: (stepCount * 0.002).toFixed(4), mode: 'managed-free-tier' };
  }
}
