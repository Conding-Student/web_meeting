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
    path: "/session/login",
    isPublic: true,
    method: "POST",
    requireAuth: false, // Login does not need an existing token
  },

  LOGOUT: {
    path: "/session/logout",
    isPublic: true,
    method: "POST",
    requireAuth: true, // Login does not need an existing token
  },
  RESEND_OTP: {
    path: "/session/login-resend-otp",
    isPublic: true,
    method: "GET",
    requireAuth: false, // Login does not need an existing token
  },
  VERIFY_OTP: {
    path: "/session/login-verify-otp",
    isPublic: true,
    method: "POST",
    requireAuth: false, // Login does not need an existing token
  },
  INITIAL_CHANGE_PASSWORD: {
    path: "/auth/password/initial-change",
    isPublic: true,
    method: "POST",
    requireAuth: false,
  },
  CHECK_2FA_REGISTRATION: {
    path: "/session/2fa/check-and-register",
    isPublic: true,
    method: "POST",
    requireAuth: false,
  },
  VERIFY_AUTHENTICATION_CODE: {
    path: "/session/2fa/login",
    isPublic: true,
    method: "POST",
    requireAuth: false,
  },
  FORGOT_PASSWORD_INITIATE: {
    path: "/auth/password/forgot-password",
    isPublic: true,
    method: "POST",
    requireAuth: false,
  },
  FORGOT_PASSWORD_VERIFY_OTP: {
    path: "/auth/password/verify-otp",
    isPublic: true,
    method: "POST",
    requireAuth: false,
  },
  FORGOT_PASSWORD_RESET: {
    path: "/auth/password/reset-password",
    isPublic: true,
    method: "POST",
    requireAuth: false,
  },
  FORGOT_PASSWORD_RESEND_OTP: {
    path: "/auth/password/resend-otp",
    isPublic: true,
    method: "POST",
    requireAuth: false,
  },
  SELF_CHANGE_PASSWORD: {
    path: "/auth/password/self-change-password",
    isPublic: true,
    method: "POST",
    requireAuth: true,
  },
  HCIS_INQUIRY: {
    path: "/auth/administrator/fetch-staff-information",
    isPublic: false,
    method: "POST",
    requireAuth: true,
  },
  USER_REGISTRATION: {
    path: "/auth/administrator/registration",
    isPublic: false,
    method: "POST",
    requireAuth: true,
  },

  //USER MANAGEMENT
  GET_USER_LIST: {
    path: "/auth/administrator/fetch-user-list",
    isPublic: false,
    method: "POST",
    requireAuth: true,
  },

  GET_NAVIGATION_MATRIX: {
    path: "/auth/access-matrix/fetch-matrix", // Adjust this path to match your actual backend endpoint
    method: "GET",
    isPublic: true,
    requireAuth: true, // Requires token from cookies
    useHmac: false,
  },
  RESET_PASSWORD_TO_TEMP: {
    path: "/auth/administrator/reset-password-to-temporary",
    method: "POST",
    isPublic: false,
    requireAuth: true,
  },
  FORCE_LOGOUT: {
    path: "/auth/administrator/force-logout",
    method: "POST",
    isPublic: false,
    requireAuth: true,
  },
  TOGGLE_USER_ACTIVE: {
    path: "/auth/administrator/reactivate-user-account",
    method: "POST",
    isPublic: false,
    requireAuth: true,
  },
  TOGGLE_USER_DEACTIVE: {
    path: "/auth/administrator/deactivate-user-account",
    method: "POST",
    isPublic: false,
    requireAuth: true,
  },
  UNREGISTER_2FA: {
    path: "/auth/administrator/unregister-2fa",
    method: "POST",
    isPublic: false,
    requireAuth: true,
  },

  //ACCESS MATRIX
  GET_USER_ROLES: {
    path: "/auth/access-matrix/fetch-roles",
    method: "GET",
    isPublic: true,
    requireAuth: true,
  },
  GET_MODULES: {
    path: "/auth/access-matrix/fetch-modules",
    method: "GET",
    isPublic: true,
    requireAuth: true,
  },
  UPSERT_ROLE_ACCESS: {
    path: "/auth/access-matrix/register-role-and-matrix",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },

  //REWARDS MANAGEMENT
  GET_CUSTOMER_BALANCES: {
    path: "/auth/rewards-redemption/fetch-customer-points-balance",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },
  GET_REWARD_INSTITUTIONS: {
    path: "/auth/rewards-redemption/fetch-distinct-institutions-points-balance",
    method: "GET",
    isPublic: true,
    requireAuth: true,
  },
  GET_REWARD_BRANCHES: {
    path: "/auth/rewards-redemption/fetch-distinct-branches-points-balance",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },
  GET_REWARD_UNITS: {
    path: "/auth/rewards-redemption/fetch-distinct-units-points-balance",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },
  CUSTOMER_MINI_STATEMENT: {
    path: "/auth/rewards-redemption/fetch-customer-points-statement",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },
  CUSTOMER_REDEEM: {
    path: "/auth/rewards-redemption/redeem-points-balance",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },

  //REPORTS
  GET_REDEMPTION_REPORT: {
    path: "/auth/rewards-redemption/view-points-report",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },
  GET_REWARD_REPORT_INSTITUTIONS: {
    path: "/auth/rewards-redemption/fetch-distinct-institutions-points-report",
    method: "GET",
    isPublic: true,
    requireAuth: true,
  },
  GET_REWARD_REPORT_BRANCH: {
    path: "/auth/rewards-redemption/fetch-distinct-branches-points-report",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },
  GET_REWARD_REPORT_UNIT: {
    path: "/auth/rewards-redemption/fetch-distinct-units-points-report",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },
  GET_DISTINCT_LOCATIONS: {
    path: "/auth/rewards-redemption/fetch-distinct-stores-points-report",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },

  //EXPORT
  EXPORT_REDEMPTION_REPORT_CSV: {
    path: "/auth/rewards-redemption/export-points-report",
    method: "POST",
    isPublic: true,
    requireAuth: true,
  },
  //SESSION
  GET_IDLE_TIMEOUT: {
    path: "/auth/system-parameter/fetch-idle-timeout",
    method: "GET",
    isPublic: true,
    requireAuth: true,
  },

  //RAFFLE EVENTS
  UPSERT_RAFFLE_EVENT_DETAILS: {
    method: "POST",
    path: "/auth/rewards-redemption/upsert-raffle-event-details",
    requireAuth: true,
    isPublic: true,
  },
  GET_RAFFLE_EVENTS: {
    method: "POST",
    path: "/auth/rewards-redemption/fetch-raffle-events",
    requireAuth: true,
    isPublic: true,
  },
  GET_PROFILE_INFORMATION: {
    method: "GET",
    path: "/auth/user-settings/fetch-personal-information",
    requireAuth: true,
    isPublic: false,
  },
} as const;

// Extracts the possible endpoint keys from the ENDPOINTS object.
export type EndpointKey = keyof typeof ENDPOINTS;
