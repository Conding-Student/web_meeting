"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Play, Square } from "lucide-react";

const LESSON_VIDEO_SRC =
	"https://res.cloudinary.com/dxi2yyku4/video/upload/f_mp4,q_auto/375_cwrst9.mp4";

type AttentionStatus =
	| "idle"
	| "loading"
	| "camera_ready"
	| "checking"
	| "looking"
	| "not_looking"
	| "absent"
	| "sleeping"
	| "camera_error";

type Landmark = {
	x: number;
	y: number;
	z?: number;
};

type FaceResult = {
	faceLandmarks?: Landmark[][];
};

type FaceLandmarkerLike = {
	detectForVideo: (
		video: HTMLVideoElement,
		timestampMs: number
	) => FaceResult;
};

export default function AttentionVideoPage() {
	const lessonVideoRef = useRef<HTMLVideoElement | null>(null);
	const cameraVideoRef = useRef<HTMLVideoElement | null>(null);

	const faceLandmarkerRef = useRef<FaceLandmarkerLike | null>(null);
	const cameraStreamRef = useRef<MediaStream | null>(null);
	const animationFrameRef = useRef<number | null>(null);

	const problemStartRef = useRef<number | null>(null);
	const lookingStartRef = useRef<number | null>(null);
	const lastCameraVideoTimeRef = useRef<number>(-1);

	const isPausedByAttentionRef = useRef(false);

	const [status, setStatus] = useState<AttentionStatus>("idle");
	const [message, setMessage] = useState("Click Start Detection to begin.");
	const [isDetectionStarted, setIsDetectionStarted] = useState(false);
	const [isPausedByAttention, setIsPausedByAttention] = useState(false);

	const TRIGGER_MS = 2000;
	const RECOVERY_MS = 800;

	function emitStatus(nextStatus: AttentionStatus) {
		setStatus(nextStatus);

		switch (nextStatus) {
			case "idle":
				setMessage("Click Start Detection to begin.");
				break;
			case "loading":
				setMessage("Loading MediaPipe and requesting camera permission...");
				break;
			case "camera_ready":
				setMessage("Camera ready. Play the video to start testing.");
				break;
			case "checking":
				setMessage("Checking attention...");
				break;
			case "looking":
				setMessage("Looking at the screen.");
				break;
			case "not_looking":
				setMessage("Not looking at the screen. Video paused.");
				break;
			case "absent":
				setMessage("No face detected. Video paused.");
				break;
			case "sleeping":
				setMessage("Possible sleeping / eyes closed. Video paused.");
				break;
			case "camera_error":
				setMessage("Camera or MediaPipe error. Check permission or console.");
				break;
		}
	}

	function normalizedPosition(value: number, pointA: number, pointB: number) {
		const min = Math.min(pointA, pointB);
		const max = Math.max(pointA, pointB);
		const size = max - min;

		if (size <= 0.00001) return 0.5;

		return (value - min) / size;
	}

	function distanceX(a: Landmark, b: Landmark) {
		return Math.abs(a.x - b.x);
	}

	function distanceY(a: Landmark, b: Landmark) {
		return Math.abs(a.y - b.y);
	}

	function pauseVideoByAttention(reason: AttentionStatus) {
		const lessonVideo = lessonVideoRef.current;

		if (!lessonVideo) return;

		if (!lessonVideo.paused) {
			lessonVideo.pause();
		}

		isPausedByAttentionRef.current = true;
		setIsPausedByAttention(true);
		emitStatus(reason);
	}

	async function resumeVideoAfterAttention() {
		const lessonVideo = lessonVideoRef.current;

		if (!lessonVideo) return;

		if (isPausedByAttentionRef.current) {
			isPausedByAttentionRef.current = false;
			setIsPausedByAttention(false);

			try {
				await lessonVideo.play();
			} catch {
				// Browser may block automatic resume.
				// User can press play manually.
			}
		}

		emitStatus("looking");
	}

	function processFaceResult(result: FaceResult) {
		const now = Date.now();

		if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
			lookingStartRef.current = null;

			if (problemStartRef.current === null) {
				problemStartRef.current = now;
			}

			const elapsed = now - problemStartRef.current;

			if (elapsed >= TRIGGER_MS) {
				pauseVideoByAttention("absent");
			} else {
				emitStatus("checking");
			}

			return;
		}

		const lm = result.faceLandmarks[0];

		const nose = lm[1];

		const leftEyeOuter = lm[33];
		const leftEyeInner = lm[133];

		const rightEyeOuter = lm[263];
		const rightEyeInner = lm[362];

		const leftEyeTop = lm[159];
		const leftEyeBottom = lm[145];

		const rightEyeTop = lm[386];
		const rightEyeBottom = lm[374];

		const leftIris = lm[468];
		const rightIris = lm[473];

		if (
			!nose ||
			!leftEyeOuter ||
			!leftEyeInner ||
			!rightEyeOuter ||
			!rightEyeInner ||
			!leftEyeTop ||
			!leftEyeBottom ||
			!rightEyeTop ||
			!rightEyeBottom ||
			!leftIris ||
			!rightIris
		) {
			emitStatus("checking");
			return;
		}

		const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
		const faceWidth = Math.abs(rightEyeOuter.x - leftEyeOuter.x);

		const normalizedHeadOffsetX =
			faceWidth > 0.00001
				? Math.abs(nose.x - eyeCenterX) / faceWidth
				: 0;

		const headFacing = normalizedHeadOffsetX < 0.22;

		const leftGazeX = normalizedPosition(
			leftIris.x,
			leftEyeOuter.x,
			leftEyeInner.x
		);

		const rightGazeX = normalizedPosition(
			rightIris.x,
			rightEyeInner.x,
			rightEyeOuter.x
		);

		const avgGazeX = (leftGazeX + rightGazeX) / 2;

		const leftGazeY = normalizedPosition(
			leftIris.y,
			leftEyeTop.y,
			leftEyeBottom.y
		);

		const rightGazeY = normalizedPosition(
			rightIris.y,
			rightEyeTop.y,
			rightEyeBottom.y
		);

		const avgGazeY = (leftGazeY + rightGazeY) / 2;

		const gazeOnScreen =
			avgGazeX > 0.35 &&
			avgGazeX < 0.65 &&
			avgGazeY > 0.3 &&
			avgGazeY < 0.8;

		const leftEyeWidth = distanceX(leftEyeOuter, leftEyeInner);
		const rightEyeWidth = distanceX(rightEyeOuter, rightEyeInner);

		const leftEyeOpenRatio =
			leftEyeWidth > 0.00001
				? distanceY(leftEyeTop, leftEyeBottom) / leftEyeWidth
				: 1;

		const rightEyeOpenRatio =
			rightEyeWidth > 0.00001
				? distanceY(rightEyeTop, rightEyeBottom) / rightEyeWidth
				: 1;

		const avgEyeOpenRatio = (leftEyeOpenRatio + rightEyeOpenRatio) / 2;

		const eyesClosed = avgEyeOpenRatio < 0.07;

		// Uncomment kapag gusto mong i-calibrate.
		// console.log({
		// 	head: normalizedHeadOffsetX.toFixed(3),
		// 	gazeX: avgGazeX.toFixed(3),
		// 	gazeY: avgGazeY.toFixed(3),
		// 	eyeOpen: avgEyeOpenRatio.toFixed(3),
		// 	headFacing,
		// 	gazeOnScreen,
		// 	eyesClosed,
		// });

		let hasProblem = false;
		let reason: AttentionStatus = "not_looking";

		if (eyesClosed) {
			hasProblem = true;
			reason = "sleeping";
		} else if (!headFacing || !gazeOnScreen) {
			hasProblem = true;
			reason = "not_looking";
		}

		if (hasProblem) {
			lookingStartRef.current = null;

			if (problemStartRef.current === null) {
				problemStartRef.current = now;
			}

			const elapsed = now - problemStartRef.current;

			if (elapsed >= TRIGGER_MS) {
				pauseVideoByAttention(reason);
			} else {
				emitStatus("checking");
			}

			return;
		}

		problemStartRef.current = null;

		if (lookingStartRef.current === null) {
			lookingStartRef.current = now;
		}

		const lookingElapsed = now - lookingStartRef.current;

		if (lookingElapsed >= RECOVERY_MS) {
			void resumeVideoAfterAttention();
		}
	}

	function predictionLoop() {
		const cameraVideo = cameraVideoRef.current;
		const faceLandmarker = faceLandmarkerRef.current;

		if (!cameraVideo || !faceLandmarker) {
			animationFrameRef.current = requestAnimationFrame(predictionLoop);
			return;
		}

		if (cameraVideo.readyState < 2) {
			animationFrameRef.current = requestAnimationFrame(predictionLoop);
			return;
		}

		if (cameraVideo.currentTime !== lastCameraVideoTimeRef.current) {
			lastCameraVideoTimeRef.current = cameraVideo.currentTime;

			const result = faceLandmarker.detectForVideo(
				cameraVideo,
				performance.now()
			);

			processFaceResult(result);
		}

		animationFrameRef.current = requestAnimationFrame(predictionLoop);
	}

	async function startDetection() {
		try {
			setIsDetectionStarted(true);
			emitStatus("loading");

			const { FaceLandmarker, FilesetResolver } = await import(
				"@mediapipe/tasks-vision"
			);

			const vision = await FilesetResolver.forVisionTasks(
				"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
			);

			const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
				baseOptions: {
					modelAssetPath:
						"https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
					delegate: "GPU",
				},
				runningMode: "VIDEO",
				numFaces: 1,
				minFaceDetectionConfidence: 0.5,
				minFacePresenceConfidence: 0.5,
				minTrackingConfidence: 0.5,
				outputFaceBlendshapes: true,
				outputFacialTransformationMatrixes: false,
			});

			faceLandmarkerRef.current = faceLandmarker as FaceLandmarkerLike;

			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: 640,
					height: 480,
					facingMode: "user",
				},
				audio: false,
			});

			cameraStreamRef.current = stream;

			if (cameraVideoRef.current) {
				cameraVideoRef.current.srcObject = stream;
				await cameraVideoRef.current.play();
			}

			problemStartRef.current = null;
			lookingStartRef.current = null;
			lastCameraVideoTimeRef.current = -1;

			emitStatus("camera_ready");
			predictionLoop();
		} catch (error) {
			console.error("Detection error:", error);
			setIsDetectionStarted(false);
			emitStatus("camera_error");
		}
	}

	function stopDetection() {
		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
		}

		animationFrameRef.current = null;

		if (cameraStreamRef.current) {
			for (const track of cameraStreamRef.current.getTracks()) {
				track.stop();
			}

			cameraStreamRef.current = null;
		}

		if (cameraVideoRef.current) {
			cameraVideoRef.current.srcObject = null;
		}

		faceLandmarkerRef.current = null;
		problemStartRef.current = null;
		lookingStartRef.current = null;
		lastCameraVideoTimeRef.current = -1;

		isPausedByAttentionRef.current = false;

		setIsDetectionStarted(false);
		setIsPausedByAttention(false);
		emitStatus("idle");
	}

	async function toggleLessonVideo() {
		const lessonVideo = lessonVideoRef.current;

		if (!lessonVideo) return;

		if (lessonVideo.paused) {
			await lessonVideo.play();
		} else {
			lessonVideo.pause();
		}
	}

	useEffect(() => {
		return () => {
			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
			}

			if (cameraStreamRef.current) {
				for (const track of cameraStreamRef.current.getTracks()) {
					track.stop();
				}
			}
		};
	}, []);

	const statusClass =
		status === "looking"
			? "border-green-500 bg-green-50 text-green-700"
			: status === "checking" || status === "camera_ready"
				? "border-yellow-500 bg-yellow-50 text-yellow-700"
				: status === "not_looking" ||
					  status === "absent" ||
					  status === "sleeping" ||
					  status === "camera_error"
					? "border-red-500 bg-red-50 text-red-700"
					: "border-gray-200 bg-gray-50 text-gray-600";

	return (
		<div className="min-h-screen bg-white">
			<nav className="flex items-center justify-between px-10 py-6 border-b border-gray-50">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#05582E] transition-colors"
				>
					<ArrowLeft size={18} />
					Back to Home
				</Link>

				<div className="text-sm font-bold text-gray-900">
					Attention Video Prototype
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-6 py-10">
				<div className="mb-8">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-600 text-xs font-mono mb-4">
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8d941] opacity-75" />
							<span className="relative inline-flex rounded-full h-2 w-2 bg-[#05582E]" />
						</span>
						MediaPipe Face Landmarker
					</div>

					<h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
						Video Attention <span className="text-[#05582E]">Checker</span>
					</h1>

					<p className="max-w-3xl text-gray-500 text-lg leading-relaxed">
						Prototype muna ito for video activity. Kapag absent, hindi
						nakatingin, or possible sleeping for 6 seconds, automatic
						magpa-pause yung video.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
					<section className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
						<div className="rounded-2xl overflow-hidden bg-black">
							<video
								ref={lessonVideoRef}
								src={LESSON_VIDEO_SRC}
								controls
								playsInline
								preload="metadata"
								className="w-full aspect-video bg-black"
							/>
						</div>

						<div className="flex flex-col sm:flex-row gap-4 mt-5">
							<button
								onClick={toggleLessonVideo}
								className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#05582E] text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-green-900/20"
							>
								<Play size={18} />
								Play / Pause Video
							</button>

							{!isDetectionStarted ? (
								<button
									onClick={startDetection}
									className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-900/20"
								>
									<Camera size={18} />
									Start Detection
								</button>
							) : (
								<button
									onClick={stopDetection}
									className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-red-900/20"
								>
									<Square size={18} />
									Stop Detection
								</button>
							)}
						</div>

						{isPausedByAttention && (
							<div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-semibold">
								Video paused dahil hindi detected ang attention.
							</div>
						)}
					</section>

					<aside className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
						<h2 className="text-xl font-black text-gray-900 mb-4">
							Camera Preview
						</h2>

						<div className="rounded-2xl overflow-hidden bg-black">
							<video
								ref={cameraVideoRef}
								autoPlay
								muted
								playsInline
								className="w-full aspect-video bg-black scale-x-[-1]"
							/>
						</div>

						<div className={`mt-5 rounded-2xl border px-5 py-4 ${statusClass}`}>
							<div className="font-black uppercase text-xs tracking-widest mb-2">
								Status: {status}
							</div>
							<div className="font-semibold">{message}</div>
						</div>

						<div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
							<h3 className="font-black text-gray-900 mb-2">
								Prototype Rules
							</h3>

							<ul className="text-sm text-gray-500 leading-7 list-disc pl-5">
								<li>2 seconds absent/not looking bago mag-pause.</li>
								<li>800ms looking recovery bago mag-resume.</li>
								<li>Camera frames are processed in browser.</li>
								<li>False positives possible kapag madilim or malabo camera.</li>
							</ul>
						</div>
					</aside>
				</div>
			</main>
		</div>
	);
}