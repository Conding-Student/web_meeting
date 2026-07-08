"use client";

import { useCallback, useMemo, useState } from "react";
import { useDataChannel } from "@livekit/components-react";
import { ATTENTION_TOPIC, type AttentionEvent } from "./attentionEvents";
import styles from "./MeetingRoom.module.css";

type ParticipantStatus = {
  participantName: string;
  participantIdentity: string;
  issue: AttentionEvent["issue"];
  durationSeconds: number;
  lastUpdated: string;
  isRecovered: boolean;
};

type ProctorAlertPanelProps = {
  roomName: string;
};

export default function ProctorAlertPanel({ roomName }: ProctorAlertPanelProps) {
  const [events, setEvents] = useState<AttentionEvent[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ParticipantStatus>>(
    {}
  );

  const handleMessage = useCallback(
    (msg: any) => {
      try {
        const rawPayload = msg?.payload ?? msg?.data ?? msg;

        if (!rawPayload) return;

        const text = decodePayload(rawPayload);

        if (!text) return;

        const event = JSON.parse(text) as AttentionEvent;

        if (!event?.type || event.roomName !== roomName) {
          return;
        }

        setEvents((prev) => [event, ...prev].slice(0, 30));

        setStatuses((prev) => ({
          ...prev,
          [event.participantIdentity]: {
            participantName: event.participantName,
            participantIdentity: event.participantIdentity,
            issue: event.issue,
            durationSeconds: event.durationSeconds,
            lastUpdated: event.timestamp,
            isRecovered: event.type === "ATTENTION_RECOVERED",
          },
        }));
      } catch (error) {
        console.warn("Invalid attention event:", error);
      }
    },
    [roomName]
  );

  useDataChannel(ATTENTION_TOPIC, handleMessage);

  const idleList = useMemo(() => {
    return Object.values(statuses)
      .filter((status) => !status.isRecovered)
      .sort((a, b) => {
        return (
          new Date(b.lastUpdated).getTime() -
          new Date(a.lastUpdated).getTime()
        );
      });
  }, [statuses]);

  return (
    <aside className={styles.proctorPanel}>
      <div className={styles.proctorPanelHeader}>
        <div>
          <p className={styles.proctorEyebrow}>Host / Proctor</p>
          <h2>Idle Participants</h2>
        </div>

        <div className={styles.proctorCount}>{idleList.length}</div>
      </div>

      <div className={styles.proctorSection}>
        <h3>Current Idle Participants</h3>

        {idleList.length === 0 ? (
          <p className={styles.proctorEmpty}>
            No idle participants right now.
          </p>
        ) : (
          <div className={styles.proctorStatusList}>
            {idleList.map((status) => (
              <div
                key={status.participantIdentity}
                className={styles.proctorStatusWarn}
              >
                <div>
                  <strong>{status.participantName}</strong>
                  <span>{formatIssue(status.issue)}</span>
                </div>

                <small>{status.durationSeconds}s</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.proctorSection}>
        <h3>Latest Events</h3>

        {events.length === 0 ? (
          <p className={styles.proctorEmpty}>Waiting for alerts...</p>
        ) : (
          <div className={styles.proctorEventList}>
            {events.map((event) => (
              <div key={event.id} className={styles.proctorEventItem}>
                <div>
                  <strong>{event.participantName}</strong>
                  <span>
                    {event.type === "ATTENTION_RECOVERED"
                      ? "Recovered"
                      : formatIssue(event.issue)}
                  </span>
                </div>

                <small>{formatTime(event.timestamp)}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

function decodePayload(payload: unknown) {
  if (typeof payload === "string") {
    return payload;
  }

  if (payload instanceof Uint8Array) {
    return new TextDecoder().decode(payload);
  }

  if (payload instanceof ArrayBuffer) {
    return new TextDecoder().decode(new Uint8Array(payload));
  }

  return "";
}

function formatIssue(issue: AttentionEvent["issue"]) {
  switch (issue) {
    case "LOOKING":
      return "Attention recovered";

    case "UNATTENTIVE":
      return "Unattentive";

    case "CAMERA_OFF":
      return "Camera off";

    case "ERROR":
      return "Detection error";

    default: {
      const exhaustiveCheck: never = issue;
      return exhaustiveCheck;
    }
  }
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}