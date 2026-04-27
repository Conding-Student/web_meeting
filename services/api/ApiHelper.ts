export interface ApiError extends Error {
  name: "ApiError";
  type: "session" | "request";
  statusCode?: number;
  retCode?: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  response_time: string;
  device: string;
  retCode: string;
  message: string;
  data: T | null;
}

export function createApiError(
  message: string,
  type: ApiError["type"],
  statusCode = 500,
  retCode?: string,
): ApiError {
  const error = new Error(message) as ApiError;
  error.name = "ApiError";
  error.type = type;
  error.statusCode = statusCode;
  error.retCode = retCode;
  return error;
}

export function createAuthError(message: string): ApiError {
  return createApiError(message, "session", 401);
}

export function createRequestError(
  message: string,
  statusCode: number,
  retCode?: string,
): ApiError {
  return createApiError(message, "request", statusCode, retCode);
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && error.name === "ApiError";
}

export interface ApiRequestResult<TRes> {
  data: ApiResponse<TRes>;
  status: number;
}
