"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  LayoutDashboard,
  Globe,
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  FileText,
  Monitor,
  Users,
  Activity,
  Database,
  BarChart3,
  Ticket,
  CreditCard,
  Coins,
  Key,
  FolderOpen,
  Megaphone,
  Wallet,
} from "lucide-react";
import { GAConnectDialog } from "./ga-connect-dialog";
import { useEffect } from "react";

const analyticsNavigation = [
  {
    name: "Traffic Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Top Pages",
    href: "/dashboard/pages",
    icon: FileText,
  },
  {
    name: "Countries",
    href: "/dashboard/countries",
    icon: Globe,
  },
  {
    name: "Acquisition",
    href: "/dashboard/acquisition",
    icon: TrendingUp,
  },
  {
    name: "Devices & Browsers",
    href: "/dashboard/devices",
    icon: Monitor,
  },
  {
    name: "User Types",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    name: "Engagement",
    href: "/dashboard/engagement",
    icon: Activity,
  },
  {
    name: "Google Ads",
    href: "/dashboard/ads",
    icon: Megaphone,
  },
];

const firestoreNavigation = [
  {
    name: "App Users",
    href: "/dashboard/app-users",
    icon: Database,
  },
  {
    name: "Activity Stats",
    href: "/dashboard/activity",
    icon: BarChart3,
  },
];

const adminNavigation = [
  {
    name: "Promo Codes",
    href: "/dashboard/promo-codes",
    icon: Ticket,
  },
  {
    name: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    name: "Credits",
    href: "/dashboard/credits",
    icon: Coins,
  },
  {
    name: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
  },
  {
    name: "Datasets",
    href: "/dashboard/datasets",
    icon: FolderOpen,
  },
  {
    name: "Withdrawals",
    href: "/dashboard/withdrawals",
    icon: Wallet,
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 rounded-xl blur-sm opacity-60"></div>
            <Image
              src="/inf-logo.png"
              alt="Inflectiv"
              width={36}
              height={36}
              className="object-contain relative"
            />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
              inflectiv
            </span>
            <p className="text-[10px] text-gray-400 -mt-0.5">Analytics Dashboard</p>
          </div>
        </div>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="mb-2 px-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Analytics
          </span>
        </div>
        <div className="space-y-1">
          {analyticsNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg mr-3 transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-purple-500" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Firestore Data Section */}
        <div className="mt-6 mb-2 px-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            App Data
          </span>
        </div>
        <div className="space-y-1">
          {firestoreNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg mr-3 transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-purple-500" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        <div className="mt-6 mb-2 px-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Admin
          </span>
        </div>
        <div className="space-y-1">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg mr-3 transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 text-white shadow-lg shadow-purple-500/25"
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{item.name}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-purple-500" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* GA Connection */}
      <div className="px-3 py-3 border-t border-gray-100">
        <GAConnectDialog />
      </div>

      {/* User Info */}
      {session && (
        <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-orange-500/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-orange-400 text-white text-sm font-medium">
                {session?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full w-72 flex-col bg-white border-r border-gray-200 shadow-sm">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] flex flex-col bg-white z-50 lg:hidden shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}

// Mobile Header
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </button>
      <div className="flex items-center gap-2">
        <Image
          src="/inf-logo.png"
          alt="Inflectiv"
          width={28}
          height={28}
          className="object-contain"
        />
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
          inflectiv
        </span>
      </div>
      <div className="w-9" />
    </div>
  );
}
