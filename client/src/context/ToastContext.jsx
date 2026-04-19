import { createContext, useContext, useReducer, useCallback } from "react";

const ToastContext = createContext(null);

const toastReducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      return { toasts: [...state.toasts, action.payload] };
    case "REMOVE":
      return { toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
};

export const ToastProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const toast = useCallback((message, type = "info", duration = 3500) => {
    const id = `${Date.now()}-${Math.random()}`;
    dispatch({ type: "ADD", payload: { id, message, type } });
    setTimeout(() => dispatch({ type: "REMOVE", payload: id }), duration);
  }, []);

  const success = useCallback((msg) => toast(msg, "success"), [toast]);
  const error   = useCallback((msg) => toast(msg, "error"),   [toast]);
  const info    = useCallback((msg) => toast(msg, "info"),    [toast]);
  const warn    = useCallback((msg) => toast(msg, "warning"), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warn }}>
      {children}
      {/* Toast UI */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {state.toasts.map(t => (
          <div
            key={t.id}
            className={`
              animate-fade-up pointer-events-auto
              flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-mono
              border backdrop-blur-sm min-w-[260px] max-w-[380px]
              ${t.type === "success" ? "bg-[#0d1f13] border-[#2d5a3d] text-[#7dca9a]" : ""}
              ${t.type === "error"   ? "bg-[#1f0d0d] border-[#5a2d2d] text-[#ca7d7d]" : ""}
              ${t.type === "warning" ? "bg-[#1f1a0d] border-[#5a4a2d] text-[#cab67d]" : ""}
              ${t.type === "info"    ? "bg-[#0d1520] border-[#2d4a6a] text-[#7db0ca]" : ""}
            `}
          >
            <span className="text-base leading-none">
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : t.type === "warning" ? "⚠" : "ℹ"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};