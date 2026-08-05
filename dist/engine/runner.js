import pLimit from 'p-limit';
import fs from 'fs';
import path from 'path';
import { CoastyWorkflowEvaluator } from './evaluator.js';
import { parseEntityStatus } from '../normalizer/parser.js';
const stateConfigsPath = path.resolve(process.cwd(), 'config', 'states.json');
const STATE_CONFIGS = fs.existsSync(stateConfigsPath)
    ? JSON.parse(fs.readFileSync(stateConfigsPath, 'utf-8'))
    : {};
export class BatchComplianceRunner {
    concurrency;
    evaluator;
    onProgressUpdate;
    constructor(options = {}) {
        this.concurrency = options.concurrency || Number(process.env.CONCURRENCY_LIMIT) || 3;
        this.evaluator = new CoastyWorkflowEvaluator(options.evaluatorOptions);
        this.onProgressUpdate = options.onProgressUpdate;
    }
    /**
     * Executes compliance checks across a batch of businesses concurrently using Coasty API
     * and local native TypeScript parsing.
     */
    async runBatch(businesses) {
        const startTime = Date.now();
        const limit = pLimit(this.concurrency);
        const results = [];
        let completedCount = 0;
        const tasks = businesses.map((business, idx) => {
            return limit(async () => {
                const evalOutput = await this.evaluator.evaluateEntity(business);
                const stateCode = business.state.toUpperCase();
                const stateMeta = STATE_CONFIGS[stateCode] || { agency: `${stateCode} Secretary of State` };
                // Zero-dependency local native TypeScript status parsing
                const normalized = parseEntityStatus(evalOutput.rawStatusText + (evalOutput.rawAmountOwedText ? ` Fees Owed: ${evalOutput.rawAmountOwedText}` : ''));
                const complianceResult = {
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
            if (r.normalizedStatus === 'GOOD_STANDING')
                goodStandingCount++;
            else if (r.normalizedStatus === 'DELINQUENT')
                delinquentCount++;
            else if (r.normalizedStatus === 'FORFEITED')
                forfeitedCount++;
            else
                unknownCount++;
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
//# sourceMappingURL=runner.js.map