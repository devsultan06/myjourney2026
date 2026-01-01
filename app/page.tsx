"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Github,
  Trophy,
  Briefcase,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Target,
} from "lucide-react";
import Button from "@/components/ui/Button";

const features = [
  {
    icon: BookOpen,
    title: "Reading Tracker",
    description:
      "Track books, set reading goals, and monitor your progress throughout the year.",
    color: "text-blue-600 bg-blue-100",
  },
  {
    icon: Code2,
    title: "Coding Practice",
    description:
      "Log coding sessions, track languages learned, and maintain your streak.",
    color: "text-green-600 bg-green-100",
  },
  {
    icon: Github,
    title: "GitHub Activity",
    description:
      "Visualize your contribution graph and track commits across repositories.",
    color: "text-gray-600 bg-gray-100",
  },
  {
    icon: Trophy,
    title: "LeetCode Progress",
    description:
      "Track problems solved by difficulty, maintain streaks, and see your growth.",
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    icon: Briefcase,
    title: "Job Applications",
    description:
      "Manage your job hunt with status tracking, timelines, and interview notes.",
    color: "text-purple-600 bg-purple-100",
  },
  {
    icon: Rocket,
    title: "Startup Projects",
    description:
      "Track milestones, set deadlines, and monitor progress on your side projects.",
    color: "text-red-600 bg-red-100",
  },
];

const benefits = [
  "Clean, distraction-free interface",
  "Track everything in one place",
  "Visual progress indicators",
  "Daily and weekly streaks",
  "Goal setting and milestones",
  "Mobile-friendly design",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">26</span>
              </div>
              <span className="font-bold text-gray-900">My2026Journey</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-sm font-medium text-indigo-700 mb-6">
              <Sparkles className="w-4 h-4" />
              Your year of growth starts here
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Make{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                2026
              </span>{" "}
              your most productive year yet
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
              Track your reading, coding, job applications, projects, and more.
              All in one beautiful, intuitive dashboard designed to keep you
              motivated and focused.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Already have an account?
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Books Read",
                      value: "12",
                      icon: BookOpen,
                      color: "text-blue-600",
                    },
                    {
                      label: "GitHub Commits",
                      value: "847",
                      icon: Github,
                      color: "text-gray-700",
                    },
                    {
                      label: "LeetCode Solved",
                      value: "156",
                      icon: Trophy,
                      color: "text-yellow-600",
                    },
                    {
                      label: "Day Streak",
                      value: "23",
                      icon: TrendingUp,
                      color: "text-green-600",
                    },
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                    >
                      <stat.icon className={`w-6 h-6 ${stat.color} mb-3`} />
                      <p className="text-3xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything you need to track your growth
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              From reading goals to job applications, manage all aspects of your
              personal development journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Designed for focused productivity
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                No distractions, no clutter. Just a clean interface that helps
                you track what matters and stay motivated throughout your
                journey.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">2026 Goals</h3>
                    <p className="text-sm text-gray-500">
                      Track your annual targets
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Read 24 books", progress: 50 },
                    { label: "500 LeetCode problems", progress: 31 },
                    { label: "Launch 2 projects", progress: 50 },
                  ].map((goal) => (
                    <div key={goal.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{goal.label}</span>
                        <span className="text-gray-500">{goal.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to make 2026 unforgettable?
          </h2>
          <p className="text-lg text-gray-400 mb-10">
            Join now and start tracking your journey to success. It&apos;s free
            to get started.
          </p>
          <Link href="/signup">
            <Button size="lg" className=" text-gray-900 bg-gray-100">
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">26</span>
              </div>
              <span className="font-bold text-gray-900">My2026Journey</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2026 My2026Journey. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
