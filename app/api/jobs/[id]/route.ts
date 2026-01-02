import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// PUT /api/jobs/[id] - Update a job application
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
    const { company, position, location, type, status, salary, notes, url } =
      body;

    // Check if job exists and belongs to user
    const existingJob = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId: payload.userId as string,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if status changed to track in timeline
    const statusChanged = status && status !== existingJob.status;

    const job = await prisma.jobApplication.update({
      where: { id },
      data: {
        company: company !== undefined ? company : existingJob.company,
        position: position !== undefined ? position : existingJob.position,
        location: location !== undefined ? location : existingJob.location,
        type: type !== undefined ? type : existingJob.type,
        status: status !== undefined ? status : existingJob.status,
        salary: salary !== undefined ? salary || null : existingJob.salary,
        notes: notes !== undefined ? notes || null : existingJob.notes,
        jobUrl: url !== undefined ? url || null : existingJob.jobUrl,
        // Set appliedDate if moving from wishlist to applied
        appliedDate:
          status &&
          status !== "wishlist" &&
          status !== "saved" &&
          !existingJob.appliedDate
            ? new Date()
            : existingJob.appliedDate,
      },
      include: {
        timeline: {
          orderBy: { date: "desc" },
        },
      },
    });

    // Add timeline entry if status changed
    if (statusChanged) {
      await prisma.jobTimeline.create({
        data: {
          status,
          notes: `Status changed to ${status}`,
          jobApplicationId: id,
        },
      });

      // Log activity for status change
      await prisma.activity.create({
        data: {
          type: "job",
          action: "updated",
          details: `${
            company || existingJob.company
          }: Status updated to ${status}`,
          date: new Date(),
          userId: payload.userId as string,
        },
      });
    }

    return NextResponse.json({ job });
  } catch (error) {
    console.error("Failed to update job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete a job application
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

    // Check if job exists and belongs to user
    const existingJob = await prisma.jobApplication.findFirst({
      where: {
        id,
        userId: payload.userId as string,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.jobApplication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
