// useApi.ts
"use client";

import { ApiResponse, createRequestError } from "@/services/api/ApiHelper";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useApi() {
  const router = useRouter();

  const request = useCallback(
    async <T = unknown>(
      url: string,
      fetchOptions?: RequestInit,
    ): Promise<ApiResponse<T>> => {
      const response = await fetch(url, {
        ...fetchOptions,
        credentials: "include",
      });

      const data = (await response.json()) as ApiResponse<T>;

      // Session expired — redirect to login with a toast trigger
      if (data.retCode === "104") {
        router.push("/login?reason=session_timeout");
        // Throw so the calling component's catch block exits cleanly
        throw createRequestError(data.message || "Session expired", 401, "104");
      }

      if (!response.ok) {
        throw createRequestError(
          data.message || `HTTP ${response.status}`,
          response.status,
          data.retCode,
        );
      }

      return data;
    },
    [router],
  );

  return { request };
}
