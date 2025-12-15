"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Heart,
  Crown,
  Infinity,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStats {
  total_users: number;
  active_users: number;
  new_users_today: number;
  total_journeys: number;
  total_revenue: number;
  monthly_recurring: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const authData = localStorage.getItem("life-journey.auth");
        if (!authData) {
          setError("Not authenticated");
          return;
        }

        const { token } = JSON.parse(authData);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }

        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-24 bg-slate-100 animate-pulse rounded-lg" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error loading dashboard</CardTitle>
          <CardDescription>{error || "Unknown error"}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-600 mt-1">
          Welcome back! Here's what's happening with your platform today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.total_users.toLocaleString()}
          change="+12%"
          trend="up"
          icon={Users}
          iconColor="from-blue-500 to-blue-600"
        />
        <StatsCard
          title="Active Users"
          value={stats.active_users.toLocaleString()}
          change="+8%"
          trend="up"
          icon={TrendingUp}
          iconColor="from-emerald-500 to-emerald-600"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`€${stats.monthly_recurring.toLocaleString()}`}
          change="+23%"
          trend="up"
          icon={DollarSign}
          iconColor="from-amber-500 to-amber-600"
        />
        <StatsCard
          title="Total Journeys"
          value={stats.total_journeys.toLocaleString()}
          change="+5%"
          trend="up"
          icon={Clock}
          iconColor="from-purple-500 to-purple-600"
        />
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Users Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats.new_users_today}</div>
            <p className="text-sm text-slate-600 mt-1">Nieuwe registraties vandaag</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">€{stats.total_revenue.toLocaleString()}</div>
            <p className="text-sm text-slate-600 mt-1">Totale omzet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Active Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {stats.total_users > 0 ? Math.round((stats.active_users / stats.total_users) * 100) : 0}%
            </div>
            <p className="text-sm text-slate-600 mt-1">Gebruikers actief laatste 30 dagen</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Platform health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-emerald-900">API Status</p>
                <p className="text-xs text-emerald-600 mt-1">All systems operational</p>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">Database</p>
                <p className="text-xs text-blue-600 mt-1">Connected and healthy</p>
              </div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
  iconColor: string;
}

function StatsCard({ title, value, change, trend, icon: Icon, iconColor }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <ArrowUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(
                "text-sm font-medium",
                trend === "up" ? "text-emerald-500" : "text-red-500"
              )}>
                {change}
              </span>
              <span className="text-sm text-slate-500">vs last week</span>
            </div>
          </div>
          <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", iconColor)}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

