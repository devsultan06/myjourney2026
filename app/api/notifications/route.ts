import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.userId || null;
}

// GET - Fetch all notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");

    // First, generate dynamic notifications
    await generateNotifications(userId);

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    if (markAllRead) {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          userId,
        },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update notifications error:", error);
    return NextResponse.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

// DELETE - Delete old/expired notifications
export async function DELETE() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Delete notifications older than 30 days or expired
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.notification.deleteMany({
      where: {
        userId,
        OR: [
          { createdAt: { lt: thirtyDaysAgo } },
          { expiresAt: { lt: new Date() } },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete notifications error:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}

// Helper function to generate dynamic notifications
async function generateNotifications(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifications: {
    type: string;
    title: string;
    message: string;
    icon: string;
    link?: string;
    priority: string;
    expiresAt?: Date;
  }[] = [];

  // Check if user has logged any activity today
  const todayActivity = await prisma.activity.findFirst({
    where: {
      userId,
      date: { gte: today },
    },
  });

  // Get user's current streak
  const activities = await prisma.activity.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  const streak = calculateCurrentStreak(activities.map((a) => a.date));

  // 1. Daily reminder if no activity today (only after noon)
  const now = new Date();
  if (!todayActivity && now.getHours() >= 12) {
    const existingReminder = await prisma.notification.findFirst({
      where: {
        userId,
        type: "daily_reminder",
        createdAt: { gte: today },
      },
    });

    if (!existingReminder) {
      notifications.push({
        type: "daily_reminder",
        title: "Keep your streak alive! 🔥",
        message:
          streak > 0
            ? `You have a ${streak}-day streak! Don't forget to log an activity today.`
            : "Start a new streak today! Log any activity to begin.",
        icon: "🎯",
        link: "/dashboard",
        priority: streak > 3 ? "high" : "normal",
        expiresAt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Expires at midnight
      });
    }
  }

  // 2. Streak milestone achievements
  const milestones = [7, 14, 30, 50, 100, 365];
  for (const milestone of milestones) {
    if (streak === milestone) {
      const existingAchievement = await prisma.notification.findFirst({
        where: {
          userId,
          type: "streak_achieved",
          message: { contains: `${milestone}-day` },
        },
      });

      if (!existingAchievement) {
        notifications.push({
          type: "streak_achieved",
          title: "🏆 Streak Milestone!",
          message: `Amazing! You've reached a ${milestone}-day streak! Keep going!`,
          icon: "🏆",
          link: "/dashboard",
          priority: "high",
        });
      }
    }
  }

  // 3. Upcoming events (within next 24 hours)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const upcomingEvents = await prisma.event.findMany({
    where: {
      userId,
      date: {
        gte: now,
        lte: tomorrow,
      },
    },
  });

  for (const event of upcomingEvents) {
    const existingReminder = await prisma.notification.findFirst({
      where: {
        userId,
        type: "event_reminder",
        message: { contains: event.id },
      },
    });

    if (!existingReminder) {
      const eventDate = new Date(event.date);
      const isToday = eventDate.toDateString() === now.toDateString();

      notifications.push({
        type: "event_reminder",
        title: isToday ? "📅 Event Today!" : "📅 Event Tomorrow",
        message: `${event.name} at ${event.location}`,
        icon: "📅",
        link: "/dashboard/events",
        priority: isToday ? "high" : "normal",
        expiresAt: eventDate,
      });
    }
  }

  // 4. Job application follow-ups (applied more than 7 days ago, still in applied/screening status)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const pendingJobs = await prisma.jobApplication.findMany({
    where: {
      userId,
      status: { in: ["applied", "screening"] },
      appliedDate: { lt: sevenDaysAgo },
    },
  });

  for (const job of pendingJobs) {
    const existingReminder = await prisma.notification.findFirst({
      where: {
        userId,
        type: "job_followup",
        message: { contains: job.id },
        createdAt: { gte: sevenDaysAgo }, // Don't remind again within 7 days
      },
    });

    if (!existingReminder) {
      const daysAgo = Math.floor(
        (now.getTime() - (job.appliedDate?.getTime() || now.getTime())) /
          (1000 * 60 * 60 * 24)
      );

      notifications.push({
        type: "job_followup",
        title: "📧 Time to Follow Up?",
        message: `You applied to ${job.company} (${job.position}) ${daysAgo} days ago. Consider following up!`,
        icon: "💼",
        link: "/dashboard/jobs",
        priority: "normal",
      });
    }
  }

  // Create all new notifications
  if (notifications.length > 0) {
    await prisma.notification.createMany({
      data: notifications.map((n) => ({
        ...n,
        userId,
      })),
    });
  }
}

// Helper to calculate current streak
function calculateCurrentStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const getDateString = (d: Date) => {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const uniqueDates = [...new Set(dates.map((d) => getDateString(d)))]
    .sort()
    .reverse();

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(
    yesterday.getMonth() + 1
  ).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i - 1]);
    current.setDate(current.getDate() - 1);
    const expected = getDateString(current);

    if (uniqueDates[i] === expected) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
