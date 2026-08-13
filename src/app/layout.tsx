import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ชุมใจ | ระบบจัดการคลินิกชุมชน",
  description: "Chunjai — Community Clinic & Smart Health Tracking System",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="th" className="h-full">
      <body className={`${inter.className} h-full bg-slate-50 text-slate-900`}>
        <AppShell userSession={session}>{children}</AppShell>
      </body>
    </html>
  );
}
