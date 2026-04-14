// ==================== TYPES ====================

export type EndpointKey = "permissions" | "logout" | "forgot-password" | "sample";

export interface EndpointConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  requireAuth?: boolean;
  useHmac?: boolean;
  responseType?: "json" | "blob";
  raw?: boolean;
}

const BASE_URL = {
  public: process.env.API_BASE_URL_PUBLIC ?? "",
  private: process.env.API_BASE_URL_PRIVATE ?? "",
};

export const endpoints: Record<EndpointKey, EndpointConfig> = {
  //-------------------
  // // RBAC/PERMISSIONS
  //-------------------
  permissions: {
    url: `${BASE_URL.public}/rbac/roles/:id/permissions`,
    method: "GET",
    requireAuth: true,
    useHmac: false,
  },
  logout: {
    url: `${BASE_URL.private}/logout`,
    method: "POST",
    requireAuth: true,
    useHmac: false,
  },
  "forgot-password": {
    url: `${BASE_URL.private}/auth/forgot-password`,
    method: "PUT",
    requireAuth: true,
    useHmac: false,
  },
  sample: {
    url: `${BASE_URL.private}/sample`,
    method: "GET",
    requireAuth: false,
    useHmac: false,
  },
};
