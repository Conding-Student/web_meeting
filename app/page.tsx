"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Code2, Layout, Boxes, Video } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BoilerplateModal from "@/shared/ui/BoilerplateModal";
import {
	createMeetingRoomName,
	normalizeMeetingRoomName,
} from "@/shared/utils/meetingRoom";

export default function HeroPage() {
	const router = useRouter();

	const [showBoilerplate, setShowBoilerplate] = useState(false);
	const [roomCode, setRoomCode] = useState("");

	function handleCreateMeeting() {
		const roomName = createMeetingRoomName();

		router.push(`/meeting/${roomName}`);
	}

	function handleJoinMeeting() {
		const normalizedRoomCode = normalizeMeetingRoomName(roomCode);

		if (!normalizedRoomCode) {
			alert("Please enter a valid room code.");
			return;
		}

		router.push(`/meeting/${normalizedRoomCode}`);
	}

	return (
		<>
			<div className="min-h-screen bg-white flex flex-col">
				{/* Navbar */}
				<nav className="flex items-center justify-between px-10 py-6 border-b border-gray-50">
					<div className="flex items-center gap-3">
						{/* Logo Container */}
						<div className="relative w-10 h-10 overflow-hidden rounded-lg">
							<Image
								src="/Bakawan_Logo.png"
								alt="Bakawan Logo"
								fill
								className="object-contain"
								priority
								sizes="40px"
							/>
						</div>

						<div className="flex flex-col">
							<span className="text-sm font-bold text-gray-900 leading-tight">
								Bakawan Data Analytics
							</span>
							<span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
								v1.0
							</span>
						</div>
					</div>
				</nav>

				<main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
					{/* Version Badge */}
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600 text-xs font-mono mb-8">
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8d941] opacity-75"></span>
							<span className="relative inline-flex rounded-full h-2 w-2 bg-[#05582E]"></span>
						</span>
						Next.js 15 Enterprise Architecture
					</div>

					{/* Headline */}
					<h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-8">
						Front-End <span className="text-[#05582E]">Template</span>
					</h1>

					<p className="max-w-3xl text-gray-500 text-lg md:text-xl mb-12 leading-relaxed">
						A standardized, pre-configured Next.js template featuring modular
						directory structures, and a corporate UI kit.
					</p>

					{/* CTA Section */}
					<div className="flex flex-col sm:flex-row gap-5">
						<Link
							href="/dashboard"
							className="group flex items-center justify-center gap-3 px-10 py-4 bg-[#05582E] text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-900/20"
						>
							Explore Template{" "}
							<ArrowRight
								size={20}
								className="group-hover:translate-x-1 transition-transform"
							/>
						</Link>

						<Link
							href="/videos"
							className="group flex items-center justify-center gap-3 px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-900/20"
						>
							Attention Prototype
							<ArrowRight
								size={20}
								className="group-hover:translate-x-1 transition-transform"
							/>
						</Link>

						<button
							type="button"
							onClick={handleCreateMeeting}
							className="group flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-900/20"
						>
							<Video size={20} />
							Create Meeting
							<ArrowRight
								size={20}
								className="group-hover:translate-x-1 transition-transform"
							/>
						</button>

						<button
							type="button"
							onClick={() => setShowBoilerplate(true)}
							className="flex items-center justify-center gap-2 px-10 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold hover:border-[#e8d941] transition-all"
						>
							<Code2 size={20} /> View Boilerplate
						</button>
					</div>

					{/* Join Existing Meeting */}
					<div className="mt-8 w-full max-w-xl rounded-3xl border border-gray-100 bg-gray-50 p-5">
						<p className="mb-4 text-sm font-semibold text-gray-600">
							Already have a meeting room code?
						</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<input
								value={roomCode}
								onChange={(event) => setRoomCode(event.target.value)}
								onKeyDown={(event) => {
									if (event.key === "Enter") {
										handleJoinMeeting();
									}
								}}
								placeholder="Example: room-mb8k91a-x7p2d"
								className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm text-gray-800 outline-none focus:border-blue-500"
							/>

							<button
								type="button"
								onClick={handleJoinMeeting}
								className="rounded-2xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
							>
								Join Room
							</button>
						</div>
					</div>

					{/* Feature Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl w-full">
						<div className="group p-8 text-left bg-white border border-gray-100 rounded-3xl hover:border-[#05582E]/20 transition-all">
							<div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#05582E] mb-6 group-hover:bg-[#05582E] group-hover:text-white transition-colors">
								<Layout size={28} />
							</div>

							<h3 className="font-bold text-xl text-gray-900 mb-3">
								Modular Layouts
							</h3>

							<p className="text-gray-500 leading-relaxed">
								Responsive Sidebar, Header, and Footer components pre-built.
							</p>
						</div>

						<div className="group p-8 text-left bg-white border border-gray-100 rounded-3xl hover:border-[#05582E]/20 transition-all">
							<div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-[#e8d941] mb-6 group-hover:bg-[#e8d941] group-hover:text-white transition-colors">
								<Boxes size={28} />
							</div>

							<h3 className="font-bold text-xl text-gray-900 mb-3">
								Feature Folders
							</h3>

							<p className="text-gray-500 leading-relaxed">
								Clean separation of concerns with dedicated components, hooks,
								and services per feature.
							</p>
						</div>

						<div className="group p-8 text-left bg-white border border-gray-100 rounded-3xl hover:border-[#05582E]/20 transition-all">
							<div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
								<Code2 size={28} />
							</div>

							<h3 className="font-bold text-xl text-gray-900 mb-3">
								API Wrapper
							</h3>

							<p className="text-gray-500 leading-relaxed">
								A robust Server/Client API utility with built-in error handling.
							</p>
						</div>
					</div>
				</main>

				<footer className="py-12 border-t border-gray-50 text-center">
					<p className="text-gray-400 text-sm font-medium">
						Bakawan Data Analytics, Inc. &copy; 2026
					</p>
				</footer>
			</div>

			{/* Boilerplate Modal */}
			<BoilerplateModal
				isOpen={showBoilerplate}
				onClose={() => setShowBoilerplate(false)}
			/>
		</>
	);
}