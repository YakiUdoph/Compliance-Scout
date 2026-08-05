import dotenv from 'dotenv';
import { CoastyClient } from '../src/engine/coasty-client.js';
import { CoastyWorkflowEvaluator } from '../src/engine/evaluator.js';
import { parseEntityStatus } from '../src/normalizer/parser.js';

dotenv.config();

async function runCoastyVerificationTest(): Promise<void> {
  console.log(`\n\x1b[36m🧪 [COMPLIANCESCOUT Test Suite] Running Coasty REST API Integration Test...\x1b[0m`);

  const client = new CoastyClient();
  const evaluator = new CoastyWorkflowEvaluator();

  const testEntity = {
    business_name: 'Acme Innovation Labs LLC',
    state: 'DE',
    entity_number: '7348912'
  };

  console.log(`📡 Creating Coasty Task Run (POST https://coasty.ai/v1/runs)...`);
  const task = await client.createTask({
    task: `Navigate to Delaware ICIS Corp portal at https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx and search for entity '${testEntity.business_name}'.`,
    max_steps: 15
  });

  console.log(`\x1b[32m✔ Task created successfully!\x1b[0m`);
  console.log(`   Task Run ID: \x1b[1m${task.runId}\x1b[0m`);
  console.log(`   Run URL:     \x1b[34m${task.runUrl}\x1b[0m`);

  console.log(`\n🔄 Polling Coasty Task Run (GET https://coasty.ai/v1/runs/${task.runId})...`);

  const result = await evaluator.evaluateEntity(testEntity, (step, current, total) => {
    console.log(`   \x1b[90m[${current}/${total}]\x1b[0m \x1b[33m${step.action}\x1b[0m: ${step.description}`);
  });

  console.log(`\n🧠 Normalizing status via Native TypeScript Status Parser...`);
  const normalized = parseEntityStatus(result.rawStatusText);

  console.log(`\x1b[32m✔ Native TypeScript Classification:\x1b[0m \x1b[1m${normalized.status}\x1b[0m`);
  console.log(`   Summary Note: ${normalized.summaryNote}`);

  if (!task.runId || !task.runUrl.includes('coasty.ai')) {
    throw new Error(`Test Failure: Invalid task response structure.`);
  }

  console.log(`\n\x1b[32m✅ Coasty REST API & Native TS Parser Integration Test PASSED cleanly!\x1b[0m\n`);
}

runCoastyVerificationTest().catch(err => {
  console.error(`\x1b[31m❌ Integration Test Failed:\x1b[0m`, err);
  process.exit(1);
});
