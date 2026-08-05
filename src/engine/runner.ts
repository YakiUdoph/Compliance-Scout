import pLimit from 'p-limit';
import fs from 'fs';
import path from 'path';
import { BusinessInput, ComplianceResult, BatchSummaryReport } from '../normalizer/schema.js';
import { CoastyWorkflowEvaluator, EvaluatorOptions } from './evaluator.js';
import { parseEntityStatus } from '../normalizer/parser.js';
import { updateJobProgress, markJobCompleted, markJobFailed } from './job-store.js';
import { generateMarkdownReport } from '../report/markdown-generator.js';
import { generateHtmlReport } from '../report/html-generator.js';

const stateConfigsPath = path.resolve(process.cwd(), 'config', 'states.json');
const STATE_CONFIGS = fs.existsSync(stateConfigsPath)
  ? JSON.parse(fs.readFileSync(stateConfigsPath, 'utf-8'))
  : {};

export interface BatchRunnerOptions {
  concurrency?: number;
  evaluatorOptions?: EvaluatorOptions;
  onProgressUpdate?: (result: ComplianceResult, index: number, total: number) => void;
}

export class BatchComplianceRunner {
  private concurrency: number;
  private evaluator: CoastyWorkflowEvaluator;
  private onProgressUpdate?: (result: ComplianceResult, index: number, total: number) => void;

  constructor(options: BatchRunnerOptions = {}) {
    this.concurrency = options.concurrency || Number(process.env.CONCURRENCY_LIMIT) || 3;
    this.evaluator = new CoastyWorkflowEvaluator(options.evaluatorOptions);
    this.onProgressUpdate = options.onProgressUpdate;
  }

  /**
   * Asynchronously executes entity audits for a job, updating job-store.ts incrementally.
   */
  async runJobAsync(jobId: string, businesses: BusinessInput[]): Promise<BatchSummaryReport> {
    try {
      const summary = await this.runBatch(businesses, (result, current, total) => {
        const msg = `[${current}/${total}] Audited ${result.businessName} (${result.state}): ${result.normalizedStatus}`;
        updateJobProgress(jobId, result, msg);
      });

      // Generate reports asynchronously
      try {
        const reportsDir = path.resolve(process.cwd(), 'reports');
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

        fs.writeFileSync(path.join(reportsDir, 'COMPLIANCE_REPORT.md'), generateMarkdownReport(summary), 'utf-8');
        fs.writeFileSync(path.join(reportsDir, 'dashboard.html'), generateHtmlReport(summary), 'utf-8');
      } catch (err) {
        console.warn(`[Runner] Non-fatal error writing report files: ${(err as Error).message}`);
      }

      markJobCompleted(jobId, summary);
      return summary;
    } catch (error) {
      const errorMsg = (error as Error).message || 'Batch orchestrator execution failed.';
      markJobFailed(jobId, errorMsg);
      throw error;
    }
  }

  /**
   * Executes compliance checks across a batch of businesses concurrently using Coasty API
   * and local native TypeScript parsing.
   */
  async runBatch(
    businesses: BusinessInput[],
    onProgress?: (result: ComplianceResult, index: number, total: number) => void
  ): Promise<BatchSummaryReport> {
    const startTime = Date.now();
    const limit = pLimit(this.concurrency);
    const results: ComplianceResult[] = [];
    let completedCount = 0;

    const tasks = businesses.map((business, idx) => {
      return limit(async () => {
        try {
          const evalOutput = await this.evaluator.evaluateEntity(business);
          const stateCode = business.state.toUpperCase();
          const stateMeta = (STATE_CONFIGS as Record<string, any>)[stateCode] || { agency: `${stateCode} Secretary of State` };

          // Zero-dependency local native TypeScript status parsing
          const normalized = parseEntityStatus(
            evalOutput.rawStatusText + (evalOutput.rawAmountOwedText ? ` Fees Owed: ${evalOutput.rawAmountOwedText}` : '')
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
            amountOwed: normalized.amountOwed || evalOutput.rawAmountOwedText,
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

          if (onProgress) {
            onProgress(complianceResult, completedCount, businesses.length);
          }
          if (this.onProgressUpdate) {
            this.onProgressUpdate(complianceResult, completedCount, businesses.length);
          }

          return complianceResult;
        } catch (err) {
          // Gracefully log entity evaluation error and proceed
          const stateCode = business.state.toUpperCase();
          const failedResult: ComplianceResult = {
            id: `CS-${stateCode}-${business.entity_number}`,
            taskId: `failed_${Date.now()}`,
            runUrl: `https://coasty.ai/v1/runs/failed`,
            businessName: business.business_name,
            state: stateCode,
            stateAgency: `${stateCode} Secretary of State`,
            entityNumber: business.entity_number,
            rawStatus: 'Evaluation Error',
            normalizedStatus: 'UNKNOWN',
            amountOwed: null,
            summaryNote: `Execution error: ${(err as Error).message}`,
            screenshotPath: '',
            certPdfPath: null,
            filingUrl: null,
            stepCount: 0,
            executionSteps: [],
            executionTimeMs: 0,
            timestamp: new Date().toISOString()
          };

          completedCount++;
          results.push(failedResult);

          if (onProgress) {
            onProgress(failedResult, completedCount, businesses.length);
          }
          return failedResult;
        }
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

    const firstError = results.find(r => r.rawStatus === 'Evaluation Error')?.summaryNote;
    if (results.length > 0 && results.every(r => r.rawStatus === 'Evaluation Error')) {
      throw new Error(firstError || 'Coasty API execution failed for all target entities.');
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
