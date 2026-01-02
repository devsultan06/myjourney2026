"use client";

import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Palette,
  Shield,
  Download,
  Trash2,
  Save,
} from "lucide-react";
import Card, {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyReport: true,
    streakAlerts: true,
    goalMilestones: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setProfile({
            username: data.user.username,
            email: data.user.email,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <Button variant="outline" size="sm">
                Change Avatar
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={profile.username}
              onChange={(e) =>
                setProfile({ ...profile, username: e.target.value })
              }
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </div>
          <div className="pt-4">
            <Button onClick={handleSaveProfile} isLoading={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>How you receive updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <Checkbox
            checked={notifications.dailyReminder}
            onChange={(checked) =>
              setNotifications({ ...notifications, dailyReminder: checked })
            }
            label="Daily activity reminder"
          />
          <Checkbox
            checked={notifications.weeklyReport}
            onChange={(checked) =>
              setNotifications({ ...notifications, weeklyReport: checked })
            }
            label="Weekly progress report"
          />
          <Checkbox
            checked={notifications.streakAlerts}
            onChange={(checked) =>
              setNotifications({ ...notifications, streakAlerts: checked })
            }
            label="Streak at risk alerts"
          />
          <Checkbox
            checked={notifications.goalMilestones}
            onChange={(checked) =>
              setNotifications({ ...notifications, goalMilestones: checked })
            }
            label="Goal milestone celebrations"
          />
        </div>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <div className="flex gap-3">
              {[
                { value: "light", label: "Light", active: true },
                { value: "dark", label: "Dark", active: false },
                { value: "system", label: "System", active: false },
              ].map((theme) => (
                <button
                  key={theme.value}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    theme.active
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Manage your data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Export Data</h4>
              <p className="text-sm text-gray-500">
                Download all your data as a JSON file
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
            <div>
              <h4 className="font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-600">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="danger">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
