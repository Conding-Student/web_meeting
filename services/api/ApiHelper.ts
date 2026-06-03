// ApiHelper.ts
import { NextResponse } from "next/server";

// Shape of a structured API error thrown throughout the app
export interface ApiError extends Error {
  name: "ApiError";
  statusCode?: number;
  retCode?: string;
  message: string;
}

// Standard response envelope returned by the backend
export interface ApiResponse<T = unknown> {
  response_time: string;
  device: string;
  retCode: string;
  message: string;
  data: T | null;
}

// Wraps ApiResponse with the HTTP status code for server-side use
export interface ApiRequestResult<TRes> {
  data: ApiResponse<TRes>;
  status: number;
}

// Base factory — attaches ApiError fields to a plain Error object
function createApiError(
  message: string,
  statusCode = 500,
  retCode?: string,
): ApiError {
  return Object.assign(new Error(message), {
    name: "ApiError" as const,
    statusCode,
    retCode,
  });
}

// Shorthand for session/auth errors (401 + retCode 104)
export const createAuthError = (message: string): ApiError =>
  createApiError(message, 401, "104");

// Shorthand for general HTTP request errors
export const createRequestError = (
  message: string,
  statusCode: number,
  retCode?: string,
): ApiError => createApiError(message, statusCode, retCode);

// Type guard — narrows unknown error to ApiError for safe property access
export const isApiError = (error: unknown): error is ApiError =>
  error instanceof Error && error.name === "ApiError";

// Global route handler error — used in every Next.js route catch block
// Handles ApiError specifically, falls back to 500 for anything unexpected
export function handleRouteError(error: unknown): NextResponse {
  if (isApiError(error)) {
    return NextResponse.json(
      { message: error.message, retCode: error.retCode },
      { status: error.statusCode },
    );
  }

  return NextResponse.json(
    {
      message: "Unable to reach the server. Please try again.",
      retCode: "503",
    },
    { status: 503 },
  );
}

// Safely extracts message from unknown catch values
// Avoids repeating `err instanceof Error ? err.message : "Unexpected error"` everywhere
export const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : "Unexpected error";
