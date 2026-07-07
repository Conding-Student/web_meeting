import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

type MeetingRole = "host" | "participant";

function normalizeRole(value: unknown): MeetingRole {
  return value === "host" || value === "proctor" ? "host" : "participant";
}

function createSafeIdentity(role: MeetingRole, participantName: string) {
  const safeName = participantName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);

  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

  return `${role}-${safeName || "guest"}-${randomId}`;
}

async function createLiveKitToken(
  roomName: string,
  participantName: string,
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

  const identity = createSafeIdentity(role, participantName);

  const accessToken = new AccessToken(apiKey, apiSecret, {
    identity,
    name: participantName,
    metadata: JSON.stringify({
      role,
      participantName,
    }),
  });

  accessToken.addGrant({
    room: roomName,
    roomJoin: true,
    canSubscribe: true,

    // Host/proctor only watches and receives alerts.
    // Participants publish camera/mic/data.
    canPublish: role === "participant",
    canPublishData: role === "participant",
  });

  const token = await accessToken.toJwt();

  return {
    token,
    serverUrl,
    identity,
    role,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const roomName = body.roomName;
    const participantName = body.participantName;
    const role = normalizeRole(body.role);

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "Missing roomName or participantName" },
        { status: 400 }
      );
    }

    const result = await createLiveKitToken(roomName, participantName, role);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("LiveKit POST token error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create LiveKit token" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const roomName = searchParams.get("room") || searchParams.get("roomName");
    const participantName =
      searchParams.get("username") || searchParams.get("participantName");
    const role = normalizeRole(searchParams.get("role"));

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "Missing roomName or participantName" },
        { status: 400 }
      );
    }

    const result = await createLiveKitToken(roomName, participantName, role);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("LiveKit GET token error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create LiveKit token" },
      { status: 500 }
    );
  }
}