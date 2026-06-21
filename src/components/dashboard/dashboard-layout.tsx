"use client";

import { useState } from "react";
import { Sidebar, MobileHeader } from "./sidebar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Portfolio attribution banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white text-[11px] sm:text-xs px-4 py-1.5 text-center font-medium tracking-wide">
        <span className="opacity-90">Portfolio demo · Built at BIG IMMERSIVE by Muhammad Bilal · All numbers are synthetic</span>
        <a href="https://bilal-pf.vercel.app" target="_blank" rel="noreferrer" className="ml-2 underline opacity-90 hover:opacity-100">View portfolio →</a>
      </div>

      {/* Mobile Header */}
      <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-full bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
