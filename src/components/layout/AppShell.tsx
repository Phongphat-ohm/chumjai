"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { UserSessionPayload } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
  userSession?: UserSessionPayload | null;
}

export function AppShell({ children, userSession }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  React.useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  // If on login or public queue display monitor page, render standalone page content without Dashboard Header & Sidebar
  if (pathname && (pathname.startsWith("/login") || pathname.startsWith("/queue/display"))) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 relative">
      {/* Top Instant Navigation Progress Indicator */}
      {isNavigating && (
        <div className="absolute top-0 left-0 right-0 z-50 h-1 bg-chunjai-200 overflow-hidden">
          <div className="h-full bg-chunjai-600 animate-pulse w-full" />
        </div>
      )}

      <Header
        userSession={userSession}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          userRole={userSession?.role}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
