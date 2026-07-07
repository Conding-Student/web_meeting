"use client";

import { useCallback, useMemo, useState } from "react";
import { useDataChannel } from "@livekit/components-react";
import {
  ATTENTION_TOPIC,
  type AttentionEvent,
} from "./attentionEvents";
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
        const rawPayload = msg?.payload ?? msg?.data;

        if (!rawPayload) return;

        const text = new TextDecoder().decode(rawPayload);
        const event = JSON.parse(text) as AttentionEvent;

        if (!event?.type || event.roomName !== roomName) {
          return;
        }

        setEvents((prev) => [event, ...prev].slice(0, 25));

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

  const statusList = useMemo(() => {
    return Object.values(statuses).sort((a, b) => {
      if (a.isRecovered === b.isRecovered) {
        return (
          new Date(b.lastUpdated).getTime() -
          new Date(a.lastUpdated).getTime()
        );
      }

      return a.isRecovered ? 1 : -1;
    });
  }, [statuses]);

  return (
    <aside className={styles.proctorPanel}>
      <div className={styles.proctorPanelHeader}>
        <div>
          <p className={styles.proctorEyebrow}>Proctor</p>
          <h2>Attention Alerts</h2>
        </div>

        <div className={styles.proctorCount}>{events.length}</div>
      </div>

      <div className={styles.proctorSection}>
        <h3>Current Status</h3>

        {statusList.length === 0 ? (
          <p className={styles.proctorEmpty}>
            No attention alerts received yet.
          </p>
        ) : (
          <div className={styles.proctorStatusList}>
            {statusList.map((status) => (
              <div
                key={status.participantIdentity}
                className={
                  status.isRecovered
                    ? styles.proctorStatusOk
                    : styles.proctorStatusWarn
                }
              >
                <div>
                  <strong>{status.participantName}</strong>
                  <span>{formatIssue(status.issue)}</span>
                </div>

                <small>
                  {status.isRecovered
                    ? "Recovered"
                    : `${status.durationSeconds}s`}
                </small>
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

function formatIssue(issue: AttentionEvent["issue"]) {
  switch (issue) {
    case "NO_FACE":
      return "No face detected";
    case "MULTIPLE_FACES":
      return "Multiple faces";
    case "LOOKING_AWAY":
      return "Looking away";
    case "SLEEPING":
      return "Sleeping / covered eyes";
    case "CAMERA_OFF":
      return "Camera off";
    case "ERROR":
      return "Detection error";
    case "LOOKING":
      return "Looking";
    default:
      return issue;
  }
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}