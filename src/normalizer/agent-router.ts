import { NormalizationOutput, NormalizationOutputSchema, NormalizedStatus } from './schema.js';

export interface AgentRouterConfig {
  apiKey?: string;
  endpointUrl?: string;
  model?: string;
}

export class AgentRouterNormalizer {
  private apiKey: string;
  private endpointUrl: string;
  private model: string;

  constructor(config: AgentRouterConfig = {}) {
    this.apiKey = config.apiKey || process.env.AGENTROUTER_API_KEY || '';
    this.endpointUrl = config.endpointUrl || 'https://agentrouter.org/v1/chat/completions';
    this.model = config.model || 'claude-3-5-sonnet-20241022';
  }

  /**
   * Normalizes raw Secretary of State portal text into strict compliance schema using AgentRouter LLM
   */
  async normalizeStatus(
    rawStatusText: string,
    stateCode: string,
    rawAmountOwedText?: string | null
  ): Promise<NormalizationOutput> {
    if (this.apiKey && this.apiKey !== 'ar_live_demo_key_example' && !this.apiKey.includes('example')) {
      try {
        const prompt = `You are a corporate legal compliance expert. Normalize the following Secretary of State entity status into a JSON compliance object.

State Jurisdiction: ${stateCode}
Raw Portal Status Text: "${rawStatusText}"
Raw Financial / Fee Text: "${rawAmountOwedText || 'None'}"

Rules for 'status':
- "GOOD_STANDING": Entity is active, current, in good standing, or compliant.
- "DELINQUENT": Entity is past due on annual reports, franchise taxes, or owes fees, but not yet fully revoked.
- "FORFEITED": Entity is administratively dissolved, forfeited, revoked, FTB suspended, or voided.
- "UNKNOWN": Unable to determine from raw status.

Format requirements:
Respond ONLY with a valid JSON object matching this TypeScript schema:
{
  "status": "GOOD_STANDING" | "DELINQUENT" | "FORFEITED" | "UNKNOWN",
  "amountOwed": "$XXX.XX" | null,
  "summaryNote": "A concise 1-sentence legal summary of entity standing in ${stateCode}"
}`;

        const response = await fetch(this.endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: 'You are a legal tech LLM status normalizer. Respond strictly in JSON.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' }
          })
        });

        if (response.ok) {
          const data = await response.json() as any;
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsedJson = JSON.parse(content);
            const validated = NormalizationOutputSchema.safeParse(parsedJson);
            if (validated.success) {
              return validated.data;
            }
          }
        }
      } catch (error) {
        console.warn(`[AgentRouterNormalizer] HTTP request to agentrouter.org failed, falling back to rule engine: ${(error as Error).message}`);
      }
    }

    // Fallback deterministic rule engine when API key is unconfigured or call fails
    return this.fallbackRuleNormalize(rawStatusText, stateCode, rawAmountOwedText);
  }

  private fallbackRuleNormalize(
    rawStatusText: string,
    stateCode: string,
    rawAmountText?: string | null
  ): NormalizationOutput {
    const textLower = rawStatusText.toLowerCase();
    let status: NormalizedStatus = 'GOOD_STANDING';
    let amountOwed: string | null = rawAmountText || null;

    if (textLower.includes('forfeited') || textLower.includes('suspended') || textLower.includes('dissolved') || textLower.includes('revoked') || textLower.includes('void')) {
      status = 'FORFEITED';
    } else if (textLower.includes('delinquent') || textLower.includes('past due') || textLower.includes('report due') || textLower.includes('taxes due') || (amountOwed && amountOwed !== '$0.00')) {
      status = 'DELINQUENT';
    } else if (textLower.includes('active') || textLower.includes('good standing') || textLower.includes('current')) {
      status = 'GOOD_STANDING';
    } else {
      status = 'UNKNOWN';
    }

    let summaryNote = `Entity in ${stateCode} evaluated as ${status.replace('_', ' ')}. Raw status: "${rawStatusText.trim()}".`;
    if (status === 'DELINQUENT' && amountOwed) {
      summaryNote += ` Financial delinquency captured: ${amountOwed}.`;
    }

    return {
      status,
      amountOwed,
      summaryNote
    };
  }
}
