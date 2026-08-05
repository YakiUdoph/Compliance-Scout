import { z } from 'zod';
export const NormalizedStatusEnum = z.enum([
    'GOOD_STANDING',
    'DELINQUENT',
    'FORFEITED',
    'UNKNOWN'
]);
export const BusinessInputSchema = z.object({
    business_name: z.string().min(1, 'Business name is required'),
    state: z.string().length(2, 'State code must be 2 characters (e.g., DE, CA)'),
    entity_number: z.string().min(1, 'Entity number is required')
});
export const NormalizationOutputSchema = z.object({
    status: NormalizedStatusEnum,
    amountOwed: z.string().nullable().default(null),
    summaryNote: z.string()
});
//# sourceMappingURL=schema.js.map