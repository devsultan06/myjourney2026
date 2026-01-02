"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Dumbbell,
  Trophy,
  Briefcase,
  Calendar,
  Target,
  Clock,
  Flame,
} from "lucide-react";
import Link from "next/link";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
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

  // LeetCode stats from API
  const [leetcodeStats, setLeetcodeStats] = useState({
    solved: 0,
  });

  // Workout stats from API
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
  });

  // Coding stats from API
  const [codingStats, setCodingStats] = useState({
    totalHours: 0,
  });

  // Streak from API
  const [streakData, setStreakData] = useState({
    streak: 0,
    hasActivityToday: false,
    streaks: {
      coding: 0,
      leetcode: 0,
      reading: 0,
      gym: 0,
    },
  });

  // Recent activities from API
  interface Activity {
    id: string;
    type: string;
    title: string;
    time: string;
  }
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  // Weekly stats
  const [weeklyStats, setWeeklyStats] = useState({
    codingHours: 0,
    leetcodeSolved: 0,
    workouts: 0,
    pagesRead: 0,
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

    const fetchLeetcodeStats = async () => {
      try {
        const response = await fetch("/api/leetcode");
        if (response.ok) {
          const data = await response.json();
          setLeetcodeStats({
            solved: data.stats?.solved || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch leetcode stats:", error);
      }
    };

    const fetchWorkoutStats = async () => {
      try {
        const response = await fetch("/api/exercises");
        if (response.ok) {
          const data = await response.json();
          setWorkoutStats({
            totalWorkouts: data.stats?.totalWorkouts || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch workout stats:", error);
      }
    };

    const fetchCodingStats = async () => {
      try {
        const response = await fetch("/api/coding");
        if (response.ok) {
          const data = await response.json();
          setCodingStats({
            totalHours: data.stats?.totalHours || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch coding stats:", error);
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
            streaks: data.streaks || {
              coding: 0,
              leetcode: 0,
              reading: 0,
              gym: 0,
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch streak:", error);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const response = await fetch("/api/activities");
        if (response.ok) {
          const data = await response.json();
          setRecentActivities(data.activities?.slice(0, 5) || []);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
    };

    const fetchWeeklyStats = async () => {
      try {
        const response = await fetch("/api/activities/weekly");
        if (response.ok) {
          const data = await response.json();
          setWeeklyStats({
            codingHours: data.weeklyStats?.codingHours || 0,
            leetcodeSolved: data.weeklyStats?.leetcodeSolved || 0,
            workouts: data.weeklyStats?.workouts || 0,
            pagesRead: data.weeklyStats?.readingActivities || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch weekly stats:", error);
      }
    };

    fetchBookStats();
    fetchLeetcodeStats();
    fetchWorkoutStats();
    fetchCodingStats();
    fetchStreak();
    fetchRecentActivities();
    fetchWeeklyStats();
  }, []);

  // Mock data for other stats - replace with actual data fetching later
  const dashboardData = {
    stats: {
      booksGoal: 24,
      codingHours: 45,
      workoutsDone: 45,
      leetcodeSolved: 42,
      jobsApplied: 8,
      projectsActive: 2,
      eventsAttended: 4,
    },
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
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
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
        <Link href="/dashboard/coding">
          <StatCard
            title="Coding Hours"
            value={codingStats.totalHours}
            subtitle="Total logged"
            icon={Clock}
            color="green"
          />
        </Link>
        <Link href="/dashboard/gym">
          <StatCard
            title="Workouts Done"
            value={workoutStats.totalWorkouts}
            subtitle="This year"
            icon={Dumbbell}
            color="orange"
          />
        </Link>
        <Link href="/dashboard/leetcode">
          <StatCard
            title="LeetCode Solved"
            value={leetcodeStats.solved}
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
          <div className="grid grid-cols-4 gap-4">
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
              {
                label: "Gym",
                value: streakData.streaks.gym || 0,
                icon: Dumbbell,
                color: "bg-orange-100 text-orange-600",
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
              {recentActivities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity. Start tracking your journey!
                </p>
              ) : (
                recentActivities.map((activity) => {
                  // Get icon based on activity type
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case "book":
                        return BookOpen;
                      case "coding":
                        return Code2;
                      case "leetcode":
                        return Trophy;
                      case "gym":
                        return Dumbbell;
                      case "job":
                        return Briefcase;
                      case "event":
                        return Calendar;
                      default:
                        return Target;
                    }
                  };

                  const getActivityColor = (type: string) => {
                    switch (type) {
                      case "book":
                        return "bg-blue-100 text-blue-600";
                      case "coding":
                        return "bg-green-100 text-green-600";
                      case "leetcode":
                        return "bg-yellow-100 text-yellow-600";
                      case "gym":
                        return "bg-orange-100 text-orange-600";
                      case "job":
                        return "bg-purple-100 text-purple-600";
                      case "event":
                        return "bg-indigo-100 text-indigo-600";
                      default:
                        return "bg-gray-100 text-gray-600";
                    }
                  };

                  const Icon = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.type);

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </motion.div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                This Week
              </CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    Coding
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {weeklyStats.codingHours}h
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600 font-medium">
                    LeetCode
                  </span>
                </div>
                <p className="text-2xl font-bold text-yellow-700">
                  {weeklyStats.leetcodeSolved}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">
                    Workouts
                  </span>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {weeklyStats.workouts}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    Reading
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {weeklyStats.pagesRead}
                </p>
              </div>
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
                label: "Log Workout",
                icon: Dumbbell,
                href: "/dashboard/gym",
                color: "bg-orange-100 text-orange-600",
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
