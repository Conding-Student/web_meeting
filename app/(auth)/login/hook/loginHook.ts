"use client";

import { useApi } from "@/hooks/useApi";
import { isApiError } from "@/services/api/ApiHelper";
import { useAppToast } from "@/shared/ui/ToastContainer";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

interface LoginData {
  token: string;
  otp?: string;
}

export function useLogin() {
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);
  const { request } = useApi();
  const toast = useAppToast();
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setLoading(true);

      try {
        const response = await request<LoginData>("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staff_id: staffId.trim() }),
        });

        // Session expired auto-handled by useApi
        if (!response) return;

        if (response.retCode === "0") {
          if (response.data?.otp) {
            toast.success("OTP required");
            router.push(`/verify-otp?staff_id=${staffId.trim()}`);
          } else {
            toast.success("Login successful");
            router.push("/");
          }
          return;
        }

        // Business errors already thrown by useApi
        // This won't be reached for retCode !== "0"
      } catch (err: unknown) {
        // ✅ CUSTOM LOGIN ERROR HANDLING
        if (isApiError(err) && err.type === "request") {
          toast.error("Invalid credentials");
        } else {
          // Unexpected errors
          toast.error("Login failed");
        }
      } finally {
        setLoading(false);
      }
    },
    [staffId, request, toast, router],
  );

  return {
    staffId,
    setStaffId,
    loading,
    handleSubmit,
  };
}
