"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  LiveKitRoom,
  PreJoin,
  VideoConference,
} from "@livekit/components-react";
import AttentionMonitor from "./AttentionMonitor";
import ProctorAlertPanel from "./ProctorAlertPanel";
import styles from "./MeetingRoom.module.css";

type MeetingRole = "host" | "participant";

type UserChoices = {
  username?: string;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
};

export default function MeetingPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const roleParam = searchParams.get("role")?.trim().toLowerCase();
  const meetingRole: MeetingRole =
    roleParam === "host" || roleParam === "proctor"
      ? "host"
      : "participant";

  const isHost = meetingRole === "host";

  const roomName = useMemo(() => {
    const room = params?.roomname;

    if (Array.isArray(room)) {
      return room[0] ?? "default-room";
    }

    return room ?? "default-room";
  }, [params]);

  const defaultUsername = useMemo(() => {
    if (isHost) {
      return "Host-Proctor";
    }

    return `Guest-${Math.floor(Math.random() * 10000)}`;
  }, [isHost]);

  const [token, setToken] = useState<string>("");
  const [serverUrl, setServerUrl] = useState<string>("");
  const [userChoices, setUserChoices] = useState<UserChoices | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin(values: UserChoices) {
    try {
      setIsJoining(true);
      setError("");

      const username = values.username?.trim() || defaultUsername;

      const res = await fetch("/api/livekit-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName,
          participantName: username,
          role: meetingRole,
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
              <p className={styles.eyebrow}>
                {isHost ? "Proctor Meeting" : "Live Meeting"}
              </p>
              <h1 className={styles.title}>
                {isHost ? "Join as proctor" : "Join room"}
              </h1>
            </div>
          </div>

          <div className={styles.roomBox}>
            <span className={styles.roomLabel}>Room</span>
            <span className={styles.roomName}>{roomName}</span>
          </div>

          <p className={styles.subtitle}>
            {isHost
              ? "Join as host/proctor to receive attention alerts from participants."
              : "Check your camera and microphone before entering the meeting."}
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
                username: defaultUsername,
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
        {!isHost && (
          <AttentionMonitor
            roomName={roomName}
            participantName={userChoices?.username ?? "Guest"}
          />
        )}

        {isHost && <ProctorAlertPanel roomName={roomName} />}

        <header className={styles.meetingHeader}>
          <div>
            <p className={styles.eyebrow}>
              {isHost ? "Proctor View" : "Now in meeting"}
            </p>
            <h1 className={styles.meetingTitle}>{roomName}</h1>
          </div>

          <div className={styles.userPill}>
            {isHost ? "Host / Proctor" : userChoices?.username ?? "Guest"}
          </div>
        </header>

        <section className={styles.conferenceShell}>
          <VideoConference />
        </section>
      </LiveKitRoom>
    </main>
  );
}