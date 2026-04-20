// shared/ui/BoilerplateModal.tsx
"use client";

import React, { useState } from "react";
import {
	X,
	Copy,
	Check,
	FileText,
	FolderTree,
	BookOpen,
	Code2,
	Terminal,
	Settings,
	Shield,
	Zap,
} from "lucide-react";

interface BoilerplateModalProps {
	isOpen: boolean;
	onClose: () => void;
}

type TabType = "documentation" | "structure" | "examples";

export default function BoilerplateModal({
	isOpen,
	onClose,
}: BoilerplateModalProps) {
	const [copied, setCopied] = useState(false);
	const [activeTab, setActiveTab] = useState<TabType>("documentation");

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
		{ id: "documentation" as TabType, label: "Documentation", icon: BookOpen },
		{ id: "structure" as TabType, label: "File Structure", icon: FolderTree },
		{ id: "examples" as TabType, label: "Code Examples", icon: Code2 },
	];

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
			<div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300">
				{/* Header */}
				<div className="sticky top-0 bg-linear-to-r from-gray-900 to-gray-800 text-white p-6 flex justify-between items-center">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-teal-500/20 rounded-xl">
							<FileText className="w-6 h-6 text-teal-400" />
						</div>
						<div>
							<h2 className="text-xl font-bold">Project Boilerplate</h2>
							<p className="text-sm text-gray-300">
								Complete documentation & architecture overview
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={copyToClipboard}
							className="p-2 hover:bg-white/10 rounded-lg transition-colors"
							title="Copy to clipboard"
						>
							{copied ? (
								<Check className="w-5 h-5 text-green-400" />
							) : (
								<Copy className="w-5 h-5" />
							)}
						</button>
						<button
							onClick={onClose}
							className="p-2 hover:bg-white/10 rounded-lg transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Navigation Tabs */}
				<div className="sticky top-18.25 bg-white border-b border-gray-200 px-6 pt-4">
					<div className="flex gap-1">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							const isActive = activeTab === tab.id;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`px-5 py-2.5 rounded-t-lg text-sm font-semibold flex items-center gap-2 transition-all ${
										isActive
											? "bg-teal-50 text-teal-700 border-b-2 border-teal-600"
											: "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
									}`}
								>
									<Icon size={16} />
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Content */}
				<div
					className="overflow-y-auto p-6"
					style={{ maxHeight: "calc(90vh - 130px)" }}
				>
					<div id="boilerplate-content" className="prose prose-sm max-w-none">
						{/* Documentation Tab Content */}
						{activeTab === "documentation" && (
							<div className="space-y-8 animate-in fade-in duration-300">
								{/* Getting Started */}
								<section>
									<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
										<Terminal size={24} className="text-teal-600" />
										🚀 Getting Started
									</h2>
									<div className="bg-gray-900 rounded-xl p-4">
										<pre className="text-gray-100 text-sm overflow-x-auto">
											<code>{`# Clone the template
git clone <repository-url> next-template
cd next-template

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev`}</code>
										</pre>
									</div>
								</section>

								{/* Development Commands */}
								<section>
									<h3 className="text-xl font-bold text-gray-900 mb-3">
										📦 Development Commands
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
										<div className="bg-gray-50 rounded-lg p-3">
											<code className="text-sm font-mono text-teal-700">
												npm run dev
											</code>
											<p className="text-xs text-gray-500 mt-1">
												Start dev server on http://localhost:3000
											</p>
										</div>
										<div className="bg-gray-50 rounded-lg p-3">
											<code className="text-sm font-mono text-teal-700">
												npm run build
											</code>
											<p className="text-xs text-gray-500 mt-1">
												Production build
											</p>
										</div>
										<div className="bg-gray-50 rounded-lg p-3">
											<code className="text-sm font-mono text-teal-700">
												npm run start
											</code>
											<p className="text-xs text-gray-500 mt-1">
												Start production server
											</p>
										</div>
										<div className="bg-gray-50 rounded-lg p-3">
											<code className="text-sm font-mono text-teal-700">
												npm run lint
											</code>
											<p className="text-xs text-gray-500 mt-1">Run ESLint</p>
										</div>
									</div>
								</section>

								{/* Architecture Overview */}
								<section>
									<h2 className="text-2xl font-bold text-gray-900 mb-4">
										🏗️ Architecture Overview
									</h2>
									<div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-4">
										<h3 className="font-bold text-gray-800 mb-2">
											Route Groups
										</h3>
										<ul className="space-y-2 text-gray-700">
											<li>
												• <strong className="text-blue-700">(auth)</strong> -
												Authentication-required routes
											</li>
											<li>
												• <strong className="text-green-700">(private)</strong>{" "}
												- Private routes with shared layout
											</li>
											<li>
												• <strong className="text-purple-700">(public)</strong>{" "}
												- Publicly accessible routes
											</li>
										</ul>
									</div>
								</section>

								{/* UI Component Standards */}
								<section>
									<h2 className="text-2xl font-bold text-gray-900 mb-4">
										🎨 UI Component Standards
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
											<h3 className="font-bold text-gray-800 mb-2">
												DataTable
											</h3>
											<p className="text-sm text-gray-600">
												Handles complex datasets with built-in pagination and
												sorting logic.
											</p>
										</div>
										<div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
											<h3 className="font-bold text-gray-800 mb-2">
												SearchableDropdown
											</h3>
											<p className="text-sm text-gray-600">
												Enhanced select input with fuzzy-search and
												brand-specific styling.
											</p>
										</div>
										<div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
											<h3 className="font-bold text-gray-800 mb-2">
												ToastGlobal
											</h3>
											<p className="text-sm text-gray-600">
												Feedback system managed via Zustand state.
											</p>
										</div>
										<div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
											<h3 className="font-bold text-gray-800 mb-2">Modal</h3>
											<p className="text-sm text-gray-600">
												Portal-based overlay system to avoid z-index conflicts.
											</p>
										</div>
									</div>
								</section>

								{/* Development Guidelines */}
								<section>
									<h2 className="text-2xl font-bold text-gray-900 mb-4">
										📝 Development Guidelines
									</h2>
									<div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded-r-lg">
										<p className="text-sm text-amber-800">
											<strong>Component Promotion Rule:</strong> If a component
											is used in only one page, keep it in that route&apos;s
											components/ folder. If used across two or more features,
											move it to shared/ui/.
										</p>
									</div>
								</section>

								{/* Services Layer */}
								<section>
									<h2 className="text-2xl font-bold text-gray-900 mb-4">
										🔌 Services Layer
									</h2>
									<div className="space-y-3">
										<div className="bg-green-50 rounded-lg p-4">
											<h3 className="font-bold text-green-800 mb-2">
												ApiWrapper.ts
											</h3>
											<p className="text-sm text-green-700">
												Base fetch wrapper — add auth headers, error handling,
												retries here
											</p>
										</div>
										<div className="bg-blue-50 rounded-lg p-4">
											<h3 className="font-bold text-blue-800 mb-2">
												ApiEndpoint.ts
											</h3>
											<p className="text-sm text-blue-700">
												Centralized map of all API endpoint URLs
											</p>
										</div>
									</div>
								</section>
							</div>
						)}

						{/* File Structure Tab Content */}
						{activeTab === "structure" && (
							<div className="space-y-6 animate-in fade-in duration-300">
								<section>
									<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
										<FolderTree size={24} className="text-teal-600" />
										Complete Project Structure
									</h2>
									<div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
										<pre className="text-gray-300 text-sm font-mono">
											<code>{`📁 next_template_v1/
├── 📁 app/
│   ├── 📁 (auth)/              # Authentication routes
│   │   └── 📁 featureOne/
│   │       ├── 📁 components/
│   │       ├── 📁 hooks/
│   │       ├── 📁 models/
│   │       └── 📁 services/
│   ├── 📁 (private)/           # Protected routes
│   │   ├── 📁 dashboard/
│   │   ├── 📁 staff/
│   │   └── 📁 ui-test/
│   ├── 📁 (public)/            # Public routes
│   │   ├── 📁 about/
│   │   ├── 📁 signin/
│   │   └── 📁 unauthorized/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── 📁 nginx_config/
│   └── nginx.conf
│
├── 📁 public/                  # Static assets
│
├── 📁 services/                # API & Business logic
│   ├── 📁 api/
│   │   ├── ApiEndpoint.ts
│   │   ├── ApiError.ts
│   │   ├── ApiWrapper.ts
│   │   └── GlobalApiResponse.ts
│   └── 📁 integration/
│       ├── 📁 auth/
│       └── 📁 sample/
│
├── 📁 shared/                  # Reusable components
│   ├── 📁 layout/
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   └── 📁 ui/
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── DataTable.tsx
│       └── SearchableDropdown.tsx
│
├── .env
├── .gitignore
├── Dockerfile
├── next.config.ts
├── package.json
├── README.md
└── tsconfig.json`}</code>
										</pre>
									</div>
								</section>

								<section>
									<h3 className="text-xl font-bold text-gray-900 mb-3">
										Feature Module Pattern
									</h3>
									<div className="bg-linear-to-r from-purple-50 to-pink-50 rounded-xl p-6">
										<pre className="text-sm font-mono text-gray-800">
											<code>{`featureName/
├── 📁 components/    # Feature-specific components
├── 📁 hooks/         # Feature-specific hooks
├── 📁 models/        # Feature-specific models/types
├── 📁 services/      # Feature-specific services/actions
└── index.ts          # Public API exports`}</code>
										</pre>
									</div>
								</section>
							</div>
						)}

						{/* Code Examples Tab Content */}
						{activeTab === "examples" && (
							<div className="space-y-6 animate-in fade-in duration-300">
								<section>
									<h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
										<Code2 size={24} className="text-teal-600" />
										Code Examples & Patterns
									</h2>

									{/* API Integration Example */}
									<div className="mb-6">
										<h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
											<Zap size={18} className="text-yellow-500" />
											API Integration Pattern
										</h3>
										<div className="bg-gray-900 rounded-xl p-4">
											<pre className="text-gray-100 text-sm overflow-x-auto">
												<code>{`// services/integration/auth/login.ts
import { ApiWrapper } from '@/services/api/ApiWrapper';
import { ApiEndpoint } from '@/services/api/ApiEndpoint';
import { GlobalApiResponse } from '@/services/api/GlobalApiResponse';

export async function login(email: string, password: string) {
  return ApiWrapper.post(ApiEndpoint.AUTH.LOGIN, { email, password });
}

// Usage in component
import { login } from '@/services/integration/auth/login';

const handleLogin = async () => {
  try {
    const response = await login(email, password);
    console.log('Login successful:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
};`}</code>
											</pre>
										</div>
									</div>

									{/* Layout Protection Example */}
									<div className="mb-6">
										<h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
											<Shield size={18} className="text-green-600" />
											Route Protection Pattern
										</h3>
										<div className="bg-gray-900 rounded-xl p-4">
											<pre className="text-gray-100 text-sm overflow-x-auto">
												<code>{`// app/(private)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/services/mock/auth';

export default function PrivateLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/signin');
    }
  }, [router]);

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}`}</code>
											</pre>
										</div>
									</div>

									{/* Custom Hook Example */}
									<div className="mb-6">
										<h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
											<Settings size={18} className="text-blue-600" />
											Custom Hook Pattern
										</h3>
										<div className="bg-gray-900 rounded-xl p-4">
											<pre className="text-gray-100 text-sm overflow-x-auto">
												<code>{`// shared/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}`}</code>
											</pre>
										</div>
									</div>

									{/* Component Example */}
									<div className="mb-6">
										<h3 className="text-lg font-bold text-gray-800 mb-3">
											Reusable Component Pattern
										</h3>
										<div className="bg-gray-900 rounded-xl p-4">
											<pre className="text-gray-100 text-sm overflow-x-auto">
												<code>{`// shared/ui/Card.tsx
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={\`bg-white rounded-lg shadow-md p-6 \${className}\`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}`}</code>
											</pre>
										</div>
									</div>
								</section>
							</div>
						)}

						{/* Footer */}
						<div className="text-center pt-6 border-t mt-8">
							<p className="text-xs text-gray-400">
								Bakawan Data Analytics, Inc. — Enterprise Next.js Template v1.0
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
