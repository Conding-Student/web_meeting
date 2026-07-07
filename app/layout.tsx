import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/shared/ui/ToastContainer";
import "@livekit/components-styles";

export const metadata: Metadata = {
  title: "NextJS Frontend Template",
  description: "Next.js Frontend Template",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}


