import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { BusinessInput, BusinessInputSchema } from './normalizer/schema.js';
import { BatchComplianceRunner } from './engine/runner.js';
import { createJob, getJob, getAllJobs, markJobFailed } from './engine/job-store.js';

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
app.get(['/api/status', '/api/status/:job_id'], (req: Request, res: Response) => {
  const jobId = req.params.job_id || (req.query.job_id as string);

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
app.post('/api/audit', async (req: Request, res: Response) => {
  try {
    let businesses: BusinessInput[] = [];

    const filePayload = (req as any).file || req.body?.file;
    let textPayload: string | undefined = undefined;

    if (filePayload) {
      const filename = filePayload.originalname || filePayload.name || '';
      if (/\.(csv|txt)$/i.test(filename) || !filename) {
        if (Buffer.isBuffer(filePayload.buffer)) {
          textPayload = filePayload.buffer.toString('utf-8');
        } else if (typeof filePayload.content === 'string') {
          textPayload = filePayload.content;
        } else if (typeof filePayload.csvText === 'string') {
          textPayload = filePayload.csvText;
        } else if (typeof filePayload.text === 'string') {
          textPayload = filePayload.text;
        }
      }
    }

    if (!textPayload) {
      if (typeof req.body.csvText === 'string') {
        textPayload = req.body.csvText;
      } else if (typeof req.body.text === 'string') {
        textPayload = req.body.text;
      } else if (typeof req.body.content === 'string') {
        textPayload = req.body.content;
      } else if (typeof req.body.fileContent === 'string') {
        textPayload = req.body.fileContent;
      }
    }

    if (Array.isArray(req.body.businesses)) {
      businesses = req.body.businesses.map((b: any) => BusinessInputSchema.parse(b));
    } else if (textPayload) {
      const lines = textPayload.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIdx = header.indexOf('business_name');
        const stateIdx = header.indexOf('state');
        const entityIdx = header.indexOf('entity_number');

        const nameCol = nameIdx !== -1 ? nameIdx : 0;
        const stateCol = stateIdx !== -1 ? stateIdx : 1;
        const entityCol = entityIdx !== -1 ? entityIdx : 2;

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((c: string) => c.trim());
          if (row.length >= 3) {
            businesses.push({
              business_name: row[nameCol],
              state: row[stateCol].toUpperCase(),
              entity_number: row[entityCol]
            });
          }
        }
      }
    } else {
      // Default to sample_businesses.csv if no payload provided
      const sampleCsvPath = path.resolve(process.cwd(), 'sample_businesses.csv');
      if (fs.existsSync(sampleCsvPath)) {
        const content = fs.readFileSync(sampleCsvPath, 'utf-8');
        const lines = content.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map((c: string) => c.trim());
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

    // 2. Synchronously await job execution so Vercel event loop does not freeze before completion
    try {
      await runner.runJobAsync(job.jobId, businesses);
    } catch (err) {
      console.error(`[Job Error] Job ${job.jobId} failed:`, err);
      const errorMsg = (err as Error).message || 'Batch execution failed';
      markJobFailed(job.jobId, errorMsg);
    }

    const finalJob = getJob(job.jobId) || job;

    // 3. Return HTTP 202 Accepted with updated job execution status
    return res.status(202).json({
      job_id: finalJob.jobId,
      status: finalJob.status,
      total_count: finalJob.totalCount,
      completed_count: finalJob.completedCount,
      results: finalJob.results,
      summary: finalJob.summary,
      error: finalJob.error,
      poll_url: `/api/status/${finalJob.jobId}`,
      message: finalJob.status === 'FAILED'
        ? `Job failed: ${finalJob.error}`
        : 'Job accepted and executed cleanly.'
    });
  } catch (error) {
    console.error(`[Backend API Audit Dispatch Error]`, error);
    return res.status(500).json({ error: (error as Error).message });
  }
});

// If executing directly (not imported as module)
const isDirectExecution = Boolean(
  process.argv[1] && 
  (path.basename(process.argv[1]) === 'server.js' || path.basename(process.argv[1]) === 'server.ts')
);

if (isDirectExecution) {
  app.listen(PORT, () => {
    console.log(`
\x1b[32m  🛡️ COMPLIANCESCOUT Server Running on http://localhost:${PORT}\x1b[0m
\x1b[90m  API Endpoints: POST /api/audit (HTTP 202) | GET /api/status/:job_id\x1b[0m
\x1b[90m  Mode: Asynchronous Non-Blocking Job Queue (Vercel Timeout Safe)\x1b[0m
`);
  });
}

export default app;
