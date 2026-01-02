import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getAuthCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseLocalDate, getLocalDateString } from "@/lib/utils";
import { DailyTask } from "@prisma/client";

// Helper to get current user ID
async function getCurrentUserId(): Promise<string | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.userId || null;
}

// GET - Fetch tasks for a specific date (defaults to today)
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || getLocalDateString(new Date());
    const taskDate = parseLocalDate(dateStr);

    const tasks = await prisma.dailyTask.findMany({
      where: {
        userId,
        date: taskDate,
      },
      orderBy: [{ isCompleted: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });

    // Get completion stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: DailyTask) => t.isCompleted).length;

    return NextResponse.json({
      tasks,
      stats: {
        total: totalTasks,
        completed: completedTasks,
        remaining: totalTasks - completedTasks,
        percentComplete:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { title, date } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 }
      );
    }

    const taskDate = date
      ? parseLocalDate(date)
      : parseLocalDate(getLocalDateString(new Date()));

    // Get the highest order for today's tasks
    const lastTask = await prisma.dailyTask.findFirst({
      where: { userId, date: taskDate },
      orderBy: { order: "desc" },
    });

    const task = await prisma.dailyTask.create({
      data: {
        title: title.trim(),
        date: taskDate,
        order: (lastTask?.order ?? -1) + 1,
        userId,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PUT - Update a task (toggle completion or update title)
export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, isCompleted } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Verify task belongs to user
    const existingTask = await prisma.dailyTask.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const task = await prisma.dailyTask.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(isCompleted !== undefined && { isCompleted }),
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Verify task belongs to user
    const existingTask = await prisma.dailyTask.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.dailyTask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
