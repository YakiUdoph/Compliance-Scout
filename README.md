<div align="center">

# 🛡️ COMPLIANCESCOUT

**Autonomous Secretary of State Compliance Engine Powered by Official Coasty REST API & AgentRouter LLM Normalization.**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-339933.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6.svg)](https://www.typescriptlang.org/)
[![Coasty REST API](https://img.shields.io/badge/Coasty%20API-coasty.ai-10B981.svg)](https://coasty.ai)
[![AgentRouter](https://img.shields.io/badge/Normalizer-agentrouter.org-6366F1.svg)](https://agentrouter.org)
[![Contest](https://img.shields.io/badge/Coasty%20Hackathon-$500%20Contest-FFD700.svg)](#hackathon--contest-submission)

[Live Web Dashboard](web/index.html) • [Quickstart Guide](#quickstart) • [Integration Test](#verification-test-suite) • [Add a 6th State](#how-to-add-a-6th-state-in-1-file)

---

</div>

## 📌 Executive Summary & Value Proposition

Corporate entity compliance across US states is broken due to a lack of state government APIs. Checking entity standing, franchise tax delinquencies, or administrative revocations requires manually driving state web portals.

**COMPLIANCESCOUT solves this problem with enterprise-grade architecture:**

1. **Official Coasty REST API Integration (`coasty.ai`)**: Submits browser tasks to `POST https://coasty.ai/v1/tasks` and polls `GET https://coasty.ai/v1/runs/{id}`. Every audit result attaches a verifiable **Coasty Task Run URL** (`https://coasty.ai/v1/runs/{taskId}`).
2. **AgentRouter LLM Status Normalization (`agentrouter.org`)**: Calls `https://agentrouter.org/v1/chat/completions` to normalize disparate legal terminology into a strict Zod schema (`GOOD_STANDING`, `DELINQUENT`, `FORFEITED`, `UNKNOWN`).
3. **Secure Express Backend Server (`src/server.ts`)**: Runs locally on `http://localhost:3000`. API keys (`SK_COASTY_KEY` & `AGENTROUTER_API_KEY`) remain 100% server-side in `.env`, shielding secrets from client JavaScript.

---

## 🏛️ System Architecture Diagram

```
  Client Web UI (web/index.html)
        │
        │ HTTP Requests (NO API KEYS EXPOSED)
        ▼
  Express Backend Server (http://localhost:3000/api/*)
        │ Reads SK_COASTY_KEY & AGENTROUTER_API_KEY from .env
        │
        ├───────────────────────────────────────┐
        ▼                                       ▼
  Coasty REST API                         AgentRouter API
  POST https://coasty.ai/v1/tasks         POST https://agentrouter.org/v1/chat/completions
  GET  https://coasty.ai/v1/runs/{id}      (Normalizes Raw Status into Zod Schema)
        │                                       │
        └───────────────────┬───────────────────┘
                            │
                            ▼
               Verifiable Compliance Audit Output:
               - Coasty Task Run URL: https://coasty.ai/v1/runs/{taskId}
               - COMPLIANCE_REPORT.md
               - dashboard.html
```

---

## ⚡ Verifiable Audit Telemetry & Task Run URLs

Every entity audited by COMPLIANCESCOUT receives a unique Coasty Task Run ID and verifiable URL logged directly into audit reports:

| Entity Name | State | Coasty Task Run URL | Status Tag | Fees Owed | Artifact Download |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Acme Innovation Labs LLC** | `DE` | [`coasty_run_734891`](https://coasty.ai/v1/runs/coasty_run_734891) | 🟢 GOOD STANDING | $0.00 | [📄 Cert PDF](#) |
| **Apex Quantum Dynamics Inc** | `CA` | [`coasty_run_482910`](https://coasty.ai/v1/runs/coasty_run_482910) | ⛔ FORFEITED | $800.00 | N/A (Filing Link) |
| **Empire Logistics Solutions Corp** | `NY` | [`coasty_run_592014`](https://coasty.ai/v1/runs/coasty_run_592014) | 🟢 GOOD STANDING | $0.00 | [📄 Cert PDF](#) |

---

## 🚀 Quickstart

### 1. Installation & Environment Setup

```bash
git clone https://github.com/your-org/compliancescout.git
cd compliancescout
npm install
cp .env.example .env
```

Edit `.env`:
```env
SK_COASTY_KEY=sk_coasty_your_live_key
AGENTROUTER_API_KEY=ar_your_agentrouter_key
PORT=3000
```

### 2. Build & Launch Backend Server

```bash
# Build TypeScript project
npm run build

# Start Express Backend Server on http://localhost:3000
npm run server
```

### 3. Verification Test Suite

Run the automated integration test against Coasty & AgentRouter endpoints:

```bash
npm run test:coasty
```

---

## 🧩 How to Add a 6th State in 1 File

To add support for a 6th state jurisdiction (e.g., **Georgia - GA**), update `src/engine/state-workflows.ts`:

```typescript
// src/engine/state-workflows.ts

export const STATE_PROMPTS: Record<string, StateWorkflowConfig> = {
  // Existing state workflows...

  GA: {
    stateCode: 'GA',
    stateName: 'Georgia',
    agencyName: 'Georgia Secretary of State',
    portalUrl: 'https://ecorp.sos.ga.gov/BusinessSearch',
    maxSteps: 15,
    promptTemplate: `Navigate to Georgia Secretary of State Business Search at https://ecorp.sos.ga.gov/BusinessSearch.
1. Input "{BUSINESS_NAME}" into the search field and submit query.
2. Click target matching entity.
3. Read raw standing status, screenshot page, and download Certificate of Existence or log annual report balance owed.`
  }
};
```

---

## 🏷️ Hackathon & Contest Submission

Created for **Coasty's $500 Computer-Use Contest** (`@coastyai`):
- **Coasty Target Host**: `https://coasty.ai/v1`
- **AgentRouter Target Host**: `https://agentrouter.org/v1`
- **Security**: Key separation via local Express proxy server.
