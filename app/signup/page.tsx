"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(formData.username);

  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(formData.password) },
    { label: "Contains uppercase", met: /[A-Z]/.test(formData.password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-to-br from-indigo-600 to-purple-700 p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-lg text-white"
        >
          <h2 className="text-4xl font-bold mb-6">
            Start your 2026 journey today
          </h2>
          <p className="text-lg text-indigo-100 mb-8">
            Create your account and begin tracking your path to becoming the
            best version of yourself.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: "📚", label: "Reading", desc: "Track books" },
              { icon: "💻", label: "Coding", desc: "Log practice" },
              { icon: "📖", label: "Quran", desc: "Track recitation" },
              { icon: "🕋", label: "Hadith", desc: "Daily learning" },
              { icon: "🎯", label: "LeetCode", desc: "Solve problems" },
              { icon: "💼", label: "Jobs", desc: "Track applications" },
              { icon: "🚀", label: "Projects", desc: "Build & launch" },
              { icon: "📅", label: "Events", desc: "Stay connected" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/10 rounded-lg p-4 backdrop-blur-sm"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-indigo-200">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">26</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                My2026Journey
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h1>
            <p className="text-gray-600 mb-8">
              Start tracking your journey to success.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  label="Username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      username: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]/g, ""),
                    })
                  }
                  required
                />
                {formData.username && !usernameValid && (
                  <p className="mt-1 text-xs text-amber-600">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                )}
              </div>

              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password requirements */}
              <div className="space-y-2">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-2 text-sm ${
                      req.met ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 ${
                        req.met ? "opacity-100" : "opacity-30"
                      }`}
                    />
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}
              >
                Create account
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
