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

// Helper to get date string (YYYY-MM-DD) from UTC date
// Uses UTC methods since we store dates at UTC noon
function getDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get today's date string using local timezone (for user's "today")
function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Calculate streak from activity dates
function calculateStreak(activityDates: Date[]): number {
  if (activityDates.length === 0) return 0;

  // Get unique dates as strings, sorted descending
  const uniqueDates = [...new Set(activityDates.map((d) => getDateString(d)))]
    .sort()
    .reverse();

  const today = getTodayString();
  // Calculate yesterday in local timezone
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(
    yesterdayDate.getMonth() + 1
  ).padStart(2, "0")}-${String(yesterdayDate.getDate()).padStart(2, "0")}`;

  // Check if the most recent activity is today or yesterday
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    return 0; // Streak broken
  }

  let streak = 1;

  // Parse date as UTC noon (matching how we store dates)
  const parseDate = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  };

  let currentDate = parseDate(uniqueDates[0]);

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setUTCDate(prevDate.getUTCDate() - 1);

    if (getDateString(prevDate) === uniqueDates[i]) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

// GET - Get user's streak info by category
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get all activities for the user in the last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const activities = await prisma.activity.findMany({
      where: {
        userId,
        date: { gte: oneYearAgo },
      },
      select: { date: true, type: true },
      orderBy: { date: "desc" },
    });

    // Group activities by type
    const activityByType: Record<string, Date[]> = {};
    const allDates: Date[] = [];

    activities.forEach((a) => {
      if (!activityByType[a.type]) {
        activityByType[a.type] = [];
      }
      activityByType[a.type].push(a.date);
      allDates.push(a.date);
    });

    // Calculate overall streak
    const overallStreak = calculateStreak(allDates);

    // Calculate streak for each category
    const categoryStreaks = {
      coding: calculateStreak(activityByType["coding"] || []),
      leetcode: calculateStreak(activityByType["leetcode"] || []),
      reading: calculateStreak(activityByType["book"] || []),
      gym: calculateStreak(activityByType["gym"] || []),
    };

    // Check if user has activity today
    const today = getDateString(new Date());
    const hasActivityToday = allDates.some((d) => getDateString(d) === today);

    // Get total activity count
    const totalActivities = await prisma.activity.count({ where: { userId } });

    // Debug: Get unique activity dates
    const uniqueActivityDates = [
      ...new Set(allDates.map((d) => getDateString(d))),
    ]
      .sort()
      .reverse();

    return NextResponse.json({
      streak: overallStreak,
      streaks: categoryStreaks,
      hasActivityToday,
      totalActivities,
      debug: {
        today: getDateString(new Date()),
        uniqueDates: uniqueActivityDates.slice(0, 10), // Last 10 unique dates
        totalUniquedays: uniqueActivityDates.length,
      },
    });
  } catch (error) {
    console.error("Get streak error:", error);
    return NextResponse.json(
      { error: "Failed to get streak" },
      { status: 500 }
    );
  }
}

// POST - Log a new activity
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { type, action, details } = body;

    if (!type || !action) {
      return NextResponse.json(
        { error: "Type and action are required" },
        { status: 400 }
      );
    }

    // Create activity with today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await prisma.activity.create({
      data: {
        type,
        action,
        details: details || null,
        date: today,
        userId,
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error("Log activity error:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
