"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Plus,
  Clock,
  Calendar,
  Flame,
  BarChart3,
  Trash2,
  Edit,
} from "lucide-react";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import StreakBadge from "@/components/ui/StreakBadge";
import { CodingSession } from "@/lib/types";
import { generateId, formatDate } from "@/lib/utils";

// Mock data
const initialSessions: CodingSession[] = [
  {
    id: "1",
    date: new Date("2026-01-15"),
    duration: 120,
    language: "TypeScript",
    topic: "Building My2026Journey dashboard",
    notes: "Worked on the main dashboard layout and components.",
  },
  {
    id: "2",
    date: new Date("2026-01-14"),
    duration: 90,
    language: "Python",
    topic: "Machine learning basics",
    notes: "Completed intro to pandas and numpy.",
  },
  {
    id: "3",
    date: new Date("2026-01-13"),
    duration: 60,
    language: "JavaScript",
    topic: "React hooks deep dive",
    notes: "useCallback and useMemo optimization.",
  },
];

const languages = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "Swift",
  "Kotlin",
  "Other",
];

export default function CodingPage() {
  const [sessions, setSessions] = useState<CodingSession[]>(initialSessions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<CodingSession | null>(
    null
  );
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    duration: "",
    language: "TypeScript",
    topic: "",
    notes: "",
  });

  const stats = {
    totalHours: Math.round(
      sessions.reduce((acc, s) => acc + s.duration, 0) / 60
    ),
    totalSessions: sessions.length,
    streak: 12, // Mock streak
    avgSessionLength: sessions.length
      ? Math.round(
          sessions.reduce((acc, s) => acc + s.duration, 0) / sessions.length
        )
      : 0,
    topLanguage:
      sessions.length > 0
        ? Object.entries(
            sessions.reduce((acc, s) => {
              acc[s.language] = (acc[s.language] || 0) + s.duration;
              return acc;
            }, {} as Record<string, number>)
          ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
        : "N/A",
  };

  // Group sessions by week for the chart
  const languageBreakdown = sessions.reduce((acc, s) => {
    acc[s.language] = (acc[s.language] || 0) + s.duration;
    return acc;
  }, {} as Record<string, number>);

  const openAddModal = () => {
    setEditingSession(null);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      duration: "",
      language: "TypeScript",
      topic: "",
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (session: CodingSession) => {
    setEditingSession(session);
    setFormData({
      date: new Date(session.date).toISOString().split("T")[0],
      duration: session.duration.toString(),
      language: session.language,
      topic: session.topic,
      notes: session.notes,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sessionData: CodingSession = {
      id: editingSession?.id || generateId(),
      date: new Date(formData.date),
      duration: parseInt(formData.duration) || 0,
      language: formData.language,
      topic: formData.topic,
      notes: formData.notes,
    };

    if (editingSession) {
      setSessions(
        sessions.map((s) => (s.id === editingSession.id ? sessionData : s))
      );
    } else {
      setSessions([sessionData, ...sessions]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      TypeScript: "bg-blue-100 text-blue-700",
      JavaScript: "bg-yellow-100 text-yellow-700",
      Python: "bg-green-100 text-green-700",
      Go: "bg-cyan-100 text-cyan-700",
      Rust: "bg-orange-100 text-orange-700",
      Java: "bg-red-100 text-red-700",
      "C++": "bg-purple-100 text-purple-700",
    };
    return colors[language] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coding Practice</h1>
          <p className="text-gray-600">
            Track your coding sessions and progress
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StreakBadge count={stats.streak} />
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Log Session
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Hours",
            value: `${stats.totalHours}h`,
            icon: Clock,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Sessions",
            value: stats.totalSessions,
            icon: Calendar,
            color: "bg-green-50 text-green-600",
          },
          {
            label: "Day Streak",
            value: stats.streak,
            icon: Flame,
            color: "bg-orange-50 text-orange-600",
          },
          {
            label: "Top Language",
            value: stats.topLanguage,
            icon: Code2,
            color: "bg-purple-50 text-purple-600",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Language Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gray-500" />
            Language Breakdown
          </CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {Object.entries(languageBreakdown)
            .sort((a, b) => b[1] - a[1])
            .map(([language, minutes]) => {
              const percentage = Math.round(
                (minutes / sessions.reduce((acc, s) => acc + s.duration, 0)) *
                  100
              );
              return (
                <div key={language}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {language}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDuration(minutes)} ({percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        {sessions.length === 0 ? (
          <EmptyState
            icon={<Code2 className="w-8 h-8" />}
            title="No coding sessions yet"
            description="Log your first coding session to start tracking your progress"
            action={
              <Button onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Log Session
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {session.topic}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDate(session.date)}
                      </p>
                    </div>
                    <Badge className={getLanguageColor(session.language)}>
                      {session.language}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(session.duration)}
                    </span>
                  </div>
                  {session.notes && (
                    <p className="mt-2 text-sm text-gray-600">
                      {session.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(session)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(session.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSession ? "Edit Session" : "Log Coding Session"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
            <Input
              label="Duration (minutes)"
              type="number"
              placeholder="e.g., 60"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              required
            />
          </div>
          <Select
            label="Language"
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value })
            }
            options={languages.map((l) => ({ value: l, label: l }))}
          />
          <Input
            label="Topic / What did you work on?"
            placeholder="e.g., Built a REST API"
            value={formData.topic}
            onChange={(e) =>
              setFormData({ ...formData, topic: e.target.value })
            }
            required
          />
          <Textarea
            label="Notes"
            placeholder="Any notes about this session..."
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
              {editingSession ? "Save Changes" : "Log Session"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
