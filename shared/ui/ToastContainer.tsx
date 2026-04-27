"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, X } from "lucide-react";

// --- Types ---
export type ToastType = "success" | "error" | "warning";

export interface ToastItem {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

const TOAST_EVENT = "app-toast-event";
const dispatchToast = (toast: Omit<ToastItem, "id">) => {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: toast }));
};

// --- Animation Logic ---
const ANIMATION_DELAY = 50;
type AnimationState = "entering" | "visible" | "hiding" | "hidden";

const useToastAlert = (duration = 5000, onClose: () => void) => {
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

// --- Styles ---
const styles = {
  success: {
    bg: "bg-green-50 text-green-800 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-600",
  },
  error: {
    bg: "bg-red-50 text-red-800 border-red-200",
    icon: AlertCircle,
    iconColor: "text-red-600",
  },
  warning: {
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
} as const;

// --- Sub-Component: Individual Toast ---
const Toast: React.FC<ToastItem & { onClose: () => void }> = ({
  type,
  title,
  message,
  duration,
  onClose,
}) => {
  const { animation, handleEnd, close } = useToastAlert(duration, onClose);
  const s = styles[type];
  const Icon = s.icon;

  return (
    <div
      className={`
        flex items-center gap-3 relative
        ${s.bg} border px-5 py-4 rounded-xl shadow-md
        min-w-[320px] max-w-sm
        transform transition-all duration-300 ease-out
        ${animation}
      `}
      onTransitionEnd={handleEnd}
      role="alert"
    >
      <Icon className={`w-6 h-6 shrink-0 ${s.iconColor}`} />
      <div className="flex-1">
        <p className="font-semibold text-base leading-tight">{title}</p>
        {message && <p className="text-sm opacity-90 mt-1">{message}</p>}
      </div>
      <button
        onClick={close}
        className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
      >
        <X className="w-4 h-4 opacity-50" />
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
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}

// --- Hook for Usage ---
export function useAppToast() {
  const toast = (type: ToastType) => (title: string, message?: string) => {
    dispatchToast({ type, title, message });
  };

  return {
    success: toast("success"),
    error: toast("error"),
    warning: toast("warning"),
  };
}
