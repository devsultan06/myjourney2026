"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Plus,
  Filter,
  Clock,
  Calendar,
  Target,
  CheckCircle2,
  Circle,
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
import ProgressBar from "@/components/ui/ProgressBar";
import { formatDate } from "@/lib/utils";

interface LeetCodeProblem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  status: "not-started" | "attempted" | "solved";
  solvedDate?: string | null;
  timeSpent?: number | null;
  notes?: string | null;
  topics: string[];
  leetcodeId?: number | null;
  url?: string | null;
}

const topicsList = [
  "Array",
  "String",
  "Hash Table",
  "Dynamic Programming",
  "Math",
  "Sorting",
  "Greedy",
  "Depth-First Search",
  "Binary Search",
  "Tree",
  "Breadth-First Search",
  "Two Pointers",
  "Stack",
  "Linked List",
  "Graph",
];

export default function LeetCodePage() {
  const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProblem, setEditingProblem] = useState<LeetCodeProblem | null>(
    null
  );
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [leetcodeStreak, setLeetcodeStreak] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "easy",
    status: "solved",
    timeSpent: "",
    notes: "",
    topics: [] as string[],
  });

  // Fetch problems from API
  useEffect(() => {
    fetchProblems();
    fetchStreak();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch("/api/leetcode");
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems);
      }
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await fetch("/api/streak");
      if (response.ok) {
        const data = await response.json();
        setLeetcodeStreak(data.streaks?.leetcode || 0);
      }
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesDifficulty =
      filterDifficulty === "all" || p.difficulty === filterDifficulty;
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesDifficulty && matchesStatus;
  });

  const stats = {
    total: problems.filter((p) => p.status === "solved").length,
    easy: problems.filter(
      (p) => p.status === "solved" && p.difficulty === "easy"
    ).length,
    medium: problems.filter(
      (p) => p.status === "solved" && p.difficulty === "medium"
    ).length,
    hard: problems.filter(
      (p) => p.status === "solved" && p.difficulty === "hard"
    ).length,
    streak: leetcodeStreak,
    totalTime: problems.reduce((acc, p) => acc + (p.timeSpent || 0), 0),
  };

  const goals = {
    easy: { current: stats.easy, target: 100 },
    medium: { current: stats.medium, target: 150 },
    hard: { current: stats.hard, target: 50 },
  };

  const openAddModal = () => {
    setEditingProblem(null);
    setFormData({
      title: "",
      difficulty: "easy",
      status: "solved",
      timeSpent: "",
      notes: "",
      topics: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (problem: LeetCodeProblem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      difficulty: problem.difficulty,
      status: problem.status,
      timeSpent: problem.timeSpent?.toString() || "",
      notes: problem.notes || "",
      topics: problem.topics,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingProblem) {
        // Update existing problem
        const response = await fetch(`/api/leetcode/${editingProblem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            difficulty: formData.difficulty,
            status: formData.status,
            timeSpent: formData.timeSpent,
            notes: formData.notes,
            topics: formData.topics,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setProblems(
            problems.map((p) => (p.id === editingProblem.id ? data.problem : p))
          );
          await fetchStreak();
        }
      } else {
        // Create new problem
        const response = await fetch("/api/leetcode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formData.title,
            difficulty: formData.difficulty,
            status: formData.status,
            timeSpent: formData.timeSpent,
            notes: formData.notes,
            topics: formData.topics,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setProblems([data.problem, ...problems]);
          await fetchStreak();
        }
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save problem:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;

    try {
      const response = await fetch(`/api/leetcode/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setProblems(problems.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete problem:", error);
    }
  };

  const getDifficultyBadge = (difficulty: LeetCodeProblem["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return <Badge variant="success">Easy</Badge>;
      case "medium":
        return <Badge variant="warning">Medium</Badge>;
      case "hard":
        return <Badge variant="error">Hard</Badge>;
    }
  };

  const getStatusIcon = (status: LeetCodeProblem["status"]) => {
    switch (status) {
      case "solved":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "attempted":
        return <Circle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            LeetCode Progress
          </h1>
          <p className="text-gray-600">Track your problem solving journey</p>
        </div>
        <div className="flex items-center gap-4">
          <StreakBadge count={stats.streak} />
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Problem
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-600 font-medium">Easy</p>
          <p className="text-3xl font-bold text-green-700">{stats.easy}</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium">Medium</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.medium}</p>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <p className="text-sm text-red-600 font-medium">Hard</p>
          <p className="text-3xl font-bold text-red-700">{stats.hard}</p>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <p className="text-sm text-indigo-600 font-medium">Total Solved</p>
          <p className="text-3xl font-bold text-indigo-700">{stats.total}</p>
        </Card>
      </div>

      {/* Progress Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-500" />
            2026 Goals
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {Object.entries(goals).map(([difficulty, goal]) => (
            <div key={difficulty}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {difficulty}
                </span>
                <span className="text-sm text-gray-500">
                  {goal.current} / {goal.target}
                </span>
              </div>
              <ProgressBar
                value={goal.current}
                max={goal.target}
                color={
                  difficulty === "easy"
                    ? "green"
                    : difficulty === "medium"
                    ? "yellow"
                    : "red"
                }
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="not-started">Not Started</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Problems List */}
      <Card>
        <CardHeader>
          <CardTitle>Problems ({filteredProblems.length})</CardTitle>
        </CardHeader>
        {filteredProblems.length === 0 ? (
          <EmptyState
            icon={<Trophy className="w-8 h-8" />}
            title="No problems found"
            description="Add problems or adjust your filters"
            action={
              <Button onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Problem
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredProblems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {getStatusIcon(problem.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {problem.title}
                    </h4>
                    {getDifficultyBadge(problem.difficulty)}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {problem.timeSpent && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {problem.timeSpent}m
                      </span>
                    )}
                    {problem.solvedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(new Date(problem.solvedDate))}
                      </span>
                    )}
                  </div>
                  {problem.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {problem.topics.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(problem)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(problem.id)}
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
        title={editingProblem ? "Edit Problem" : "Add Problem"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Problem Title"
            placeholder="e.g., Two Sum"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Difficulty"
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              options={[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              options={[
                { value: "solved", label: "Solved" },
                { value: "attempted", label: "Attempted" },
                { value: "not-started", label: "Not Started" },
              ]}
            />
            <Input
              label="Time Spent (min)"
              type="number"
              placeholder="e.g., 30"
              value={formData.timeSpent}
              onChange={(e) =>
                setFormData({ ...formData, timeSpent: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topics
            </label>
            <div className="flex flex-wrap gap-2">
              {topicsList.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => {
                    const newTopics = formData.topics.includes(topic)
                      ? formData.topics.filter((t) => t !== topic)
                      : [...formData.topics, topic];
                    setFormData({ ...formData, topics: newTopics });
                  }}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    formData.topics.includes(topic)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            label="Notes"
            placeholder="Solution approach, key insights..."
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
              {editingProblem ? "Save Changes" : "Add Problem"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
