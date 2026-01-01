"use client";

import { useState } from "react";
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
import Select from "@/components/ui/Select";
import ProgressBar from "@/components/ui/ProgressBar";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { Book } from "@/lib/types";
import { generateId } from "@/lib/utils";

// Mock data
const initialBooks: Book[] = [
  {
    id: "1",
    title: "Atomic Habits",
    author: "James Clear",
    totalPages: 320,
    currentPage: 320,
    status: "completed",
    startDate: new Date("2026-01-01"),
    completedDate: new Date("2026-01-15"),
    notes: "Great book on building better habits.",
    rating: 5,
  },
  {
    id: "2",
    title: "The Pragmatic Programmer",
    author: "David Thomas, Andrew Hunt",
    totalPages: 352,
    currentPage: 180,
    status: "reading",
    startDate: new Date("2026-01-16"),
    notes: "Learning a lot about software craftsmanship.",
  },
  {
    id: "3",
    title: "Clean Code",
    author: "Robert C. Martin",
    totalPages: 464,
    currentPage: 0,
    status: "not-started",
    notes: "",
  },
];

export default function ReadingPage() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    totalPages: "",
    currentPage: "",
    status: "not-started",
    notes: "",
  });

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
      status: "not-started",
      notes: "",
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
      status: book.status,
      notes: book.notes,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bookData: Book = {
      id: editingBook?.id || generateId(),
      title: formData.title,
      author: formData.author,
      totalPages: parseInt(formData.totalPages) || 0,
      currentPage: parseInt(formData.currentPage) || 0,
      status: formData.status as Book["status"],
      notes: formData.notes,
      startDate: editingBook?.startDate,
      completedDate: editingBook?.completedDate,
    };

    if (bookData.status === "reading" && !bookData.startDate) {
      bookData.startDate = new Date();
    }
    if (bookData.status === "completed") {
      bookData.completedDate = new Date();
      bookData.currentPage = bookData.totalPages;
    }

    if (editingBook) {
      setBooks(books.map((b) => (b.id === editingBook.id ? bookData : b)));
    } else {
      setBooks([...books, bookData]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setBooks(books.filter((b) => b.id !== id));
  };

  const updateProgress = (id: string, currentPage: number) => {
    setBooks(
      books.map((b) => {
        if (b.id === id) {
          const newStatus: Book["status"] =
            currentPage >= b.totalPages
              ? "completed"
              : currentPage > 0
              ? "reading"
              : "not-started";
          return {
            ...b,
            currentPage,
            status: newStatus,
            completedDate:
              newStatus === "completed" ? new Date() : b.completedDate,
            startDate:
              newStatus === "reading" && !b.startDate
                ? new Date()
                : b.startDate,
          };
        }
        return b;
      })
    );
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
                    {book.status === "reading" && (
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
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            options={[
              { value: "not-started", label: "Not Started" },
              { value: "reading", label: "Currently Reading" },
              { value: "completed", label: "Completed" },
            ]}
          />
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
            <Button type="submit" className="flex-1">
              {editingBook ? "Save Changes" : "Add Book"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
