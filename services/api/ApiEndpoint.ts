export type EndpointKey = "permissions" | "logout" | "dashboard-stats" | "sample";

export interface EndpointConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  requireAuth?: boolean;
  useHmac?: boolean;
  responseType?: "json" | "blob";
  raw?: boolean;
}

export const endpoints: Record<EndpointKey, EndpointConfig> = {
  sample: {
    url: "/api/mock/sample", 
    method: "GET",
    requireAuth: false,
  },
  "dashboard-stats": {
    url: "/api/mock/stats",
    method: "GET",
    requireAuth: true,
  },
  logout: {
    url: "/api/logout",
    method: "POST",
    requireAuth: true,
  },
  permissions: {
    url: "/api/rbac/permissions",
    method: "GET",
    requireAuth: true,
  }
};