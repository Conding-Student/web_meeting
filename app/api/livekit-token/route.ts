import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

type MeetingRole = "host" | "participant";

type TokenRequestBody = {
  roomName?: string;
  room?: string;
  participantName?: string;
  username?: string;
  role?: string;
};

function normalizeRole(value: unknown): MeetingRole {
  if (value === "host" || value === "proctor") {
    return "host";
  }

  return "participant";
}

function normalizeRoomName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 80);
}

function normalizeParticipantName(value: string) {
  const cleaned = value.trim().replace(/\s+/g, " ").slice(0, 50);

  return cleaned || "Guest";
}

function createSafeIdentity(role: MeetingRole, participantName: string) {
  const safeName = participantName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${role}-${safeName || "guest"}-${randomId}`;
}

async function createLiveKitToken(
  rawRoomName: string,
  rawParticipantName: string,
  role: MeetingRole
) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !serverUrl) {
    throw new Error(
      "Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or NEXT_PUBLIC_LIVEKIT_URL"
    );
  }

  const roomName = normalizeRoomName(rawRoomName);
  const participantName = normalizeParticipantName(rawParticipantName);

  if (!roomName) {
    throw new Error("Invalid roomName");
  }

  const identity = createSafeIdentity(role, participantName);

  const metadata = {
    role,
    participantName,
    isHost: role === "host",
  };

  const accessToken = new AccessToken(apiKey, apiSecret, {
    identity,
    name: participantName,
    metadata: JSON.stringify(metadata),
  });

  accessToken.addGrant({
    room: roomName,
    roomJoin: true,
    canSubscribe: true,

    // Current setup:
    // host/proctor = watcher only
    // participant = publishes camera/mic/data alerts
    // canPublish: role === "participant",
    // canPublishData: role === "participant",
    canPublish: true,
    canPublishData: true,
  });

  const token = await accessToken.toJwt();

  return {
    token,
    serverUrl,
    roomName,
    identity,
    participantName,
    role,
    metadata,
  };
}

function getBodyValue(body: TokenRequestBody) {
  const roomName = body.roomName || body.room;
  const participantName = body.participantName || body.username;
  const role = normalizeRole(body.role);

  return {
    roomName,
    participantName,
    role,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TokenRequestBody;

    const { roomName, participantName, role } = getBodyValue(body);

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "Missing roomName or participantName" },
        { status: 400 }
      );
    }

    const result = await createLiveKitToken(roomName, participantName, role);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("LiveKit POST token error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create LiveKit token";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const roomName = searchParams.get("roomName") || searchParams.get("room");
    const participantName =
      searchParams.get("participantName") || searchParams.get("username");
    const role = normalizeRole(searchParams.get("role"));

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "Missing roomName or participantName" },
        { status: 400 }
      );
    }

    const result = await createLiveKitToken(roomName, participantName, role);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("LiveKit GET token error:", error);

    const message =
      error instanceof Error ? error.message : "Failed to create LiveKit token";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}