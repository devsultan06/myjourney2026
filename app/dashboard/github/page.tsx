"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Github,
  GitCommit,
  GitBranch,
  Plus,
  TrendingUp,
  Calendar,
  Trash2,
} from "lucide-react";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import EmptyState from "@/components/ui/EmptyState";
import StreakBadge from "@/components/ui/StreakBadge";
import { GitHubCommit } from "@/lib/types";
import { generateId, formatDate } from "@/lib/utils";

// Generate mock contribution data for the year
const generateContributionData = () => {
  const data: Record<string, number> = {};
  const startDate = new Date("2026-01-01");
  const today = new Date();

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    // Random commits between 0 and 8
    data[dateStr] = Math.floor(Math.random() * 9);
  }
  return data;
};

const contributionData = generateContributionData();

// Mock commits
const initialCommits: GitHubCommit[] = [
  {
    id: "1",
    date: new Date("2026-01-15"),
    repository: "my2026journey",
    message: "feat: Add dashboard components and layout",
    additions: 450,
    deletions: 12,
  },
  {
    id: "2",
    date: new Date("2026-01-15"),
    repository: "my2026journey",
    message: "fix: Resolve responsive issues on mobile",
    additions: 28,
    deletions: 15,
  },
  {
    id: "3",
    date: new Date("2026-01-14"),
    repository: "leetcode-solutions",
    message: "Add solution for Two Sum problem",
    additions: 35,
    deletions: 0,
  },
];

export default function GitHubPage() {
  const [commits, setCommits] = useState<GitHubCommit[]>(initialCommits);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    repository: "",
    message: "",
    additions: "",
    deletions: "",
  });

  const stats = {
    totalCommits: commits.length,
    currentStreak: 15,
    longestStreak: 23,
    totalAdditions: commits.reduce((acc, c) => acc + c.additions, 0),
    totalDeletions: commits.reduce((acc, c) => acc + c.deletions, 0),
    repos: [...new Set(commits.map((c) => c.repository))].length,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commitData: GitHubCommit = {
      id: generateId(),
      date: new Date(formData.date),
      repository: formData.repository,
      message: formData.message,
      additions: parseInt(formData.additions) || 0,
      deletions: parseInt(formData.deletions) || 0,
    };

    setCommits([commitData, ...commits]);
    setIsModalOpen(false);
    setFormData({
      date: new Date().toISOString().split("T")[0],
      repository: "",
      message: "",
      additions: "",
      deletions: "",
    });
  };

  const handleDelete = (id: string) => {
    setCommits(commits.filter((c) => c.id !== id));
  };

  const getContributionColor = (count: number) => {
    if (count === 0) return "bg-gray-100";
    if (count <= 2) return "bg-green-200";
    if (count <= 4) return "bg-green-400";
    if (count <= 6) return "bg-green-500";
    return "bg-green-600";
  };

  // Generate weeks for contribution graph
  const getWeeks = () => {
    const weeks: string[][] = [];
    const startDate = new Date("2026-01-01");
    const today = new Date();
    let currentWeek: string[] = [];

    // Pad first week with empty days
    const startDay = startDate.getDay();
    for (let i = 0; i < startDay; i++) {
      currentWeek.push("");
    }

    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      currentWeek.push(d.toISOString().split("T")[0]);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GitHub Activity</h1>
          <p className="text-gray-600">Track your commits and contributions</p>
        </div>
        <div className="flex items-center gap-4">
          <StreakBadge count={stats.currentStreak} />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Commit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Commits",
            value: stats.totalCommits,
            icon: GitCommit,
          },
          {
            label: "Current Streak",
            value: `${stats.currentStreak} days`,
            icon: TrendingUp,
          },
          { label: "Repositories", value: stats.repos, icon: GitBranch },
          {
            label: "Lines Changed",
            value: `+${stats.totalAdditions} / -${stats.totalDeletions}`,
            icon: Github,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
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

      {/* Contribution Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            Contribution Graph
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-fit pb-2">
            {getWeeks().map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${
                      day
                        ? getContributionColor(contributionData[day] || 0)
                        : "bg-transparent"
                    }`}
                    title={
                      day
                        ? `${day}: ${contributionData[day] || 0} contributions`
                        : ""
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 2, 4, 6, 8].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </Card>

      {/* Recent Commits */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Commits</CardTitle>
        </CardHeader>
        {commits.length === 0 ? (
          <EmptyState
            icon={<GitCommit className="w-8 h-8" />}
            title="No commits tracked"
            description="Add your commits to track your GitHub activity"
            action={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Commit
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {commits.map((commit, index) => (
              <motion.div
                key={commit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                  <GitCommit className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-sm text-gray-900 truncate">
                        {commit.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {commit.repository} • {formatDate(commit.date)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm">
                    <span className="text-green-600">+{commit.additions}</span>
                    <span className="text-red-600">-{commit.deletions}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(commit.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Commit"
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
              label="Repository"
              placeholder="e.g., my-project"
              value={formData.repository}
              onChange={(e) =>
                setFormData({ ...formData, repository: e.target.value })
              }
              required
            />
          </div>
          <Input
            label="Commit Message"
            placeholder="e.g., feat: Add new feature"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Lines Added"
              type="number"
              placeholder="0"
              value={formData.additions}
              onChange={(e) =>
                setFormData({ ...formData, additions: e.target.value })
              }
            />
            <Input
              label="Lines Deleted"
              type="number"
              placeholder="0"
              value={formData.deletions}
              onChange={(e) =>
                setFormData({ ...formData, deletions: e.target.value })
              }
            />
          </div>
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
              Add Commit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
