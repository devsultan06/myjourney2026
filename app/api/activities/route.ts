import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getAuthCookie } from "@/lib/auth";

// GET /api/activities - Get recent activities for the current user
export async function GET() {
  try {
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get recent activities (last 20)
    const activities = await prisma.activity.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Format activities with relative time
    const formattedActivities = activities.map((activity) => {
      const now = new Date();
      const activityDate = new Date(activity.createdAt);
      const diffMs = now.getTime() - activityDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      let timeAgo: string;
      if (diffMins < 1) {
        timeAgo = "Just now";
      } else if (diffMins < 60) {
        timeAgo = `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
      } else if (diffDays === 1) {
        timeAgo = "Yesterday";
      } else if (diffDays < 7) {
        timeAgo = `${diffDays} days ago`;
      } else {
        timeAgo = activityDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      return {
        id: activity.id,
        type: activity.type,
        action: activity.action,
        title:
          activity.details || getDefaultTitle(activity.type, activity.action),
        time: timeAgo,
        createdAt: activity.createdAt,
      };
    });

    return NextResponse.json({ activities: formattedActivities });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}

// Helper to generate default titles based on activity type
function getDefaultTitle(type: string, action: string): string {
  const typeLabels: Record<string, string> = {
    book: "Reading",
    coding: "Coding session",
    leetcode: "LeetCode problem",
    gym: "Workout",
    job: "Job application",
    project: "Project",
    event: "Event",
  };

  const actionLabels: Record<string, string> = {
    created: "Added",
    updated: "Updated",
    completed: "Completed",
    started: "Started",
  };

  const typeLabel = typeLabels[type] || type;
  const actionLabel = actionLabels[action] || action;

  return `${actionLabel} ${typeLabel.toLowerCase()}`;
}
