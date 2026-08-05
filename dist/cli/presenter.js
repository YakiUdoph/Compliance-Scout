export class TerminalPresenter {
    static printBanner() {
        console.log(`
\x1b[36m   ______ ____   __  ___ ____   __    ____ ___    _  __ ______  ______ _____ ____   __  VT\x1b[0m
\x1b[36m  / ____// __ \\ /  |/  // __ \\ / /   /  _//   |  / |/ // ____/ / ____// ___// __ \\ / /  / /  \x1b[0m
\x1b[36m / /    / /_/ // /|_/ // /_/ // /    / / / /| | /    // /     / __/   \\__ \\/ / / // /  / /   \x1b[0m
\x1b[36m/ /___ / ____// /  / // ____// /___ _/ /_/ ___ |/    // /___  / /___ ___/ / /_/ // /__/ /____\x1b[0m
\x1b[36m\\____//_/    /_/  /_//_/    /_____//___//_/  |_/_/|_/ \\____/ /_____//____/\\____/ \\____/_____/\x1b[0m

\x1b[1m\x1b[32m  🛡️  COMPLIANCESCOUT v1.0.0\x1b[0m - \x1b[90mAutonomous Secretary of State Compliance Engine\x1b[0m
\x1b[90m  Powered by Coasty Computer-Use Agents & AgentRouter LLM Status Normalizer\x1b[0m
`);
    }
    static printStepProgress(result, current, total) {
        const statusBadge = result.normalizedStatus === 'GOOD_STANDING' ? '\x1b[42m\x1b[30m GOOD STANDING \x1b[0m' :
            result.normalizedStatus === 'DELINQUENT' ? '\x1b[41m\x1b[37m DELINQUENT \x1b[0m' :
                result.normalizedStatus === 'FORFEITED' ? '\x1b[43m\x1b[30m FORFEITED \x1b[0m' : '\x1b[47m\x1b[30m UNKNOWN \x1b[0m';
        const fees = result.amountOwed ? `\x1b[31m${result.amountOwed}\x1b[0m` : '\x1b[90m$0.00\x1b[0m';
        const cert = result.certPdfPath ? '📄 Cert PDF' : '🔗 Filing URL';
        console.log(`\x1b[90m[${current}/${total}]\x1b[0m ` +
            `\x1b[1m${result.businessName.padEnd(32)}\x1b[0m ` +
            `\x1b[36m${result.state}\x1b[0m ` +
            `#${result.entityNumber.padEnd(12)} ` +
            `${statusBadge} ` +
            `Fees: ${fees} ` +
            `\x1b[90m(${result.stepCount} steps, ${(result.executionTimeMs / 1000).toFixed(2)}s)\x1b[0m`);
    }
    static printSummaryTable(report) {
        console.log('\n' + '='.repeat(90));
        console.log('\x1b[1m\x1b[33m 📊 EXECUTIVE COMPLIANCE AUDIT SUMMARY\x1b[0m');
        console.log('='.repeat(90));
        console.log(` \x1b[1mTotal Entities Audited:\x1b[0m  ${report.totalProcessed}`);
        console.log(` \x1b[32m🟢 In Good Standing:\x1b[0m     ${report.goodStandingCount}`);
        console.log(` \x1b[31m🔴 Delinquent / Action:\x1b[0m  ${report.delinquentCount}`);
        console.log(` \x1b[33m⛔ Administrative Forfeit:\x1b[0m ${report.forfeitedCount}`);
        console.log(` \x1b[1m💰 Outstanding Fees:\x1b[0m     \x1b[31m\x1b[1m${report.totalOwedFormatted}\x1b[0m`);
        console.log(` \x1b[1m⚡ Computer-Use Steps:\x1b[0m   \x1b[36m\x1b[1m${report.totalAutomatedSteps} steps\x1b[0m`);
        console.log(` \x1b[1m⏱️  Batch Execution Time:\x1b[0m ${(report.totalExecutionTimeMs / 1000).toFixed(2)}s`);
        console.log('='.repeat(90) + '\n');
    }
}
//# sourceMappingURL=presenter.js.map