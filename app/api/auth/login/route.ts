// app/api/auth/login/route.ts

import { isApiError } from "@/services/api/ApiHelper";
import { apiRequest } from "@/services/api/ApiWrapper";
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
    console.log("Login API result:", result);
    console.log("SUCCESS ON ROUTE.TS");

    // ✅ Return success response with API status
    return NextResponse.json(result.data);
  } catch (error) {
    console.log("ERROR ON ROUTE.TS");
    if (isApiError(error)) {
      // ✅ Cookie already deleted in apiRequest
      return NextResponse.json(
        { message: error.message, retCode: error.retCode },
        { status: error.statusCode },
      );
    }
  }
}
