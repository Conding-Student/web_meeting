import React from "react";
import StatCards from "./components/StatCards";
import ProjectList from "./components/ProjectList";
import { Layout, BookOpen, ListTodo, Users as UsersIcon } from "lucide-react";

const QUICK_ACTIONS = [
	{ label: "Manage Projects", icon: Layout },
	{ label: "View Stories", icon: BookOpen },
	{ label: "View Tasks", icon: ListTodo },
	{ label: "Team Overview", icon: UsersIcon },
];

export default function DashboardPage() {
	return (
		<div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
			{/* 1. Header Stats */}
			<StatCards />

			{/* 2. Quick Actions */}
			<div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
				<h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{QUICK_ACTIONS.map((action) => (
						<button
							key={action.label}
							className="flex flex-col items-center justify-center gap-3 p-6 border border-gray-100 rounded-2xl hover:bg-gray-50 hover:border-green-100 transition-all group"
						>
							<action.icon
								size={24}
								className="text-gray-400 group-hover:text-[#05582E]"
							/>
							<span className="text-sm font-bold text-gray-600 group-hover:text-[#05582E]">
								{action.label}
							</span>
						</button>
					))}
				</div>
			</div>

			{/* 3. Main Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="lg:col-span-2">
					<ProjectList />
				</div>

				{/* Calendar Placeholder */}
				<div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
					<h2 className="text-lg font-bold text-gray-900 mb-6">
						Calendar & Events
					</h2>
					<div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
						<div className="text-4xl font-black text-[#05582E] mb-2">10</div>
						<p className="text-sm font-bold text-gray-900">
							Friday, January 2026
						</p>
						<p className="text-xs text-gray-400 mt-4">
							Integration of a real calendar component (like react-day-picker)
							goes here.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
