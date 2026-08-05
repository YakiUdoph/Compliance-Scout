export interface DSLStep {
    stepNumber: number;
    action: 'GOTO' | 'FILL' | 'CLICK' | 'ASSERT_DOM' | 'READ_STATUS' | 'SCREENSHOT' | 'NAVIGATE_FILING' | 'READ_AMOUNT_OWED' | 'REQUEST_CERTIFICATE' | 'LOG_RESULT';
    selector?: string;
    value?: string;
    description: string;
    assertCondition?: string;
    retryOnFailure?: boolean;
}
export interface StateDSLWorkflow {
    stateCode: string;
    stateName: string;
    portalUrl: string;
    steps: DSLStep[];
}
export declare const STATE_WORKFLOWS: Record<string, StateDSLWorkflow>;
//# sourceMappingURL=dsl-workflows.d.ts.map