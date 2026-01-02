"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Plus,
  Check,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import Card, { CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getLocalDateString } from "@/lib/utils";

interface DailyTask {
  id: string;
  title: string;
  isCompleted: boolean;
  date: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch tasks for selected date
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const dateStr = getLocalDateString(selectedDate);
        const response = await fetch(`/api/tasks?date=${dateStr}`);
        if (response.ok) {
          const data = await response.json();
          setTasks(data.tasks || []);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [selectedDate]);

  // Add a new task
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    setIsAddingTask(true);
    try {
      const dateStr = getLocalDateString(selectedDate);
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle, date: dateStr }),
      });
      if (response.ok) {
        const data = await response.json();
        setTasks([...tasks, data.task]);
        setNewTaskTitle("");
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsAddingTask(false);
    }
  };

  // Toggle task completion
  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, isCompleted: !isCompleted }),
      });
      setTasks(
        tasks.map((t) =>
          t.id === taskId ? { ...t, isCompleted: !isCompleted } : t
        )
      );
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" });
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // Navigate dates
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    setIsLoading(true);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    setIsLoading(true);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setIsLoading(true);
  };

  // Check if selected date is today
  const isToday =
    getLocalDateString(selectedDate) === getLocalDateString(new Date());

  // Stats
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const taskProgress =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Format date for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Tasks</h1>
          <p className="text-gray-600">
            Your personal todo list - separate from trackers
          </p>
        </div>
      </div>

      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousDay}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  {isToday ? "Today" : formatDisplayDate(selectedDate)}
                </p>
                {isToday && (
                  <p className="text-sm text-gray-500">
                    {formatDisplayDate(selectedDate)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isToday && (
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              )}
              <button
                onClick={goToNextDay}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Progress Stats */}
      {tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {completedTasks} of {tasks.length} tasks done
                  </h2>
                  <p className="text-indigo-100">
                    {taskProgress === 100
                      ? "🎉 All tasks completed!"
                      : `${tasks.length - completedTasks} tasks remaining`}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block w-32">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-indigo-100">Progress</span>
                  <span className="font-bold">{taskProgress}%</span>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${taskProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Add Task & Task List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-indigo-500" />
              {isToday
                ? "Today's Tasks"
                : `Tasks for ${selectedDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}`}
            </CardTitle>
          </CardHeader>

          <div className="space-y-4">
            {/* Add Task Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What do you need to do?"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Button
                onClick={addTask}
                disabled={isAddingTask || !newTaskTitle.trim()}
                isLoading={isAddingTask}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </div>

            {/* Task List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <ListTodo className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No tasks yet
                </h3>
                <p className="text-gray-500">
                  Add your first task for {isToday ? "today" : "this day"}!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Incomplete tasks first */}
                {tasks
                  .filter((t) => !t.isCompleted)
                  .map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white transition-all group"
                    >
                      <button
                        onClick={() => toggleTask(task.id, task.isCompleted)}
                        className="w-6 h-6 rounded-full border-2 border-gray-300 hover:border-indigo-500 flex items-center justify-center transition-colors"
                      ></button>
                      <span className="flex-1 text-gray-700">{task.title}</span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}

                {/* Completed tasks */}
                {tasks.filter((t) => t.isCompleted).length > 0 && (
                  <>
                    {tasks.filter((t) => !t.isCompleted).length > 0 && (
                      <div className="border-t border-gray-100 my-4" />
                    )}
                    <p className="text-sm text-gray-500 font-medium px-1">
                      Completed ({tasks.filter((t) => t.isCompleted).length})
                    </p>
                    {tasks
                      .filter((t) => t.isCompleted)
                      .map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-4 rounded-xl border border-green-200 bg-green-50 transition-all group"
                        >
                          <button
                            onClick={() =>
                              toggleTask(task.id, task.isCompleted)
                            }
                            className="w-6 h-6 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center text-white"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <span className="flex-1 text-gray-500 line-through">
                            {task.title}
                          </span>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                  </>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
