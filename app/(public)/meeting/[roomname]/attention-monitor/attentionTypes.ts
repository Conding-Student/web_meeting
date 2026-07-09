export type MonitorIssue =
  | "LOADING"
  | "LOOKING"
  | "UNATTENTIVE"
  | "CAMERA_OFF"
  | "ERROR";

export type UnattentiveReason =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "MISSING_LANDMARKS"
  | "EYES_CLOSED"
  | "HAND_OVER_EYES"
  | "HEAD_AWAY"
  | "GAZE_AWAY"
  | "FACE_OFF_CENTER";

export type Landmark = {
  x: number;
  y: number;
  z?: number;
};

export type FaceResult = {
  faceLandmarks?: Landmark[][];
};

export type HandResult = {
  landmarks?: Landmark[][];
};

export type HolisticResult = {
  faceLandmarks?: Landmark[][];
  leftHandLandmarks?: Landmark[][];
  rightHandLandmarks?: Landmark[][];
  poseLandmarks?: Landmark[][];
};

export type HolisticLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number
  ) => HolisticResult;
  close?: () => void;
};

export type AnalysisResult = {
  issue: MonitorIssue;
  reason?: UnattentiveReason;

  faceCount: number;
  handCount: number;
  handOverEyes: boolean;

  eyeOpenRatio?: number;
  headOffsetX?: number;
  gazeX?: number;
  gazeY?: number;

  note?: string;
};

export type DebugInfo = AnalysisResult & {
  pendingIssue?: MonitorIssue | null;
  pendingSeconds?: number;
};