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

// PUT - Update a LeetCode problem
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

    // Check if problem exists and belongs to user
    const existing = await prisma.leetCodeProblem.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const updateData: {
      title?: string;
      difficulty?: string;
      status?: string;
      solvedDate?: Date | null;
      timeSpent?: number | null;
      notes?: string | null;
      topics?: string[];
      leetcodeId?: number | null;
      url?: string | null;
    } = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.difficulty !== undefined) updateData.difficulty = body.difficulty;
    if (body.status !== undefined) {
      updateData.status = body.status;
      // Set solvedDate when marking as solved
      if (body.status === "solved" && existing.status !== "solved") {
        updateData.solvedDate = new Date();
      }
    }
    if (body.timeSpent !== undefined)
      updateData.timeSpent = body.timeSpent ? parseInt(body.timeSpent) : null;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    if (body.topics !== undefined) updateData.topics = body.topics;
    if (body.leetcodeId !== undefined)
      updateData.leetcodeId = body.leetcodeId
        ? parseInt(body.leetcodeId)
        : null;
    if (body.url !== undefined) updateData.url = body.url || null;

    const problem = await prisma.leetCodeProblem.update({
      where: { id },
      data: updateData,
    });

    // Log activity if marked as solved
    if (body.status === "solved" && existing.status !== "solved") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.activity.create({
        data: {
          type: "leetcode",
          action: "solved",
          details: `${problem.title} (${problem.difficulty})`,
          date: today,
          userId,
        },
      });
    }

    return NextResponse.json({ problem });
  } catch (error) {
    console.error("Update leetcode problem error:", error);
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a LeetCode problem
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

    // Check if problem exists and belongs to user
    const existing = await prisma.leetCodeProblem.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    await prisma.leetCodeProblem.delete({ where: { id } });

    return NextResponse.json({ message: "Problem deleted" });
  } catch (error) {
    console.error("Delete leetcode problem error:", error);
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 }
    );
  }
}
