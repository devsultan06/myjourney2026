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

// GET a single book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const book = await prisma.book.findFirst({
      where: { id, userId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (error) {
    console.error("Get book error:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

// PUT - Update a book
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
    const { title, author, totalPages, currentPage, notes, rating, coverUrl } =
      body;

    // Check if book exists and belongs to user
    const existingBook = await prisma.book.findFirst({
      where: { id, userId },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const newCurrentPage =
      currentPage !== undefined
        ? parseInt(currentPage)
        : existingBook.currentPage;
    const newTotalPages =
      totalPages !== undefined ? parseInt(totalPages) : existingBook.totalPages;
    const status = calculateStatus(newCurrentPage, newTotalPages);

    // Determine dates based on status changes
    let startDate = existingBook.startDate;
    let completedDate = existingBook.completedDate;

    // If starting to read for the first time
    if (existingBook.status === "not-started" && status === "reading") {
      startDate = new Date();
    }

    // If completing the book
    if (status === "completed" && existingBook.status !== "completed") {
      completedDate = new Date();
    }

    // If un-completing (going back to reading)
    if (status !== "completed" && existingBook.status === "completed") {
      completedDate = null;
    }

    const book = await prisma.book.update({
      where: { id },
      data: {
        title: title || existingBook.title,
        author: author || existingBook.author,
        totalPages: newTotalPages,
        currentPage: newCurrentPage,
        status,
        notes: notes !== undefined ? notes : existingBook.notes,
        rating: rating !== undefined ? rating : existingBook.rating,
        coverUrl: coverUrl !== undefined ? coverUrl : existingBook.coverUrl,
        startDate,
        completedDate,
      },
    });

    // Log activity for streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let activityAction = "updated";
    let activityDetails = `Updated "${book.title}"`;

    if (status === "completed" && existingBook.status !== "completed") {
      activityAction = "completed";
      activityDetails = `Finished reading "${book.title}"`;
    } else if (newCurrentPage !== existingBook.currentPage) {
      activityDetails = `Read ${book.title} - page ${newCurrentPage}/${newTotalPages}`;
    }

    await prisma.activity.create({
      data: {
        type: "book",
        action: activityAction,
        details: activityDetails,
        date: today,
        userId,
      },
    });

    return NextResponse.json({ book });
  } catch (error) {
    console.error("Update book error:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}

// DELETE a book
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

    // Check if book exists and belongs to user
    const existingBook = await prisma.book.findFirst({
      where: { id, userId },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Delete book error:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
