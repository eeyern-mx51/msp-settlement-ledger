import { useState } from "react";

/* ─── Shared small components ─── */
function SectionHeading({ num, children }) {
  return (
    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-700 text-white text-xs font-bold flex-shrink-0">{num}</span>
      {children}
    </h2>
  );
}

function LevelTag({ level }) {
  const styles = { global: "bg-red-50 text-red-800", merchant: "bg-orange-50 text-orange-800", payout: "bg-emerald-50 text-emerald-800", permission: "bg-gray-100 text-gray-600" };
  const labels = { global: "Fleet", merchant: "Merchant", payout: "Payout", permission: "Permission" };
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${styles[level]}`}>{labels[level]}</span>;
}

function StepTag({ step }) {
  const styles = { prep: "bg-blue-100 text-blue-800 border-blue-200", approve: "bg-amber-100 text-amber-800 border-amber-200", transfer: "bg-emerald-100 text-emerald-800 border-emerald-200", all: "bg-red-100 text-red-800 border-red-200" };
  return <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border mr-1 ${styles[step]}`}>{step === "all" ? "All steps" : step.charAt(0).toUpperCase() + step.slice(1)}</span>;
}

/* ─── Data ─── */
const SCENARIOS = [
  { scenario: "Platform incident — DTE files are corrupted today", level: "global", outcome: "FinOps Admin activates fleet hold. All automation stops, all manual actions blocked. Fix the data, release hold." },
  { scenario: "Merchant under fraud investigation", level: "merchant", outcome: "FinOps Admin clicks \"Hold payouts\" on the merchant page → dialog confirms \"Hold payouts for [Merchant Name]\". Other merchants keep flowing. Investigation concludes, release hold." },
  { scenario: "One payout has unusual amounts — need to verify", level: "payout", outcome: "FinOps Admin places a hold on that payout. Rest of the merchant's payouts keep flowing. Verified? Release hold." },
  { scenario: "Moving to auto-approval but want to keep manual transfers", level: "global", outcome: "Turn on auto-approval. Leave auto-transfer off. Preparation is already manual (POC). Gradual rollout." },
  { scenario: "New FinOps Viewer joins — shouldn't approve payouts", level: "permission", outcome: "Not a toggle — View-only role simply doesn't have approve/execute transfer buttons. No configuration needed." },
  { scenario: "Bank holiday — don't want transfers going out", level: "global", outcome: "FinOps Admin turns off auto-transfer for the day. Payouts can still be prepared and approved, transfers just won't execute." },
  { scenario: "NPP gateway experiencing intermittent timeouts", level: "global", outcome: "FinOps Admin activates fleet hold to prevent transfers accumulating retryable failures. Resume once NPP stabilises." },
];

const AUTOMATION_STEPS = [
  { step: "Preparation", auto_on: "System runs daily at 8:30 AM, auto-creates payouts from unsettled MLEs", auto_off: "FinOps manually triggers \"Prepare payout\" (current POC behaviour)", who: "FinOps Admin only" },
  { step: "Approval", auto_on: "System auto-approves payouts that pass validation rules", auto_off: "FinOps manually reviews and clicks \"Approve\" (current POC behaviour)", who: "FinOps Admin only" },
  { step: "Transfer", auto_on: "System auto-initiates transfer once approved", auto_off: "FinOps manually clicks \"Execute transfer\" (current POC behaviour)", who: "FinOps Admin only" },
];

/* ─── Expandable section ─── */
function ExpandableNote({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-2">
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-2.5 flex items-center justify-between text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
        <span>{title}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}><polyline points="6,9 12,15 18,9" /></svg>
      </button>
      {open && <div className="px-4 pb-3 text-sm text-gray-600 border-t border-gray-100">{children}</div>}
    </div>
  );
}

/* ─── Main component ─── */
export default function PayoutProgressionControls() {
  return (
    <div className="p-8 max-w-4xl">
      {/* Title */}
      <h1 className="text-xl font-bold text-gray-900 mb-1">Payout Progression Controls</h1>
      <p className="text-sm text-gray-500 mb-6">How we control who and what can move a payout forward — framework for the hold/release model.</p>

      {/* Core concept */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-8">
        <h2 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">The simple idea</h2>
        <p className="text-sm text-indigo-900">
          Every payout step (prepare, approve, transfer) can happen <strong className="text-indigo-700">manually</strong> (human clicks a button) or <strong className="text-indigo-700">automatically</strong> (system does it on schedule). We need controls to block progression — at different scopes — using a <strong className="text-indigo-700">Hold / Release Hold</strong> model.
        </p>
      </div>

      {/* Mental model */}
      <div className="bg-white border-2 border-indigo-700 rounded-xl p-6 mb-8">
        <h2 className="text-base font-bold text-indigo-700 mb-4">The payout pipeline</h2>
        <div className="flex items-center gap-3 flex-wrap justify-center mb-5">
          {[
            { label: "Preparation", mode: "Manual / Auto", bg: "bg-blue-100 border-blue-300 text-blue-800" },
            { label: "Approval", mode: "Manual / Auto", bg: "bg-amber-100 border-amber-300 text-amber-800" },
            { label: "Transfer", mode: "Manual / Auto", bg: "bg-emerald-100 border-emerald-300 text-emerald-800" },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-3">
              {i > 0 && <span className="text-xl text-gray-400">→</span>}
              <div className={`text-center px-4 py-3 rounded-lg border font-semibold text-sm min-w-[120px] ${s.bg}`}>
                {s.label}
                <div className="text-[11px] font-normal mt-1 opacity-80">{s.mode}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center">
          Each step has <strong className="text-indigo-700">two switches</strong>: one for humans, one for the system.<br />
          Each switch can be controlled at <strong className="text-indigo-700">three scopes</strong>: fleet, merchant, or individual payout.
        </p>
      </div>

      {/* Section 1: Three scopes */}
      <div className="mb-10">
        <SectionHeading num="1">Three scopes — widest wins</SectionHeading>

        <div className="rounded-xl border border-gray-200 overflow-hidden mb-3">
          {/* Fleet level */}
          <div className="grid grid-cols-[140px_1fr] border-b border-gray-200">
            <div className="px-4 py-4 bg-red-50 border-r border-gray-200 flex flex-col justify-center">
              <span className="text-sm font-bold text-red-800">Fleet</span>
              <span className="text-[11px] text-red-600/70">All merchants</span>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Hold all payouts across every merchant</p>
              <p className="text-sm text-gray-600">"Hold all payouts" — the emergency brake. Blocks <StepTag step="all" /> for every merchant.</p>
              <p className="text-xs text-gray-400 mt-1">e.g. System incident, regulatory hold, suspected platform-wide issue, NPP outage</p>
            </div>
          </div>

          {/* Merchant level */}
          <div className="grid grid-cols-[140px_1fr] border-b border-gray-200">
            <div className="px-4 py-4 bg-orange-50 border-r border-gray-200 flex flex-col justify-center">
              <span className="text-sm font-bold text-orange-800">Merchant</span>
              <span className="text-[11px] text-orange-600/70">Single MID</span>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Hold payouts for a specific merchant</p>
              <p className="text-sm text-gray-600">"Hold payouts for [Merchant Name]" — blocks <StepTag step="all" /> for a specific MID. The merchant name is used in the button, dialog, and banner to eliminate ambiguity.</p>
              <p className="text-xs text-gray-400 mt-1">e.g. Fraud investigation on one merchant, bank details changing</p>
            </div>
          </div>

          {/* Payout level */}
          <div className="grid grid-cols-[140px_1fr]">
            <div className="px-4 py-4 bg-emerald-50 border-r border-gray-200 flex flex-col justify-center">
              <span className="text-sm font-bold text-emerald-800">Payout</span>
              <span className="text-[11px] text-emerald-600/70">Single payout</span>
            </div>
            <div className="px-4 py-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Hold one specific payout</p>
              <p className="text-sm text-gray-600">"Place on hold" — blocks the <em>next</em> step for this payout only. Other payouts for the same merchant keep flowing.</p>
              <p className="text-xs text-gray-400 mt-1">e.g. Amounts look wrong, need to verify with merchant before approving</p>
            </div>
          </div>
        </div>

        {/* Override cascade */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-2">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Override rule</h3>
          <div className="flex items-center justify-center gap-0 mb-3">
            <div className="px-5 py-3 text-center text-sm font-semibold bg-red-50 border-2 border-red-300 text-red-800 rounded-l-lg min-w-[130px]">
              Fleet<div className="text-[11px] font-normal opacity-70">broadest</div>
            </div>
            <div className="px-5 py-3 text-center text-sm font-semibold bg-orange-50 border-2 border-l-0 border-orange-300 text-orange-800 min-w-[130px]">
              Merchant<div className="text-[11px] font-normal opacity-70">narrows</div>
            </div>
            <div className="px-5 py-3 text-center text-sm font-semibold bg-emerald-50 border-2 border-l-0 border-emerald-300 text-emerald-800 rounded-r-lg min-w-[130px]">
              Payout<div className="text-[11px] font-normal opacity-70">most specific</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            <strong className="text-gray-900">If any wider scope is on hold, narrower scopes can't override it.</strong><br />
            A merchant-level release can't bypass a fleet hold. A payout-level release can't bypass a merchant hold.
          </p>
        </div>
        <p className="text-xs text-gray-400 italic">Think of it like a circuit breaker: if the main switch is off, flipping individual room switches does nothing.</p>
      </div>

      {/* Section 2: Who controls what */}
      <div className="mb-10">
        <SectionHeading num="2">Manual vs automatic — who gets stopped?</SectionHeading>

        <div className="grid grid-cols-2 gap-3 mb-2">
          {/* FinOps Admin */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🔑</span> FinOps Admin
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />Can activate/release fleet hold</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />Can activate/release merchant hold</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />Can place/release payout holds</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />Can disable/enable automation per step</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />Can still act manually even when auto is off</li>
            </ul>
          </div>

          {/* FinOps Viewer */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>👁</span> FinOps View Only
            </h3>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2 text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Cannot change fleet hold</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Cannot change merchant hold</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Cannot place/release holds</li>
              <li className="flex items-center gap-2 text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />Cannot change automation settings</li>
              <li className="flex items-center gap-2 text-gray-700"><span className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />Can view payouts (read-only)</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-gray-400 italic">The key insight: "disabling manual" isn't a toggle — it's a <strong className="text-gray-600">permission</strong>. Lower-level users simply don't have the buttons. Higher-level users always can, unless a scope-level hold blocks them too.</p>
      </div>

      {/* Section 3: Automation controls */}
      <div className="mb-10">
        <SectionHeading num="3">Automation switches — per step</SectionHeading>

        <div className="rounded-xl border border-gray-200 overflow-hidden mb-2">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2.5 px-4">Step</th>
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2.5 px-4">Auto on</th>
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2.5 px-4">Auto off</th>
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2.5 px-4">Who can toggle</th>
              </tr>
            </thead>
            <tbody>
              {AUTOMATION_STEPS.map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="py-3 px-4"><StepTag step={row.step.toLowerCase()} /></td>
                  <td className="py-3 px-4 text-sm text-gray-700">{row.auto_on}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{row.auto_off}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{row.who}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 italic">Automation toggles are independent of hold controls. You can have automation on but the merchant held — automation just won't run for that merchant.</p>
      </div>

      {/* Section 4: Scenarios */}
      <div className="mb-10">
        <SectionHeading num="4">Scenarios</SectionHeading>

        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2.5 px-4 w-[30%]">Scenario</th>
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2.5 px-4 w-[12%]">Scope</th>
                <th className="text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider py-2.5 px-4">What happens</th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map((row, i) => (
                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900 align-top">{row.scenario}</td>
                  <td className="py-3 px-4 align-top"><LevelTag level={row.level} /></td>
                  <td className="py-3 px-4 text-sm text-gray-700 align-top">{row.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 5: Hold UX pattern (new — reflects what we built) */}
      <div className="mb-10">
        <SectionHeading num="5">Hold UX pattern — what we built</SectionHeading>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Terminology decision</h3>
            <p className="text-sm text-gray-600">
              We use <strong className="text-indigo-700">"Hold"</strong> and <strong className="text-indigo-700">"Release Hold"</strong> across all scopes. "Hold" is a flag — not a status. The payout retains its underlying status (Ready for Review, Ready for Transfer, etc.) and the hold prevents progression until released.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Fleet level</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold text-xs mt-0.5">BUTTON</span>
                <span>Ghost/outline button: <strong>"Hold all payouts"</strong> — low visual weight, discoverable but not dominant.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-xs mt-0.5">BANNER</span>
                <span>"Fleet payouts are on hold" — red banner with reason, who placed it, when, and optional note. "Release Hold" button in the banner.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-600 font-bold text-xs mt-0.5">DIALOG</span>
                <span>Title: "Hold all payouts". Mandatory reason (dropdown) and optional note. Release is immediate — no reason required.</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Merchant level</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold text-xs mt-0.5">BUTTON</span>
                <span>Ghost/outline button: <strong>"Hold payouts"</strong> — shorter label since merchant context is already established by the page.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-xs mt-0.5">BANNER</span>
                <span>"Payouts for [Merchant Name] are on hold" — uses the actual merchant name to remove ambiguity between merchant-level and fleet-level holds.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-600 font-bold text-xs mt-0.5">DIALOG</span>
                <span>Title: "Hold payouts for [Merchant Name]". Body: "All payouts for [Merchant Name] will be placed on hold." Mandatory reason (dropdown) and optional note. Release is immediate.</span>
              </div>
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                <strong>Why the merchant name?</strong> Without it, "Hold all merchant payouts" is ambiguous — it could mean "all payouts for this merchant" or "all merchants' payouts." Using the actual name ("Hold payouts for Joe's Coffee") eliminates this entirely.
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Individual payout level</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold text-xs mt-0.5">HOLD</span>
                <span>Action button on payout detail — opens dialog with reason + note. Payout enters "On Hold" flag state.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold text-xs mt-0.5">RELEASE</span>
                <span>"Release Hold" button — immediate, returns payout to its underlying status for continued progression.</span>
              </div>
            </div>
          </div>
        </div>

        <ExpandableNote title="Why we moved away from toggle switches">
          <p className="mt-2">
            The original design used a toggle switch for fleet/merchant holds. We moved to a ghost button + dialog pattern because:
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li className="flex gap-2"><span className="text-gray-400">•</span>A toggle felt "too in your face" — always visible and suggesting frequent use</li>
            <li className="flex gap-2"><span className="text-gray-400">•</span>Hold is a high-consequence action that should have intentional friction (reason required)</li>
            <li className="flex gap-2"><span className="text-gray-400">•</span>The ghost button is discoverable but dormant, matching the rarity of the action</li>
            <li className="flex gap-2"><span className="text-gray-400">•</span>The dialog pattern is consistent with individual payout holds</li>
          </ul>
        </ExpandableNote>
      </div>

      {/* Section 6: Failure & retry controls */}
      <div className="mb-10">
        <SectionHeading num="6">Failure & retry controls</SectionHeading>

        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Retryable vs non-retryable</h3>
            <p className="text-sm text-gray-600 mb-3">
              Transfer failures are classified by error code into two categories:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">Retryable (transient)</h4>
                <ul className="space-y-1 text-xs text-amber-700">
                  <li>GATEWAY_TIMEOUT</li>
                  <li>NPP_UNAVAILABLE</li>
                  <li>RATE_LIMITED</li>
                  <li>RECEIVER_TEMP_UNAVAIL</li>
                  <li>CUSCAL_5XX</li>
                  <li>INSUFFICIENT_FUNDS</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-red-800 uppercase mb-2">Non-retryable (persistent)</h4>
                <ul className="space-y-1 text-xs text-red-700">
                  <li>INVALID_BSB</li>
                  <li>INVALID_ACCOUNT</li>
                  <li>ACCOUNT_CLOSED</li>
                  <li>ACCOUNT_BLOCKED</li>
                  <li>NAME_MISMATCH</li>
                  <li>COMPLIANCE_BLOCK</li>
                  <li>PAYMENT_REJECTED</li>
                  <li>DUPLICATE_REFERENCE</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">Retry governance (POC — manual-first)</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-gray-400">1.</span><span>All retries manually initiated by FinOps Admin — no auto-retry in POC phase</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400">2.</span><span>Maximum 3 attempts before escalation recommended (amber at 3, red at 5)</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400">3.</span><span>GATEWAY_TIMEOUT requires reconciliation check before retry (ambiguous outcome)</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400">4.</span><span>Non-retryable failures require merchant contact and data correction before resolution</span></li>
              <li className="flex items-start gap-2"><span className="text-gray-400">5.</span><span>All retry attempts logged with timestamp, user, error code, and outcome</span></li>
            </ul>
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="text-xs font-bold text-blue-700">Future automation opportunities:</span>
              <span className="text-xs text-blue-600 ml-1">Auto-retry after cooldown, auto-escalation at threshold, auto-abandon after max attempts, scheduled retry windows</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resolved decisions */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
        <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Resolved decisions</h2>
        <ul className="space-y-2 text-sm text-emerald-800">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span><strong>Payout-level hold:</strong> Included in POC — needed for granular control without blocking the whole merchant.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span><strong>Automation granularity:</strong> Per-step toggles (prep/approve/transfer) — allows gradual rollout from manual to auto.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span><strong>Hold reason:</strong> Mandatory reason (dropdown) required for placing holds. Release does not require a reason.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span><strong>Terminology:</strong> "Hold" / "Release Hold" adopted across all scopes. "Hold" is a flag, not a status.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span><strong>Merchant-level disambiguation:</strong> Merchant hold uses the actual merchant name — "Hold payouts for [Merchant Name]" — to avoid confusion with fleet-level "Hold all payouts".</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <span><strong>Retry model:</strong> Manual-first for POC. All retries initiated by FinOps Admin. Automation noted for future phases.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
