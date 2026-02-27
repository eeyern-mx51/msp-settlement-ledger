import { useState } from "react";

const FLOWS = {
  approve: {
    title: "Approve Payout",
    icon: "✓",
    color: "#4F46E5",
    bgColor: "#EEF2FF",
    precondition: "Payout is in Ready for Review status",
    role: "FinOps Tier 1 only",
    transition: "Ready for Review → Ready for Transfer (positive balance) or → Completed (zero/negative)",
    steps: [
      { actor: "FinOps T1", action: "Navigate to payout detail", detail: "Click payout row from fleet or merchant payout list." },
      { actor: "FinOps T1", action: "Review payout summary", detail: "Validate payout amount against expected DTE transaction sums. Check merchant, MID, transfer count." },
      { actor: "FinOps T1", action: "Click \"Approve\" button", detail: "Opens confirmation dialog showing payout ID, merchant, MID, amount, and transfer count." },
      { actor: "FinOps T1", action: "Confirm approval", detail: "Click \"Approve payout\" in dialog. 1.2s loading state while processing." },
      { actor: "System", action: "Process approval", detail: "If amount > 0: status → Ready for Transfer. If amount ≤ 0: status → Completed (debt deferred + rollover adjustments created)." },
      { actor: "System", action: "Audit log entry", detail: "Records: \"Payout approved\" with user, timestamp, and previous status." },
      { actor: "UI", action: "Success toast", detail: "\"Payout approved — PO-XXXX is now ready for transfer.\" Status badge updates in real-time." },
    ],
    edgeCases: [
      "Zero balance payouts auto-complete at approval (no transfer needed)",
      "Negative balance creates debt_deferred + debt_rollover adjustments",
      "Paused payouts cannot be approved — must be resumed first",
      "POC: manual approval only. Pilot: auto-approve based on pre-defined criteria with manual override",
    ],
  },
  pause: {
    title: "Pause Payout",
    icon: "⏸",
    color: "#D97706",
    bgColor: "#FFFBEB",
    precondition: "Payout is in Ready for Review, Ready for Transfer, or Failed status",
    role: "FinOps Tier 1 only",
    transition: "Ready for Review → Paused (reviewing) | Ready for Transfer / Failed → Paused (transferring)",
    steps: [
      { actor: "FinOps T1", action: "Navigate to payout detail", detail: "Click payout row from fleet or merchant payout list." },
      { actor: "FinOps T1", action: "Click \"Pause\" button", detail: "Opens pause dialog with warning: \"The payout will remain in a paused state until resumed or abandoned.\"" },
      { actor: "FinOps T1", action: "Select pause reason (required)", detail: "Options: Pending merchant verification, Suspicious activity review, Bank details under review, Regulatory hold, Internal audit, Other." },
      { actor: "FinOps T1", action: "Add internal note (optional)", detail: "Free text up to 300 characters. Context for the FinOps team — not visible to merchant." },
      { actor: "FinOps T1", action: "Confirm pause", detail: "Click \"Pause payout\". 1s loading state." },
      { actor: "System", action: "Process pause", detail: "Status → Paused (reviewing) or Paused (transferring) depending on source state. No progression until resumed." },
      { actor: "System", action: "Audit log entry", detail: "Records: \"Payout paused\" with reason, note, user, timestamp." },
      { actor: "UI", action: "Warning toast", detail: "\"Payout paused — PO-XXXX — {reason}.\" Dashed border on status badge." },
    ],
    edgeCases: [
      "Pausing from Ready for Review → Paused (reviewing)",
      "Pausing from Ready for Transfer → Paused (transferring)",
      "Pausing from Failed → Paused (transferring)",
      "A paused payout blocks all progression — no auto-approve or auto-transfer",
      "Must pause before abandoning (intentional friction to discourage abandonment)",
    ],
  },
  abandon: {
    title: "Abandon Payout",
    icon: "⊘",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    precondition: "Payout is in Paused (reviewing) or Paused (transferring) status",
    role: "FinOps Tier 1 only",
    transition: "Paused → Abandoned (terminal)",
    steps: [
      { actor: "FinOps T1", action: "Navigate to paused payout", detail: "Payout must already be paused — cannot abandon directly from active states." },
      { actor: "FinOps T1", action: "Click \"Abandon\" button", detail: "Opens destructive confirmation dialog with red-themed warning: \"This action is irreversible.\"" },
      { actor: "FinOps T1", action: "Review impact summary", detail: "Red panel shows: payout ID, merchant, amount at risk, transfers affected." },
      { actor: "FinOps T1", action: "Select reason (required)", detail: "Options: Duplicate payout, Merchant account closed, Fraudulent activity confirmed, Incorrect settlement calculation, Merchant requested cancellation, Other." },
      { actor: "FinOps T1", action: "Type \"ABANDON\" to confirm", detail: "Destructive action safeguard — must type exact text. Case-insensitive." },
      { actor: "FinOps T1", action: "Confirm abandon", detail: "Click \"Abandon payout\". 1.5s loading state (longer delay for gravity of action)." },
      { actor: "System", action: "Process abandonment (preferred approach)", detail: "Remove payout_id from all merchant ledger entries. Set payout amount to zero. Status → Abandoned. Funds return to merchant balance for next payout." },
      { actor: "System", action: "Audit log entry", detail: "Records: \"Payout abandoned\" with reason, user, timestamp. Permanent record." },
      { actor: "UI", action: "Error toast + auto-navigate", detail: "\"Payout abandoned — PO-XXXX has been permanently cancelled.\" Auto-returns to payout list." },
    ],
    edgeCases: [
      "Can ONLY abandon from paused states (must pause first)",
      "Terminal state — no further actions possible",
      "Merchant ledger entries released back to balance",
      "May require a manual adjustment to offset incorrect calculations",
      "An abandoned_payout_return adjustment may appear in the next payout",
      "Example: suspicious purchase paused → refund received → abandon original payout",
    ],
  },
  execute: {
    title: "Execute Payout (Transfer)",
    icon: "▶",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    precondition: "Payout is in Ready for Transfer status",
    role: "FinOps Tier 1 only (POC: manual, Pilot/BAU: automated)",
    transition: "Ready for Transfer → Transferring → Completed / Failed",
    steps: [
      { actor: "FinOps T1", action: "Navigate to approved payout", detail: "Payout must be in Ready for Transfer status." },
      { actor: "FinOps T1", action: "Click \"Execute\" button", detail: "Triggers transfer immediately — no additional confirmation dialog for speed." },
      { actor: "System", action: "Set status to Transferring", detail: "Status MUST be set before the NPP request is made. Audit log: \"Transfer initiated\"." },
      { actor: "System", action: "Send payment via NPP", detail: "Payout Service → Cuscal Payment API → NPP. Creates payout transfer record." },
      { actor: "System", action: "Await NPP webhook", detail: "Cuscal sends webhook with transfer outcome. Recover NPP Status endpoint as backup." },
      { actor: "System", action: "Record transfer outcome", detail: "Success → Completed + MLE entry. Transient failure → Ready for Transfer (auto-retry). Persistent failure → Failed + alert." },
      { actor: "UI", action: "Success toast", detail: "\"Transfer initiated — PO-XXXX is now transferring to the merchant's bank.\"" },
    ],
    edgeCases: [
      "Kill switch (fleet or merchant) blocks execution entirely",
      "POC: per-merchant manual execution",
      "Future: multi-select / trigger all from fleet list",
      "Backoff logic if too many failures across merchants",
      "Challenge with automation: sufficient funds check",
    ],
  },
  resume: {
    title: "Resume Payout",
    icon: "▶",
    color: "#059669",
    bgColor: "#F0FDF4",
    precondition: "Payout is in Paused (reviewing) or Paused (transferring) status",
    role: "FinOps Tier 1 only",
    transition: "Paused (reviewing) → Ready for Review | Paused (transferring) → Ready for Transfer",
    steps: [
      { actor: "FinOps T1", action: "Navigate to paused payout", detail: "Filter by Paused status to find held payouts." },
      { actor: "FinOps T1", action: "Click \"Resume\" button", detail: "Immediate action — no confirmation dialog needed." },
      { actor: "System", action: "Restore previous state", detail: "Paused (reviewing) → Ready for Review. Paused (transferring) → Ready for Transfer." },
      { actor: "System", action: "Audit log entry", detail: "Records: \"Payout resumed\" with user and timestamp." },
      { actor: "UI", action: "Success toast", detail: "\"Payout resumed — PO-XXXX has been moved back to {state}.\"" },
    ],
    edgeCases: [
      "Resuming re-enables all actions available in the target state",
      "Auto-approve/auto-transfer criteria may immediately re-trigger (Pilot/BAU)",
    ],
  },
};

const FLOW_ORDER = ["approve", "pause", "abandon", "execute", "resume"];

export default function FinOpsActionFlows() {
  const [activeFlow, setActiveFlow] = useState("approve");
  const flow = FLOWS[activeFlow];

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">FinOps Payout Action Flows</h1>
        <p className="text-sm text-gray-500 mb-6">Step-by-step interaction flows for each payout action available to FinOps users on the Support Dashboard.</p>

        {/* Flow selector */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {FLOW_ORDER.map(key => {
            const f = FLOWS[key];
            const active = activeFlow === key;
            return (
              <button key={key} onClick={() => setActiveFlow(key)} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg border transition-all" style={{ backgroundColor: active ? f.color : "white", color: active ? "white" : f.color, borderColor: active ? f.color : f.color + "40" }}>
                <span>{f.icon}</span> {f.title}
              </button>
            );
          })}
        </div>

        {/* Flow detail */}
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: flow.color + "30" }}>
          {/* Header */}
          <div className="px-6 py-5" style={{ backgroundColor: flow.bgColor }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{flow.icon}</span>
              <h2 className="text-xl font-bold" style={{ color: flow.color }}>{flow.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div><span className="font-bold text-gray-500 text-xs uppercase">Precondition</span><p className="text-gray-700 mt-0.5">{flow.precondition}</p></div>
              <div><span className="font-bold text-gray-500 text-xs uppercase">Role</span><p className="text-gray-700 mt-0.5">{flow.role}</p></div>
              <div><span className="font-bold text-gray-500 text-xs uppercase">Transition</span><p className="text-gray-700 mt-0.5 font-mono text-xs">{flow.transition}</p></div>
            </div>
          </div>

          {/* Steps */}
          <div className="px-6 py-5 space-y-0">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Step-by-step flow</h3>
            {flow.steps.map((step, i) => {
              const actorColor = step.actor === "System" ? "#16A34A" : step.actor === "UI" ? "#7C3AED" : flow.color;
              return (
                <div key={i} className="flex gap-4 pb-4 last:pb-0">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: actorColor }}>{i + 1}</div>
                    {i < flow.steps.length - 1 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: actorColor + "30" }} />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: actorColor + "15", color: actorColor }}>{step.actor}</span>
                      <span className="text-sm font-bold text-gray-900">{step.action}</span>
                    </div>
                    <p className="text-sm text-gray-600">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edge cases */}
          <div className="px-6 py-4 border-t" style={{ backgroundColor: flow.bgColor + "60", borderColor: flow.color + "15" }}>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Edge cases & notes</h3>
            <ul className="space-y-1">
              {flow.edgeCases.map((ec, i) => (
                <li key={i} className="text-sm text-gray-600 flex items-start gap-2"><span className="text-gray-400 flex-shrink-0">⚠</span>{ec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
