"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AttentionMonitor from "./AttentionMonitor";
import {
  LiveKitRoom,
  PreJoin,
  VideoConference,
} from "@livekit/components-react";
import styles from "./MeetingRoom.module.css";

type UserChoices = {
  username?: string;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
};

export default function MeetingPage() {
  const params = useParams();

  const roomName = useMemo(() => {
    const room = params?.roomname;

    if (Array.isArray(room)) {
      return room[0] ?? "default-room";
    }

    return room ?? "default-room";
  }, [params]);

  const [token, setToken] = useState<string>("");
  const [serverUrl, setServerUrl] = useState<string>("");
  const [userChoices, setUserChoices] = useState<UserChoices | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(values: UserChoices) {
    try {
      setIsJoining(true);
      setError("");

      const username =
        values.username?.trim() ||
        `Guest-${Math.floor(Math.random() * 10000)}`;

      const res = await fetch("/api/livekit-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName,
          participantName: username,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token || !data.serverUrl) {
        throw new Error(data.error || "Unable to get LiveKit token");
      }

      setUserChoices({
        username,
        videoEnabled: values.videoEnabled ?? true,
        audioEnabled: values.audioEnabled ?? true,
      });

      setToken(data.token);
      setServerUrl(data.serverUrl);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";

      console.error("Join meeting error:", err);
      setError(message);
    } finally {
      setIsJoining(false);
    }
  }

  if (!token || !serverUrl) {
    return (
      <main className={styles.page}>
        <section className={styles.joinCard}>
          <div className={styles.brandRow}>
            <div className={styles.logoCircle}>LK</div>

            <div>
              <p className={styles.eyebrow}>Live Meeting</p>
              <h1 className={styles.title}>Join room</h1>
            </div>
          </div>

          <div className={styles.roomBox}>
            <span className={styles.roomLabel}>Room</span>
            <span className={styles.roomName}>{roomName}</span>
          </div>

          <p className={styles.subtitle}>
            Check your camera and microphone before entering the meeting.
          </p>

          {error && <div className={styles.errorBox}>{error}</div>}

          <div
            className={`${styles.prejoinWrapper} ${
              isJoining ? styles.disabled : ""
            }`}
            data-lk-theme="default"
          >
            <PreJoin
              defaults={{
                username: `Guest-${Math.floor(Math.random() * 10000)}`,
                videoEnabled: true,
                audioEnabled: true,
              }}
              userLabel="Your name"
              micLabel="Microphone"
              camLabel="Camera"
              joinLabel={isJoining ? "Joining..." : "Join meeting"}
              onSubmit={handleJoin}
              onValidate={(values) => {
                if (!values.username?.trim()) {
                  setError("Please enter your name first.");
                  return false;
                }

                setError("");
                return true;
              }}
              onError={(err) => setError(err.message)}
              persistUserChoices={false}
            />
          </div>
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
        video={userChoices?.videoEnabled ?? true}
        audio={userChoices?.audioEnabled ?? true}
        data-lk-theme="default"
        className={styles.livekitRoom}
        onDisconnected={() => {
          setToken("");
          setServerUrl("");
          setUserChoices(null);
        }}
        onError={(err) => setError(err.message)}
      >
        <AttentionMonitor />

        <header className={styles.meetingHeader}>
          <div>
            <p className={styles.eyebrow}>Now in meeting</p>
            <h1 className={styles.meetingTitle}>{roomName}</h1>
          </div>

          <div className={styles.userPill}>
            {userChoices?.username ?? "Guest"}
          </div>
        </header>

        <section className={styles.conferenceShell}>
          <VideoConference />
        </section>
      </LiveKitRoom>
    </main>
  );
}