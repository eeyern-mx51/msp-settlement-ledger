import { useState } from "react";

const FLOWS = {
  approve: {
    title: "Approve Payout",
    icon: "✓",
    color: "#4F46E5",
    bgColor: "#EEF2FF",
    precondition: "Payout is in Ready for Review status (not on hold)",
    role: "FinOps Admin only",
    transition: "Ready for Review → Ready for Transfer (positive balance) or → Completed (zero/negative)",
    steps: [
      { actor: "FinOps Admin", action: "Navigate to payout detail", detail: "Click payout row from fleet or merchant payout list." },
      { actor: "FinOps Admin", action: "Review payout summary", detail: "Validate payout amount against expected DTE transaction sums. Check merchant, MID, transfer count." },
      { actor: "FinOps Admin", action: "Click \"Approve\" button", detail: "Opens confirmation dialog showing payout ID, merchant, MID, amount, and transfer count." },
      { actor: "FinOps Admin", action: "Confirm approval", detail: "Click \"Approve payout\" in dialog. 1.2s loading state while processing." },
      { actor: "System", action: "Process approval", detail: "If amount > 0: status → Ready for Transfer. If amount ≤ 0: status → Completed (debt deferred + rollover adjustments created)." },
      { actor: "System", action: "Audit log entry", detail: "Records: \"Payout approved\" with user, timestamp, and previous status." },
      { actor: "UI", action: "Success toast", detail: "\"Payout approved — PO-XXXX is now ready for transfer.\" Status badge updates in real-time." },
    ],
    edgeCases: [
      "Zero balance payouts auto-complete at approval (no transfer needed)",
      "Negative balance creates debt_deferred + debt_rollover adjustments",
      "Payouts on hold cannot be approved — hold must be released first",
      "POC: manual approval only. Pilot: auto-approve based on pre-defined criteria with manual override",
    ],
  },
  hold: {
    title: "Hold Payout",
    icon: "⏸",
    color: "#D97706",
    bgColor: "#FFFBEB",
    precondition: "Payout is in Ready for Review or Ready for Transfer status",
    role: "FinOps Admin only",
    transition: "Hold is a flag overlay — underlying status is preserved. Ready for Review + hold flag | Ready for Transfer + hold flag",
    steps: [
      { actor: "FinOps Admin", action: "Navigate to payout detail", detail: "Click payout row from fleet or merchant payout list." },
      { actor: "FinOps Admin", action: "Click \"Hold\" button", detail: "Opens hold dialog with warning: \"This payout will be placed on hold. No transfers will be initiated while on hold.\"" },
      { actor: "FinOps Admin", action: "Select hold reason (required)", detail: "Options: Pending merchant verification, Suspicious activity review, Bank details under review, Regulatory hold, Internal audit, Other." },
      { actor: "FinOps Admin", action: "Add internal note (optional)", detail: "Free text up to 300 characters. Context for the FinOps team — not visible to merchant." },
      { actor: "FinOps Admin", action: "Confirm hold", detail: "Click \"Place hold\". 1s loading state." },
      { actor: "System", action: "Process hold", detail: "Hold flag set to true. Underlying status preserved (Ready for Review or Ready for Transfer). All progression blocked until hold is released." },
      { actor: "System", action: "Audit log entry", detail: "Records: \"Hold placed\" with reason, note, user, timestamp. Underlying status noted." },
      { actor: "UI", action: "Warning toast", detail: "\"Hold placed — PO-XXXX — {reason}.\" On Hold badge appears alongside status badge." },
    ],
    edgeCases: [
      "Hold is a flag, not a state — the underlying status is preserved",
      "Holding from Ready for Review: payout remains Ready for Review but approval is blocked",
      "Holding from Ready for Transfer: payout remains Ready for Transfer but execution is blocked",
      "A held payout blocks all progression — no auto-approve or auto-transfer",
      "Fleet-level hold (\"Hold all payouts\") overrides individual payout and merchant-level holds",
      "Merchant-level hold (\"Hold payouts for [Merchant Name]\") uses the merchant name to disambiguate from fleet-level holds",
    ],
  },
  abandon: {
    title: "Abandon Payout",
    icon: "⊘",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    precondition: "Payout is in Ready for Review, Ready for Transfer, or Failed status",
    role: "FinOps Admin only",
    transition: "Any qualifying status → Abandoned (terminal). Hold flag cleared if present.",
    steps: [
      { actor: "FinOps Admin", action: "Navigate to payout detail", detail: "Payout must be in Ready for Review, Ready for Transfer, or Failed status." },
      { actor: "FinOps Admin", action: "Click \"Abandon\" button", detail: "Opens destructive confirmation dialog with red-themed warning: \"This action is irreversible.\"" },
      { actor: "FinOps Admin", action: "Review impact summary", detail: "Red panel shows: payout ID, merchant, amount at risk, transfers affected." },
      { actor: "FinOps Admin", action: "Select reason (required)", detail: "Options: Duplicate payout, Merchant account closed, Fraudulent activity confirmed, Incorrect settlement calculation, Merchant requested cancellation, Other." },
      { actor: "FinOps Admin", action: "Type \"ABANDON\" to confirm", detail: "Destructive action safeguard — must type exact text. Case-insensitive." },
      { actor: "FinOps Admin", action: "Confirm abandon", detail: "Click \"Abandon payout\". 1.5s loading state (longer delay for gravity of action)." },
      { actor: "System", action: "Process abandonment", detail: "Remove payout_id from all merchant ledger entries. Set payout amount to zero. Status → Abandoned. Hold flag cleared. Funds return to merchant balance for next payout." },
      { actor: "System", action: "Audit log entry", detail: "Records: \"Payout abandoned\" with reason, user, timestamp. Permanent record." },
      { actor: "UI", action: "Error toast + auto-navigate", detail: "\"Payout abandoned — PO-XXXX has been permanently cancelled.\" Auto-returns to payout list." },
    ],
    edgeCases: [
      "Can abandon from Ready for Review, Ready for Transfer, or Failed — including payouts on hold",
      "Abandoning from Failed requires stringent criteria (documented evidence of non-recoverability)",
      "Terminal state — no further actions possible",
      "Merchant ledger entries released back to balance",
      "May require a manual adjustment to offset incorrect calculations",
      "An abandoned_payout_return adjustment may appear in the next payout",
      "Example: suspicious activity flagged → hold placed → investigation confirms fraud → abandon payout",
    ],
  },
  execute: {
    title: "Begin Transfer",
    icon: "▶",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    precondition: "Payout is in Ready for Transfer status (not on hold)",
    role: "FinOps Admin only (POC: manual, Pilot/BAU: automated)",
    transition: "Ready for Transfer → Transferring → Completed / Failed",
    steps: [
      { actor: "FinOps Admin", action: "Navigate to approved payout", detail: "Payout must be in Ready for Transfer status and not on hold." },
      { actor: "FinOps Admin", action: "Click \"Begin transfer\" button", detail: "Triggers transfer immediately — no additional confirmation dialog for speed." },
      { actor: "System", action: "Set status to Transferring", detail: "Status MUST be set before the NPP request is made. Audit log: \"Begin transfer\"." },
      { actor: "System", action: "Send payment via NPP", detail: "Payout Service → Cuscal Payment API → NPP. Creates payout transfer record." },
      { actor: "System", action: "Await NPP webhook", detail: "Cuscal sends webhook with transfer outcome. Recover NPP Status endpoint as backup." },
      { actor: "System", action: "Record transfer outcome", detail: "Success → Completed + MLE entry. Transient failure → Failed (retryable) — manual retry available. Persistent failure → Failed (non-retryable) — resolution required." },
      { actor: "UI", action: "Success toast", detail: "\"Transfer initiated — PO-XXXX is now transferring to the merchant's bank.\"" },
    ],
    edgeCases: [
      "Fleet or merchant-level hold blocks transfer entirely",
      "Payouts on hold cannot have transfer initiated — hold must be released first",
      "POC: per-merchant manual initiation",
      "Future: multi-select / trigger all from fleet list",
      "Backoff logic if too many failures across merchants",
      "Challenge with automation: sufficient funds check",
    ],
  },
  retry: {
    title: "Retry Payout",
    icon: "↻",
    color: "#2563EB",
    bgColor: "#EFF6FF",
    precondition: "Payout is in Failed status with retryable flag. Non-retryable payouts must have root cause resolved first.",
    role: "FinOps Admin only (POC: manual only. Pilot/BAU: automated for select conditions)",
    transition: "Failed (retryable) → Ready for Transfer → Begin transfer → Transferring → Completed / Failed",
    steps: [
      { actor: "FinOps Admin", action: "Navigate to failed payout", detail: "Filter by Failed status. Review the error code and failure reason displayed in the alert banner." },
      { actor: "FinOps Admin", action: "Review failure context", detail: "Check error code (e.g. GATEWAY_TIMEOUT, RATE_LIMITED), attempt count, and recommended action. For GATEWAY_TIMEOUT, confirm no duplicate payment was processed." },
      { actor: "FinOps Admin", action: "Click \"Retry (attempt N)\" button", detail: "Button shows the attempt number. Available only on retryable failures. Triggers immediately — no confirmation dialog." },
      { actor: "System", action: "Transition to Ready for Transfer", detail: "Status → Ready for Transfer. Attempt counter incremented. Audit log: \"Manual retry initiated — Attempt N.\"" },
      { actor: "FinOps Admin", action: "Begin the transfer", detail: "Payout now follows the standard Begin transfer flow — click \"Begin transfer\" to initiate the NPP transfer." },
      { actor: "System", action: "Record outcome", detail: "Success → Completed. Failure → returns to Failed with updated attempt count." },
      { actor: "UI", action: "Success toast", detail: "\"Retry initiated — PO-XXXX has been queued for re-transfer.\"" },
    ],
    edgeCases: [
      "Retryable conditions: GATEWAY_TIMEOUT, NPP_UNAVAILABLE, RATE_LIMITED, RECEIVER_TEMP_UNAVAIL, CUSCAL_5XX, INSUFFICIENT_FUNDS",
      "Non-retryable conditions: INVALID_BSB, INVALID_ACCOUNT, ACCOUNT_CLOSED, ACCOUNT_BLOCKED, NAME_MISMATCH, COMPLIANCE_BLOCK, PAYMENT_REJECTED, DUPLICATE_REFERENCE",
      "After 3 failed attempts: amber 'Escalation recommended' indicator — investigate root cause before retrying",
      "After 5 failed attempts: red 'Investigation required' indicator — likely systemic issue",
      "GATEWAY_TIMEOUT retries should be preceded by reconciliation check (is the original payment still pending?)",
      "INSUFFICIENT_FUNDS: alert treasury/finance team — the retry will fail again if the account isn't funded",
      "Multiple merchants failing simultaneously suggests a Cuscal/NPP outage, not individual payout issues",
      "Non-retryable resolution flow: fix root cause → FinOps transitions payout to Ready for Transfer → Begin transfer (this is a fresh attempt, not a retry of old data)",
      "Future: auto-retry for RATE_LIMITED and NPP_UNAVAILABLE in Pilot phase. Full auto-retry with exponential backoff in BAU.",
    ],
  },
  release: {
    title: "Release Hold",
    icon: "▶",
    color: "#059669",
    bgColor: "#F0FDF4",
    precondition: "Payout has hold flag set (on hold)",
    role: "FinOps Admin only",
    transition: "Hold flag cleared — payout returns to its underlying status (Ready for Review or Ready for Transfer)",
    steps: [
      { actor: "FinOps Admin", action: "Navigate to held payout", detail: "Filter by On Hold to find held payouts." },
      { actor: "FinOps Admin", action: "Click \"Release Hold\" button", detail: "Immediate action — no confirmation dialog needed." },
      { actor: "System", action: "Clear hold flag", detail: "Hold flag set to false. Underlying status is already preserved — payout returns to Ready for Review or Ready for Transfer." },
      { actor: "System", action: "Audit log entry", detail: "Records: \"Hold released\" with user and timestamp. Restored status noted." },
      { actor: "UI", action: "Success toast", detail: "\"Hold released — PO-XXXX is now {underlying status}.\" On Hold badge removed." },
    ],
    edgeCases: [
      "Releasing hold re-enables all actions available for the underlying status",
      "Auto-approve/auto-transfer criteria may immediately re-trigger (Pilot/BAU)",
      "Fleet-level hold release (\"Hold all payouts\") affects all payouts fleet-wide",
      "Merchant-level hold release affects only payouts for that specific merchant — uses merchant name in banner and toast",
    ],
  },
};

const FLOW_ORDER = ["approve", "hold", "abandon", "execute", "retry", "release"];

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
