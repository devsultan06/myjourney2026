"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Code2,
  Dumbbell,
  Briefcase,
  Rocket,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trophy,
  X,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reading List", href: "/dashboard/reading", icon: BookOpen },
  { name: "Coding Practice", href: "/dashboard/coding", icon: Code2 },
  { name: "Gym Tracker", href: "/dashboard/gym", icon: Dumbbell },
  { name: "LeetCode", href: "/dashboard/leetcode", icon: Trophy },
  { name: "Job Applications", href: "/dashboard/jobs", icon: Briefcase },
  // { name: "Startup Projects", href: "/dashboard/projects", icon: Rocket },
  { name: "Events", href: "/dashboard/events", icon: Calendar },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">26</span>
            </div>
            <span className="font-bold text-gray-900">My2026Journey</span>
          </Link>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive && "text-indigo-600"
                )}
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span>Settings</span>}
        </Link>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && (
            <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 bg-white border-r border-gray-200 transition-all duration-300",
          isCollapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
