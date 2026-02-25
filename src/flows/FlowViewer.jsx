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

export default function FlowViewer() {
  const [activeTab, setActiveTab] = useState("lifecycle");
  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Tab bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex items-center gap-1 py-1">
            <div className="flex items-center gap-2 mr-6 py-2">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#4F46E5" /><text x="5" y="22" fill="white" fontWeight="700" fontSize="14" fontFamily="system-ui">mx</text></svg>
              <span className="text-sm font-bold text-gray-800">Settlement & Ledger — UX Flows</span>
            </div>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.id ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  );
}
