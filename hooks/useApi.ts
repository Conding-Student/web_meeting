"use client";

import { ApiResponse, isApiError } from "@/services/api/ApiHelper";
import { useAppToast } from "@/shared/ui/ToastContainer";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useApi() {
  const router = useRouter();
  const toast = useAppToast();

  const request = useCallback(
    async <T = unknown>(
      url: string,
      fetchOptions?: RequestInit,
    ): Promise<ApiResponse<T>> => {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          credentials: "include",
        });

        const data = (await response.json()) as ApiResponse<T>;

        // ✅ Handle session expiry (auto-handle, don't throw)
        if (data.retCode === "104") {
          toast.warning(data.message || "Session expired");
          router.push("/login?reason=session_expired");
          throw new Error("Session expired");
        }

        // ✅ Handle HTTP errors - THROW so caller can catch
        if (!response.ok) {
          const error = new Error(
            data.message || `HTTP ${response.status}`,
          ) as ApiResponse<T> & Error;
          Object.assign(error, {
            retCode: data.retCode,
            statusCode: response.status,
          });
          throw error;
        }

        console.log("SUCCESS");
        return data;
      } catch (error) {
        // Re-throw API errors so caller can handle them
        if (error instanceof Error && error.message !== "Session expired") {
          throw error;
        }

        // Network/JSON errors - show toast and throw
        console.error("Network error:", error);
        toast.error("Network error. Please try again.");
        throw error;
      }
    },
    [router, toast],
  );

  return { request };
}
