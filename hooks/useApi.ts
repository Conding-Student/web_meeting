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
    ): Promise<ApiResponse<T> | null> => {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          credentials: "include",
        });

        const data = (await response.json()) as ApiResponse<T>;

        if (!response.ok) {
          toast.error(data.message || `HTTP ${response.status}`);
          return null;
        }

        return data;
      } catch (error) {
        if (isApiError(error) && error.type === "session") {
          toast.warning(error.message || "Session expired");
          router.push("/login?reason=session_expired");
          return null;
        }

        // ✅ REQUEST ERRORS: RE-THROW for custom handling
        if (isApiError(error) && error.type === "request") {
          throw error; // 🔥 Let useLogin/useProfile/etc. handle
        }

        // ✅ NETWORK ERRORS: Generic toast
        console.error("Network error:", error);
        toast.error("Network error. Please try again.");
        return null;
      }
    },
    [router, toast],
  );

  return { request };
}
