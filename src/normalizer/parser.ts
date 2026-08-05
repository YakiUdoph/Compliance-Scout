export interface NormalizationOutput {
  status: 'GOOD_STANDING' | 'DELINQUENT' | 'FORFEITED' | 'UNKNOWN';
  amountOwed: string | null;
  summaryNote: string;
}

/**
 * Fast, zero-dependency local TypeScript parser for Coasty browser agent output.
 * Uses regex JSON block matching and fallback keyword heuristics.
 */
export function parseEntityStatus(rawText: string): NormalizationOutput {
  try {
    // 1. Try to extract raw JSON block from agent output
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        const validStatuses = ['GOOD_STANDING', 'DELINQUENT', 'FORFEITED', 'UNKNOWN'];
        const status = validStatuses.includes(parsed.status) ? (parsed.status as NormalizationOutput['status']) : 'UNKNOWN';
        const amountOwed = parsed.amountOwed || null;
        const summaryNote = parsed.summaryNote || `Extracted entity status: ${status}.`;

        return {
          status,
          amountOwed,
          summaryNote
        };
      } catch (e) {
        // Fallthrough to regex keyword heuristics
      }
    }

    // 2. Keyword & Regex Fallback Engine
    const text = rawText.toUpperCase();
    let status: NormalizationOutput['status'] = 'UNKNOWN';

    if (text.includes('FORFEITED') || text.includes('SUSPENDED') || text.includes('DISSOLVED') || text.includes('REVOKED') || text.includes('VOID')) {
      status = 'FORFEITED';
    } else if (text.includes('DELINQUENT') || text.includes('PAST DUE') || text.includes('TAXES DUE') || text.includes('REPORT DUE')) {
      status = 'DELINQUENT';
    } else if (text.includes('GOOD STANDING') || text.includes('ACTIVE') || text.includes('CURRENT') || text.includes('COMPLIANT')) {
      status = 'GOOD_STANDING';
    }

    // Extract dollar amounts (e.g. $800.00, $150.00)
    const moneyMatch = rawText.match(/\$\d+(?:\.\d{2})?/);
    const amountOwed = moneyMatch ? moneyMatch[0] : null;

    if (status === 'GOOD_STANDING' && amountOwed) {
      status = 'DELINQUENT';
    }

    const summaryNote = `Native TypeScript parser evaluated status as ${status.replace('_', ' ')}. Raw text: "${rawText.slice(0, 100).trim()}...".`;

    return {
      status,
      amountOwed,
      summaryNote
    };
  } catch (err) {
    return {
      status: 'UNKNOWN',
      amountOwed: null,
      summaryNote: `Parsing failure: ${(err as Error).message}`
    };
  }
}
