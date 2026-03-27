import { useState } from "react";

const events = [
  // DTE Accumulation
  { phase: "accumulation", n: 1, event: "DTE file ingested", trigger: "System", triggerType: "system", sBefore: "Pre-prepared", sAfter: "Pre-prepared", scBefore: "pre", scAfter: "pre", user: "System", audit: "DTE file DTE-20260225-12345 ingested. 14 transactions totalling $987.75.", toast: "" },
  { phase: "accumulation", n: 2, event: "DTE file accumulated (multi-day)", trigger: "System", triggerType: "system", sBefore: "Pre-prepared", sAfter: "Pre-prepared", scBefore: "pre", scAfter: "pre", user: "System", audit: "DTE file DTE-20260224-12345 for 24 Feb added. Payout now spans 2 days of unsettled transactions. Running total: $2,051.80.", toast: "" },

  // Happy path
  { phase: "happy", n: 3, event: "Payout prepared", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Pre-prepared", sAfter: "Ready for Review", scBefore: "pre", scAfter: "review", user: "System", audit: "Merchant balance swept. 32 transactions included across 2 DTE files. Payout amount: $2,051.80.", toast: "Payouts prepared — 1 new payout prepared and set to Ready for Review." },
  { phase: "happy", n: 4, event: "Status → Ready for Review", trigger: "System", triggerType: "system", sBefore: "—", sAfter: "Ready for Review", scBefore: "", scAfter: "review", user: "System", audit: "Awaiting FinOps approval.", toast: "" },
  { phase: "happy", n: 5, event: "Approved", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Ready for Review", sAfter: "Ready for Transfer", scBefore: "review", scAfter: "transfer", user: "Tom Wright (FinOps Administrator)", audit: "Payout reviewed and approved. Status changed to Ready for Transfer.", toast: "Payout approved — PO-2026-0224-001 is now ready for transfer." },
  { phase: "happy", n: 6, event: "Transfer initiated", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Ready for Transfer", sAfter: "Transferring", scBefore: "transfer", scAfter: "transferring", user: "Tom Wright (FinOps Administrator)", audit: "Payout submitted to banking network for settlement.", toast: "Transfer initiated — Payout PO-2026-0224-001 is now transferring." },
  { phase: "happy", n: 7, event: "Transfer completed", trigger: "Bank confirms", triggerType: "bank", sBefore: "Transferring", sAfter: "Completed", scBefore: "transferring", scAfter: "completed", user: "System", audit: "Funds deposited to merchant account. BSB: 062-000, Account: ••••5678.", toast: "" },

  // Zero-balance
  { phase: "edge", n: 8, event: "Payout prepared (zero-balance)", trigger: "System", triggerType: "system", sBefore: "Pre-prepared", sAfter: "Completed", scBefore: "pre", scAfter: "completed", user: "System", audit: "Zero-balance payout — net amount is $0.00 after adjustments. No transfer required. Auto-completed.", toast: "1 zero-balance payout auto-completed." },

  // Hold — payout level
  { phase: "hold", n: 9, event: "Hold placed (payout)", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Any non-terminal", sAfter: "Same + On Hold", scBefore: "same", scAfter: "hold", user: "Sarah Chen (FinOps Administrator)", audit: "Hold placed. Reason: Suspicious activity review.", toast: "Hold placed — PO-2026-0224-001 — Suspicious activity review." },
  { phase: "hold", n: 10, event: "Payout on hold", trigger: "System", triggerType: "system", sBefore: "Any non-terminal", sAfter: "Same + On Hold", scBefore: "same", scAfter: "hold", user: "System", audit: "Payout held pending review. Underlying status: Ready for Transfer.", toast: "" },
  { phase: "hold", n: 11, event: "Hold released (payout)", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Same + On Hold", sAfter: "Same (hold removed)", scBefore: "hold", scAfter: "same", user: "Tom Wright (FinOps Administrator)", audit: "Hold released. Payout resumes from Ready for Transfer.", toast: "Hold released — Hold on PO-2026-0224-001 has been released." },

  // Hold — merchant level
  { phase: "hold", n: 12, event: "Merchant hold placed", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Any non-terminal", sAfter: "Same + On Hold", scBefore: "same", scAfter: "hold", user: "Tom Wright (FinOps Administrator)", audit: "All payouts for Joe's Coffee - Sydney CBD placed on hold.", toast: "All payouts for Joe's Coffee are now on hold." },
  { phase: "hold", n: 13, event: "Merchant hold released", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Same + On Hold", sAfter: "Same (hold removed)", scBefore: "hold", scAfter: "same", user: "Tom Wright (FinOps Administrator)", audit: "Merchant-level hold released for Joe's Coffee - Sydney CBD.", toast: "Payouts for Joe's Coffee can now proceed." },

  // Hold — fleet level
  { phase: "hold", n: 14, event: "Fleet hold placed", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Any non-terminal", sAfter: "Same + On Hold", scBefore: "same", scAfter: "hold", user: "Tom Wright (FinOps Administrator)", audit: "All fleet payouts placed on hold. Reason: Regulatory compliance review.", toast: "Fleet hold placed — All fleet payouts are now on hold." },
  { phase: "hold", n: 15, event: "Fleet hold released", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Same + On Hold", sAfter: "Same (hold removed)", scBefore: "hold", scAfter: "same", user: "Tom Wright (FinOps Administrator)", audit: "Fleet-level hold released. All payouts can now proceed.", toast: "Fleet hold released — All fleet payouts can now proceed." },

  // Failure & recovery
  { phase: "failure", n: 16, event: "Transfer failed (non-retryable)", trigger: "Bank rejects", triggerType: "bank", sBefore: "Transferring", sAfter: "Failed", scBefore: "transferring", scAfter: "failed", user: "System", audit: "Transfer failed. Reason: Invalid BSB — bank returned BECS reject code R4.", toast: "" },
  { phase: "failure", n: 17, event: "Transfer failed (retryable)", trigger: "Network timeout", triggerType: "bank", sBefore: "Transferring", sAfter: "Ready for Transfer", scBefore: "transferring", scAfter: "transfer", user: "System", audit: "Transfer failed (retryable). Cuscal gateway timeout. Auto-transitioned back to Ready for Transfer.", toast: "" },
  { phase: "failure", n: 18, event: "Payout resubmitted", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Failed", sAfter: "Ready for Transfer", scBefore: "failed", scAfter: "transfer", user: "Tom Wright (FinOps Administrator)", audit: "Payout resubmitted for transfer. Moved back to Ready for Transfer.", toast: "Payout resubmitted — PO-2026-0220-001 moved to Ready for Transfer." },

  // Abandon
  { phase: "abandon", n: 19, event: "Abandoned (from Ready for Review)", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Ready for Review", sAfter: "Abandoned", scBefore: "review", scAfter: "abandoned", user: "Tom Wright (FinOps Administrator)", audit: "Payout abandoned. Reason: Merchant requested payout deferral.", toast: "Payout abandoned — Transactions returned to ledger." },
  { phase: "abandon", n: 20, event: "Transactions returned to ledger", trigger: "System", triggerType: "system", sBefore: "—", sAfter: "Abandoned", scBefore: "", scAfter: "abandoned", user: "System", audit: "Payout abandoned. Transactions returned to ledger for next payout preparation.", toast: "" },

  // Adjustments
  { phase: "adjustment", n: 23, event: "Manual adjustment created", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Any", sAfter: "Same", scBefore: "same", scAfter: "same", user: "Tom Wright (FinOps Administrator)", audit: "Adjustment ADJ-2026-0225-001 for -$125.00 created. Status: Pending Approval.", toast: "Adjustment created — pending approval." },
  { phase: "adjustment", n: 24, event: "Adjustment approved", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Pending Approval", sAfter: "Approved", scBefore: "pending", scAfter: "approved", user: "Sarah Chen (FinOps Administrator)", audit: "Adjustment approved. Will be included in next payout.", toast: "Adjustment approved — ADJ-2026-0225-001." },
  { phase: "adjustment", n: 25, event: "Adjustment rejected", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Pending Approval", sAfter: "Rejected", scBefore: "pending", scAfter: "rejected", user: "Sarah Chen (FinOps Administrator)", audit: "Adjustment rejected. Reason: Investigation found amounts correct.", toast: "Adjustment rejected — ADJ-2026-0222-002." },
  { phase: "adjustment", n: 26, event: "Debt deferral applied", trigger: "System", triggerType: "system", sBefore: "Any", sAfter: "Same", scBefore: "same", scAfter: "same", user: "System", audit: "Debt deferral ADJ-2026-0223-002a for -$82.30. Auto-approved.", toast: "" },
  { phase: "adjustment", n: 27, event: "Debt rollover applied", trigger: "System", triggerType: "system", sBefore: "Any", sAfter: "Same", scBefore: "same", scAfter: "same", user: "System", audit: "Debt rollover ADJ-2026-0223-002b for +$82.30. Balancing entry.", toast: "" },

  // Edge cases
  { phase: "edge", n: 28, event: "Multiple DTE files in single prep", trigger: "FinOps Administrator", triggerType: "finops", sBefore: "Pre-prepared", sAfter: "Ready for Review", scBefore: "pre", scAfter: "review", user: "System", audit: "Payout prepared from 5 accumulated DTE files spanning 23–25 Feb. Total: 58 txns, $4,892.15.", toast: "" },
  { phase: "edge", n: 29, event: "Negative payout (merchant owes)", trigger: "System", triggerType: "system", sBefore: "Pre-prepared", sAfter: "Ready for Review", scBefore: "pre", scAfter: "review", user: "System", audit: "Negative payout — merchant owes -$340.50 after debt deferrals. Requires FinOps review.", toast: "" },
];

const phaseLabels = {
  accumulation: { label: "DTE Accumulation", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  happy: { label: "Happy Path", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  hold: { label: "Holds (Payout / Merchant / Fleet)", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  failure: { label: "Failure & Recovery", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  abandon: { label: "Abandon", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
  adjustment: { label: "Adjustments", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  edge: { label: "Edge Cases", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

const statusColors = {
  "pre": "bg-gray-100 text-gray-500 border border-dashed border-gray-300",
  "review": "bg-blue-100 text-blue-800",
  "transfer": "bg-emerald-100 text-emerald-800",
  "transferring": "bg-purple-100 text-purple-800",
  "completed": "bg-emerald-100 text-emerald-800",
  "failed": "bg-red-100 text-red-800",
  "abandoned": "bg-gray-100 text-gray-700",
  "hold": "bg-amber-100 text-amber-800",
  "same": "bg-gray-50 text-gray-500 italic",
  "pending": "bg-amber-100 text-amber-800",
  "approved": "bg-emerald-100 text-emerald-800",
  "rejected": "bg-red-100 text-red-800",
  "": "",
};

const triggerColors = {
  system: "bg-indigo-100 text-indigo-800",
  finops: "bg-amber-100 text-amber-800",
  bank: "bg-emerald-100 text-emerald-800",
};

const phases = ["all", "accumulation", "happy", "hold", "failure", "abandon", "adjustment", "edge"];

export default function AuditLogsReference() {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? events : events.filter((e) => e.phase === filter);

  let lastPhase = "";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filter by phase</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {phases.map((p) => (
            <button key={p} onClick={() => setFilter(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === p ? "bg-indigo-50 border-indigo-300 text-indigo-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}>
              {p === "all" ? "All events" : phaseLabels[p]?.label || p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-2.5 px-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider w-8">#</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Event</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trigger</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Before</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">After</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Audit log message</th>
                <th className="py-2.5 px-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Toast</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const showPhaseHeader = e.phase !== lastPhase;
                lastPhase = e.phase;
                const pc = phaseLabels[e.phase];
                return (
                  <>{showPhaseHeader && (
                    <tr key={`phase-${e.phase}`}>
                      <td colSpan={8} className={`py-2 px-3 text-[11px] font-bold uppercase tracking-wider ${pc.bg} ${pc.text} border-b-2 ${pc.border}`}>{pc.label}</td>
                    </tr>
                  )}
                  <tr key={e.n} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 text-xs text-gray-400 font-mono">{e.n}</td>
                    <td className="py-2 px-3 text-xs font-semibold text-gray-800">{e.event}</td>
                    <td className="py-2 px-3"><span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${triggerColors[e.triggerType]}`}>{e.trigger}</span></td>
                    <td className="py-2 px-3">{e.sBefore ? <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[e.scBefore] || ""}`}>{e.sBefore}</span> : "—"}</td>
                    <td className="py-2 px-3"><span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[e.scAfter] || ""}`}>{e.sAfter}</span></td>
                    <td className="py-2 px-3 text-xs text-gray-500">{e.user}</td>
                    <td className="py-2 px-3 text-xs text-gray-600 leading-relaxed">{e.audit}</td>
                    <td className="py-2 px-3">{e.toast ? <span className="text-[11px] text-gray-600 bg-gray-50 border border-gray-200 rounded px-2 py-1 inline-block leading-tight">{e.toast}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                  </tr></>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">{filtered.length} events shown{filter !== "all" ? ` (filtered: ${phaseLabels[filter]?.label})` : ""} · {events.length} total</div>
    </div>
  );
}
