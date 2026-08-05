import { ComplianceResult, BatchSummaryReport } from '../normalizer/schema.js';
export declare class TerminalPresenter {
    static printBanner(): void;
    static printStepProgress(result: ComplianceResult, current: number, total: number): void;
    static printSummaryTable(report: BatchSummaryReport): void;
}
//# sourceMappingURL=presenter.d.ts.map