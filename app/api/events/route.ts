import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { parseLocalDate } from "@/lib/utils";

// GET /api/events - Get all events for the current user
export async function GET() {
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

    const events = await prisma.event.findMany({
      where: { userId: payload.userId as string },
      orderBy: { date: "desc" },
    });

    // Calculate stats
    const stats = {
      total: events.length,
      conferences: events.filter((e) => e.type === "conference").length,
      meetups: events.filter((e) => e.type === "meetup").length,
      workshops: events.filter((e) => e.type === "workshop").length,
      hackathons: events.filter((e) => e.type === "hackathon").length,
      webinars: events.filter((e) => e.type === "webinar").length,
    };

    return NextResponse.json({ events, stats });
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
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

    if (!name || !type || !date || !location) {
      return NextResponse.json(
        { error: "Name, type, date, and location are required" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        name,
        type,
        date: parseLocalDate(date),
        location,
        isVirtual: isVirtual || false,
        description: description || null,
        takeaways: takeaways || null,
        url: url || null,
        attendees: attendees ? parseInt(attendees) : null,
        userId: payload.userId as string,
      },
    });

    // Log activity for event tracking
    await prisma.activity.create({
      data: {
        type: "event",
        action: "created",
        details: `Added event: ${name}`,
        date: new Date(),
        userId: payload.userId as string,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
