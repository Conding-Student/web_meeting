export const ATTENTION_TOPIC = "attention-alerts";

export type AttentionEventType = "ATTENTION_ALERT" | "ATTENTION_RECOVERED";

export type AttentionIssue =
  | "NO_FACE"
  | "MULTIPLE_FACES"
  | "LOOKING_AWAY"
  | "SLEEPING"
  | "CAMERA_OFF"
  | "ERROR"
  | "LOOKING";

export type AttentionEvent = {
  id: string;
  type: AttentionEventType;
  roomName: string;
  participantName: string;
  participantIdentity: string;
  issue: AttentionIssue;
  durationSeconds: number;
  timestamp: string;
};