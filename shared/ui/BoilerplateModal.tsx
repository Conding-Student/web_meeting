// shared/ui/BoilerplateModal.tsx 
"use client";

import React, { useState } from "react";
import {
	X,
	Copy,
	Check,
	FileText,
	FolderTree,
	Code2,
	Terminal,
	ExternalLink,
} from "lucide-react";

interface BoilerplateModalProps {
	isOpen: boolean;
	onClose: () => void;
}

type TabType = "getting-started" | "structure" | "patterns";

export default function BoilerplateModal({
	isOpen,
	onClose,
}: BoilerplateModalProps) {
	const [copied, setCopied] = useState(false);
	const [activeTab, setActiveTab] = useState<TabType>("getting-started");

	if (!isOpen) return null;

	const copyToClipboard = () => {
		const content = document.getElementById("boilerplate-content")?.innerText;
		if (content) {
			navigator.clipboard.writeText(content);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const tabs = [
		{
			id: "getting-started" as TabType,
			label: "Getting Started",
			icon: Terminal,
		},
		{ id: "structure" as TabType, label: "File Structure", icon: FolderTree },
		{ id: "patterns" as TabType, label: "Code Patterns", icon: Code2 },
	];

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
			<div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
				{/* Header */}
				<div className="sticky top-0 bg-linear-to-r from-gray-900 to-gray-800 text-white p-5 flex justify-between items-center">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-teal-500/20 rounded-xl">
							<FileText className="w-5 h-5 text-teal-400" />
						</div>
						<div>
							<h2 className="text-lg font-bold">Quick Reference</h2>
							<p className="text-xs text-gray-300">
								Essential project info at a glance
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={copyToClipboard}
							className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
							title="Copy to clipboard"
						>
							{copied ? (
								<Check className="w-4 h-4 text-green-400" />
							) : (
								<Copy className="w-4 h-4" />
							)}
						</button>
						<button
							onClick={onClose}
							className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* Tabs */}
				<div className="sticky top-[61px] bg-white border-b border-gray-200 px-5 pt-3">
					<div className="flex gap-1">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`px-4 py-2 rounded-t-lg text-sm font-medium flex items-center gap-2 transition-all ${
										isActive
											? "bg-teal-50 text-teal-700 border-b-2 border-teal-600"
											: "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
									}`}
								>
									<Icon size={14} />
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Content */}
				<div
					className="overflow-y-auto p-5"
					style={{ maxHeight: "calc(85vh - 110px)" }}
				>
					<div id="boilerplate-content" className="prose prose-sm max-w-none">
						{/* Tab 1: Getting Started */}
						{activeTab === "getting-started" && (
							<div className="space-y-6 animate-in fade-in duration-300">
								<section>
									<h2 className="text-lg font-bold text-gray-900 mb-3">
										🚀 Quick Start
									</h2>
									<div className="bg-gray-900 rounded-lg p-3">
										<pre className="text-gray-100 text-xs overflow-x-auto">
											<code>{`npm install          # Install dependencies
cp .env.example .env  # Setup environment
npm run dev          # Start development server`}</code>
										</pre>
									</div>
								</section>

								<section>
									<h3 className="text-md font-bold text-gray-900 mb-2">
										📦 Common Commands
									</h3>
									<div className="grid grid-cols-2 gap-2">
										<div className="bg-gray-50 rounded p-2">
											<code className="text-xs font-mono text-teal-700">
												npm run dev
											</code>
											<p className="text-xs text-gray-500">Start dev server</p>
										</div>
										<div className="bg-gray-50 rounded p-2">
											<code className="text-xs font-mono text-teal-700">
												npm run build
											</code>
											<p className="text-xs text-gray-500">Production build</p>
										</div>
										<div className="bg-gray-50 rounded p-2">
											<code className="text-xs font-mono text-teal-700">
												npm run lint
											</code>
											<p className="text-xs text-gray-500">Run ESLint</p>
										</div>
										<div className="bg-gray-50 rounded p-2">
											<code className="text-xs font-mono text-teal-700">
												npm run type-check
											</code>
											<p className="text-xs text-gray-500">Type check</p>
										</div>
									</div>
								</section>

								<section>
									<h3 className="text-md font-bold text-gray-900 mb-2">
										🎨 Icons
									</h3>
									<div className="bg-purple-50 rounded-lg p-3">
										<p className="text-sm text-gray-700 mb-2">
											This template uses <strong>lucide-react</strong> for
											icons.
										</p>
										<pre className="text-xs bg-gray-900 text-gray-100 rounded p-2 overflow-x-auto">
											<code>{`import { ArrowRight } from 'lucide-react';
<ArrowRight size={20} className="group-hover:translate-x-1" />`}</code>
										</pre>
										<a
											href="https://lucide.dev/icons/"
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 mt-2"
										>
											Browse all icons <ExternalLink size={10} />
										</a>
									</div>
								</section>

								<section>
									<h3 className="text-md font-bold text-gray-900 mb-2">
										📚 Full Documentation
									</h3>
									<p className="text-sm text-gray-600">
										Check the{" "}
										<code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
											README.md
										</code>{" "}
										file in the project root for complete documentation
										including:
									</p>
									<ul className="text-xs text-gray-500 mt-2 space-y-1 list-disc list-inside">
										<li>Architecture overview & route groups</li>
										<li>UI component standards & promotion rules</li>
										<li>Services layer & API integration patterns</li>
										<li>Development guidelines & code conventions</li>
										<li>AGENTS.md & CLAUDE.md for AI assistants</li>
									</ul>
								</section>
							</div>
						)}

						{/* Tab 2: File Structure - Keep as is (it's good) */}
						{activeTab === "structure" && (
							<div className="space-y-6 animate-in fade-in duration-300">
								<section>
									<h2 className="text-lg font-bold text-gray-900 mb-3">
										📁 Project Structure
									</h2>
									<div className="bg-gray-900 rounded-lg p-4 overflow-x-auto max-h-96">
										<pre className="text-gray-300 text-xs font-mono">
											<code>{`next_template_v1/
├── app/
│   ├── (auth)/          # Auth required
│   ├── (private)/       # Dashboard + sidebar
│   └── (public)/        # Landing, login, about
├── shared/
│   ├── layout/          # Header, Sidebar, Footer
│   └── ui/              # Reusable components
├── services/
│   ├── api/             # API wrapper, endpoints
│   └── integration/     # Feature API calls
└── [config files]`}</code>
										</pre>
									</div>
								</section>

								<section>
									<h3 className="text-md font-bold text-gray-900 mb-2">
										Feature Pattern
									</h3>
									<div className="bg-purple-50 rounded-lg p-3">
										<pre className="text-xs font-mono text-gray-800">
											<code>{`featureName/
├── components/    # UI components
├── hooks/         # Custom hooks
├── models/        # Types/interfaces
└── services/      # API calls`}</code>
										</pre>
									</div>
								</section>
							</div>
						)}

						{/* Tab 3: Code Patterns - Simplified */}
						{activeTab === "patterns" && (
							<div className="space-y-5 animate-in fade-in duration-300">
								<section>
									<h2 className="text-lg font-bold text-gray-900 mb-3">
										🔧 Common Patterns
									</h2>

									<div className="mb-4">
										<h3 className="text-sm font-bold text-gray-800 mb-2">
											API Call Pattern
										</h3>
										<div className="bg-gray-900 rounded-lg p-3">
											<pre className="text-gray-100 text-xs overflow-x-auto">
												<code>{`// services/integration/feature/getData.ts
import { ApiWrapper } from '@/services/api/ApiWrapper';

export async function getData() {
  return ApiWrapper.get('/api/endpoint');
}`}</code>
											</pre>
										</div>
									</div>

									<div className="mb-4">
										<h3 className="text-sm font-bold text-gray-800 mb-2">
											Layout Protection
										</h3>
										<div className="bg-gray-900 rounded-lg p-3">
											<pre className="text-gray-100 text-xs overflow-x-auto">
												<code>{`// app/(private)/layout.tsx
export default function PrivateLayout({ children }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return <>{children}</>;
}`}</code>
											</pre>
										</div>
									</div>

									<div className="mb-4">
										<h3 className="text-sm font-bold text-gray-800 mb-2">
											Custom Hook Pattern
										</h3>
										<div className="bg-gray-900 rounded-lg p-3">
											<pre className="text-gray-100 text-xs overflow-x-auto">
												<code>{`export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  return [value, setValue] as const;
}`}</code>
											</pre>
										</div>
									</div>
								</section>
							</div>
						)}

						{/* Footer */}
						<div className="text-center pt-4 border-t mt-6 mb-3">
							<p className="text-xs text-gray-400">
								Bakawan Data Analytics, Inc. — See{" "}
								<code className="text-xs">README.md</code> for full docs
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
