"use client";

import { useApi } from "@/hooks/useApi";
import { useAppToast } from "@/shared/ui/ToastContainer";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";

export function useLogin() {
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { request } = useApi();
  const toast = useAppToast();
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
        const response = await request("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ staff_id: staffId.trim() }),
        });

        console.log("Login API response:", response);
        toast.success(response?.message || "Login successful");
        router.push("/dashboard");

        return response;
      } catch (err: unknown) {
        // ✅ Now you can handle different error types
        if (err instanceof Error) {
          // Validation errors (400, etc.)
          setError(err.message);
          toast.error(err.message || "Invalid credentials");
        } else {
          // Unexpected errors
          setError("Login failed");
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
    error,
    handleSubmit,
  };
}
