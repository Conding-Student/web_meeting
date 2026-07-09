"use client";

import { useEffect, useRef, useState } from "react";
import {
  useDataChannel,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import { ATTENTION_TOPIC, type AttentionEvent } from "./attentionEvents";
import { analyzeFrame, formatNumber } from "./attention-monitor/attentionAnalysis";
import { getDelayForIssue } from "./attention-monitor/attentionTiming";
import type {
  DebugInfo,
  FaceResult,
  HandResult,
  HolisticLandmarkerLike,
  MonitorIssue,
} from "./attention-monitor/attentionTypes";
import styles from "./MeetingRoom.module.css";

type AlertIssue = AttentionEvent["issue"];

type AttentionMonitorProps = {
  roomName: string;
  participantName: string;
  warningDelayMs?: number;
  alertResendIntervalMs?: number;
};

export default function AttentionMonitor({
  roomName,
  participantName,
  warningDelayMs = 2000,
  alertResendIntervalMs = 5000,
}: AttentionMonitorProps) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const { send } = useDataChannel(ATTENTION_TOPIC);

  const LOOKING_RECOVERY_GRACE_MS = 1500;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const holisticLandmarkerRef = useRef<HolisticLandmarkerLike | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isComponentMountedRef = useRef(true);
  const lastVideoTimeRef = useRef<number>(-1);

  const pendingIssueRef = useRef<MonitorIssue | null>(null);
  const pendingIssueStartRef = useRef<number | null>(null);

  const activeAlertRef = useRef(false);
  const lastSentIssueRef = useRef<AlertIssue | null>(null);
  const lastAlertSentAtRef = useRef<number>(0);
  const lastNonLookingDetectedAtRef = useRef<number>(0);

  const [cameraTrack, setCameraTrack] = useState<MediaStreamTrack | null>(null);
  const [issue, setIssue] = useState<MonitorIssue>("LOADING");
  const [showWarning, setShowWarning] = useState(false);
  const [warningSeconds, setWarningSeconds] = useState(0);

  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    issue: "LOADING",
    faceCount: 0,
    handCount: 0,
    handOverEyes: false,
    pendingIssue: null,
    pendingSeconds: 0,
    note: "Loading monitor",
  });

  useEffect(() => {
    isComponentMountedRef.current = true;

    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadHolisticLandmarker() {
      try {
        const { HolisticLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const holisticLandmarker = await HolisticLandmarker.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task",
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            minFaceDetectionConfidence: 0.5,
            minFacePresenceConfidence: 0.5,
            minHandLandmarksConfidence: 0.5,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            outputFaceBlendshapes: false,
            outputPoseSegmentationMasks: false,
          }
        );

        holisticLandmarkerRef.current =
          holisticLandmarker as HolisticLandmarkerLike;

        if (isMounted) {
          setIssue("LOOKING");
          setShowWarning(false);
          setWarningSeconds(0);
          setDebugInfo({
            issue: "LOOKING",
            faceCount: 0,
            handCount: 0,
            handOverEyes: false,
            pendingIssue: null,
            pendingSeconds: 0,
            note: "Holistic landmarker ready",
          });
        }
      } catch (error) {
        console.warn("Holistic landmarker loading warning:", error);

        if (isMounted) {
          applyAttentionIssue("ERROR");
          setDebugInfo({
            issue: "ERROR",
            faceCount: 0,
            handCount: 0,
            handOverEyes: false,
            pendingIssue: pendingIssueRef.current,
            pendingSeconds: getPendingSeconds(),
            note: "Holistic landmarker failed to load",
          });
        }
      }
    }

    loadHolisticLandmarker();

    return () => {
      isMounted = false;

      if (holisticLandmarkerRef.current?.close) {
        holisticLandmarkerRef.current.close();
      }

      holisticLandmarkerRef.current = null;
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
        pendingIssue: pendingIssueRef.current,
        pendingSeconds: getPendingSeconds(),
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
          pendingIssue: pendingIssueRef.current,
          pendingSeconds: getPendingSeconds(),
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
      const holisticLandmarker = holisticLandmarkerRef.current;

      if (!cameraTrack) {
        applyAttentionIssue("CAMERA_OFF");
        animationFrameRef.current = requestAnimationFrame(detectLoop);
        return;
      }

      if (!video || !holisticLandmarker) {
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

          const holisticResult = holisticLandmarker.detectForVideo(
            video,
            timestamp
          );

          const faceResult: FaceResult = {
            faceLandmarks: holisticResult.faceLandmarks ?? [],
          };

          const handResult: HandResult = {
            landmarks: [
              ...(holisticResult.leftHandLandmarks ?? []),
              ...(holisticResult.rightHandLandmarks ?? []),
            ],
          };

          const analysis = analyzeFrame(faceResult, handResult);

          applyAttentionIssue(analysis.issue);

          setDebugInfo({
            ...analysis,
            pendingIssue: pendingIssueRef.current,
            pendingSeconds: getPendingSeconds(),
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
          pendingIssue: pendingIssueRef.current,
          pendingSeconds: getPendingSeconds(),
          note: "Holistic detectForVideo failed",
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

  function getPendingSeconds() {
    return pendingIssueStartRef.current
      ? Math.floor((Date.now() - pendingIssueStartRef.current) / 1000)
      : 0;
  }

  function isAlertIssue(nextIssue: MonitorIssue): nextIssue is AlertIssue {
    return nextIssue !== "LOADING";
  }

  function applyAttentionIssue(nextIssue: MonitorIssue) {
    const now = Date.now();

    if (nextIssue !== "LOOKING") {
      lastNonLookingDetectedAtRef.current = now;
    }

    if (nextIssue === "LOOKING") {
      const hasPendingOrActiveIssue =
        pendingIssueRef.current !== null || activeAlertRef.current;

      const recentlyHadNonLookingIssue =
        now - lastNonLookingDetectedAtRef.current < LOOKING_RECOVERY_GRACE_MS;

      if (hasPendingOrActiveIssue && recentlyHadNonLookingIssue) {
        return;
      }

      pendingIssueRef.current = null;
      pendingIssueStartRef.current = null;

      if (activeAlertRef.current) {
        activeAlertRef.current = false;
        lastSentIssueRef.current = null;
        lastAlertSentAtRef.current = 0;

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
    const requiredDelayMs = getDelayForIssue(nextIssue, warningDelayMs);
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
      !activeAlertRef.current ||
      lastSentIssueRef.current !== nextIssue ||
      now - lastAlertSentAtRef.current >= alertResendIntervalMs;

    if (shouldSendAlert) {
      activeAlertRef.current = true;
      lastSentIssueRef.current = nextIssue;
      lastAlertSentAtRef.current = now;

      sendAttentionEvent("ATTENTION_ALERT", nextIssue, durationSeconds);
    }
  }

  function sendAttentionEvent(
    type: AttentionEvent["type"],
    eventIssue: AlertIssue,
    durationSeconds: number
  ) {
    if (!isComponentMountedRef.current) {
      return;
    }

    if (room.state !== ConnectionState.Connected) {
      return;
    }

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

    try {
      Promise.resolve(
        send(payload, {
          topic: ATTENTION_TOPIC,
          reliable: true,
        })
      ).catch((error) => {
        handleSendAttentionError(error);
      });
    } catch (error) {
      handleSendAttentionError(error);
    }
  }

  function handleSendAttentionError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    if (
      message.includes("closed engine") ||
      message.includes("cannot negotiate") ||
      message.includes("disconnected") ||
      message.includes("not connected")
    ) {
      return;
    }

    console.warn("Failed to send attention event:", error);
  }

  function getWarningMessage() {
    switch (issue) {
      case "UNATTENTIVE":
        return "Please stay attentive and look at the screen.";
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

          <span>Reason</span>
          <strong>{debugInfo.reason ?? "-"}</strong>

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