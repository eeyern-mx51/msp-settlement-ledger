import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";
import PayoutLifecycle from "./flows/PayoutLifecycle";
import E2EPayoutJourney from "./flows/E2EPayoutJourney";
import FinOpsActionFlows from "./flows/FinOpsActionFlows";
import PermissionsMatrix from "./flows/PermissionsMatrix";
import DTEtoPayoutWireframes from "./flows/DTEtoPayoutWireframes";
import PayoutDataDictionary from "./flows/PayoutDataDictionary";
import UXFlowDiagrams from "./flows/UXFlowDiagrams";
import PayoutProgressionControls from "./flows/PayoutProgressionControls";
import AuditLogsReference from "./flows/AuditLogsReference";

// ─── Icon Components ───
const Icons = {
  Logo: () => (<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#4F46E5" /><text x="5" y="22" fill="white" fontWeight="700" fontSize="14" fontFamily="system-ui">mx</text></svg>),
  Shop: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9M7 9v3a2 2 0 004 0V9m2 0v3a2 2 0 004 0V9" /></svg>),
  Terminal: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="9" y1="18" x2="15" y2="18" /><line x1="9" y1="6" x2="15" y2="6" /></svg>),
  Buildings: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="8" width="7" height="13" rx="1" /><line x1="6" y1="7" x2="7" y2="7" /><line x1="6" y1="10" x2="7" y2="10" /><line x1="6" y1="13" x2="7" y2="13" /><line x1="17" y1="12" x2="18" y2="12" /><line x1="17" y1="15" x2="18" y2="15" /></svg>),
  Profile: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2 21v-1a5 5 0 0110 0v1" /><path d="M14 21v-1a4 4 0 018 0v1" /></svg>),
  DocumentText: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></svg>),
  Lifebuoy: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /><line x1="4.93" y1="4.93" x2="9.17" y2="9.17" /><line x1="14.83" y1="14.83" x2="19.07" y2="19.07" /><line x1="14.83" y1="9.17" x2="19.07" y2="4.93" /><line x1="4.93" y1="19.07" x2="9.17" y2="14.83" /></svg>),
  Code: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16,18 22,12 16,6" /><polyline points="8,6 2,12 8,18" /></svg>),
  Key: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>),
  Danger: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>),
  ChevronRight: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6" /></svg>),
  ChevronDown: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9" /></svg>),
  ChevronLeft: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6" /></svg>),
  Info: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>),
  Menu: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>),
  Tick: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#12B76A" /><path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  Cross: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#F04438" /><path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>),
  Mastercard: () => (<svg width="24" height="16" viewBox="0 0 48 32"><circle cx="18" cy="16" r="10" fill="#EB001B" opacity="0.9" /><circle cx="30" cy="16" r="10" fill="#F79E1B" opacity="0.9" /><path d="M24 8.8a10 10 0 000 14.4 10 10 0 000-14.4z" fill="#FF5F00" /></svg>),
  Visa: () => (<svg width="24" height="16" viewBox="0 0 48 32"><rect width="48" height="32" rx="4" fill="#1A1F71" /><text x="8" y="21" fill="white" fontWeight="700" fontSize="14" fontFamily="system-ui">VISA</text></svg>),
  Logout: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>),
  Store: () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9M7 9v3a2 2 0 004 0V9m2 0v3a2 2 0 004 0V9" /></svg>),
  Wallet: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M2 10h20" /><path d="M16 14h2" /><path d="M6 2h12l2 4H4l2-4z" /></svg>),
  ArrowSend: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>),
  Clock: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>),
  Pause: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>),
  Play: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,3 19,12 5,21" /></svg>),
  Refresh: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23,4 23,10 17,10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>),
  Ban: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>),
  Check: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>),
  Search: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>),
  Download: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>),
  Beaker: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M10 3v5.172a2 2 0 01-.586 1.414l-4.828 4.828A4 4 0 007.414 21h9.172a4 4 0 002.828-6.828l-4.828-4.828A2 2 0 0114 8.172V3" /><path d="M7 17h10" /></svg>),
  Layers: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 2,7 12,12 22,7" /><polyline points="2,17 12,22 22,17" /><polyline points="2,12 12,17 22,12" /></svg>),
  Shield: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
  DollarSign: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>),
  Plus: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  X: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  Lock: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>),
  Eye: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>),
  Calendar: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
  AlertTriangle: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>),
  FileText: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></svg>),
  Settings: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>),
};

// ─── Shared UI Components ───
function Badge({ children, colorScheme = "neutral", size = "sm" }) {
  const schemes = { success: "bg-emerald-50 text-emerald-700 border border-emerald-200", error: "bg-red-50 text-red-700 border border-red-200", warning: "bg-amber-50 text-amber-700 border border-amber-200", neutral: "bg-gray-100 text-gray-600 border border-gray-200", brand: "bg-indigo-50 text-indigo-700 border border-indigo-200", info: "bg-blue-50 text-blue-700 border border-blue-200", purple: "bg-purple-50 text-purple-700 border border-purple-200" };
  const sizes = { sm: "text-xs px-2 py-0.5", md: "text-xs px-2.5 py-1" };
  return <span className={`inline-flex items-center rounded-full font-semibold ${schemes[colorScheme]} ${sizes[size]}`}>{children}</span>;
}
function Button({ children, variant = "solid", colorScheme = "brand", size = "sm", onClick, disabled, className = "", leftIcon }) {
  const base = "inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "text-sm px-3 py-1.5", md: "text-sm px-4 py-2", lg: "text-base px-5 py-2.5" };
  const variants = { solid: { brand: "bg-indigo-600 text-white hover:bg-indigo-700", neutral: "bg-gray-800 text-white hover:bg-gray-900", error: "bg-red-600 text-white hover:bg-red-700" }, outline: { brand: "border border-indigo-300 text-indigo-600 hover:bg-indigo-50", neutral: "border border-gray-300 text-gray-700 hover:bg-gray-50", error: "border border-red-300 text-red-600 hover:bg-red-50" }, ghost: { brand: "text-indigo-600 hover:bg-indigo-50", neutral: "text-gray-600 hover:bg-gray-100" }, link: { brand: "text-indigo-600 hover:underline p-0", neutral: "text-gray-500 hover:underline p-0" } };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]?.[colorScheme] || ""} ${className}`}>{leftIcon && <span className="flex items-center">{leftIcon}</span>}{children}</button>;
}
function Card({ children, className = "" }) { return <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>; }
function CardHeader({ children, className = "" }) { return <div className={`px-6 py-4 flex items-center justify-between ${className}`}>{children}</div>; }
function CardBody({ children, className = "" }) { return <div className={`px-6 pb-6 ${className}`}>{children}</div>; }
function Divider() { return <hr className="border-t border-gray-200 m-0" />; }
function HeroMetric({ heading, value, tooltip, isLoading, colorClass }) {
  return (<div className="flex-1 min-w-[140px]"><div className="flex items-center gap-1 py-1"><span className="text-sm font-medium text-gray-700">{heading}</span>{tooltip && <span className="text-gray-400 cursor-help" title={tooltip}><Icons.Info /></span>}</div><div className={`text-3xl font-bold h-[52px] flex items-center ${colorClass || "text-gray-900"} ${isLoading ? "opacity-30" : ""}`}>{isLoading ? <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" /> : value}</div></div>);
}
function Alert({ type = "info", title, children }) {
  const styles = { info: "bg-blue-50 border-blue-200 text-blue-800", error: "bg-red-50 border-red-200 text-red-800", warning: "bg-amber-50 border-amber-200 text-amber-800", success: "bg-emerald-50 border-emerald-200 text-emerald-800" };
  return <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${styles[type]}`}><span className="mt-0.5 flex-shrink-0"><Icons.Info /></span><div>{title && <div className="font-semibold">{title}</div>}{children && <div className={title ? "mt-0.5 font-normal opacity-80" : "font-medium"}>{children}</div>}</div></div>;
}
function Toggle({ checked, onChange, label, description, disabled }) {
  return (<div className={`flex items-start gap-3 ${disabled ? "opacity-40 pointer-events-none" : ""}`}><button onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 ${checked ? "bg-red-500" : "bg-gray-300"}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} /></button><div><span className="text-sm font-semibold text-gray-800">{label}</span>{description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}</div></div>);
}
function FilterChip({ label, active, onClick }) {
  return <button onClick={onClick} className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{label}</button>;
}

function DateFilterBar({ value, onChange, options }) {
  return <div className="flex gap-2">{(options || [{ id: "today", label: "Today" }, { id: "week", label: "This week" }, { id: "custom", label: "Custom" }]).map((f) => (<button key={f.id} onClick={() => onChange(f.id)} className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${value === f.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"}`}>{f.label}</button>))}</div>;
}
const TH = ({ children, right }) => <th className={`text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-3 ${right ? "text-right" : "text-left"}`}>{children}</th>;

// ─── Modal / Dialog ───
function Modal({ open, onClose, title, children, width = "max-w-lg" }) {
  if (!open) return null;
  return (<div className="fixed inset-0 z-50 flex items-center justify-center"><div className="absolute inset-0 bg-black/40" onClick={onClose} /><div className={`relative bg-white rounded-xl shadow-xl ${width} w-full mx-4 max-h-[85vh] flex flex-col`}><div className="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-800">{title}</h2><button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><Icons.X /></button></div><div className="px-6 py-5 overflow-y-auto flex-1">{children}</div></div></div>);
}

// ─── Toast System ───
const ToastContext = createContext({ addToast: () => {} });
function useToast() { return useContext(ToastContext); }
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slide-up ${
            t.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
            t.type === "error" ? "bg-red-50 border-red-200 text-red-800" :
            t.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
            "bg-white border-gray-200 text-gray-800"
          }`}>
            <span className="mt-0.5 flex-shrink-0">{t.type === "success" ? <Icons.Check /> : t.type === "error" ? <Icons.Ban /> : t.type === "warning" ? <Icons.Pause /> : <Icons.Info />}</span>
            <div className="flex-1 min-w-0"><div className="text-sm font-semibold">{t.title}</div>{t.message && <div className="text-xs mt-0.5 opacity-80">{t.message}</div>}</div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><Icons.X /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Confirmation Dialogs for Payout Actions ───
function ApprovePayoutDialog({ open, onClose, payout, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); onClose(); }, 1200);
  };
  if (!payout) return null;
  return (
    <Modal open={open} onClose={onClose} title="Approve payout">
      <div className="space-y-5">
        <Alert type="info" title="Review before approving">Once approved, this payout will move to "Ready for Transfer" and the transfer can be initiated. Ensure the amounts and merchant details are correct.</Alert>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100">
          {[["Payout ID", payout.id], ["Merchant", payout.merchantName], ["MID", payout.mid], ["Settlement date", payout.settlementDate || payout.date], ["Amount", payout.amount]].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm"><span className="text-gray-500 font-medium">{label}</span><span className="text-gray-800 font-semibold">{value}</span></div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="solid" colorScheme="brand" size="md" onClick={handleConfirm} disabled={loading} leftIcon={loading ? null : <Icons.Check />}>{loading ? "Approving..." : "Approve payout"}</Button>
        </div>
      </div>
    </Modal>
  );
}

function BeginTransferDialog({ open, onClose, payout, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); onClose(); }, 1200);
  };
  if (!payout) return null;
  return (
    <Modal open={open} onClose={onClose} title="Begin transfer">
      <div className="space-y-5">
        <Alert type="info" title="Confirm transfer initiation">Once initiated, the payout will be submitted to the bank for processing. This action cannot be reversed — ensure the payout details and amount are correct.</Alert>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100">
          {[["Payout ID", payout.id], ["Merchant", payout.merchantName], ["MID", payout.mid], ["Amount", payout.amount], ["Settlement date", payout.settlementDate || payout.date]].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm"><span className="text-gray-500 font-medium">{label}</span><span className="text-gray-800 font-semibold">{value}</span></div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="solid" colorScheme="brand" size="md" onClick={handleConfirm} disabled={loading} leftIcon={loading ? null : <Icons.Play />}>{loading ? "Initiating transfer..." : "Begin transfer"}</Button>
        </div>
      </div>
    </Modal>
  );
}

function AbandonPayoutDialog({ open, onClose, payout, onConfirm }) {
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [note, setNote] = useState("");
  const handleConfirm = () => {
    const errs = {};
    if (confirmText !== "ABANDON") errs.confirmText = "Please type ABANDON to confirm this action.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); onClose(); setConfirmText(""); setNote(""); }, 1500);
  };
  useEffect(() => { if (open) { setNote(""); setErrors({}); } }, [open]);
  if (!payout) return null;
  return (
    <Modal open={open} onClose={onClose} title="Abandon payout">
      <div className="space-y-5">
        <Alert type="error" title="This action is irreversible">Abandoning this payout will permanently stop it. The merchant's funds will not be transferred. All transactions will be returned to the ledger and allocated to the next payout preparation.</Alert>
        <div className="bg-red-50 rounded-lg p-4 space-y-2 border border-red-100">
          {[["Payout ID", payout.id], ["Merchant", payout.merchantName], ["Amount at risk", payout.amount]].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm"><span className="text-red-600 font-medium">{label}</span><span className="text-red-800 font-semibold">{value}</span></div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Internal note <span className="text-xs font-normal text-gray-400">(optional)</span></label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} placeholder="Add context for the audit log..." className={`w-full text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none ${note.length >= 500 ? "border-red-400" : "border-gray-300"}`} />
          <div className="flex justify-between mt-0.5"><p className="text-xs text-gray-400">Recorded in the audit log. Not visible to the merchant.</p><p className={`text-xs ${note.length >= 450 ? (note.length >= 500 ? "text-red-500 font-medium" : "text-amber-500") : "text-gray-400"}`}>{note.length}/500</p></div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Type ABANDON to confirm</label>
          <input type="text" value={confirmText} onChange={(e) => { setConfirmText(e.target.value.toUpperCase()); if (errors.confirmText) setErrors({}); }} placeholder="ABANDON" className={`w-full text-sm border rounded-lg px-3 py-2 font-mono tracking-wider focus:ring-2 ${errors.confirmText ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-300 focus:ring-red-200 focus:border-red-400"}`} />
          {errors.confirmText && <p className="text-xs text-red-600 mt-1">{errors.confirmText}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose} disabled={loading}>Go back</Button>
          <Button variant="solid" colorScheme="error" size="md" onClick={handleConfirm} disabled={loading} leftIcon={loading ? null : <Icons.Ban />}>{loading ? "Abandoning..." : "Abandon payout"}</Button>
        </div>
      </div>
    </Modal>
  );
}

function ResubmitPayoutDialog({ open, onClose, payout, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(); onClose(); setNote(""); }, 1200);
  };
  useEffect(() => { if (open) setNote(""); }, [open]);
  if (!payout) return null;
  return (
    <Modal open={open} onClose={onClose} title="Resubmit payout">
      <div className="space-y-5">
        <Alert type="info" title="Confirm resubmit">This payout will be moved back to "Ready for Transfer" and can be submitted to the bank again. Ensure the underlying issue has been resolved before resubmitting.</Alert>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100">
          {[["Payout ID", payout.id], ["Merchant", payout.merchantName], ["MID", payout.mid], ["Amount", payout.amount], ["Settlement date", payout.settlementDate || payout.date]].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm"><span className="text-gray-500 font-medium">{label}</span><span className="text-gray-800 font-semibold">{value}</span></div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Internal note <span className="text-xs font-normal text-gray-400">(optional)</span></label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} placeholder="Add context for the audit log..." className={`w-full text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none ${note.length >= 500 ? "border-red-400" : "border-gray-300"}`} />
          <div className="flex justify-between mt-0.5"><p className="text-xs text-gray-400">Recorded in the audit log. Not visible to the merchant.</p><p className={`text-xs ${note.length >= 450 ? (note.length >= 500 ? "text-red-500 font-medium" : "text-amber-500") : "text-gray-400"}`}>{note.length}/500</p></div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="solid" colorScheme="brand" size="md" onClick={handleConfirm} disabled={loading} leftIcon={loading ? null : <Icons.Refresh />}>{loading ? "Resubmitting..." : "Resubmit payout"}</Button>
        </div>
      </div>
    </Modal>
  );
}

function ActiveHoldBanners({ holdRecords, level, entity, mid, merchantName, automationConfig }) {
  const hr = holdRecords || [];

  // Inherited: fleet holds shown on merchant/payout pages, merchant holds shown on payout pages
  const fleetHolds = level !== "fleet" ? hr.filter(h => h.active && h.level === "fleet") : [];
  const merchantHolds = level === "payout" ? hr.filter(h => h.active && h.level === "merchant" && h.entity === mid) : [];

  // Current level holds
  const currentLevelHolds = hr.filter(h => h.active && h.level === level && (level === "fleet" || h.entity === entity));

  const allManualHolds = [...fleetHolds, ...merchantHolds, ...currentLevelHolds];

  // Group raw hold records into logical holds per level (merge approval + begin_transfer into "Progression")
  const groupHoldsLogical = (holds) => {
    const logical = [];
    // Group by level+entity first so each level gets its own entries
    const bySource = {};
    holds.forEach(h => {
      const key = `${h.level}::${h.entity || ""}`;
      if (!bySource[key]) bySource[key] = { level: h.level, entity: h.entity, phases: [] };
      bySource[key].phases.push(h.phase);
    });
    Object.values(bySource).forEach(({ level: hLevel, entity: hEntity, phases }) => {
      if (phases.includes("preparation")) {
        logical.push({ kind: "manual", type: "preparation", label: "Manual preparation", level: hLevel, entity: hEntity });
      }
      if (phases.includes("approval") || phases.includes("begin_transfer")) {
        logical.push({ kind: "manual", type: "progression", label: "Manual progression", level: hLevel, entity: hEntity });
      }
    });
    return logical;
  };

  // Build automation hold entries
  const getAutoHolds = () => {
    if (!automationConfig) return [];
    const autoEntries = [];
    const addAutoEntry = (cfgLevel, cfgMid) => {
      const raw = cfgLevel === "fleet"
        ? automationConfig.fleet
        : (automationConfig.merchants[cfgMid] || null);
      if (!raw) return;
      if (raw.preparation) {
        autoEntries.push({ kind: "automation", type: "preparation", label: "Auto-preparation", level: cfgLevel, entity: cfgLevel === "fleet" ? null : cfgMid });
      }
      if (raw.approval && raw.beginTransfer) {
        autoEntries.push({ kind: "automation", type: "progression", label: "Auto-progression", level: cfgLevel, entity: cfgLevel === "fleet" ? null : cfgMid });
      }
    };
    if (level === "fleet") addAutoEntry("fleet", null);
    else {
      addAutoEntry("fleet", null);
      if (level === "merchant" || level === "payout") addAutoEntry("merchant", mid);
    }
    return autoEntries;
  };

  // At payout level, preparation holds are irrelevant — the payout already exists
  const allLogical = [...groupHoldsLogical(allManualHolds), ...getAutoHolds()]
    .filter(l => level !== "payout" || l.type !== "preparation");
  if (allLogical.length === 0) return null;

  // Group by level for stacked rows
  const byLevel = {};
  allLogical.forEach(l => {
    const lbl = l.level === "fleet" ? "Fleet" : l.level === "merchant" ? "Merchant" : "Payout";
    if (!byLevel[lbl]) byLevel[lbl] = [];
    byLevel[lbl].push(l);
  });

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Icons.Shield />
        <span className="text-sm font-bold text-amber-900">{allLogical.length} hold{allLogical.length !== 1 ? "s" : ""} active</span>
      </div>
      <div className="space-y-1">
        {Object.entries(byLevel).map(([levelLabel, holds]) => (
          <div key={levelLabel} className="flex items-center gap-2">
            <Badge colorScheme="warning" size="sm">{levelLabel}</Badge>
            <span className="text-xs text-amber-700">{holds.map(h => h.label).join(", ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function HoldsDialog({ open, onClose, level, entity, entityLabel, mid, holdRecords, onCreateHold, onReleaseHold, automationConfig, onUpdateAutomationConfig, canWrite }) {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const hr = holdRecords || [];

  // ── Current persisted state ──
  const currentHolds = hr.filter(h => h.active && h.level === level && (level === "fleet" || h.entity === entity));
  const liveManualPrep = !!currentHolds.find(h => h.phase === "preparation");
  const liveManualProg = currentHolds.filter(h => h.phase === "approval" || h.phase === "begin_transfer").length > 0;
  const rawAutoConfig = level === "fleet"
    ? automationConfig.fleet
    : (automationConfig.merchants[mid] || { preparation: false, approval: false, beginTransfer: false });
  const liveAutoPrep = rawAutoConfig.preparation;
  const liveAutoProg = rawAutoConfig.approval && rawAutoConfig.beginTransfer;

  // ── Draft state (local until Save) ──
  const [draft, setDraft] = useState({ manualPrep: false, manualProg: false, autoPrep: false, autoProg: false });
  const [note, setNote] = useState("");

  // Reset draft to live state whenever the dialog opens
  useEffect(() => {
    if (open) {
      setDraft({ manualPrep: liveManualPrep, manualProg: liveManualProg, autoPrep: liveAutoPrep, autoProg: liveAutoProg });
      setNote("");
    }
  }, [open]);

  const showPreparation = level !== "payout";
  const hasChanges = draft.manualPrep !== liveManualPrep || draft.manualProg !== liveManualProg || draft.autoPrep !== liveAutoPrep || draft.autoProg !== liveAutoProg;
  const [submitError, setSubmitError] = useState("");

  const handleSave = () => {
    if (!hasChanges) { setSubmitError("No changes to apply. Modify at least one hold setting."); return; }
    setSubmitError("");
    setSaving(true);
    setTimeout(() => {
      // ── Apply manual hold changes ──
      // Preparation
      if (draft.manualPrep !== liveManualPrep) {
        if (draft.manualPrep) {
          const record = { id: generateHoldId(), level, entity: level === "fleet" ? null : entity, phase: "preparation", trigger: "manual", createdBy: "Sarah Chen (FinOps Administrator)", createdAt: nowTimestamp(), active: true };
          onCreateHold(record);
        } else {
          currentHolds.filter(h => h.phase === "preparation").forEach(h => onReleaseHold(h.id));
        }
      }
      // Progression
      if (draft.manualProg !== liveManualProg) {
        if (draft.manualProg) {
          ["approval", "begin_transfer"].forEach(phase => {
            const record = { id: generateHoldId(), level, entity: level === "fleet" ? null : entity, phase, trigger: "manual", createdBy: "Sarah Chen (FinOps Administrator)", createdAt: nowTimestamp(), active: true };
            onCreateHold(record);
          });
        } else {
          currentHolds.filter(h => h.phase === "approval" || h.phase === "begin_transfer").forEach(h => onReleaseHold(h.id));
        }
      }

      // ── Apply automation hold changes ──
      const autoUpdates = {};
      if (draft.autoPrep !== liveAutoPrep) autoUpdates.preparation = draft.autoPrep;
      if (draft.autoProg !== liveAutoProg) { autoUpdates.approval = draft.autoProg; autoUpdates.beginTransfer = draft.autoProg; }
      if (Object.keys(autoUpdates).length > 0) {
        if (level === "fleet") {
          onUpdateAutomationConfig({ ...automationConfig, fleet: { ...automationConfig.fleet, ...autoUpdates } });
        } else {
          const current = automationConfig.merchants[mid] || { preparation: false, approval: false, beginTransfer: false };
          onUpdateAutomationConfig({ ...automationConfig, merchants: { ...automationConfig.merchants, [mid]: { ...current, ...autoUpdates } } });
        }
      }

      addToast({ type: "success", title: "Holds updated", message: "Hold settings have been updated." });

      setSaving(false);
      onClose();
    }, 800);
  };

  const handleCancel = () => {
    setDraft({ manualPrep: liveManualPrep, manualProg: liveManualProg, autoPrep: liveAutoPrep, autoProg: liveAutoProg });
    onClose();
  };

  const Toggle = ({ active, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${active ? "bg-red-500" : "bg-gray-300"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  return (
    <Modal open={open} onClose={handleCancel} title="Hold controls">
      <div className="space-y-5">
        {/* Manual Holds */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Manual Holds</h3>
          <div className="space-y-3">
            {showPreparation && (
              <div className="flex items-start gap-3">
                <Toggle active={draft.manualPrep} onClick={() => { setDraft(d => ({ ...d, manualPrep: !d.manualPrep })); setSubmitError(""); }} disabled={!canWrite || saving} />
                <div>
                  <span className="text-sm font-medium text-gray-800">Hold manual preparation</span>
                  <p className="text-xs text-gray-500 mt-0.5">Prevents new payouts from being created</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Toggle active={draft.manualProg} onClick={() => { setDraft(d => ({ ...d, manualProg: !d.manualProg })); setSubmitError(""); }} disabled={!canWrite || saving} />
              <div>
                <span className="text-sm font-medium text-gray-800">Hold manual progression</span>
                <p className="text-xs text-gray-500 mt-0.5">Blocks manual approval and transfers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Automation Holds */}
        <div className="pt-5 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Automation Holds</h3>
          <div className="space-y-3">
            {showPreparation && (
              <div className="flex items-start gap-3">
                <Toggle active={draft.autoPrep} onClick={() => { setDraft(d => ({ ...d, autoPrep: !d.autoPrep })); setSubmitError(""); }} disabled={!canWrite || saving} />
                <div>
                  <span className="text-sm font-medium text-gray-800">Hold auto-preparation</span>
                  <p className="text-xs text-gray-500 mt-0.5">Prevents automated payout creation from running on a scheduled basis</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Toggle active={draft.autoProg} onClick={() => { setDraft(d => ({ ...d, autoProg: !d.autoProg })); setSubmitError(""); }} disabled={!canWrite || saving} />
              <div>
                <span className="text-sm font-medium text-gray-800">Hold auto-progression</span>
                <p className="text-xs text-gray-500 mt-0.5">Prevents automated approval and transfer from advancing payouts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Internal note (payout-level only) */}
        {level === "payout" && (
          <div className="pt-5 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal note <span className="text-xs font-normal text-gray-400">(optional)</span></label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={2} placeholder="Add context for the audit log..." className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none" />
            <p className="text-xs text-gray-400 mt-0.5">Recorded in the audit log. Not visible to the merchant.</p>
          </div>
        )}

        {/* Apply / Cancel */}
        {submitError && <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"><p className="text-sm text-amber-700">{submitError}</p></div>}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={handleCancel} disabled={saving}>Cancel</Button>
          <Button variant="solid" colorScheme="brand" size="md" onClick={handleSave} disabled={saving}>{saving ? "Applying..." : "Apply"}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Payout Status ───
function PayoutStatusBadge({ status, hold, amount, holdRecords, payoutId, mid, automationConfig }) {
  const cfg = { "Ready for Review": "info", "Ready for Transfer": "brand", "Transferring": "purple", "Failed": "error", "Completed": "success", "Abandoned": "neutral" };
  const numAmt = amount ? parseFloat(String(amount).replace(/[^0-9.\-]/g, "")) : null;
  const isZeroBalance = status === "Completed" && numAmt !== null && numAmt <= 0;
  // Only show hold badges for statuses where holds are actionable
  const showHoldBadge = HOLDABLE_STATUSES.has(status);

  let hasManualHold = false;
  let hasAutoHold = false;

  if (showHoldBadge) {
    // Only check progression holds (approval + begin_transfer) for badge display
    if (holdRecords && payoutId && mid) {
      const progHolds = holdRecords.filter(h => h.active && (h.phase === "approval" || h.phase === "begin_transfer") &&
        (h.level === "fleet" || (h.level === "merchant" && h.entity === mid) || (h.level === "payout" && h.entity === payoutId)));
      hasManualHold = progHolds.length > 0;
    }
    if (hold) hasManualHold = true;

    if (automationConfig && mid) {
      const fleetAuto = automationConfig.fleet || {};
      const merchantAuto = automationConfig.merchants?.[mid] || {};
      const autoProg = (fleetAuto.approval && fleetAuto.beginTransfer) || (merchantAuto.approval && merchantAuto.beginTransfer);
      hasAutoHold = autoProg;
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge colorScheme={cfg[status] || "neutral"} size="sm">{status}</Badge>
      {hasManualHold && <Badge colorScheme="warning" size="sm"><span className="inline-flex items-center gap-1"><Icons.Pause /> Manual</span></Badge>}
      {hasAutoHold && <Badge colorScheme="warning" size="sm"><span className="inline-flex items-center gap-1"><Icons.Pause /> Auto</span></Badge>}
      {isZeroBalance && <Badge colorScheme="neutral" size="sm">Zero-balance</Badge>}
    </span>
  );
}

// ─── Global role context (simulated) ───
const ROLES = { FINOPS_T1: "FinOps Administrator", FINOPS_T2: "FinOps View only" };
const STATUS_PROGRESSION_ORDER = { "Ready for Review": 0, "Ready for Transfer": 1, "Transferring": 2, "Failed": 3, "Completed": 4, "Abandoned": 5 };
const getStatusOrder = (payout) => (STATUS_PROGRESSION_ORDER[payout.status] ?? 99);

// ─── HOLD SYSTEM HELPERS ───
let holdIdCounter = 100;
const generateHoldId = () => `hold-${++holdIdCounter}`;
const nowTimestamp = () => new Date().toLocaleString("en-AU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });

function getActiveHoldsForAction(holdRecords, action, payoutId, mid) {
  // action: "preparation" | "approval" | "begin_transfer"
  // Returns all active hold records that block this action for this payout
  return holdRecords.filter(h => {
    if (!h.active) return false;
    if (h.phase !== action) return false;
    if (h.level === "fleet") return true;
    if (h.level === "merchant" && h.entity === mid) return true;
    if (h.level === "payout" && h.entity === payoutId) return true;
    return false;
  });
}

function isActionBlocked(holdRecords, action, payoutId, mid) {
  return getActiveHoldsForAction(holdRecords, action, payoutId, mid).length > 0;
}

function getHoldsForEntity(holdRecords, level, entity) {
  return holdRecords.filter(h => h.active && h.level === level && (level === "fleet" || h.entity === entity));
}

function isPreparationBlocked(holdRecords, mid) {
  // Check fleet-level OR merchant-level preparation holds
  return holdRecords.some(h => h.active && h.phase === "preparation" && (h.level === "fleet" || (h.level === "merchant" && h.entity === mid)));
}

const HOLDABLE_STATUSES = new Set(["Ready for Review", "Ready for Transfer", "Failed"]);

function isProgressionBlocked(holdRecords, payoutId, mid, status) {
  // Only holdable payouts (Ready for Review, Ready for Transfer, Failed) are affected
  if (status && !HOLDABLE_STATUSES.has(status)) return false;
  return isActionBlocked(holdRecords, "approval", payoutId, mid) || isActionBlocked(holdRecords, "begin_transfer", payoutId, mid);
}

function getEffectiveHolds(holdRecords, payoutId, mid) {
  // Get all active holds that affect a specific payout, grouped by source
  const fleet = holdRecords.filter(h => h.active && h.level === "fleet");
  const merchant = holdRecords.filter(h => h.active && h.level === "merchant" && h.entity === mid);
  const payout = holdRecords.filter(h => h.active && h.level === "payout" && h.entity === payoutId);
  return { fleet, merchant, payout, any: fleet.length + merchant.length + payout.length > 0 };
}

// ─── INITIAL HOLD RECORDS ───
const initialHoldRecords = [
  { id: "hold-001", level: "payout", entity: "PO-2026-0220-002", phase: "approval", trigger: "manual", createdBy: "Sarah Chen (FinOps Administrator)", createdAt: "20 Feb 2026, 9:45 AM", active: true },
  { id: "hold-002", level: "payout", entity: "PO-2026-0220-002", phase: "begin_transfer", trigger: "manual", createdBy: "Sarah Chen (FinOps Administrator)", createdAt: "20 Feb 2026, 9:45 AM", active: true },
];

// ═══════════════════════════════════════════════════════════
// MOCK DATA — Expanded
// ═══════════════════════════════════════════════════════════
const mockPayouts = [
  // 24 Feb — today
  { id: "PO-2026-0224-001", date: "24 Feb 2026", createdAt: "24 Feb 2026, 6:00 AM", settlementDate: "24 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$5,112.40", status: "Ready for Review" },
  { id: "PO-2026-0224-002", date: "24 Feb 2026", createdAt: "24 Feb 2026, 6:00 AM", settlementDate: "24 Feb 2026", merchantName: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: "$3,480.90", status: "Ready for Review" },
  { id: "PO-2026-0224-003", date: "24 Feb 2026", createdAt: "24 Feb 2026, 6:00 AM", settlementDate: "24 Feb 2026", merchantName: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: "$1,875.20", status: "Ready for Review" },
  { id: "PO-2026-0224-004", date: "24 Feb 2026", createdAt: "24 Feb 2026, 6:00 AM", settlementDate: "24 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$8,420.00", status: "Ready for Review" },
  { id: "PO-2026-0224-005", date: "24 Feb 2026", createdAt: "24 Feb 2026, 6:00 AM", settlementDate: "24 Feb 2026", merchantName: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: "$4,750.30", status: "Ready for Review" },
  // 23 Feb
  { id: "PO-2026-0223-001", date: "23 Feb 2026", createdAt: "23 Feb 2026, 6:02 AM", settlementDate: "23 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$4,821.50", status: "Ready for Transfer" },
  { id: "PO-2026-0223-002", date: "23 Feb 2026", createdAt: "23 Feb 2026, 6:02 AM", settlementDate: "23 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$12,340.00", status: "Ready for Transfer" },
  { id: "PO-2026-0223-003", date: "23 Feb 2026", createdAt: "23 Feb 2026, 6:02 AM", settlementDate: "23 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$3,215.60", status: "Transferring" },
  { id: "PO-2026-0223-004", date: "23 Feb 2026", createdAt: "23 Feb 2026, 6:02 AM", settlementDate: "23 Feb 2026", merchantName: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: "$7,215.60", status: "Transferring" },
  // 22 Feb
  { id: "PO-2026-0222-001", date: "22 Feb 2026", createdAt: "22 Feb 2026, 6:01 AM", settlementDate: "22 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$3,617.80", status: "Completed" },
  { id: "PO-2026-0222-002", date: "22 Feb 2026", createdAt: "22 Feb 2026, 6:01 AM", settlementDate: "22 Feb 2026", merchantName: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: "$8,990.25", status: "Completed" },
  { id: "PO-2026-0222-003", date: "22 Feb 2026", createdAt: "22 Feb 2026, 6:01 AM", settlementDate: "22 Feb 2026", merchantName: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: "$2,640.15", status: "Completed" },
  // 21 Feb
  { id: "PO-2026-0221-001", date: "21 Feb 2026", createdAt: "21 Feb 2026, 6:00 AM", settlementDate: "21 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$15,204.60", status: "Completed" },
  { id: "PO-2026-0221-002", date: "21 Feb 2026", createdAt: "21 Feb 2026, 6:00 AM", settlementDate: "21 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$2,945.30", status: "Completed" },
  { id: "PO-2026-0221-003", date: "21 Feb 2026", createdAt: "21 Feb 2026, 6:00 AM", settlementDate: "21 Feb 2026", merchantName: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: "$4,310.75", status: "Completed" },
  // 20 Feb — failures and issues
  { id: "PO-2026-0220-001", date: "20 Feb 2026", createdAt: "20 Feb 2026, 6:01 AM", settlementDate: "20 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$6,112.75", status: "Failed", failureReason: "Cuscal gateway timeout — second attempt failed", failureCode: "GATEWAY_TIMEOUT", retryable: true },
  { id: "PO-2026-0220-002", date: "20 Feb 2026", createdAt: "20 Feb 2026, 6:01 AM", settlementDate: "20 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$9,801.00", status: "Ready for Transfer", hold: true },
  { id: "PO-2026-0220-003", date: "20 Feb 2026", createdAt: "20 Feb 2026, 6:01 AM", settlementDate: "20 Feb 2026", merchantName: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: "$1,925.40", status: "Failed", failureReason: "Invalid BSB — bank returned BECS reject code R4", failureCode: "INVALID_BSB", retryable: false },
  // 19 Feb
  { id: "PO-2026-0219-001", date: "19 Feb 2026", createdAt: "19 Feb 2026, 6:00 AM", settlementDate: "19 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$1,420.00", status: "Abandoned" },
  { id: "PO-2026-0219-002", date: "19 Feb 2026", createdAt: "19 Feb 2026, 6:00 AM", settlementDate: "19 Feb 2026", merchantName: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: "$3,780.50", status: "Completed" },
  // 18 Feb
  { id: "PO-2026-0218-001", date: "18 Feb 2026", createdAt: "18 Feb 2026, 6:02 AM", settlementDate: "18 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$22,640.00", status: "Completed" },
  { id: "PO-2026-0218-002", date: "18 Feb 2026", createdAt: "18 Feb 2026, 6:02 AM", settlementDate: "18 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$4,190.25", status: "Completed" },
  { id: "PO-2026-0218-003", date: "18 Feb 2026", createdAt: "18 Feb 2026, 6:02 AM", settlementDate: "18 Feb 2026", merchantName: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: "$11,405.80", status: "Completed" },
  { id: "PO-2026-0218-004", date: "18 Feb 2026", createdAt: "18 Feb 2026, 6:02 AM", settlementDate: "18 Feb 2026", merchantName: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: "$2,870.45", status: "Completed" },
  { id: "PO-2026-0218-005", date: "18 Feb 2026", createdAt: "18 Feb 2026, 6:02 AM", settlementDate: "18 Feb 2026", merchantName: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: "$3,415.90", status: "Completed" },
  // 17 Feb
  { id: "PO-2026-0217-001", date: "17 Feb 2026", createdAt: "17 Feb 2026, 6:00 AM", settlementDate: "17 Feb 2026", merchantName: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: "$5,330.60", status: "Abandoned" },
  { id: "PO-2026-0217-002", date: "17 Feb 2026", createdAt: "17 Feb 2026, 6:00 AM", settlementDate: "17 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$18,920.00", status: "Completed" },
  { id: "PO-2026-0217-003", date: "17 Feb 2026", createdAt: "17 Feb 2026, 6:00 AM", settlementDate: "17 Feb 2026", merchantName: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: "$5,640.30", status: "Completed" },
  { id: "PO-2026-0217-004", date: "17 Feb 2026", createdAt: "17 Feb 2026, 6:00 AM", settlementDate: "17 Feb 2026", merchantName: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: "$9,285.50", status: "Completed" },
  { id: "PO-2026-0217-005", date: "17 Feb 2026", createdAt: "17 Feb 2026, 6:00 AM", settlementDate: "17 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$3,540.80", status: "Completed" },
];

// ─── Per-payout audit logs ───
// ─── Audit log data model ───
// Each entry: { ts, change, initiatedBy, version, note? }
// Events: Payout prepared, Payout approved, Transfer initiated, Transfer completed,
//         Transfer failed, Payout resubmitted, Payout abandoned, Payout returned,
//         Hold status changed
const auditLogs = {
  // ── Ready for Review — just prepared ──
  "PO-2026-0224-001": [
    { ts: "24 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
  ],
  "PO-2026-0224-002": [
    { ts: "24 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
  ],
  "PO-2026-0224-003": [
    { ts: "24 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
  ],
  "PO-2026-0224-004": [
    { ts: "24 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
  ],
  "PO-2026-0224-005": [
    { ts: "24 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
  ],

  // ── Ready for Transfer — approved (positive amount) ──
  "PO-2026-0223-001": [
    { ts: "23 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "23 Feb 2026, 9:45 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2, note: "Reviewed and confirmed amounts." },
  ],
  "PO-2026-0223-002": [
    { ts: "23 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "23 Feb 2026, 10:20 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2, note: "Two transfers will be created (split by bank account)." },
  ],

  // ── Transferring — transfer initiated ──
  "PO-2026-0223-003": [
    { ts: "23 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "23 Feb 2026, 8:30 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2 },
    { ts: "23 Feb 2026, 11:00 AM", change: "Transfer initiated", initiatedBy: "Sarah Chen", version: 3 },
  ],
  "PO-2026-0223-004": [
    { ts: "23 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "23 Feb 2026, 9:15 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2 },
    { ts: "23 Feb 2026, 11:30 AM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 3 },
  ],

  // ── Completed — full lifecycle (positive amount) ──
  "PO-2026-0222-001": [
    { ts: "22 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "22 Feb 2026, 9:10 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2 },
    { ts: "22 Feb 2026, 10:00 AM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 3 },
    { ts: "22 Feb 2026, 1:45 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Bella's Boutique) ──
  "PO-2026-0222-003": [
    { ts: "22 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "22 Feb 2026, 9:25 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2 },
    { ts: "22 Feb 2026, 10:10 AM", change: "Transfer initiated", initiatedBy: "Sarah Chen", version: 3 },
    { ts: "22 Feb 2026, 2:15 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — approved with zero amount (auto-completed) ──
  "PO-2026-0222-002": [
    { ts: "22 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "22 Feb 2026, 9:30 AM", change: "Payout approved (zero balance)", initiatedBy: "Sarah Chen", version: 2, note: "Zero-balance payout — no transfer required." },
  ],

  // ── Completed — approved with debt deferral (negative balance) ──
  "PO-2026-0221-001": [
    { ts: "21 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "21 Feb 2026, 10:15 AM", change: "Payout approved (debt deferral)", initiatedBy: "Sarah Chen", version: 2, note: "Negative balance — debt deferred to next cycle." },
  ],

  // ── Completed — full lifecycle (Joe's Coffee, 21 Feb) ──
  "PO-2026-0221-002": [
    { ts: "21 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "21 Feb 2026, 8:50 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2 },
    { ts: "21 Feb 2026, 9:30 AM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 3 },
    { ts: "21 Feb 2026, 12:20 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Coastal Surf Shop, 21 Feb) ──
  "PO-2026-0221-003": [
    { ts: "21 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "21 Feb 2026, 9:10 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2, note: "Amounts verified against DTE totals." },
    { ts: "21 Feb 2026, 10:00 AM", change: "Transfer initiated", initiatedBy: "Sarah Chen", version: 3 },
    { ts: "21 Feb 2026, 1:40 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Coastal Surf Shop, 19 Feb) ──
  "PO-2026-0219-002": [
    { ts: "19 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "19 Feb 2026, 8:40 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2 },
    { ts: "19 Feb 2026, 9:15 AM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 3 },
    { ts: "19 Feb 2026, 11:50 AM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Joe's Coffee, 18 Feb) ──
  "PO-2026-0218-002": [
    { ts: "18 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "18 Feb 2026, 8:20 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2 },
    { ts: "18 Feb 2026, 9:10 AM", change: "Transfer initiated", initiatedBy: "Sarah Chen", version: 3 },
    { ts: "18 Feb 2026, 12:30 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Fresh Mart, 18 Feb) ──
  "PO-2026-0218-003": [
    { ts: "18 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "18 Feb 2026, 8:35 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2, note: "Large settlement — double-checked transaction breakdown." },
    { ts: "18 Feb 2026, 9:20 AM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 3 },
    { ts: "18 Feb 2026, 1:10 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Coastal Surf Shop, 18 Feb) ──
  "PO-2026-0218-004": [
    { ts: "18 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "18 Feb 2026, 8:45 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2 },
    { ts: "18 Feb 2026, 9:30 AM", change: "Transfer initiated", initiatedBy: "Sarah Chen", version: 3 },
    { ts: "18 Feb 2026, 12:45 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Bella's Boutique, 18 Feb) ──
  "PO-2026-0218-005": [
    { ts: "18 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "18 Feb 2026, 9:00 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2 },
    { ts: "18 Feb 2026, 9:45 AM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 3 },
    { ts: "18 Feb 2026, 1:20 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Mike's Electronics, 17 Feb) ──
  "PO-2026-0217-002": [
    { ts: "17 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "17 Feb 2026, 8:30 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2, note: "High-value payout — verified against daily limits." },
    { ts: "17 Feb 2026, 9:15 AM", change: "Transfer initiated", initiatedBy: "Sarah Chen", version: 3 },
    { ts: "17 Feb 2026, 12:50 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Coastal Surf Shop, 17 Feb) ──
  "PO-2026-0217-003": [
    { ts: "17 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "17 Feb 2026, 9:05 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2 },
    { ts: "17 Feb 2026, 9:50 AM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 3 },
    { ts: "17 Feb 2026, 1:30 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Fresh Mart, 17 Feb) ──
  "PO-2026-0217-004": [
    { ts: "17 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "17 Feb 2026, 8:55 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2 },
    { ts: "17 Feb 2026, 9:40 AM", change: "Transfer initiated", initiatedBy: "Sarah Chen", version: 3 },
    { ts: "17 Feb 2026, 12:15 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Completed — full lifecycle (Joe's Coffee, 17 Feb) ──
  "PO-2026-0217-005": [
    { ts: "17 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "17 Feb 2026, 9:20 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2 },
    { ts: "17 Feb 2026, 10:05 AM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 3 },
    { ts: "17 Feb 2026, 1:55 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
  ],

  // ── Failed — retryable then non-retryable ──
  "PO-2026-0220-001": [
    { ts: "20 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "20 Feb 2026, 10:30 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2 },
    { ts: "20 Feb 2026, 11:15 AM", change: "Transfer initiated", initiatedBy: "Sarah Chen", version: 3 },
    { ts: "20 Feb 2026, 11:15 AM", change: "Transfer failed (retryable)", initiatedBy: "System", version: 4 },
    { ts: "20 Feb 2026, 12:00 PM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 5, note: "Retry after gateway timeout." },
    { ts: "20 Feb 2026, 12:02 PM", change: "Transfer failed (non-retryable)", initiatedBy: "System", version: 6 },
  ],

  // ── Failed — with resubmit ──
  "PO-2026-0220-003": [
    { ts: "20 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "20 Feb 2026, 11:00 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2 },
    { ts: "20 Feb 2026, 12:30 PM", change: "Transfer initiated", initiatedBy: "Tom Wright", version: 3 },
    { ts: "20 Feb 2026, 12:35 PM", change: "Transfer failed (non-retryable)", initiatedBy: "System", version: 4 },
    { ts: "20 Feb 2026, 2:00 PM", change: "Payout resubmitted", initiatedBy: "Tom Wright", version: 5, note: "Root cause resolved — BSB corrected by merchant." },
  ],

  // ── Ready for Transfer with hold (payout-level manual + auto) ──
  "PO-2026-0220-002": [
    { ts: "20 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "20 Feb 2026, 9:00 AM", change: "Payout approved", initiatedBy: "Tom Wright", version: 2 },
    { ts: "20 Feb 2026, 9:45 AM", change: "Manual progression hold placed", initiatedBy: "Sarah Chen", version: 3, note: "Holding for compliance review — large transaction flagged." },
    { ts: "20 Feb 2026, 3:30 PM", change: "Auto progression hold placed", initiatedBy: "System", version: 4 },
  ],

  // ── Abandoned ──
  "PO-2026-0219-001": [
    { ts: "19 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "19 Feb 2026, 11:00 AM", change: "Payout abandoned", initiatedBy: "Tom Wright", version: 2, note: "Merchant requested payout deferral to next cycle." },
  ],
  "PO-2026-0217-001": [
    { ts: "17 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "17 Feb 2026, 3:00 PM", change: "Payout abandoned", initiatedBy: "Sarah Chen", version: 2, note: "Duplicate — merchant already paid via manual bank transfer." },
  ],

  // ── Returned — completed then NPP return ──
  "PO-2026-0218-001": [
    { ts: "18 Feb 2026, 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
    { ts: "18 Feb 2026, 8:00 AM", change: "Payout approved", initiatedBy: "Sarah Chen", version: 2 },
    { ts: "18 Feb 2026, 9:00 AM", change: "Transfer initiated", initiatedBy: "Sarah Chen", version: 3 },
    { ts: "18 Feb 2026, 12:00 PM", change: "Transfer completed", initiatedBy: "System", version: 4 },
    { ts: "19 Feb 2026, 10:30 AM", change: "Payout returned", initiatedBy: "System", version: 5 },
  ],
};

// Fallback audit log for payouts without a specific log
const defaultAuditLog = (payout) => [
  { ts: payout.date + ", 6:00 AM", change: "Payout prepared", initiatedBy: "System", version: 1 },
];


// ─── Adjustments — expanded ───
// initiatedBy: FinOps username (manual) | "System" (auto-generated)
// entryType: null (default) | "Debt deferral" (system negative) | "Debt rollover" (system balancing positive)
// System-initiated negative amounts always come in pairs: Debt deferral (negative) + Debt rollover (positive)
const mockAdjustments = [
  { id: "ADJ-2026-0224-001", date: "24 Feb 2026", requestedSettlementDate: "28 Feb 2026", amount: "$350.00", initiatedBy: "Tom Wright", entryType: null, payoutId: "PO-2026-0224-001", internalNote: "Chargeback CB-88210 was resolved in merchant's favour. Returning deducted amount." },
  { id: "ADJ-2026-0223-001", date: "23 Feb 2026", requestedSettlementDate: "25 Feb 2026", amount: "$125.00", initiatedBy: "Sarah Chen", entryType: null, payoutId: "PO-2026-0223-001", internalNote: "Customer complained about delayed settlement on 3 transactions. Approved by ops manager." },
  { id: "ADJ-2026-0223-002a", date: "23 Feb 2026", requestedSettlementDate: "23 Feb 2026", amount: "-$82.30", initiatedBy: "System", entryType: "Debt deferral", payoutId: "PO-2026-0223-002", linkedAdjId: "ADJ-2026-0223-002b", internalNote: "Visa scheme fee rebate for Q4 2025 applied automatically. Ref: VSR-2026-Q4-0012." },
  { id: "ADJ-2026-0223-002b", date: "23 Feb 2026", requestedSettlementDate: "23 Feb 2026", amount: "$82.30", initiatedBy: "System", entryType: "Debt rollover", payoutId: "PO-2026-0223-002", linkedAdjId: "ADJ-2026-0223-002a", internalNote: "Balancing entry for ADJ-2026-0223-002a. Visa scheme fee rebate rollover." },
  { id: "ADJ-2026-0222-001a", date: "22 Feb 2026", requestedSettlementDate: "22 Feb 2026", amount: "-$45.50", initiatedBy: "System", entryType: "Debt deferral", payoutId: "PO-2026-0222-001", linkedAdjId: "ADJ-2026-0222-001b", internalNote: "Surcharge fee was incorrectly applied at 1.5% instead of 1.2% on 6 transactions." },
  { id: "ADJ-2026-0222-001b", date: "22 Feb 2026", requestedSettlementDate: "22 Feb 2026", amount: "$45.50", initiatedBy: "System", entryType: "Debt rollover", payoutId: "PO-2026-0222-001", linkedAdjId: "ADJ-2026-0222-001a", internalNote: "Balancing entry for ADJ-2026-0222-001a. Surcharge fee correction rollover." },
  { id: "ADJ-2026-0222-002", date: "22 Feb 2026", requestedSettlementDate: "24 Feb 2026", amount: "$500.00", initiatedBy: "Tom Wright", entryType: null, payoutId: "PO-2026-0222-002", internalNote: "Merchant claimed $500 missing from settlement. Investigation found amounts correct — merchant miscounted transactions." },
  { id: "ADJ-2026-0221-001", date: "21 Feb 2026", requestedSettlementDate: "25 Feb 2026", amount: "$200.00", initiatedBy: "Sarah Chen", entryType: null, payoutId: "PO-2026-0221-002", internalNote: "Part of Feb 2026 onboarding promotion. Reference: PROMO-FEB26-COFFEE." },
  { id: "ADJ-2026-0220-001a", date: "20 Feb 2026", requestedSettlementDate: "20 Feb 2026", amount: "-$1,200.00", initiatedBy: "System", entryType: "Debt deferral", payoutId: "PO-2026-0220-001", linkedAdjId: "ADJ-2026-0220-001b", internalNote: "Chargeback CB-77104 — cardholder dispute for unauthorised transaction. Deducted from merchant payout." },
  { id: "ADJ-2026-0220-001b", date: "20 Feb 2026", requestedSettlementDate: "20 Feb 2026", amount: "$1,200.00", initiatedBy: "System", entryType: "Debt rollover", payoutId: "PO-2026-0220-001", linkedAdjId: "ADJ-2026-0220-001a", internalNote: "Balancing entry for ADJ-2026-0220-001a. Chargeback recovery rollover." },
  { id: "ADJ-2026-0218-001", date: "18 Feb 2026", requestedSettlementDate: "20 Feb 2026", amount: "$75.00", initiatedBy: "Tom Wright", entryType: null, payoutId: "PO-2026-0218-001", internalNote: "Terminal rental fee was double-charged in January billing cycle." },
];

// ─── Transactions — expanded ───
const mockTransactions = [
  { id: "txn_001", date: "Monday, February 23 2026, 10:34 AM", status: "Approved", tid: "50112233", channel: "In-store", method: "mastercard", last4: "4829", type: "Purchase", amount: "$142.50", settlementValue: "$140.38", rrn: "401234567890", authCode: "082451", expectedSettlement: "25 Feb 2026" },
  { id: "txn_002", date: "Monday, February 23 2026, 10:12 AM", status: "Approved", tid: "50112233", channel: "In-store", method: "visa", last4: "1677", type: "Purchase", amount: "$89.95", settlementValue: "$88.62", rrn: "401234567891", authCode: "082452", expectedSettlement: "25 Feb 2026" },
  { id: "txn_003", date: "Monday, February 23 2026, 9:48 AM", status: "Declined", tid: "50112234", channel: "In-store", method: "mastercard", last4: "3201", type: "Purchase", amount: "$256.00", settlementValue: "-", rrn: "401234567892", authCode: "-", expectedSettlement: "-" },
  { id: "txn_004", date: "Monday, February 23 2026, 9:15 AM", status: "Approved", tid: "50112233", channel: "Online", method: "visa", last4: "8844", type: "Refund", amount: "-$45.00", settlementValue: "-$44.33", rrn: "401234567893", authCode: "082453", expectedSettlement: "25 Feb 2026" },
  { id: "txn_005", date: "Monday, February 23 2026, 8:52 AM", status: "Approved", tid: "50112234", channel: "In-store", method: "mastercard", last4: "5512", type: "Purchase", amount: "$312.80", settlementValue: "$308.12", rrn: "401234567894", authCode: "082454", expectedSettlement: "25 Feb 2026" },
  { id: "txn_006", date: "Monday, February 23 2026, 8:30 AM", status: "Approved", tid: "50112233", channel: "In-store", method: "visa", last4: "9021", type: "Pre-auth", amount: "$500.00", settlementValue: "-", rrn: "401234567895", authCode: "082455", expectedSettlement: "-" },
  { id: "txn_007", date: "Monday, February 23 2026, 8:15 AM", status: "Approved", tid: "50112233", channel: "In-store", method: "visa", last4: "9021", type: "Pre-auth completion", amount: "$487.50", settlementValue: "$480.19", rrn: "401234567896", authCode: "082456", expectedSettlement: "25 Feb 2026" },
  { id: "txn_008", date: "Sunday, February 22 2026, 5:45 PM", status: "Approved", tid: "50112234", channel: "Online", method: "mastercard", last4: "7788", type: "Purchase", amount: "$67.20", settlementValue: "$66.21", rrn: "401234567897", authCode: "082457", expectedSettlement: "25 Feb 2026" },
  { id: "txn_009", date: "Sunday, February 22 2026, 4:20 PM", status: "Declined", tid: "50112233", channel: "In-store", method: "visa", last4: "0044", type: "Purchase", amount: "$1,200.00", settlementValue: "-", rrn: "401234567898", authCode: "-", expectedSettlement: "-" },
  { id: "txn_010", date: "Sunday, February 22 2026, 3:10 PM", status: "Approved", tid: "50112234", channel: "In-store", method: "mastercard", last4: "6633", type: "Purchase", amount: "$28.50", settlementValue: "$28.08", rrn: "401234567899", authCode: "082458", expectedSettlement: "25 Feb 2026" },
  { id: "txn_011", date: "Sunday, February 22 2026, 1:55 PM", status: "Approved", tid: "50112233", channel: "MOTO", method: "visa", last4: "2200", type: "Purchase", amount: "$199.00", settlementValue: "$196.01", rrn: "401234567900", authCode: "082459", expectedSettlement: "25 Feb 2026" },
  { id: "txn_012", date: "Sunday, February 22 2026, 11:30 AM", status: "Approved", tid: "50112234", channel: "In-store", method: "mastercard", last4: "4411", type: "Void", amount: "$0.00", settlementValue: "-", rrn: "401234567901", authCode: "082460", expectedSettlement: "-" },
];

// ═══════════════════════════════════════════════════════════
// AUDIT LOG TIMELINE (shared)
// ═══════════════════════════════════════════════════════════
function AuditTimeline({ entries }) {
  const reversed = [...entries].reverse();
  const isFail = (c) => c.toLowerCase().includes("failed") || c.toLowerCase().includes("returned");
  return (
    <div className="relative">
      {reversed.map((entry, i) => (
        <div key={i} className="flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${isFail(entry.change) ? "bg-red-500" : i === 0 ? "bg-indigo-500" : "bg-gray-300"}`} />
            {i < reversed.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className={`text-sm font-semibold ${isFail(entry.change) ? "text-red-700" : "text-gray-800"}`}>{entry.change}</span>
              {entry.version && <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">v{entry.version}</span>}
              <span className="text-xs text-gray-400">{entry.ts}</span>
            </div>
            {entry.note && <div className="text-sm text-gray-500 mt-0.5 italic">{entry.note}</div>}
            <div className="text-xs text-gray-400 mt-0.5">by {entry.initiatedBy}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAYOUT DETAIL VIEW
// ═══════════════════════════════════════════════════════════
function PayoutDetailView({ payout, onBack, role, onStatusChange, holdRecords, onCreateHold, onReleaseHold, merchantName, automationConfig, onUpdateAutomationConfig, auditLogState, onAuditAppend }) {
  const { addToast } = useToast();
  const canWrite = role === ROLES.FINOPS_T1;
  const isFailed = payout.status === "Failed";
  const isCompleted = payout.status === "Completed";
  const isAbandoned = payout.status === "Abandoned";
  const isTerminal = isCompleted || isAbandoned;
  const auditLog = (auditLogState && auditLogState[payout.id]) || auditLogs[payout.id] || defaultAuditLog(payout);
  const userName = role === ROLES.FINOPS_T1 ? "Sarah Chen" : "View User";

  // Check if progression is blocked by holds (for holdable statuses)
  const isProgBlocked = !isTerminal && holdRecords && isProgressionBlocked(holdRecords, payout.id, payout.mid, payout.status);
  // For Failed payouts, also check if resubmit should be blocked (progression holds still apply)
  const isResubmitBlocked = isFailed && holdRecords && (isActionBlocked(holdRecords, "approval", payout.id, payout.mid) || isActionBlocked(holdRecords, "begin_transfer", payout.id, payout.mid));

  // Dialog states
  const [showApprove, setShowApprove] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);
  const [showResubmit, setShowResubmit] = useState(false);
  const [showHolds, setShowHolds] = useState(false);

  // Build actions based on status and holds
  const buildActions = () => {
    // Terminal states have no actions
    if (isTerminal) return [];
    // If progression is blocked by holds, no status change actions (abandon only available at Ready for Review)
    if (isProgBlocked) return payout.status === "Ready for Review"
      ? [{ label: "Abandon", icon: Icons.Ban, variant: "outline", colorScheme: "error", action: () => setShowAbandon(true) }]
      : [];
    const map = {
      "Ready for Review": [
        { label: "Approve", icon: Icons.Check, variant: "solid", colorScheme: "brand", action: () => setShowApprove(true) },
        { label: "Abandon", icon: Icons.Ban, variant: "outline", colorScheme: "error", action: () => setShowAbandon(true) },
      ],
      "Ready for Transfer": [
        { label: "Begin transfer", icon: Icons.Play, variant: "solid", colorScheme: "brand", action: () => setShowTransfer(true) },
      ],
      "Failed": [
        ...(!isResubmitBlocked ? [{ label: "Resubmit", icon: Icons.Refresh, variant: "solid", colorScheme: "brand", action: () => setShowResubmit(true) }] : []),
      ],
    };
    return map[payout.status] || [];
  };
  const currentActions = buildActions();

  const handleApprove = () => {
    addToast({ type: "success", title: "Payout approved", message: `${payout.id} is now ready for transfer.` });
    if (onAuditAppend) onAuditAppend(payout.id, { change: "Payout approved", initiatedBy: userName });
    onStatusChange(payout.id, "Ready for Transfer");
  };
  const handleBeginTransfer = () => {
    addToast({ type: "success", title: "Transfer initiated", message: `Payout ${payout.id} is now transferring to the merchant's bank.` });
    if (onAuditAppend) onAuditAppend(payout.id, { change: "Transfer initiated", initiatedBy: userName });
    onStatusChange(payout.id, "Transferring");
  };
  const handleResubmit = () => {
    addToast({ type: "success", title: "Payout resubmitted", message: `${payout.id} has been moved back to Ready for Transfer.` });
    if (onAuditAppend) onAuditAppend(payout.id, { change: "Payout resubmitted", initiatedBy: userName });
    onStatusChange(payout.id, "Ready for Transfer");
  };
  const handleAbandon = () => {
    addToast({ type: "error", title: "Payout abandoned", message: `${payout.id} has been abandoned. Transactions returned to ledger.` });
    if (onAuditAppend) onAuditAppend(payout.id, { change: "Payout abandoned", initiatedBy: userName });
    onStatusChange(payout.id, "Abandoned");
  };

  return (
    <div className="p-6 space-y-5">
      <ApprovePayoutDialog open={showApprove} onClose={() => setShowApprove(false)} payout={payout} onConfirm={handleApprove} />
      <BeginTransferDialog open={showTransfer} onClose={() => setShowTransfer(false)} payout={payout} onConfirm={handleBeginTransfer} />
      <ResubmitPayoutDialog open={showResubmit} onClose={() => setShowResubmit(false)} payout={payout} onConfirm={handleResubmit} />
      <AbandonPayoutDialog open={showAbandon} onClose={() => setShowAbandon(false)} payout={payout} onConfirm={handleAbandon} />
      <HoldsDialog open={showHolds} onClose={() => setShowHolds(false)} level="payout" entity={payout.id} entityLabel={`Payout ${payout.id}`} mid={payout.mid} holdRecords={holdRecords} onCreateHold={(holdRecord) => { onCreateHold(holdRecord); if (onAuditAppend && holdRecord.phase === "approval") onAuditAppend(payout.id, { change: `${holdRecord.trigger === "manual" ? "Manual" : "Auto"} progression hold placed`, initiatedBy: userName }); }} onReleaseHold={(holdId) => { onReleaseHold(holdId); if (onAuditAppend) { const h = holdRecords.find(r => r.id === holdId); if (h && h.phase === "approval") onAuditAppend(payout.id, { change: `${h.trigger === "manual" ? "Manual" : "Auto"} progression hold released`, initiatedBy: userName }); } }} automationConfig={automationConfig} onUpdateAutomationConfig={onUpdateAutomationConfig} canWrite={canWrite} />

      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"><Icons.ChevronLeft /> Back to payouts</button>

      <ActiveHoldBanners holdRecords={holdRecords} level="payout" entity={payout.id} mid={payout.mid} merchantName={merchantName || payout.merchantName} automationConfig={automationConfig} />

      {isFailed && (<Alert type="error" title="Payout failed">This payout has failed. Check the audit log for more information.</Alert>)}
      {isAbandoned && (<Alert type="warning" title="Payout abandoned">This payout has been permanently abandoned. All transactions have been returned to the ledger and will be allocated to the next payout preparation.</Alert>)}

      {role === ROLES.FINOPS_T2 && (<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-500"><Icons.Eye /> <span>You have read-only access. Contact a FinOps Administrator user to perform actions.</span></div>)}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3"><span className="text-lg font-semibold text-gray-800">Payout {payout.id}</span><PayoutStatusBadge status={payout.status} hold={payout.hold} amount={payout.amount} holdRecords={holdRecords} payoutId={payout.id} mid={payout.mid} automationConfig={automationConfig} /></div>
          <div className="flex items-center gap-2">
            {canWrite && currentActions.length > 0 && currentActions.map((a) => (<Button key={a.label} variant={a.variant} colorScheme={a.colorScheme} size="sm" leftIcon={<a.icon />} onClick={a.action}>{a.label}</Button>))}
            {!canWrite && currentActions.length > 0 && currentActions.map((a) => (<Button key={a.label} variant={a.variant} colorScheme={a.colorScheme} size="sm" leftIcon={<a.icon />} disabled>{a.label}</Button>))}
            {HOLDABLE_STATUSES.has(payout.status) && canWrite && <Button variant="outline" colorScheme="neutral" size="sm" leftIcon={<Icons.Shield />} onClick={() => setShowHolds(true)}>Holds</Button>}
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-4">
            {[["Payout ID", <span className="font-mono">{payout.id}</span>], ["Created", payout.createdAt || payout.date], ["Requested settlement date", payout.settlementDate || payout.date], ["Merchant", payout.merchantName], ["MID", <Badge colorScheme="neutral" size="sm">{payout.mid}</Badge>], ["Payout amount", <span className="font-semibold text-gray-900">{payout.amount}</span>]].map(([label, value]) => (
              <div key={label} className="contents"><div className="text-sm font-semibold text-gray-500">{label}</div><div className="text-sm text-gray-700 flex items-center">{value}</div></div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card><CardHeader><span className="text-lg font-semibold text-gray-800">Audit log</span></CardHeader><Divider /><CardBody className="pt-4"><AuditTimeline entries={auditLog} /></CardBody></Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PREPARE PAYOUT DIALOG
// ═══════════════════════════════════════════════════════════
// Mock unsettled DTE files — one file per merchant per date.
// If a payout is not prepared, DTE files accumulate across dates.
const mockUnassignedMLEs = [
  // 25 Feb — today's DTE files (just ingested)
  { id: "DTE-20260225-12345", date: "2026-02-25", merchant: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: 987.75, txnCount: 14 },
  { id: "DTE-20260225-12346", date: "2026-02-25", merchant: "Mike's Electronics", mid: "POSPAY00012346", amount: 2591.75, txnCount: 8 },
  { id: "DTE-20260225-12347", date: "2026-02-25", merchant: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: 460.40, txnCount: 6 },
  { id: "DTE-20260225-12348", date: "2026-02-25", merchant: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: 674.75, txnCount: 5 },
  { id: "DTE-20260225-12349", date: "2026-02-25", merchant: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: 471.50, txnCount: 3 },
  // 24 Feb — not yet prepared, accumulating
  { id: "DTE-20260224-12345", date: "2026-02-24", merchant: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: 1064.05, txnCount: 18 },
  { id: "DTE-20260224-12348", date: "2026-02-24", merchant: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: 674.75, txnCount: 7 },
  { id: "DTE-20260224-12349", date: "2026-02-24", merchant: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: 342.90, txnCount: 4 },
  // 23 Feb — older unprepared DTE files (accumulated)
  { id: "DTE-20260223-12347", date: "2026-02-23", merchant: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: 445.10, txnCount: 5 },
  { id: "DTE-20260223-12346", date: "2026-02-23", merchant: "Mike's Electronics", mid: "POSPAY00012346", amount: 2150.00, txnCount: 6 },
];

// Mock unsettled chargebacks — pending chargebacks that will be included in payout calculation
// ─── Mock payout breakdown data (mirrors API shape) ───
// Per-MID unsettled breakdown: { source, amount, count }
// ADJUSTMENTS = rollovers from previous cycles + manual adjustments only.
// Debt deferrals are NOT included — they are created at approval time when txns + chargebacks < 0.
const mockMidBreakdowns = {
  "POSPAY00012345": [
    { source: "TRANSACTIONS", amount: 12450.00, count: 120 },
    { source: "CHARGEBACKS", amount: -205.50, count: 2 },
    { source: "ADJUSTMENTS", amount: 150.00, count: 1 },  // manual adj: resolved chargeback
  ],
  "POSPAY00012346": [
    { source: "TRANSACTIONS", amount: 8320.00, count: 87 },
    { source: "CHARGEBACKS", amount: -350.00, count: 1 },
    { source: "ADJUSTMENTS", amount: -200.00, count: 1 },  // manual adj: scheme fee correction
  ],
  "POSPAY00012347": [
    { source: "TRANSACTIONS", amount: 320.00, count: 15 },
    { source: "CHARGEBACKS", amount: -880.40, count: 3 },
    { source: "ADJUSTMENTS", amount: 560.40, count: 1 },  // rollover from previous cycle's debt deferral
    // txns + chargebacks = -560.40 → adjustment balances it to $0 → debt deferral scenario
  ],
  "POSPAY00012348": [
    { source: "TRANSACTIONS", amount: 5610.00, count: 42 },
    { source: "CHARGEBACKS", amount: -42.00, count: 1 },
    { source: "ADJUSTMENTS", amount: 0, count: 0 },
  ],
  "POSPAY00012349": [
    { source: "TRANSACTIONS", amount: 3200.00, count: 31 },
    { source: "CHARGEBACKS", amount: 0, count: 0 },
    { source: "ADJUSTMENTS", amount: 75.00, count: 1 },  // manual adj: terminal fee refund
  ],
};

function getPayoutBreakdown(mid) {
  const breakdown = mockMidBreakdowns[mid] || [
    { source: "TRANSACTIONS", amount: 0, count: 0 },
    { source: "CHARGEBACKS", amount: 0, count: 0 },
    { source: "ADJUSTMENTS", amount: 0, count: 0 },
  ];
  const total_amount = breakdown.reduce((s, b) => s + b.amount, 0);
  const total_count = breakdown.reduce((s, b) => s + b.count, 0);
  return { total_amount, total_count, breakdown };
}

// ─── Payout Preview Component ───
function PayoutPreviewBreakdown({ breakdown }) {
  const txn = breakdown.breakdown.find(b => b.source === "TRANSACTIONS") || { amount: 0, count: 0 };
  const cb = breakdown.breakdown.find(b => b.source === "CHARGEBACKS") || { amount: 0, count: 0 };
  const adj = breakdown.breakdown.find(b => b.source === "ADJUSTMENTS") || { amount: 0, count: 0 };
  const payoutTotal = breakdown.total_amount;
  const isZeroOrNegative = payoutTotal <= 0;

  const fmt = (v) => {
    const sign = v < 0 ? "-" : "";
    return `${sign}$${Math.abs(v).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payout preview</div>
      <div className="divide-y divide-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-800">Transactions</div>
            <div className="text-xs text-gray-400">{txn.count} transaction{txn.count !== 1 ? "s" : ""}</div>
          </div>
          <span className={`text-sm font-semibold ${txn.amount >= 0 ? "text-gray-900" : "text-red-600"}`}>{fmt(txn.amount)}</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-800">Chargebacks</div>
            {cb.count > 0 && <div className="text-xs text-gray-400">{cb.count} chargeback{cb.count !== 1 ? "s" : ""}</div>}
          </div>
          <span className={`text-sm font-semibold ${cb.amount < 0 ? "text-red-600" : "text-gray-900"}`}>{cb.count > 0 ? fmt(cb.amount) : "$0.00"}</span>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-800">Adjustments</div>
            {adj.count > 0 && <div className="text-xs text-gray-400">{adj.count} adjustment{adj.count !== 1 ? "s" : ""}</div>}
          </div>
          <span className={`text-sm font-semibold ${adj.amount < 0 ? "text-red-600" : adj.amount > 0 ? "text-emerald-600" : "text-gray-900"}`}>{adj.count > 0 ? fmt(adj.amount) : "$0.00"}</span>
        </div>
        <div className={`px-4 py-3 flex items-center justify-between ${isZeroOrNegative ? "bg-amber-50" : "bg-emerald-50"}`}>
          <div>
            <div className="text-sm font-bold text-gray-900">Payout Total</div>
            {isZeroOrNegative && <div className="text-xs text-amber-600 font-medium mt-0.5">Zero-balance — debt deferral applies</div>}
          </div>
          <span className={`text-base font-bold ${isZeroOrNegative ? "text-amber-700" : "text-emerald-700"}`}>{fmt(payoutTotal)}</span>
        </div>
      </div>
    </div>
  );
}

function PreparePayoutDialog({ open, onClose, onCreatePayouts, unassignedMLEs: mlePool }) {
  const allMLEs = mlePool || mockUnassignedMLEs;
  const [settlementDate, setSettlementDate] = useState("");
  const [selectedMids, setSelectedMids] = useState(new Set());
  const [expandedMid, setExpandedMid] = useState(null);
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 7);
  const maxDateStr = maxDate.toISOString().split("T")[0];
  const hasDate = settlementDate !== "";
  const cutoffDate = settlementDate;
  const filteredDTEs = hasDate ? allMLEs.filter((dte) => dte.date <= cutoffDate) : [];

  // Group by merchant
  const merchantGroups = {};
  filteredDTEs.forEach((dte) => {
    if (!merchantGroups[dte.mid]) merchantGroups[dte.mid] = { merchant: dte.merchant, mid: dte.mid, dteFiles: [], txnCount: 0 };
    merchantGroups[dte.mid].dteFiles.push(dte);
    merchantGroups[dte.mid].txnCount += dte.txnCount || 0;
  });
  // Enrich with API-shaped breakdown
  Object.values(merchantGroups).forEach((g) => {
    g.breakdown = getPayoutBreakdown(g.mid);
    g.payoutTotal = g.breakdown.total_amount;
  });
  const allGroups = Object.values(merchantGroups);
  const selectedGroups = allGroups.filter((g) => selectedMids.has(g.mid));

  useEffect(() => {
    if (hasDate) setSelectedMids(new Set(allGroups.map((g) => g.mid)));
    else setSelectedMids(new Set());
  }, [settlementDate, filteredDTEs.length]);

  useEffect(() => {
    if (open) { setSettlementDate(""); setCreating(false); setSelectedMids(new Set()); setExpandedMid(null); }
  }, [open]);

  const toggleMid = (mid) => { setSelectedMids((prev) => { const next = new Set(prev); if (next.has(mid)) next.delete(mid); else next.add(mid); return next; }); };
  const selectAll = () => setSelectedMids(new Set(allGroups.map((g) => g.mid)));
  const deselectAll = () => setSelectedMids(new Set());

  const fmt = (v) => { const sign = v < 0 ? "-" : ""; return `${sign}$${Math.abs(v).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`; };

  const handleCreate = () => {
    const errs = {};
    if (!hasDate) errs.date = "Settlement date is required.";
    if (hasDate && selectedGroups.length === 0) errs.merchants = "Select at least one merchant.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setCreating(true);
    setTimeout(() => {
      const today = new Date();
      const dateStr = today.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
      const timeStr = today.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
      const createdAt = `${dateStr}, ${timeStr}`;
      const newPayouts = selectedGroups.map((g, i) => ({
        id: `PO-2026-0225-${String(i + 1).padStart(3, "0")}`,
        date: dateStr,
        createdAt,
        settlementDate: new Date(settlementDate).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }),
        merchantName: g.merchant,
        mid: g.mid,
        amount: fmt(g.payoutTotal),
        status: g.payoutTotal <= 0 ? "Completed" : "Ready for Review",
      }));
      onCreatePayouts(newPayouts);
      addToast({ type: "success", title: "Payouts created", message: `${newPayouts.length} new payout${newPayouts.length > 1 ? "s" : ""} prepared.` });
      onClose();
    }, 800);
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Prepare payout" width="max-w-2xl">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Settlement date <span className="text-red-500">*</span></label>
          <input type="date" value={settlementDate} onChange={(e) => { setSettlementDate(e.target.value); setErrors(prev => ({ ...prev, date: undefined })); }} max={maxDateStr} className={`w-full text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 max-w-[240px] ${errors.date ? "border-red-400" : "border-gray-300"}`} />
          {errors.date ? <p className="text-xs text-red-600 mt-1">{errors.date}</p> : <p className="text-xs text-gray-400 mt-1.5">Includes all ledger entries with a requested settlement date on or before this date. Up to 7 days in advance.</p>}
        </div>

        {!hasDate && !errors.date && (
          <div className="border border-gray-200 rounded-lg px-4 py-8 text-center"><p className="text-sm text-gray-400">Select a settlement date to see payout preview.</p></div>
        )}

        {hasDate && (
          <>
            {/* Merchant multi-select with preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Merchants <span className="font-normal text-gray-400">({selectedMids.size} of {allGroups.length} selected)</span></label>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAll} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Select all</button>
                  <span className="text-xs text-gray-300">|</span>
                  <button type="button" onClick={deselectAll} className="text-xs text-gray-500 hover:text-gray-700 font-medium">Deselect all</button>
                </div>
              </div>
              {allGroups.length > 0 ? (
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                  {allGroups.map((g) => (
                    <div key={g.mid}>
                      <div className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMids.has(g.mid) ? "bg-indigo-50/50" : ""}`}>
                        <input type="checkbox" checked={selectedMids.has(g.mid)} onChange={() => toggleMid(g.mid)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-200" />
                        <div className="flex-1 min-w-0" onClick={() => setExpandedMid(expandedMid === g.mid ? null : g.mid)}>
                          <div className="text-sm font-medium text-gray-800 truncate">{g.merchant}</div>
                          <div className="text-xs text-gray-400 font-mono">{g.mid} · {g.breakdown.total_count} items</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {g.payoutTotal <= 0 && <Badge colorScheme="warning" size="sm">Zero-bal</Badge>}
                          <span className={`text-sm font-semibold ${g.payoutTotal <= 0 ? "text-amber-700" : "text-gray-900"}`}>{fmt(g.payoutTotal)}</span>
                          <button onClick={() => setExpandedMid(expandedMid === g.mid ? null : g.mid)} className={`text-gray-400 hover:text-gray-600 transition-transform ${expandedMid === g.mid ? "rotate-180" : ""}`}><Icons.ChevronDown /></button>
                        </div>
                      </div>
                      {expandedMid === g.mid && (
                        <div className="px-3 pb-3 pt-0 ml-8">
                          <PayoutPreviewBreakdown breakdown={g.breakdown} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg px-3 py-4 text-center text-sm text-gray-400">No merchants with ledger entries for the selected date.</div>
              )}
            </div>

            {/* Fleet-level summary */}
            {selectedGroups.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Fleet total ({selectedGroups.length} merchant{selectedGroups.length !== 1 ? "s" : ""})</span>
                  <span className="text-base font-bold text-gray-900">{fmt(selectedGroups.reduce((s, g) => s + g.payoutTotal, 0))}</span>
                </div>
                {selectedGroups.some(g => g.payoutTotal <= 0) && (
                  <div className="text-xs text-amber-600 mt-1">{selectedGroups.filter(g => g.payoutTotal <= 0).length} merchant{selectedGroups.filter(g => g.payoutTotal <= 0).length !== 1 ? "s" : ""} with zero/negative balance — will auto-complete</div>
                )}
              </div>
            )}
          </>
        )}

        {errors.merchants && <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"><p className="text-sm text-amber-700">{errors.merchants}</p></div>}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="solid" colorScheme="brand" size="md" disabled={creating} onClick={handleCreate}>
            {creating ? (<span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" /></svg>Creating...</span>) : `Create payout (${selectedMids.size})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// MERCHANT-LEVEL PREPARE PAYOUT (single merchant, with preview)
// ═══════════════════════════════════════════════════════════
function MerchantPreparePayoutDialog({ open, onClose, onCreatePayouts, unassignedMLEs: mlePool, mid, merchantName }) {
  const allMLEs = (mlePool || mockUnassignedMLEs).filter((dte) => dte.mid === mid);
  const [settlementDate, setSettlementDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 7);
  const maxDateStr = maxDate.toISOString().split("T")[0];
  const hasDate = settlementDate !== "";
  const breakdown = hasDate ? getPayoutBreakdown(mid) : null;
  const payoutTotal = breakdown ? breakdown.total_amount : 0;
  const hasEntries = breakdown && breakdown.total_count > 0;

  const fmt = (v) => { const sign = v < 0 ? "-" : ""; return `${sign}$${Math.abs(v).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`; };

  useEffect(() => { if (open) { setSettlementDate(""); setCreating(false); setErrors({}); } }, [open]);

  const handleCreate = () => {
    const errs = {};
    if (!hasDate) errs.date = "Settlement date is required.";
    if (hasDate && !hasEntries) errs.entries = "No ledger entries found for this date.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setCreating(true);
    setTimeout(() => {
      const today = new Date();
      const dateStr = today.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
      const timeStr = today.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: true }).toUpperCase();
      const newPayout = {
        id: `PO-2026-0225-${String(Math.floor(Math.random() * 900) + 100)}`,
        date: dateStr,
        createdAt: `${dateStr}, ${timeStr}`,
        settlementDate: new Date(settlementDate).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }),
        merchantName: merchantName || "Unknown",
        mid,
        amount: fmt(payoutTotal),
        status: payoutTotal <= 0 ? "Completed" : "Ready for Review",
      };
      onCreatePayouts([newPayout]);
      addToast({ type: "success", title: "Payout prepared", message: `${newPayout.id} for ${newPayout.amount} is now ${newPayout.status}.` });
      onClose();
    }, 800);
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Prepare payout" width="max-w-lg">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Icons.Store /><span className="font-medium text-gray-800">{merchantName}</span><Badge colorScheme="neutral" size="sm">{mid}</Badge>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Settlement date <span className="text-red-500">*</span></label>
          <input type="date" value={settlementDate} onChange={(e) => { setSettlementDate(e.target.value); setErrors(prev => ({ ...prev, date: undefined, entries: undefined })); }} max={maxDateStr} className={`w-full text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 max-w-[240px] ${errors.date ? "border-red-400" : "border-gray-300"}`} />
          {errors.date ? <p className="text-xs text-red-600 mt-1">{errors.date}</p> : <p className="text-xs text-gray-400 mt-1.5">Includes all ledger entries with a requested settlement date on or before this date. Up to 7 days in advance.</p>}
        </div>

        {!hasDate && !errors.date && (
          <div className="border border-gray-200 rounded-lg px-4 py-8 text-center"><p className="text-sm text-gray-400">Select a settlement date to see payout preview.</p></div>
        )}

        {hasDate && !hasEntries && (
          <div className={`border rounded-lg px-4 py-8 text-center ${errors.entries ? "border-red-200 bg-red-50" : "border-gray-200"}`}><p className={`text-sm ${errors.entries ? "text-red-600" : "text-gray-400"}`}>No ledger entries found for this date.</p></div>
        )}

        {hasDate && hasEntries && (
          <PayoutPreviewBreakdown breakdown={breakdown} />
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="solid" colorScheme="brand" size="md" disabled={creating} onClick={handleCreate}>
            {creating ? (<span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" /></svg>Creating...</span>) : "Create payout"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// CREATE ADJUSTMENT DIALOG
// ═══════════════════════════════════════════════════════════
function CreateAdjustmentDialog({ open, onClose, onCreateAdjustment, mid }) {
  const [amount, setAmount] = useState("");
  const [settlementDate, setSettlementDate] = useState("");
  const [info, setInfo] = useState("");
  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  // Date bounds: unlimited past, 7 days future
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 7);
  const maxDateStr = maxDate.toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  useEffect(() => { if (open) { setAmount(""); setSettlementDate(todayStr); setInfo(""); setCreating(false); setErrors({}); } }, [open]);

  const handleCreate = () => {
    const errs = {};
    if (!amount || isNaN(parseFloat(amount))) errs.amount = "A valid amount is required.";
    if (!info.trim()) errs.info = "Internal note is required.";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setCreating(true);
    setTimeout(() => {
      const today = new Date();
      const dateStr = today.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
      const num = String(Math.floor(Math.random() * 900) + 100);
      const parsedAmt = parseFloat(amount);
      const selDate = settlementDate ? new Date(settlementDate + "T00:00:00") : today;
      const reqSettDateStr = selDate.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
      const newAdj = {
        id: `ADJ-2026-${dateStr.replace(/\s/g, "").slice(0, 4)}-${num}`,
        date: dateStr,
        requestedSettlementDate: reqSettDateStr,
        amount: `${parsedAmt < 0 ? "-" : ""}$${Math.abs(parsedAmt).toLocaleString("en-AU", { minimumFractionDigits: 2 })}`,
        initiatedBy: "Tom Wright",
        entryType: null,
        payoutId: "—",
        internalNote: info,
        mid: mid || "POSPAY00012345",
      };
      onCreateAdjustment(newAdj);
      addToast({ type: "info", title: "Adjustment created", message: `${newAdj.id} for ${newAdj.amount} has been created.` });
      onClose();
    }, 500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Create adjustment">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">AUD</span>
            <input type="text" value={amount} onChange={(e) => { setAmount(e.target.value); if (errors.amount) setErrors(prev => ({ ...prev, amount: undefined })); }} placeholder="e.g. 125.00 or -45.50" className={`w-full text-sm border rounded-lg pl-12 pr-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 ${errors.amount ? "border-red-400" : "border-gray-300"}`} />
          </div>
          {errors.amount ? <p className="text-xs text-red-600 mt-1">{errors.amount}</p> : (() => {
            const parsed = parseFloat(amount);
            if (!amount || isNaN(parsed) || parsed === 0) return null;
            const abs = Math.abs(parsed).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (parsed < 0) return <p className="text-xs text-amber-600 mt-1">The merchant will receive an amount of <span className="font-semibold">${abs}</span> less.</p>;
            return <p className="text-xs text-emerald-600 mt-1">The merchant will receive an extra amount of <span className="font-semibold">${abs}</span>.</p>;
          })()}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Requested settlement date</label>
          <input type="date" value={settlementDate} onChange={(e) => setSettlementDate(e.target.value)} max={maxDateStr} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
          <p className="text-xs text-gray-400 mt-1">The adjustment will be included in a payout with a settlement date on or after this date. Up to 7 days in advance.</p>
        </div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Internal note <span className="text-red-500">*</span></label><textarea value={info} onChange={(e) => { setInfo(e.target.value); if (errors.info) setErrors(prev => ({ ...prev, info: undefined })); }} maxLength={500} rows={3} placeholder="Internal context for FinOps team (not shown to merchant)..." className={`w-full text-sm border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none ${errors.info ? "border-red-400" : info.length >= 500 ? "border-red-400" : "border-gray-300"}`} />{errors.info ? <p className="text-xs text-red-600 mt-1">{errors.info}</p> : <p className={`text-xs mt-1 ${info.length >= 450 ? (info.length >= 500 ? "text-red-500 font-medium" : "text-amber-500") : "text-gray-400"}`}>{info.length}/500 characters{info.length >= 500 ? " — limit reached" : ""}</p>}</div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="solid" colorScheme="brand" size="md" disabled={creating} onClick={handleCreate} leftIcon={creating ? null : <Icons.Plus />}>
            {creating ? (<span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" /></svg>Creating...</span>) : "Create adjustment"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// ADJUSTMENT DETAIL VIEW
// ═══════════════════════════════════════════════════════════
function AdjustmentDetailView({ adj, onBack }) {
  const isSystem = adj.initiatedBy === "System";
  const auditEntries = isSystem ? [
    { ts: adj.date + ", 6:00 AM", change: "Adjustment auto-generated", initiatedBy: "System", version: 1, note: `${adj.entryType || "Adjustment"} of ${adj.amount} created during payout preparation.` },
    ...(adj.linkedAdjId ? [{ ts: adj.date + ", 6:00 AM", change: "Linked adjustment created", initiatedBy: "System", version: 2, note: `Balancing entry ${adj.linkedAdjId} generated.` }] : []),
  ] : [
    { ts: adj.date + ", 10:00 AM", change: "Adjustment created", initiatedBy: adj.initiatedBy, version: 1, note: adj.internalNote || undefined },
  ];

  return (
    <div className="p-6 space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"><Icons.ChevronLeft /> Back to adjustments</button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3"><span className="text-lg font-semibold text-gray-800">Adjustment {adj.id}</span></div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-4">
            {[["Adjustment ID", <span className="font-mono">{adj.id}</span>], ["Date created", adj.date], ["Requested settlement date", adj.requestedSettlementDate || "—"], ["Amount", <span className={`font-semibold ${adj.amount.startsWith("-") ? "text-red-600" : "text-emerald-600"}`}>{adj.amount}</span>], ["Initiated by", adj.initiatedBy === "System" ? <Badge colorScheme="neutral" size="sm">System</Badge> : adj.initiatedBy], ["Type", adj.entryType ? <Badge colorScheme={adj.entryType === "Debt deferral" ? "error" : "success"} size="sm">{adj.entryType}</Badge> : <Badge colorScheme="brand" size="sm">Generic</Badge>], ...(adj.linkedAdjId ? [["Linked adjustment", <span className="font-mono text-indigo-600">{adj.linkedAdjId}</span>]] : []), ["Associated payout", <span className="font-mono text-indigo-600">{adj.payoutId}</span>]].map(([label, value]) => (
              <div key={label} className="contents"><div className="text-sm font-semibold text-gray-500">{label}</div><div className="text-sm text-gray-700 flex items-center">{value}</div></div>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <div><h4 className="text-sm font-semibold text-gray-700 mb-1">Internal note</h4><div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">{adj.internalNote}</div></div>
          </div>
        </CardBody>
      </Card>
      <Card><CardHeader><span className="text-lg font-semibold text-gray-800">Audit log</span></CardHeader><Divider />
        <CardBody className="pt-4"><AuditTimeline entries={auditEntries} /></CardBody>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MERCHANT ADJUSTMENTS TAB
// ═══════════════════════════════════════════════════════════
function MerchantAdjustmentsTab({ role, mid }) {
  const [adjustments, setAdjustments] = useState([...mockAdjustments]);
  const [selectedAdj, setSelectedAdj] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const canWrite = role === ROLES.FINOPS_T1;
  const PAGE_SIZE = 20;

  const [settlementFrom, setSettlementFrom] = useState("");
  const [settlementTo, setSettlementTo] = useState("");

  const hasActiveFilters = settlementFrom || settlementTo;
  const clearAll = () => { setSettlementFrom(""); setSettlementTo(""); setCurrentPage(1); };

  const handleCreate = (newAdj) => { setAdjustments((prev) => [newAdj, ...prev]); setCurrentPage(1); };

  // Filter
  let filtered = adjustments;
  if (settlementFrom || settlementTo) filtered = filtered.filter(a => dateInRange(a.requestedSettlementDate, settlementFrom, settlementTo));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedAdj = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Keep selectedAdj in sync
  const currentAdj = selectedAdj ? adjustments.find((a) => a.id === selectedAdj.id) || selectedAdj : null;
  if (currentAdj) return <AdjustmentDetailView adj={currentAdj} onBack={() => setSelectedAdj(null)} />;

  return (
    <div className="p-6 space-y-5">
      <CreateAdjustmentDialog open={showCreate} onClose={() => setShowCreate(false)} onCreateAdjustment={handleCreate} mid={mid} />

      {role === ROLES.FINOPS_T2 && (<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-500"><Icons.Eye /> <span>Read-only access. You can view adjustments but cannot create them.</span></div>)}

      <div className="flex items-center gap-3 flex-wrap">
        <SettlementDateRangePicker from={settlementFrom} to={settlementTo} onChangeFrom={(v) => { setSettlementFrom(v); setCurrentPage(1); }} onChangeTo={(v) => { setSettlementTo(v); setCurrentPage(1); }} onClear={() => { setSettlementFrom(""); setSettlementTo(""); setCurrentPage(1); }} />
      </div>

      <Card>
        <CardHeader>
          <span className="text-lg font-semibold text-gray-800">Adjustments<span className="ml-2 text-sm font-normal text-gray-400">{filtered.length} results</span></span>
          <div className="flex items-center gap-2">
            <Button variant="solid" colorScheme="brand" size="sm" leftIcon={<Icons.Plus />} onClick={() => setShowCreate(true)} disabled={!canWrite}>Create adjustment</Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-4">
          <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-gray-200">
            {["Created", "Settlement date", "Amount", "Initiated by", "Type", "Payout"].map((h) => <TH key={h} right={h === "Amount"}>{h}</TH>)}
          </tr></thead><tbody>
            {paginatedAdj.map((a) => (
                <tr key={a.id} onClick={() => setSelectedAdj(a)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="py-3 px-3 text-sm text-gray-700">{a.date}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">{a.requestedSettlementDate || "—"}</td>
                  <td className={`py-3 px-3 text-sm font-semibold text-right ${a.amount.startsWith("-") ? "text-red-600" : "text-emerald-600"}`}>{a.amount}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">{a.initiatedBy === "System" ? <Badge colorScheme="neutral" size="sm">System</Badge> : a.initiatedBy}</td>
                  <td className="py-3 px-3">{a.entryType ? <Badge colorScheme={a.entryType === "Debt deferral" ? "error" : "success"} size="sm">{a.entryType}</Badge> : <Badge colorScheme="brand" size="sm">Generic</Badge>}</td>
                  <td className="py-3 px-3 text-sm font-mono text-gray-500">{a.payoutId}</td>
                </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-400">No adjustments found.</td></tr>}
          </tbody></table></div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Page {currentPage} of {totalPages} ({filtered.length} results, {PAGE_SIZE} per page)</span>
              <div className="flex gap-2">
                <Button variant="outline" colorScheme="neutral" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" colorScheme="neutral" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FLEET → MERCHANT FACILITY VIEW (shown when clicking a payout from fleet table)
// ═══════════════════════════════════════════════════════════
function FleetMerchantFacilityView({ payout, onBack, role, payouts, onPayoutStatusChange, unassignedMLEs, holdRecords, onCreateHold, onReleaseHold, automationConfig, onUpdateAutomationConfig, auditLogState, onAuditAppend }) {
  const [activeTab, setActiveTab] = useState("payouts");
  const tabs = [{ id: "overview", label: "Overview" }, { id: "terminals", label: "Terminals" }, { id: "transactions", label: "Transactions" }, { id: "payouts", label: "Payouts" }, { id: "adjustments", label: "Adjustments" }, { id: "disputes", label: "Disputes" }];
  const merchantMid = payout.mid || "POSPAY00012345";
  const merchantName = payout.merchantName || "Unknown Merchant";

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100">
          <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"><Icons.ChevronLeft /> <span>Fleet payouts</span></button>
          <span className="text-gray-300 mx-1">|</span>
          <Icons.Store />
          <span className="text-sm font-medium text-indigo-600">POS Pay Pty Ltd</span>
          <Icons.ChevronRight />
          <span className="text-sm font-medium text-gray-800">{merchantName}</span>
          <span className="ml-1"><Badge colorScheme="neutral" size="md">{merchantMid}</Badge></span>
          <span className="ml-1"><Badge colorScheme="success" size="md">Active</Badge></span>
        </div>
        <div className="px-4 py-1 flex gap-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? "bg-indigo-50 text-indigo-700" : "text-[#5D6B98] hover:bg-gray-50 hover:text-gray-700"}`}>{tab.label}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
        {activeTab === "payouts" && (
          <>
            <div className="mx-6 mt-5">
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 border border-indigo-200">
                <Icons.Info />
                <span className="text-sm text-indigo-800">You're viewing this merchant from the fleet-level payouts table.</span>
                <button onClick={onBack} className="ml-auto text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"><Icons.ChevronLeft /> Return to fleet payouts</button>
              </div>
            </div>
            <MerchantPayoutsTab role={role} payouts={payouts} onPayoutStatusChange={onPayoutStatusChange} unassignedMLEs={unassignedMLEs} mid={merchantMid} merchantName={merchantName} holdRecords={holdRecords} onCreateHold={onCreateHold} onReleaseHold={onReleaseHold} automationConfig={automationConfig} onUpdateAutomationConfig={onUpdateAutomationConfig} auditLogState={auditLogState} onAuditAppend={onAuditAppend} />
          </>
        )}
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "terminals" && <TerminalsTab />}
        {activeTab === "transactions" && <TransactionsTab />}
        {activeTab === "adjustments" && <MerchantAdjustmentsTab role={role} mid={merchantMid} />}
        {activeTab === "disputes" && <DisputesTab />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DATE HELPERS
// ═══════════════════════════════════════════════════════════
const normDate = (d) => {
  if (!d) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const clean = d.split(",")[0].trim();
  const parts = clean.split(" ");
  if (parts.length === 3) {
    const months = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
    return `${parts[2]}-${months[parts[1]] || "01"}-${parts[0].padStart(2, "0")}`;
  }
  return d;
};
const dateInRange = (dateStr, from, to) => {
  const d = normDate(dateStr);
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
};

// ═══════════════════════════════════════════════════════════
// SETTLEMENT DATE RANGE PICKER
// ═══════════════════════════════════════════════════════════
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let startDay = first.getDay() - 1; // Monday = 0
  if (startDay < 0) startDay = 6;
  const days = [];
  // previous month fill
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, outside: true });
  }
  // current month
  for (let i = 1; i <= last.getDate(); i++) {
    days.push({ date: new Date(year, month, i), outside: false });
  }
  // next month fill to complete grid
  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), outside: true });
    }
  }
  return days;
}

function toYMD(date) {
  if (!date) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDisplay(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${SHORT_MONTHS[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(date, from, to) {
  if (!from || !to) return false;
  const t = date.getTime();
  return t > from.getTime() && t < to.getTime();
}

function SettlementDateRangePicker({ from, to, onChangeFrom, onChangeTo, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const today = new Date();
  const initialMonth = from ? new Date(from + "T00:00:00") : today;
  const [leftYear, setLeftYear] = useState(initialMonth.getFullYear());
  const [leftMonth, setLeftMonth] = useState(initialMonth.getMonth());
  const [selecting, setSelecting] = useState(null); // null | "from" - means we're picking `to` next
  const [hovered, setHovered] = useState(null);

  const fromDate = from ? new Date(from + "T00:00:00") : null;
  const toDate = to ? new Date(to + "T00:00:00") : null;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Reset calendar view when opening
  useEffect(() => {
    if (open) {
      const base = fromDate || today;
      setLeftYear(base.getFullYear());
      setLeftMonth(base.getMonth());
      setSelecting(null);
      setHovered(null);
    }
  }, [open]);

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;

  const prevMonth = () => {
    if (leftMonth === 0) { setLeftYear(y => y - 1); setLeftMonth(11); }
    else setLeftMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (leftMonth === 11) { setLeftYear(y => y + 1); setLeftMonth(0); }
    else setLeftMonth(m => m + 1);
  };

  const handleDayClick = (date) => {
    if (selecting === null) {
      // First click: set from
      onChangeFrom(toYMD(date));
      onChangeTo("");
      setSelecting("from");
    } else {
      // Second click: set to (ensure from < to)
      const f = fromDate || date;
      if (date < f) {
        onChangeFrom(toYMD(date));
        onChangeTo(toYMD(f));
      } else {
        onChangeTo(toYMD(date));
      }
      setSelecting(null);
      setOpen(false);
    }
  };

  const renderCalendarMonth = (year, month) => {
    const days = getCalendarDays(year, month);
    return (
      <div className="w-[260px]">
        <div className="text-sm font-semibold text-gray-800 text-center mb-2">{MONTH_NAMES[month]} {year}</div>
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map(({ date, outside }, i) => {
            const isFrom = fromDate && isSameDay(date, fromDate);
            const isTo = toDate && isSameDay(date, toDate);
            const effectiveTo = selecting === "from" && hovered ? hovered : toDate;
            const effectiveFrom = fromDate;
            const inRange = effectiveFrom && effectiveTo
              ? (effectiveTo >= effectiveFrom ? isBetween(date, effectiveFrom, effectiveTo) : isBetween(date, effectiveTo, effectiveFrom))
              : false;
            const isHoveredDay = hovered && isSameDay(date, hovered) && selecting === "from";
            const isSelected = isFrom || isTo;
            const isRangeStart = isFrom && effectiveTo && effectiveTo >= effectiveFrom;
            const isRangeEnd = (isTo || (isHoveredDay && selecting === "from")) && effectiveFrom;

            let bgClass = "";
            if (isSelected) bgClass = "bg-indigo-600 text-white";
            else if (isHoveredDay && selecting === "from") bgClass = "bg-indigo-600 text-white";
            else if (inRange) bgClass = "bg-indigo-50 text-indigo-700";
            else if (outside) bgClass = "text-gray-300";
            else bgClass = "text-gray-700 hover:bg-gray-100";

            let roundClass = "";
            if (isRangeStart) roundClass = "rounded-l-full";
            if (isRangeEnd) roundClass = "rounded-r-full";
            if (isSelected && !inRange && !(effectiveFrom && effectiveTo)) roundClass = "rounded-full";
            if (isFrom && isTo) roundClass = "rounded-full";

            return (
              <div key={i}
                className={`relative flex items-center justify-center h-8 text-sm cursor-pointer transition-colors ${inRange && !isSelected ? "bg-indigo-50" : ""} ${isRangeStart ? "rounded-l-full" : ""} ${isRangeEnd ? "rounded-r-full" : ""}`}
                onClick={() => !outside && handleDayClick(date)}
                onMouseEnter={() => !outside && setHovered(date)}
                onMouseLeave={() => setHovered(null)}
              >
                <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors ${isSelected || isHoveredDay ? "bg-indigo-600 text-white font-medium" : ""} ${!isSelected && !isHoveredDay && !outside ? "hover:bg-gray-100" : ""} ${outside ? "text-gray-300" : ""}`}>
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const hasValue = from || to;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 text-sm border rounded-lg px-3 py-1.5 transition-colors ${hasValue ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-gray-300 bg-white text-gray-500"} hover:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400`}
      >
        <Icons.Calendar />
        {from ? (
          to ? <span>{formatDisplay(from)} – {formatDisplay(to)}</span> : <span>{formatDisplay(from)}</span>
        ) : (
          <span>Settlement date</span>
        )}
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg p-4" style={{ left: 0, top: "100%" }}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500"><Icons.ChevronLeft /></button>
            <div className="flex-1" />
            <button onClick={nextMonth} className="p-1 rounded hover:bg-gray-100 text-gray-500"><Icons.ChevronRight /></button>
          </div>
          <div className="flex gap-6">
            {renderCalendarMonth(leftYear, leftMonth)}
            {renderCalendarMonth(rightYear, rightMonth)}
          </div>
          {hasValue && (
            <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
              <button onClick={() => { onClear(); setOpen(false); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Clear dates</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FLEET PAYOUTS PAGE
// ═══════════════════════════════════════════════════════════
function FleetPayoutsPage({ role, featureEnabled, payouts, onPayoutStatusChange, unassignedMLEs, holdRecords, onCreateHold, onReleaseHold, automationConfig, onUpdateAutomationConfig, auditLogState, onAuditAppend }) {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showPrepare, setShowPrepare] = useState(false);
  const [showHolds, setShowHolds] = useState(false);
  const [sortCol, setSortCol] = useState("Status");
  const [sortDir, setSortDir] = useState("asc");
  const canWrite = role === ROLES.FINOPS_T1;
  const { addToast } = useToast();

  const [search, setSearch] = useState("");
  const [settlementFrom, setSettlementFrom] = useState("");
  const [settlementTo, setSettlementTo] = useState("");

  const handleSort = (col) => {
    if (sortCol === col) { setSortDir(d => d === "asc" ? "desc" : "asc"); }
    else { setSortCol(col); setSortDir("asc"); }
  };

  const hasActiveFilters = search || settlementFrom || settlementTo;
  const clearAll = () => { setSearch(""); setSettlementFrom(""); setSettlementTo(""); };

  if (!featureEnabled) return (
    <div className="p-6"><Card><CardBody className="py-16 text-center space-y-3">
      <div className="flex justify-center text-gray-300"><Icons.Lock /></div>
      <p className="text-gray-400 text-sm font-medium">Settlements feature is not enabled for this tenant.</p>
      <p className="text-xs text-gray-400">Contact your administrator to enable the Settlements feature flag.</p>
    </CardBody></Card></div>
  );

  // Keep selectedPayout in sync with latest state
  const currentPayout = selectedPayout ? payouts.find(p => p.id === selectedPayout.id) || selectedPayout : null;
  if (currentPayout) return <PayoutDetailView payout={currentPayout} onBack={() => setSelectedPayout(null)} role={role} onStatusChange={(id, newStatus, extra) => { onPayoutStatusChange(id, newStatus, extra); }} holdRecords={holdRecords} onCreateHold={onCreateHold} onReleaseHold={onReleaseHold} merchantName={currentPayout.merchantName} automationConfig={automationConfig} onUpdateAutomationConfig={onUpdateAutomationConfig} auditLogState={auditLogState} onAuditAppend={onAuditAppend} />;

  // Filter
  let filtered = payouts;
  if (search) { const q = search.toLowerCase(); filtered = filtered.filter(p => p.id.toLowerCase().includes(q) || (p.merchantName || "").toLowerCase().includes(q) || (p.mid || "").toLowerCase().includes(q)); }
  if (settlementFrom || settlementTo) filtered = filtered.filter(p => dateInRange(p.settlementDate || p.date, settlementFrom, settlementTo));

  // Sort
  const sortKeyMap = { "Created": p => p.createdAt || p.date, "Settlement date": p => p.settlementDate || p.date, "Payout ID": p => p.id, "Merchant": p => p.merchantName, "Amount": p => parseFloat((p.amount || "").replace(/[^0-9.-]/g, "")) || 0, "Status": p => getStatusOrder(p) };
  const filteredPayouts = sortCol && sortKeyMap[sortCol] ? [...filtered].sort((a, b) => { const av = sortKeyMap[sortCol](a), bv = sortKeyMap[sortCol](b); const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv)); return sortDir === "asc" ? cmp : -cmp; }) : filtered;

  return (
    <div className="p-6 space-y-5">
      {role === ROLES.FINOPS_T2 && (<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-500"><Icons.Eye /> <span>Read-only access. You can view payouts but cannot perform actions.</span></div>)}

      <HoldsDialog open={showHolds} onClose={() => setShowHolds(false)} level="fleet" entity={null} entityLabel="Fleet" mid={null} holdRecords={holdRecords} onCreateHold={onCreateHold} onReleaseHold={onReleaseHold} automationConfig={automationConfig} onUpdateAutomationConfig={onUpdateAutomationConfig} canWrite={canWrite} />

      <ActiveHoldBanners holdRecords={holdRecords} level="fleet" entity={null} mid={null} merchantName="Fleet" automationConfig={automationConfig} />

      <div className="flex items-center gap-3 flex-wrap">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search payout ID, merchant, MID…" className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 w-[260px]" />
        <SettlementDateRangePicker from={settlementFrom} to={settlementTo} onChangeFrom={setSettlementFrom} onChangeTo={setSettlementTo} onClear={clearAll} />
        {hasActiveFilters && <button onClick={() => { setSearch(""); setSettlementFrom(""); setSettlementTo(""); }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Clear all</button>}
      </div>

      <Card>
        <CardHeader>
          <span className="text-lg font-semibold text-gray-800">Payouts<span className="ml-2 text-sm font-normal text-gray-400">{filteredPayouts.length} results</span></span>
          {canWrite && (
            <div className="flex items-center gap-2">
              <Button variant="outline" colorScheme="neutral" size="sm" leftIcon={<Icons.Shield />} onClick={() => setShowHolds(true)}>Holds</Button>
            </div>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="pt-4">
          <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-gray-200">
            {["Created", "Settlement date", "Payout ID", "Merchant", "MID", "Amount", "Status"].map((h) => {
              const sortable = ["Created", "Settlement date", "Payout ID", "Merchant", "Amount", "Status"].includes(h);
              return <th key={h} onClick={sortable ? () => handleSort(h) : undefined} className={`py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === "Amount" ? "text-right" : ""} ${sortable ? "cursor-pointer hover:text-indigo-600 select-none" : ""}`}>{h}{sortCol === h ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</th>;
            })}
          </tr></thead><tbody>
            {filteredPayouts.map((p) => (
              <tr key={p.id} onClick={() => setSelectedPayout(p)} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${p.status === "Failed" ? "bg-red-50/30" : ""}`}>
                <td className="py-3 px-3 text-sm text-gray-700 whitespace-nowrap">{p.createdAt || p.date}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{p.settlementDate || p.date}</td>
                <td className="py-3 px-3 text-sm font-mono text-indigo-600 font-medium">{p.id}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{p.merchantName}</td>
                <td className="py-3 px-3 text-sm font-mono text-gray-500">{p.mid}</td>
                <td className="py-3 px-3 text-sm font-semibold text-gray-900 text-right">{p.amount}</td>
                <td className="py-3 px-3"><PayoutStatusBadge status={p.status} hold={p.hold} amount={p.amount} holdRecords={holdRecords} payoutId={p.id} mid={p.mid} automationConfig={automationConfig} /></td>
              </tr>
            ))}
            {filteredPayouts.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-gray-400">No payouts found.</td></tr>}
          </tbody></table></div>
          <div className="flex justify-center pt-4"><Button variant="outline" colorScheme="brand" size="md">More results</Button></div>
        </CardBody>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MERCHANT PAYOUTS TAB
// ═══════════════════════════════════════════════════════════
function MerchantPayoutsTab({ role, payouts, onPayoutStatusChange, unassignedMLEs, mid, merchantName, holdRecords, onCreateHold, onReleaseHold, automationConfig, onUpdateAutomationConfig, auditLogState, onAuditAppend }) {
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showPrepare, setShowPrepare] = useState(false);
  const [showHolds, setShowHolds] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortCol, setSortCol] = useState("Status");
  const [sortDir, setSortDir] = useState("asc");
  const PAGE_SIZE = 20;
  const canWrite = role === ROLES.FINOPS_T1;
  const { addToast } = useToast();

  const [settlementFrom, setSettlementFrom] = useState("");
  const [settlementTo, setSettlementTo] = useState("");

  const handleSort = (col) => { if (sortCol === col) { setSortDir(d => d === "asc" ? "desc" : "asc"); } else { setSortCol(col); setSortDir("asc"); } };
  const merchantPayouts = payouts.filter((p) => p.mid === (mid || "POSPAY00012345"));

  const hasActiveFilters = settlementFrom || settlementTo;
  const clearAll = () => { setSettlementFrom(""); setSettlementTo(""); setCurrentPage(1); };

  // Filter
  let afterFilter = merchantPayouts;
  if (settlementFrom || settlementTo) afterFilter = afterFilter.filter(p => dateInRange(p.settlementDate || p.date, settlementFrom, settlementTo));

  // Sort
  const sortKeyMap = { "Created": p => p.createdAt || p.date, "Settlement date": p => p.settlementDate || p.date, "Payout ID": p => p.id, "Amount": p => parseFloat((p.amount || "").replace(/[^0-9.-]/g, "")) || 0, "Status": p => getStatusOrder(p) };
  const filtered = sortCol && sortKeyMap[sortCol] ? [...afterFilter].sort((a, b) => { const av = sortKeyMap[sortCol](a), bv = sortKeyMap[sortCol](b); const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv)); return sortDir === "asc" ? cmp : -cmp; }) : afterFilter;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedPayouts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const currentPayout = selectedPayout ? payouts.find(p => p.id === selectedPayout.id) || selectedPayout : null;
  if (currentPayout) return <PayoutDetailView payout={currentPayout} onBack={() => setSelectedPayout(null)} role={role} onStatusChange={(id, newStatus, extra) => { onPayoutStatusChange(id, newStatus, extra); }} holdRecords={holdRecords} onCreateHold={onCreateHold} onReleaseHold={onReleaseHold} merchantName={merchantName} automationConfig={automationConfig} onUpdateAutomationConfig={onUpdateAutomationConfig} auditLogState={auditLogState} onAuditAppend={onAuditAppend} />;

  return (
    <div className="p-6 space-y-5">
      <MerchantPreparePayoutDialog open={showPrepare} onClose={() => setShowPrepare(false)} onCreatePayouts={(newPayouts) => { newPayouts.forEach((p) => onPayoutStatusChange(p.id, p.status, p)); }} unassignedMLEs={unassignedMLEs || mockUnassignedMLEs} mid={mid} merchantName={merchantName} />
      <HoldsDialog open={showHolds} onClose={() => setShowHolds(false)} level="merchant" entity={mid} entityLabel={merchantName} mid={mid} holdRecords={holdRecords} onCreateHold={onCreateHold} onReleaseHold={onReleaseHold} automationConfig={automationConfig} onUpdateAutomationConfig={onUpdateAutomationConfig} canWrite={canWrite} />

      <ActiveHoldBanners holdRecords={holdRecords} level="merchant" entity={mid} mid={mid} merchantName={merchantName} automationConfig={automationConfig} />

      <div className="flex items-center gap-3 flex-wrap">
        <SettlementDateRangePicker from={settlementFrom} to={settlementTo} onChangeFrom={(v) => { setSettlementFrom(v); setCurrentPage(1); }} onChangeTo={(v) => { setSettlementTo(v); setCurrentPage(1); }} onClear={() => { setSettlementFrom(""); setSettlementTo(""); setCurrentPage(1); }} />
      </div>

      <Card>
        <CardHeader>
          <span className="text-lg font-semibold text-gray-800">Payouts<span className="ml-2 text-sm font-normal text-gray-400">{filtered.length} results</span></span>
          <div className="flex items-center gap-2">
            <Button variant="solid" colorScheme="brand" size="sm" leftIcon={<Icons.DollarSign />} onClick={() => setShowPrepare(true)} disabled={!canWrite || isPreparationBlocked(holdRecords || [], mid)}>Prepare payout</Button>
            {canWrite && <Button variant="outline" colorScheme="neutral" size="sm" leftIcon={<Icons.Shield />} onClick={() => setShowHolds(true)}>Holds</Button>}
          </div>
        </CardHeader>
        <Divider />
        <CardBody className="pt-4">
          <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-gray-200">
            {["Created", "Settlement date", "Payout ID", "Amount", "Status"].map((h) => {
              const sortable = ["Created", "Settlement date", "Payout ID", "Amount", "Status"].includes(h);
              return <th key={h} onClick={sortable ? () => handleSort(h) : undefined} className={`py-2 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === "Amount" ? "text-right" : ""} ${sortable ? "cursor-pointer hover:text-indigo-600 select-none" : ""}`}>{h}{sortCol === h ? (sortDir === "asc" ? " ↑" : " ↓") : ""}</th>;
            })}
          </tr></thead><tbody>
            {paginatedPayouts.map((p) => (<tr key={p.id} onClick={() => setSelectedPayout(p)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"><td className="py-3 px-3 text-sm text-gray-700 whitespace-nowrap">{p.createdAt || p.date}</td><td className="py-3 px-3 text-sm text-gray-700">{p.settlementDate || p.date}</td><td className="py-3 px-3 text-sm font-mono text-indigo-600 font-medium">{p.id}</td><td className="py-3 px-3 text-sm font-semibold text-gray-900 text-right">{p.amount}</td><td className="py-3 px-3"><PayoutStatusBadge status={p.status} hold={p.hold} amount={p.amount} holdRecords={holdRecords} payoutId={p.id} mid={p.mid} automationConfig={automationConfig} /></td></tr>))}
            {paginatedPayouts.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No payouts found.</td></tr>}
          </tbody></table></div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-4">
              <span className="text-xs text-gray-400">Page {currentPage} of {totalPages} ({filtered.length} results, {PAGE_SIZE} per page)</span>
              <div className="flex gap-2">
                <Button variant="outline" colorScheme="neutral" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" colorScheme="neutral" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// EXISTING VIEWS (transactions, overview, terminals, disputes)
// ═══════════════════════════════════════════════════════════
function TransactionDetail({ txn }) {
  return (<tr><td colSpan={9} className="p-0"><div className="bg-gray-50 px-12 py-5 flex gap-6">
    <div className="flex-1 rounded-lg overflow-hidden border border-gray-200"><div className="bg-amber-400 px-4 py-2 text-sm font-bold text-gray-900">Details</div><div className="bg-white p-4 space-y-3">{[["Transaction type", txn.type], ["Approval status", txn.status], ["Auth code", txn.authCode], ["RRN", txn.rrn], ["Settlement value", txn.settlementValue], ["Expected settlement", txn.expectedSettlement]].map(([l, v]) => (<div key={l} className="flex text-sm"><span className="w-44 font-medium text-gray-500">{l}</span><span className="text-gray-800">{v}</span></div>))}</div></div>
    <div className="flex-1 rounded-lg overflow-hidden border border-gray-200"><div className="bg-amber-400 px-4 py-2 text-sm font-bold text-gray-900">Payment method details</div><div className="bg-white p-4 space-y-3">{[["Payment method", txn.method === "mastercard" ? "Mastercard" : "Visa"], ["Card number", `••••${txn.last4}`], ["Channel", txn.channel], ["Terminal", txn.tid]].map(([l, v]) => (<div key={l} className="flex text-sm"><span className="w-44 font-medium text-gray-500">{l}</span><span className="text-gray-800 flex items-center gap-1.5">{l === "Payment method" && (txn.method === "mastercard" ? <Icons.Mastercard /> : <Icons.Visa />)}{v}</span></div>))}</div></div>
  </div></td></tr>);
}

function TransactionsTab() {
  const [dateFilter, setDateFilter] = useState("today");
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (i) => setExpandedRows((p) => ({ ...p, [i]: !p[i] }));
  return (<div className="p-6 space-y-4">
    <div className="flex flex-col lg:flex-row justify-between gap-3">
      <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 max-w-[250px]"><option>All terminals</option><option>50112233</option><option>50112234</option></select>
      <DateFilterBar value={dateFilter} onChange={setDateFilter} options={[{ id: "today", label: "Today" }, { id: "yesterday", label: "Yesterday" }, { id: "week", label: "This week" }, { id: "custom", label: "Custom" }]} />
    </div>
    <Card><CardHeader><span className="text-lg font-semibold text-gray-800">Transactions</span></CardHeader><Divider />
      <CardBody className="pt-4">
        <div className="flex flex-wrap gap-6 pb-4 mb-4 border-b border-gray-100"><HeroMetric heading="Total transactions" value="$567.45" /><HeroMetric heading="Purchase" value="$612.45" /><HeroMetric heading="Refund" value="-$45.00" /></div>
        <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-gray-200"><th className="w-6"></th>{["Date", "Status", "TID", "Channel", "Method", "Type"].map((h) => <TH key={h}>{h}</TH>)}<TH right>Amount</TH><th className="w-10"></th></tr></thead><tbody>
          {mockTransactions.map((txn, i) => (<>
            <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleRow(i)}>
              <td className="py-3 px-2 text-center">{txn.status === "Approved" ? <Icons.Tick /> : <Icons.Cross />}</td>
              <td className="py-3 px-3 text-sm text-gray-700">{txn.date}</td>
              <td className="py-3 px-3 text-sm"><Badge colorScheme={txn.status === "Approved" ? "success" : "error"} size="sm">{txn.status}</Badge></td>
              <td className="py-3 px-3 text-sm text-gray-700 font-mono">{txn.tid}</td>
              <td className="py-3 px-3 text-sm text-gray-700">{txn.channel}</td>
              <td className="py-3 px-3 text-sm text-gray-700"><span className="flex items-center gap-1.5">{txn.method === "mastercard" ? <Icons.Mastercard /> : <Icons.Visa />}••••{txn.last4}</span></td>
              <td className="py-3 px-3 text-sm text-gray-700">{txn.type}</td>
              <td className={`py-3 px-3 text-sm font-medium text-right ${txn.type === "Refund" ? "text-red-600" : "text-gray-900"}`}>{txn.amount}</td>
              <td className="py-3 px-2 text-center"><span className={`inline-flex transition-transform ${expandedRows[i] ? "rotate-90" : ""}`}><Icons.ChevronRight /></span></td>
            </tr>
            {expandedRows[i] && <TransactionDetail key={`d-${i}`} txn={txn} />}
          </>))}
        </tbody></table></div>
        <div className="flex justify-center pt-4"><Button variant="outline" colorScheme="brand" size="md">More results</Button></div>
      </CardBody>
    </Card>
  </div>);
}

function OverviewTab() {
  const fields = [{ label: "Activation status", value: <Badge colorScheme="success" size="sm">Active</Badge> }, { label: "Trading name", value: "Joe's Coffee House", tooltip: "Also known as Business name." }, { label: "Short trading name", value: "JOES COFFEE" }, { label: "Friendly name", value: "Joe's Coffee - Sydney CBD" }, { label: "MID", value: <Badge colorScheme="neutral" size="sm">POSPAY00012345</Badge> }, { label: "Trading email", value: "joe@joescoffee.com.au" }, { label: "Trading phone", value: "+61 2 9876 5432" }, { label: "Product code", value: "POS Pay Plus" }, { label: "MCC", value: "5814 - Fast Food Restaurants" }, { label: "Settlement payout frequency", value: "5 Day" }, { label: "Card surcharge enabled", value: "Yes" }, { label: "Address", value: "123 George St, Sydney NSW 2000" }];
  return (<div className="p-6 space-y-5"><Card><CardHeader><span className="text-lg font-semibold text-gray-800 flex items-center gap-2">Merchant Facility summary for <Badge colorScheme="neutral" size="md">POSPAY00012345</Badge></span><div className="flex gap-2"><Button variant="outline" colorScheme="neutral" size="sm">Edit</Button><Button variant="outline" colorScheme="neutral" size="sm">Actions</Button></div></CardHeader><Divider /><CardBody className="pt-5"><div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-4">{fields.map(({ label, value, tooltip }) => (<div key={label} className="contents"><div className="flex items-center gap-1"><span className="text-sm font-semibold text-gray-500">{label}</span>{tooltip && <span className="text-gray-400 cursor-help" title={tooltip}><Icons.Info /></span>}</div><div className="flex items-center text-sm text-gray-600 max-w-[30rem]">{value}</div></div>))}</div></CardBody></Card></div>);
}

function TerminalsTab() {
  return (<div className="p-6"><Card><CardHeader><span className="text-lg font-semibold text-gray-800">Terminals</span></CardHeader><Divider /><CardBody className="pt-4"><table className="w-full border-collapse"><thead><tr className="border-b border-gray-200">{["TID", "Device", "Status", "Auto settlement"].map((h) => <TH key={h}>{h}</TH>)}</tr></thead><tbody>{[{ tid: "50112233", device: "PAX A920", status: "Active", autoSettle: "11:00 PM" }, { tid: "50112234", device: "PAX A77", status: "Active", autoSettle: "11:00 PM" }].map((t) => (<tr key={t.tid} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"><td className="py-3 px-3 text-sm font-mono text-gray-700">{t.tid}</td><td className="py-3 px-3 text-sm text-gray-700">{t.device}</td><td className="py-3 px-3"><Badge colorScheme="success" size="sm">{t.status}</Badge></td><td className="py-3 px-3 text-sm text-gray-600">{t.autoSettle}</td></tr>))}</tbody></table></CardBody></Card></div>);
}
function DisputesTab() {
  return (<div className="p-6"><Card><CardHeader><span className="text-lg font-semibold text-gray-800">Disputes</span></CardHeader><Divider /><CardBody className="pt-4"><Alert type="info">No disputes found for this merchant facility.</Alert></CardBody></Card></div>);
}

// ═══════════════════════════════════════════════════════════
// MERCHANT FACILITY DETAIL (with Payouts + Adjustments tabs)
// ═══════════════════════════════════════════════════════════
function MerchantFacilityDetailPage({ role, payouts, onPayoutStatusChange, unassignedMLEs, holdRecords, onCreateHold, onReleaseHold, automationConfig, onUpdateAutomationConfig, auditLogState, onAuditAppend, initialTab, onTabChange }) {
  const [activeTab, setActiveTab] = useState(initialTab || "transactions");
  const handleTabChange = (tab) => { setActiveTab(tab); if (onTabChange) onTabChange(tab); };
  const tabs = [{ id: "overview", label: "Overview" }, { id: "terminals", label: "Terminals" }, { id: "transactions", label: "Transactions" }, { id: "payouts", label: "Payouts" }, { id: "adjustments", label: "Adjustments" }, { id: "disputes", label: "Disputes" }];
  const bc = { org: "POS Pay Pty Ltd", facility: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", status: "Active" };
  return (<div className="flex flex-col h-full">
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100"><Icons.Store /><span className="text-sm font-medium text-indigo-600 cursor-pointer hover:underline">{bc.org}</span><Icons.ChevronRight /><span className="text-sm font-medium text-gray-800">{bc.facility}</span><span className="ml-1"><Badge colorScheme="neutral" size="md">{bc.mid}</Badge></span><span className="ml-1"><Badge colorScheme="success" size="md">{bc.status}</Badge></span></div>
      <div className="px-4 py-1 flex gap-1">{tabs.map((tab) => (<button key={tab.id} onClick={() => handleTabChange(tab.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? "bg-indigo-50 text-indigo-700" : "text-[#5D6B98] hover:bg-gray-50 hover:text-gray-700"}`}>{tab.label}</button>))}</div>
    </div>
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "terminals" && <TerminalsTab />}
      {activeTab === "transactions" && <TransactionsTab />}
      {activeTab === "payouts" && <MerchantPayoutsTab role={role} payouts={payouts} onPayoutStatusChange={onPayoutStatusChange} unassignedMLEs={unassignedMLEs} mid={bc.mid} merchantName={bc.facility} holdRecords={holdRecords} onCreateHold={onCreateHold} onReleaseHold={onReleaseHold} automationConfig={automationConfig} onUpdateAutomationConfig={onUpdateAutomationConfig} auditLogState={auditLogState} onAuditAppend={onAuditAppend} />}
      {activeTab === "adjustments" && <MerchantAdjustmentsTab role={role} mid={bc.mid} />}
      {activeTab === "disputes" && <DisputesTab />}
    </div>
  </div>);
}

// ═══ Merchant List ═══
function MerchantFacilitiesListPage({ onSelectMerchant }) {
  const merchants = [{ mid: "POSPAY00012345", friendlyName: "Joe's Coffee - Sydney CBD", tradingName: "Joe's Coffee House", location: "Sydney NSW", product: "POS Pay Plus", status: "Active" }, { mid: "POSPAY00012346", friendlyName: "Mike's Electronics", tradingName: "Michael's Tech Store", location: "Melbourne VIC", product: "POS Pay Plus", status: "Active" }, { mid: "POSPAY00012347", friendlyName: "Fresh Mart - Brisbane", tradingName: "Fresh Mart Australia", location: "Brisbane QLD", product: "POS Pay", status: "Inactive" }, { mid: "POSPAY00012348", friendlyName: "Bella's Boutique - Melbourne", tradingName: "Bella's Fashion Pty Ltd", location: "Melbourne VIC", product: "POS Pay Plus", status: "Active" }, { mid: "POSPAY00012349", friendlyName: "Coastal Surf Shop - Gold Coast", tradingName: "Coastal Surf Co", location: "Gold Coast QLD", product: "POS Pay", status: "Active" }];
  return (<div className="p-6"><div className="flex justify-between items-center mb-4"><div /><Button variant="solid" colorScheme="brand" size="sm" leftIcon={<Icons.Shop />}>New merchant facility</Button></div>
    <table className="w-full border-collapse bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"><thead><tr className="border-b border-gray-200 bg-gray-50">{["MID", "Friendly name", "Trading name", "Location", "Status", "Product"].map((h) => <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">{h}</th>)}</tr></thead><tbody>
      {merchants.map((m) => (<tr key={m.mid} onClick={() => onSelectMerchant(m)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"><td className="py-3 px-4 text-sm font-mono text-gray-700">{m.mid}</td><td className="py-3 px-4 text-sm text-gray-700 flex items-center gap-2"><span className="text-gray-400"><Icons.Terminal /></span>{m.friendlyName}</td><td className="py-3 px-4 text-sm text-gray-600">{m.tradingName}</td><td className="py-3 px-4 text-sm text-gray-600">{m.location}</td><td className="py-3 px-4"><Badge colorScheme={m.status === "Active" ? "success" : "neutral"} size="sm">{m.status}</Badge></td><td className="py-3 px-4 text-sm text-gray-600">{m.product}</td></tr>))}
    </tbody></table>
  </div>);
}

// ═══════════════════════════════════════════════════════════
// DEBUGGING TOOLS PAGE
// ═══════════════════════════════════════════════════════════
function DebuggingToolsPage({ onResetData, payouts }) {
  const { addToast } = useToast();
  const changedPayouts = payouts.filter((p) => {
    const original = mockPayouts.find((o) => o.id === p.id);
    return original && original.status !== p.status;
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    onResetData();
    setShowConfirm(false);
    addToast({ type: "success", title: "Data reset", message: "All payout statuses restored to defaults." });
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Debugging Tools</h2>
        <p className="text-sm text-gray-500">Tools for testing and prototyping. Reset mock data to re-test payout flows.</p>
      </div>
      <Card>
        <CardBody>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-amber-600"><Icons.Refresh /></span></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Reset Payout Data</h3>
              <p className="text-sm text-gray-500 mb-3">Restores all payout statuses to their original mock values. Use this after testing Approve, Hold, or Abandon flows to start fresh.</p>
              {changedPayouts.length > 0 ? (
                <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs font-medium text-amber-700 mb-2">{changedPayouts.length} payout{changedPayouts.length > 1 ? "s" : ""} modified since last reset:</p>
                  <div className="space-y-1">{changedPayouts.map((p) => {
                    const original = mockPayouts.find((o) => o.id === p.id);
                    return (<div key={p.id} className="flex items-center gap-2 text-xs"><span className="font-mono text-gray-600">{p.id}</span><span className="text-gray-400">—</span><PayoutStatusBadge status={original.status} hold={original.hold} /><span className="text-gray-400">→</span><PayoutStatusBadge status={p.status} hold={p.hold}  /></div>);
                  })}</div>
                </div>
              ) : (
                <div className="mb-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-700">All payouts are at their default values. No reset needed.</p>
                </div>
              )}
              {!showConfirm ? (
                <button onClick={() => setShowConfirm(true)} disabled={changedPayouts.length === 0} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${changedPayouts.length > 0 ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>Reset to defaults</button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={handleReset} className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600">Confirm reset</button>
                  <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
      <div className="mt-4">
        <Card>
          <CardBody>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-blue-600"><Icons.Info /></span></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Current Data Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">{
                  ["Ready for Review", "Ready for Transfer", "Transferring", "Completed", "Failed", "Abandoned"].map((status) => {
                    const count = payouts.filter((p) => p.status === status).length;
                    return count > 0 ? (<div key={status} className="flex items-center gap-2 text-xs"><PayoutStatusBadge status={status} /><span className="text-gray-500">× {count}</span></div>) : null;
                  }).filter(Boolean)
                }
                {(() => { const holdCount = payouts.filter((p) => p.hold).length; return holdCount > 0 ? (<div className="flex items-center gap-2 text-xs"><Badge colorScheme="warning" size="sm"><Icons.Pause /> On Hold</Badge><span className="text-gray-500">× {holdCount}</span></div>) : null; })()}
                </div>
                <p className="text-xs text-gray-400 mt-3">{payouts.length} total payouts in mock data</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// UX ARTEFACTS PAGE
// ═══════════════════════════════════════════════════════════
const uxArtefactsList = [
  { id: "ux-flows", title: "UX Flow Diagrams (All-in-One)", description: "All 4 core flow diagrams in a tabbed view — Payout Lifecycle, E2E Journey, Action Flows, and Permissions", type: "React Component", icon: "flow", component: UXFlowDiagrams },
  { id: "lifecycle", title: "Payout Lifecycle State Machine", description: "Clickable SVG state diagram — 8 states with transitions, entry conditions, and exit actions", type: "React Component", icon: "state", component: PayoutLifecycle },
  { id: "e2e", title: "E2E Merchant → Payout Journey", description: "8-step expandable timeline from Cuscal DTE ingestion to NPP transfer, filterable by phase", type: "React Component", icon: "journey", component: E2EPayoutJourney },
  { id: "actions", title: "FinOps Action Flows", description: "Step-by-step interaction flows for Approve, Hold, Abandon, Begin Transfer, and Release Hold with edge cases", type: "React Component", icon: "actions", component: FinOpsActionFlows },
  { id: "permissions", title: "Permissions & Roles Matrix", description: "Interactive role/permission grid for FinOps Administrator and FinOps View only across 20+ actions", type: "React Component", icon: "roles", component: PermissionsMatrix },
  { id: "dte-wireframes", title: "DTE → Payout Wireframes", description: "Lo-fi wireframes for the full DTE-to-payout pipeline — 7 steps from file generation through NPP transfer, with screen mockups", type: "React Component", icon: "wireframe", component: DTEtoPayoutWireframes },
  { id: "data-dictionary", title: "Payout Data Dictionary", description: "Comprehensive terminology reference — statuses, flags, actions, and roles with use cases, audit log examples, and UX justification", type: "React Component", icon: "docs", component: PayoutDataDictionary },
  { id: "progression-controls", title: "Payout Progression Controls", description: "Framework for Hold/Release Hold model — scope levels (fleet/merchant/payout), automation switches, failure controls, and resolved decisions", type: "React Component", icon: "controls", component: PayoutProgressionControls },
  { id: "audit-logs", title: "Audit Logs & Messaging", description: "Complete reference of all 29 payout lifecycle events — audit log messages, toast notifications, status transitions, and trigger types with filterable phases", type: "React Component", icon: "audit", component: AuditLogsReference },
];

function UXArtefactsPage() {
  const [activeArtefact, setActiveArtefact] = useState(null);

  const iconMap = {
    flow: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="9" y="15" width="6" height="6" rx="1" /><path d="M9 6h6M6 9v3a3 3 0 003 3M18 9v3a3 3 0 01-3 3" /></svg>),
    state: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></svg>),
    journey: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4" /></svg>),
    actions: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>),
    roles: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="3" x2="9" y2="21" /></svg>),
    wireframe: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" /><line x1="2" y1="8" x2="22" y2="8" /><line x1="8" y1="8" x2="8" y2="21" /><rect x="10" y="10" width="5" height="4" rx="0.5" strokeDasharray="2 1" /><rect x="10" y="16" width="10" height="3" rx="0.5" strokeDasharray="2 1" /></svg>),
    docs: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>),
    controls: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>),
    audit: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /><path d="M4 4l2 2M20 4l-2 2" /></svg>),
  };

  const artefactContentRef = useRef(null);

  const handleDownloadPDF = () => {
    if (!artefactContentRef.current) return;
    const content = artefactContentRef.current;
    const artefact = uxArtefactsList.find((a) => a.id === activeArtefact);
    const title = artefact?.title || "Artefact";

    // Open a new window with just the artefact content + styles for clean printing
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    // Collect all stylesheets from the current page
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join("\n");

    printWindow.document.write(`<!DOCTYPE html>
<html><head><title>${title}</title>${styles}
<style>
  @media print {
    body { margin: 0; padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: white; color: #1a1a2e; padding: 24px; }
</style></head><body>
<div style="max-width: 860px; margin: 0 auto;">${content.innerHTML}</div>
<script>
  window.onafterprint = function() { window.close(); };
  setTimeout(function() { window.print(); }, 400);
</script>
</body></html>`);
    printWindow.document.close();
  };

  // If an artefact is selected, render it full-page with a back button
  if (activeArtefact) {
    const artefact = uxArtefactsList.find((a) => a.id === activeArtefact);
    const ArtefactComponent = artefact?.component;
    return (
      <div className="flex flex-col h-full">
        <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setActiveArtefact(null)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <Icons.ChevronLeft /><span>Back to artefacts</span>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <h3 className="text-sm font-semibold text-gray-800 flex-1">{artefact.title}</h3>
          <button onClick={handleDownloadPDF} className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50">
            <Icons.Download /><span>Download PDF</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto" ref={artefactContentRef}>
          <div className="p-6">
            {ArtefactComponent && <ArtefactComponent />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">UX Artefacts</h2>
        <p className="text-sm text-gray-500">Design documentation and interactive flow diagrams built for the MSP Support Dashboard.</p>
      </div>
      <div className="space-y-3">
        {uxArtefactsList.map((artefact) => {
          const IconComponent = iconMap[artefact.icon];
          const isStandalone = artefact.type === "Standalone HTML";
          return (
            <Card key={artefact.id}>
              <CardBody>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isStandalone ? "bg-indigo-50" : "bg-gray-50"}`}><span className={isStandalone ? "text-indigo-600" : "text-gray-500"}><IconComponent /></span></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-800">{artefact.title}</h3>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isStandalone ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"}`}>{artefact.type}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{artefact.description}</p>
                    <div className="flex items-center gap-3">
                      {isStandalone ? (
                        <button onClick={() => window.open(artefact.href, "_blank")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                          Open in new tab
                        </button>
                      ) : (
                        <button onClick={() => setActiveArtefact(artefact.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          View artefact
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DTE GENERATOR PAGE
// ═══════════════════════════════════════════════════════════
// MSF (Merchant Service Fee) rates by card scheme — used for DTE enrichment
const MSF_RATES = {
  "Visa": { rate: 0.01, label: "Visa Debit @ 1.00%" },
  "Mastercard": { rate: 0.02, label: "Mastercard Debit @ 2.00%" },
  "Visa Credit": { rate: 0.015, label: "Visa Credit @ 1.50%" },
  "MC Credit": { rate: 0.022, label: "MC Credit @ 2.20%" },
  "Visa International": { rate: 0.025, label: "Visa Intl @ 2.50%" },
  "eftpos": { rate: 0.008, label: "eftpos @ 0.80%" },
  "Unknown": { rate: 0.012, label: "Default @ 1.20%" },
};

const DTE_PRESETS = {
  purchase: { label: "Purchase (In-store)", messageType: "0200", processingCode: "000000", posEntryMode: "071", posCondition: "00", deviceType: "POS", responseCode: "00" },
  purchaseCashout: { label: "Purchase + Cashout", messageType: "0200", processingCode: "090000", posEntryMode: "071", posCondition: "00", deviceType: "POS", responseCode: "00" },
  refund: { label: "Refund", messageType: "0200", processingCode: "200000", posEntryMode: "071", posCondition: "00", deviceType: "POS", responseCode: "00" },
  onlinePurchase: { label: "Purchase (Online/ECM)", messageType: "0200", processingCode: "000000", posEntryMode: "820", posCondition: "01", deviceType: "ECM", responseCode: "00" },
  declined: { label: "Declined Purchase", messageType: "0200", processingCode: "000000", posEntryMode: "071", posCondition: "00", deviceType: "POS", responseCode: "05" },
  reversal: { label: "Reversal", messageType: "0400", processingCode: "000000", posEntryMode: "071", posCondition: "00", deviceType: "POS", responseCode: "00" },
  preauth: { label: "Pre-Auth", messageType: "0200", processingCode: "300000", posEntryMode: "071", posCondition: "06", deviceType: "POS", responseCode: "00" },
  mobilePurchase: { label: "Mobile (Tap to Pay)", messageType: "0200", processingCode: "000000", posEntryMode: "071", posCondition: "00", deviceType: "MOB", responseCode: "00" },
};

const DTE_SCHEMES = [
  { label: "Visa", prefix: "4111222233334", cardType: "D", domestic: "D" },
  { label: "Mastercard", prefix: "5432100000001", cardType: "D", domestic: "D" },
  { label: "Visa Credit", prefix: "4000111122223", cardType: "C", domestic: "D" },
  { label: "MC Credit", prefix: "5200222233334", cardType: "C", domestic: "D" },
  { label: "Visa International", prefix: "4444333322221", cardType: "C", domestic: "I" },
  { label: "eftpos", prefix: "6277001122334", cardType: "D", domestic: "D" },
];

const DTE_MERCHANTS = [
  { name: "JOE'S COFFEE SYDNEY AU", mid: "POSPAY000012345", tid: "50112233", mcc: "5411" },
  { name: "MIKE'S ELECTRONICS AU", mid: "POSPAY000012346", tid: "50112234", mcc: "5732" },
  { name: "FRESH MART BRISBANE AU", mid: "POSPAY000012347", tid: "50112235", mcc: "5411" },
  { name: "BELLA'S BOUTIQUE MELB AU", mid: "POSPAY000012348", tid: "50112236", mcc: "5651" },
  { name: "COASTAL SURF GOLDCOAST AU", mid: "POSPAY000012349", tid: "50112237", mcc: "5941" },
];

// DTE file parser — reads fixed-width 700-byte records back into transaction objects
function parseDTEFile(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length >= 700 || l.startsWith("00000000") || l.startsWith("88888888") || l.startsWith("99999999"));
  const result = { header: null, transactions: [], trailer: null, clientName: "", businessDate: "" };

  for (const line of lines) {
    const padded = line.padEnd(700, " ");
    const recNum = padded.substring(0, 8).trim();

    // Header
    if (recNum === "00000000" && padded.substring(8, 16).trim() === "DAILYTXN") {
      result.clientName = padded.substring(16, 24).trim();
      result.businessDate = padded.substring(25, 33).trim();
      result.header = true;
      continue;
    }
    // Trailer
    if (recNum === "88888888") { result.trailer = true; continue; }
    // Filler
    if (recNum === "99999999") continue;
    // Must be a detail record
    if (padded.length < 700) continue;

    const seq = parseInt(recNum) || result.transactions.length + 1;
    const msgType = padded.substring(8, 12).trim();
    const origMsgType = padded.substring(12, 16).trim();
    const panLen = parseInt(padded.substring(16, 18)) || 0;
    const pan = padded.substring(18, 37).trim();
    const procCode = padded.substring(37, 43).trim();
    const amtAud = parseInt(padded.substring(43, 55)) || 0;
    const amtOrig = parseInt(padded.substring(55, 67)) || 0;
    const amtCard = parseInt(padded.substring(67, 79)) || 0;
    const transDT = padded.substring(79, 89).trim();
    const sysTrace = padded.substring(89, 95).trim();
    const localTime = padded.substring(95, 101).trim();
    const localDate = padded.substring(101, 105).trim();
    const expiry = padded.substring(105, 109).trim();
    const settlDate = padded.substring(109, 113).trim();
    const mcc = padded.substring(113, 117).trim();
    const posEntry = padded.substring(120, 123).trim();
    const posCondition = padded.substring(126, 128).trim();
    const acquirerId = padded.substring(128, 139).trim();
    const rrn = padded.substring(139, 151).trim();
    const authId = padded.substring(151, 157).trim();
    const respCode = padded.substring(157, 159).trim();
    const termId = padded.substring(159, 167).trim();
    const cardAccId = padded.substring(167, 182).trim();
    const cardAccName = padded.substring(182, 222).trim();
    const cashComp = parseInt(padded.substring(228, 240)) || 0;
    const deviceType = padded.substring(366, 369).trim();
    const acquirerName = padded.substring(369, 401).trim();
    const issuerName = padded.substring(401, 433).trim();
    const settlInst = padded.substring(433, 441).trim();
    const surchFee = parseInt(padded.substring(442, 450)) || 0;
    const walletProv = padded.substring(553, 573).trim();
    const cardType = padded.substring(573, 574).trim();
    const domesticInd = padded.substring(574, 575).trim();
    const eftposR = padded.substring(575, 576).trim();

    // Determine preset label from msgType + procCode
    let presetLabel = "Purchase (In-store)";
    if (msgType === "0400" || msgType === "0420") presetLabel = "Reversal";
    else if (procCode.startsWith("20")) presetLabel = "Refund";
    else if (procCode.startsWith("09")) presetLabel = "Purchase + Cashout";
    else if (procCode.startsWith("30")) presetLabel = "Pre-Auth";
    else if (msgType === "0100") presetLabel = "Pre-Auth";
    else if (respCode !== "00") presetLabel = "Declined Purchase";
    else if (deviceType === "ECM") presetLabel = "Purchase (Online/ECM)";
    else if (deviceType === "MOB") presetLabel = "Mobile (Tap to Pay)";

    // Determine scheme from PAN prefix
    let schemeName = "Unknown";
    if (pan.startsWith("4")) schemeName = cardType === "C" ? (domesticInd === "I" ? "Visa International" : "Visa Credit") : "Visa";
    else if (pan.startsWith("5")) schemeName = cardType === "C" ? "MC Credit" : "Mastercard";
    else if (pan.startsWith("6")) schemeName = "eftpos";

    result.transactions.push({
      id: seq,
      preset: presetLabel,
      schemeName,
      merchantName: cardAccName.split(" ").slice(0, 2).join(" "),
      amountDisplay: `$${(amtAud / 100).toFixed(2)}`,
      messageType: msgType,
      processingCode: procCode,
      pan,
      amountCents: amtAud,
      cashCents: cashComp,
      surchCents: surchFee,
      transmissionDT: transDT,
      systemTrace: sysTrace,
      localTime,
      localDate,
      settlementDate: settlDate,
      expiryDate: expiry,
      mcc,
      posEntryMode: posEntry,
      posCondition,
      acquirerId,
      rrn,
      authId,
      responseCode: respCode,
      terminalId: termId,
      cardAcceptorId: cardAccId,
      cardAcceptorName: cardAccName,
      deviceType: deviceType || "POS",
      settlementInst: settlInst,
      walletProvider: walletProv,
      cardType,
      domestic: domesticInd,
      eftposRouted: eftposR,
    });
  }
  return result;
}

// CSV parser for DTE template format
function parseDTECsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { transactions: [], clientName: "", businessDate: "" };
  const headers = lines[0].split(",").map((h) => h.trim());
  const result = { transactions: [], clientName: "MX51", businessDate: "" };

  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(",");
    const row = {};
    headers.forEach((h, j) => { row[h] = (vals[j] || "").trim(); });
    const amtCents = parseInt(row.amount_aud_cents || row.amountCents || "0") || 0;
    const cashCents = parseInt(row.cash_component_cents || row.cashCents || "0") || 0;
    const surchCents = parseInt(row.surcharge_fee_cents || row.surchCents || "0") || 0;
    const msgType = row.message_type || row.messageType || "0200";
    const procCode = row.processing_code || row.processingCode || "000000";
    const pan = row.pan || "";
    const respCode = row.response_code || row.responseCode || "00";
    const devType = row.device_type || row.deviceType || "POS";

    let presetLabel = "Purchase (In-store)";
    if (msgType === "0400" || msgType === "0420") presetLabel = "Reversal";
    else if (procCode.startsWith("20")) presetLabel = "Refund";
    else if (procCode.startsWith("09")) presetLabel = "Purchase + Cashout";
    else if (procCode.startsWith("30")) presetLabel = "Pre-Auth";
    else if (respCode !== "00") presetLabel = "Declined Purchase";
    else if (devType === "ECM") presetLabel = "Purchase (Online/ECM)";
    else if (devType === "MOB") presetLabel = "Mobile (Tap to Pay)";

    let schemeName = "Unknown";
    const cardType = row.card_type || row.cardType || "";
    const domesticInd = row.domestic_indicator || row.domestic || "";
    if (pan.startsWith("4")) schemeName = cardType === "C" ? (domesticInd === "I" ? "Visa International" : "Visa Credit") : "Visa";
    else if (pan.startsWith("5")) schemeName = cardType === "C" ? "MC Credit" : "Mastercard";
    else if (pan.startsWith("6")) schemeName = "eftpos";

    const cardAccName = row.card_acceptor_name || row.cardAcceptorName || "";
    result.transactions.push({
      id: i,
      preset: presetLabel,
      schemeName,
      merchantName: cardAccName.split(" ").slice(0, 2).join(" ") || "Imported",
      amountDisplay: `$${(amtCents / 100).toFixed(2)}`,
      messageType: msgType,
      processingCode: procCode,
      pan,
      amountCents: amtCents,
      cashCents,
      surchCents,
      transmissionDT: row.transmission_datetime || row.transmissionDT || "",
      systemTrace: row.system_trace || row.systemTrace || String(100000 + i),
      localTime: row.local_time || row.localTime || "",
      localDate: row.local_date || row.localDate || "",
      settlementDate: row.settlement_date || row.settlementDate || "",
      expiryDate: row.expiry_date || row.expiryDate || "2712",
      mcc: row.merchant_category_code || row.mcc || "5411",
      posEntryMode: row.pos_entry_mode || row.posEntryMode || "071",
      posCondition: row.pos_condition_code || row.posCondition || "00",
      acquirerId: row.acquirer_id || row.acquirerId || "",
      rrn: row.retrieval_ref_number || row.rrn || "",
      authId: row.auth_id_response || row.authId || "",
      responseCode: respCode,
      terminalId: row.terminal_id || row.terminalId || "",
      cardAcceptorId: row.card_acceptor_id || row.cardAcceptorId || "",
      cardAcceptorName: cardAccName,
      deviceType: devType,
      settlementInst: row.settlement_institution || row.settlementInst || "CBA",
      walletProvider: row.wallet_provider || row.walletProvider || "",
      cardType,
      domestic: domesticInd,
      eftposRouted: row.eftpos_routed || row.eftposRouted || "0",
    });
  }
  return result;
}

function DTEGeneratorPage({ onIngestMLEs, onNavigate }) {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [clientName, setClientName] = useState("MX51");
  const [businessDate, setBusinessDate] = useState("2026-02-25");
  const [generatedFile, setGeneratedFile] = useState(null);
  const [importInfo, setImportInfo] = useState(null);
  const [enrichmentResult, setEnrichmentResult] = useState(null);
  const [enriching, setEnriching] = useState(false);

  // Quick-add form
  const [preset, setPreset] = useState("purchase");
  const [scheme, setScheme] = useState(0);
  const [merchant, setMerchant] = useState(0);
  const [amountDollars, setAmountDollars] = useState("50.00");
  const [cashoutDollars, setCashoutDollars] = useState("0.00");
  const [surcharge, setSurcharge] = useState("0.00");
  const [walletProvider, setWalletProvider] = useState("");
  const [eftposRouted, setEftposRouted] = useState("0");

  const addTransaction = () => {
    const p = DTE_PRESETS[preset];
    const s = DTE_SCHEMES[scheme];
    const m = DTE_MERCHANTS[merchant];
    const amtCents = Math.round(parseFloat(amountDollars || "0") * 100);
    const cashCents = Math.round(parseFloat(cashoutDollars || "0") * 100);
    const surchCents = Math.round(parseFloat(surcharge || "0") * 100);
    const seq = transactions.length + 1;
    const bd = businessDate.replace(/-/g, "").slice(4); // MMDD
    const pan = s.prefix + String(seq).padStart(6, "0");
    const rrn = "4" + String(Date.now()).slice(-11);
    const authId = String(80000 + seq).padStart(6, "0");
    const trace = String(100000 + seq);
    const time = `${String(8 + (seq % 10)).padStart(2, "0")}${String(15 + seq * 7).padStart(2, "0").slice(0, 2)}${String(seq * 13 % 60).padStart(2, "0")}`;

    setTransactions((prev) => [...prev, {
      id: seq,
      preset: p.label,
      schemeName: s.label,
      merchantName: m.name.split(" ").slice(0, 2).join(" "),
      amountDisplay: `$${(amtCents / 100).toFixed(2)}`,
      // DTE fields
      messageType: p.messageType,
      processingCode: p.processingCode,
      pan: pan.slice(0, 19),
      amountCents: amtCents,
      cashCents,
      surchCents,
      transmissionDT: `${bd}${time}`,
      systemTrace: trace,
      localTime: time,
      localDate: bd,
      settlementDate: bd,
      expiryDate: "2712",
      mcc: m.mcc,
      posEntryMode: p.posEntryMode,
      posCondition: p.posCondition,
      acquirerId: m.mid.slice(0, 11),
      rrn,
      authId,
      responseCode: p.responseCode,
      terminalId: m.tid,
      cardAcceptorId: m.mid,
      cardAcceptorName: m.name,
      deviceType: p.deviceType,
      settlementInst: "CBA",
      walletProvider,
      cardType: s.cardType,
      domestic: s.domestic,
      eftposRouted,
    }]);
    setAmountDollars(String((Math.random() * 400 + 10).toFixed(2)));
    addToast({ type: "success", title: "Transaction added", message: `${p.label} — ${s.label} — $${(amtCents / 100).toFixed(2)}` });
  };

  const removeTransaction = (id) => setTransactions((prev) => prev.filter((t) => t.id !== id));

  // File import handler
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      let parsed;
      let formatDetected;

      // Auto-detect format: DTE fixed-width vs CSV
      const firstLine = text.split(/\r?\n/)[0] || "";
      if (firstLine.startsWith("00000000DAILYTXN") || (firstLine.length >= 600 && !firstLine.includes(","))) {
        // DTE fixed-width file
        parsed = parseDTEFile(text);
        formatDetected = "DTE (fixed-width)";
      } else if (firstLine.includes(",")) {
        // CSV file
        parsed = parseDTECsv(text);
        formatDetected = "CSV";
      } else {
        addToast({ type: "warning", title: "Unrecognised format", message: "File doesn't appear to be a DTE or CSV file. Supported formats: .dte, .txt (DTE fixed-width), .csv (DTE template)" });
        e.target.value = "";
        return;
      }

      if (parsed.transactions.length === 0) {
        addToast({ type: "warning", title: "No transactions found", message: "The file was parsed but contained no detail records." });
        e.target.value = "";
        return;
      }

      // Re-number transaction IDs relative to existing list
      const startId = transactions.length > 0 ? Math.max(...transactions.map((t) => t.id)) + 1 : 1;
      const imported = parsed.transactions.map((t, i) => ({ ...t, id: startId + i }));

      setTransactions((prev) => [...prev, ...imported]);
      if (parsed.clientName) setClientName(parsed.clientName);
      if (parsed.businessDate) {
        const bd = parsed.businessDate;
        if (bd.length === 8) setBusinessDate(`${bd.slice(0, 4)}-${bd.slice(4, 6)}-${bd.slice(6, 8)}`);
      }
      setImportInfo({ filename: file.name, format: formatDetected, count: imported.length });
      addToast({ type: "success", title: `Imported ${imported.length} transactions`, message: `${file.name} (${formatDetected})` });
      e.target.value = "";
    };
    reader.readAsText(file);
  };

  // Ingest & Enrich — apply MSF fees and push to payout ledger as BTs
  const handleIngest = () => {
    if (transactions.length === 0) return;
    setEnriching(true);
    setEnrichmentResult(null);

    setTimeout(() => {
      const bd = businessDate.replace(/-/g, "");
      const dateFormatted = `${bd.slice(0, 4)}-${bd.slice(4, 6)}-${bd.slice(6, 8)}`;
      const enriched = [];

      transactions.forEach((t, i) => {
        const grossCents = t.amountCents;
        const scheme = t.schemeName || "Unknown";
        const msfInfo = MSF_RATES[scheme] || MSF_RATES["Unknown"];
        const isRefund = t.processingCode.startsWith("20") || t.messageType === "0400";
        const msfCents = Math.round(grossCents * msfInfo.rate);
        const netCents = isRefund ? -(grossCents - msfCents) : (grossCents - msfCents);

        // Determine merchant name — use cardAcceptorName or find matching DTE_MERCHANT
        const merchantMatch = DTE_MERCHANTS.find((m) => m.mid === t.cardAcceptorId);
        const merchantLabel = merchantMatch
          ? merchantMatch.name.split(" ").slice(0, 2).join(" ").replace(/'/g, "'")
          : (t.cardAcceptorName || "Unknown Merchant").split(" ").slice(0, 3).join(" ");

        const pan = t.pan || "";
        const maskedCard = `${scheme.split(" ")[0]} •••${pan.slice(-4)}`;

        enriched.push({
          id: `MLE-DTE-${Date.now()}-${i + 1}`,
          date: dateFormatted,
          merchant: merchantLabel,
          mid: t.cardAcceptorId || t.acquirerId || `MID-${i}`,
          type: isRefund ? "Refund" : "Purchase",
          amount: netCents / 100,
          card: maskedCard,
          // Enrichment metadata
          grossCents,
          msfCents,
          netCents,
          msfLabel: msfInfo.label,
          scheme,
          source: "DTE Generator",
        });
      });

      setEnrichmentResult({ enriched, totalGross: enriched.reduce((s, e) => s + e.grossCents, 0), totalMsf: enriched.reduce((s, e) => s + e.msfCents, 0), totalNet: enriched.reduce((s, e) => s + e.netCents, 0), merchantCount: new Set(enriched.map((e) => e.mid)).size });
      setEnriching(false);
    }, 1200);
  };

  const pushToLedger = () => {
    if (!enrichmentResult || !onIngestMLEs) return;
    onIngestMLEs(enrichmentResult.enriched);
    addToast({ type: "success", title: `${enrichmentResult.enriched.length} MLEs sent to payout ledger`, message: `Net amount: $${(enrichmentResult.totalNet / 100).toFixed(2)} across ${enrichmentResult.merchantCount} merchant(s)` });
    setEnrichmentResult(null);
    if (onNavigate) {
      setTimeout(() => onNavigate("payouts"), 600);
    }
  };

  const generateDTE = () => {
    if (transactions.length === 0) return;
    const RLEN = 700;
    const padN = (v, l) => String(parseInt(v || 0)).padStart(l, "0").slice(0, l);
    const padA = (v, l) => String(v || "").padEnd(l, " ").slice(0, l);
    const lines = [];

    // Header
    const bd = businessDate.replace(/-/g, "");
    lines.push(padN(0, 8) + padA("DAILYTXN", 8) + padA(clientName, 8) + padA("A", 1) + padA(bd, 8) + padA(bd, 8) + padA("", 659));

    // Details
    let totalAud = 0;
    transactions.forEach((t, i) => {
      let r = "";
      r += padN(i + 1, 8);                          // F1
      r += padA(t.messageType, 4);                   // F2
      r += padA(t.messageType === "0400" ? "0200" : "", 4); // F3
      r += padN(t.pan.length, 2);                    // F4
      r += padA(t.pan, 19);                          // F5
      r += padA(t.processingCode, 6);                // F6
      r += padN(t.amountCents, 12);                  // F7
      totalAud += t.amountCents;
      r += padN(t.amountCents, 12);                  // F8
      r += padN(t.amountCents, 12);                  // F9
      r += padA(t.transmissionDT, 10);               // F10
      r += padN(t.systemTrace, 6);                   // F11
      r += padA(t.localTime, 6);                     // F12
      r += padA(t.localDate, 4);                     // F13
      r += padA(t.expiryDate, 4);                    // F14
      r += padA(t.settlementDate, 4);                // F15
      r += padN(t.mcc, 4);                           // F16
      r += padN(36, 3);                              // F17
      r += padN(t.posEntryMode, 3);                  // F18
      r += padN(0, 3);                               // F19
      r += padN(t.posCondition, 2);                  // F20
      r += padA(t.acquirerId, 11);                   // F21
      r += padA(t.rrn, 12);                          // F22
      r += padA(t.authId, 6);                        // F23
      r += padA(t.responseCode, 2);                  // F24
      r += padA(t.terminalId, 8);                    // F25
      r += padA(t.cardAcceptorId, 15);               // F26
      r += padA(t.cardAcceptorName, 40);             // F27
      r += padN(36, 3);                              // F28
      r += padN(36, 3);                              // F29
      r += padN(t.cashCents, 12);                    // F30
      r += padA("", 42);                             // F31
      r += padA("", 28);                             // F32
      r += padA("", 28);                             // F33
      r += padA("", 11);                             // F34
      r += padA("1", 1);                             // F35
      r += padA(t.cardAcceptorId, 16);               // F36
      r += padA(t.deviceType, 3);                    // F37
      r += padA("mx51", 32);                         // F38
      r += padA("", 32);                             // F39
      r += padA(t.settlementInst, 8);                // F40
      r += padA("S", 1);                             // F41
      r += padN(t.surchCents, 8);                    // F42
      r += padA("", 40);                             // F43
      r += padA("NAD", 3);                           // F44
      r += padN(0, 12);                              // F45
      r += padN(0, 12);                              // F46
      r += padN(0, 1);                               // F47
      r += padN(0, 15);                              // F48
      r += padN(0, 3);                               // F49
      r += padN(0, 6);                               // F50
      r += padN(0, 4);                               // F51
      r += padN(0, 6);                               // F52
      r += padA(" ", 1);                             // F53
      r += padA(t.walletProvider, 20);               // F54
      r += padA(t.cardType, 1);                      // F55
      r += padA(t.domestic, 1);                      // F56
      r += padA(t.eftposRouted, 1);                  // F57
      r += padA("", 29);                             // F58
      const remaining = RLEN - r.length;
      r += padA("", remaining > 0 ? remaining : 0); // F59: Filler
      if (r.length > RLEN) r = r.slice(0, RLEN);
      lines.push(r);
    });

    // Trailer
    lines.push(padA("88888888", 8) + padN(transactions.length, 8) + padN(totalAud, 12) + padN(0, 12) + padA("", 660));

    // Filler
    lines.push("99999999" + "9".repeat(692));

    const content = lines.map((l) => l + "\r\n").join("");
    const blob = new Blob([content], { type: "text/plain;charset=ascii" });
    const url = URL.createObjectURL(blob);
    const filename = `DTE_${clientName}_${bd}.dte`;
    setGeneratedFile({ url, filename, recordCount: transactions.length, totalAud, size: content.length });
    addToast({ type: "success", title: "DTE file generated", message: `${transactions.length} records, ${(content.length / 1024).toFixed(1)} KB` });
  };

  return (
    <div className="p-6 space-y-5 max-w-5xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">DTE File Generator</h2>
        <p className="text-sm text-gray-500">Generate Cuscal DTE v6.0 files for testing. Build transactions using presets, then export a spec-compliant fixed-width file for S3 upload.</p>
      </div>

      {/* File settings */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4 flex-wrap">
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Client Name</label><input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} maxLength={8} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 w-28 font-mono focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Business Date</label><input type="date" value={businessDate} onChange={(e) => setBusinessDate(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" /></div>
            <div className="flex-1" />
            <div className="text-right">
              <span className="text-xs text-gray-400">Format: DTE v6.0 · 700 bytes/record · ASCII · CR+LF</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Import file */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17,8 12,3 7,8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800">Import File</h3>
              <p className="text-xs text-gray-500">Load transactions from an existing DTE file (.txt/.dte) or CSV template. Format is auto-detected.</p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
              Browse file
              <input type="file" accept=".dte,.txt,.csv,.DTE,.TXT,.CSV" onChange={handleFileImport} className="hidden" />
            </label>
          </div>
          {importInfo && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium">{importInfo.format}</span>
              <span className="text-gray-500">Loaded {importInfo.count} transactions from</span>
              <span className="font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{importInfo.filename}</span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick-add form */}
      <Card>
        <CardHeader><span className="text-sm font-semibold text-gray-800">Add Transaction</span></CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Transaction Type</label>
              <select value={preset} onChange={(e) => setPreset(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-200">
                {Object.entries(DTE_PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Card Scheme</label>
              <select value={scheme} onChange={(e) => setScheme(Number(e.target.value))} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-200">
                {DTE_SCHEMES.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Merchant</label>
              <select value={merchant} onChange={(e) => setMerchant(Number(e.target.value))} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-200">
                {DTE_MERCHANTS.map((m, i) => <option key={i} value={i}>{m.name.split(" ").slice(0, 2).join(" ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Amount (AUD)</label>
              <input type="text" value={amountDollars} onChange={(e) => setAmountDollars(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 font-mono focus:ring-2 focus:ring-indigo-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {preset === "purchaseCashout" && (
              <div><label className="block text-xs font-semibold text-gray-500 mb-1">Cashout Amount</label><input type="text" value={cashoutDollars} onChange={(e) => setCashoutDollars(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 font-mono focus:ring-2 focus:ring-indigo-200" /></div>
            )}
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Surcharge</label><input type="text" value={surcharge} onChange={(e) => setSurcharge(e.target.value)} placeholder="0.00" className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 font-mono focus:ring-2 focus:ring-indigo-200" /></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">Wallet</label><select value={walletProvider} onChange={(e) => setWalletProvider(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-200"><option value="">None</option><option value="Apple Pay">Apple Pay</option><option value="Google Pay">Google Pay</option><option value="Samsung Pay">Samsung Pay</option></select></div>
            <div><label className="block text-xs font-semibold text-gray-500 mb-1">eftpos Routed</label><select value={eftposRouted} onChange={(e) => setEftposRouted(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:ring-2 focus:ring-indigo-200"><option value="0">No</option><option value="1">Yes</option></select></div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="solid" colorScheme="brand" size="sm" onClick={addTransaction} leftIcon={<Icons.Plus />}>Add transaction</Button>
            <span className="text-xs text-gray-400">Message: {DTE_PRESETS[preset].messageType} · Processing: {DTE_PRESETS[preset].processingCode} · POS Entry: {DTE_PRESETS[preset].posEntryMode} · Response: {DTE_PRESETS[preset].responseCode}</span>
          </div>
        </CardBody>
      </Card>

      {/* Transaction list */}
      <Card>
        <CardHeader>
          <span className="text-sm font-semibold text-gray-800">Transactions ({transactions.length})</span>
          <div className="flex items-center gap-2">
            {transactions.length > 0 && <Button variant="outline" colorScheme="neutral" size="sm" onClick={() => { setTransactions([]); setEnrichmentResult(null); }}>Clear all</Button>}
            <Button variant="solid" colorScheme="brand" size="sm" disabled={transactions.length === 0} onClick={generateDTE} leftIcon={<Icons.ArrowSend />}>Generate DTE</Button>
            <Button variant="solid" colorScheme="neutral" size="sm" disabled={transactions.length === 0 || enriching} onClick={handleIngest} leftIcon={<Icons.DollarSign />}>{enriching ? "Enriching..." : "Ingest & Enrich"}</Button>
          </div>
        </CardHeader>
        <Divider />
        {transactions.length === 0 ? (
          <CardBody className="py-12 text-center"><p className="text-sm text-gray-400">No transactions yet. Use the form above to add transactions to the DTE file.</p></CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-2 px-3">#</th><th className="py-2 px-3">Type</th><th className="py-2 px-3">Scheme</th><th className="py-2 px-3">Merchant</th><th className="py-2 px-3">MsgType</th><th className="py-2 px-3">ProcCode</th><th className="py-2 px-3">Amount</th><th className="py-2 px-3">Response</th><th className="py-2 px-3">Device</th><th className="py-2 px-3"></th>
              </tr></thead>
              <tbody>{transactions.map((t, i) => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 text-xs">
                  <td className="py-2 px-3 font-mono text-gray-400">{i + 1}</td>
                  <td className="py-2 px-3 font-medium text-gray-700">{t.preset}</td>
                  <td className="py-2 px-3 text-gray-600">{t.schemeName}</td>
                  <td className="py-2 px-3 text-gray-600">{t.merchantName}</td>
                  <td className="py-2 px-3 font-mono text-gray-500">{t.messageType}</td>
                  <td className="py-2 px-3 font-mono text-gray-500">{t.processingCode}</td>
                  <td className="py-2 px-3 font-mono font-medium text-gray-800">{t.amountDisplay}</td>
                  <td className="py-2 px-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${t.responseCode === "00" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{t.responseCode}</span></td>
                  <td className="py-2 px-3 font-mono text-gray-500">{t.deviceType}</td>
                  <td className="py-2 px-3"><button onClick={() => removeTransaction(t.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Icons.Cross /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Enrichment result */}
      {enrichmentResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0"><span className="text-purple-600"><Icons.DollarSign /></span></div>
              <div>
                <span className="text-sm font-semibold text-gray-800">MSF Enrichment Complete</span>
                <p className="text-xs text-gray-500">{enrichmentResult.enriched.length} transactions enriched across {enrichmentResult.merchantCount} merchant(s)</p>
              </div>
            </div>
            <Button variant="solid" colorScheme="brand" size="sm" onClick={pushToLedger} leftIcon={<Icons.ArrowSend />}>Send to Payout Ledger</Button>
          </CardHeader>
          <Divider />
          <CardBody>
            {/* Summary metrics */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Gross Amount</p>
                <p className="text-lg font-bold text-gray-800">${(enrichmentResult.totalGross / 100).toFixed(2)}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wider mb-1">Total MSF</p>
                <p className="text-lg font-bold text-red-600">-${(enrichmentResult.totalMsf / 100).toFixed(2)}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <p className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider mb-1">Net to Merchant</p>
                <p className="text-lg font-bold text-emerald-700">${(enrichmentResult.totalNet / 100).toFixed(2)}</p>
              </div>
            </div>

            {/* Enriched transaction table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left">
                <thead><tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-2 px-3">#</th><th className="py-2 px-3">Merchant</th><th className="py-2 px-3">Scheme</th><th className="py-2 px-3">Type</th><th className="py-2 px-3 text-right">Gross</th><th className="py-2 px-3 text-right">MSF</th><th className="py-2 px-3 text-right">Net</th><th className="py-2 px-3">Rate</th>
                </tr></thead>
                <tbody>{enrichmentResult.enriched.map((e, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 text-xs">
                    <td className="py-2 px-3 font-mono text-gray-400">{i + 1}</td>
                    <td className="py-2 px-3 text-gray-700 font-medium">{e.merchant}</td>
                    <td className="py-2 px-3 text-gray-600">{e.scheme}</td>
                    <td className="py-2 px-3"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${e.type === "Refund" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{e.type}</span></td>
                    <td className="py-2 px-3 text-right font-mono text-gray-800">${(e.grossCents / 100).toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-red-600">-${(e.msfCents / 100).toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-700">${(e.netCents / 100).toFixed(2)}</td>
                    <td className="py-2 px-3 text-gray-500 text-[10px]">{e.msfLabel}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 mt-3">Clicking "Send to Payout Ledger" will add these as unassigned merchant ledger entries. Navigate to Payouts → Prepare Payout to sweep them into payout groups.</p>
          </CardBody>
        </Card>
      )}

      {/* Generated file download */}
      {generatedFile && (
        <Card>
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0"><span className="text-emerald-600"><Icons.Check /></span></div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-800">{generatedFile.filename}</h3>
                <p className="text-xs text-gray-500">{generatedFile.recordCount} records · ${(generatedFile.totalAud / 100).toFixed(2)} AUD total · {(generatedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <a href={generatedFile.url} download={generatedFile.filename} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Download .dte
              </a>
            </div>
          </CardBody>
        </Card>
      )}

      {/* CLI reference */}
      <Card>
        <CardBody>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-gray-500"><Icons.Code /></span></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">CLI Tool (for CI/CD)</h3>
              <p className="text-sm text-gray-500 mb-2">For batch generation, use the Python converter in <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">tools/dte-generator/</span></p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                <div className="text-gray-500"># Convert CSV template → DTE file</div>
                <div>python3 csv_to_dte.py my_test_data.csv -o output.dte --client MX51 --business-date 20260225</div>
                <div className="mt-2 text-gray-500"># Upload to S3 for ingestion</div>
                <div>aws s3 cp output.dte s3://cuscal-dte-inbox/</div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR + HEADER + MAIN APP
// ═══════════════════════════════════════════════════════════
function Sidebar({ activeItem, onNavigate, collapsed, onResetData }) {
  const navGroups = [
    { label: "MONITORING", items: [{ id: "organisations", label: "Organisations", icon: Icons.Buildings }, { id: "merchant-facilities", label: "Merchant facilities", icon: Icons.Shop }, { id: "terminals", label: "Terminals", icon: Icons.Terminal }, { id: "merchant-applications", label: "Merchant applications", icon: Icons.DocumentText }, { id: "users", label: "Users", icon: Icons.Profile }] },
    { label: "SETTLEMENTS", items: [{ id: "payouts", label: "Payouts", icon: Icons.Wallet }] },
    { label: "UTILITIES", items: [{ id: "support", label: "Support", icon: Icons.Lifebuoy }, { id: "developer", label: "Developer", icon: Icons.Code }, { id: "api-keys", label: "API keys", icon: Icons.Key }, { id: "alerts", label: "Alerts", icon: Icons.Danger, badge: 3 }] },
    { label: "PRODUCT DEVELOPMENT", items: [{ id: "debugging-tools", label: "Debugging Tools", icon: Icons.Beaker }, { id: "dte-generator", label: "DTE Generator", icon: Icons.DocumentText }, { id: "ux-artefacts", label: "UX Artefacts", icon: Icons.Layers }] },
  ];
  return (<aside className={`flex flex-col h-full bg-[#FAFAFD] border-r border-gray-200 transition-all flex-shrink-0 ${collapsed ? "w-0 overflow-hidden" : "w-[225px]"}`}>
    <div className="py-4 px-4 min-h-[70px] flex items-center"><a href="#" className="flex items-center gap-2" onClick={(e) => { e.preventDefault(); onNavigate("merchant-facilities"); }}><Icons.Logo /><span className="font-bold text-lg text-gray-800">mx51</span></a></div>
    <nav className="flex-1 px-2 overflow-y-auto">{navGroups.map((group) => (<div key={group.label} className="mb-4"><div className="px-3 py-2 text-[10px] font-semibold text-gray-400 tracking-wider uppercase">{group.label}</div>{group.items.map((item) => { const Icon = item.icon; const isActive = activeItem === item.id; return (<a key={item.id} href="#" onClick={(e) => { e.preventDefault(); onNavigate(item.id); }} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}><span className={isActive ? "text-indigo-600" : "text-gray-500"}><Icon /></span><span className="flex-1">{item.label}</span>{item.badge && <span className="bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{item.badge}</span>}</a>); })}</div>))}</nav>
    <div className="px-3 py-4 border-t border-gray-200"><div className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500 mb-2"><span className="font-medium">Timezone:</span><select className="bg-transparent text-xs text-gray-600 border-none focus:outline-none cursor-pointer"><option>Australia/Sydney</option><option>UTC</option></select></div><a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"><Icons.Logout /><span>Log out</span></a></div>
  </aside>);
}

function Header({ icon, heading, onToggleSidebar, role, onRoleChange, featureEnabled, onFeatureToggle }) {
  const Icon = icon;
  return (
    <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-200 bg-white">
      <button onClick={onToggleSidebar} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Icons.Menu /></button>
      <Icon /><h1 className="text-lg font-semibold text-gray-800 m-0">{heading}</h1>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Feature:</span>
          <button onClick={onFeatureToggle} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${featureEnabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>{featureEnabled ? "Enabled" : "Disabled"}</button>
        </div>
        <div className="w-px h-5 bg-gray-200" />
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Role:</span>
          <select value={role} onChange={(e) => onRoleChange(e.target.value)} className="text-xs bg-white border border-gray-200 rounded px-1.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-300">
            <option value={ROLES.FINOPS_T1}>FinOps Administrator</option>
            <option value={ROLES.FINOPS_T2}>FinOps View only</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ── URL hash helpers for refresh persistence ──
function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (!h) return { page: "payouts", detail: false, tab: null };
  const parts = h.split("/");
  const page = parts[0] || "payouts";
  const detail = parts[1] === "detail";
  const tab = parts[2] || null;
  return { page, detail, tab };
}
function buildHash(page, detail, tab) {
  let h = `#${page}`;
  if (detail) { h += "/detail"; if (tab) h += `/${tab}`; }
  return h;
}

export default function MSPSupportDashboard() {
  const initial = parseHash();
  const [activePage, setActivePage] = useState(initial.page);
  const [merchantDetailView, setMerchantDetailView] = useState(initial.detail);
  const [initialMerchantTab] = useState(initial.tab);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [role, setRole] = useState(ROLES.FINOPS_T1);
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [payouts, setPayouts] = useState(mockPayouts);
  const [unassignedMLEs, setUnassignedMLEs] = useState([...mockUnassignedMLEs]);
  const [holdRecords, setHoldRecords] = useState(initialHoldRecords);
  const [auditLogState, setAuditLogState] = useState({ ...auditLogs });

  const handleAuditAppend = useCallback((payoutId, entry) => {
    setAuditLogState((prev) => {
      const existing = prev[payoutId] || [];
      const version = existing.length > 0 ? Math.max(...existing.map(e => e.version || 0)) + 1 : 1;
      return { ...prev, [payoutId]: [...existing, { ...entry, version, ts: entry.ts || nowTimestamp() }] };
    });
  }, []);

  const [automationConfig, setAutomationConfig] = useState({
    fleet: { preparation: false, approval: false, beginTransfer: false },
    merchants: {}
  });

  const handlePayoutStatusChange = useCallback((payoutId, newStatus, extra) => {
    setPayouts((prev) => {
      // If it's a new payout (not found in existing list), add it
      if (extra && !prev.find((p) => p.id === payoutId) && extra.id) {
        // New payout — create initial audit log entry
        handleAuditAppend(payoutId, { change: "Payout prepared", initiatedBy: "System" });
        return [extra, ...prev];
      }
      return prev.map((p) => {
        if (p.id !== payoutId) return p;
        const updated = { ...p, status: newStatus };
        // Merge extra flags but exclude hold (holdRecords now manages this)
        if (extra && typeof extra === "object") {
          const { hold, ...otherExtra } = extra;
          Object.assign(updated, otherExtra);
        }
        return updated;
      });
    });
  }, [handleAuditAppend]);

  const handleCreateHold = useCallback((holdRecord) => {
    setHoldRecords((prev) => [...prev, holdRecord]);
  }, []);

  const handleReleaseHold = useCallback((holdId) => {
    setHoldRecords((prev) => prev.map((h) => (h.id === holdId ? { ...h, active: false } : h)));
  }, []);

  const handleResetData = useCallback(() => {
    setPayouts([...mockPayouts]);
    setUnassignedMLEs([...mockUnassignedMLEs]);
    setHoldRecords([...initialHoldRecords]);
    setAuditLogState({ ...auditLogs });
  }, []);

  // Ingest enriched MLEs from DTE Generator
  const handleIngestMLEs = useCallback((newMLEs) => {
    setUnassignedMLEs((prev) => [...prev, ...newMLEs]);
  }, []);

  const headings = { "organisations": { icon: Icons.Buildings, label: "Organisations" }, "merchant-facilities": { icon: Icons.Shop, label: "Merchant facilities" }, "terminals": { icon: Icons.Terminal, label: "Terminals" }, "users": { icon: Icons.Profile, label: "Users" }, "support": { icon: Icons.Lifebuoy, label: "Support" }, "developer": { icon: Icons.Code, label: "Developer" }, "api-keys": { icon: Icons.Key, label: "API keys" }, "alerts": { icon: Icons.Danger, label: "Alerts" }, "merchant-applications": { icon: Icons.DocumentText, label: "Merchant applications" }, "payouts": { icon: Icons.Wallet, label: "Payouts" }, "debugging-tools": { icon: Icons.Beaker, label: "Debugging Tools" }, "dte-generator": { icon: Icons.DocumentText, label: "DTE Generator" }, "ux-artefacts": { icon: Icons.Layers, label: "UX Artefacts" } };
  const currentHeading = headings[activePage] || headings["merchant-facilities"];
  const handleNav = (id) => { setActivePage(id); setMerchantDetailView(false); window.location.hash = buildHash(id, false, null); };

  // Sync hash when merchantDetailView changes
  const updateHash = useCallback((page, detail, tab) => {
    const newHash = buildHash(page, detail, tab);
    if (window.location.hash !== newHash) window.location.hash = newHash;
  }, []);

  // Listen for browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      const { page, detail } = parseHash();
      setActivePage(page);
      setMerchantDetailView(detail);
    };
    window.addEventListener("hashchange", onHashChange);
    // Set initial hash if empty
    if (!window.location.hash) window.location.hash = buildHash(activePage, merchantDetailView, null);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-[#F9FAFB] font-sans text-gray-900 overflow-hidden">
        <Sidebar activeItem={activePage} onNavigate={handleNav} collapsed={sidebarCollapsed} onResetData={handleResetData} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header icon={currentHeading.icon} heading={currentHeading.label} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} role={role} onRoleChange={setRole} featureEnabled={featureEnabled} onFeatureToggle={() => setFeatureEnabled(!featureEnabled)} />
          <main className="flex-1 overflow-y-auto bg-[#F9FAFB]">
            {activePage === "payouts" && <FleetPayoutsPage role={role} featureEnabled={featureEnabled} payouts={payouts} onPayoutStatusChange={handlePayoutStatusChange} unassignedMLEs={unassignedMLEs} holdRecords={holdRecords} onCreateHold={handleCreateHold} onReleaseHold={handleReleaseHold} automationConfig={automationConfig} onUpdateAutomationConfig={setAutomationConfig} auditLogState={auditLogState} onAuditAppend={handleAuditAppend} />}
            {activePage === "merchant-facilities" && merchantDetailView && <MerchantFacilityDetailPage role={role} payouts={payouts} onPayoutStatusChange={handlePayoutStatusChange} unassignedMLEs={unassignedMLEs} holdRecords={holdRecords} onCreateHold={handleCreateHold} onReleaseHold={handleReleaseHold} automationConfig={automationConfig} onUpdateAutomationConfig={setAutomationConfig} auditLogState={auditLogState} onAuditAppend={handleAuditAppend} initialTab={initialMerchantTab} onTabChange={(tab) => updateHash("merchant-facilities", true, tab)} />}
            {activePage === "merchant-facilities" && !merchantDetailView && <MerchantFacilitiesListPage onSelectMerchant={() => { setMerchantDetailView(true); updateHash("merchant-facilities", true, null); }} />}
            {activePage === "debugging-tools" && <DebuggingToolsPage onResetData={handleResetData} payouts={payouts} />}
            {activePage === "dte-generator" && <DTEGeneratorPage onIngestMLEs={handleIngestMLEs} onNavigate={handleNav} />}
            {activePage === "ux-artefacts" && <UXArtefactsPage />}
            {!["payouts", "merchant-facilities", "debugging-tools", "dte-generator", "ux-artefacts"].includes(activePage) && (<div className="p-6"><Card><CardBody className="py-16 text-center"><p className="text-gray-400 text-sm">{currentHeading.label} page content</p></CardBody></Card></div>)}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
