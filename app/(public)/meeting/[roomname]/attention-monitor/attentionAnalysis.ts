import type {
  AnalysisResult,
  FaceResult,
  HandResult,
  Landmark,
  UnattentiveReason,
} from "./attentionTypes";

const EYE_OPEN_MIN_RATIO = 0.11;

// Head turn threshold.
// Higher = mas maluwag.
// Lower = mas strict.
const HEAD_OFFSET_MAX = 0.23;

// Gaze threshold.
// Ito ay "screen area", hindi exact center.
// Kapag gusto mong higpitan, gawin mong:
// X: 0.32 to 0.68
// Y: 0.28 to 0.82
const GAZE_X_MIN = 0.25;
const GAZE_X_MAX = 0.75;
const GAZE_Y_MIN = 0.2;
const GAZE_Y_MAX = 0.88;

// Face position sa camera frame.
const FACE_X_MIN = 0.12;
const FACE_X_MAX = 0.88;
const FACE_Y_MIN = 0.08;
const FACE_Y_MAX = 0.94;

export function analyzeFrame(
  faceResult: FaceResult,
  handResult: HandResult
): AnalysisResult {
  const faces = faceResult.faceLandmarks ?? [];
  const hands = handResult.landmarks ?? [];

  if (faces.length === 0) {
    return createUnattentiveResult({
      reason: "NO_FACE",
      faceCount: 0,
      handCount: hands.length,
      handOverEyes: false,
      note: "No face detected",
    });
  }

  if (faces.length > 1) {
    return createUnattentiveResult({
      reason: "MULTIPLE_FACES",
      faceCount: faces.length,
      handCount: hands.length,
      handOverEyes: false,
      note: "Multiple faces detected",
    });
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
    return createUnattentiveResult({
      reason: "MISSING_LANDMARKS",
      faceCount: 1,
      handCount: hands.length,
      handOverEyes: false,
      note: "Missing required eye or iris landmarks",
    });
  }

  const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
  const faceWidth = Math.abs(rightEyeOuter.x - leftEyeOuter.x);

  const headOffsetX =
    faceWidth > 0.00001 ? Math.abs(nose.x - eyeCenterX) / faceWidth : 0;

  const headFacingScreen = headOffsetX < HEAD_OFFSET_MAX;

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
    avgGazeX > GAZE_X_MIN &&
    avgGazeX < GAZE_X_MAX &&
    avgGazeY > GAZE_Y_MIN &&
    avgGazeY < GAZE_Y_MAX;

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

  const eyesClosed = avgEyeOpenRatio < EYE_OPEN_MIN_RATIO;

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
    nose.x < FACE_X_MIN ||
    nose.x > FACE_X_MAX ||
    nose.y < FACE_Y_MIN ||
    nose.y > FACE_Y_MAX;

  if (handOverEyes) {
    return createUnattentiveResult({
      reason: "HAND_OVER_EYES",
      faceCount: 1,
      handCount: hands.length,
      handOverEyes,
      eyeOpenRatio: avgEyeOpenRatio,
      headOffsetX,
      gazeX: avgGazeX,
      gazeY: avgGazeY,
      note: "Hand covering eye area",
    });
  }

  if (eyesClosed) {
    return createUnattentiveResult({
      reason: "EYES_CLOSED",
      faceCount: 1,
      handCount: hands.length,
      handOverEyes,
      eyeOpenRatio: avgEyeOpenRatio,
      headOffsetX,
      gazeX: avgGazeX,
      gazeY: avgGazeY,
      note: "Eyes closed",
    });
  }

  if (faceTooFarFromCenter) {
    return createUnattentiveResult({
      reason: "FACE_OFF_CENTER",
      faceCount: 1,
      handCount: hands.length,
      handOverEyes,
      eyeOpenRatio: avgEyeOpenRatio,
      headOffsetX,
      gazeX: avgGazeX,
      gazeY: avgGazeY,
      note: "Face too far from camera center",
    });
  }

  if (!headFacingScreen) {
    return createUnattentiveResult({
      reason: "HEAD_AWAY",
      faceCount: 1,
      handCount: hands.length,
      handOverEyes,
      eyeOpenRatio: avgEyeOpenRatio,
      headOffsetX,
      gazeX: avgGazeX,
      gazeY: avgGazeY,
      note: "Head is not facing the screen",
    });
  }

  if (!gazeOnScreen) {
    return createUnattentiveResult({
      reason: "GAZE_AWAY",
      faceCount: 1,
      handCount: hands.length,
      handOverEyes,
      eyeOpenRatio: avgEyeOpenRatio,
      headOffsetX,
      gazeX: avgGazeX,
      gazeY: avgGazeY,
      note: "Eyes are looking away from screen area",
    });
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

function createUnattentiveResult(params: {
  reason: UnattentiveReason;
  faceCount: number;
  handCount: number;
  handOverEyes: boolean;
  eyeOpenRatio?: number;
  headOffsetX?: number;
  gazeX?: number;
  gazeY?: number;
  note?: string;
}): AnalysisResult {
  return {
    issue: "UNATTENTIVE",
    reason: params.reason,
    faceCount: params.faceCount,
    handCount: params.handCount,
    handOverEyes: params.handOverEyes,
    eyeOpenRatio: params.eyeOpenRatio,
    headOffsetX: params.headOffsetX,
    gazeX: params.gazeX,
    gazeY: params.gazeY,
    note: params.note,
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

  const importantHandPointIndexes = [
    4, 8, 12, 16, 20,
    3, 7, 11, 15, 19,
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

export function formatNumber(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return value.toFixed(3);
}