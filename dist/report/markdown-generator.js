export function generateMarkdownReport(report) {
    const dateStr = new Date().toISOString().split('T')[0];
    const tableRows = report.results.map(r => {
        const statusBadge = r.normalizedStatus === 'GOOD_STANDING' ? '🟢 GOOD STANDING' :
            r.normalizedStatus === 'DELINQUENT' ? '🔴 DELINQUENT' :
                r.normalizedStatus === 'FORFEITED' ? '⛔ FORFEITED' : '⚠️ UNKNOWN';
        const certLink = r.certPdfPath ? `[📄 Download PDF](${r.certPdfPath})` : 'N/A (Delinquent)';
        const amountStr = r.amountOwed ? `**${r.amountOwed}**` : '$0.00';
        const coastyRunLink = `[\`${r.taskId}\`](${r.runUrl})`;
        return `| **${r.businessName}** | \`${r.state}\` | \`${r.entityNumber}\` | ${coastyRunLink} | ${r.rawStatus} | ${statusBadge} | ${amountStr} | ${certLink} |`;
    }).join('\n');
    const seconds = (report.totalExecutionTimeMs / 1000).toFixed(2);
    return `# 🛡️ COMPLIANCESCOUT - Executive Secretary of State Audit Report
*Generated on ${dateStr} via Official Coasty REST API (coasty.ai) & Native TypeScript Parser*

## 📊 Executive Summary Matrix

| Metric | Aggregate Value |
| :--- | :--- |
| **Total Entities Scanned** | \`${report.totalProcessed}\` |
| **Entities in Good Standing** | 🟢 \`${report.goodStandingCount}\` |
| **Delinquent / Action Required** | 🔴 \`${report.delinquentCount}\` |
| **Administrative Forfeitures** | ⛔ \`${report.forfeitedCount}\` |
| **Total Outstanding Delinquency Fees** | **${report.totalOwedFormatted}** |
| **Total Computer-Use Micro-Steps Executed** | ⚡ \`${report.totalAutomatedSteps}\` steps |
| **Batch Runtime Duration** | ⏱️ \`${seconds}s\` |

---

## 🔍 Detailed Entity Compliance Status & Verifiable Coasty Run URLs

| Business Entity Name | State | Entity # | Coasty Verifiable Run URL | Raw State Status | Normalized Status | Fees Owed | Certificate PDF |
| :--- | :---: | :---: | :---: | :--- | :---: | :---: | :---: |
${tableRows}

---

## ⚡ Computer-Use Telemetry Verification

> [!NOTE]
> All compliance verifications were autonomous browser driver sessions executed via Coasty's official REST API endpoints (\`https://coasty.ai/v1/runs\` and \`https://coasty.ai/v1/runs/{id}\`).
> Click any Coasty Verifiable Run URL above to inspect step logs, screenshot artifacts, and run telemetry directly on coasty.ai.

---

### 🛡️ Recommended Next Steps
- **For Delinquent Entities**: Review state filing links captured during session and execute pending Annual Report / Franchise Tax payments.
- **For Compliant Entities**: Archive generated Certificates of Good Standing (*_cert.pdf) for corporate records and banking/audit checks.
`;
}
//# sourceMappingURL=markdown-generator.js.map