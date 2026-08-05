// Global In-Memory Job Registry
const jobRegistry = new Map();
/**
 * Initializes a new job record in the registry and returns it.
 */
export function createJob(businesses) {
    const jobId = `job_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const job = {
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
export function getJob(jobId) {
    return jobRegistry.get(jobId);
}
/**
 * Returns all registered jobs sorted by recency.
 */
export function getAllJobs() {
    return Array.from(jobRegistry.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
/**
 * Updates an active job record with an audited result item.
 */
export function updateJobProgress(jobId, result, message) {
    const job = jobRegistry.get(jobId);
    if (!job)
        return;
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
export function markJobCompleted(jobId, summary) {
    const job = jobRegistry.get(jobId);
    if (!job)
        return;
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
export function markJobFailed(jobId, errorMsg) {
    const job = jobRegistry.get(jobId);
    if (!job)
        return;
    job.status = 'FAILED';
    job.error = errorMsg;
    job.updatedAt = new Date().toISOString();
    job.activeLogs.unshift({
        taskId: 'system',
        message: `Job ${jobId} failed: ${errorMsg}`,
        timestamp: new Date().toLocaleTimeString()
    });
}
//# sourceMappingURL=job-store.js.map