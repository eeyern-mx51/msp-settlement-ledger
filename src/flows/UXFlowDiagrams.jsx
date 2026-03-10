import { useState } from "react";
import PayoutLifecycle from "./PayoutLifecycle";
import E2EPayoutJourney from "./E2EPayoutJourney";
import FinOpsActionFlows from "./FinOpsActionFlows";
import PermissionsMatrix from "./PermissionsMatrix";

const TABS = [
  { id: "lifecycle", label: "Payout Lifecycle", icon: "◎", component: PayoutLifecycle },
  { id: "e2e", label: "E2E Journey", icon: "→", component: E2EPayoutJourney },
  { id: "actions", label: "Action Flows", icon: "⚡", component: FinOpsActionFlows },
  { id: "permissions", label: "Permissions", icon: "🔐", component: PermissionsMatrix },
];

export default function UXFlowDiagrams() {
  const [activeTab, setActiveTab] = useState("lifecycle");
  const current = TABS.find((t) => t.id === activeTab);
  const ActiveComponent = current?.component;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Settlement & Ledger — UX Flow Diagrams</h2>
        <p className="text-sm text-gray-500">All core UX flow diagrams in one view. Switch tabs to explore each artefact.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
              activeTab === t.id
                ? "bg-indigo-600 text-white border-indigo-600"
                : "text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Active tab content */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Footer note */}
      <div className="mt-4 text-xs text-gray-400 italic">
        Each diagram is also available as an individual artefact from the UX Artefacts list.
      </div>
    </div>
  );
}
