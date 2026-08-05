import pLimit from 'p-limit';
import fs from 'fs';
import path from 'path';
import { BusinessInput, ComplianceResult, BatchSummaryReport } from '../normalizer/schema.js';
import { CoastyWorkflowEvaluator, EvaluatorOptions } from './evaluator.js';
import { AgentRouterNormalizer, AgentRouterConfig } from '../normalizer/agent-router.js';

const stateConfigsPath = path.resolve(process.cwd(), 'config', 'states.json');
const STATE_CONFIGS = fs.existsSync(stateConfigsPath)
  ? JSON.parse(fs.readFileSync(stateConfigsPath, 'utf-8'))
  : {};

export interface BatchRunnerOptions {
  concurrency?: number;
  evaluatorOptions?: EvaluatorOptions;
  agentRouterConfig?: AgentRouterConfig;
  onProgressUpdate?: (result: ComplianceResult, index: number, total: number) => void;
}

export class BatchComplianceRunner {
  private concurrency: number;
  private evaluator: CoastyWorkflowEvaluator;
  private normalizer: AgentRouterNormalizer;
  private onProgressUpdate?: (result: ComplianceResult, index: number, total: number) => void;

  constructor(options: BatchRunnerOptions = {}) {
    this.concurrency = options.concurrency || Number(process.env.CONCURRENCY_LIMIT) || 3;
    this.evaluator = new CoastyWorkflowEvaluator(options.evaluatorOptions);
    this.normalizer = new AgentRouterNormalizer(options.agentRouterConfig);
    this.onProgressUpdate = options.onProgressUpdate;
  }

  /**
   * Executes compliance checks across a batch of businesses concurrently
   */
  async runBatch(businesses: BusinessInput[]): Promise<BatchSummaryReport> {
    const startTime = Date.now();
    const limit = pLimit(this.concurrency);
    const results: ComplianceResult[] = [];
    let completedCount = 0;

    const tasks = businesses.map((business, idx) => {
      return limit(async () => {
        const evalOutput = await this.evaluator.evaluateEntity(business);
        const stateCode = business.state.toUpperCase();
        const stateMeta = (STATE_CONFIGS as Record<string, any>)[stateCode] || { agency: `${stateCode} Secretary of State` };

        // Normalize raw status via AgentRouter HTTP endpoint (agentrouter.org)
        const normalized = await this.normalizer.normalizeStatus(
          evalOutput.rawStatusText,
          stateCode,
          evalOutput.rawAmountOwedText
        );

        const complianceResult: ComplianceResult = {
          id: `CS-${stateCode}-${business.entity_number}`,
          taskId: evalOutput.taskId,
          runUrl: evalOutput.runUrl,
          businessName: business.business_name,
          state: stateCode,
          stateAgency: stateMeta.agency || `${stateCode} Secretary of State`,
          entityNumber: business.entity_number,
          rawStatus: evalOutput.rawStatusText,
          normalizedStatus: normalized.status,
          amountOwed: normalized.amountOwed,
          summaryNote: normalized.summaryNote,
          screenshotPath: evalOutput.screenshotPath,
          certPdfPath: evalOutput.certPdfPath,
          filingUrl: evalOutput.filingUrl,
          stepCount: evalOutput.stepCount,
          executionSteps: evalOutput.executionSteps,
          executionTimeMs: evalOutput.executionTimeMs,
          timestamp: new Date().toISOString()
        };

        completedCount++;
        results.push(complianceResult);

        if (this.onProgressUpdate) {
          this.onProgressUpdate(complianceResult, completedCount, businesses.length);
        }

        return complianceResult;
      });
    });

    await Promise.all(tasks);

    const totalExecutionTimeMs = Date.now() - startTime;

    // Aggregate summary statistics
    let goodStandingCount = 0;
    let delinquentCount = 0;
    let forfeitedCount = 0;
    let unknownCount = 0;
    let totalOwedNumeric = 0;
    let totalAutomatedSteps = 0;

    for (const r of results) {
      totalAutomatedSteps += r.stepCount;
      if (r.normalizedStatus === 'GOOD_STANDING') goodStandingCount++;
      else if (r.normalizedStatus === 'DELINQUENT') delinquentCount++;
      else if (r.normalizedStatus === 'FORFEITED') forfeitedCount++;
      else unknownCount++;

      if (r.amountOwed) {
        const cleaned = r.amountOwed.replace(/[^0-9.]/g, '');
        const num = parseFloat(cleaned);
        if (!isNaN(num)) {
          totalOwedNumeric += num;
        }
      }
    }

    return {
      totalProcessed: results.length,
      goodStandingCount,
      delinquentCount,
      forfeitedCount,
      unknownCount,
      totalOwedFormatted: `$${totalOwedNumeric.toFixed(2)}`,
      totalExecutionTimeMs,
      totalAutomatedSteps,
      results
    };
  }
}
