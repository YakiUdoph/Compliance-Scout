import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { BusinessInputSchema } from './normalizer/schema.js';
import { BatchComplianceRunner } from './engine/runner.js';
import { generateMarkdownReport } from './report/markdown-generator.js';
import { generateHtmlReport } from './report/html-generator.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Serve static frontend files from web/ when running locally
const webDir = path.resolve(process.cwd(), 'web');
if (fs.existsSync(webDir)) {
    app.use(express.static(webDir));
}
let lastBatchSummary = null;
let isAuditRunning = false;
let currentAuditLogs = [];
/**
 * GET /api/status — Backend status & active Coasty Task run telemetry
 */
app.get('/api/status', (req, res) => {
    res.json({
        status: isAuditRunning ? 'RUNNING' : 'IDLE',
        port: PORT,
        coastyEngine: 'REST API https://coasty.ai/v1',
        normalizer: 'Native TypeScript JSON & Regex Parser',
        hasCoastyKey: Boolean((process.env.COASTY_API_KEY && !process.env.COASTY_API_KEY.includes('example')) ||
            (process.env.SK_COASTY_KEY && !process.env.SK_COASTY_KEY.includes('example'))),
        activeTaskCount: isAuditRunning ? 3 : 0,
        recentLogs: currentAuditLogs,
        lastSummary: lastBatchSummary
    });
});
/**
 * POST /api/audit — Triggers entity audit orchestrator server-side
 */
app.post('/api/audit', async (req, res) => {
    try {
        let businesses = [];
        if (Array.isArray(req.body.businesses)) {
            businesses = req.body.businesses.map((b) => BusinessInputSchema.parse(b));
        }
        else if (typeof req.body.csvText === 'string') {
            const lines = req.body.csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
            for (let i = 1; i < lines.length; i++) {
                const row = lines[i].split(',').map((c) => c.trim());
                if (row.length >= 3) {
                    businesses.push({
                        business_name: row[0],
                        state: row[1].toUpperCase(),
                        entity_number: row[2]
                    });
                }
            }
        }
        else {
            // Default to sample_businesses.csv if no payload provided
            const sampleCsvPath = path.resolve(process.cwd(), 'sample_businesses.csv');
            if (fs.existsSync(sampleCsvPath)) {
                const content = fs.readFileSync(sampleCsvPath, 'utf-8');
                const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                for (let i = 1; i < lines.length; i++) {
                    const row = lines[i].split(',').map((c) => c.trim());
                    if (row.length >= 3) {
                        businesses.push({
                            business_name: row[0],
                            state: row[1].toUpperCase(),
                            entity_number: row[2]
                        });
                    }
                }
            }
        }
        if (businesses.length === 0) {
            return res.status(400).json({ error: 'No valid business entity records found in request.' });
        }
        isAuditRunning = true;
        currentAuditLogs = [];
        const runner = new BatchComplianceRunner({
            concurrency: 3,
            onProgressUpdate: (result, current, total) => {
                currentAuditLogs.unshift({
                    taskId: result.taskId,
                    message: `[${current}/${total}] Audited ${result.businessName} (${result.state}): ${result.normalizedStatus} - Run URL: ${result.runUrl}`,
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        });
        const report = await runner.runBatch(businesses);
        // Save report artifacts
        const reportsDir = path.resolve(process.cwd(), 'reports');
        if (!fs.existsSync(reportsDir))
            fs.mkdirSync(reportsDir, { recursive: true });
        fs.writeFileSync(path.join(reportsDir, 'COMPLIANCE_REPORT.md'), generateMarkdownReport(report), 'utf-8');
        fs.writeFileSync(path.join(reportsDir, 'dashboard.html'), generateHtmlReport(report), 'utf-8');
        lastBatchSummary = report;
        isAuditRunning = false;
        return res.json({
            success: true,
            report
        });
    }
    catch (error) {
        isAuditRunning = false;
        console.error(`[Backend API Audit Error]`, error);
        return res.status(500).json({ error: error.message });
    }
});
// If executing directly (not imported as serverless function handler)
if (process.env.NODE_ENV !== 'production' || process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
    app.listen(PORT, () => {
        console.log(`
\x1b[32m  🛡️ COMPLIANCESCOUT Server Running on http://localhost:${PORT}\x1b[0m
\x1b[90m  API Endpoints: POST /api/audit | GET /api/status\x1b[0m
\x1b[90m  Coasty Target: https://coasty.ai/v1 | Normalizer: Native TypeScript Parser\x1b[0m
`);
    });
}
export default app;
//# sourceMappingURL=server.js.map