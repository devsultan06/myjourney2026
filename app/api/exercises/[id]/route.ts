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

// PUT - Update an exercise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if exercise exists and belongs to user
    const existing = await prisma.exercise.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    const updateData: {
      target?: number;
      completed?: number;
      isCompleted?: boolean;
      notes?: string | null;
    } = {};

    if (body.target !== undefined) updateData.target = parseInt(body.target);
    if (body.completed !== undefined)
      updateData.completed = parseInt(body.completed);
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    // Auto-calculate isCompleted if not provided
    if (body.isCompleted !== undefined) {
      updateData.isCompleted = body.isCompleted;
    } else if (
      updateData.completed !== undefined ||
      updateData.target !== undefined
    ) {
      const newCompleted = updateData.completed ?? existing.completed;
      const newTarget = updateData.target ?? existing.target;
      updateData.isCompleted = newCompleted >= newTarget;
    }

    const exercise = await prisma.exercise.update({
      where: { id },
      data: updateData,
    });

    // Log activity for streak tracking
    if (updateData.isCompleted) {
      await prisma.activity.create({
        data: {
          type: "gym",
          action: "completed",
          details: `${exercise.exerciseType}: ${exercise.completed}/${exercise.target}`,
          date: exercise.date,
          userId,
        },
      });
    }

    return NextResponse.json({ exercise });
  } catch (error) {
    console.error("Update exercise error:", error);
    return NextResponse.json(
      { error: "Failed to update exercise" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an exercise
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    // Check if exercise exists and belongs to user
    const existing = await prisma.exercise.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    await prisma.exercise.delete({ where: { id } });

    return NextResponse.json({ message: "Exercise deleted" });
  } catch (error) {
    console.error("Delete exercise error:", error);
    return NextResponse.json(
      { error: "Failed to delete exercise" },
      { status: 500 }
    );
  }
}
