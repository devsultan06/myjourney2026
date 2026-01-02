import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { parseLocalDate } from "@/lib/utils";

// PUT /api/events/[id] - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      type,
      date,
      location,
      isVirtual,
      description,
      takeaways,
      url,
      attendees,
    } = body;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: payload.userId as string,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingEvent.name,
        type: type !== undefined ? type : existingEvent.type,
        date: date !== undefined ? parseLocalDate(date) : existingEvent.date,
        location: location !== undefined ? location : existingEvent.location,
        isVirtual:
          isVirtual !== undefined ? isVirtual : existingEvent.isVirtual,
        description:
          description !== undefined ? description : existingEvent.description,
        takeaways:
          takeaways !== undefined ? takeaways : existingEvent.takeaways,
        url: url !== undefined ? url || null : existingEvent.url,
        attendees:
          attendees !== undefined
            ? attendees
              ? parseInt(attendees)
              : null
            : existingEvent.attendees,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.event.findFirst({
      where: {
        id,
        userId: payload.userId as string,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
