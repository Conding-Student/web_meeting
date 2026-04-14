// app/lib/api/ApiServer.ts

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
// import { decryptToken } from "../helper/crypto";
import { EndpointConfig, EndpointKey, endpoints } from "./ApiEndpoint";
import { ApiError } from "./ApiError";

export interface ApiRequestOptions {
  isFormData?: boolean;
  params?: Record<string, string | number>;
  query?: Record<string, string | number | boolean>;
}

// ==================== LOGGER ====================

const logger = {
  info: (msg: string, meta?: Record<string, unknown>): void => {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[INFO] ${msg}`, meta ?? "");
    }
  },
  warn: (msg: string, meta?: Record<string, unknown>): void => {
    console.warn(`[WARN] ${msg}`, meta ?? "");
  },
  error: (msg: string, meta?: Record<string, unknown>): void => {
    console.error(`[ERROR] ${msg}`, meta ?? "");
  },
};

// ==================== HELPERS ====================

function getBaseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (!url) throw new Error("API_BASE_URL environment variable is not set");
  return url;
}

function getHmacSecret(): string {
  const secret = process.env.HMAC_KEY;
  if (!secret) throw new Error("HMAC_KEY environment variable is not set");
  return secret;
}

function generateSignature(body: unknown): string {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return crypto
    .createHmac("sha256", getHmacSecret())
    .update(payload)
    .digest("hex");
}

function extractErrorMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const record = data as Record<string, unknown>;
  for (const key of ["message", "error", "data"]) {
    if (typeof record[key] === "string" && record[key]) {
      return record[key] as string;
    }
  }
  return undefined;
}

async function prepareHeaders(
  requireAuth: boolean,
  useHmac: boolean,
  body: unknown,
  isFormData: boolean,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (requireAuth) {
    try {
      const token = (await cookies()).get("token")?.value;
      if (!token) throw new Error("token cookie is not set");
      headers["Authorization"] = `Bearer ${token}`;
    } catch (err) {
      logger.error("prepareHeaders: failed to decrypt/parse session", {
        error: err instanceof Error ? err.message : String(err),
      });
      redirect("/login");
    }
  }

  if (useHmac && body !== undefined && !isFormData) {
    headers["x-signature"] = generateSignature(body);
  }

  return headers;
}

export function resolveUrl(
  base: string,
  path: string,
  params?: Record<string, string | number>,
  query?: Record<string, string | number | boolean>,
): string {
  let resolved = path;
  if (params) {
    for (const [key, val] of Object.entries(params)) {
      resolved = resolved.replace(`:${key}`, encodeURIComponent(String(val)));
    }
  }
  const url = new URL(`${base}${resolved}`);
  if (query) {
    for (const [key, val] of Object.entries(query)) {
      url.searchParams.set(key, String(val));
    }
  }
  return url.toString();
}

// ==================== MAIN API REQUEST FUNCTION ====================

export async function apiRequest<T>(
  endpointKey: EndpointKey,
  body?: unknown,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { isFormData = false } = options;

  const config: EndpointConfig = endpoints[endpointKey];
  const {
    url,
    method = "GET",
    requireAuth = false,
    useHmac = false,
    responseType = "json",
    raw = false,
  } = config;

  logger.info("apiRequest: initiated", { endpointKey, method, url });

  const headers = await prepareHeaders(requireAuth, useHmac, body, isFormData);

  const requestBody: BodyInit | undefined =
    method !== "GET"
      ? isFormData
        ? (body as FormData)
        : JSON.stringify(body)
      : undefined;

  let res: Response;

  try {
    const resolvedUrl = resolveUrl(
      getBaseUrl(),
      url,
      options.params,
      options.query,
    );
    console.log("url api called: ", resolvedUrl);
    res = await fetch(resolvedUrl, {
      method,
      headers,
      body: requestBody,
      cache: "no-store",
    });
    console.log("url api called: ", resolvedUrl);
  } catch (err) {
    throw err;
  }

  logger.info("apiRequest: response received", {
    status: res.status,
    ok: res.ok,
  });

  if (raw) {
    return res as unknown as T;
  }

  if (!res.ok) {
    let errorMessage = `API Error: ${res.status}`;
    try {
      const errorData: unknown = await res.json().catch(() => null);
      const extracted = extractErrorMessage(errorData);
      if (extracted) errorMessage = extracted;
    } catch {
      // leave default message
    }
    logger.error("apiRequest: request failed", {
      status: res.status,
      errorMessage,
    });
    throw new ApiError(res.status, errorMessage);
  }

  if (responseType === "blob") {
    return (await res.blob()) as unknown as T;
  }

  return (await res.json()) as T;
}
