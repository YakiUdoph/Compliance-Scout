import { NormalizationOutput } from './schema.js';
export interface AgentRouterConfig {
    apiKey?: string;
    endpointUrl?: string;
    model?: string;
}
export declare class AgentRouterNormalizer {
    private apiKey;
    private endpointUrl;
    private model;
    constructor(config?: AgentRouterConfig);
    /**
     * Normalizes raw Secretary of State portal text into strict compliance schema using AgentRouter LLM
     */
    normalizeStatus(rawStatusText: string, stateCode: string, rawAmountOwedText?: string | null): Promise<NormalizationOutput>;
    private fallbackRuleNormalize;
}
//# sourceMappingURL=agent-router.d.ts.map