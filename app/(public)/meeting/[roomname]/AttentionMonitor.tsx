"use client";

import { useEffect, useRef, useState } from "react";
import {
  useDataChannel,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  ATTENTION_TOPIC,
  type AttentionEvent,
} from "./attentionEvents";
import styles from "./MeetingRoom.module.css";

type MonitorIssue =
  | "LOADING"
  | "LOOKING"
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "LOOKING_AWAY"
  | "SLEEPING"
  | "CAMERA_OFF"
  | "ERROR";

type AlertIssue = AttentionEvent["issue"];

type Landmark = {
  x: number;
  y: number;
  z?: number;
};

type FaceResult = {
  faceLandmarks?: Landmark[][];
};

type HandResult = {
  landmarks?: Landmark[][];
};

type FaceLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number
  ) => FaceResult;
  close?: () => void;
};

type HandLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number
  ) => HandResult;
  close?: () => void;
};

type AnalysisResult = {
  issue: MonitorIssue;
  faceCount: number;
  handCount: number;
  handOverEyes: boolean;
  eyeOpenRatio?: number;
  headOffsetX?: number;
  gazeX?: number;
  gazeY?: number;
  note?: string;
};

type DebugInfo = AnalysisResult & {
  pendingIssue?: MonitorIssue | null;
  pendingSeconds?: number;
};

type AttentionMonitorProps = {
  roomName: string;
  participantName: string;
  warningDelayMs?: number;
};

export default function AttentionMonitor({
  roomName,
  participantName,
  warningDelayMs = 2000,
}: AttentionMonitorProps) {
  const { localParticipant } = useLocalParticipant();
  const { send } = useDataChannel(ATTENTION_TOPIC);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarkerLike | null>(null);
  const handLandmarkerRef = useRef<HandLandmarkerLike | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const lastVideoTimeRef = useRef<number>(-1);

  const pendingIssueRef = useRef<MonitorIssue | null>(null);
  const pendingIssueStartRef = useRef<number | null>(null);

  const activeAlertRef = useRef(false);
  const lastSentIssueRef = useRef<AlertIssue | null>(null);

  const [cameraTrack, setCameraTrack] = useState<MediaStreamTrack | null>(null);
  const [issue, setIssue] = useState<MonitorIssue>("LOADING");
  const [showWarning, setShowWarning] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(0);

  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    issue: "LOADING",
    faceCount: 0,
    handCount: 0,
    handOverEyes: false,
    note: "Loading monitor",
  });

  useEffect(() => {
    let isMounted = true;

    async function loadLandmarkers() {
      try {
        const { FaceLandmarker, HandLandmarker, FilesetResolver } =
          await import("@mediapipe/tasks-vision");

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

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceLandmarkerRef.current = faceLandmarker as FaceLandmarkerLike;
        handLandmarkerRef.current = handLandmarker as HandLandmarkerLike;

        if (isMounted) {
          setIssue("LOOKING");
          setShowWarning(false);
          setWarningSeconds(0);
          setDebugInfo({
            issue: "LOOKING",
            faceCount: 0,
            handCount: 0,
            handOverEyes: false,
            note: "Face and hand landmarkers ready",
          });
        }
      } catch (error) {
        console.warn("Landmarker loading warning:", error);

        if (isMounted) {
          applyAttentionIssue("ERROR");
          setDebugInfo({
            issue: "ERROR",
            faceCount: 0,
            handCount: 0,
            handOverEyes: false,
            note: "Face or hand landmarker failed to load",
          });
        }
      }
    }

    loadLandmarkers();

    return () => {
      isMounted = false;

      if (faceLandmarkerRef.current?.close) {
        faceLandmarkerRef.current.close();
      }

      if (handLandmarkerRef.current?.close) {
        handLandmarkerRef.current.close();
      }

      faceLandmarkerRef.current = null;
      handLandmarkerRef.current = null;
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
        handCount: 0,
        handOverEyes: false,
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
          handCount: 0,
          handOverEyes: false,
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
      const handLandmarker = handLandmarkerRef.current;

      if (!cameraTrack) {
        applyAttentionIssue("CAMERA_OFF");
        animationFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      if (!video || !faceLandmarker || !handLandmarker) {
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

          const timestamp = performance.now();

          const faceResult = faceLandmarker.detectForVideo(video, timestamp);
          const handResult = handLandmarker.detectForVideo(video, timestamp);

          const analysis = analyzeFrame(faceResult, handResult);

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
        console.warn("Detection warning:", error);
        applyAttentionIssue("ERROR");
        setDebugInfo({
          issue: "ERROR",
          faceCount: 0,
          handCount: 0,
          handOverEyes: false,
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

  function getDelayForIssue(nextIssue: MonitorIssue) {
    switch (nextIssue) {
      case "SLEEPING":
        return 900;
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

  function isAlertIssue(nextIssue: MonitorIssue): nextIssue is AlertIssue {
    return nextIssue !== "LOADING";
  }

  function applyAttentionIssue(nextIssue: MonitorIssue) {
    const now = Date.now();

    if (nextIssue === "LOOKING") {
      pendingIssueRef.current = null;
      pendingIssueStartRef.current = null;

      if (activeAlertRef.current) {
        activeAlertRef.current = false;
        lastSentIssueRef.current = null;

        sendAttentionEvent("ATTENTION_RECOVERED", "LOOKING", 0);
      }

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
    const durationSeconds = Math.floor(durationMs / 1000);

    if (durationMs < requiredDelayMs) {
      setIssue("LOOKING");
      setShowWarning(false);
      setWarningSeconds(durationSeconds);

      return;
    }

    setIssue(nextIssue);
    setWarningSeconds(durationSeconds);
    setShowWarning(true);

    if (!isAlertIssue(nextIssue)) {
      return;
    }

    const shouldSendAlert =
      !activeAlertRef.current || lastSentIssueRef.current !== nextIssue;

    if (shouldSendAlert) {
      activeAlertRef.current = true;
      lastSentIssueRef.current = nextIssue;

      sendAttentionEvent("ATTENTION_ALERT", nextIssue, durationSeconds);
    }
  }

  function sendAttentionEvent(
    type: AttentionEvent["type"],
    eventIssue: AlertIssue,
    durationSeconds: number
  ) {
    const event: AttentionEvent = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      type,
      roomName,
      participantName,
      participantIdentity: localParticipant.identity || participantName,
      issue: eventIssue,
      durationSeconds,
      timestamp: new Date().toISOString(),
    };

    const payload = new TextEncoder().encode(JSON.stringify(event));

    Promise.resolve(
      send(payload, {
        topic: ATTENTION_TOPIC,
        reliable: true,
      })
    ).catch((error) => {
      console.warn("Failed to send attention event:", error);
    });
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

          <span>Hands</span>
          <strong>{debugInfo.handCount}</strong>

          <span>Hand eyes</span>
          <strong>{debugInfo.handOverEyes ? "YES" : "NO"}</strong>

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
              Detected for {warningSeconds}s. This alert is also sent to the
              proctor view.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function analyzeFrame(
  faceResult: FaceResult,
  handResult: HandResult
): AnalysisResult {
  const faces = faceResult.faceLandmarks ?? [];
  const hands = handResult.landmarks ?? [];

  if (faces.length === 0) {
    return {
      issue: "NO_FACE",
      faceCount: 0,
      handCount: hands.length,
      handOverEyes: false,
      note: "No face landmarks",
    };
  }

  if (faces.length > 1) {
    return {
      issue: "MULTIPLE_FACES",
      faceCount: faces.length,
      handCount: hands.length,
      handOverEyes: false,
      note: "More than one face",
    };
  }

  const face = faces[0];

  const nose = face[1];
  const forehead = face[10];

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
    !forehead ||
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
      handCount: hands.length,
      handOverEyes: false,
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

    const handOverEyes = isHandCoveringEyesStrict(hands, {
    leftEyeOuter,
    leftEyeInner,
    leftEyeTop,
    leftEyeBottom,
    rightEyeOuter,
    rightEyeInner,
    rightEyeTop,
    rightEyeBottom,
    });

  const faceTooFarFromCenter =
    nose.x < 0.12 || nose.x > 0.88 || nose.y < 0.08 || nose.y > 0.94;

  if (handOverEyes) {
    return {
      issue: "SLEEPING",
      faceCount: 1,
      handCount: hands.length,
      handOverEyes,
      eyeOpenRatio: avgEyeOpenRatio,
      headOffsetX,
      gazeX: avgGazeX,
      gazeY: avgGazeY,
      note: "Hand covering eye area",
    };
  }

  if (eyesClosed) {
    return {
      issue: "SLEEPING",
      faceCount: 1,
      handCount: hands.length,
      handOverEyes,
      eyeOpenRatio: avgEyeOpenRatio,
      headOffsetX,
      gazeX: avgGazeX,
      gazeY: avgGazeY,
      note: "Eyes closed",
    };
  }

  if (!headFacingScreen || !gazeOnScreen || faceTooFarFromCenter) {
    return {
      issue: "LOOKING_AWAY",
      faceCount: 1,
      handCount: hands.length,
      handOverEyes,
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
    handCount: hands.length,
    handOverEyes,
    eyeOpenRatio: avgEyeOpenRatio,
    headOffsetX,
    gazeX: avgGazeX,
    gazeY: avgGazeY,
    note: "Looking",
  };
}

function isHandCoveringEyesStrict(
  hands: Landmark[][],
  eyePoints: {
    leftEyeOuter: Landmark;
    leftEyeInner: Landmark;
    leftEyeTop: Landmark;
    leftEyeBottom: Landmark;
    rightEyeOuter: Landmark;
    rightEyeInner: Landmark;
    rightEyeTop: Landmark;
    rightEyeBottom: Landmark;
  }
) {
  if (hands.length === 0) {
    return false;
  }

  const leftEyeBox = createExpandedBox(
    [
      eyePoints.leftEyeOuter,
      eyePoints.leftEyeInner,
      eyePoints.leftEyeTop,
      eyePoints.leftEyeBottom,
    ],
    0.035,
    0.045
  );

  const rightEyeBox = createExpandedBox(
    [
      eyePoints.rightEyeOuter,
      eyePoints.rightEyeInner,
      eyePoints.rightEyeTop,
      eyePoints.rightEyeBottom,
    ],
    0.035,
    0.045
  );

  // Finger tips and important finger joints only.
  // Para hindi counted ang buong palm/hand kapag nasa cheek or lower face.
  const importantHandPointIndexes = [
    4, 8, 12, 16, 20, // fingertips
    3, 7, 11, 15, 19, // upper finger joints
  ];

  let leftEyeHits = 0;
  let rightEyeHits = 0;

  for (const hand of hands) {
    for (const index of importantHandPointIndexes) {
      const point = hand[index];

      if (!point) continue;

      if (isPointInsideBox(point, leftEyeBox)) {
        leftEyeHits += 1;
      }

      if (isPointInsideBox(point, rightEyeBox)) {
        rightEyeHits += 1;
      }
    }
  }

  // Strict rule:
  // kapag both hands tinatakluban mata
  return leftEyeHits >= 1 && rightEyeHits >= 1;
}

function createExpandedBox(points: Landmark[], expandX: number, expandY: number) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    minX: Math.min(...xs) - expandX,
    maxX: Math.max(...xs) + expandX,
    minY: Math.min(...ys) - expandY,
    maxY: Math.max(...ys) + expandY,
  };
}

function isPointInsideBox(
  point: Landmark,
  box: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  }
) {
  return (
    point.x >= box.minX &&
    point.x <= box.maxX &&
    point.y >= box.minY &&
    point.y <= box.maxY
  );
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