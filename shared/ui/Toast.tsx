"use client";
import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
	message: string;
	type: ToastType;
	isVisible: boolean;
	onClose: () => void;
	duration?: number;
}

const toastStyles: Record<
	ToastType,
	{ bg: string; icon: React.ReactNode; border: string }
> = {
	success: {
		bg: "bg-green-50",
		border: "border-green-100",
		icon: <CheckCircle className="text-green-600" size={18} />,
	},
	error: {
		bg: "bg-red-50",
		border: "border-red-100",
		icon: <AlertCircle className="text-red-600" size={18} />,
	},
	info: {
		bg: "bg-blue-50",
		border: "border-blue-100",
		icon: <Info className="text-blue-600" size={18} />,
	},
};

export default function Toast({
	message,
	type,
	isVisible,
	onClose,
	duration = 3000,
}: ToastProps) {
	useEffect(() => {
		if (isVisible) {
			const timer = setTimeout(onClose, duration);
			return () => clearTimeout(timer);
		}
	}, [isVisible, duration, onClose]);

	if (!isVisible) return null;

	const style = toastStyles[type];

	return (
		<div
			className={`fixed top-8 right-8 z-100 flex items-center gap-3 px-6 py-4 rounded-2xl border ${style.bg} ${style.border} shadow-2xl animate-in slide-in-from-right-10 duration-300`}
		>
			{style.icon}
			<span className="text-sm font-bold text-gray-800">{message}</span>
			<button
				onClick={onClose}
				className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
			>
				<X size={16} />
			</button>
		</div>
	);
}
