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

// GET all coding sessions for current user
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const sessions = await prisma.codingSession.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    // Calculate stats
    const totalMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalHours = Math.round(totalMinutes / 60);

    // Language breakdown
    const languageStats: Record<string, number> = {};
    sessions.forEach((s) => {
      languageStats[s.language] = (languageStats[s.language] || 0) + s.duration;
    });

    const stats = {
      totalSessions: sessions.length,
      totalMinutes,
      totalHours,
      avgSessionLength: sessions.length
        ? Math.round(totalMinutes / sessions.length)
        : 0,
      languageStats,
    };

    return NextResponse.json({ sessions, stats });
  } catch (error) {
    console.error("Get coding sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// POST - Create a new coding session
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { date, duration, language, topic, notes } = body;

    if (!duration || !language || !topic) {
      return NextResponse.json(
        { error: "Duration, language, and topic are required" },
        { status: 400 }
      );
    }

    const sessionDate = date ? new Date(date) : new Date();

    const session = await prisma.codingSession.create({
      data: {
        date: sessionDate,
        duration: parseInt(duration),
        language,
        topic,
        notes: notes || null,
        userId,
      },
    });

    // Log activity for streak tracking
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.activity.create({
      data: {
        type: "coding",
        action: "logged",
        details: `${duration} min of ${language}: ${topic}`,
        date: today,
        userId,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Create coding session error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
