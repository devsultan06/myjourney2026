"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dumbbell,
  Check,
  Flame,
  TrendingUp,
  Calendar,
  Target,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import StreakBadge from "@/components/ui/StreakBadge";

interface Exercise {
  id: string;
  date: string;
  exerciseType: string;
  target: number;
  completed: number;
  isCompleted: boolean;
  notes?: string | null;
}

interface DailyExercise {
  type: string;
  target: number;
  icon: string;
}

// Default exercises to track daily
const defaultExercises: DailyExercise[] = [
  { type: "Push-ups", target: 20, icon: "💪" },
];

export default function GymPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [gymStreak, setGymStreak] = useState(0);
  const [formData, setFormData] = useState({
    exerciseType: "Push-ups",
    target: "20",
    completed: "",
  });

  // Fetch exercises
  useEffect(() => {
    fetchExercises();
    fetchStreak();
  }, []);

  const fetchExercises = async () => {
    try {
      // Get exercises for this year
      const startDate = new Date("2026-01-01").toISOString().split("T")[0];
      const response = await fetch(`/api/exercises?startDate=${startDate}`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises);
      }
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreak = async () => {
    try {
      const response = await fetch("/api/streak");
      if (response.ok) {
        const data = await response.json();
        setGymStreak(data.streaks?.gym || 0);
      }
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    }
  };

  // Get exercises for a specific date
  const getExercisesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return exercises.filter((e) => e.date.split("T")[0] === dateStr);
  };

  // Check if date has completed exercise
  const hasCompletedExercise = (date: Date) => {
    const dayExercises = getExercisesForDate(date);
    return dayExercises.some((e) => e.isCompleted);
  };

  // Toggle today's exercise completion
  const toggleTodayExercise = async (exerciseType: string, target: number) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = exercises.find(
      (e) => e.date.split("T")[0] === today && e.exerciseType === exerciseType
    );

    setIsSaving(true);
    try {
      if (existing?.isCompleted) {
        // Unmark as complete
        await fetch(`/api/exercises/${existing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: 0, isCompleted: false }),
        });
      } else {
        // Mark as complete
        await fetch("/api/exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            exerciseType,
            target,
            completed: target,
            isCompleted: true,
          }),
        });
      }
      await fetchExercises();
      await fetchStreak();
    } catch (error) {
      console.error("Failed to update exercise:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Add custom exercise
  const handleAddExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      await fetch("/api/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          exerciseType: formData.exerciseType,
          target: formData.target,
          completed: formData.completed || formData.target,
          isCompleted: true,
        }),
      });
      await fetchExercises();
      await fetchStreak();
      setIsModalOpen(false);
      setFormData({ exerciseType: "Push-ups", target: "20", completed: "" });
    } catch (error) {
      console.error("Failed to add exercise:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty days for alignment
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Navigate months
  const navigateMonth = (direction: number) => {
    setSelectedDate(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + direction,
        1
      )
    );
  };

  // Calculate stats
  const stats = {
    totalWorkouts: exercises.filter((e) => e.isCompleted).length,
    thisMonth: exercises.filter((e) => {
      const date = new Date(e.date);
      const now = new Date();
      return (
        e.isCompleted &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length,
    streak: gymStreak,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayExercises = getExercisesForDate(today);
  const hasTodayPushups = todayExercises.some(
    (e) => e.exerciseType === "Push-ups" && e.isCompleted
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gym Tracker</h1>
          <p className="text-gray-600">
            Track your daily exercises and build consistency
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StreakBadge count={stats.streak} label="day streak" />
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Exercise
          </Button>
        </div>
      </div>

      {/* Today's Exercise Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Today&apos;s Challenge</h2>
                <p className="text-orange-100">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {defaultExercises.map((exercise) => (
                <button
                  key={exercise.type}
                  onClick={() =>
                    toggleTodayExercise(exercise.type, exercise.target)
                  }
                  disabled={isSaving}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
                    hasTodayPushups
                      ? "bg-white text-orange-600"
                      : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                >
                  <span className="text-2xl">{exercise.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold">{exercise.type}</p>
                    <p className="text-sm opacity-80">{exercise.target} reps</p>
                  </div>
                  {hasTodayPushups && (
                    <Check className="w-6 h-6 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Current Streak",
            value: stats.streak,
            icon: Flame,
            color: "bg-orange-100 text-orange-600",
            suffix: " days",
          },
          {
            label: "This Month",
            value: stats.thisMonth,
            icon: Calendar,
            color: "bg-blue-100 text-blue-600",
            suffix: " workouts",
          },
          {
            label: "Total Workouts",
            value: stats.totalWorkouts,
            icon: TrendingUp,
            color: "bg-green-100 text-green-600",
            suffix: "",
          },
          {
            label: "Daily Goal",
            value: "20",
            icon: Target,
            color: "bg-purple-100 text-purple-600",
            suffix: " push-ups",
          },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                  <span className="text-sm font-normal text-gray-500">
                    {stat.suffix}
                  </span>
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      {/* Calendar View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                Workout Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(-1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium text-gray-700 min-w-[140px] text-center">
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth(1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {generateCalendarDays().map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isToday = date.toDateString() === new Date().toDateString();
              const hasCompleted = hasCompletedExercise(date);
              const isFuture = date > new Date();

              return (
                <div
                  key={date.toISOString()}
                  className={`aspect-square flex items-center justify-center rounded-lg relative ${
                    isToday
                      ? "bg-orange-100 ring-2 ring-orange-500"
                      : hasCompleted
                      ? "bg-green-100"
                      : isFuture
                      ? "bg-gray-50 text-gray-400"
                      : "bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isToday ? "font-bold text-orange-600" : ""
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {hasCompleted && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 ring-2 ring-orange-500 rounded" />
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 rounded" />
              <span className="text-gray-600">Missed</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
          </CardHeader>
          {exercises.filter((e) => e.isCompleted).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No workouts logged yet. Start your streak today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises
                .filter((e) => e.isCompleted)
                .slice(0, 10)
                .map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {exercise.exerciseType}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(exercise.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {exercise.completed}/{exercise.target}
                      </p>
                      <p className="text-sm text-gray-500">reps</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Add Exercise Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Exercise"
      >
        <form onSubmit={handleAddExercise} className="space-y-4">
          <Input
            label="Exercise Type"
            placeholder="e.g., Push-ups, Sit-ups, Squats"
            value={formData.exerciseType}
            onChange={(e) =>
              setFormData({ ...formData, exerciseType: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Reps"
              type="number"
              placeholder="e.g., 20"
              value={formData.target}
              onChange={(e) =>
                setFormData({ ...formData, target: e.target.value })
              }
              required
            />
            <Input
              label="Completed Reps"
              type="number"
              placeholder="e.g., 20"
              value={formData.completed}
              onChange={(e) =>
                setFormData({ ...formData, completed: e.target.value })
              }
            />
          </div>
          <p className="text-xs text-gray-500">
            Leave &quot;Completed&quot; empty to use target value
          </p>
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
              Log Exercise
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
