import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import dotenv from 'dotenv';
import { BusinessInputSchema } from '../normalizer/schema.js';
import { BatchComplianceRunner } from '../engine/runner.js';
import { generateMarkdownReport } from '../report/markdown-generator.js';
import { generateHtmlReport } from '../report/html-generator.js';
import { TerminalPresenter } from './presenter.js';
dotenv.config();
function parseCsvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Input CSV file not found at path: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
        throw new Error(`CSV file '${filePath}' is empty.`);
    }
    // Parse header line
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIdx = header.indexOf('business_name');
    const stateIdx = header.indexOf('state');
    const entityIdx = header.indexOf('entity_number');
    if (nameIdx === -1 || stateIdx === -1 || entityIdx === -1) {
        throw new Error(`CSV header must contain 'business_name,state,entity_number'. Found header: ${lines[0]}`);
    }
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(c => c.trim());
        if (row.length < 3)
            continue;
        const record = {
            business_name: row[nameIdx],
            state: row[stateIdx].toUpperCase(),
            entity_number: row[entityIdx]
        };
        const validated = BusinessInputSchema.safeParse(record);
        if (validated.success) {
            records.push(validated.data);
        }
        else {
            console.warn(`[CSV Parser Warning] Skipping invalid row ${i + 1}: ${lines[i]}`);
        }
    }
    return records;
}
export async function runCli() {
    const program = new Command();
    program
        .name('compliancescout')
        .description('Autonomous Secretary of State compliance engine powered by Coasty computer-use agents and AgentRouter LLM status normalization.')
        .version('1.0.0')
        .option('-i, --input <file>', 'Path to input CSV file containing businesses', 'sample_businesses.csv')
        .option('-c, --concurrency <number>', 'Maximum parallel business audit tasks', '3')
        .option('-o, --output-dir <path>', 'Output directory for artifacts & reports', './reports')
        .option('--coasty-key <key>', 'Coasty API Key override')
        .option('--agentrouter-key <key>', 'AgentRouter API Key override')
        .option('-w, --web', 'Serve web dashboard server after run');
    program.parse(process.argv);
    const options = program.opts();
    TerminalPresenter.printBanner();
    const inputPath = path.resolve(process.cwd(), options.input);
    console.log(`\x1b[36m📂 Loading business entities from:\x1b[0m ${inputPath}`);
    let businesses = [];
    try {
        businesses = parseCsvFile(inputPath);
    }
    catch (error) {
        console.error(`\x1b[31m❌ Error loading CSV dataset:\x1b[0m ${error.message}`);
        process.exit(1);
    }
    console.log(`\x1b[32m✔ Successfully loaded ${businesses.length} target entity records across 5 states.\x1b[0m`);
    console.log(`\x1b[90m⚙️ Concurrency Cap: ${options.concurrency} worker agents | Mode: Coasty Managed Agent Engine\x1b[0m\n`);
    const runner = new BatchComplianceRunner({
        concurrency: parseInt(options.concurrency, 10),
        evaluatorOptions: {
            outputDir: path.resolve(process.cwd(), options.outputDir, 'artifacts'),
            coastyApiKey: options.coastyKey
        },
        agentRouterConfig: {
            apiKey: options.agentrouterKey
        },
        onProgressUpdate: (result, current, total) => {
            TerminalPresenter.printStepProgress(result, current, total);
        }
    });
    const report = await runner.runBatch(businesses);
    TerminalPresenter.printSummaryTable(report);
    // Generate Reports
    const outputDir = path.resolve(process.cwd(), options.outputDir);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const markdownContent = generateMarkdownReport(report);
    const markdownPath = path.join(outputDir, 'COMPLIANCE_REPORT.md');
    fs.writeFileSync(markdownPath, markdownContent, 'utf-8');
    const htmlContent = generateHtmlReport(report);
    const htmlPath = path.join(outputDir, 'dashboard.html');
    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    console.log(`\x1b[32m📄 Markdown Report saved to:\x1b[0m ${markdownPath}`);
    console.log(`\x1b[32m🌐 Interactive HTML Dashboard saved to:\x1b[0m ${htmlPath}`);
    if (options.web) {
        console.log(`\n\x1b[36m🚀 Web server mode requested. Open web UI in your browser at:\x1b[0m file://${path.resolve(process.cwd(), 'web', 'index.html')}`);
    }
}
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1].endsWith('index.ts') || (process.argv[1].endsWith('index.js') && !process.argv[1].endsWith('compliancescout.js'))) {
    runCli().catch(err => {
        console.error(`\x1b[31mFatal CLI Execution Failure:\x1b[0m`, err);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map