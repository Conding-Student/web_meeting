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

type AttentionMonitorProps = {
  warningDelayMs?: number;
};

export default function AttentionMonitor({
  warningDelayMs = 2500,
}: AttentionMonitorProps) {
  const { localParticipant } = useLocalParticipant();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarkerLike | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const lastVideoTimeRef = useRef<number>(-1);
  const issueStartTimeRef = useRef<number | null>(null);
  const lastIssueRef = useRef<AttentionIssue>("LOADING");

  const [cameraTrack, setCameraTrack] = useState<MediaStreamTrack | null>(null);
  const [issue, setIssue] = useState<AttentionIssue>("LOADING");
  const [showWarning, setShowWarning] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(0);

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
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
        });

        faceLandmarkerRef.current = faceLandmarker as FaceLandmarkerLike;

        if (isMounted) {
          updateIssue("LOOKING");
        }
      } catch (error) {
        console.warn("FaceLandmarker loading warning:", error);

        if (isMounted) {
          updateIssue("ERROR");
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
      updateIssue("CAMERA_OFF");
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
        updateIssue("CAMERA_OFF");
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
        updateIssue("CAMERA_OFF");
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

          const nextIssue = analyzeFaceResult(result);
          updateIssue(nextIssue);
        }
      } catch (error) {
        console.warn("Face detection warning:", error);
        updateIssue("ERROR");
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

  function updateIssue(nextIssue: AttentionIssue) {
    const now = Date.now();

    if (nextIssue === "LOOKING") {
      issueStartTimeRef.current = null;
      lastIssueRef.current = "LOOKING";

      setIssue("LOOKING");
      setShowWarning(false);
      setWarningSeconds(0);

      return;
    }

    if (lastIssueRef.current !== nextIssue) {
      issueStartTimeRef.current = now;
      lastIssueRef.current = nextIssue;

      setIssue(nextIssue);
      setShowWarning(false);
      setWarningSeconds(0);

      return;
    }

    const startedAt = issueStartTimeRef.current ?? now;
    const durationMs = now - startedAt;

    setIssue(nextIssue);
    setWarningSeconds(Math.floor(durationMs / 1000));

    if (durationMs >= warningDelayMs) {
      setShowWarning(true);
    }
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
        return "Possible sleeping or eyes closed detected.";
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
            issue === "LOOKING"
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

function analyzeFaceResult(result: FaceResult): AttentionIssue {
  const faces = result.faceLandmarks ?? [];

  if (faces.length === 0) {
    return "NO_FACE";
  }

  if (faces.length > 1) {
    return "MULTIPLE_FACES";
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
    return "LOOKING";
  }

  const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const faceWidth = Math.abs(rightEyeOuter.x - leftEyeOuter.x);

  const normalizedHeadOffsetX =
    faceWidth > 0.00001 ? Math.abs(nose.x - eyeCenterX) / faceWidth : 0;

  const headFacingScreen = normalizedHeadOffsetX < 0.22;

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

  const faceTooFarFromCenter =
    nose.x < 0.12 || nose.x > 0.88 || nose.y < 0.08 || nose.y > 0.94;

  if (eyesClosed) {
    return "SLEEPING";
  }

  if (!headFacingScreen || !gazeOnScreen || faceTooFarFromCenter) {
    return "LOOKING_AWAY";
  }

  return "LOOKING";
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