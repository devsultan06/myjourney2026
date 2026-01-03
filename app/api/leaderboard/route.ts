import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getAuthCookie } from "@/lib/auth";

// GET /api/leaderboard - Get all users with their streak data
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

    const currentUserId = payload.userId as string;

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Calculate streak for each user
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);

    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        // Get all unique activity dates for this user
        const activities = await prisma.activity.findMany({
          where: { userId: user.id },
          select: { date: true },
          orderBy: { date: "desc" },
        });

        // Get unique dates
        const uniqueDates = [
          ...new Set(
            activities.map((a) => {
              const d = new Date(a.date);
              return `${d.getUTCFullYear()}-${String(
                d.getUTCMonth() + 1
              ).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
            })
          ),
        ].sort((a, b) => b.localeCompare(a));

        // Calculate current streak
        let currentStreak = 0;
        const todayStr = `${today.getUTCFullYear()}-${String(
          today.getUTCMonth() + 1
        ).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;

        const yesterday = new Date(today);
        yesterday.setUTCDate(yesterday.getUTCDate() - 1);
        const yesterdayStr = `${yesterday.getUTCFullYear()}-${String(
          yesterday.getUTCMonth() + 1
        ).padStart(2, "0")}-${String(yesterday.getUTCDate()).padStart(2, "0")}`;

        // Check if user was active today or yesterday to start counting
        if (uniqueDates.length > 0) {
          const hasActivityToday = uniqueDates.includes(todayStr);
          const hasActivityYesterday = uniqueDates.includes(yesterdayStr);

          if (hasActivityToday || hasActivityYesterday) {
            const startDate = hasActivityToday ? today : yesterday;
            const checkDate = new Date(startDate);

            for (const dateStr of uniqueDates) {
              const expectedDateStr = `${checkDate.getUTCFullYear()}-${String(
                checkDate.getUTCMonth() + 1
              ).padStart(2, "0")}-${String(checkDate.getUTCDate()).padStart(
                2,
                "0"
              )}`;

              if (dateStr === expectedDateStr) {
                currentStreak++;
                checkDate.setUTCDate(checkDate.getUTCDate() - 1);
              } else if (dateStr < expectedDateStr) {
                break;
              }
            }
          }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        let prevDate: Date | null = null;

        for (const dateStr of [...uniqueDates].reverse()) {
          const [year, month, day] = dateStr.split("-").map(Number);
          const currentDate = new Date(
            Date.UTC(year, month - 1, day, 12, 0, 0)
          );

          if (prevDate === null) {
            tempStreak = 1;
          } else {
            const diffDays = Math.round(
              (currentDate.getTime() - prevDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            if (diffDays === 1) {
              tempStreak++;
            } else {
              longestStreak = Math.max(longestStreak, tempStreak);
              tempStreak = 1;
            }
          }
          prevDate = currentDate;
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        // Count total activities
        const totalActivities = activities.length;

        // Check if active today
        const activeToday = uniqueDates.includes(todayStr);

        return {
          id: user.id,
          username: user.username,
          avatar: user.avatar,
          currentStreak,
          longestStreak,
          totalActivities,
          activeToday,
          isCurrentUser: user.id === currentUserId,
          joinedAt: user.createdAt,
        };
      })
    );

    // Sort by current streak (descending), then by longest streak, then by total activities
    leaderboardData.sort((a, b) => {
      if (b.currentStreak !== a.currentStreak) {
        return b.currentStreak - a.currentStreak;
      }
      if (b.longestStreak !== a.longestStreak) {
        return b.longestStreak - a.longestStreak;
      }
      return b.totalActivities - a.totalActivities;
    });

    // Add rank
    const rankedData = leaderboardData.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json({
      leaderboard: rankedData,
      totalUsers: rankedData.length,
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
