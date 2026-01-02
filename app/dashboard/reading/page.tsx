"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Star,
  Edit,
  Trash2,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: "not-started" | "reading" | "completed";
  startDate?: string | null;
  completedDate?: string | null;
  notes?: string | null;
  rating?: number | null;
  coverUrl?: string | null;
}

export default function ReadingPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    totalPages: "",
    currentPage: "",
    notes: "",
    coverUrl: "",
  });

  // Fetch books from API
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books");
      if (response.ok) {
        const data = await response.json();
        setBooks(data.books);
      }
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || book.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: books.length,
    completed: books.filter((b) => b.status === "completed").length,
    reading: books.filter((b) => b.status === "reading").length,
    notStarted: books.filter((b) => b.status === "not-started").length,
    totalPages: books.reduce((acc, b) => acc + b.currentPage, 0),
  };

  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: "",
      author: "",
      totalPages: "",
      currentPage: "",
      notes: "",
      coverUrl: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      totalPages: book.totalPages.toString(),
      currentPage: book.currentPage.toString(),
      notes: book.notes || "",
      coverUrl: book.coverUrl || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingBook) {
        // Update existing book
        const response = await fetch(`/api/books/${editingBook.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            author: formData.author,
            totalPages: formData.totalPages,
            currentPage: formData.currentPage,
            notes: formData.notes,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBooks(books.map((b) => (b.id === editingBook.id ? data.book : b)));
        }
      } else {
        // Create new book
        const response = await fetch("/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            author: formData.author,
            totalPages: formData.totalPages,
            currentPage: formData.currentPage || "0",
            notes: formData.notes,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setBooks([data.book, ...books]);
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save book:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBooks(books.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete book:", error);
    }
  };

  const updateProgress = async (id: string, currentPage: number) => {
    // Optimistically update UI
    setBooks(
      books.map((b) => {
        if (b.id === id) {
          const newStatus: Book["status"] =
            currentPage >= b.totalPages
              ? "completed"
              : currentPage > 0
              ? "reading"
              : "not-started";
          return { ...b, currentPage, status: newStatus };
        }
        return b;
      })
    );

    // Update in database
    try {
      await fetch(`/api/books/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPage }),
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
      fetchBooks();
    }
  };

  const getStatusBadge = (status: Book["status"]) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "reading":
        return <Badge variant="info">Reading</Badge>;
      default:
        return <Badge variant="default">Not Started</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reading List</h1>
          <p className="text-gray-600">Track your reading goals for 2026</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Books", value: stats.total, color: "bg-gray-100" },
          { label: "Completed", value: stats.completed, color: "bg-green-100" },
          { label: "Reading", value: stats.reading, color: "bg-blue-100" },
          {
            label: "Pages Read",
            value: stats.totalPages.toLocaleString(),
            color: "bg-purple-100",
          },
        ].map((stat) => (
          <Card key={stat.label} className={stat.color} padding="sm">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="reading">Reading</option>
              <option value="completed">Completed</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Books List */}
      {filteredBooks.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No books found"
          description={
            searchQuery || filterStatus !== "all"
              ? "Try adjusting your search or filter"
              : "Add your first book to start tracking your reading"
          }
          action={
            !searchQuery && filterStatus === "all" ? (
              <Button onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Book
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Book Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-indigo-600" />
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-500">{book.author}</p>
                      </div>
                      {getStatusBadge(book.status)}
                    </div>

                    {/* Progress */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {book.currentPage} / {book.totalPages} pages
                        </span>
                        <span className="text-gray-500">
                          {Math.round(
                            (book.currentPage / book.totalPages) * 100
                          )}
                          %
                        </span>
                      </div>
                      <ProgressBar
                        value={book.currentPage}
                        max={book.totalPages}
                        color={book.status === "completed" ? "green" : "indigo"}
                      />
                    </div>

                    {/* Rating */}
                    {book.rating && (
                      <div className="mt-2 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < book.rating!
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {book.status !== "completed" && (
                      <input
                        type="number"
                        value={book.currentPage}
                        onChange={(e) =>
                          updateProgress(book.id, parseInt(e.target.value) || 0)
                        }
                        max={book.totalPages}
                        min={0}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(book)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(book.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {book.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{book.notes}</p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? "Edit Book" : "Add New Book"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Book Title"
            placeholder="Enter book title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <Input
            label="Author"
            placeholder="Enter author name"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Pages"
              type="number"
              placeholder="e.g., 300"
              value={formData.totalPages}
              onChange={(e) =>
                setFormData({ ...formData, totalPages: e.target.value })
              }
              required
            />
            <Input
              label="Current Page"
              type="number"
              placeholder="e.g., 50"
              value={formData.currentPage}
              onChange={(e) =>
                setFormData({ ...formData, currentPage: e.target.value })
              }
            />
          </div>
          <p className="text-xs text-gray-500">
            Status is automatically set based on your progress: 0 pages = Not
            Started, 1+ pages = Reading, All pages = Completed
          </p>
          <Textarea
            label="Notes"
            placeholder="Add any notes about this book..."
            rows={3}
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSaving}>
              {editingBook ? "Save Changes" : "Add Book"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
