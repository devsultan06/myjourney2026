"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Github,
  Trophy,
  Briefcase,
  Rocket,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  Flame,
} from "lucide-react";
import Link from "next/link";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import ProgressBar from "@/components/ui/ProgressBar";
import StreakBadge from "@/components/ui/StreakBadge";
import { getYearProgress } from "@/lib/utils";

export default function DashboardPage() {
  const yearProgress = getYearProgress();

  // Book stats from API
  const [bookStats, setBookStats] = useState({
    completed: 0,
    total: 0,
    reading: 0,
  });

  // Streak from API
  const [streakData, setStreakData] = useState({
    streak: 0,
    hasActivityToday: false,
    streaks: {
      coding: 0,
      leetcode: 0,
      reading: 0,
    },
  });

  useEffect(() => {
    const fetchBookStats = async () => {
      try {
        const response = await fetch("/api/books");
        if (response.ok) {
          const data = await response.json();
          const books = data.books || [];
          setBookStats({
            completed: books.filter(
              (b: { status: string }) => b.status === "completed"
            ).length,
            total: books.length,
            reading: books.filter(
              (b: { status: string }) => b.status === "reading"
            ).length,
          });
        }
      } catch (error) {
        console.error("Failed to fetch book stats:", error);
      }
    };

    const fetchStreak = async () => {
      try {
        const response = await fetch("/api/streak");
        if (response.ok) {
          const data = await response.json();
          setStreakData({
            streak: data.streak,
            hasActivityToday: data.hasActivityToday,
            streaks: data.streaks || { coding: 0, leetcode: 0, reading: 0 },
          });
        }
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      }
    };

    fetchBookStats();
    fetchStreak();
  }, []);

  // Mock data for other stats - replace with actual data fetching later
  const dashboardData = {
    stats: {
      booksGoal: 24,
      codingHours: 45,
      githubCommits: 127,
      leetcodeSolved: 42,
      jobsApplied: 8,
      projectsActive: 2,
      eventsAttended: 4,
    },
    recentActivity: [
      {
        type: "book",
        title: "Finished 'Atomic Habits'",
        time: "2 hours ago",
        icon: BookOpen,
      },
      {
        type: "leetcode",
        title: "Solved 'Two Sum' (Easy)",
        time: "5 hours ago",
        icon: Trophy,
      },
      {
        type: "github",
        title: "Pushed to my2026journey",
        time: "Yesterday",
        icon: Github,
      },
      {
        type: "job",
        title: "Applied to TechCorp",
        time: "2 days ago",
        icon: Briefcase,
      },
    ],
    upcomingGoals: [
      { title: "Finish current book", progress: 75, dueIn: "3 days" },
      {
        title: "Complete 50 LeetCode problems",
        progress: 84,
        dueIn: "2 weeks",
      },
      { title: "Launch MVP for side project", progress: 60, dueIn: "1 month" },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your journey in 2026.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <StreakBadge
            count={streakData.streak}
            label={streakData.hasActivityToday ? "day streak 🔥" : "day streak"}
          />
        </div>
      </motion.div>

      {/* Year Progress Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">2026 Progress</h2>
                <p className="text-indigo-100">
                  Day {yearProgress.dayOfYear} of {yearProgress.totalDays} •{" "}
                  {yearProgress.weeksRemaining} weeks remaining
                </p>
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-indigo-100">Year completion</span>
                <span className="font-bold">
                  {yearProgress.percentComplete}%
                </span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${yearProgress.percentComplete}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Link href="/dashboard/reading">
          <StatCard
            title="Books Read"
            value={`${bookStats.completed}/${dashboardData.stats.booksGoal}`}
            subtitle={`${bookStats.reading} currently reading`}
            icon={BookOpen}
            color="blue"
          />
        </Link>
        <Link href="/dashboard/github">
          <StatCard
            title="GitHub Commits"
            value={dashboardData.stats.githubCommits}
            subtitle="This year"
            icon={Github}
            color="green"
          />
        </Link>
        <Link href="/dashboard/leetcode">
          <StatCard
            title="LeetCode Solved"
            value={dashboardData.stats.leetcodeSolved}
            subtitle="Problems"
            icon={Trophy}
            color="yellow"
          />
        </Link>
        <Link href="/dashboard/jobs">
          <StatCard
            title="Jobs Applied"
            value={dashboardData.stats.jobsApplied}
            subtitle="Applications"
            icon={Briefcase}
            color="purple"
          />
        </Link>
      </motion.div>

      {/* Streaks Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Current Streaks
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Coding",
                value: streakData.streaks.coding,
                icon: Code2,
                color: "bg-green-100 text-green-600",
              },
              {
                label: "LeetCode",
                value: streakData.streaks.leetcode,
                icon: Trophy,
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                label: "Reading",
                value: streakData.streaks.reading,
                icon: BookOpen,
                color: "bg-blue-100 text-blue-600",
              },
            ].map((streak) => (
              <div
                key={streak.label}
                className="flex flex-col items-center p-4 bg-gray-50 rounded-xl"
              >
                <div className={`p-2 rounded-lg ${streak.color} mb-2`}>
                  <streak.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {streak.value}
                </p>
                <p className="text-sm text-gray-500">{streak.label} days</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <activity.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                Upcoming Goals
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {dashboardData.upcomingGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {goal.title}
                    </p>
                    <span className="text-xs text-gray-500">
                      Due in {goal.dueIn}
                    </span>
                  </div>
                  <ProgressBar value={goal.progress} showLabel />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              {
                label: "Add Book",
                icon: BookOpen,
                href: "/dashboard/reading",
                color: "bg-blue-100 text-blue-600",
              },
              {
                label: "Log Coding",
                icon: Code2,
                href: "/dashboard/coding",
                color: "bg-green-100 text-green-600",
              },
              {
                label: "Add Problem",
                icon: Trophy,
                href: "/dashboard/leetcode",
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                label: "Track Job",
                icon: Briefcase,
                href: "/dashboard/jobs",
                color: "bg-purple-100 text-purple-600",
              },
              {
                label: "New Project",
                icon: Rocket,
                href: "/dashboard/projects",
                color: "bg-red-100 text-red-600",
              },
              {
                label: "Add Event",
                icon: Calendar,
                href: "/dashboard/events",
                color: "bg-indigo-100 text-indigo-600",
              },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className={`p-3 rounded-lg ${action.color} mb-2`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
