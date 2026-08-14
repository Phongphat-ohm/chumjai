import type { Metadata } from "next";
import { Kanit, Sarabun } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { getSession } from "@/lib/auth";

const kanit = Kanit({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin", "thai"],
  variable: "--font-kanit",
  display: "swap",
});

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
  display: "swap",
});

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
    <html lang="th" className={`h-full ${kanit.variable} ${sarabun.variable}`}>
      <body className={`${kanit.className} h-full bg-slate-50 text-slate-900 antialiased font-sans`}>
        <AppShell userSession={session}>{children}</AppShell>
      </body>
    </html>
  );
}
