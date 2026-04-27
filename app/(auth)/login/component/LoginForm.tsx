// app/(auth)/login/component/LoginForm.tsx
"use client";

import type { JSX } from "react";
import { useLogin } from "../hook/loginHook";

export function LoginForm(): JSX.Element {
  const { staffId, setStaffId, loading, handleSubmit } = useLogin();

  return (
    <form className="mt-8 space-y-6 text-black" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="staff_id" className="block text-sm font-medium">
          Staff ID
        </label>
        <input
          id="staff_id"
          name="staff_id"
          type="text"
          required
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Enter your staff ID"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
