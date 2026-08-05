<div align="center">

# 🛡️ COMPLIANCESCOUT

**Global Enterprise Entity Verification & Automated Compliance Inspection Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg)](https://www.typescriptlang.org/)
[![Coasty REST API](https://img.shields.io/badge/Coasty%20API-coasty.ai-10B981.svg)](https://coasty.ai)
[![Architecture](https://img.shields.io/badge/Pattern-Async%20Job%20Queue-6366F1.svg)](#asynchronous-job-queue--polling-pattern)
[![Vercel Safe](https://img.shields.io/badge/Vercel-HTTP%20202%20Safe-000000.svg)](#vercel-deployment-verceljson)

[Live Dashboard](web/index.html) • [Quickstart Guide](#quickstart) • [Integration Test](#verification-test-suite)

---

</div>

## 📌 Executive Summary & Architecture

Corporate entity compliance across Secretary of State databases & global commercial registries suffers from lack of standardized APIs. **ComplianceScout** delivers autonomous, enterprise-grade inspection without hitting HTTP timeouts:

1. **Asynchronous Job Queue & Polling Pattern**: `POST /api/audit` acts as a thin producer controller, returning an instant **`HTTP 202 Accepted`** with a `job_id` (< 200ms). Background Coasty browser tasks execute asynchronously while the client polls `GET /api/status/:job_id` every 3 seconds to stream live status updates. This completely eliminates Vercel `504 Gateway Timeouts`.
2. **Official Coasty REST API (`coasty.ai`)**: Dispatches computer-use tasks to `POST https://coasty.ai/v1/runs` and polls `GET https://coasty.ai/v1/runs/{id}`. Every audit result attaches a verifiable **Coasty Task Run URL** (`https://coasty.ai/v1/runs/{runId}`).
3. **Zero-Dependency Native Status Parser (`src/normalizer/parser.ts`)**: Local TypeScript parser extracting structured JSON blocks and regex legal keyword tags (`GOOD_STANDING`, `DELINQUENT`, `FORFEITED`, `UNKNOWN`). Zero external LLM dependencies.

---

## 🏛️ Asynchronous Job Queue Sequence Diagram

```
  Client Web UI (web/index.html)
        │
        ├── 1. POST /api/audit (Returns HTTP 202 Accepted + job_id in < 200ms) ──┐
        │                                                                        │
        ├── 2. Polls GET /api/status/:job_id every 3 seconds ────────────────┐   │
        │                                                                    │   │
        ▼                                                                    ▼   ▼
  Express / Vercel Controller (src/server.ts) ──────────────────────► In-Memory Job Store
        │ (Non-blocking background thread)                           (src/engine/job-store.ts)
        │                                                                    ▲
        ▼                                                                    │
  Async Batch Orchestrator (src/engine/runner.ts)                           │
        │                                                                    │
        ├── Executes Coasty Browser Tasks (POST /v1/runs) ──────────────────┤
        └── Incrementally updates job status & entity results ───────────────┘
```

---

## ⚡ Verifiable Audit Telemetry & Task Run URLs

Every entity audited by ComplianceScout receives a unique Coasty Task Run ID and verifiable URL logged directly into audit reports:

| Entity Name | State | Coasty Task Run URL | Status Tag | Fees Owed | Artifact Download |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Acme Innovation Labs LLC** | `DE` | [`coasty_run_734891`](https://coasty.ai/v1/runs/coasty_run_734891) | 🟢 GOOD STANDING | $0.00 | [📄 Cert PDF](#) |
| **Apex Quantum Dynamics Inc** | `CA` | [`coasty_run_482910`](https://coasty.ai/v1/runs/coasty_run_482910) | ⛔ FORFEITED | $800.00 | N/A (Filing Link) |
| **Empire Logistics Solutions Corp** | `NY` | [`coasty_run_592014`](https://coasty.ai/v1/runs/coasty_run_592014) | 🟢 GOOD STANDING | $0.00 | [📄 Cert PDF](#) |

---

## 🚀 Quickstart

### 1. Installation & Environment Setup

```bash
git clone https://github.com/YakiUdoph/Compliance-Scout.git
cd Compliance-Scout
npm install
cp .env.example .env
```

### 2. Build & Launch Backend Server

```bash
# Build TypeScript project
npm run build

# Start Express Backend Server on http://localhost:3000
npm run server
```

### 3. Verification Test Suite

Run the automated integration test against Coasty REST API endpoints:

```bash
npm run test:coasty
```

### 4. Vercel Deployment (`vercel.json`)

```bash
npx vercel
```
