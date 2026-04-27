// app/api/auth/login/route.ts

import { apiRequest } from "@/services/api/ApiWrapper";
import { handleApiError } from "@/services/api/RouteErrorHandler";
import { NextRequest, NextResponse } from "next/server";

interface LoginRequest {
  staff_id: string;
}

interface LoginResponseData {
  token: string;
  otp?: string;
}

/**
 * POST /api/auth/login
 *
 * Authenticates user with backend API and sets token cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    // ✅ Call backend API
    const result = await apiRequest<LoginRequest, LoginResponseData>("LOGIN", {
      body: { staff_id: body.staff_id.trim() },
    });

    // If backend returns no data
    if (!result.data.data) {
      return NextResponse.json(
        {
          message: result.data.message || "Login failed",
          retCode: result.data.retCode,
        },
        { status: 401 },
      );
    }

    // ✅ Return success response with API status
    return NextResponse.json(
      {
        message: result.data.message || "Login successful",
        retCode: result.data.retCode,
        data: {
          token: result.data.data.token,
          otp: result.data.data.otp,
        },
      },
      { status: result.status },
    );
  } catch (error) {
    return await handleApiError(error);
  }
}
