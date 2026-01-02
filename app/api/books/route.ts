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

// Helper to calculate status based on pages
function calculateStatus(currentPage: number, totalPages: number): string {
  if (currentPage === 0) return "not-started";
  if (currentPage >= totalPages) return "completed";
  return "reading";
}

// GET all books for current user
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const books = await prisma.book.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ books });
  } catch (error) {
    console.error("Get books error:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

// POST - Create a new book
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      author,
      totalPages,
      currentPage = 0,
      notes,
      coverUrl,
    } = body;

    if (!title || !author || !totalPages) {
      return NextResponse.json(
        { error: "Title, author, and total pages are required" },
        { status: 400 }
      );
    }

    const status = calculateStatus(currentPage, totalPages);

    const book = await prisma.book.create({
      data: {
        title,
        author,
        totalPages: parseInt(totalPages),
        currentPage: parseInt(currentPage),
        status,
        notes: notes || null,
        coverUrl: coverUrl || null,
        startDate: currentPage > 0 ? new Date() : null,
        completedDate: status === "completed" ? new Date() : null,
        userId,
      },
    });

    // Log activity for streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.activity.create({
      data: {
        type: "book",
        action: "created",
        details: `Added "${title}" to reading list`,
        date: today,
        userId,
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error("Create book error:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
