import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET /api/jobs - Get all job applications for the current user
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

    const jobs = await prisma.jobApplication.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: "desc" },
      include: {
        timeline: {
          orderBy: { date: "desc" },
        },
      },
    });

    // Calculate stats
    const stats = {
      total: jobs.length,
      active: jobs.filter((j) => !["rejected", "accepted"].includes(j.status))
        .length,
      interviews: jobs.filter(
        (j) => j.status === "interview" || j.status === "interviewing"
      ).length,
      offers: jobs.filter((j) => j.status === "offer").length,
      applied: jobs.filter((j) => j.status === "applied").length,
    };

    return NextResponse.json({ jobs, stats });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job application
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
    const { company, position, location, type, status, salary, notes, url } =
      body;

    if (!company || !position || !location) {
      return NextResponse.json(
        { error: "Company, position, and location are required" },
        { status: 400 }
      );
    }

    const job = await prisma.jobApplication.create({
      data: {
        company,
        position,
        location,
        type: type || "remote",
        status: status || "applied",
        appliedDate:
          status !== "wishlist" && status !== "saved" ? new Date() : null,
        salary: salary || null,
        notes: notes || null,
        jobUrl: url || null,
        userId: payload.userId as string,
      },
      include: {
        timeline: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "job",
        action: "created",
        details: `Applied to ${position} at ${company}`,
        date: new Date(),
        userId: payload.userId as string,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Failed to create job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}
