"use client";

import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  count: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StreakBadge({
  count,
  label = "day streak",
  size = "md",
  className,
}: StreakBadgeProps) {
  const sizes = {
    sm: "text-sm gap-1",
    md: "text-base gap-1.5",
    lg: "text-lg gap-2",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center font-semibold",
        count > 0 ? "text-orange-500" : "text-gray-400",
        sizes[size],
        className
      )}
    >
      <Flame className={cn(iconSizes[size], count > 0 && "animate-pulse")} />
      <span>{count}</span>
      {label && <span className="font-normal text-gray-500">{label}</span>}
    </div>
  );
}
