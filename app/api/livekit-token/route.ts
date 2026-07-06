import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const { roomName, participantName } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json(
        { error: "roomName and participantName are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing LIVEKIT_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    if (!apiSecret) {
      return NextResponse.json(
        { error: "Missing LIVEKIT_API_SECRET in .env.local" },
        { status: 500 }
      );
    }

    if (!livekitUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_LIVEKIT_URL in .env.local" },
        { status: 500 }
      );
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
      ttl: "2h",
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      serverUrl: livekitUrl,
    });
  } catch (error: any) {
    console.error("LiveKit token route error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to generate LiveKit token" },
      { status: 500 }
    );
  }
}