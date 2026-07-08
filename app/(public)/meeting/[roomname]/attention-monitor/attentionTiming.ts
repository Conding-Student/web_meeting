import type { MonitorIssue } from "./attentionTypes";

export function getDelayForIssue(
  nextIssue: MonitorIssue,
  fallbackDelayMs: number
) {
  switch (nextIssue) {
    case "UNATTENTIVE":
      return 2000;
    case "CAMERA_OFF":
      return 1000;
    case "ERROR":
      return 1000;
    default:
      return fallbackDelayMs;
  }
}