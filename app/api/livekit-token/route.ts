import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

async function createLiveKitToken(roomName: string, participantName: string) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !serverUrl) {
    throw new Error(
      "Missing LIVEKIT_API_KEY, LIVEKIT_API_SECRET, or NEXT_PUBLIC_LIVEKIT_URL"
    );
  }

  const accessToken = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    name: participantName,
  });

  accessToken.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  const token = await accessToken.toJwt();

  return {
    token,
    serverUrl,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const roomName = body.roomName;
    const participantName = body.participantName;

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "Missing roomName or participantName" },
        { status: 400 }
      );
    }

    const result = await createLiveKitToken(roomName, participantName);

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

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "Missing roomName or participantName" },
        { status: 400 }
      );
    }

    const result = await createLiveKitToken(roomName, participantName);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("LiveKit GET token error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create LiveKit token" },
      { status: 500 }
    );
  }
}