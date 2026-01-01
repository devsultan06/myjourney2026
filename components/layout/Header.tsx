"use client";

import { Bell, Menu, Search } from "lucide-react";
import { getYearProgress } from "@/lib/utils";
import ProgressBar from "@/components/ui/ProgressBar";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const yearProgress = getYearProgress();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-600 placeholder:text-gray-400 focus:outline-none w-48"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Year Progress */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-500">2026 Progress</p>
              <p className="text-sm font-bold text-indigo-600">
                Day {yearProgress.dayOfYear}/{yearProgress.totalDays}
              </p>
            </div>
            <div className="w-24">
              <ProgressBar
                value={yearProgress.percentComplete}
                size="sm"
                color="indigo"
              />
            </div>
          </div>

          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-medium">D</span>
          </div>
        </div>
      </div>
    </header>
  );
}
