# ComplianceScout 🛡

An open-source, global compliance intelligence engine and agentic CLI that automates multi-jurisdiction corporate registry checks (US Secretary of State, UK Companies House, Singapore ACRA, and EU registries). Built natively inside Google Antigravity for the Coasty Hackathon.

🌐 **Live Enterprise Platform:** [c-scout-phi.vercel.app](https://c-scout-phi.vercel.app)

---

## 💡 The Problem & Core Innovation

Most public business registries lack clean, programmatic APIs. Corporate legal, procurement, and risk operations teams waste thousands of hours manually navigating disparate government portals just to confirm if an entity is in good standing or owes delinquent filing fees. Existing enterprise solutions charge heavy premiums for basic KYB (Know Your Business) verification.

ComplianceScout solves this by deploying **Coasty computer-use browser agents** (`coasty.ai`) to dynamically navigate, extract, and record real-time corporate compliance findings directly from raw government registries.

---

## ⚡️ Key Platform Capabilities

- **Global Jurisdiction Verification:** Supports entity verification across North America (`US-DE`, `US-CA`, etc.), Europe (`UK`, `DE-DE`), Asia-Pacific (`SG`, `HK`), and emerging markets.
- **Synchronous & Streamed Execution:** Parallelized live API requests (`/api/audit-live`) return real-time entity standings without hitting serverless timeout limits.
- **Zero-Latency Native TypeScript Normalization:** Raw registry responses are mapped locally into standardized compliance statuses (`Active / Good Standing`, `Delinquent`, `Forfeited`) using a zero-dependency TypeScript engine (`src/normalizer/parser.ts`).
- **Verifiable Audit Evidence:** Every audited entity generates a visual Coasty run trace link alongside step-by-step telemetry logs and UTC verification timestamps (`DD MMM YYYY • HH:MM UTC`).
- **Privacy & Ephemeral Security:** Datasets are encrypted in-transit (TLS 1.3) and processed strictly in-memory without persistent customer record retention.

---

## 🛠 Tech Stack

- **Agentic Workspace:** Google Antigravity 2.0 (Scaffolding & Browser-in-the-Loop Validation)
- **Deployment & Hosting:** Vercel (Dynamic Serverless Edge Node.js Runtime)
- **Browser Automation:** Official Coasty REST API (`/v1/runs`)
- **Data Engine:** Native TypeScript JSON & Regex Parser (`src/normalizer/parser.ts`)
- **Language Stack:** TypeScript, Node.js (ES2022)

---

## 📋 Data Import Schema Example

Upload a `.csv` or `.txt` dataset using this multi-jurisdiction format:

```csv
business_name,jurisdiction,entity_number
Stripe Inc,US-DE,4728956
Apple Inc,US-CA,C0806592
Arm Limited,UK,02548777
Grab Holdings Limited,SG,201804610R
Atlassian Corporation Plc,US-DE,5682134
```

---

## 📂 Directory Layout

```
compliancescout/
├── api/
│   └── audit-live.ts        # Standalone Vercel Serverless Coasty Runner
├── src/
│   ├── index.ts              # Export root & type definitions
│   ├── server.ts             # Express backend router & route exports
│   ├── engine/
│   │   ├── coasty-client.ts  # Coasty REST API client (/v1/runs)
│   │   └── runner.ts         # Batch orchestrator & audit execution engine
│   ├── normalizer/
│   │   └── parser.ts         # Local TypeScript status & fee parser
│   └── types/
│       └── compliance.ts     # Normalized enterprise schema definitions
├── web/
│   ├── index.html            # Enterprise frontend portal UI & trust modules
│   └── app.js                # Dynamic table streaming, DOM rendering & telemetry modals
├── vercel.json               # Serverless dynamic routing overrides
└── package.json              # Compilation & build manifests
```

---

## 📄 Compliance Disclaimer

ComplianceScout provides automated informational registry verification gathered from official public registries. Findings do not constitute formal legal counsel.
