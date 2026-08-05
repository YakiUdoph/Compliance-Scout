import app from '../src/server.js';
import http from 'http';

async function runFileUploadTest() {
  console.log(`\n🧪 Testing Backend Upload Handler for .csv and .txt payloads...`);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as { port: number };
  const baseUrl = `http://localhost:${address.port}`;

  try {
    // 1. Test CSV Payload via csvText
    const csvPayload = `business_name,state,entity_number\nAcme Corp,DE,123456\nBeta LLC,CA,654321`;
    const resCsv = await fetch(`${baseUrl}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText: csvPayload })
    });
    const dataCsv = await resCsv.json();
    console.log(`Response for csvText payload (HTTP ${resCsv.status}):`, dataCsv);
    if (resCsv.status !== 200 || !dataCsv.job_id || !dataCsv.results) {
      throw new Error(`CSV payload test failed with status ${resCsv.status}`);
    }

    // 2. Test TXT Payload via text
    const txtPayload = `business_name,state,entity_number\nGamma Inc,NY,789012\nDelta Co,TX,210987`;
    const resTxt = await fetch(`${baseUrl}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: txtPayload })
    });
    const dataTxt = await resTxt.json();
    console.log(`Response for text payload (HTTP ${resTxt.status}):`, dataTxt);
    if (resTxt.status !== 200 || !dataTxt.job_id || !dataTxt.results) {
      throw new Error(`TXT payload test failed with status ${resTxt.status}`);
    }

    // 3. Test file object with originalname ending in .txt
    const resFileTxt = await fetch(`${baseUrl}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: {
          originalname: 'dataset.txt',
          content: `business_name,state,entity_number\nEpsilon Corp,FL,555444`
        }
      })
    });
    const dataFileTxt = await resFileTxt.json();
    console.log(`Response for file.originalname .txt payload (HTTP ${resFileTxt.status}):`, dataFileTxt);
    if (resFileTxt.status !== 200 || !dataFileTxt.job_id || !dataFileTxt.results) {
      throw new Error(`File .txt payload test failed with status ${resFileTxt.status}`);
    }

    console.log(`\n✅ All .csv and .txt file upload unit tests PASSED successfully!\n`);
  } finally {
    server.close();
  }
}

runFileUploadTest().catch((err) => {
  console.error(`❌ Test failed:`, err);
  process.exit(1);
});
