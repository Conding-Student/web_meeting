import { JSX } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./component/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Login to your account",
};

export default function LoginPage(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-center text-3xl font-bold">Sign in</h2>
        <LoginForm />
      </div>
    </div>
  );
}