export interface NormalizationOutput {
    status: 'GOOD_STANDING' | 'DELINQUENT' | 'FORFEITED' | 'UNKNOWN';
    amountOwed: string | null;
    summaryNote: string;
}
/**
 * Fast, zero-dependency local TypeScript parser for Coasty browser agent output.
 * Uses regex JSON block matching and fallback keyword heuristics.
 */
export declare function parseEntityStatus(rawText: string): NormalizationOutput;
//# sourceMappingURL=parser.d.ts.map