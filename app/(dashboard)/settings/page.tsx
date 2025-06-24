"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  Save,
  Settings as SettingsIcon,
} from "lucide-react"
import { useTheme } from "next-themes"

interface UserProfile {
  name: string
  email: string
  image?: string
}

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    image: "",
  })

  const [preferences, setPreferences] = useState({
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    notifications: {
      goalReminders: true,
      monthlyReports: true,
      expenseAlerts: true,
    },
    privacy: {
      shareAnalytics: false,
      publicProfile: false,
    },
  })

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      })
    }
  }, [session])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        await update({ name: profile.name })
        alert("Profile updated successfully!")
      } else {
        alert("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile")
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/export/all-data")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fundcy-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting data:", error)
      alert("Failed to export data")
    }
  }

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone and will delete all your data."
      )
    ) {
      const confirmDelete = prompt('Type "DELETE" to confirm account deletion:')
      if (confirmDelete === "DELETE") {
        try {
          const response = await fetch("/api/profile", {
            method: "DELETE",
          })
          if (response.ok) {
            alert("Account deleted successfully")
            window.location.href = "/auth/signin"
          }
        } catch (error) {
          console.error("Error deleting account:", error)
          alert("Failed to delete account")
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, preferences, and application settings
          </p>
        </div>
        <SettingsIcon className="h-8 w-8 text-muted-foreground" />
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={e =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed for security reasons
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image URL</Label>
                  <Input
                    id="image"
                    value={profile.image}
                    onChange={e =>
                      setProfile({ ...profile, image: e.target.value })
                    }
                    placeholder="https://example.com/profile.jpg"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Customize your app experience and display settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={preferences.currency}
                  onValueChange={value =>
                    setPreferences({ ...preferences, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select
                  value={preferences.dateFormat}
                  onValueChange={value =>
                    setPreferences({ ...preferences, dateFormat: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Goal Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about your financial goals
                  </p>
                </div>
                <Badge
                  variant={
                    preferences.notifications.goalReminders
                      ? "default"
                      : "secondary"
                  }
                >
                  {preferences.notifications.goalReminders
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Monthly Reports</p>
                  <p className="text-sm text-muted-foreground">
                    Receive monthly spending and investment reports
                  </p>
                </div>
                <Badge
                  variant={
                    preferences.notifications.monthlyReports
                      ? "default"
                      : "secondary"
                  }
                >
                  {preferences.notifications.monthlyReports
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Expense Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you exceed spending limits
                  </p>
                </div>
                <Badge
                  variant={
                    preferences.notifications.expenseAlerts
                      ? "default"
                      : "secondary"
                  }
                >
                  {preferences.notifications.expenseAlerts
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export, import, or manage your financial data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your financial data as JSON
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Import Data</p>
                  <p className="text-sm text-muted-foreground">
                    Import financial data from a backup file
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Import (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">
                    Update your account password
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Change Password (Coming Soon)
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Enable 2FA (Coming Soon)
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/10">
                <div>
                  <p className="font-medium text-red-700 dark:text-red-400">
                    Delete Account
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-500">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
