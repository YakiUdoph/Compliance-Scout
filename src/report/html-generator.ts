import { BatchSummaryReport } from '../normalizer/schema.js';

export function generateHtmlReport(report: BatchSummaryReport): string {
  const jsonReportStr = JSON.stringify(report, null, 2);

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>COMPLIANCESCOUT - Executive Compliance Audit Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace']
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans antialiased min-h-screen">
  <header class="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg class="w-5 h-5 text-slate-950 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">COMPLIANCESCOUT</h1>
          <p class="text-xs text-slate-400 font-mono">Official Coasty REST API (coasty.ai) • Native TypeScript Status Parser</p>
        </div>
      </div>
      <span class="px-3 py-1 text-xs font-mono rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Verifiable Task Runs Attached
      </span>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-8 space-y-8" x-data="{ reportData: ${jsonReportStr}, search: '' }">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <p class="text-xs font-mono text-slate-400">Total Audited</p>
        <span class="text-3xl font-bold font-mono text-white" x-text="reportData.totalProcessed"></span>
      </div>
      <div class="bg-slate-900/60 border border-emerald-900/40 rounded-2xl p-5">
        <p class="text-xs font-mono text-emerald-400">In Good Standing</p>
        <span class="text-3xl font-bold font-mono text-emerald-400" x-text="reportData.goodStandingCount"></span>
      </div>
      <div class="bg-slate-900/60 border border-rose-900/40 rounded-2xl p-5">
        <p class="text-xs font-mono text-rose-400">Delinquent / Action</p>
        <span class="text-3xl font-bold font-mono text-rose-400" x-text="reportData.delinquentCount + reportData.forfeitedCount"></span>
      </div>
      <div class="bg-slate-900/60 border border-indigo-900/40 rounded-2xl p-5">
        <p class="text-xs font-mono text-indigo-400">Computer-Use Steps</p>
        <span class="text-3xl font-bold font-mono text-indigo-400" x-text="reportData.totalAutomatedSteps"></span>
      </div>
    </div>

    <div class="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div class="p-5 border-b border-slate-800 flex items-center justify-between">
        <h2 class="text-base font-bold text-white">Audited Entities & Coasty Run Links</h2>
        <input type="text" x-model="search" placeholder="Search..." class="bg-slate-950 border border-slate-800 rounded-xl px-4 py-1.5 text-xs text-slate-200 font-mono">
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono">
          <thead class="bg-slate-950 text-slate-400 uppercase">
            <tr>
              <th class="px-6 py-3.5">Business Entity</th>
              <th class="px-6 py-3.5">State</th>
              <th class="px-6 py-3.5">Coasty Run URL</th>
              <th class="px-6 py-3.5">Normalized Status</th>
              <th class="px-6 py-3.5">Fees Owed</th>
              <th class="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            <template x-for="item in reportData.results" :key="item.id">
              <tr class="hover:bg-slate-800/30">
                <td class="px-6 py-4 font-sans font-bold text-white" x-text="item.businessName"></td>
                <td class="px-6 py-4" x-text="item.state"></td>
                <td class="px-6 py-4">
                  <a :href="item.runUrl" target="_blank" class="text-emerald-400 hover:underline flex items-center gap-1 font-mono">
                    <span x-text="item.taskId"></span> ↗
                  </a>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold"
                        :class="item.normalizedStatus === 'GOOD_STANDING' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                        x-text="item.normalizedStatus"></span>
                </td>
                <td class="px-6 py-4 font-bold" x-text="item.amountOwed || '$0.00'"></td>
                <td class="px-6 py-4 text-right">
                  <template x-if="item.certPdfPath">
                    <a :href="item.certPdfPath" download class="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-semibold">PDF Cert</a>
                  </template>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</body>
</html>`;
}
