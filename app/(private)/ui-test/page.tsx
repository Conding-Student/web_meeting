"use client";

import React, { useState } from "react";
import Modal from "@/shared/ui/Modal";
import Toast, { ToastType } from "@/shared/ui/Toast";
import {
	Beaker,
	CheckCircle2,
	AlertCircle,
	Info,
	Layers,
	PlayCircle,
} from "lucide-react";

export default function UITestPage() {
	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Toast State
	const [toast, setToast] = useState<{
		isVisible: boolean;
		message: string;
		type: ToastType;
	}>({
		isVisible: false,
		message: "",
		type: "info",
	});

	const showToast = (message: string, type: ToastType) => {
		setToast({ isVisible: true, message, type });
	};

	const handleCloseToast = () => {
		setToast((prev) => ({ ...prev, isVisible: false }));
	};

	return (
		<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
			{/* Page Header */}
			<div className="flex items-center gap-4">
				<div className="p-3 bg-[#D9E392] rounded-2xl text-[#1E4637]">
					<Beaker size={28} />
				</div>
				<div>
					<h1 className="text-3xl font-black text-gray-900 tracking-tight">
						UI Components
					</h1>
					<p className="text-gray-500 font-medium">
						Test and preview global UI elements (path: shared/ui).
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Toast Testing Card */}
				<section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
					<div className="flex items-center gap-2 mb-2">
						<Layers className="text-[#05582E]" size={20} />
						<h2 className="text-lg font-bold text-gray-900">
							Toast Notifications
						</h2>
					</div>
					<p className="text-sm text-gray-400">
						Trigger different status notifications that appear at the bottom
						right.
					</p>

					<div className="flex flex-col gap-3">
						<button
							onClick={() =>
								showToast("Operation completed successfully!", "success")
							}
							className="flex items-center justify-between px-6 py-4 bg-green-50 text-green-700 rounded-2xl font-bold hover:bg-green-100 transition-all group"
						>
							<div className="flex items-center gap-3">
								<CheckCircle2 size={20} /> Success Toast
							</div>
							<PlayCircle
								size={18}
								className="opacity-0 group-hover:opacity-100 transition-opacity"
							/>
						</button>

						<button
							onClick={() =>
								showToast("Something went wrong with the server.", "error")
							}
							className="flex items-center justify-between px-6 py-4 bg-red-50 text-red-700 rounded-2xl font-bold hover:bg-red-100 transition-all group"
						>
							<div className="flex items-center gap-3">
								<AlertCircle size={20} /> Error Toast
							</div>
							<PlayCircle
								size={18}
								className="opacity-0 group-hover:opacity-100 transition-opacity"
							/>
						</button>

						<button
							onClick={() =>
								showToast("New update available for this project.", "info")
							}
							className="flex items-center justify-between px-6 py-4 bg-blue-50 text-blue-700 rounded-2xl font-bold hover:bg-blue-100 transition-all group"
						>
							<div className="flex items-center gap-3">
								<Info size={20} /> Info Toast
							</div>
							<PlayCircle
								size={18}
								className="opacity-0 group-hover:opacity-100 transition-opacity"
							/>
						</button>
					</div>
				</section>

				{/* Modal Testing Card */}
				<section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
					<div className="flex items-center gap-2 mb-2">
						<Layers className="text-[#05582E]" size={20} />
						<h2 className="text-lg font-bold text-gray-900">Modal Overlays</h2>
					</div>
					<p className="text-sm text-gray-400">
						Test the responsive modal with backdrop blur and portal positioning.
					</p>

					<div className="h-50 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center">
						<button
							onClick={() => setIsModalOpen(true)}
							className="px-8 py-4 bg-[#1E4637] text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 hover:scale-105 transition-all"
						>
							Launch Preview Modal
						</button>
					</div>
				</section>
			</div>

			{/* MODAL INSTANCE */}
			<Modal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				title="Template Configuration"
				maxWidth="md"
				footer={
					<>
						<button
							onClick={() => setIsModalOpen(false)}
							className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600"
						>
							Cancel
						</button>
						<button
							onClick={() => {
								setIsModalOpen(false);
								showToast("Settings applied successfully", "success");
							}}
							className="px-6 py-2 bg-[#1E4637] text-white rounded-xl text-sm font-bold"
						>
							Save Changes
						</button>
					</>
				}
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-600">
						This modal is built using a React Portal, meaning it renders outside
						the main layout hierarchy to avoid z-index conflicts with the
						sidebar.
					</p>
					<div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
						<p className="text-xs text-amber-700 font-medium">
							<strong>Tip:</strong> You can pass any JSX content here, including
							complex forms or data tables.
						</p>
					</div>
				</div>
			</Modal>

			{/* TOAST INSTANCE */}
			<Toast
				isVisible={toast.isVisible}
				message={toast.message}
				type={toast.type}
				onClose={handleCloseToast}
			/>
		</div>
	);
}
