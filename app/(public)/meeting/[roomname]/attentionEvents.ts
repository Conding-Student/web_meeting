export const ATTENTION_TOPIC = "attention-monitor";

export type AttentionIssue =
  | "LOOKING"
  | "UNATTENTIVE"
  | "CAMERA_OFF"
  | "ERROR";

export type AttentionEvent = {
  id: string;
  type: "ATTENTION_ALERT" | "ATTENTION_RECOVERED";
  roomName: string;
  participantName: string;
  participantIdentity: string;
  issue: AttentionIssue;
  durationSeconds: number;
  timestamp: string;
};