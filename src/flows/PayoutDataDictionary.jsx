import { useState } from "react";

const SECTIONS = [
  {
    id: "statuses",
    title: "Payout Statuses",
    subtitle: "The six discrete states a payout can occupy in its lifecycle",
    items: [
      {
        term: "Ready for Review",
        type: "Status",
        color: "#818CF8",
        bg: "#EEF2FF",
        definition: "The payout has been prepared and is awaiting FinOps Admin approval before funds can be transferred. This is the entry point for every new payout.",
        uiTreatment: "Indigo badge. Primary action: Approve. Secondary actions: Hold, Abandon.",
        useCases: [
          "Daily automated sweep creates a payout for Merchant X with a positive balance of $4,200.",
          "FinOps Admin opens the payout, reviews the included transactions, and either approves, places a hold, or abandons.",
        ],
        auditExamples: [
          { actor: "System", entry: "Payout prepared — Merchant balance swept. 14 transactions included." },
          { actor: "System", entry: "Status changed to Ready for Review — Awaiting FinOps approval." },
        ],
        uxJustification: "Ready for Review signals a human gate. Financial operations teams expect an explicit review step before money moves. The name avoids ambiguity — it's not 'Pending' (which could mean anything) or 'Draft' (which implies incompleteness).",
      },
      {
        term: "Ready for Transfer",
        type: "Status",
        color: "#22C55E",
        bg: "#F0FDF4",
        definition: "The payout has been approved and is eligible for execution. The earliest execution window has been reached. Funds can now be sent via NPP.",
        uiTreatment: "Green badge. Primary action: Execute. Secondary actions: Hold, Abandon.",
        useCases: [
          "FinOps Admin approves payout PO-2026-0220-005. It moves to Ready for Transfer and appears in the execution queue.",
          "A retryable failure auto-transitions the payout back here for re-execution.",
        ],
        auditExamples: [
          { actor: "Tom Wright (FinOps Admin)", entry: "Approved — Status changed to Ready for Transfer." },
          { actor: "System", entry: "Retryable failure resolved — Auto-transitioned to Ready for Transfer." },
        ],
        uxJustification: "'Ready for Transfer' is deliberately specific about what it's ready for — the actual bank transfer. This prevents confusion with 'Ready for Review' and clearly communicates the next expected action.",
      },
      {
        term: "Transferring",
        type: "Status",
        color: "#A78BFA",
        bg: "#F5F3FF",
        definition: "The NPP transfer has been initiated. The payout is in-flight — funds are being sent to the merchant's bank. This status MUST be set before the NPP request is made.",
        uiTreatment: "Purple badge. No user actions available — this is a system-driven transitional state.",
        useCases: [
          "FinOps Admin clicks Execute on PO-2026-0220-005. The system sets status to Transferring, then initiates the NPP request.",
          "In Pilot/BAU mode, the system auto-executes approved payouts and sets Transferring programmatically.",
        ],
        auditExamples: [
          { actor: "Sarah Chen (FinOps Admin)", entry: "Transfer initiated — NPP request submitted. Transfer ID: TRF-2026-0220-005." },
          { actor: "System", entry: "Status changed to Transferring — Awaiting NPP confirmation." },
        ],
        uxJustification: "'Transferring' uses the progressive tense (-ing) to signal an active, in-progress operation. FinOps users understand at a glance that this payout is mid-flight and cannot be interrupted. We chose not to call this 'Processing' because that's too generic and doesn't convey the specificity of a bank transfer. Note: this state cannot be held or abandoned — once money is moving, it must resolve.",
      },
      {
        term: "Completed",
        type: "Status (terminal)",
        color: "#22C55E",
        bg: "#F0FDF4",
        definition: "Terminal state. The merchant has been paid successfully, or the payout amount was zero/negative (debt deferred, no transfer needed).",
        uiTreatment: "Green badge with rounded pill shape. No actions available. Displayed in success styling.",
        useCases: [
          "NPP confirms the transfer for PO-2026-0220-005 was received by the merchant's bank. Status moves to Completed.",
          "Payout PO-2026-0220-008 has a $0 balance at approval. It auto-completes (no transfer needed).",
        ],
        auditExamples: [
          { actor: "System", entry: "Transfer completed — NPP confirmation received. Merchant bank: ANZ, BSB: 013-140." },
          { actor: "System", entry: "Auto-completed — Payout amount is $0.00. No transfer required." },
        ],
        uxJustification: "'Completed' is universally understood as a terminal success state. We avoid 'Paid' because the zero-balance auto-completion path means not all Completed payouts involve actual fund transfers.",
      },
      {
        term: "Failed",
        type: "Status",
        color: "#F87171",
        bg: "#FEF2F2",
        definition: "The transfer has failed. Distinguished by a retryable flag: retryable failures (transient NPP issues) auto-transition back to Ready for Transfer; non-retryable failures (wrong BSB, closed account) require manual resolution first.",
        uiTreatment: "Red badge. Additional sub-badge: 'Retryable' (purple) or 'Non-retryable' (grey). Retryable payouts show a Retry action; non-retryable show only Abandon.",
        useCases: [
          "NPP returns a transient error (timeout). Payout is marked Failed + retryable → auto-transitions to Ready for Transfer.",
          "NPP returns 'Invalid BSB'. Payout is marked Failed + non-retryable. FinOps must coordinate bank detail correction before retry.",
        ],
        auditExamples: [
          { actor: "System", entry: "Transfer failed (retryable) — NPP timeout. Auto-queued for retry." },
          { actor: "System", entry: "Transfer failed (non-retryable) — Invalid BSB: 000-000. Manual resolution required." },
          { actor: "Tom Wright (FinOps Admin)", entry: "Bank details corrected — Retry initiated. Status changed to Ready for Transfer." },
        ],
        uxJustification: "The retryable/non-retryable sub-classification prevents FinOps from wasting time investigating transient failures (the system handles those) while ensuring persistent failures get human attention. The sub-badges make this distinction scannable at the table level without needing to open each payout.",
      },
      {
        term: "Abandoned",
        type: "Status (terminal)",
        color: "#9CA3AF",
        bg: "#F9FAFB",
        definition: "Terminal state. The payout has been permanently cancelled. The merchant's ledger entries are released back to the balance for inclusion in a future payout. This action is irreversible.",
        uiTreatment: "Grey badge with rounded pill shape. No actions available. Requires typing 'ABANDON' to confirm.",
        useCases: [
          "FinOps Admin discovers PO-2026-0220-010 is a duplicate. They abandon it from Ready for Review.",
          "A non-retryable Failed payout cannot be resolved (merchant account permanently closed). After documenting evidence, FinOps abandons it.",
        ],
        auditExamples: [
          { actor: "Sarah Chen (FinOps Admin)", entry: "Abandoned — Reason: Duplicate payout. Merchant ledger entries released." },
          { actor: "System", entry: "Status changed to Abandoned — Payout permanently cancelled." },
        ],
        uxJustification: "'Abandoned' carries appropriate weight for an irreversible cancellation. We chose it over 'Cancelled' (too casual, implies it can be undone) and 'Voided' (accounting-specific, not universally understood by FinOps). The confirmation dialog requiring 'ABANDON' typed out adds friction proportional to the severity of the action.",
      },
    ],
  },
  {
    id: "flags",
    title: "Payout Flags",
    subtitle: "Boolean overlays that modify behaviour without changing the underlying status",
    items: [
      {
        term: "On Hold",
        type: "Flag (boolean overlay)",
        color: "#FBBF24",
        bg: "#FFFBEB",
        definition: "A hold placed on a payout to temporarily freeze all progression. The underlying status (Ready for Review or Ready for Transfer) is preserved. While on hold, no status transitions occur except Release Hold and Abandon.",
        uiTreatment: "Amber 'On Hold' badge displayed alongside the status badge. Actions change to: Release Hold (primary) and Abandon (secondary). The underlying status badge remains visible so FinOps always knows where the payout was when the hold was placed.",
        useCases: [
          "Sarah notices an unusually high payout amount for Merchant Y. She places a hold while she investigates with the merchant team.",
          "Regulatory compliance flags a merchant for review. FinOps places a hold on all their pending payouts until clearance is received.",
          "A hold is placed on a Ready for Transfer payout at 3pm. At 5pm, compliance confirms the merchant is clear. FinOps releases the hold and the payout returns to Ready for Transfer, ready to execute.",
        ],
        auditExamples: [
          { actor: "Sarah Chen (FinOps Admin)", entry: "Hold placed — Reason: Suspicious activity review. Unusually high payout amount flagged for manual verification." },
          { actor: "System", entry: "Payout on hold — Underlying status: Ready for Transfer. Progression frozen." },
          { actor: "Sarah Chen (FinOps Admin)", entry: "Hold released — Investigation complete. Payout cleared for transfer." },
          { actor: "System", entry: "Hold cleared — Payout resumed at Ready for Transfer." },
        ],
        uxJustification: "We chose 'Hold' over alternatives for several reasons. (1) vs 'Paused': Paused implies a state the payout moves into, which contradicts the flag-based architecture. 'On Hold' naturally describes something applied to a payout. (2) vs 'Disable progression': Too technical and system-oriented. FinOps teams think in terms of holds, not UI state management. It also risks confusion with disabled/enabled UI patterns. (3) vs 'Freeze/Unfreeze': Carries fraud-investigation connotations that would be misleading for routine holds like regulatory review or scheduling conflicts. (4) vs 'Suspend/Reinstate': Overly formal and bureaucratic. 'Hold' and 'Release Hold' are natural language FinOps teams already use. The flag model means the audit trail preserves the true underlying status, so when a hold is released, there's no ambiguity about where the payout should resume from.",
        alternatives: [
          { term: "Paused", verdict: "Rejected", reason: "Implies a discrete state, not a flag. Would conflict with the data model and confuse the audit trail." },
          { term: "Disable Progression", verdict: "Rejected", reason: "Backend-oriented terminology. Sounds like a system config toggle. 'Disable' conflicts with enabled/disabled UI patterns." },
          { term: "Frozen", verdict: "Considered", reason: "Carries fraud-specific connotations. Could alarm merchants unnecessarily if exposed in any downstream reporting." },
          { term: "Suspended", verdict: "Considered", reason: "More formal than needed. 'Hold' is simpler, more intuitive, and more commonly used in FinOps vernacular." },
        ],
      },
      {
        term: "Retryable / Non-retryable",
        type: "Flag (on Failed status only)",
        color: "#A78BFA",
        bg: "#F5F3FF",
        definition: "A boolean flag on Failed payouts indicating whether the failure is transient (retryable by the system) or persistent (requires manual intervention before retry).",
        uiTreatment: "Sub-badge next to the Failed badge: purple 'Retryable' or grey 'Non-retryable'. Retryable payouts auto-transition to Ready for Transfer. Non-retryable payouts only show Abandon until the underlying issue is resolved.",
        useCases: [
          "NPP returns a timeout (retryable). The system automatically queues the payout for re-execution without FinOps intervention.",
          "NPP returns 'Invalid BSB' (non-retryable). FinOps contacts the merchant to correct their bank details, then manually retries.",
        ],
        auditExamples: [
          { actor: "System", entry: "Transfer failed — Retryable (NPP timeout). Auto-queued for retry." },
          { actor: "System", entry: "Transfer failed — Non-retryable (Invalid BSB: 000-000). Manual resolution required." },
        ],
        uxJustification: "The retryable distinction prevents unnecessary FinOps escalation for transient issues while ensuring persistent failures get human attention. The sub-badge makes this scannable at the table level — FinOps can filter to non-retryable failures and prioritise those, knowing the system is handling the retryable ones.",
      },
    ],
  },
  {
    id: "actions",
    title: "Payout Actions",
    subtitle: "The verbs used in the UI to trigger state transitions and flag changes",
    items: [
      {
        term: "Prepare Payout",
        type: "Action (system-initiated)",
        color: "#818CF8",
        bg: "#EEF2FF",
        definition: "Creates a new payout by sweeping the merchant's positive balance. Automated daily job.",
        uiTreatment: "Triggered by system. Also available as a manual 'Prepare payout' button for FinOps Admin.",
        auditExamples: [
          { actor: "System", entry: "Payout prepared — Merchant balance swept. 14 transactions included. Amount: $4,200.00." },
        ],
        uxJustification: "'Prepare' signals that the payout is being assembled, not yet approved or sent. It's a setup action.",
      },
      {
        term: "Approve",
        type: "Action (manual)",
        color: "#4F46E5",
        bg: "#EEF2FF",
        definition: "FinOps Admin reviews and approves a payout, moving it from Ready for Review to Ready for Transfer.",
        uiTreatment: "Primary solid button. Confirmation dialog shows payout summary and included transactions.",
        auditExamples: [
          { actor: "Tom Wright (FinOps Admin)", entry: "Approved — Status changed to Ready for Transfer." },
        ],
        uxJustification: "'Approve' is the standard financial operations term for authorising a payment to proceed. Direct, unambiguous.",
      },
      {
        term: "Execute",
        type: "Action (manual / automated)",
        color: "#4F46E5",
        bg: "#EEF2FF",
        definition: "Initiates the NPP bank transfer. The payout status changes to Transferring before the NPP request is made.",
        uiTreatment: "Primary solid button. Triggers immediately without confirmation dialog (the approval step already served as the gate).",
        auditExamples: [
          { actor: "Sarah Chen (FinOps Admin)", entry: "Transfer initiated — NPP request submitted. Transfer ID: TRF-2026-0220-005." },
        ],
        uxJustification: "We chose 'Execute' over alternatives: 'Begin transfer' / 'Initiate transfer' are awkward because they imply the start of a process without conveying decisiveness. 'Execute' is authoritative and appropriate for the gravity of triggering real money movement. The resulting 'Transferring' status then communicates the in-progress nature. 'Send payout' was considered but feels too casual for a FinOps context. 'Submit for transfer' implies there's another approval step, which there isn't.",
        alternatives: [
          { term: "Initiate Transfer", verdict: "Rejected", reason: "Verbose and passive. Doesn't convey the decisiveness of the action." },
          { term: "Begin Transfer", verdict: "Rejected", reason: "Awkward — 'begin' doesn't imply completion and sounds hesitant for a financial operation." },
          { term: "Send Payout", verdict: "Considered", reason: "Too casual for a FinOps tool. 'Send' is consumer-grade language (Venmo, PayPal)." },
          { term: "Submit for Transfer", verdict: "Rejected", reason: "Implies an additional approval queue. Misleading — Execute triggers the transfer directly." },
          { term: "Dispatch", verdict: "Considered", reason: "Precise but uncommon in financial ops. Would add friction to onboarding." },
        ],
      },
      {
        term: "Hold / Release Hold",
        type: "Action (manual)",
        color: "#D97706",
        bg: "#FFFBEB",
        definition: "Hold: Places a hold flag on a payout, freezing all progression. Release Hold: Removes the hold, allowing the payout to resume from its underlying status.",
        uiTreatment: "'Hold' appears as an outline button on Ready for Review and Ready for Transfer payouts. 'Release Hold' appears as a primary button when a payout is on hold. Confirmation dialog requires selecting a reason.",
        auditExamples: [
          { actor: "Sarah Chen (FinOps Admin)", entry: "Hold placed — Reason: Suspicious activity review." },
          { actor: "Sarah Chen (FinOps Admin)", entry: "Hold released — Investigation complete. Payout cleared." },
        ],
        uxJustification: "See the Hold flag entry above for full terminology analysis. The action names mirror the flag: 'Hold' to set it, 'Release Hold' to clear it. 'Release Hold' is preferred over just 'Release' to avoid any ambiguity with releasing funds.",
      },
      {
        term: "Retry",
        type: "Action (manual / automated)",
        color: "#4F46E5",
        bg: "#EEF2FF",
        definition: "Re-queues a failed payout for transfer. Retryable failures auto-retry; non-retryable require manual resolution first.",
        uiTreatment: "Primary button shown only on Failed + retryable payouts. Non-retryable payouts hide this button until the issue is resolved.",
        auditExamples: [
          { actor: "System", entry: "Auto-retry initiated — Transitioned to Ready for Transfer." },
          { actor: "Tom Wright (FinOps Admin)", entry: "Manual retry — Bank details corrected. Transitioned to Ready for Transfer." },
        ],
        uxJustification: "'Retry' is simple and universally understood. It signals 'try again' without implying the previous attempt was invalid.",
      },
      {
        term: "Abandon",
        type: "Action (manual, irreversible)",
        color: "#6B7280",
        bg: "#F9FAFB",
        definition: "Permanently cancels a payout. Available from Ready for Review, Ready for Transfer, On Hold, and Failed (with stringent criteria). Requires typing 'ABANDON' to confirm.",
        uiTreatment: "Red outline button. Confirmation dialog is deliberately high-friction: shows at-risk amounts, requires reason selection, and demands typing 'ABANDON' in uppercase.",
        auditExamples: [
          { actor: "Sarah Chen (FinOps Admin)", entry: "Abandoned — Reason: Duplicate payout. Merchant ledger entries released to balance." },
        ],
        uxJustification: "See the Abandoned status entry above. The high-friction confirmation pattern (type-to-confirm) is standard for irreversible financial actions. For Failed payouts, an additional criteria warning is shown to ensure abandonment is a last resort.",
      },
    ],
  },
  {
    id: "roles",
    title: "User Roles",
    subtitle: "Who can do what in the payout lifecycle",
    items: [
      {
        term: "FinOps Admin",
        type: "Role",
        color: "#4F46E5",
        bg: "#EEF2FF",
        definition: "Full read-write access to all payout operations. Can Approve, Execute, Hold, Release Hold, Retry, and Abandon payouts. Can toggle fleet and merchant-level holds.",
        uiTreatment: "All action buttons are enabled. Role displayed in the header toolbar dropdown.",
        auditExamples: [
          { actor: "Sarah Chen (FinOps Admin)", entry: "Approved — Status changed to Ready for Transfer." },
          { actor: "Tom Wright (FinOps Admin)", entry: "Hold placed — Reason: Regulatory review." },
        ],
        uxJustification: "'FinOps Admin' replaced 'FinOps Tier 1' to be more descriptive of the role's capability. 'Admin' immediately conveys write access and authority.",
      },
      {
        term: "FinOps View Only",
        type: "Role",
        color: "#6B7280",
        bg: "#F9FAFB",
        definition: "Read-only access. Can view all payouts, statuses, audit logs, and transfers but cannot perform any actions.",
        uiTreatment: "All action buttons are disabled with a read-only banner: 'You have read-only access. Contact a FinOps Admin user to perform actions.'",
        auditExamples: [],
        uxJustification: "'FinOps View Only' replaced 'FinOps Tier 2' to clearly communicate the restriction. 'View Only' is immediately understood without needing to look up what 'Tier 2' means.",
      },
    ],
  },
];

function TermCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-sm transition-shadow">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-5 py-4 flex items-start gap-4">
        <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900">{item.term}</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: item.bg, color: item.color }}>{item.type}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}><polyline points="6,9 12,15 18,9" /></svg>
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4 ml-7">
          {item.uiTreatment && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">UI Treatment</h4>
              <p className="text-sm text-gray-700">{item.uiTreatment}</p>
            </div>
          )}

          {item.useCases && item.useCases.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Use Cases</h4>
              <div className="space-y-2">
                {item.useCases.map((uc, i) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-indigo-400 flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <span>{uc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.auditExamples && item.auditExamples.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Audit Log Examples</h4>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                {item.auditExamples.map((ex, i) => (
                  <div key={i} className={`flex gap-3 px-4 py-2.5 text-sm ${i > 0 ? "border-t border-gray-200" : ""}`}>
                    <span className={`font-medium flex-shrink-0 ${ex.actor === "System" ? "text-gray-400" : "text-indigo-600"}`}>{ex.actor}</span>
                    <span className="text-gray-700">{ex.entry}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">UX Justification</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{item.uxJustification}</p>
          </div>

          {item.alternatives && item.alternatives.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Alternatives Considered</h4>
              <div className="space-y-1.5">
                {item.alternatives.map((alt, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={`font-medium px-1.5 py-0.5 rounded text-xs flex-shrink-0 mt-0.5 ${alt.verdict === "Rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>{alt.verdict}</span>
                    <span><strong className="text-gray-800">{alt.term}</strong> — <span className="text-gray-600">{alt.reason}</span></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PayoutDataDictionary() {
  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payout Data Dictionary</h1>
        <p className="text-sm text-gray-500 mb-1">Comprehensive terminology reference for the POSPay Plus payout lifecycle</p>
        <p className="text-xs text-gray-400 mb-6">Click any term to expand its full definition, use cases, audit log examples, and UX justification.</p>

        <div className="flex gap-2 mb-8 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 rounded-full bg-indigo-400" /><span>Status</span></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 rounded-full bg-amber-400" /><span>Flag</span></div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500"><div className="w-3 h-3 rounded-full bg-gray-400" /><span>Terminal</span></div>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.id} className="mb-10">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800">{section.title}</h2>
              <p className="text-sm text-gray-500">{section.subtitle}</p>
            </div>
            <div className="space-y-3">
              {section.items.map((item) => <TermCard key={item.term} item={item} />)}
            </div>
          </div>
        ))}

        <div className="mt-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h2 className="text-sm font-bold text-gray-800 mb-3">Terminology Design Principles</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">1.</span><span><strong>Persona-first language.</strong> Every term is chosen for how a FinOps Admin would naturally describe it in conversation: "place a hold on that payout," "execute the transfer," "abandon this one." We avoid engineering jargon (disable progression, state machine, flag toggle).</span></div>
            <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">2.</span><span><strong>Unambiguous action verbs.</strong> Each action button uses a single, decisive verb that maps to exactly one transition. No ambiguity about what clicking a button will do.</span></div>
            <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">3.</span><span><strong>Friction proportional to consequence.</strong> Reversible actions (Approve, Execute, Hold) have lightweight confirmations. Irreversible actions (Abandon) require high-friction confirmation (type-to-confirm). This follows established patterns in financial software.</span></div>
            <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">4.</span><span><strong>Status names describe what's true right now.</strong> "Ready for Review" means the payout is ready to be reviewed. "Transferring" means funds are in transit. "On Hold" means progression is frozen. Every name answers "what's the current state of this payout?"</span></div>
            <div className="flex gap-3"><span className="text-indigo-500 font-bold flex-shrink-0">5.</span><span><strong>Flags vs states are architecturally honest.</strong> "On Hold" is a flag because the underlying status matters — when the hold is released, the payout resumes from where it was. "Retryable" is a flag because it's a property of the failure, not a separate lifecycle state. This distinction prevents data model confusion and ensures accurate audit trails.</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
