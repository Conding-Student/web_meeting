"use client";

import { useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";

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
      <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-6">
        <div className="w-full max-w-md bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <h1 className="text-3xl font-bold mb-2">Join Meeting</h1>

          <p className="text-gray-300 mb-5">
            Room: <span className="font-semibold">{roomName}</span>
          </p>

          <input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-lg text-black mb-3"
          />

          {error && <p className="text-red-400 mb-3">{error}</p>}

          <button
            onClick={joinMeeting}
            disabled={isJoining}
            className="w-full py-3 rounded-lg bg-white text-black font-semibold disabled:opacity-60"
          >
            {isJoining ? "Joining..." : "Join now"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-black">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        video={true}
        audio={true}
        onDisconnected={() => {
          setToken("");
          setServerUrl("");
        }}
      >
        <VideoConference />
      </LiveKitRoom>
    </main>
  );
}