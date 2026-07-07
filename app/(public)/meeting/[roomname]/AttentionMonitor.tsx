"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import styles from "./MeetingRoom.module.css";

type AttentionIssue =
  | "LOADING"
  | "LOOKING"
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "LOOKING_AWAY"
  | "SLEEPING"
  | "CAMERA_OFF"
  | "ERROR";

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
  close?: () => void;
};

type AnalysisResult = {
  issue: AttentionIssue;
  faceCount: number;
  eyeOpenRatio?: number;
  headOffsetX?: number;
  gazeX?: number;
  gazeY?: number;
  note?: string;
};

type DebugInfo = AnalysisResult & {
  pendingIssue?: AttentionIssue | null;
  pendingSeconds?: number;
};

type AttentionMonitorProps = {
  warningDelayMs?: number;
};

export default function AttentionMonitor({
  warningDelayMs = 3000,
}: AttentionMonitorProps) {
  const { localParticipant } = useLocalParticipant();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarkerLike | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const lastVideoTimeRef = useRef<number>(-1);

  const pendingIssueRef = useRef<AttentionIssue | null>(null);
  const pendingIssueStartRef = useRef<number | null>(null);

  const [cameraTrack, setCameraTrack] = useState<MediaStreamTrack | null>(null);
  const [issue, setIssue] = useState<AttentionIssue>("LOADING");
  const [showWarning, setShowWarning] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(0);

  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    issue: "LOADING",
    faceCount: 0,
    note: "Loading monitor",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadFaceLandmarker() {
      try {
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
          numFaces: 2,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        faceLandmarkerRef.current = faceLandmarker as FaceLandmarkerLike;

        if (isMounted) {
          setIssue("LOOKING");
          setShowWarning(false);
          setWarningSeconds(0);
          setDebugInfo({
            issue: "LOOKING",
            faceCount: 0,
            note: "FaceLandmarker ready",
          });
        }
      } catch (error) {
        console.warn("FaceLandmarker loading warning:", error);

        if (isMounted) {
          applyAttentionIssue("ERROR");
          setDebugInfo({
            issue: "ERROR",
            faceCount: 0,
            note: "FaceLandmarker failed to load",
          });
        }
      }
    }

    loadFaceLandmarker();

    return () => {
      isMounted = false;

      if (faceLandmarkerRef.current?.close) {
        faceLandmarkerRef.current.close();
      }

      faceLandmarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const publication = localParticipant.getTrackPublication(
        Track.Source.Camera
      );

      const mediaStreamTrack = publication?.track?.mediaStreamTrack;

      if (mediaStreamTrack && mediaStreamTrack.readyState === "live") {
        setCameraTrack(mediaStreamTrack);
      } else {
        setCameraTrack(null);
      }
    }, 500);

    return () => {
      window.clearInterval(interval);
    };
  }, [localParticipant]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (!cameraTrack) {
      video.srcObject = null;
      applyAttentionIssue("CAMERA_OFF");
      setDebugInfo({
        issue: "CAMERA_OFF",
        faceCount: 0,
        note: "No active camera track",
      });
      return;
    }

    const stream = new MediaStream([cameraTrack]);

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;

    video
      .play()
      .then(() => {
        lastVideoTimeRef.current = -1;
      })
      .catch((error) => {
        console.warn("Attention monitor video play warning:", error);
        applyAttentionIssue("CAMERA_OFF");
        setDebugInfo({
          issue: "CAMERA_OFF",
          faceCount: 0,
          note: "Hidden monitor video cannot play",
        });
      });

    return () => {
      video.srcObject = null;
    };
  }, [cameraTrack]);

  useEffect(() => {
    function detectLoop() {
      const video = videoRef.current;
      const faceLandmarker = faceLandmarkerRef.current;

      if (!cameraTrack) {
        applyAttentionIssue("CAMERA_OFF");
        animationFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      if (!video || !faceLandmarker) {
        animationFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      if (video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      try {
        if (video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;

          const result = faceLandmarker.detectForVideo(
            video,
            performance.now()
          );

          const analysis = analyzeFaceResult(result);

          applyAttentionIssue(analysis.issue);

          const pendingSeconds = pendingIssueStartRef.current
            ? Math.floor((Date.now() - pendingIssueStartRef.current) / 1000)
            : 0;

          setDebugInfo({
            ...analysis,
            pendingIssue: pendingIssueRef.current,
            pendingSeconds,
          });
        }
      } catch (error) {
        console.warn("Face detection warning:", error);
        applyAttentionIssue("ERROR");
        setDebugInfo({
          issue: "ERROR",
          faceCount: 0,
          note: "detectForVideo failed",
        });
      }

      animationFrameRef.current = requestAnimationFrame(detectLoop);
    }

    animationFrameRef.current = requestAnimationFrame(detectLoop);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = null;
    };
  }, [cameraTrack, warningDelayMs]);

  function getDelayForIssue(nextIssue: AttentionIssue) {
    switch (nextIssue) {
      case "SLEEPING":
        return 1200;
      case "MULTIPLE_FACES":
        return 1500;
      case "CAMERA_OFF":
        return 1000;
      case "ERROR":
        return 1000;
      case "NO_FACE":
        return 3000;
      case "LOOKING_AWAY":
        return 3000;
      default:
        return warningDelayMs;
    }
  }

  function applyAttentionIssue(nextIssue: AttentionIssue) {
    const now = Date.now();

    if (nextIssue === "LOOKING") {
      pendingIssueRef.current = null;
      pendingIssueStartRef.current = null;

      setIssue("LOOKING");
      setShowWarning(false);
      setWarningSeconds(0);

      return;
    }

    if (pendingIssueRef.current !== nextIssue) {
      pendingIssueRef.current = nextIssue;
      pendingIssueStartRef.current = now;

      setIssue("LOOKING");
      setShowWarning(false);
      setWarningSeconds(0);

      return;
    }

    const startedAt = pendingIssueStartRef.current ?? now;
    const durationMs = now - startedAt;
    const requiredDelayMs = getDelayForIssue(nextIssue);

    if (durationMs < requiredDelayMs) {
      setIssue("LOOKING");
      setShowWarning(false);
      setWarningSeconds(Math.floor(durationMs / 1000));

      return;
    }

    setIssue(nextIssue);
    setWarningSeconds(Math.floor(durationMs / 1000));
    setShowWarning(true);
  }

  function getWarningMessage() {
    switch (issue) {
      case "NO_FACE":
        return "No face detected. Please stay visible on camera.";
      case "MULTIPLE_FACES":
        return "Multiple faces detected. Please make sure only you are visible.";
      case "LOOKING_AWAY":
        return "Please look at the screen.";
      case "SLEEPING":
        return "Possible sleeping or covered eyes detected.";
      case "CAMERA_OFF":
        return "Camera is off. Please turn on your camera.";
      case "ERROR":
        return "Attention detection failed. Please reload the page.";
      default:
        return "";
    }
  }

  return (
    <>
      <video ref={videoRef} className={styles.attentionHiddenVideo} />

      <div className={styles.attentionPill}>
        <span
          className={
            issue === "LOOKING" || issue === "LOADING"
              ? styles.attentionDotOk
              : styles.attentionDotWarning
          }
        />

        <span>
          {issue === "LOOKING"
            ? "Attention OK"
            : issue === "LOADING"
            ? "Loading monitor"
            : "Attention warning"}
        </span>
      </div>

      <div className={styles.attentionDebugPanel}>
        <div className={styles.attentionDebugTitle}>Detection Debug</div>

        <div className={styles.attentionDebugGrid}>
          <span>Raw</span>
          <strong>{debugInfo.issue}</strong>

          <span>Pending</span>
          <strong>
            {debugInfo.pendingIssue ?? "-"} / {debugInfo.pendingSeconds ?? 0}s
          </strong>

          <span>Faces</span>
          <strong>{debugInfo.faceCount}</strong>

          <span>Eye open</span>
          <strong>{formatNumber(debugInfo.eyeOpenRatio)}</strong>

          <span>Head offset</span>
          <strong>{formatNumber(debugInfo.headOffsetX)}</strong>

          <span>Gaze X/Y</span>
          <strong>
            {formatNumber(debugInfo.gazeX)} / {formatNumber(debugInfo.gazeY)}
          </strong>

          <span>Note</span>
          <strong>{debugInfo.note ?? "-"}</strong>
        </div>
      </div>

      {showWarning && (
        <div className={styles.attentionWarning}>
          <div className={styles.attentionWarningIcon}>!</div>

          <div>
            <h2>{getWarningMessage()}</h2>
            <p>
              Detected for {warningSeconds}s. This is only a local warning for
              now.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function analyzeFaceResult(result: FaceResult): AnalysisResult {
  const faces = result.faceLandmarks ?? [];

  if (faces.length === 0) {
    return {
      issue: "NO_FACE",
      faceCount: 0,
      note: "No face landmarks",
    };
  }

  if (faces.length > 1) {
    return {
      issue: "MULTIPLE_FACES",
      faceCount: faces.length,
      note: "More than one face",
    };
  }

  const face = faces[0];

  const nose = face[1];

  const leftEyeOuter = face[33];
  const leftEyeInner = face[133];

  const rightEyeOuter = face[263];
  const rightEyeInner = face[362];

  const leftEyeTop = face[159];
  const leftEyeBottom = face[145];

  const rightEyeTop = face[386];
  const rightEyeBottom = face[374];

  const leftIris = face[468];
  const rightIris = face[473];

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
    return {
      issue: "LOOKING_AWAY",
      faceCount: 1,
      note: "Missing eye or iris landmarks",
    };
  }

  const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const faceWidth = Math.abs(rightEyeOuter.x - leftEyeOuter.x);

  const headOffsetX =
    faceWidth > 0.00001 ? Math.abs(nose.x - eyeCenterX) / faceWidth : 0;

  const headFacingScreen = headOffsetX < 0.22;

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

  const eyesClosed = avgEyeOpenRatio < 0.11;

  const faceTooFarFromCenter =
    nose.x < 0.12 || nose.x > 0.88 || nose.y < 0.08 || nose.y > 0.94;

  if (eyesClosed) {
    return {
      issue: "SLEEPING",
      faceCount: 1,
      eyeOpenRatio: avgEyeOpenRatio,
      headOffsetX,
      gazeX: avgGazeX,
      gazeY: avgGazeY,
      note: "Eyes closed / covered",
    };
  }

  if (!headFacingScreen || !gazeOnScreen || faceTooFarFromCenter) {
    return {
      issue: "LOOKING_AWAY",
      faceCount: 1,
      eyeOpenRatio: avgEyeOpenRatio,
      headOffsetX,
      gazeX: avgGazeX,
      gazeY: avgGazeY,
      note: "Head or gaze away",
    };
  }

  return {
    issue: "LOOKING",
    faceCount: 1,
    eyeOpenRatio: avgEyeOpenRatio,
    headOffsetX,
    gazeX: avgGazeX,
    gazeY: avgGazeY,
    note: "Looking",
  };
}

function normalizedPosition(value: number, pointA: number, pointB: number) {
  const min = Math.min(pointA, pointB);
  const max = Math.max(pointA, pointB);
  const size = max - min;

  if (size <= 0.00001) {
    return 0.5;
  }

  return (value - min) / size;
}

function distanceX(a: Landmark, b: Landmark) {
  return Math.abs(a.x - b.x);
}

function distanceY(a: Landmark, b: Landmark) {
  return Math.abs(a.y - b.y);
}

function formatNumber(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return value.toFixed(3);
}