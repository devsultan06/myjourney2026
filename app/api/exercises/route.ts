import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseLocalDate, getLocalToday, getLocalDateString } from "@/lib/utils";

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.userId || null;
}

// GET all exercises for current user (optionally filter by date range)
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const whereClause: {
      userId: string;
      date?: { gte?: Date; lte?: Date };
    } = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    // Calculate stats
    const today = getLocalToday();
    const todayStr = getLocalDateString(today);

    const totalWorkouts = exercises.filter((e) => e.isCompleted).length;
    const todayExercises = exercises.filter((e) => {
      return getLocalDateString(new Date(e.date)) === todayStr;
    });

    return NextResponse.json({
      exercises,
      stats: {
        totalWorkouts,
        todayCompleted: todayExercises.filter((e) => e.isCompleted).length,
        todayExercises: todayExercises.length,
      },
    });
  } catch (error) {
    console.error("Get exercises error:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
}

// POST - Create or update an exercise for a specific date
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { date, exerciseType, target, completed, isCompleted, notes } = body;

    if (!exerciseType || target === undefined) {
      return NextResponse.json(
        { error: "Exercise type and target are required" },
        { status: 400 }
      );
    }

    // Parse date properly - if date string is YYYY-MM-DD, parse as local date
    let exerciseDate: Date;
    if (date) {
      // Parse YYYY-MM-DD as local date to avoid timezone issues
      exerciseDate = parseLocalDate(date);
      console.log("DEBUG: Received date string:", date);
      console.log("DEBUG: Parsed as:", exerciseDate.toISOString());
      console.log(
        "DEBUG: Local date parts:",
        exerciseDate.getFullYear(),
        exerciseDate.getMonth() + 1,
        exerciseDate.getDate()
      );
    } else {
      exerciseDate = getLocalToday();
      console.log("DEBUG: Using today:", exerciseDate.toISOString());
    }

    // Upsert - create or update if exists for same date and type
    const exercise = await prisma.exercise.upsert({
      where: {
        userId_date_exerciseType: {
          userId,
          date: exerciseDate,
          exerciseType,
        },
      },
      update: {
        target: parseInt(target),
        completed: parseInt(completed) || 0,
        isCompleted: isCompleted ?? parseInt(completed) >= parseInt(target),
        notes: notes || null,
      },
      create: {
        date: exerciseDate,
        exerciseType,
        target: parseInt(target),
        completed: parseInt(completed) || 0,
        isCompleted: isCompleted ?? parseInt(completed) >= parseInt(target),
        notes: notes || null,
        userId,
      },
    });

    // Log activity for streak tracking
    await prisma.activity.create({
      data: {
        type: "gym",
        action: isCompleted ? "completed" : "logged",
        details: `${exerciseType}: ${completed}/${target}`,
        date: exerciseDate,
        userId,
      },
    });

    return NextResponse.json({ exercise }, { status: 201 });
  } catch (error) {
    console.error("Create exercise error:", error);
    return NextResponse.json(
      { error: "Failed to create exercise" },
      { status: 500 }
    );
  }
}
