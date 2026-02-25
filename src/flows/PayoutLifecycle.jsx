import { useState } from "react";

const STATES = [
  { id: "ready_for_review", label: "Ready for\nReview", x: 420, y: 60, color: "#EEF2FF", border: "#818CF8", textColor: "#4338CA", description: "Starting state for a payout where mx51 owes money to the merchant.", entry: "Payout is prepared (automated daily job sweeps merchant balance to zero).", exits: ["Approved → Ready for Transfer", "Paused → Paused (reviewing)", "Zero/negative balance → auto-Completed"] },
  { id: "ready_for_transfer", label: "Ready for\nTransfer", x: 420, y: 220, color: "#F0FDF4", border: "#86EFAC", textColor: "#166534", description: "Payment can be executed. Indicates the earliest execution time has been reached.", entry: "FinOps approves the payout after review (POC: manual, Pilot: auto-criteria).", exits: ["Execute → Transferring", "Paused → Paused (transferring)", "Abandon → Abandoned"] },
  { id: "transferring", label: "Transferring", x: 420, y: 380, color: "#F5F3FF", border: "#C084FC", textColor: "#7C3AED", description: "Payout is being transferred to the merchant via NPP. Status MUST be set before the NPP request.", entry: "FinOps clicks Execute (POC: manual, Pilot/BAU: automated).", exits: ["Success → Completed", "Failure (transient) → Ready for Transfer", "Failure (persistent) → Failed"] },
  { id: "completed", label: "Completed", x: 620, y: 380, color: "#F0FDF4", border: "#22C55E", textColor: "#166534", description: "Terminal state. Merchant has been paid. Also used when payout amount is zero or negative (debt deferred).", entry: "NPP transfer succeeds, or payout amount is zero/negative at approval.", exits: ["Returned money → Failed (edge case)"] },
  { id: "failed", label: "Failed", x: 420, y: 540, color: "#FEF2F2", border: "#F87171", textColor: "#B91C1C", description: "Transfer has failed. Distinguishes between retryable (transient) and non-retryable (persistent) failures.", entry: "NPP transfer fails or completed transfer is returned by bank.", exits: ["Retryable → auto Ready for Transfer", "Non-retryable → manual Ready for Transfer (after fix)", "Pause → Paused (transferring)", "Abandon → Abandoned"] },
  { id: "paused_reviewing", label: "Paused\n(reviewing)", x: 180, y: 60, color: "#FFFBEB", border: "#FBBF24", textColor: "#92400E", description: "Payout held during review stage. No progression until resumed or abandoned.", entry: "FinOps pauses from Ready for Review (e.g. suspicious activity, triple-check needed).", exits: ["Resume → Ready for Review", "Abandon → Abandoned"] },
  { id: "paused_transferring", label: "Paused\n(transferring)", x: 180, y: 220, color: "#FFFBEB", border: "#FBBF24", textColor: "#92400E", description: "Payout held during transfer stage. Prevents execution while under review.", entry: "FinOps pauses from Ready for Transfer or Failed.", exits: ["Resume → Ready for Transfer", "Abandon → Abandoned"] },
  { id: "abandoned", label: "Abandoned", x: 30, y: 380, color: "#F9FAFB", border: "#9CA3AF", textColor: "#374151", description: "Terminal state. Payout will never be attempted. Merchant ledger entries are released back to the balance for inclusion in a future payout.", entry: "FinOps abandons from any Paused state (must pause first to discourage abandonment).", exits: ["None — terminal state"] },
];

const ARROWS = [
  { from: "ready_for_review", to: "ready_for_transfer", label: "Approve", type: "manual", color: "#4F46E5" },
  { from: "ready_for_review", to: "paused_reviewing", label: "Pause", type: "manual", color: "#D97706" },
  { from: "ready_for_review", to: "completed", label: "Zero / negative\nbalance", type: "auto", color: "#16A34A", curved: true },
  { from: "ready_for_transfer", to: "transferring", label: "Execute", type: "manual", color: "#4F46E5" },
  { from: "ready_for_transfer", to: "paused_transferring", label: "Pause", type: "manual", color: "#D97706" },
  { from: "transferring", to: "completed", label: "Success", type: "auto", color: "#16A34A" },
  { from: "transferring", to: "failed", label: "Failure", type: "auto", color: "#DC2626" },
  { from: "transferring", to: "ready_for_transfer", label: "Retryable\nfailure", type: "auto", color: "#D97706", curved: true },
  { from: "failed", to: "ready_for_transfer", label: "Resolve &\nretry", type: "manual", color: "#4F46E5", curved: true },
  { from: "failed", to: "paused_transferring", label: "Pause", type: "manual", color: "#D97706" },
  { from: "completed", to: "failed", label: "Bank return\n(edge case)", type: "auto", color: "#DC2626" },
  { from: "paused_reviewing", to: "ready_for_review", label: "Resume", type: "manual", color: "#4F46E5" },
  { from: "paused_reviewing", to: "abandoned", label: "Abandon", type: "manual", color: "#6B7280" },
  { from: "paused_transferring", to: "ready_for_transfer", label: "Resume", type: "manual", color: "#4F46E5" },
  { from: "paused_transferring", to: "abandoned", label: "Abandon", type: "manual", color: "#6B7280" },
];

function StateNode({ state, selected, onClick }) {
  const lines = state.label.split("\n");
  const isTerminal = state.id === "completed" || state.id === "abandoned";
  return (
    <g onClick={() => onClick(state)} className="cursor-pointer">
      <rect x={state.x} y={state.y} width={150} height={64} rx={isTerminal ? 32 : 10} ry={isTerminal ? 32 : 10} fill={state.color} stroke={selected ? "#1E1E1E" : state.border} strokeWidth={selected ? 2.5 : 1.5} strokeDasharray={state.id.startsWith("paused") ? "6 3" : "none"} />
      {lines.map((line, i) => (
        <text key={i} x={state.x + 75} y={state.y + (lines.length === 1 ? 37 : 28 + i * 18)} textAnchor="middle" fill={state.textColor} fontSize="12" fontWeight="600" fontFamily="system-ui">{line}</text>
      ))}
    </g>
  );
}

export default function PayoutLifecycle() {
  const [selected, setSelected] = useState(null);
  const stateMap = Object.fromEntries(STATES.map(s => [s.id, s]));

  const getCenter = (id, side) => {
    const s = stateMap[id];
    if (!s) return { x: 0, y: 0 };
    const cx = s.x + 75, cy = s.y + 32;
    if (side === "left") return { x: s.x, y: cy };
    if (side === "right") return { x: s.x + 150, y: cy };
    if (side === "top") return { x: cx, y: s.y };
    if (side === "bottom") return { x: cx, y: s.y + 64 };
    return { x: cx, y: cy };
  };

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payout Lifecycle State Machine</h1>
        <p className="text-sm text-gray-500 mb-6">Click any state to see its description, entry conditions, and available transitions.</p>

        <div className="flex gap-4 mb-6 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-8 h-0.5 bg-indigo-600" /><span className="text-gray-600">Manual (UI action)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-8 h-0.5 bg-emerald-600" style={{ strokeDasharray: "4 2" }} /><span className="text-gray-600">Automatic (system)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-6 h-5 rounded border-2 border-dashed border-amber-400 bg-amber-50" /><span className="text-gray-600">Paused state</span></div>
          <div className="flex items-center gap-1.5"><div className="w-6 h-5 rounded-full border-2 border-emerald-400 bg-emerald-50" /><span className="text-gray-600">Terminal state</span></div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          <svg viewBox="0 0 800 630" className="w-full" style={{ maxHeight: 520 }}>
            <defs>
              <marker id="arrow-manual" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#4F46E5" /></marker>
              <marker id="arrow-auto" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#16A34A" /></marker>
              <marker id="arrow-error" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#DC2626" /></marker>
              <marker id="arrow-warn" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#D97706" /></marker>
              <marker id="arrow-neutral" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#6B7280" /></marker>
            </defs>

            {/* Manual: Review → Transfer (Approve) */}
            <line x1={495} y1={124} x2={495} y2={214} stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow-manual)" />
            <text x={505} y={172} fontSize="9" fill="#4F46E5" fontWeight="600" fontFamily="system-ui">Approve</text>

            {/* Manual: Review ↔ Paused(reviewing) */}
            <line x1={420} y1={76} x2={336} y2={76} stroke="#D97706" strokeWidth="1.5" markerEnd="url(#arrow-warn)" />
            <text x={358} y={68} fontSize="9" fill="#D97706" fontWeight="600" fontFamily="system-ui">Pause</text>
            <line x1={330} y1={100} x2={414} y2={100} stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow-manual)" />
            <text x={348} y={114} fontSize="9" fill="#4F46E5" fontWeight="600" fontFamily="system-ui">Resume</text>

            {/* Manual: Transfer → Transferring (Execute) */}
            <line x1={495} y1={284} x2={495} y2={374} stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow-manual)" />
            <text x={505} y={332} fontSize="9" fill="#4F46E5" fontWeight="600" fontFamily="system-ui">Execute</text>

            {/* Manual: Transfer ↔ Paused(transferring) */}
            <line x1={420} y1={236} x2={336} y2={236} stroke="#D97706" strokeWidth="1.5" markerEnd="url(#arrow-warn)" />
            <text x={358} y={228} fontSize="9" fill="#D97706" fontWeight="600" fontFamily="system-ui">Pause</text>
            <line x1={330} y1={260} x2={414} y2={260} stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow-manual)" />
            <text x={348} y={274} fontSize="9" fill="#4F46E5" fontWeight="600" fontFamily="system-ui">Resume</text>

            {/* Auto: Transferring → Completed */}
            <line x1={570} y1={412} x2={614} y2={412} stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrow-auto)" strokeDasharray="4 2" />
            <text x={576} y={402} fontSize="9" fill="#16A34A" fontWeight="600" fontFamily="system-ui">Success</text>

            {/* Auto: Transferring → Failed */}
            <line x1={495} y1={444} x2={495} y2={534} stroke="#DC2626" strokeWidth="1.5" markerEnd="url(#arrow-error)" strokeDasharray="4 2" />
            <text x={505} y={492} fontSize="9" fill="#DC2626" fontWeight="600" fontFamily="system-ui">Failure</text>

            {/* Auto: Transferring → Ready for Transfer (retryable) */}
            <path d="M 420,400 C 380,400 380,270 420,262" fill="none" stroke="#D97706" strokeWidth="1.5" markerEnd="url(#arrow-warn)" strokeDasharray="4 2" />
            <text x={350} y={340} fontSize="8" fill="#D97706" fontWeight="600" fontFamily="system-ui">Retryable</text>

            {/* Manual: Failed → Ready for Transfer */}
            <path d="M 570,560 C 680,560 680,262 570,252" fill="none" stroke="#4F46E5" strokeWidth="1.5" markerEnd="url(#arrow-manual)" />
            <text x={688} y={400} fontSize="8" fill="#4F46E5" fontWeight="600" fontFamily="system-ui" transform="rotate(90, 688, 400)">Resolve & retry</text>

            {/* Manual: Failed → Paused(transferring) */}
            <path d="M 420,560 C 300,560 260,290 255,288" fill="none" stroke="#D97706" strokeWidth="1.5" markerEnd="url(#arrow-warn)" />
            <text x={290} y={440} fontSize="8" fill="#D97706" fontWeight="600" fontFamily="system-ui">Pause</text>

            {/* Auto: Completed → Failed (bank return edge case) */}
            <path d="M 695,444 C 695,520 580,540 575,540" fill="none" stroke="#DC2626" strokeWidth="1.5" markerEnd="url(#arrow-error)" strokeDasharray="4 2" />
            <text x={660} y={504} fontSize="8" fill="#DC2626" fontWeight="600" fontFamily="system-ui">Bank return</text>

            {/* Auto: Review → Completed (zero/neg balance) */}
            <path d="M 570,92 C 750,92 750,380 770,396" fill="none" stroke="#16A34A" strokeWidth="1.5" markerEnd="url(#arrow-auto)" strokeDasharray="4 2" />
            <text x={720} y={200} fontSize="8" fill="#16A34A" fontWeight="600" fontFamily="system-ui" transform="rotate(90, 720, 200)">Zero / neg balance</text>

            {/* Paused(reviewing) → Abandoned */}
            <line x1={180} y1={124} x2={105} y2={374} stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow-neutral)" />
            <text x={110} y={240} fontSize="8" fill="#6B7280" fontWeight="600" fontFamily="system-ui" transform="rotate(75, 110, 240)">Abandon</text>

            {/* Paused(transferring) → Abandoned */}
            <line x1={180} y1={260} x2={105} y2={374} stroke="#6B7280" strokeWidth="1.5" markerEnd="url(#arrow-neutral)" />
            <text x={118} y={320} fontSize="8" fill="#6B7280" fontWeight="600" fontFamily="system-ui" transform="rotate(50, 118, 320)">Abandon</text>

            {/* Entry arrow */}
            <line x1={495} y1={20} x2={495} y2={54} stroke="#4F46E5" strokeWidth="2" markerEnd="url(#arrow-manual)" />
            <text x={505} y={38} fontSize="9" fill="#4F46E5" fontWeight="600" fontFamily="system-ui">Prepare payout</text>

            {STATES.map(s => <StateNode key={s.id} state={s} selected={selected?.id === s.id} onClick={setSelected} />)}
          </svg>
        </div>

        {selected && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.border }} />
              <h2 className="text-lg font-bold" style={{ color: selected.textColor }}>{selected.label.replace("\n", " ")}</h2>
              {(selected.id === "completed" || selected.id === "abandoned") && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Terminal</span>}
              {selected.id.startsWith("paused") && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Hold state</span>}
            </div>
            <p className="text-sm text-gray-600 mb-4">{selected.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Entry condition</h3>
                <p className="text-sm text-gray-700">{selected.entry}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Available transitions</h3>
                <ul className="space-y-1">
                  {selected.exits.map((e, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5"><span className="text-gray-400 mt-0.5">→</span>{e}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
