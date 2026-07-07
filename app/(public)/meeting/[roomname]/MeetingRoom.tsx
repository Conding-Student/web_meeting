"use client";

import { useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import styles from "./MeetingRoom.module.css";

type MeetingRoomProps = {
  roomName: string;
};

export default function MeetingRoom({ roomName }: MeetingRoomProps) {
  const [participantName, setParticipantName] = useState("");
  const [token, setToken] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  async function joinMeeting() {
    try {
      setError("");

      if (!participantName.trim()) {
        setError("Please enter your name.");
        return;
      }

      setIsJoining(true);

      const response = await fetch("/api/livekit-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName,
          participantName: participantName.trim(),
        }),
      });

      const text = await response.text();

      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid API response: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to join meeting");
      }

      setToken(data.token);
      setServerUrl(data.serverUrl);
    } catch (err: any) {
      console.error("Join meeting error:", err);
      setError(err.message || "Hindi maka-join sa meeting.");
    } finally {
      setIsJoining(false);
    }
  }

  if (!token || !serverUrl) {
    return (
      <main className={styles.joinPage}>
        <section className={styles.joinCard}>
          <div className={styles.logo}>LK</div>

          <p className={styles.label}>Live Meeting</p>

          <h1 className={styles.title}>Join Meeting</h1>

          <p className={styles.subtitle}>
            Enter your name before joining the room.
          </p>

          <div className={styles.roomBadge}>
            <span>Room</span>
            <strong>{roomName}</strong>
          </div>

          <input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                joinMeeting();
              }
            }}
            placeholder="Enter your name"
            className={styles.input}
          />

          {error && <div className={styles.errorBox}>{error}</div>}

          <button
            onClick={joinMeeting}
            disabled={isJoining}
            className={styles.joinButton}
          >
            {isJoining ? "Joining..." : "Join now"}
          </button>

          <p className={styles.footerNote}>
            Make sure your camera and microphone permission are allowed.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.meetingPage}>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={true}
        audio={true}
        data-lk-theme="default"
        className={styles.livekitRoom}
        onDisconnected={() => {
          setToken("");
          setServerUrl("");
        }}
      >
        <header className={styles.meetingHeader}>
          <div>
            <p className={styles.label}>Now in meeting</p>
            <h1 className={styles.meetingTitle}>{roomName}</h1>
          </div>

          <div className={styles.participantPill}>
            {participantName || "Guest"}
          </div>
        </header>

        <section className={styles.conferenceArea}>
          <VideoConference />
        </section>
      </LiveKitRoom>
    </main>
  );
}