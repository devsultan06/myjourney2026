"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Trophy,
  Flame,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui";

interface LeaderboardUser {
  id: string;
  username: string;
  avatar: string | null;
  currentStreak: number;
  longestStreak: number;
  totalActivities: number;
  activeToday: boolean;
  isCurrentUser: boolean;
  rank: number;
  joinedAt: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard);
        setTotalUsers(data.totalUsers);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">
            {rank}
          </span>
        );
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return "bg-indigo-50 border-indigo-200";
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return "text-red-500";
    if (streak >= 14) return "text-orange-500";
    if (streak >= 7) return "text-yellow-500";
    if (streak >= 3) return "text-green-500";
    return "text-gray-500";
  };

  const currentUserRank = leaderboard.find((u) => u.isCurrentUser)?.rank;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="w-7 h-7 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-gray-600 mt-1">
          See how you stack up against other users
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-bold text-gray-900">{totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Crown className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Your Rank</p>
              <p className="text-xl font-bold text-gray-900">
                #{currentUserRank || "-"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Top Streak</p>
              <p className="text-xl font-bold text-gray-900">
                {leaderboard[0]?.currentStreak || 0} days
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Today</p>
              <p className="text-xl font-bold text-gray-900">
                {leaderboard.filter((u) => u.activeToday).length}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Leaderboard Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Rankings
            </CardTitle>
          </CardHeader>

          <div className="divide-y divide-gray-100">
            {leaderboard.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No users yet. Be the first to start your streak!
              </div>
            ) : (
              leaderboard.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 border-l-4 transition-colors ${getRankBg(
                    user.rank,
                    user.isCurrentUser
                  )} ${
                    user.isCurrentUser
                      ? "border-l-indigo-500"
                      : "border-l-transparent"
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 flex justify-center">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt={user.username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">
                        {user.username}
                        {user.isCurrentUser && (
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                      {user.activeToday && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {user.totalActivities} total activities
                    </p>
                  </div>

                  {/* Streak Stats */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <div
                        className={`flex items-center gap-1 ${getStreakColor(
                          user.currentStreak
                        )}`}
                      >
                        <Flame className="w-4 h-4" />
                        <span className="font-bold">{user.currentStreak}</span>
                      </div>
                      <p className="text-xs text-gray-500">Current</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-purple-500">
                        <Star className="w-4 h-4" />
                        <span className="font-bold">{user.longestStreak}</span>
                      </div>
                      <p className="text-xs text-gray-500">Best</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-4 text-sm text-gray-500"
      >
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500" />
          <span>30+ days</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>14+ days</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-yellow-500" />
          <span>7+ days</span>
        </div>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-green-500" />
          <span>3+ days</span>
        </div>
      </motion.div>
    </div>
  );
}
