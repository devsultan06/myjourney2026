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

// PUT - Update a coding session
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

    // Check if session exists and belongs to user
    const existing = await prisma.codingSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updateData: {
      date?: Date;
      duration?: number;
      language?: string;
      topic?: string;
      notes?: string | null;
    } = {};

    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.duration !== undefined)
      updateData.duration = parseInt(body.duration);
    if (body.language !== undefined) updateData.language = body.language;
    if (body.topic !== undefined) updateData.topic = body.topic;
    if (body.notes !== undefined) updateData.notes = body.notes || null;

    const session = await prisma.codingSession.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Update coding session error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a coding session
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

    // Check if session exists and belongs to user
    const existing = await prisma.codingSession.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    await prisma.codingSession.delete({ where: { id } });

    return NextResponse.json({ message: "Session deleted" });
  } catch (error) {
    console.error("Delete coding session error:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
