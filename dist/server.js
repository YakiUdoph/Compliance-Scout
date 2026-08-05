import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { BusinessInputSchema } from './normalizer/schema.js';
import { BatchComplianceRunner } from './engine/runner.js';
import { createJob, getJob, getAllJobs } from './engine/job-store.js';
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
const runner = new BatchComplianceRunner({ concurrency: 3 });
/**
 * GET /api/status/:job_id or GET /api/status — Instant job state lookup
 */
app.get(['/api/status', '/api/status/:job_id'], (req, res) => {
    const jobId = req.params.job_id || req.query.job_id;
    if (jobId) {
        const job = getJob(jobId);
        if (!job) {
            return res.status(404).json({ error: `Job with ID '${jobId}' not found.` });
        }
        return res.json({
            job_id: job.jobId,
            status: job.status,
            total_count: job.totalCount,
            completed_count: job.completedCount,
            results: job.results,
            summary: job.summary,
            active_logs: job.activeLogs,
            error: job.error,
            updated_at: job.updatedAt
        });
    }
    // If no job_id specified, return all registered jobs & system state
    const jobs = getAllJobs();
    return res.json({
        status: 'OPERATIONAL',
        port: PORT,
        coastyEngine: 'REST API https://coasty.ai/v1',
        normalizer: 'Native TypeScript JSON & Regex Parser',
        total_jobs_registered: jobs.length,
        recent_jobs: jobs.slice(0, 5).map(j => ({
            job_id: j.jobId,
            status: j.status,
            progress: `${j.completedCount}/${j.totalCount}`,
            created_at: j.createdAt
        }))
    });
});
/**
 * POST /api/audit — Non-blocking job producer controller (Returns instant HTTP 202 Accepted)
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
        // 1. Create job in in-memory registry
        const job = createJob(businesses);
        // 2. Dispatch background orchestrator thread (NON-BLOCKING DETACHED PROMISE)
        runner.runJobAsync(job.jobId, businesses).catch(err => {
            console.error(`[Background Job Error] Job ${job.jobId} failed:`, err);
        });
        // 3. IMMEDIATELY return HTTP 202 Accepted (< 200ms) with poll URL
        return res.status(202).json({
            job_id: job.jobId,
            status: job.status,
            total_count: job.totalCount,
            poll_url: `/api/status/${job.jobId}`,
            message: 'Job accepted and queued for background Coasty browser execution.'
        });
    }
    catch (error) {
        console.error(`[Backend API Audit Dispatch Error]`, error);
        return res.status(500).json({ error: error.message });
    }
});
// If executing directly (not imported as serverless function handler)
if (process.env.NODE_ENV !== 'production' || process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
    app.listen(PORT, () => {
        console.log(`
\x1b[32m  🛡️ COMPLIANCESCOUT Server Running on http://localhost:${PORT}\x1b[0m
\x1b[90m  API Endpoints: POST /api/audit (HTTP 202) | GET /api/status/:job_id\x1b[0m
\x1b[90m  Mode: Asynchronous Non-Blocking Job Queue (Vercel Timeout Safe)\x1b[0m
`);
    });
}
export default app;
//# sourceMappingURL=server.js.map