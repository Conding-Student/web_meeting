import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/shared/ui/ToastContainer";

export const metadata: Metadata = {
  title: "Enterprise Portfolio Management",
  description: "Next.js Enterprise Template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
