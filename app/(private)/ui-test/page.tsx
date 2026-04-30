// app/(private)/ui-test/page.tsx
"use client";

import React, { useState } from "react";
import Modal from "@/shared/ui/Modal";
import { useAppToast } from "@/shared/ui/ToastContainer";
import {
	Beaker,
	CheckCircle2,
	AlertCircle,
	Info,
	Layers,
	PlayCircle,
	Layout,
} from "lucide-react";
import SearchableDropdown from "@/shared/ui/SearchableDropdown";
import SegmentedTabs from "@/shared/ui/SegmentedTabs";
import DataTable from "@/shared/ui/DataTable";

const MOCK_INSTITUTIONS = [
	{ id: "1", label: "Bakawan Data Analytics" },
	{ id: "2", label: "CARD Indogrosir HO" },
	{ id: "3", label: "DC 1 Laguna" },
];

const MOCK_STAFF = [
	{
		cid: "CID-001",
		name: "Juan Dela Cruz",
		institution: "Bakawan Data",
		mbl: "185,000.00",
		dental: "8,500.00",
		contact: "0917123",
	},
	{
		cid: "CID-002",
		name: "Maria Santos",
		institution: "Indogrosir HO",
		mbl: "150,000.00",
		dental: "5,000.00",
		contact: "0918456",
	},
];

export default function UITestPage() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("Sample 1");
	const toast = useAppToast();

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
						Trigger different status notifications that appear at the top right
						with smooth animations.
					</p>

					<div className="flex flex-col gap-3">
						<button
							onClick={() =>
								toast.success("Operation completed successfully!", "Success")
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
								toast.error("Something went wrong with the server.", "Error")
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
								toast.warning(
									"Please review your changes before proceeding.",
									"Warning",
								)
							}
							className="flex items-center justify-between px-6 py-4 bg-amber-50 text-amber-700 rounded-2xl font-bold hover:bg-amber-100 transition-all group"
						>
							<div className="flex items-center gap-3">
								<Info size={20} /> Warning Toast
							</div>
							<PlayCircle
								size={18}
								className="opacity-0 group-hover:opacity-100 transition-opacity"
							/>
						</button>

						<button
							onClick={() =>
								toast.info(
									"New update available for this project.",
									"Information",
								)
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

			{/* Data & Navigation Section */}
			<section className="space-y-6">
				<div className="flex items-center gap-4">
					<div className="p-3 bg-[#D9E392] rounded-2xl text-[#1E4637]">
						<Layout size={20} />
					</div>
					<div>
						<h1 className="text-3xl font-black text-gray-900 tracking-tight">
							Data & Navigation
						</h1>
					</div>
				</div>

				<div className="space-y-8 bg-gray-50/50 p-8 rounded-[3rem] border border-gray-100">
					{/* Component 1: Segmented Tabs */}
					<div className="space-y-3">
						<p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">
							Segmented Tabs
						</p>
						<SegmentedTabs
							tabs={["Sample 1", "Sample 2", "Sample 3"]}
							activeTab={activeTab}
							onChange={setActiveTab}
						/>
						<div className="mt-2 text-sm text-gray-500 ml-4">
							Currently viewing:{" "}
							<span className="font-semibold text-[#1E4637]">{activeTab}</span>
						</div>
					</div>

					{/* Component 2: Searchable Dropdown */}
					<div className="space-y-3">
						<p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">
							Searchable Dropdown
						</p>
						<div className="flex flex-col lg:flex-row items-center gap-4 w-full">
							<SearchableDropdown
								options={MOCK_INSTITUTIONS}
								onSelect={(id) => {
									const selected = MOCK_INSTITUTIONS.find(
										(opt) => opt.id === id,
									);
									toast.success(
										`You selected: ${selected?.label}`,
										"Selection Confirmed",
									);
								}}
							/>
						</div>
					</div>

					{/* Component 3: Data Table */}
					<div className="space-y-3">
						<p className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4">
							Data Table & Pagination
						</p>
						<DataTable
							title="Component Preview List"
							countLabel="Total Items"
							countValue={MOCK_STAFF.length}
							headers={[
								"CID",
								"Full Name",
								"Institution",
								"Remaining MBL",
								"Remaining Dental",
								"Contact No.",
								"Action",
							]}
							data={MOCK_STAFF}
						/>
					</div>
				</div>
			</section>

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
							className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={() => {
								setIsModalOpen(false);
								toast.success(
									"Your changes have been saved successfully!",
									"Settings Applied",
								);
							}}
							className="px-6 py-2 bg-[#1E4637] text-white rounded-xl text-sm font-bold hover:bg-[#163529] transition-colors"
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
							<strong>💡 Tip:</strong> You can pass any JSX content here,
							including complex forms or data tables.
						</p>
					</div>
				</div>
			</Modal>
		</div>
	);
}
