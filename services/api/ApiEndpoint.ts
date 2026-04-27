// app/lib/api/ApiEndpoint.ts

// Defines the HTTP methods that can be used for an API endpoint.
export type Method = "GET" | "POST" | "PUT" | "DELETE";

// Configuration object for a single endpoint.
export interface EndpointConfig {
  path: string; // URL path with optional parameters (e.g., "/users/:id")
  isPublic: boolean;
  method: Method; // HTTP verb
  requireAuth: boolean; // Whether the endpoint needs a Bearer token
  useHmac?: boolean; // If true, an HMAC signature header is added to the request body
}

// Central registry of all backend endpoints used in the application.
export const ENDPOINTS: Record<string, EndpointConfig> = {
  LOGIN: {
    path: "/auth/register-login/otp",
    isPublic: true,
    method: "POST",
    requireAuth: false, // Login does not need an existing token
    useHmac: true, // HMAC protects the login request from tampering
  },
} as const;

// Extracts the possible endpoint keys from the ENDPOINTS object.
export type EndpointKey = keyof typeof ENDPOINTS;
