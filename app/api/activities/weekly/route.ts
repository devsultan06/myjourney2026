import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getAuthCookie } from "@/lib/auth";

// GET /api/activities/weekly - Get weekly stats for the current user
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

    const userId = payload.userId as string;

    // Get start of current week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get coding hours this week
    const codingSessions = await prisma.codingSession.findMany({
      where: {
        userId,
        date: { gte: startOfWeek },
      },
      select: { duration: true },
    });
    const codingMinutes = codingSessions.reduce(
      (acc, s) => acc + s.duration,
      0
    );
    const codingHours = Math.round((codingMinutes / 60) * 10) / 10; // Round to 1 decimal

    // Get LeetCode problems solved this week
    const leetcodeProblems = await prisma.leetCodeProblem.count({
      where: {
        userId,
        status: "solved",
        solvedDate: { gte: startOfWeek },
      },
    });

    // Get workouts completed this week
    const workouts = await prisma.exercise.count({
      where: {
        userId,
        isCompleted: true,
        date: { gte: startOfWeek },
      },
    });

    // Get pages read this week (from books that were updated this week)
    // This is approximate - we track current page but not weekly progress
    // For now, count books that had reading activity this week
    const booksActivity = await prisma.activity.count({
      where: {
        userId,
        type: "book",
        createdAt: { gte: startOfWeek },
      },
    });

    return NextResponse.json({
      weeklyStats: {
        codingHours,
        leetcodeSolved: leetcodeProblems,
        workouts,
        readingActivities: booksActivity,
      },
      weekStart: startOfWeek.toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch weekly stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly stats" },
      { status: 500 }
    );
  }
}
