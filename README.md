# ComplianceScout 🚀

An open-source, agentic CLI and backend engine that automates legal compliance checks across multi-state Secretary of State (SOS) registries. Built natively inside Google Antigravity for the Coasty Hackathon.

🌐 **Live Demo:** [c-scout-phi.vercel.app](https://c-scout-phi.vercel.app)

## 💡 The Problem & The Core Innovation
Most public business registries lack clean, programmatic APIs. Existing enterprise solutions charge heavy premiums for basic KYB (Know Your Business) verification. 

**ComplianceScout** bypasses API limitations by deploying **Coasty computer-use browser agents** (`coasty.ai`) to dynamically navigate, screenshot, and extract real-time compliance records directly from raw state portals. 

### ⚡ Production-Grade Architecture (Bypassing Serverless Timeouts & External LLMs)
Standard Vercel serverless deployments impose a strict **10-second hobby timeout limit**. Because driving complex browser automation workflows across multiple states can take anywhere from 30 to 90 seconds, a standard synchronous request model would fail.

ComplianceScout solves this by utilizing an **Asynchronous Polling Architecture** with zero external LLM latency:
1. **Ingest:** The client uploads a `businesses.csv` file to the Vercel edge.
2. **Handshake:** The backend instantiates an isolated `JobStore` record, assigns a unique `job_id`, fires off the worker thread, and returns a `202 Accepted` response to the client **instantly** (< 200ms).
3. **Execution:** The decoupled background worker kicks off parallel Coasty browser agents via the official Coasty REST API (`POST /v1/runs`).
4. **Data Normalization:** Raw portal statuses (e.g., *"Forfeited"*, *"In Good Standing"*, *"Delinquent"*) are extracted directly from agent JSON outputs and mapped locally using a zero-dependency TypeScript parser (`src/normalizer/parser.ts`).
5. **Poll:** The frontend client seamlessly queries the status endpoint using the `job_id` until state mutation switches to `completed`.

---

## 🛠️ Tech Stack
- **Workspace Environments:** Google Antigravity 2.0 (Agentic Scaffolding & Browser-in-the-Loop validation)
- **Deployment & Hosting:** Vercel (Dynamic Node.js Runtime)
- **Browser Automation:** Official Coasty REST API (`/v1/runs`)
- **Data Normalization:** Native TypeScript JSON & Regex Parser (`src/normalizer/parser.ts`)
- **Language Stack:** TypeScript, Node.js (ES2022)

---

## 📂 Directory Layout
```directory
compliancescout/
├── src/
│   ├── index.ts              # Export root & type definitions
│   ├── server.ts             # Vercel entry point & CSV status routes
│   ├── engine/
│   │   ├── coasty-client.ts  # Coasty REST API client (/v1/runs)
│   │   ├── runner.ts         # Concurrency batch orchestrator & job status updater
│   │   └── job-store.ts      # Non-blocking async job state registry
│   ├── normalizer/
│   │   └── parser.ts         # Local TypeScript status & fee parser
│   └── types/
│       └── compliance.ts     # Normalized schema definitions
├── vercel.json               # Serverless dynamic routing overrides
└── package.json              # Main project compilation manifests
```
