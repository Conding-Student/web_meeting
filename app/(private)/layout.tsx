"use client";

import React from "react";

import Sidebar from "@/shared/layout/Sidebar";
import Header from "@/shared/layout/Header";
import { usePathname } from "next/navigation";

export default function PrivateLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	return (
		<div className="min-h-screen bg-[#F8F9FA]">
			{/* Sidebar */}
			<Sidebar key={pathname} />

			{/* Main Wrapper */}
			<div className="flex flex-col min-h-screen ml-20 transition-all duration-300">
				<Header />

				<main className="flex-1 p-8 overflow-y-auto">
					<div className="max-w-400 mx-auto">{children}</div>
				</main>
			</div>
		</div>
	);
}
