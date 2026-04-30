// shared/ui/ToastContainer.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

// --- Types ---
export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

const TOAST_EVENT = "app-toast-event";
const dispatchToast = (toast: Omit<ToastItem, "id">) => {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toast }));
};

// --- Animation Logic ---
const ANIMATION_DELAY = 50;
type AnimationState = "entering" | "visible" | "hiding" | "hidden";

const useToastAlert = (duration = 3000, onClose: () => void) => {
  const [state, setState] = useState<AnimationState>("entering");

  useEffect(() => {
    const enter = setTimeout(() => setState("visible"), ANIMATION_DELAY);
    const hide = setTimeout(() => setState("hiding"), duration);

    return () => {
      clearTimeout(enter);
      clearTimeout(hide);
    };
  }, [duration]);

  const handleEnd = () => {
    if (state === "hiding") {
      setState("hidden");
      onClose();
    }
  };

  const animation = {
    entering: "translate-x-full opacity-0",
    visible: "translate-x-0 opacity-100",
    hiding: "translate-x-full opacity-0",
    hidden: "hidden",
  }[state];

  return { animation, handleEnd, close: () => setState("hiding") };
};

// --- Styles matching original Toast component ---
const toastStyles: Record<
  ToastType,
  { bg: string; border: string; icon: React.ReactNode; iconColor: string }
> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-100",
    iconColor: "text-green-600",
    icon: <CheckCircle size={18} />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-100",
    iconColor: "text-red-600",
    icon: <AlertCircle size={18} />,
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    iconColor: "text-amber-600",
    icon: <AlertTriangle size={18} />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    iconColor: "text-blue-600",
    icon: <Info size={18} />,
  },
};

// --- Sub-Component: Individual Toast (matching original UI) ---
const Toast: React.FC<ToastItem & { onClose: () => void }> = ({
  type,
  title,
  message,
  duration = 3000,
  onClose,
}) => {
  const { animation, handleEnd, close } = useToastAlert(duration, onClose);
  const style = toastStyles[type];

  return (
    <div
      className={`
        fixed top-8 right-8 z-[100] 
        flex items-center gap-3 px-6 py-4 
        rounded-2xl border 
        ${style.bg} ${style.border} 
        shadow-2xl 
        min-w-[320px] max-w-md
        transform transition-all duration-300 ease-out
        ${animation}
      `}
      onTransitionEnd={handleEnd}
      role="alert"
    >
      <div className={style.iconColor}>{style.icon}</div>
      <div className="flex-1">
        {title && <p className="text-sm font-bold text-gray-800">{title}</p>}
        <span className={`text-sm ${title ? "text-gray-600" : "font-bold text-gray-800"}`}>
          {message}
        </span>
      </div>
      <button
        onClick={close}
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// --- Main Container ---
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleAddToast = (e: Event) => {
      const detail = (e as CustomEvent).detail as Omit<ToastItem, "id">;
      setToasts((prev) => [...prev, { ...detail, id: Date.now() }]);
    };

    window.addEventListener(TOAST_EVENT, handleAddToast);
    return () => window.removeEventListener(TOAST_EVENT, handleAddToast);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed top-6 right-6 z-[9999]">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

// --- Hook for Usage ---
export function useAppToast() {
  const toast = (type: ToastType) => (message: string, title?: string, duration?: number) => {
    dispatchToast({ type, title, message, duration });
  };

  return {
    success: toast("success"),
    error: toast("error"),
    warning: toast("warning"),
    info: toast("info"),
  };
}