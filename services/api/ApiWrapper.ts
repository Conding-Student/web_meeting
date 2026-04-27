import { cookies } from "next/headers";
import crypto from "crypto";
import type { EndpointKey } from "./ApiEndpoint";
import { ENDPOINTS } from "./ApiEndpoint";
import {
  ApiRequestResult,
  createAuthError,
  createRequestError,
  type ApiResponse,
} from "./ApiHelper";

async function getAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw createAuthError("Unauthorized");
  }
  return token;
}

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is missing.`);
  }
  return value;
}

function generateHmac(body: unknown): string {
  const secret = getEnvVar("HMAC_KEY");
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

interface RequestOptions<TReq> {
  body?: TReq;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

export async function apiRequest<TReq = unknown, TRes = unknown>(
  key: EndpointKey,
  options: RequestOptions<TReq> = {},
): Promise<ApiRequestResult<TRes>> {
  // Get Endpoint from ApiEndpoints
  const config = ENDPOINTS[key];
  // Get Domain Name on ENV
  const domain = getEnvVar("API_BASE_URL");
  // Get API Endpoint Path {public or private}
  const endpointPath = config.isPublic
    ? getEnvVar("API_BASE_URL_PUBLIC")
    : getEnvVar("API_BASE_URL_PRIVATE");
  // Full API Endpoint
  const baseUrl = `${domain}${endpointPath}`;

  // Build path with params
  let path = config.path;
  if (options.params) {
    for (const [paramKey, value] of Object.entries(options.params)) {
      path = path.replace(`:${paramKey}`, encodeURIComponent(value));
    }
  }

  // Build URL with query
  const url = new URL(`${baseUrl}${path}`);
  if (options.query) {
    for (const [queryKey, value] of Object.entries(options.query)) {
      url.searchParams.set(queryKey, value);
    }
  }

  console.log(`API Request: ${config.method} ${url.toString()}`);

  // Setup headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // Get Token from Cookies if Config on ApiEndpoint requiresAuth is true
  if (config.requireAuth) {
    headers.Authorization = `Bearer ${await getAuthToken()}`;
  }
  // Get Token from Cookies if Config on ApiEndpoint useHmac is true
  if (config.useHmac && options.body) {
    headers["x-signature"] = generateHmac(options.body);
  }

  // Fetch
  const response = await fetch(url.toString(), {
    method: config.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const result = (await response.json()) as ApiResponse<TRes>;

  // Session expired
  if (result.retCode === "104") {
    throw createAuthError(result.message);
  }

  // HTTP errors
  if (!response.ok) {
    throw createRequestError(
      result.message || `HTTP ${response.status}`,
      response.status,
      result.retCode,
    );
  }

  return { data: result, status: response.status };
}
