import { BusinessInput, ComplianceResult, BatchSummaryReport } from '../normalizer/schema.js';

export type AuditJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AuditJobLog {
  taskId: string;
  message: string;
  timestamp: string;
}

export interface AuditJob {
  jobId: string;
  status: AuditJobStatus;
  totalCount: number;
  completedCount: number;
  businesses: BusinessInput[];
  results: ComplianceResult[];
  summary: BatchSummaryReport | null;
  activeLogs: AuditJobLog[];
  createdAt: string;
  updatedAt: string;
  error: string | null;
}

// Global In-Memory Job Registry
const jobRegistry = new Map<string, AuditJob>();

/**
 * Initializes a new job record in the registry and returns it.
 */
export function createJob(businesses: BusinessInput[]): AuditJob {
  const jobId = `job_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const job: AuditJob = {
    jobId,
    status: 'QUEUED',
    totalCount: businesses.length,
    completedCount: 0,
    businesses,
    results: [],
    summary: null,
    activeLogs: [
      {
        taskId: 'system',
        message: `Job ${jobId} registered for ${businesses.length} entity audit targets.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ],
    createdAt: now,
    updatedAt: now,
    error: null
  };

  jobRegistry.set(jobId, job);
  return job;
}

/**
 * Retrieves a job record by jobId.
 */
export function getJob(jobId: string): AuditJob | undefined {
  return jobRegistry.get(jobId);
}

/**
 * Returns all registered jobs sorted by recency.
 */
export function getAllJobs(): AuditJob[] {
  return Array.from(jobRegistry.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Updates an active job record with an audited result item.
 */
export function updateJobProgress(jobId: string, result: ComplianceResult, message: string): void {
  const job = jobRegistry.get(jobId);
  if (!job) return;

  job.status = 'PROCESSING';
  job.completedCount = job.results.length + 1;
  job.results.push(result);
  job.updatedAt = new Date().toISOString();
  job.activeLogs.unshift({
    taskId: result.taskId,
    message,
    timestamp: new Date().toLocaleTimeString()
  });
}

/**
 * Marks a job as COMPLETED and sets the final summary report.
 */
export function markJobCompleted(jobId: string, summary: BatchSummaryReport): void {
  const job = jobRegistry.get(jobId);
  if (!job) return;

  job.status = 'COMPLETED';
  job.completedCount = job.totalCount;
  job.summary = summary;
  job.results = summary.results;
  job.updatedAt = new Date().toISOString();
  job.activeLogs.unshift({
    taskId: 'system',
    message: `Job ${jobId} batch audit finished cleanly. ${summary.totalAutomatedSteps} Coasty steps verified.`,
    timestamp: new Date().toLocaleTimeString()
  });
}

/**
 * Marks a job as FAILED with an error message.
 */
export function markJobFailed(jobId: string, errorMsg: string): void {
  const job = jobRegistry.get(jobId);
  if (!job) return;

  job.status = 'FAILED';
  job.error = errorMsg;
  job.updatedAt = new Date().toISOString();
  job.activeLogs.unshift({
    taskId: 'system',
    message: `Job ${jobId} failed: ${errorMsg}`,
    timestamp: new Date().toLocaleTimeString()
  });
}
