import { useState } from "react";

// ────────────────────────────────────────────────────────────
// DTE → Payout End-to-End Wireframe Flow
// Lo-fi wireframes showing each screen in the pipeline,
// mirroring the E2E Merchant → Payout Journey structure
// ────────────────────────────────────────────────────────────

const PHASES = ["Generate", "Ingest", "Enrich", "Ledger", "Prepare", "Review", "Transfer"];
const PHASE_COLORS = {
  Generate: "#EEF2FF", Ingest: "#F0FDF4", Enrich: "#FFF7ED",
  Ledger: "#F0FDF4", Prepare: "#FFFBEB", Review: "#F5F3FF", Transfer: "#FEF2F2",
};
const PHASE_BORDERS = {
  Generate: "#818CF8", Ingest: "#86EFAC", Enrich: "#FB923C",
  Ledger: "#86EFAC", Prepare: "#FBBF24", Review: "#C084FC", Transfer: "#F87171",
};

// ── Lo-fi wireframe components ──
// Each renders a grey-toned sketch of the actual UI at that step

function WireframeDTEGenerator() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 font-mono text-[11px] text-gray-500 space-y-3">
      <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">DTE Generator Page</div>
      {/* File settings bar */}
      <div className="flex items-center gap-3 bg-white rounded border border-gray-200 px-3 py-2">
        <div className="flex items-center gap-1"><span className="text-[9px] font-bold text-gray-400">Client</span><div className="w-14 h-5 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[10px]">MX51</div></div>
        <div className="flex items-center gap-1"><span className="text-[9px] font-bold text-gray-400">Date</span><div className="w-20 h-5 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[10px]">2026-02-25</div></div>
        <div className="flex-1" />
        <span className="text-[9px] text-gray-300">DTE v6.0 · 700 bytes/record</span>
      </div>
      {/* Import section */}
      <div className="flex items-center gap-2 bg-white rounded border border-gray-200 px-3 py-2">
        <div className="w-6 h-6 rounded bg-indigo-100 flex items-center justify-center"><span className="text-indigo-400 text-[10px]">↑</span></div>
        <span className="text-[10px] text-gray-400">Import File — Load from .txt/.dte/.csv</span>
        <div className="flex-1" />
        <div className="px-2 py-1 bg-gray-200 rounded text-[9px] text-gray-500">Browse file</div>
      </div>
      {/* Quick-add form */}
      <div className="bg-white rounded border border-gray-200 px-3 py-2 space-y-2">
        <span className="text-[9px] font-bold text-gray-400">ADD TRANSACTION</span>
        <div className="grid grid-cols-4 gap-2">
          {["Type ▾", "Scheme ▾", "Merchant ▾", "$50.00"].map((l, i) => (
            <div key={i} className="h-5 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-[9px] text-gray-400">{l}</div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="px-2 py-1 bg-indigo-200 rounded text-[9px] text-indigo-700 font-bold">+ Add transaction</div>
        </div>
      </div>
      {/* Transaction table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200">
          <span className="text-[9px] font-bold text-gray-400">TRANSACTIONS (5)</span>
          <div className="flex gap-1">
            <div className="px-2 py-0.5 bg-indigo-200 rounded text-[9px] text-indigo-700 font-bold">Generate DTE</div>
            <div className="px-2 py-0.5 bg-gray-700 rounded text-[9px] text-white font-bold">Ingest & Enrich</div>
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex items-center px-3 py-1 border-b border-gray-100 last:border-0">
            <span className="w-4 text-gray-300 text-[9px]">{n}</span>
            <div className="w-16 h-3 bg-gray-100 rounded mx-1" />
            <div className="w-12 h-3 bg-gray-100 rounded mx-1" />
            <div className="w-20 h-3 bg-gray-100 rounded mx-1" />
            <div className="flex-1" />
            <span className="text-[9px] text-gray-400">$XX.XX</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WireframeS3Upload() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 font-mono text-[11px] text-gray-500 space-y-3">
      <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">S3 Ingestion (Backend)</div>
      <div className="flex items-center justify-center py-6">
        <div className="flex items-center gap-3">
          {/* DTE File */}
          <div className="w-16 h-20 bg-white rounded border-2 border-gray-300 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-gray-400">DTE</span>
            <span className="text-[8px] text-gray-300">700b/rec</span>
          </div>
          {/* Arrow */}
          <div className="flex flex-col items-center">
            <div className="text-gray-300 text-lg">→</div>
            <span className="text-[8px] text-gray-300">upload</span>
          </div>
          {/* S3 bucket */}
          <div className="w-20 h-20 bg-amber-50 rounded-lg border-2 border-amber-200 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-amber-500">S3</span>
            <span className="text-[8px] text-amber-400">cuscal-dte</span>
            <span className="text-[8px] text-amber-400">-inbox/</span>
          </div>
          {/* Arrow */}
          <div className="flex flex-col items-center">
            <div className="text-gray-300 text-lg">→</div>
            <span className="text-[8px] text-gray-300">trigger</span>
          </div>
          {/* Consumer */}
          <div className="w-20 h-20 bg-emerald-50 rounded-lg border-2 border-emerald-200 flex flex-col items-center justify-center">
            <span className="text-[9px] font-bold text-emerald-600">Consumer</span>
            <span className="text-[8px] text-emerald-400">Cuscal File</span>
            <span className="text-[8px] text-emerald-400">Service</span>
          </div>
        </div>
      </div>
      <div className="text-center text-[9px] text-gray-300">No UI — S3 event triggers Lambda / Consumer service</div>
    </div>
  );
}

function WireframeEnrichment() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 font-mono text-[11px] text-gray-500 space-y-3">
      <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">MSF Enrichment</div>
      {/* Enrichment metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded border border-gray-200 p-2 text-center">
          <span className="text-[8px] font-bold text-gray-400 uppercase block">Gross</span>
          <span className="text-sm font-bold text-gray-600">$5,450.00</span>
        </div>
        <div className="bg-red-50 rounded border border-red-200 p-2 text-center">
          <span className="text-[8px] font-bold text-red-400 uppercase block">Total MSF</span>
          <span className="text-sm font-bold text-red-500">-$76.30</span>
        </div>
        <div className="bg-emerald-50 rounded border border-emerald-200 p-2 text-center">
          <span className="text-[8px] font-bold text-emerald-400 uppercase block">Net</span>
          <span className="text-sm font-bold text-emerald-600">$5,373.70</span>
        </div>
      </div>
      {/* Enrichment table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 gap-0 px-2 py-1 bg-gray-50 border-b border-gray-200 text-[8px] font-bold text-gray-400 uppercase">
          <span>#</span><span>Merchant</span><span>Scheme</span><span>Type</span><span className="text-right">Gross</span><span className="text-right">MSF</span><span className="text-right">Net</span>
        </div>
        {[
          { n: 1, m: "Joe's Coffee", s: "Visa", t: "Purchase", g: "$142.50", f: "-$1.43", net: "$141.08" },
          { n: 2, m: "Joe's Coffee", s: "MC", t: "Purchase", g: "$89.95", f: "-$1.80", net: "$88.15" },
          { n: 3, m: "Mike's Elec", s: "Visa Cr", t: "Purchase", g: "$1,245.00", f: "-$18.68", net: "$1,226.33" },
          { n: 4, m: "Fresh Mart", s: "MC", t: "Refund", g: "$45.00", f: "-$0.90", net: "-$44.10" },
          { n: 5, m: "Bella's", s: "Visa Intl", t: "Purchase", g: "$520.00", f: "-$13.00", net: "$507.00" },
        ].map((r) => (
          <div key={r.n} className="grid grid-cols-7 gap-0 px-2 py-1 border-b border-gray-100 text-[9px]">
            <span className="text-gray-300">{r.n}</span>
            <span className="text-gray-500 truncate">{r.m}</span>
            <span className="text-gray-400">{r.s}</span>
            <span className={r.t === "Refund" ? "text-red-400" : "text-emerald-400"}>{r.t}</span>
            <span className="text-right text-gray-500">{r.g}</span>
            <span className="text-right text-red-400">{r.f}</span>
            <span className="text-right font-bold text-gray-600">{r.net}</span>
          </div>
        ))}
      </div>
      {/* Rate legend */}
      <div className="flex gap-3 flex-wrap">
        {["Visa @1%", "MC @2%", "Visa Cr @1.5%", "MC Cr @2.2%", "Visa Intl @2.5%", "eftpos @0.8%"].map((r) => (
          <span key={r} className="text-[8px] px-1.5 py-0.5 bg-orange-50 text-orange-500 rounded border border-orange-200">{r}</span>
        ))}
      </div>
      <div className="flex justify-end">
        <div className="px-3 py-1.5 bg-indigo-200 rounded text-[10px] text-indigo-700 font-bold">→ Send to Payout Ledger</div>
      </div>
    </div>
  );
}

function WireframeBalanceLedger() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 font-mono text-[11px] text-gray-500 space-y-3">
      <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Merchant Balance Ledger</div>
      {/* Merchant cards */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { m: "Joe's Coffee", mles: 4, bal: "$987.75" },
          { m: "Mike's Electronics", mles: 3, bal: "$2,591.75" },
          { m: "Fresh Mart", mles: 2, bal: "$460.40" },
          { m: "Bella's Boutique", mles: 2, bal: "$674.75" },
        ].map((mc) => (
          <div key={mc.m} className="bg-white rounded border border-gray-200 px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold text-gray-600">{mc.m}</span>
              <span className="text-[9px] font-bold text-emerald-500">{mc.bal}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-gray-400">{mc.mles} MLEs</span>
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-300 rounded-full" style={{ width: "70%" }} />
              </div>
              <span className="text-[8px] px-1 py-0.5 bg-amber-100 text-amber-600 rounded">Unassigned</span>
            </div>
          </div>
        ))}
      </div>
      {/* MLE list */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <span className="text-[9px] font-bold text-gray-400">MERCHANT LEDGER ENTRIES (11)</span>
          <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded font-bold">All unassigned</span>
        </div>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex items-center px-3 py-1 border-b border-gray-100">
            <span className="w-12 text-[9px] text-gray-300">MLE-{40000 + n}</span>
            <div className="w-20 h-3 bg-gray-100 rounded mx-1" />
            <div className="flex-1" />
            <span className="text-[9px] text-emerald-500 font-bold">+$XX.XX</span>
          </div>
        ))}
        <div className="px-3 py-1 text-center text-[8px] text-gray-300">... and 6 more</div>
      </div>
    </div>
  );
}

function WireframePreparePayout() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 font-mono text-[11px] text-gray-500 space-y-3">
      <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Prepare Payout — Sweep Dialog</div>
      {/* Date range */}
      <div className="bg-white rounded border border-gray-200 px-3 py-2 space-y-2">
        <div className="flex items-center gap-1 text-[9px]">
          <span className="text-amber-500 text-sm">⚠</span>
          <span className="text-amber-600 font-bold">This will sweep merchant balances</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-6 bg-gray-100 rounded border border-gray-200 flex items-center px-2 text-[9px] text-gray-400">From: 2026-02-24</div>
          <div className="h-6 bg-gray-100 rounded border border-gray-200 flex items-center px-2 text-[9px] text-gray-400">To: 2026-02-25</div>
        </div>
        <div className="bg-gray-100 rounded px-2 py-1 text-[9px]"><b className="text-gray-600">11</b> MLEs across <b className="text-gray-600">4</b> merchants</div>
      </div>
      {/* Two-column sweep */}
      <div className="grid grid-cols-2 gap-3">
        {/* Left: unassigned */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="px-2 py-1 bg-gray-50 border-b border-gray-200 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[8px] font-bold text-gray-400 uppercase">Unassigned MLEs</span>
          </div>
          <div className="p-1.5 space-y-0.5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center px-1 py-0.5 text-[8px]">
                <span className="text-gray-300 w-10">MLE-{n}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded" />
              </div>
            ))}
            <div className="text-center text-[7px] text-gray-300 opacity-50">fading out →</div>
          </div>
        </div>
        {/* Right: grouped */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="px-2 py-1 bg-gray-50 border-b border-gray-200 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[8px] font-bold text-gray-400 uppercase">Payout Groups</span>
          </div>
          <div className="p-1.5 space-y-1">
            {["Joe's Coffee (4)", "Mike's Elec (3)"].map((g) => (
              <div key={g} className="px-1.5 py-1 bg-emerald-50 rounded border border-emerald-200 text-[8px] text-emerald-600">{g}</div>
            ))}
            <div className="text-center text-[7px] text-emerald-400">← grouping by MID</div>
          </div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-indigo-400 rounded-full" style={{ width: "65%" }} /></div>
        <div className="flex justify-between text-[8px] text-gray-300"><span>Sweeping...</span><span>7/11</span></div>
      </div>
    </div>
  );
}

function WireframePayoutReview() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 font-mono text-[11px] text-gray-500 space-y-3">
      <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payouts — Review & Approve</div>
      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { l: "Total", v: "4", c: "text-gray-600" },
          { l: "Ready for Review", v: "4", c: "text-amber-600" },
          { l: "Ready for Transfer", v: "0", c: "text-indigo-600" },
          { l: "Completed", v: "0", c: "text-emerald-600" },
        ].map((m) => (
          <div key={m.l} className="bg-white rounded border border-gray-200 px-2 py-1.5 text-center">
            <span className="text-[8px] text-gray-400 block">{m.l}</span>
            <span className={`text-lg font-bold ${m.c}`}>{m.v}</span>
          </div>
        ))}
      </div>
      {/* Payout table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-6 px-3 py-1 bg-gray-50 border-b border-gray-200 text-[8px] font-bold text-gray-400 uppercase">
          <span>Payout ID</span><span>Date</span><span>Merchant</span><span>Amount</span><span>Status</span><span></span>
        </div>
        {[
          { id: "PO-0225-001", d: "25 Feb", m: "Joe's Coffee", a: "$987.75", s: "Ready for Review" },
          { id: "PO-0225-002", d: "25 Feb", m: "Mike's Electronics", a: "$2,591.75", s: "Ready for Review" },
          { id: "PO-0225-003", d: "25 Feb", m: "Fresh Mart", a: "$460.40", s: "Ready for Review" },
          { id: "PO-0225-004", d: "25 Feb", m: "Bella's Boutique", a: "$674.75", s: "Ready for Review" },
        ].map((p) => (
          <div key={p.id} className="grid grid-cols-6 px-3 py-1.5 border-b border-gray-100 text-[9px]">
            <span className="text-indigo-500 font-bold">{p.id}</span>
            <span className="text-gray-400">{p.d}</span>
            <span className="text-gray-600">{p.m}</span>
            <span className="font-bold text-gray-700">{p.a}</span>
            <span className="text-[8px] px-1.5 py-0.5 bg-amber-100 text-amber-600 rounded w-fit">{p.s}</span>
            <div className="flex gap-1">
              <div className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[8px] font-bold cursor-default">✓ Approve</div>
            </div>
          </div>
        ))}
      </div>
      {/* Action panel hint */}
      <div className="bg-purple-50 rounded border border-purple-200 px-3 py-2 text-[9px] text-purple-600">
        <b>FinOps actions:</b> Approve → Ready for Transfer · Hold → Investigation · Abandon → Cancel payout
      </div>
    </div>
  );
}

function WireframeTransfer() {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 p-4 font-mono text-[11px] text-gray-500 space-y-3">
      <div className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Begin Transfer → NPP</div>
      {/* Transfer flow */}
      <div className="flex items-center justify-center gap-2 py-3">
        <div className="w-20 h-16 bg-white rounded border-2 border-indigo-200 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-indigo-500">Payout</span>
          <span className="text-[8px] text-indigo-400">$987.75</span>
        </div>
        <div className="text-gray-300">→</div>
        <div className="w-20 h-16 bg-white rounded border-2 border-gray-300 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-gray-500">Cuscal</span>
          <span className="text-[8px] text-gray-400">Payment API</span>
        </div>
        <div className="text-gray-300">→</div>
        <div className="w-20 h-16 bg-white rounded border-2 border-emerald-200 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-emerald-500">NPP</span>
          <span className="text-[8px] text-emerald-400">Real-time</span>
        </div>
        <div className="text-gray-300">→</div>
        <div className="w-20 h-16 bg-white rounded border-2 border-blue-200 flex flex-col items-center justify-center">
          <span className="text-[9px] font-bold text-blue-500">Merchant</span>
          <span className="text-[8px] text-blue-400">BSB/Acc</span>
        </div>
      </div>
      {/* Status tracking */}
      <div className="bg-white rounded border border-gray-200 px-3 py-2 space-y-1.5">
        <span className="text-[9px] font-bold text-gray-400">STATUS TRACKING</span>
        {[
          { t: "11:00 AM", a: "Begin transfer", s: "info" },
          { t: "11:00 AM", a: "Status → Transferring", s: "info" },
          { t: "11:02 AM", a: "NPP credit submitted", s: "info" },
          { t: "01:45 PM", a: "Transfer confirmed → Completed", s: "success" },
        ].map((e, i) => (
          <div key={i} className="flex items-center gap-2 text-[9px]">
            <span className="w-14 text-gray-300">{e.t}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${e.s === "success" ? "bg-emerald-400" : "bg-indigo-400"}`} />
            <span className={e.s === "success" ? "text-emerald-600 font-bold" : "text-gray-500"}>{e.a}</span>
          </div>
        ))}
      </div>
      {/* Outcome badges */}
      <div className="flex gap-2 justify-center">
        <span className="text-[8px] px-2 py-1 bg-emerald-100 text-emerald-600 rounded border border-emerald-200 font-bold">✓ Completed</span>
        <span className="text-[8px] px-2 py-1 bg-amber-100 text-amber-600 rounded border border-amber-200 font-bold">↻ Retry (transient)</span>
        <span className="text-[8px] px-2 py-1 bg-red-100 text-red-600 rounded border border-red-200 font-bold">✗ Failed (persistent)</span>
      </div>
    </div>
  );
}

// ── Step definitions ──
const STEPS = [
  {
    id: 1, phase: "Generate", title: "QA generates DTE file",
    actor: "QA / Test Engineer", type: "manual",
    description: "QA uses the DTE Generator in the dashboard to create test transactions. They can add transactions via the quick-add form (8 preset types), import from existing DTE files or CSV templates, then export a spec-compliant DTE v6.0 file.",
    wireframe: WireframeDTEGenerator,
    uiReq: true, reqLabel: "DTE Generator page",
    dataFlow: "Dashboard → Browser (Blob download) → .dte file on disk",
    details: [
      "Quick-add form with 8 presets: Purchase, Refund, Pre-Auth, Reversal, etc.",
      "Import from existing DTE .txt files or CSV templates (auto-detected)",
      "6 card schemes: Visa, Mastercard, Visa Credit, MC Credit, Visa Intl, eftpos",
      "5 test merchants with real-looking MIDs/TIDs",
      "Output: fixed-width ASCII, 700 bytes/record, CR+LF",
    ],
  },
  {
    id: 2, phase: "Ingest", title: "DTE file uploaded to S3",
    actor: "QA (manual upload) / CI pipeline", type: "both",
    description: "The generated DTE file is uploaded to the Cuscal S3 inbox bucket. In production, Cuscal pushes this automatically. For testing, QA uploads manually via AWS console or CLI. The S3 event triggers the Cuscal File Consumer service.",
    wireframe: WireframeS3Upload,
    uiReq: false,
    dataFlow: "DTE file → S3 bucket (cuscal-dte-inbox/) → S3 Event → Cuscal File Consumer",
    details: [
      "Production: Cuscal FTP/S3 push (automated, daily)",
      "Testing: manual upload via `aws s3 cp` or AWS Console",
      "S3 event notification triggers Lambda / Consumer",
      "Consumer validates file header, record count, trailer checksum",
    ],
  },
  {
    id: 3, phase: "Enrich", title: "MSF enrichment applied",
    actor: "MSP (automatic)", type: "auto",
    description: "Each transaction is enriched with Merchant Service Fee (MSF) calculation based on card scheme rates. The gross transaction amount has MSF deducted to produce the net amount owed to the merchant. In the prototype, this is simulated via the 'Ingest & Enrich' button.",
    wireframe: WireframeEnrichment,
    uiReq: true, reqLabel: "Enrichment summary view (Ingest & Enrich button)",
    dataFlow: "Cuscal File Consumer → Acquirer Transaction Normalisation → org svc → MSF engine",
    details: [
      "MSF rates by scheme: Visa @1%, MC @2%, Visa Cr @1.5%, MC Cr @2.2%, Visa Intl @2.5%, eftpos @0.8%",
      "Net = Gross − MSF (per transaction)",
      "Refunds: MSF still deducted, net amount is negative",
      "Enrichment also resolves merchant facility details, MCC, settlement institution",
      "POS Revenue = MSF − mx51 margin − Interchange − Scheme fee",
    ],
  },
  {
    id: 4, phase: "Ledger", title: "Balance transactions created",
    actor: "MSP (automatic)", type: "auto",
    description: "Enriched transactions are written to the merchant ledger as Merchant Ledger Entries (MLEs). Each MLE is an immutable record of liability change. The sum of all MLEs = total amount mx51 owes the merchant. MLEs start in 'unassigned' state, waiting to be swept into a payout.",
    wireframe: WireframeBalanceLedger,
    uiReq: true, reqLabel: "Merchant balance view, MLE listing",
    dataFlow: "MSF Engine → Merchant Ledger Service → Merchant Ledger Entry table",
    details: [
      "Each enriched transaction → 1 Merchant Ledger Entry (immutable)",
      "MLE types: transaction, adjustment, payout_transfer",
      "Status: unassigned → assigned (to payout) → settled",
      "Grouped by MID — each merchant has their own running balance",
      "Sum of unassigned MLEs = amount available for next payout",
    ],
  },
  {
    id: 5, phase: "Prepare", title: "Prepare payout — sweep balances",
    actor: "System (cron) / FinOps (manual)", type: "both",
    description: "At the scheduled time (or manually via 'Prepare Payout'), all unassigned MLEs within the date range are swept and grouped by MID into payout records. The animated sweep shows MLEs moving from unassigned (left) to payout groups (right). Each group becomes a payout record with status 'Ready for Review'.",
    wireframe: WireframePreparePayout,
    uiReq: true, reqLabel: "Prepare Payout dialog (date range + sweep animation)",
    dataFlow: "Prepare Payout Cron/Dialog → Payout Service → Merchant Ledger Service",
    details: [
      "Date range selection filters which MLEs to include",
      "MLEs grouped by MID → one payout per merchant",
      "Animated sweep: left column (unassigned) → right column (grouped)",
      "Zero/negative balance merchants → auto-completed (debt deferred)",
      "Each payout gets status: Ready for Review",
    ],
  },
  {
    id: 6, phase: "Review", title: "FinOps reviews & approves payouts",
    actor: "FinOps T1 (manual)", type: "manual",
    description: "FinOps reviews the prepared payouts — validating amounts against expected DTE totals, checking for anomalies. They can Approve (→ Ready for Transfer), Hold (→ investigation), or Abandon (→ cancel). Expandable payout detail shows the constituent MLEs.",
    wireframe: WireframePayoutReview,
    uiReq: true, reqLabel: "Payout list, Approve/Hold/Abandon actions, Detail panel",
    dataFlow: "Support Dashboard → Payout Service → status update",
    details: [
      "Approve: status → Ready for Transfer (requires FinOps T1+)",
      "Hold: On Hold flag applied (investigation, requires reason)",
      "Abandon: status → Abandoned (requires reason + T2 confirmation if >$10k)",
      "Payout detail: expandable MLE list, merchant info, audit trail",
      "Bulk actions available for batch approve",
    ],
  },
  {
    id: 7, phase: "Transfer", title: "Begin transfer → NPP → Merchant",
    actor: "FinOps Admin / System (automated)", type: "both",
    description: "Approved payout transfers are initiated — sending payment via Cuscal Payment API → NPP (New Payments Platform) → merchant's bank account. Transfer status is tracked via webhooks. Success → Completed. Transient failure → auto-retry. Persistent failure → Failed + alert.",
    wireframe: WireframeTransfer,
    uiReq: true, reqLabel: "Begin transfer, Status tracking, Failure handling",
    dataFlow: "Payout Service → Cuscal Payment API → NPP → Merchant bank → Webhook → Status update",
    details: [
      "Begin transfer: Payout Service calls Cuscal Payment API with BSB/account",
      "NPP: Real-time payment via New Payments Platform",
      "Status tracking: Transferring → Completed (webhook confirmation)",
      "Transient failure: auto-retry up to 3x → back to Ready for Transfer",
      "Persistent failure: payout → Failed, alert raised to FinOps",
      "Edge case: bank return from Completed → Failed (rare)",
    ],
  },
];

export default function DTEtoPayoutWireframes() {
  const [expandedStep, setExpandedStep] = useState(null);
  const [activePhase, setActivePhase] = useState(null);
  const [showWireframes, setShowWireframes] = useState(true);

  const filteredSteps = activePhase ? STEPS.filter((s) => s.phase === activePhase) : STEPS;

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">DTE → Payout End-to-End Wireframes</h1>
        <p className="text-sm text-gray-500 mb-6">
          Lo-fi wireframes showing each screen in the pipeline — from QA generating a DTE file through MSF enrichment, balance ledger, payout preparation, review, and NPP transfer. Click a step to expand the wireframe.
        </p>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          {/* Phase filter pills */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActivePhase(null)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${!activePhase ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>All phases</button>
            {PHASES.map((p) => (
              <button key={p} onClick={() => setActivePhase(activePhase === p ? null : p)} className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors" style={{ backgroundColor: activePhase === p ? PHASE_BORDERS[p] : PHASE_COLORS[p], color: activePhase === p ? "white" : PHASE_BORDERS[p], borderColor: PHASE_BORDERS[p] }}>{p}</button>
            ))}
          </div>
          {/* Wireframe toggle */}
          <button onClick={() => setShowWireframes(!showWireframes)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${showWireframes ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300"}`}>
            {showWireframes ? "Wireframes ON" : "Wireframes OFF"}
          </button>
        </div>

        {/* Legend */}
        <div className="flex gap-6 mb-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /><span>Automatic</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-400" /><span>Manual (UI)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400" /><span>Both</span></div>
          <div className="flex items-center gap-1.5"><span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">UI</span><span>Has UI requirement</span></div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {filteredSteps.map((step, i) => {
            const isExpanded = expandedStep === step.id;
            const dotColor = step.type === "auto" ? "#22C55E" : step.type === "manual" ? "#818CF8" : "#FBBF24";
            const WireframeComponent = step.wireframe;
            return (
              <div key={step.id} className="relative flex gap-4 pb-1">
                {/* Timeline line + dot */}
                <div className="flex flex-col items-center flex-shrink-0 w-8">
                  <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold" style={{ borderColor: dotColor, backgroundColor: dotColor + "20", color: dotColor }}>{step.id}</div>
                  {i < filteredSteps.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                </div>

                {/* Card */}
                <div className={`flex-1 mb-4 rounded-xl border transition-all cursor-pointer ${isExpanded ? "shadow-md" : "hover:shadow-sm"}`} style={{ borderColor: isExpanded ? PHASE_BORDERS[step.phase] : "#E5E7EB", backgroundColor: isExpanded ? PHASE_COLORS[step.phase] + "80" : "white" }} onClick={() => setExpandedStep(isExpanded ? null : step.id)}>
                  <div className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: PHASE_COLORS[step.phase], color: PHASE_BORDERS[step.phase], border: `1px solid ${PHASE_BORDERS[step.phase]}30` }}>{step.phase}</span>
                        <h3 className="text-sm font-bold text-gray-900">{step.title}</h3>
                        {step.uiReq && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">UI</span>}
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}><polyline points="6,9 12,15 18,9" /></svg>
                    </div>
                    <p className="text-xs text-gray-500">{step.actor}</p>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: PHASE_BORDERS[step.phase] + "30" }} onClick={(e) => e.stopPropagation()}>
                      <p className="text-sm text-gray-700 mt-3">{step.description}</p>

                      {/* Wireframe */}
                      {showWireframes && WireframeComponent && (
                        <div className="mt-2">
                          <WireframeComponent />
                        </div>
                      )}

                      {step.uiReq && step.reqLabel && (
                        <div className="flex items-start gap-2 text-xs bg-indigo-50 rounded-lg px-3 py-2 border border-indigo-100">
                          <span className="font-bold text-indigo-700 flex-shrink-0 mt-px">UI Requirements:</span>
                          <span className="text-indigo-600">{step.reqLabel}</span>
                        </div>
                      )}

                      <div className="text-xs">
                        <span className="font-bold text-gray-500">Data flow: </span>
                        <span className="text-gray-600 font-mono">{step.dataFlow}</span>
                      </div>

                      <div>
                        <span className="text-xs font-bold text-gray-500">Key details:</span>
                        <ul className="mt-1 space-y-0.5">
                          {step.details.map((d, j) => (
                            <li key={j} className="text-xs text-gray-600 flex items-start gap-1.5"><span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison note */}
        <div className="mt-8 bg-gray-50 rounded-xl border border-gray-200 px-6 py-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Prototype vs Production</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-indigo-600 block mb-1">In the prototype:</span>
              <ul className="space-y-0.5 text-gray-500">
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>Steps 1 + 3 are combined (Generate → Ingest & Enrich button)</li>
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>Step 2 (S3 upload) is skipped — enrichment runs in-browser</li>
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>Step 4 (MLEs) → pushed directly to React state</li>
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>Steps 5–7 work via the existing Payouts page UI</li>
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>Data resets on page refresh (no persistence)</li>
              </ul>
            </div>
            <div>
              <span className="font-bold text-emerald-600 block mb-1">In production:</span>
              <ul className="space-y-0.5 text-gray-500">
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>DTE file pushed by Cuscal to S3 (automated)</li>
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>Consumer service validates + ingests file</li>
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>MSF engine applies real scheme fee rates</li>
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>Merchant Ledger Service writes immutable MLEs</li>
                <li className="flex items-start gap-1.5"><span className="text-gray-400 flex-shrink-0">•</span>Payout Prep Cron runs daily, NPP transfers are real</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
