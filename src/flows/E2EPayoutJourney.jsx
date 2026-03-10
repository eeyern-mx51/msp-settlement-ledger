import { useState } from "react";

const STEPS = [
  {
    id: 1,
    phase: "Ingestion",
    title: "DTE file pushed by Cuscal",
    actor: "Cuscal → MSP",
    type: "auto",
    description: "The Daily Transaction Extract (DTE) file is pushed by Cuscal into MSP's S3 bucket and ingested. This includes all card transactions processed through the Cuscal gateway.",
    uiReq: false,
    dataFlow: "Cuscal FTP/S3 → S3 Bucket → Cuscal File Consumer",
    details: ["File types: DTE, IFR, SSR, SFR", "Contains: transaction ID, amount, scheme fees, interchange", "Pushed daily, settlement date cutover at 5AM Sydney time"],
  },
  {
    id: 2,
    phase: "Ingestion",
    title: "Transactions enriched with MSF",
    actor: "MSP (automatic)",
    type: "auto",
    description: "Transactions are enriched with additional data including Merchant Service Fee (MSF) calculation. MSF = Transaction amount × MSF rate (%).",
    uiReq: false,
    dataFlow: "Cuscal Service → Acquirer Transaction Normalisation → org svc",
    details: ["MSF calculation: Transaction amount × MSF rate (%)", "POS Revenue = MSF − mx51 margin − Interchange − Scheme fee", "Enrichment includes merchant facility details"],
  },
  {
    id: 3,
    phase: "Ledger",
    title: "Merchant balance updated",
    actor: "MSP (automatic)",
    type: "auto",
    description: "The merchant balance (transaction ledger) is updated with the DTE data. Each transaction creates a Merchant Ledger Entry (MLE) entry — an immutable record of the liability change.",
    uiReq: false,
    dataFlow: "Cuscal Service → Merchant Ledger Service",
    details: ["Merchant Ledger Entry (MLE) is immutable", "Sum of all MLE entries = amount mx51 owes merchant", "MLE types: transaction, adjustment, payout_transfer"],
  },
  {
    id: 4,
    phase: "Ledger",
    title: "Adjustments affect balance",
    actor: "FinOps T1 (manual) / System (auto)",
    type: "both",
    description: "Merchant balance can be modified by adjustments — ad-hoc corrections for issues like incorrect MSF, chargebacks, goodwill credits. Manual adjustments require a 2nd user approval.",
    uiReq: true,
    reqLabel: "Create adjustment, Approve adjustment",
    dataFlow: "Support Dashboard → Payout Service → Merchant Ledger Service",
    details: ["Manual: created by FinOps, requires 2nd approval", "Auto: system corrections (e.g. scheme fee rebates)", "Both types create corresponding MLE entries", "Internal note + external (merchant-visible) description"],
  },
  {
    id: 5,
    phase: "Payout Prep",
    title: "Prepare payout (daily job)",
    actor: "MSP (automated cron)",
    type: "auto",
    description: "At a scheduled time daily, MSP runs a job to prepare payouts — sweeping the merchant balance to zero and creating payout records. Selection criteria based on settlement date and effective timestamp cutoffs.",
    uiReq: true,
    reqLabel: "Prepare payout (date range)",
    dataFlow: "Payout Prep Cron → Payout Service → Merchant Ledger Service",
    details: ["Sweeps merchant balance to zero", "Assigns payout_id to all unassigned MLE entries", "Creates payout record with sum of assigned MLEs", "Zero/negative balance → auto-completed (debt deferred)"],
  },
  {
    id: 6,
    phase: "Review",
    title: "FinOps reviews & approves",
    actor: "FinOps T1 (manual)",
    type: "manual",
    description: "The FinOps team reviews prepared payouts to validate amounts against expected DTE transaction sums. If satisfactory, they approve — moving the payout to Ready for Transfer.",
    uiReq: true,
    reqLabel: "Approve payout, Hold payout, Abandon payout",
    dataFlow: "Support Dashboard → Payout Service",
    details: ["POC: fully manual review & approve", "Pilot: auto-approve based on pre-defined criteria", "Can place on hold for investigation (e.g. suspicious activity)", "Can abandon if payout should not proceed"],
  },
  {
    id: 7,
    phase: "Transfer",
    title: "Begin transfer",
    actor: "FinOps Admin (manual) / Automated",
    type: "both",
    description: "The approved payout transfer is initiated — triggering a payment via NPP (New Payments Platform) to the merchant's bank account. Status set to Transferring before the NPP request.",
    uiReq: true,
    reqLabel: "Begin transfer button, Status tracking",
    dataFlow: "Support Dashboard → Payout Service → NPP (Cuscal API)",
    details: ["POC: manual button press per merchant", "Pilot/BAU: automated based on criteria (5d vs 7d)", "Payment sent via Cuscal Payment API → NPP", "All transfer attempts are logged"],
  },
  {
    id: 8,
    phase: "Transfer",
    title: "Track transfer status",
    actor: "MSP (automatic)",
    type: "auto",
    description: "MSP tracks the transfer status via NPP webhooks until final completion or failure. Failures are categorised as transient (retryable) or persistent (non-retryable).",
    uiReq: true,
    reqLabel: "View transfer status, failure reporting",
    dataFlow: "Cuscal NPP Webhooks → Payout Service → Merchant Ledger Service",
    details: ["Success: payout → Completed, MLE entry created", "Transient failure: auto-retry → Ready for Transfer", "Persistent failure: payout → Failed, alert raised", "Bank return from Completed → Failed (edge case)"],
  },
];

const PHASES = ["Ingestion", "Ledger", "Payout Prep", "Review", "Transfer"];
const PHASE_COLORS = { "Ingestion": "#EEF2FF", "Ledger": "#F0FDF4", "Payout Prep": "#FFFBEB", "Review": "#F5F3FF", "Transfer": "#FEF2F2" };
const PHASE_BORDERS = { "Ingestion": "#818CF8", "Ledger": "#86EFAC", "Payout Prep": "#FBBF24", "Review": "#C084FC", "Transfer": "#F87171" };

export default function E2EPayoutJourney() {
  const [expandedStep, setExpandedStep] = useState(null);
  const [activePhase, setActivePhase] = useState(null);

  const filteredSteps = activePhase ? STEPS.filter(s => s.phase === activePhase) : STEPS;

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Merchant Transaction → Payout Journey</h1>
        <p className="text-sm text-gray-500 mb-6">End-to-end flow from Cuscal DTE ingestion through to merchant payout via NPP. Click a step to expand details.</p>

        {/* Phase filter pills */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setActivePhase(null)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${!activePhase ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>All phases</button>
          {PHASES.map(p => (
            <button key={p} onClick={() => setActivePhase(activePhase === p ? null : p)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors`} style={{ backgroundColor: activePhase === p ? PHASE_BORDERS[p] : PHASE_COLORS[p], color: activePhase === p ? "white" : PHASE_BORDERS[p], borderColor: PHASE_BORDERS[p] }}>{p}</button>
          ))}
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
                    <div className="px-5 pb-4 space-y-3 border-t" style={{ borderColor: PHASE_BORDERS[step.phase] + "30" }}>
                      <p className="text-sm text-gray-700 mt-3">{step.description}</p>

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
      </div>
    </div>
  );
}
