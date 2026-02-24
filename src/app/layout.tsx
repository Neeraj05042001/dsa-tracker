import type { Metadata } from "next";
import "./globals.css";
// import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "DSA Tracker",
  description: "Track your DSA problems and prepare for interviews",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
