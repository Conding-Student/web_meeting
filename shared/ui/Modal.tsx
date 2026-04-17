"use client";
import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	maxWidth?: "sm" | "md" | "lg" | "xl";
}

const widths = {
	sm: "max-w-md",
	md: "max-w-lg",
	lg: "max-w-2xl",
	xl: "max-w-4xl",
};

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	footer,
	maxWidth = "md",
}: ModalProps) {
	// Prevent scrolling when modal is open
	useEffect(() => {
		if (isOpen) document.body.style.overflow = "hidden";
		else document.body.style.overflow = "unset";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-gray-900/40 animate-in fade-in duration-300"
				onClick={onClose}
			/>

			{/* Modal Content */}
			<div
				className={`relative w-full ${widths[maxWidth]} bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200`}
			>
				<div className="flex items-center justify-between px-8 py-6 border-b border-gray-50">
					<h3 className="text-xl font-black text-gray-900 tracking-tight">
						{title}
					</h3>
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400"
					>
						<X size={20} />
					</button>
				</div>

				<div className="px-8 py-6">{children}</div>

				{footer && (
					<div className="px-8 py-6 bg-gray-50 flex justify-end gap-3">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
}
