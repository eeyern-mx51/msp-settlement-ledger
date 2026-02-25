import { useState, useEffect, useCallback, createContext, useContext } from "react";

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
  Beaker: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h6M10 3v5.172a2 2 0 01-.586 1.414l-4.828 4.828A4 4 0 007.414 21h9.172a4 4 0 002.828-6.828l-4.828-4.828A2 2 0 0114 8.172V3" /><path d="M7 17h10" /></svg>),
  Layers: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 2,7 12,12 22,7" /><polyline points="2,17 12,22 22,17" /><polyline points="2,12 12,17 22,12" /></svg>),
  Shield: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
  DollarSign: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>),
  Plus: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  X: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  Lock: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>),
  Eye: () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>),
  AlertTriangle: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>),
  FileText: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" /><path d="M14 2v6h6" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></svg>),
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
        <Alert type="info" title="Review before approving">Once approved, this payout will move to "Ready for Transfer" and can be executed. Ensure the amounts and merchant details are correct.</Alert>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100">
          {[["Payout ID", payout.id], ["Merchant", payout.merchantName], ["MID", payout.mid], ["Amount", payout.amount], ["Transfers", payout.transferCount]].map(([label, value]) => (
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

function PausePayoutDialog({ open, onClose, payout, onConfirm }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(reason, note); onClose(); setReason(""); setNote(""); }, 1000);
  };
  if (!payout) return null;
  return (
    <Modal open={open} onClose={onClose} title="Pause payout">
      <div className="space-y-5">
        <Alert type="warning" title="This payout will be held">The payout will remain in a paused state until a FinOps Tier 1 user resumes or abandons it. No transfers will be initiated while paused.</Alert>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-100">
          {[["Payout ID", payout.id], ["Merchant", payout.merchantName], ["Amount", payout.amount], ["Current status", payout.status]].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm"><span className="text-gray-500 font-medium">{label}</span><span className="text-gray-800 font-semibold">{value}</span></div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for pausing</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
            <option value="">Select a reason...</option>
            <option>Pending merchant verification</option>
            <option>Suspicious activity review</option>
            <option>Bank details under review</option>
            <option>Regulatory hold</option>
            <option>Internal audit</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Internal note (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} rows={2} placeholder="Add context for the FinOps team..." className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none" />
          <p className="text-xs text-gray-400 mt-1">{note.length}/300 characters</p>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="solid" colorScheme="neutral" size="md" onClick={handleConfirm} disabled={loading || !reason} leftIcon={loading ? null : <Icons.Pause />}>{loading ? "Pausing..." : "Pause payout"}</Button>
        </div>
      </div>
    </Modal>
  );
}

function AbandonPayoutDialog({ open, onClose, payout, onConfirm }) {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const isConfirmed = confirmText === "ABANDON";
  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); onConfirm(reason); onClose(); setConfirmText(""); setReason(""); }, 1500);
  };
  if (!payout) return null;
  return (
    <Modal open={open} onClose={onClose} title="Abandon payout">
      <div className="space-y-5">
        <Alert type="error" title="This action is irreversible">Abandoning this payout will permanently cancel it. The merchant's funds will not be transferred. A new payout must be prepared to settle these transactions.</Alert>
        <div className="bg-red-50 rounded-lg p-4 space-y-2 border border-red-100">
          {[["Payout ID", payout.id], ["Merchant", payout.merchantName], ["Amount at risk", payout.amount], ["Transfers affected", payout.transferCount]].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm"><span className="text-red-600 font-medium">{label}</span><span className="text-red-800 font-semibold">{value}</span></div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for abandoning</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400">
            <option value="">Select a reason...</option>
            <option>Duplicate payout</option>
            <option>Merchant account closed</option>
            <option>Fraudulent activity confirmed</option>
            <option>Incorrect settlement calculation</option>
            <option>Merchant requested cancellation</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Type ABANDON to confirm</label>
          <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value.toUpperCase())} placeholder="ABANDON" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 font-mono tracking-wider focus:ring-2 focus:ring-red-200 focus:border-red-400" />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="solid" colorScheme="error" size="md" onClick={handleConfirm} disabled={loading || !isConfirmed || !reason} leftIcon={loading ? null : <Icons.Ban />}>{loading ? "Abandoning..." : "Abandon payout"}</Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Payout Status ───
function PayoutStatusBadge({ status }) {
  const cfg = { "Ready for Review": "info", "Ready for Transfer": "brand", "Transferring": "purple", "Paused": "warning", "Failed": "error", "Completed": "success", "Abandoned": "neutral" };
  return <Badge colorScheme={cfg[status] || "neutral"} size="sm">{status}</Badge>;
}

// ─── Global role context (simulated) ───
const ROLES = { FINOPS_T1: "FinOps Tier 1", FINOPS_T2: "FinOps Tier 2", ADMIN: "Administrator" };

// ═══════════════════════════════════════════════════════════
// MOCK DATA — Expanded
// ═══════════════════════════════════════════════════════════
const mockPayouts = [
  // 24 Feb — today
  { id: "PO-2026-0224-001", date: "24 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$5,112.40", transferCount: 1, status: "Ready for Review" },
  { id: "PO-2026-0224-002", date: "24 Feb 2026", merchantName: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: "$3,480.90", transferCount: 1, status: "Ready for Review" },
  { id: "PO-2026-0224-003", date: "24 Feb 2026", merchantName: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: "$1,875.20", transferCount: 1, status: "Ready for Review" },
  // 23 Feb
  { id: "PO-2026-0223-001", date: "23 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$4,821.50", transferCount: 1, status: "Ready for Transfer" },
  { id: "PO-2026-0223-002", date: "23 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$12,340.00", transferCount: 2, status: "Ready for Transfer" },
  { id: "PO-2026-0223-003", date: "23 Feb 2026", merchantName: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: "$7,215.60", transferCount: 1, status: "Transferring" },
  // 22 Feb
  { id: "PO-2026-0222-001", date: "22 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$3,617.80", transferCount: 1, status: "Completed" },
  { id: "PO-2026-0222-002", date: "22 Feb 2026", merchantName: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: "$8,990.25", transferCount: 1, status: "Completed" },
  { id: "PO-2026-0222-003", date: "22 Feb 2026", merchantName: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: "$2,640.15", transferCount: 1, status: "Completed" },
  // 21 Feb
  { id: "PO-2026-0221-001", date: "21 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$15,204.60", transferCount: 2, status: "Completed" },
  { id: "PO-2026-0221-002", date: "21 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$2,945.30", transferCount: 1, status: "Completed" },
  { id: "PO-2026-0221-003", date: "21 Feb 2026", merchantName: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: "$4,310.75", transferCount: 1, status: "Completed" },
  // 20 Feb — failures and issues
  { id: "PO-2026-0220-001", date: "20 Feb 2026", merchantName: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: "$6,112.75", transferCount: 1, status: "Failed" },
  { id: "PO-2026-0220-002", date: "20 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$9,801.00", transferCount: 1, status: "Paused" },
  { id: "PO-2026-0220-003", date: "20 Feb 2026", merchantName: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: "$1,925.40", transferCount: 1, status: "Failed" },
  // 19 Feb
  { id: "PO-2026-0219-001", date: "19 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$1,420.00", transferCount: 1, status: "Abandoned" },
  { id: "PO-2026-0219-002", date: "19 Feb 2026", merchantName: "Coastal Surf Shop - Gold Coast", mid: "POSPAY00012349", amount: "$3,780.50", transferCount: 1, status: "Completed" },
  // 18 Feb
  { id: "PO-2026-0218-001", date: "18 Feb 2026", merchantName: "Mike's Electronics", mid: "POSPAY00012346", amount: "$22,640.00", transferCount: 3, status: "Completed" },
  { id: "PO-2026-0218-002", date: "18 Feb 2026", merchantName: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", amount: "$4,190.25", transferCount: 1, status: "Completed" },
  { id: "PO-2026-0218-003", date: "18 Feb 2026", merchantName: "Fresh Mart - Brisbane", mid: "POSPAY00012347", amount: "$11,405.80", transferCount: 2, status: "Completed" },
  // 17 Feb
  { id: "PO-2026-0217-001", date: "17 Feb 2026", merchantName: "Bella's Boutique - Melbourne", mid: "POSPAY00012348", amount: "$5,330.60", transferCount: 1, status: "Abandoned" },
];

// ─── Per-payout audit logs ───
const auditLogs = {
  // Ready for Review — just prepared
  "PO-2026-0224-001": [
    { ts: "24 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 18 transactions included, totalling $5,112.40." },
    { ts: "24 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
  ],
  "PO-2026-0224-002": [
    { ts: "24 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 11 transactions included, totalling $3,480.90." },
    { ts: "24 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
  ],
  "PO-2026-0224-003": [
    { ts: "24 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 8 transactions included, totalling $1,875.20." },
    { ts: "24 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
  ],
  // Ready for Transfer — approved but not executed
  "PO-2026-0223-001": [
    { ts: "23 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 14 transactions included." },
    { ts: "23 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "23 Feb 2026, 9:45 AM", action: "Approved", user: "Sarah Chen (FinOps T1)", detail: "Reviewed and confirmed amounts. Status changed to Ready for Transfer." },
  ],
  "PO-2026-0223-002": [
    { ts: "23 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 31 transactions included." },
    { ts: "23 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "23 Feb 2026, 10:20 AM", action: "Approved", user: "Tom Wright (FinOps T1)", detail: "Two transfers will be created (split by bank account). Status changed to Ready for Transfer." },
  ],
  // Transferring — in progress
  "PO-2026-0223-003": [
    { ts: "23 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 24 transactions included." },
    { ts: "23 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "23 Feb 2026, 8:30 AM", action: "Approved", user: "Sarah Chen (FinOps T1)", detail: "Status changed to Ready for Transfer." },
    { ts: "23 Feb 2026, 11:00 AM", action: "Execute triggered", user: "Sarah Chen (FinOps T1)", detail: "Transfer initiated to BSB 084-004 / Acc 56781234." },
    { ts: "23 Feb 2026, 11:00 AM", action: "Status changed to Transferring", user: "System", detail: "Cuscal DE credit submitted. Awaiting confirmation." },
  ],
  // Completed — full lifecycle
  "PO-2026-0222-001": [
    { ts: "22 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 16 transactions included." },
    { ts: "22 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "22 Feb 2026, 9:10 AM", action: "Approved", user: "Tom Wright (FinOps T1)", detail: "Status changed to Ready for Transfer." },
    { ts: "22 Feb 2026, 10:00 AM", action: "Execute triggered", user: "Tom Wright (FinOps T1)", detail: "Transfer initiated to BSB 062-000 / Acc 12345678." },
    { ts: "22 Feb 2026, 10:00 AM", action: "Status changed to Transferring", user: "System", detail: "Cuscal transfer in progress." },
    { ts: "22 Feb 2026, 1:45 PM", action: "Transfer completed", user: "System", detail: "DE credit confirmed. Transfer ID: TRF-2026-0222-001." },
    { ts: "22 Feb 2026, 1:45 PM", action: "Status changed to Completed", user: "System", detail: "Payout finalised." },
  ],
  "PO-2026-0221-001": [
    { ts: "21 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 47 transactions included." },
    { ts: "21 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "21 Feb 2026, 10:15 AM", action: "Approved", user: "Sarah Chen (FinOps T1)", detail: "Large payout — verified with manager. Status changed to Ready for Transfer." },
    { ts: "21 Feb 2026, 11:00 AM", action: "Execute triggered", user: "Sarah Chen (FinOps T1)", detail: "2 transfers initiated (split by account)." },
    { ts: "21 Feb 2026, 11:00 AM", action: "Status changed to Transferring", user: "System", detail: "Cuscal transfers in progress." },
    { ts: "21 Feb 2026, 2:30 PM", action: "Transfer 1 completed", user: "System", detail: "DE credit confirmed. TRF-2026-0221-001: $10,204.60 to BSB 033-001 / Acc 44556677." },
    { ts: "21 Feb 2026, 2:35 PM", action: "Transfer 2 completed", user: "System", detail: "DE credit confirmed. TRF-2026-0221-002: $5,000.00 to BSB 033-001 / Acc 44556688." },
    { ts: "21 Feb 2026, 2:35 PM", action: "Status changed to Completed", user: "System", detail: "All transfers confirmed. Payout finalised." },
  ],
  // Failed — with error detail
  "PO-2026-0220-001": [
    { ts: "20 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 18 transactions included." },
    { ts: "20 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "20 Feb 2026, 10:30 AM", action: "Approved", user: "Sarah Chen (FinOps T1)", detail: "Status changed to Ready for Transfer." },
    { ts: "20 Feb 2026, 11:15 AM", action: "Execute triggered", user: "Sarah Chen (FinOps T1)", detail: "Transfer initiated to BSB 062-999 / Acc 87654321." },
    { ts: "20 Feb 2026, 11:15 AM", action: "Transfer failed", user: "System", detail: "DE credit rejected by Cuscal. Reason: Invalid BSB (062-999). Non-retryable — merchant bank details must be corrected." },
    { ts: "20 Feb 2026, 11:15 AM", action: "Status changed to Failed", user: "System", detail: "Transfer ID: TRF-2026-0220-001." },
  ],
  "PO-2026-0220-003": [
    { ts: "20 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 9 transactions included." },
    { ts: "20 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "20 Feb 2026, 11:00 AM", action: "Approved", user: "Tom Wright (FinOps T1)", detail: "Status changed to Ready for Transfer." },
    { ts: "20 Feb 2026, 12:30 PM", action: "Execute triggered", user: "Tom Wright (FinOps T1)", detail: "Transfer initiated to BSB 013-140 / Acc 99887766." },
    { ts: "20 Feb 2026, 12:35 PM", action: "Transfer failed", user: "System", detail: "Cuscal gateway timeout — no response within SLA. Retryable." },
    { ts: "20 Feb 2026, 12:35 PM", action: "Status changed to Failed", user: "System", detail: "Transfer ID: TRF-2026-0220-003." },
  ],
  // Paused
  "PO-2026-0220-002": [
    { ts: "20 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 28 transactions included." },
    { ts: "20 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "20 Feb 2026, 9:00 AM", action: "Approved", user: "Tom Wright (FinOps T1)", detail: "Status changed to Ready for Transfer." },
    { ts: "20 Feb 2026, 9:45 AM", action: "Paused", user: "Sarah Chen (FinOps T1)", detail: "Reason: Suspicious activity review. Unusually high payout amount flagged for manual verification." },
    { ts: "20 Feb 2026, 9:45 AM", action: "Status changed to Paused", user: "System", detail: "Payout held pending review." },
  ],
  // Abandoned
  "PO-2026-0219-001": [
    { ts: "19 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 6 transactions included." },
    { ts: "19 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "19 Feb 2026, 11:00 AM", action: "Abandoned", user: "Tom Wright (FinOps T1)", detail: "Merchant requested payout deferral to next cycle. Transactions will be re-included in next preparation." },
    { ts: "19 Feb 2026, 11:00 AM", action: "Status changed to Abandoned", user: "System", detail: "Payout abandoned. Funds returned to merchant ledger." },
  ],
  "PO-2026-0217-001": [
    { ts: "17 Feb 2026, 6:00 AM", action: "Payout prepared", user: "System", detail: "Merchant balance swept. 15 transactions included." },
    { ts: "17 Feb 2026, 6:01 AM", action: "Status changed to Ready for Review", user: "System", detail: "Awaiting FinOps approval." },
    { ts: "17 Feb 2026, 3:00 PM", action: "Abandoned", user: "Sarah Chen (FinOps T1)", detail: "Duplicate payout detected — merchant was already paid via manual bank transfer. Abandoning to prevent double payment." },
    { ts: "17 Feb 2026, 3:00 PM", action: "Status changed to Abandoned", user: "System", detail: "Payout abandoned." },
  ],
};

// Fallback audit log for payouts without a specific log
const defaultAuditLog = (payout) => [
  { ts: payout.date + ", 6:00 AM", action: "Payout prepared", user: "System", detail: `Merchant balance swept. Payout of ${payout.amount} created.` },
  { ts: payout.date + ", 6:01 AM", action: "Status changed to " + payout.status, user: "System", detail: "Current status." },
];

// ─── Per-payout transfers ───
const transfersByPayout = {
  "PO-2026-0222-001": [
    { id: "TRF-2026-0222-001", date: "22 Feb 2026, 10:00 AM", amount: "$3,617.80", status: "Completed", bsb: "062-000", account: "12345678", failureReason: null, retryable: null },
  ],
  "PO-2026-0222-002": [
    { id: "TRF-2026-0222-002", date: "22 Feb 2026, 10:15 AM", amount: "$8,990.25", status: "Completed", bsb: "084-004", account: "56781234", failureReason: null, retryable: null },
  ],
  "PO-2026-0222-003": [
    { id: "TRF-2026-0222-003", date: "22 Feb 2026, 10:20 AM", amount: "$2,640.15", status: "Completed", bsb: "013-140", account: "99887766", failureReason: null, retryable: null },
  ],
  "PO-2026-0221-001": [
    { id: "TRF-2026-0221-001", date: "21 Feb 2026, 11:00 AM", amount: "$10,204.60", status: "Completed", bsb: "033-001", account: "44556677", failureReason: null, retryable: null },
    { id: "TRF-2026-0221-002", date: "21 Feb 2026, 11:00 AM", amount: "$5,000.00", status: "Completed", bsb: "033-001", account: "44556688", failureReason: null, retryable: null },
  ],
  "PO-2026-0221-002": [
    { id: "TRF-2026-0221-003", date: "21 Feb 2026, 11:30 AM", amount: "$2,945.30", status: "Completed", bsb: "062-000", account: "12345678", failureReason: null, retryable: null },
  ],
  "PO-2026-0221-003": [
    { id: "TRF-2026-0221-004", date: "21 Feb 2026, 12:00 PM", amount: "$4,310.75", status: "Completed", bsb: "124-001", account: "33221100", failureReason: null, retryable: null },
  ],
  "PO-2026-0223-003": [
    { id: "TRF-2026-0223-001", date: "23 Feb 2026, 11:00 AM", amount: "$7,215.60", status: "Pending", bsb: "084-004", account: "56781234", failureReason: null, retryable: null },
  ],
  "PO-2026-0220-001": [
    { id: "TRF-2026-0220-001", date: "20 Feb 2026, 11:15 AM", amount: "$6,112.75", status: "Failed", bsb: "062-999", account: "87654321", failureReason: "Invalid BSB — bank rejected the DE credit", retryable: false },
  ],
  "PO-2026-0220-003": [
    { id: "TRF-2026-0220-003", date: "20 Feb 2026, 12:30 PM", amount: "$1,925.40", status: "Failed", bsb: "013-140", account: "99887766", failureReason: "Timeout — Cuscal gateway did not respond within SLA", retryable: true },
  ],
  "PO-2026-0219-002": [
    { id: "TRF-2026-0219-001", date: "19 Feb 2026, 11:00 AM", amount: "$3,780.50", status: "Completed", bsb: "124-001", account: "33221100", failureReason: null, retryable: null },
  ],
  "PO-2026-0218-001": [
    { id: "TRF-2026-0218-001", date: "18 Feb 2026, 10:00 AM", amount: "$10,000.00", status: "Completed", bsb: "033-001", account: "44556677", failureReason: null, retryable: null },
    { id: "TRF-2026-0218-002", date: "18 Feb 2026, 10:00 AM", amount: "$8,640.00", status: "Completed", bsb: "033-001", account: "44556688", failureReason: null, retryable: null },
    { id: "TRF-2026-0218-003", date: "18 Feb 2026, 10:00 AM", amount: "$4,000.00", status: "Completed", bsb: "033-002", account: "44556699", failureReason: null, retryable: null },
  ],
  "PO-2026-0218-002": [
    { id: "TRF-2026-0218-004", date: "18 Feb 2026, 10:30 AM", amount: "$4,190.25", status: "Completed", bsb: "062-000", account: "12345678", failureReason: null, retryable: null },
  ],
  "PO-2026-0218-003": [
    { id: "TRF-2026-0218-005", date: "18 Feb 2026, 10:30 AM", amount: "$6,000.00", status: "Completed", bsb: "084-004", account: "56781234", failureReason: null, retryable: null },
    { id: "TRF-2026-0218-006", date: "18 Feb 2026, 10:30 AM", amount: "$5,405.80", status: "Completed", bsb: "084-004", account: "56781235", failureReason: null, retryable: null },
  ],
};

// ─── Adjustments — expanded ───
const mockAdjustments = [
  { id: "ADJ-2026-0224-001", date: "24 Feb 2026", amount: "$350.00", type: "Manual", reason: "Chargeback recovery", payoutId: "PO-2026-0224-001", status: "Pending approval", internalNote: "Chargeback CB-88210 was resolved in merchant's favour. Returning deducted amount.", externalDesc: "Chargeback reversal — dispute resolved in your favour." },
  { id: "ADJ-2026-0223-001", date: "23 Feb 2026", amount: "$125.00", type: "Manual", reason: "Customer goodwill credit", payoutId: "PO-2026-0223-001", status: "Pending approval", internalNote: "Customer complained about delayed settlement on 3 transactions. Approved by ops manager.", externalDesc: "Goodwill adjustment for service delay." },
  { id: "ADJ-2026-0223-002", date: "23 Feb 2026", amount: "-$82.30", type: "Auto", reason: "Scheme fee rebate", payoutId: "PO-2026-0223-002", status: "Approved", internalNote: "Visa scheme fee rebate for Q4 2025 applied automatically. Ref: VSR-2026-Q4-0012.", externalDesc: "Visa scheme fee rebate — Q4 2025." },
  { id: "ADJ-2026-0222-001", date: "22 Feb 2026", amount: "-$45.50", type: "Auto", reason: "Fee correction", payoutId: "PO-2026-0222-001", status: "Approved", internalNote: "Surcharge fee was incorrectly applied at 1.5% instead of 1.2% on 6 transactions.", externalDesc: "Fee correction for surcharge miscalculation." },
  { id: "ADJ-2026-0222-002", date: "22 Feb 2026", amount: "$500.00", type: "Manual", reason: "Settlement discrepancy", payoutId: "PO-2026-0222-002", status: "Rejected", internalNote: "Merchant claimed $500 missing from settlement. Investigation found amounts correct — merchant miscounted transactions.", externalDesc: "Settlement discrepancy investigation." },
  { id: "ADJ-2026-0221-001", date: "21 Feb 2026", amount: "$200.00", type: "Manual", reason: "Promotional credit", payoutId: "PO-2026-0221-002", status: "Approved", internalNote: "Part of Feb 2026 onboarding promotion. Reference: PROMO-FEB26-COFFEE.", externalDesc: "Promotional credit — onboarding campaign." },
  { id: "ADJ-2026-0220-001", date: "20 Feb 2026", amount: "-$1,200.00", type: "Manual", reason: "Chargeback recovery", payoutId: "PO-2026-0220-001", status: "Approved", internalNote: "Chargeback CB-77104 — cardholder dispute for unauthorised transaction. Deducted from merchant payout.", externalDesc: "Chargeback deduction — dispute CB-77104." },
  { id: "ADJ-2026-0218-001", date: "18 Feb 2026", amount: "$75.00", type: "Auto", reason: "Fee correction", payoutId: "PO-2026-0218-001", status: "Approved", internalNote: "Terminal rental fee was double-charged in January billing cycle.", externalDesc: "Terminal rental fee correction — January double charge." },
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
  return (<div className="relative">{entries.map((entry, i) => (<div key={i} className="flex gap-4 pb-6 last:pb-0"><div className="flex flex-col items-center"><div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${entry.action.includes("failed") || entry.action.includes("Failed") ? "bg-red-500" : i === entries.length - 1 ? "bg-indigo-500" : "bg-gray-300"}`} />{i < entries.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}</div><div className="flex-1 min-w-0"><div className="flex items-baseline gap-2 flex-wrap"><span className={`text-sm font-semibold ${entry.action.includes("failed") || entry.action.includes("Failed") ? "text-red-700" : "text-gray-800"}`}>{entry.action}</span><span className="text-xs text-gray-400">{entry.ts}</span></div><div className="text-sm text-gray-500 mt-0.5">{entry.detail}</div><div className="text-xs text-gray-400 mt-0.5">by {entry.user}</div></div></div>))}</div>);
}

// ═══════════════════════════════════════════════════════════
// PAYOUT DETAIL VIEW (with transfer failure reporting)
// ═══════════════════════════════════════════════════════════
function PayoutDetailView({ payout, onBack, role, onStatusChange }) {
  const { addToast } = useToast();
  const canWrite = role === ROLES.FINOPS_T1;
  const isFailed = payout.status === "Failed";
  const isCompleted = payout.status === "Completed";
  const isAbandoned = payout.status === "Abandoned";
  const auditLog = auditLogs[payout.id] || defaultAuditLog(payout);
  const transfers = transfersByPayout[payout.id] || [];
  const failedTransfer = transfers.find(t => t.status === "Failed");

  // Dialog states
  const [showApprove, setShowApprove] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [showAbandon, setShowAbandon] = useState(false);

  const allActions = {
    "Ready for Review": [
      { label: "Approve", icon: Icons.Check, variant: "solid", colorScheme: "brand", action: () => setShowApprove(true) },
      { label: "Pause", icon: Icons.Pause, variant: "outline", colorScheme: "neutral", action: () => setShowPause(true) },
      { label: "Abandon", icon: Icons.Ban, variant: "outline", colorScheme: "error", action: () => setShowAbandon(true) },
    ],
    "Ready for Transfer": [
      { label: "Execute", icon: Icons.Play, variant: "solid", colorScheme: "brand", action: () => { addToast({ type: "success", title: "Transfer initiated", message: `Payout ${payout.id} is now transferring to the merchant's bank.` }); onStatusChange(payout.id, "Transferring"); } },
      { label: "Pause", icon: Icons.Pause, variant: "outline", colorScheme: "neutral", action: () => setShowPause(true) },
      { label: "Abandon", icon: Icons.Ban, variant: "outline", colorScheme: "error", action: () => setShowAbandon(true) },
    ],
    "Paused": [
      { label: "Resume", icon: Icons.Play, variant: "solid", colorScheme: "brand", action: () => { addToast({ type: "success", title: "Payout resumed", message: `Payout ${payout.id} has been moved back to Ready for Review.` }); onStatusChange(payout.id, "Ready for Review"); } },
      { label: "Abandon", icon: Icons.Ban, variant: "outline", colorScheme: "error", action: () => setShowAbandon(true) },
    ],
    "Failed": [
      { label: "Retry", icon: Icons.Refresh, variant: "solid", colorScheme: "brand", action: () => { addToast({ type: "success", title: "Retry initiated", message: `Payout ${payout.id} has been queued for re-transfer.` }); onStatusChange(payout.id, "Transferring"); } },
      { label: "Abandon", icon: Icons.Ban, variant: "outline", colorScheme: "error", action: () => setShowAbandon(true) },
    ],
  };
  const currentActions = allActions[payout.status] || [];

  const handleApprove = () => {
    addToast({ type: "success", title: "Payout approved", message: `${payout.id} is now ready for transfer.` });
    onStatusChange(payout.id, "Ready for Transfer");
  };
  const handlePause = (reason, note) => {
    addToast({ type: "warning", title: "Payout paused", message: `${payout.id} — ${reason}` });
    onStatusChange(payout.id, "Paused");
  };
  const handleAbandon = (reason) => {
    addToast({ type: "error", title: "Payout abandoned", message: `${payout.id} has been permanently cancelled.` });
    onStatusChange(payout.id, "Abandoned");
  };

  return (
    <div className="p-6 space-y-5">
      <ApprovePayoutDialog open={showApprove} onClose={() => setShowApprove(false)} payout={payout} onConfirm={handleApprove} />
      <PausePayoutDialog open={showPause} onClose={() => setShowPause(false)} payout={payout} onConfirm={handlePause} />
      <AbandonPayoutDialog open={showAbandon} onClose={() => setShowAbandon(false)} payout={payout} onConfirm={handleAbandon} />

      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"><Icons.ChevronLeft /> Back to payouts</button>

      {isFailed && failedTransfer && (<Alert type="error" title={`Transfer failed — ${failedTransfer.retryable ? "Retryable" : "Non-retryable"}`}>{failedTransfer.failureReason}{!failedTransfer.retryable ? ". The merchant's bank details need to be corrected before this payout can be retried." : ". This transfer can be automatically retried."}</Alert>)}
      {isFailed && !failedTransfer && (<Alert type="error" title="Transfer failed">Transfer details unavailable. Check audit log for more information.</Alert>)}
      {isAbandoned && (<Alert type="warning" title="Payout abandoned">This payout has been permanently cancelled. A new payout must be prepared to settle the affected transactions.</Alert>)}

      {role === ROLES.FINOPS_T2 && (<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-500"><Icons.Eye /> <span>You have read-only access. Contact a FinOps Tier 1 user to perform actions.</span></div>)}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3"><span className="text-lg font-semibold text-gray-800">Payout {payout.id}</span><PayoutStatusBadge status={payout.status} /></div>
          {canWrite && currentActions.length > 0 && (<div className="flex gap-2">{currentActions.map((a) => (<Button key={a.label} variant={a.variant} colorScheme={a.colorScheme} size="sm" leftIcon={<a.icon />} onClick={a.action}>{a.label}</Button>))}</div>)}
          {!canWrite && currentActions.length > 0 && (<div className="flex gap-2">{currentActions.map((a) => (<Button key={a.label} variant={a.variant} colorScheme={a.colorScheme} size="sm" leftIcon={<a.icon />} disabled>{a.label}</Button>))}</div>)}
        </CardHeader>
        <Divider />
        <CardBody className="pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-4">
            {[["Payout ID", <span className="font-mono">{payout.id}</span>], ["Payout date", payout.date], ["Merchant", payout.merchantName], ["MID", <Badge colorScheme="neutral" size="sm">{payout.mid}</Badge>], ["Payout amount", <span className="font-semibold text-gray-900">{payout.amount}</span>], ["Transfer count", payout.transferCount], ["Status", <PayoutStatusBadge status={payout.status} />]].map(([label, value]) => (
              <div key={label} className="contents"><div className="text-sm font-semibold text-gray-500">{label}</div><div className="text-sm text-gray-700 flex items-center">{value}</div></div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader><span className="text-lg font-semibold text-gray-800">Transfers</span></CardHeader>
        <Divider />
        <CardBody className="pt-4">
          {transfers.length === 0 ? <Alert type="info">No transfers have been initiated for this payout yet.</Alert> : (
            <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-gray-200">
              {["Transfer ID", "Date", "BSB", "Account", "Amount", "Status", ...(isFailed ? ["Failure reason"] : [])].map((h) => <TH key={h}>{h}</TH>)}
            </tr></thead><tbody>
              {transfers.map((t) => (
                <tr key={t.id} className={`border-b border-gray-100 ${t.status === "Failed" ? "bg-red-50/50" : ""}`}>
                  <td className="py-3 px-3 text-sm font-mono text-gray-700">{t.id}</td>
                  <td className="py-3 px-3 text-sm text-gray-700">{t.date}</td>
                  <td className="py-3 px-3 text-sm font-mono text-gray-700">{t.bsb}</td>
                  <td className="py-3 px-3 text-sm font-mono text-gray-700">{t.account}</td>
                  <td className="py-3 px-3 text-sm font-semibold text-gray-900">{t.amount}</td>
                  <td className="py-3 px-3"><Badge colorScheme={t.status === "Failed" ? "error" : "success"} size="sm">{t.status}</Badge></td>
                  {isFailed && <td className="py-3 px-3 text-sm text-red-600 max-w-[300px]"><div className="flex items-start gap-1.5"><Icons.AlertTriangle /><div><div>{t.failureReason}</div><div className="text-xs mt-1"><Badge colorScheme={t.retryable === false ? "error" : "warning"} size="sm">{t.retryable === false ? "Non-retryable" : "Retryable"}</Badge></div></div></div></td>}
                </tr>
              ))}
            </tbody></table></div>
          )}
        </CardBody>
      </Card>

      <Card><CardHeader><span className="text-lg font-semibold text-gray-800">Audit log</span></CardHeader><Divider /><CardBody className="pt-4"><AuditTimeline entries={auditLog} /></CardBody></Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PREPARE PAYOUT DIALOG
// ═══════════════════════════════════════════════════════════
function PreparePayoutDialog({ open, onClose }) {
  const [fromDate, setFromDate] = useState("2026-02-17");
  const [toDate, setToDate] = useState("2026-02-23");
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title="Prepare payout">
      <div className="space-y-5">
        <Alert type="warning" title="This action will sweep merchant balances">All unsettled transactions in the selected date range will be included in new payout records. Merchant balances will be set to zero.</Alert>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">From date</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">To date</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" /></div>
        </div>
        <label className="flex items-start gap-2 cursor-pointer"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 rounded border-gray-300" /><span className="text-sm text-gray-700">I confirm I want to prepare payouts for all merchants in this date range. This action cannot be undone.</span></label>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="solid" colorScheme="brand" size="md" disabled={!confirmed} leftIcon={<Icons.DollarSign />}>Prepare payout</Button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// CREATE ADJUSTMENT DIALOG
// ═══════════════════════════════════════════════════════════
function CreateAdjustmentDialog({ open, onClose }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [info, setInfo] = useState("");
  const [extDesc, setExtDesc] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Create adjustment">
      <div className="space-y-4">
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Amount (AUD)</label><input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 125.00 or -45.50" className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" /><p className="text-xs text-gray-400 mt-1">Use negative for debits. Value in dollars.</p></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Reason</label><select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"><option value="">Select a reason...</option><option>Customer goodwill credit</option><option>Fee correction</option><option>Promotional credit</option><option>Chargeback recovery</option><option>Settlement discrepancy</option><option>Other</option></select></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">Internal note</label><textarea value={info} onChange={(e) => setInfo(e.target.value)} maxLength={500} rows={3} placeholder="Internal context for FinOps team (not shown to merchant)..." className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none" /><p className="text-xs text-gray-400 mt-1">{info.length}/500 characters</p></div>
        <div><label className="block text-sm font-semibold text-gray-700 mb-1">External description</label><textarea value={extDesc} onChange={(e) => setExtDesc(e.target.value)} maxLength={250} rows={2} placeholder="Description visible to the merchant on their statement..." className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 resize-none" /><p className="text-xs text-gray-400 mt-1">{extDesc.length}/250 characters</p></div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <Button variant="outline" colorScheme="neutral" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="solid" colorScheme="brand" size="md" disabled={!amount || !reason} leftIcon={<Icons.Plus />}>Create adjustment</Button>
        </div>
      </div>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════
// ADJUSTMENT DETAIL VIEW
// ═══════════════════════════════════════════════════════════
function AdjustmentDetailView({ adj, onBack, role }) {
  const canApprove = role === ROLES.FINOPS_T1 && adj.status === "Pending approval";
  return (
    <div className="p-6 space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"><Icons.ChevronLeft /> Back to adjustments</button>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3"><span className="text-lg font-semibold text-gray-800">Adjustment {adj.id}</span><Badge colorScheme={adj.status === "Approved" ? "success" : "warning"} size="sm">{adj.status}</Badge></div>
          {canApprove && <Button variant="solid" colorScheme="brand" size="sm" leftIcon={<Icons.Check />}>Approve</Button>}
          {!canApprove && adj.status === "Pending approval" && <Button variant="solid" colorScheme="brand" size="sm" leftIcon={<Icons.Check />} disabled>Approve</Button>}
        </CardHeader>
        <Divider />
        <CardBody className="pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)] gap-4">
            {[["Adjustment ID", <span className="font-mono">{adj.id}</span>], ["Date", adj.date], ["Amount", <span className={`font-semibold ${adj.amount.startsWith("-") ? "text-red-600" : "text-emerald-600"}`}>{adj.amount}</span>], ["Type", <Badge colorScheme={adj.type === "Manual" ? "brand" : "neutral"} size="sm">{adj.type}</Badge>], ["Reason", adj.reason], ["Associated payout", <span className="font-mono text-indigo-600">{adj.payoutId}</span>], ["Status", <Badge colorScheme={adj.status === "Approved" ? "success" : "warning"} size="sm">{adj.status}</Badge>]].map(([label, value]) => (
              <div key={label} className="contents"><div className="text-sm font-semibold text-gray-500">{label}</div><div className="text-sm text-gray-700 flex items-center">{value}</div></div>
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <div><h4 className="text-sm font-semibold text-gray-700 mb-1">Internal note</h4><div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">{adj.internalNote}</div></div>
            <div><h4 className="text-sm font-semibold text-gray-700 mb-1">External description (merchant-visible)</h4><div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100">{adj.externalDesc}</div></div>
          </div>
        </CardBody>
      </Card>
      <Card><CardHeader><span className="text-lg font-semibold text-gray-800">Audit log</span></CardHeader><Divider />
        <CardBody className="pt-4"><AuditTimeline entries={[{ ts: adj.date + ", 10:00 AM", action: "Adjustment created", user: "Tom Wright (FinOps T1)", detail: `${adj.type} adjustment of ${adj.amount} — ${adj.reason}.` }, ...(adj.status === "Approved" ? [{ ts: adj.date + ", 10:30 AM", action: "Adjustment approved", user: "Sarah Chen (FinOps T1)", detail: "Included in next payout cycle." }] : [])]} /></CardBody>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MERCHANT ADJUSTMENTS TAB
// ═══════════════════════════════════════════════════════════
function MerchantAdjustmentsTab({ role }) {
  const [selectedAdj, setSelectedAdj] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const canWrite = role === ROLES.FINOPS_T1;

  if (selectedAdj) return <AdjustmentDetailView adj={selectedAdj} onBack={() => setSelectedAdj(null)} role={role} />;

  return (
    <div className="p-6 space-y-5">
      <CreateAdjustmentDialog open={showCreate} onClose={() => setShowCreate(false)} />
      <div className="flex justify-between items-center">
        <div />
        <Button variant="solid" colorScheme="brand" size="sm" leftIcon={<Icons.Plus />} onClick={() => setShowCreate(true)} disabled={!canWrite}>Create adjustment</Button>
      </div>
      <Card>
        <CardHeader><span className="text-lg font-semibold text-gray-800">Adjustments</span><span className="text-sm text-gray-400">{mockAdjustments.length} results</span></CardHeader>
        <Divider />
        <CardBody className="pt-4">
          <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-gray-200">
            {["Date", "Adjustment ID", "Amount", "Type", "Reason", "Payout", "Status"].map((h) => <TH key={h} right={h === "Amount"}>{h}</TH>)}
          </tr></thead><tbody>
            {mockAdjustments.map((a) => (
              <tr key={a.id} onClick={() => setSelectedAdj(a)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                <td className="py-3 px-3 text-sm text-gray-700">{a.date}</td>
                <td className="py-3 px-3 text-sm font-mono text-indigo-600 font-medium">{a.id}</td>
                <td className={`py-3 px-3 text-sm font-semibold text-right ${a.amount.startsWith("-") ? "text-red-600" : "text-emerald-600"}`}>{a.amount}</td>
                <td className="py-3 px-3"><Badge colorScheme={a.type === "Manual" ? "brand" : "neutral"} size="sm">{a.type}</Badge></td>
                <td className="py-3 px-3 text-sm text-gray-600">{a.reason}</td>
                <td className="py-3 px-3 text-sm font-mono text-gray-500">{a.payoutId}</td>
                <td className="py-3 px-3"><Badge colorScheme={a.status === "Approved" ? "success" : "warning"} size="sm">{a.status}</Badge></td>
              </tr>
            ))}
          </tbody></table></div>
        </CardBody>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FLEET PAYOUTS PAGE
// ═══════════════════════════════════════════════════════════
function FleetPayoutsPage({ role, featureEnabled, payouts, onPayoutStatusChange }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("week");
  const [killSwitch, setKillSwitch] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showPrepare, setShowPrepare] = useState(false);
  const canWrite = role === ROLES.FINOPS_T1;
  const isAdmin = role === ROLES.ADMIN;

  if (!featureEnabled) return (
    <div className="p-6"><Card><CardBody className="py-16 text-center space-y-3">
      <div className="flex justify-center text-gray-300"><Icons.Lock /></div>
      <p className="text-gray-400 text-sm font-medium">Settlements feature is not enabled for this tenant.</p>
      <p className="text-xs text-gray-400">Contact your administrator to enable the Settlements feature flag.</p>
    </CardBody></Card></div>
  );

  if (isAdmin) return (
    <div className="p-6"><Card><CardBody className="py-16 text-center space-y-3">
      <div className="flex justify-center text-gray-300"><Icons.Shield /></div>
      <p className="text-gray-400 text-sm font-medium">You do not have permission to view payouts.</p>
      <p className="text-xs text-gray-400">Payout management is restricted to FinOps users. Your Administrator role does not include settlement permissions.</p>
    </CardBody></Card></div>
  );

  // Keep selectedPayout in sync with latest state
  const currentPayout = selectedPayout ? payouts.find(p => p.id === selectedPayout.id) || selectedPayout : null;
  if (currentPayout) return <PayoutDetailView payout={currentPayout} onBack={() => setSelectedPayout(null)} role={role} onStatusChange={(id, newStatus) => { onPayoutStatusChange(id, newStatus); if (newStatus === "Abandoned") setSelectedPayout(null); }} />;

  const filteredPayouts = statusFilter === "all" ? payouts : payouts.filter((p) => p.status === statusFilter);

  return (
    <div className="p-6 space-y-5">
      <PreparePayoutDialog open={showPrepare} onClose={() => setShowPrepare(false)} />

      {role === ROLES.FINOPS_T2 && (<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-xs text-gray-500"><Icons.Eye /> <span>Read-only access. You can view payouts but cannot perform actions.</span></div>)}

      {killSwitch && (<div className="flex items-center gap-3 p-4 rounded-xl border-2 border-red-300 bg-red-50"><Icons.Shield /><div className="flex-1"><span className="text-sm font-bold text-red-800">Fleet payout execution is disabled.</span><span className="text-sm text-red-600 ml-1">No payouts can be executed until this is re-enabled.</span></div><Button variant="outline" colorScheme="error" size="sm" onClick={() => setKillSwitch(false)} disabled={!canWrite}>Re-enable</Button></div>)}

      <div className="flex flex-col lg:flex-row justify-between gap-3">
        <Toggle checked={killSwitch} onChange={setKillSwitch} label="Disable fleet payout execution" description="Emergency stop — prevents all payout transfers." disabled={!canWrite} />
        <Button variant="solid" colorScheme="brand" size="sm" leftIcon={<Icons.DollarSign />} onClick={() => setShowPrepare(true)} disabled={!canWrite}>Prepare payout</Button>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "Ready for Review", "Ready for Transfer", "Transferring", "Paused", "Failed", "Completed", "Abandoned"].map((s) => (<FilterChip key={s} label={s === "all" ? "All" : s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />))}
        </div>
        <DateFilterBar value={dateFilter} onChange={setDateFilter} />
      </div>

      <Card>
        <CardHeader><span className="text-lg font-semibold text-gray-800">Payouts</span><span className="text-sm text-gray-400">{filteredPayouts.length} results</span></CardHeader>
        <Divider />
        <CardBody className="pt-4">
          <div className="flex flex-wrap gap-6 pb-4 mb-4 border-b border-gray-100">
            <HeroMetric heading="Total payouts" value="$65,253.20" tooltip="Sum of all payout amounts." />
            <HeroMetric heading="Completed" value="$18,149.90" colorClass="text-emerald-600" />
            <HeroMetric heading="Pending" value="$29,769.55" colorClass="text-indigo-600" />
            <HeroMetric heading="Failed" value="$6,112.75" colorClass="text-red-600" />
          </div>
          <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-gray-200">
            {["Payout date", "Payout ID", "Merchant", "MID", "Transfers", "Amount", "Status"].map((h) => <TH key={h} right={h === "Amount"}>{h}</TH>)}
          </tr></thead><tbody>
            {filteredPayouts.map((p) => (
              <tr key={p.id} onClick={() => setSelectedPayout(p)} className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${p.status === "Failed" ? "bg-red-50/30" : ""}`}>
                <td className="py-3 px-3 text-sm text-gray-700">{p.date}</td>
                <td className="py-3 px-3 text-sm font-mono text-indigo-600 font-medium">{p.id}</td>
                <td className="py-3 px-3 text-sm text-gray-700">{p.merchantName}</td>
                <td className="py-3 px-3 text-sm font-mono text-gray-500">{p.mid}</td>
                <td className="py-3 px-3 text-sm text-gray-600 text-center">{p.transferCount}</td>
                <td className="py-3 px-3 text-sm font-semibold text-gray-900 text-right">{p.amount}</td>
                <td className="py-3 px-3"><PayoutStatusBadge status={p.status} /></td>
              </tr>
            ))}
            {filteredPayouts.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-sm text-gray-400">No payouts match the selected filters.</td></tr>}
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
function MerchantPayoutsTab({ role, payouts, onPayoutStatusChange }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [disableMerchant, setDisableMerchant] = useState(false);
  const canWrite = role === ROLES.FINOPS_T1;
  const merchantPayouts = payouts.filter((p) => p.mid === "POSPAY00012345");
  const filtered = statusFilter === "all" ? merchantPayouts : merchantPayouts.filter((p) => p.status === statusFilter);

  const currentPayout = selectedPayout ? payouts.find(p => p.id === selectedPayout.id) || selectedPayout : null;
  if (currentPayout) return <PayoutDetailView payout={currentPayout} onBack={() => setSelectedPayout(null)} role={role} onStatusChange={(id, newStatus) => { onPayoutStatusChange(id, newStatus); if (newStatus === "Abandoned") setSelectedPayout(null); }} />;

  return (
    <div className="p-6 space-y-5">
      {disableMerchant && (<div className="flex items-center gap-3 p-4 rounded-xl border-2 border-red-300 bg-red-50"><Icons.Shield /><div className="flex-1"><span className="text-sm font-bold text-red-800">Payout execution disabled for this merchant.</span></div><Button variant="outline" colorScheme="error" size="sm" onClick={() => setDisableMerchant(false)} disabled={!canWrite}>Re-enable</Button></div>)}
      <Toggle checked={disableMerchant} onChange={setDisableMerchant} label="Disable merchant payout execution" description="Prevents payout transfers for this merchant only." disabled={!canWrite} />
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "Ready for Review", "Ready for Transfer", "Completed", "Failed", "Paused"].map((s) => (<FilterChip key={s} label={s === "all" ? "All" : s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />))}
      </div>
      <Card>
        <CardHeader><span className="text-lg font-semibold text-gray-800">Payouts</span><span className="text-sm text-gray-400">{filtered.length} results</span></CardHeader>
        <Divider />
        <CardBody className="pt-4">
          <div className="flex flex-wrap gap-6 pb-4 mb-4 border-b border-gray-100">
            <HeroMetric heading="Total payouts" value="$12,804.60" /><HeroMetric heading="Completed" value="$2,945.30" colorClass="text-emerald-600" /><HeroMetric heading="Pending" value="$8,439.30" colorClass="text-indigo-600" />
          </div>
          <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="border-b border-gray-200">
            {["Payout date", "Payout ID", "Transfers", "Amount", "Status"].map((h) => <TH key={h} right={h === "Amount"}>{h}</TH>)}
          </tr></thead><tbody>
            {filtered.map((p) => (<tr key={p.id} onClick={() => setSelectedPayout(p)} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"><td className="py-3 px-3 text-sm text-gray-700">{p.date}</td><td className="py-3 px-3 text-sm font-mono text-indigo-600 font-medium">{p.id}</td><td className="py-3 px-3 text-sm text-gray-600 text-center">{p.transferCount}</td><td className="py-3 px-3 text-sm font-semibold text-gray-900 text-right">{p.amount}</td><td className="py-3 px-3"><PayoutStatusBadge status={p.status} /></td></tr>))}
            {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">No payouts match the selected filters.</td></tr>}
          </tbody></table></div>
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
function MerchantFacilityDetailPage({ role, payouts, onPayoutStatusChange }) {
  const [activeTab, setActiveTab] = useState("transactions");
  const tabs = [{ id: "overview", label: "Overview" }, { id: "terminals", label: "Terminals" }, { id: "transactions", label: "Transactions" }, { id: "payouts", label: "Payouts" }, { id: "adjustments", label: "Adjustments" }, { id: "disputes", label: "Disputes" }];
  const bc = { org: "POS Pay Pty Ltd", facility: "Joe's Coffee - Sydney CBD", mid: "POSPAY00012345", status: "Active" };
  return (<div className="flex flex-col h-full">
    <div className="bg-white border-b border-gray-200">
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-100"><Icons.Store /><span className="text-sm font-medium text-indigo-600 cursor-pointer hover:underline">{bc.org}</span><Icons.ChevronRight /><span className="text-sm font-medium text-gray-800">{bc.facility}</span><span className="ml-1"><Badge colorScheme="neutral" size="md">{bc.mid}</Badge></span><span className="ml-1"><Badge colorScheme="success" size="md">{bc.status}</Badge></span></div>
      <div className="px-4 py-1 flex gap-1">{tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? "bg-indigo-50 text-indigo-700" : "text-[#5D6B98] hover:bg-gray-50 hover:text-gray-700"}`}>{tab.label}</button>))}</div>
    </div>
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB]">
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "terminals" && <TerminalsTab />}
      {activeTab === "transactions" && <TransactionsTab />}
      {activeTab === "payouts" && <MerchantPayoutsTab role={role} payouts={payouts} onPayoutStatusChange={onPayoutStatusChange} />}
      {activeTab === "adjustments" && <MerchantAdjustmentsTab role={role} />}
      {activeTab === "disputes" && <DisputesTab />}
    </div>
  </div>);
}

// ═══ Merchant List ═══
function MerchantFacilitiesListPage({ onSelectMerchant }) {
  const merchants = [{ mid: "POSPAY00012345", friendlyName: "Joe's Coffee - Sydney CBD", tradingName: "Joe's Coffee House", location: "Sydney NSW", product: "POS Pay Plus", status: "Active" }, { mid: "POSPAY00012346", friendlyName: "Mike's Electronics", tradingName: "Michael's Tech Store", location: "Melbourne VIC", product: "POS Pay Plus", status: "Active" }, { mid: "POSPAY00012347", friendlyName: "Fresh Mart - Brisbane", tradingName: "Fresh Mart Australia", location: "Brisbane QLD", product: "POS Pay", status: "Inactive" }];
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
              <p className="text-sm text-gray-500 mb-3">Restores all payout statuses to their original mock values. Use this after testing Approve, Pause, or Abandon flows to start fresh.</p>
              {changedPayouts.length > 0 ? (
                <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs font-medium text-amber-700 mb-2">{changedPayouts.length} payout{changedPayouts.length > 1 ? "s" : ""} modified since last reset:</p>
                  <div className="space-y-1">{changedPayouts.map((p) => {
                    const original = mockPayouts.find((o) => o.id === p.id);
                    return (<div key={p.id} className="flex items-center gap-2 text-xs"><span className="font-mono text-gray-600">{p.id}</span><span className="text-gray-400">—</span><PayoutStatusBadge status={original.status} /><span className="text-gray-400">→</span><PayoutStatusBadge status={p.status} /></div>);
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
                  ["Ready for Review", "Ready for Transfer", "Transferring", "Completed", "Failed", "Paused", "Abandoned"].map((status) => {
                    const count = payouts.filter((p) => p.status === status).length;
                    return count > 0 ? (<div key={status} className="flex items-center gap-2 text-xs"><PayoutStatusBadge status={status} /><span className="text-gray-500">× {count}</span></div>) : null;
                  }).filter(Boolean)
                }</div>
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
const uxArtefacts = [
  { id: "ux-flows", title: "UX Flow Diagrams", description: "Interactive payout lifecycle, end-to-end journey, FinOps action flows, and permissions matrix", file: "ux-flows.html", type: "Standalone HTML", icon: "flow" },
  { id: "lifecycle", title: "Payout Lifecycle State Machine", description: "Clickable SVG state diagram — 8 states with transitions, entry conditions, and exit actions", file: "src/flows/PayoutLifecycle.jsx", type: "React Component", icon: "state" },
  { id: "e2e", title: "E2E Merchant → Payout Journey", description: "8-step expandable timeline from Cuscal DTE ingestion to NPP transfer, filterable by phase", file: "src/flows/E2EPayoutJourney.jsx", type: "React Component", icon: "journey" },
  { id: "actions", title: "FinOps Action Flows", description: "Step-by-step interaction flows for Approve, Pause, Abandon, Execute, and Resume with edge cases", file: "src/flows/FinOpsActionFlows.jsx", type: "React Component", icon: "actions" },
  { id: "permissions", title: "Permissions & Roles Matrix", description: "Interactive role/permission grid for FinOps T1, FinOps T2, and Administrator across 20+ actions", file: "src/flows/PermissionsMatrix.jsx", type: "React Component", icon: "roles" },
];

function UXArtefactsPage() {
  const iconMap = {
    flow: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="9" y="15" width="6" height="6" rx="1" /><path d="M9 6h6M6 9v3a3 3 0 003 3M18 9v3a3 3 0 01-3 3" /></svg>),
    state: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></svg>),
    journey: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3-9 4 18 3-9h4" /></svg>),
    actions: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>),
    roles: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="3" x2="9" y2="21" /></svg>),
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">UX Artefacts</h2>
        <p className="text-sm text-gray-500">Design documentation and interactive flow diagrams built for the MSP Support Dashboard.</p>
      </div>
      <div className="space-y-3">
        {uxArtefacts.map((artefact) => {
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
                      {isStandalone && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Recommended</span>}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{artefact.description}</p>
                    <div className="flex items-center gap-3">
                      {isStandalone && (
                        <button onClick={() => window.open("ux-flows.html", "_blank")} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                          Open in new tab
                        </button>
                      )}
                      <span className="text-xs text-gray-400 font-mono">{artefact.file}</span>
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
// SIDEBAR + HEADER + MAIN APP
// ═══════════════════════════════════════════════════════════
function Sidebar({ activeItem, onNavigate, collapsed, onResetData }) {
  const navGroups = [
    { label: "MONITORING", items: [{ id: "organisations", label: "Organisations", icon: Icons.Buildings }, { id: "merchant-facilities", label: "Merchant facilities", icon: Icons.Shop }, { id: "terminals", label: "Terminals", icon: Icons.Terminal }, { id: "merchant-applications", label: "Merchant applications", icon: Icons.DocumentText }, { id: "users", label: "Users", icon: Icons.Profile }] },
    { label: "SETTLEMENTS", items: [{ id: "payouts", label: "Payouts", icon: Icons.Wallet }] },
    { label: "UTILITIES", items: [{ id: "support", label: "Support", icon: Icons.Lifebuoy }, { id: "developer", label: "Developer", icon: Icons.Code }, { id: "api-keys", label: "API keys", icon: Icons.Key }, { id: "alerts", label: "Alerts", icon: Icons.Danger, badge: 3 }] },
    { label: "PRODUCT DEVELOPMENT", items: [{ id: "debugging-tools", label: "Debugging Tools", icon: Icons.Beaker }, { id: "ux-artefacts", label: "UX Artefacts", icon: Icons.Layers }] },
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
            <option value={ROLES.FINOPS_T1}>FinOps Tier 1</option>
            <option value={ROLES.FINOPS_T2}>FinOps Tier 2</option>
            <option value={ROLES.ADMIN}>Administrator</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default function MSPSupportDashboard() {
  const [activePage, setActivePage] = useState("payouts");
  const [merchantDetailView, setMerchantDetailView] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [role, setRole] = useState(ROLES.FINOPS_T1);
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [payouts, setPayouts] = useState(mockPayouts);

  const handlePayoutStatusChange = useCallback((payoutId, newStatus) => {
    setPayouts((prev) => prev.map((p) => p.id === payoutId ? { ...p, status: newStatus } : p));
  }, []);

  const handleResetData = useCallback(() => {
    setPayouts([...mockPayouts]);
  }, []);

  const headings = { "organisations": { icon: Icons.Buildings, label: "Organisations" }, "merchant-facilities": { icon: Icons.Shop, label: "Merchant facilities" }, "terminals": { icon: Icons.Terminal, label: "Terminals" }, "users": { icon: Icons.Profile, label: "Users" }, "support": { icon: Icons.Lifebuoy, label: "Support" }, "developer": { icon: Icons.Code, label: "Developer" }, "api-keys": { icon: Icons.Key, label: "API keys" }, "alerts": { icon: Icons.Danger, label: "Alerts" }, "merchant-applications": { icon: Icons.DocumentText, label: "Merchant applications" }, "payouts": { icon: Icons.Wallet, label: "Payouts" }, "debugging-tools": { icon: Icons.Beaker, label: "Debugging Tools" }, "ux-artefacts": { icon: Icons.Layers, label: "UX Artefacts" } };
  const currentHeading = headings[activePage] || headings["merchant-facilities"];
  const handleNav = (id) => { setActivePage(id); setMerchantDetailView(false); };

  return (
    <ToastProvider>
      <div className="flex h-screen w-full bg-[#F9FAFB] font-sans text-gray-900 overflow-hidden">
        <Sidebar activeItem={activePage} onNavigate={handleNav} collapsed={sidebarCollapsed} onResetData={handleResetData} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header icon={currentHeading.icon} heading={currentHeading.label} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} role={role} onRoleChange={setRole} featureEnabled={featureEnabled} onFeatureToggle={() => setFeatureEnabled(!featureEnabled)} />
          <main className="flex-1 overflow-y-auto bg-[#F9FAFB]">
            {activePage === "payouts" && <FleetPayoutsPage role={role} featureEnabled={featureEnabled} payouts={payouts} onPayoutStatusChange={handlePayoutStatusChange} />}
            {activePage === "merchant-facilities" && merchantDetailView && <MerchantFacilityDetailPage role={role} payouts={payouts} onPayoutStatusChange={handlePayoutStatusChange} />}
            {activePage === "merchant-facilities" && !merchantDetailView && <MerchantFacilitiesListPage onSelectMerchant={() => setMerchantDetailView(true)} />}
            {activePage === "debugging-tools" && <DebuggingToolsPage onResetData={handleResetData} payouts={payouts} />}
            {activePage === "ux-artefacts" && <UXArtefactsPage />}
            {!["payouts", "merchant-facilities", "debugging-tools", "ux-artefacts"].includes(activePage) && (<div className="p-6"><Card><CardBody className="py-16 text-center"><p className="text-gray-400 text-sm">{currentHeading.label} page content</p></CardBody></Card></div>)}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
