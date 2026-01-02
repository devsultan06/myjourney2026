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

// GET all LeetCode problems for current user
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const problems = await prisma.leetCodeProblem.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    // Calculate stats
    const stats = {
      total: problems.length,
      solved: problems.filter((p) => p.status === "solved").length,
      attempted: problems.filter((p) => p.status === "attempted").length,
      easy: problems.filter(
        (p) => p.difficulty === "easy" && p.status === "solved"
      ).length,
      medium: problems.filter(
        (p) => p.difficulty === "medium" && p.status === "solved"
      ).length,
      hard: problems.filter(
        (p) => p.difficulty === "hard" && p.status === "solved"
      ).length,
    };

    return NextResponse.json({ problems, stats });
  } catch (error) {
    console.error("Get leetcode problems error:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

// POST - Create a new LeetCode problem
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      difficulty,
      status = "solved",
      timeSpent,
      notes,
      topics = [],
      leetcodeId,
      url,
    } = body;

    if (!title || !difficulty) {
      return NextResponse.json(
        { error: "Title and difficulty are required" },
        { status: 400 }
      );
    }

    const problem = await prisma.leetCodeProblem.create({
      data: {
        title,
        difficulty,
        status,
        solvedDate: status === "solved" ? new Date() : null,
        timeSpent: timeSpent ? parseInt(timeSpent) : null,
        notes: notes || null,
        topics,
        leetcodeId: leetcodeId ? parseInt(leetcodeId) : null,
        url: url || null,
        userId,
      },
    });

    // Log activity for streak tracking
    if (status === "solved") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.activity.create({
        data: {
          type: "leetcode",
          action: "solved",
          details: `${title} (${difficulty})`,
          date: today,
          userId,
        },
      });
    }

    return NextResponse.json({ problem }, { status: 201 });
  } catch (error) {
    console.error("Create leetcode problem error:", error);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}
