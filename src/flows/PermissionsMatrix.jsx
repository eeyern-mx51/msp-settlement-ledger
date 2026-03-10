import { useState } from "react";

const ROLES = [
  { id: "finops_t1", label: "FinOps Tier 1", description: "Read & write access to all payout and settlement functionality. Primary operator role for POC.", color: "#4F46E5", bgColor: "#EEF2FF" },
  { id: "finops_t2", label: "FinOps Tier 2", description: "Read-only access to payouts and settlements. Can view but cannot perform any actions. BAU support tier.", color: "#7C3AED", bgColor: "#F5F3FF" },
  { id: "admin", label: "Administrator", description: "Existing SD admin role. No access to settlement features. Must be segregated from FinOps permissions.", color: "#6B7280", bgColor: "#F9FAFB" },
];

const CATEGORIES = [
  {
    name: "Payout Management",
    permissions: [
      { action: "View fleet payouts", finops_t1: "full", finops_t2: "read", admin: "none" },
      { action: "View merchant payouts", finops_t1: "full", finops_t2: "read", admin: "none" },
      { action: "View payout detail", finops_t1: "full", finops_t2: "read", admin: "none" },
      { action: "Prepare payout (date range)", finops_t1: "full", finops_t2: "none", admin: "none" },
      { action: "Approve payout", finops_t1: "full", finops_t2: "none", admin: "none" },
      { action: "Execute transfer", finops_t1: "full", finops_t2: "none", admin: "none" },
      { action: "Hold payout", finops_t1: "full", finops_t2: "none", admin: "none" },
      { action: "Release Hold", finops_t1: "full", finops_t2: "none", admin: "none" },
      { action: "Abandon payout", finops_t1: "full", finops_t2: "none", admin: "none" },
    ]
  },
  {
    name: "Transfer & Failure Reporting",
    permissions: [
      { action: "View transfer status", finops_t1: "full", finops_t2: "read", admin: "none" },
      { action: "View failure reason", finops_t1: "full", finops_t2: "read", admin: "none" },
      { action: "Retry failed transfer", finops_t1: "full", finops_t2: "none", admin: "none" },
    ]
  },
  {
    name: "Kill Switches",
    permissions: [
      { action: "Toggle fleet payout execution", finops_t1: "full", finops_t2: "none", admin: "none" },
      { action: "Toggle merchant payout execution", finops_t1: "full", finops_t2: "none", admin: "none" },
    ]
  },
  {
    name: "Adjustments",
    permissions: [
      { action: "View adjustments", finops_t1: "full", finops_t2: "read", admin: "none" },
      { action: "View adjustment detail", finops_t1: "full", finops_t2: "read", admin: "none" },
      { action: "Create adjustment", finops_t1: "full", finops_t2: "none", admin: "none" },
      { action: "Approve adjustment", finops_t1: "full", finops_t2: "none", admin: "none" },
    ]
  },
  {
    name: "Audit & Reporting",
    permissions: [
      { action: "View audit log", finops_t1: "full", finops_t2: "read", admin: "none" },
      { action: "View transaction ledger", finops_t1: "full", finops_t2: "read", admin: "none" },
      { action: "Export settlement CSV", finops_t1: "full", finops_t2: "read", admin: "none" },
    ]
  },
  {
    name: "Existing SD Features",
    permissions: [
      { action: "View merchant facilities", finops_t1: "full", finops_t2: "read", admin: "full" },
      { action: "View terminals", finops_t1: "full", finops_t2: "read", admin: "full" },
      { action: "View transactions", finops_t1: "full", finops_t2: "read", admin: "full" },
      { action: "Manage MSF rates", finops_t1: "none", finops_t2: "none", admin: "full" },
      { action: "DB query", finops_t1: "none", finops_t2: "none", admin: "full" },
    ]
  },
];

const ACCESS_ICONS = {
  full: { symbol: "✓", label: "Full access", color: "#16A34A", bg: "#F0FDF4" },
  read: { symbol: "👁", label: "Read only", color: "#D97706", bg: "#FFFBEB" },
  none: { symbol: "✕", label: "No access", color: "#DC2626", bg: "#FEF2F2" },
};

export default function PermissionsMatrix() {
  const [highlight, setHighlight] = useState(null);

  return (
    <div className="min-h-screen bg-white p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">User Permissions & Roles</h1>
        <p className="text-sm text-gray-500 mb-6">Access matrix for the MSP Support Dashboard settlement features. Hover over a role to highlight its permissions.</p>

        {/* Role cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {ROLES.map(role => (
            <div key={role.id} className="rounded-xl border-2 p-4 transition-all cursor-pointer" style={{ borderColor: highlight === role.id ? role.color : role.color + "30", backgroundColor: highlight === role.id ? role.bgColor : "white" }} onMouseEnter={() => setHighlight(role.id)} onMouseLeave={() => setHighlight(null)}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                <h3 className="text-sm font-bold" style={{ color: role.color }}>{role.label}</h3>
              </div>
              <p className="text-xs text-gray-600">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mb-4 text-xs">
          {Object.entries(ACCESS_ICONS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: val.bg, color: val.color }}>{val.symbol}</span>
              <span className="text-gray-600">{val.label}</span>
            </div>
          ))}
        </div>

        {/* Matrix table */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider py-3 px-4 w-[45%]">Action</th>
                {ROLES.map(role => (
                  <th key={role.id} className="text-center text-xs font-bold uppercase tracking-wider py-3 px-4" style={{ color: role.color }} onMouseEnter={() => setHighlight(role.id)} onMouseLeave={() => setHighlight(null)}>{role.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat, ci) => (
                <>
                  <tr key={`cat-${ci}`} className="bg-gray-50/70">
                    <td colSpan={4} className="py-2 px-4 text-xs font-bold text-gray-700 border-t border-gray-200">{cat.name}</td>
                  </tr>
                  {cat.permissions.map((perm, pi) => (
                    <tr key={`${ci}-${pi}`} className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2.5 px-4 text-sm text-gray-700">{perm.action}</td>
                      {ROLES.map(role => {
                        const access = perm[role.id];
                        const icon = ACCESS_ICONS[access];
                        const isHighlighted = highlight === role.id;
                        return (
                          <td key={role.id} className="py-2.5 px-4 text-center" onMouseEnter={() => setHighlight(role.id)} onMouseLeave={() => setHighlight(null)}>
                            <span className={`inline-flex w-7 h-7 rounded items-center justify-center text-xs font-bold transition-all ${isHighlighted ? "scale-110 shadow-sm" : ""}`} style={{ backgroundColor: icon.bg, color: icon.color, opacity: isHighlighted || !highlight ? 1 : 0.4 }}>{icon.symbol}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-amber-800 mb-2">Design decisions & open questions</h3>
          <ul className="space-y-1 text-sm text-amber-700">
            <li className="flex items-start gap-2"><span className="flex-shrink-0">•</span>POC: FinOps T1 only (baseline). BAU: FinOps T2 added for view-only support.</li>
            <li className="flex items-start gap-2"><span className="flex-shrink-0">•</span>Admin role explicitly excluded from settlements — write permissions must be segregated.</li>
            <li className="flex items-start gap-2"><span className="flex-shrink-0">•</span>Manual adjustments may require 2nd user approval (TBC for POC).</li>
            <li className="flex items-start gap-2"><span className="flex-shrink-0">•</span>Consider: rename "Administrator" to something else, or adopt a 2-tier role system with granular permissions.</li>
            <li className="flex items-start gap-2"><span className="flex-shrink-0">•</span>Current MSF historical updates handled as BAU service request until dedicated FinOps team in place.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
