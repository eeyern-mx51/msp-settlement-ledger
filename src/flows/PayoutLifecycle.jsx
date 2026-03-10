import { useState } from "react";

const STATES = [
  { id: "ready_for_review", label: "Ready for\nReview", x: 350, y: 60, color: "#EEF2FF", border: "#818CF8", textColor: "#4338CA", description: "Starting state for a payout where mx51 owes money to the merchant. Can have a Hold placed (flag overlay).", entry: "Payout is prepared (automated daily job sweeps merchant balance to zero).", exits: ["Approved → Ready for Transfer", "Hold → Hold flag set (stays in this state)", "Abandon → Abandoned", "Zero/negative balance → auto-Completed"] },
  { id: "ready_for_transfer", label: "Ready for\nTransfer", x: 350, y: 220, color: "#F0FDF4", border: "#86EFAC", textColor: "#166534", description: "Payment can be executed. Indicates the earliest execution time has been reached. Can have a Hold placed (flag overlay).", entry: "FinOps approves the payout after review, or retryable failure auto-transitions here.", exits: ["Execute → Transferring", "Hold → Hold flag set (stays in this state)", "Abandon → Abandoned"] },
  { id: "transferring", label: "Transferring", x: 350, y: 380, color: "#F5F3FF", border: "#C084FC", textColor: "#7C3AED", description: "Payout is being transferred to the merchant via NPP. Status MUST be set before the NPP request. Cannot be held or abandoned.", entry: "FinOps clicks Execute (POC: manual, Pilot/BAU: automated).", exits: ["Success → Completed", "Failure (retryable) → Ready for Transfer", "Failure (non-retryable) → Failed"] },
  { id: "completed", label: "Completed", x: 580, y: 380, color: "#F0FDF4", border: "#22C55E", textColor: "#166534", description: "Terminal state. Merchant has been paid. Also used when payout amount is zero or negative (debt deferred).", entry: "NPP transfer succeeds, or payout amount is zero/negative at approval.", exits: ["Returned money → Failed (edge case)"] },
  { id: "failed", label: "Failed", x: 350, y: 540, color: "#FEF2F2", border: "#F87171", textColor: "#B91C1C", description: "Transfer has failed. Distinguished as retryable or non-retryable. Retryable auto-transitions to Ready for Transfer. Non-retryable requires manual resolution.", entry: "NPP transfer fails or completed transfer is returned by bank.", exits: ["Retryable → auto Ready for Transfer", "Non-retryable → manual resolution then Ready for Transfer", "Abandon → Abandoned (stringent criteria)"] },
  { id: "abandoned", label: "Abandoned", x: 80, y: 380, color: "#F9FAFB", border: "#9CA3AF", textColor: "#374151", description: "Terminal state. Payout will never be attempted. Merchant ledger entries are released back to the balance for inclusion in a future payout.", entry: "FinOps abandons from Ready for Review, Ready for Transfer, or Failed (stringent criteria for Failed).", exits: ["None — terminal state"] },
];

const NOTE = {
  id: "hold_note", label: "On Hold (flag)", x: 80, y: 60, color: "#FFFBEB", border: "#FBBF24", textColor: "#92400E",
  description: "On Hold is a boolean flag overlay, not a separate state. Only payouts in Ready for Review or Ready for Transfer can be placed on hold. While on hold, the underlying status is preserved. Release Hold clears the flag. Held payouts can also be abandoned.",
};

function StateNode({ state, selected, onClick, isNote }) {
  const lines = state.label.split("\n");
  const isTerminal = state.id === "completed" || state.id === "abandoned";
  return (
    <g onClick={() => onClick(state)} className="cursor-pointer">
      <rect x={state.x} y={state.y} width={160} height={64} rx={isTerminal ? 32 : isNote ? 6 : 10} ry={isTerminal ? 32 : isNote ? 6 : 10} fill={state.color} stroke={selected ? "#1E1E1E" : state.border} strokeWidth={selected ? 2.5 : 1.5} strokeDasharray={isNote ? "6 3" : "none"} />
      {lines.map((line, i) => (
        <text key={i} x={state.x + 80} y={state.y + (lines.length === 1 ? 37 : 28 + i * 18)} textAnchor="middle" fill={state.textColor} fontSize="12" fontWeight="600" fontFamily="system-ui">{line}</text>
      ))}
    </g>
  );
}

export default function PayoutLifecycle() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payout Lifecycle State Machine</h1>
        <p className="text-sm text-gray-500 mb-2">Click any state to see its description, entry conditions, and available transitions.</p>
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6 inline-block">Updated: Hold is a flag overlay (not a state). Abandon allowed directly from Review, Transfer, and Failed.</p>

        <div className="flex gap-4 mb-6 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-8 h-0.5 bg-indigo-600" /><span className="text-gray-600">Manual (UI action)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-8 h-0.5 bg-emerald-600" style={{ backgroundImage: "repeating-linear-gradient(90deg, #16A34A 0, #16A34A 4px, transparent 4px, transparent 6px)" }} /><span className="text-gray-600">Automatic (system)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-6 h-5 rounded border-2 border-dashed border-amber-400 bg-amber-50" /><span className="text-gray-600">Hold flag (overlay)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-6 h-5 rounded-full border-2 border-emerald-400 bg-emerald-50" /><span className="text-gray-600">Terminal state</span></div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          <svg viewBox="0 0 800 640" className="w-full" style={{ maxHeight: 540 }}>
            <defs>
              <marker id="arrow-manual" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#4F46E5" /></marker>
              <marker id="arrow-auto" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#16A34A" /></marker>
              <marker id="arrow-error" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#DC2626" /></marker>
              <marker id="arrow-warn" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#D97706" /></marker>
              <marker id="arrow-neutral" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6B7280" /></marker>
            </defs>

            {/* Entry arrow */}
            <line x1={430} y1={20} x2={430} y2={54} stroke="#4F46E5" strokeWidth="2" markerEnd="url(#arrow-manual)" />
            <text x={440} y={38} fontSize="9" fill="#4F46E5" fontWeight="600" fontFamily="system-ui">Prepare payout</text>

            {/* Review → Transfer (Approve) */}
            <line x1={430} y1={124} x2={430} y2={214} stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow-manual)" />
            <text x={440} y={172} fontSize="9" fill="#4F46E5" fontWeight="600" fontFamily="system-ui">Approve</text>

            {/* Transfer → Transferring (Execute) */}
            <line x1={430} y1={284} x2={430} y2={374} stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow-manual)" />
            <text x={440} y={332} fontSize="9" fill="#4F46E5" fontWeight="600" fontFamily="system-ui">Execute</text>

            {/* Transferring → Completed (Success) */}
            <line x1={510} y1={412} x2={574} y2={412} stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrow-auto)" strokeDasharray="4 2" />
            <text x={526} y={402} fontSize="9" fill="#16A34A" fontWeight="600" fontFamily="system-ui">Success</text>

            {/* Transferring → Failed (Failure) */}
            <line x1={430} y1={444} x2={430} y2={534} stroke="#DC2626" strokeWidth="1.5" markerEnd="url(#arrow-error)" strokeDasharray="4 2" />
            <text x={440} y={492} fontSize="9" fill="#DC2626" fontWeight="600" fontFamily="system-ui">Failure</text>

            {/* Failed (retryable) → Ready for Transfer (auto) */}
            <path d="M 510,560 C 620,560 620,262 510,252" fill="none" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrow-auto)" strokeDasharray="4 2" />
            <text x={628} y={400} fontSize="8" fill="#16A34A" fontWeight="600" fontFamily="system-ui" transform="rotate(90, 628, 400)">Retryable (auto)</text>

            {/* Failed (non-retryable) → Ready for Transfer (manual, after fix) */}
            <path d="M 510,572 C 660,572 660,252 510,242" fill="none" stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow-manual)" />
            <text x={668} y={400} fontSize="8" fill="#4F46E5" fontWeight="600" fontFamily="system-ui" transform="rotate(90, 668, 400)">Resolve & retry</text>

            {/* Completed → Failed (bank return) */}
            <path d="M 660,444 C 660,520 520,540 515,540" fill="none" stroke="#DC2626" strokeWidth="1.5" markerEnd="url(#arrow-error)" strokeDasharray="4 2" />
            <text x={626} y={504} fontSize="8" fill="#DC2626" fontWeight="600" fontFamily="system-ui">Bank return</text>

            {/* Review → Completed (zero/neg balance, auto) */}
            <path d="M 510,92 C 720,92 720,380 740,396" fill="none" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrow-auto)" strokeDasharray="4 2" />
            <text x={700} y={200} fontSize="8" fill="#16A34A" fontWeight="600" fontFamily="system-ui" transform="rotate(90, 700, 200)">Zero / neg balance</text>

            {/* Ready for Review → Abandoned (direct) */}
            <path d="M 350,92 C 280,92 200,200 160,374" fill="none" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow-neutral)" />
            <text x={230} y={200} fontSize="8" fill="#6B7280" fontWeight="600" fontFamily="system-ui" transform="rotate(60, 230, 200)">Abandon</text>

            {/* Ready for Transfer → Abandoned (direct) */}
            <path d="M 350,252 C 280,252 200,300 160,374" fill="none" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow-neutral)" />
            <text x={230} y={310} fontSize="8" fill="#6B7280" fontWeight="600" fontFamily="system-ui">Abandon</text>

            {/* Failed → Abandoned (stringent criteria) */}
            <path d="M 350,572 C 200,572 160,460 160,448" fill="none" stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow-neutral)" />
            <text x={210} y={520} fontSize="8" fill="#6B7280" fontWeight="600" fontFamily="system-ui">Abandon (stringent)</text>

            {/* Hold flag indicator arrows - dashed amber from Review and Transfer to Note */}
            <path d="M 350,76 C 290,76 260,76 246,76" fill="none" stroke="#D97706" strokeWidth="1.2" markerEnd="url(#arrow-warn)" strokeDasharray="4 2" />
            <text x={270} y={68} fontSize="8" fill="#D97706" fontWeight="600" fontFamily="system-ui">Hold</text>
            <path d="M 350,236 C 280,200 260,130 240,128" fill="none" stroke="#D97706" strokeWidth="1.2" markerEnd="url(#arrow-warn)" strokeDasharray="4 2" />
            <text x={268} y={168} fontSize="8" fill="#D97706" fontWeight="600" fontFamily="system-ui">Hold</text>

            {STATES.map(s => <StateNode key={s.id} state={s} selected={selected?.id === s.id} onClick={setSelected} />)}
            <StateNode state={NOTE} selected={selected?.id === NOTE.id} onClick={setSelected} isNote />
          </svg>
        </div>

        {/* Transition table */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-800">Payout Transition Table</h2>
            <p className="text-xs text-gray-500 mt-0.5">12 transitions reflecting the updated lifecycle with Hold as flag overlay</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 bg-gray-50">
              {["#", "From", "To", "Trigger", "Type", "Notes"].map(h => <th key={h} className="py-2 px-4 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>{[
              ["1", "\u2014", "Ready for Review", "Prepare payout", "Auto", "Daily sweep creates payout when merchant balance > 0"],
              ["2", "Ready for Review", "Ready for Transfer", "Approve", "Manual", "FinOps Admin reviews and approves"],
              ["3", "Ready for Review", "Completed", "Zero/neg balance", "Auto", "Debt deferred \u2014 no transfer needed"],
              ["4", "Ready for Review", "Abandoned", "Abandon", "Manual", "FinOps Admin cancels before approval"],
              ["5", "Ready for Transfer", "Transferring", "Execute", "Manual/Auto", "NPP transfer initiated"],
              ["6", "Ready for Transfer", "Abandoned", "Abandon", "Manual", "FinOps Admin cancels before execution"],
              ["7", "Transferring", "Completed", "NPP success", "Auto", "Merchant bank confirms receipt"],
              ["8", "Transferring", "Failed (retryable)", "NPP transient failure", "Auto", "Auto-transitions to Ready for Transfer"],
              ["9", "Transferring", "Failed (non-retryable)", "NPP persistent failure", "Auto", "Manual intervention required"],
              ["10", "Failed", "Ready for Transfer", "Resolve & retry", "Manual/Auto", "Retryable: auto. Non-retryable: after bank detail fix"],
              ["11", "Failed", "Abandoned", "Abandon", "Manual", "Stringent criteria \u2014 documented evidence required"],
              ["12", "Completed", "Failed", "Bank return", "Auto", "Edge case \u2014 returned funds"],
            ].map(([n, from, to, trigger, type, notes], i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-4 text-xs text-gray-400 font-mono">{n}</td>
                <td className="py-2 px-4 text-xs font-medium text-gray-700">{from}</td>
                <td className="py-2 px-4 text-xs font-medium text-gray-700">{to}</td>
                <td className="py-2 px-4 text-xs text-indigo-600 font-semibold">{trigger}</td>
                <td className="py-2 px-4"><span className={`text-xs font-medium px-1.5 py-0.5 rounded ${type === "Auto" ? "bg-emerald-50 text-emerald-700" : type === "Manual" ? "bg-indigo-50 text-indigo-700" : "bg-purple-50 text-purple-700"}`}>{type}</span></td>
                <td className="py-2 px-4 text-xs text-gray-500">{notes}</td>
              </tr>
            ))}</tbody>
          </table>
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-200">
            <p className="text-xs text-amber-800"><strong>Hold flag:</strong> Can be placed on Ready for Review or Ready for Transfer. While on hold, no transitions occur except Release Hold (clears flag) and Abandon. Hold is not a state \u2014 it's an overlay on the existing status.</p>
          </div>
        </div>

        {selected && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.border }} />
              <h2 className="text-lg font-bold" style={{ color: selected.textColor }}>{selected.label.replace("\n", " ")}</h2>
              {(selected.id === "completed" || selected.id === "abandoned") && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Terminal</span>}
              {selected.id === "hold_note" && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Flag overlay</span>}
            </div>
            <p className="text-sm text-gray-600 mb-4">{selected.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Entry condition</h3>
                <p className="text-sm text-gray-700">{selected.entry || "\u2014"}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Available transitions</h3>
                <ul className="space-y-1">
                  {(selected.exits || []).map((e, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5"><span className="text-gray-400 mt-0.5">\u2192</span>{e}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
