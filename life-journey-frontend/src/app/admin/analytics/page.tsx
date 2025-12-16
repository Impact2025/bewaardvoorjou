"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Video,
  FileText,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock analytics data
const mockData = {
  userGrowth: [
    { month: "Jul", users: 850 },
    { month: "Aug", users: 920 },
    { month: "Sep", users: 1050 },
    { month: "Oct", users: 1180 },
    { month: "Nov", users: 1247 },
    { month: "Dec", users: 1320 },
  ],
  revenue: [
    { month: "Jul", amount: 7200 },
    { month: "Aug", amount: 8100 },
    { month: "Sep", amount: 9500 },
    { month: "Oct", amount: 11200 },
    { month: "Nov", amount: 13400 },
    { month: "Dec", amount: 15420 },
  ],
  engagement: [
    { day: "Mon", recordings: 45, stories: 23 },
    { day: "Tue", recordings: 52, stories: 28 },
    { day: "Wed", recordings: 48, stories: 25 },
    { day: "Thu", recordings: 61, stories: 32 },
    { day: "Fri", recordings: 55, stories: 29 },
    { day: "Sat", recordings: 38, stories: 18 },
    { day: "Sun", recordings: 42, stories: 21 },
  ],
};

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  const maxUsers = Math.max(...mockData.userGrowth.map((d) => d.users));
  const maxRevenue = Math.max(...mockData.revenue.map((d) => d.amount));
  const maxRecordings = Math.max(...mockData.engagement.map((d) => d.recordings));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600 mt-1">
            In-depth insights and metrics about your platform
          </p>
        </div>
        <Button variant="ghost">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value="€15,420"
          change="+23.5%"
          trend="up"
          icon={DollarSign}
        />
        <MetricCard
          title="Active Users"
          value="892"
          change="+8.2%"
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Avg Session Time"
          value="24m 32s"
          change="+12.1%"
          trend="up"
          icon={Clock}
        />
        <MetricCard
          title="Total Recordings"
          value="12,893"
          change="+156"
          trend="up"
          icon={Video}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly new user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.userGrowth.map((data, idx) => {
                const height = (data.users / maxUsers) * 100;
                const prevUsers = idx > 0 ? mockData.userGrowth[idx - 1].users : data.users;
                const growth = ((data.users - prevUsers) / prevUsers) * 100;

                return (
                  <div key={data.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{data.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold">{data.users}</span>
                        {idx > 0 && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              growth > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
                            )}
                          >
                            +{growth.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transition-all duration-500"
                        style={{ width: `${height}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly recurring revenue growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.revenue.map((data, idx) => {
                const height = (data.amount / maxRevenue) * 100;
                const prevAmount = idx > 0 ? mockData.revenue[idx - 1].amount : data.amount;
                const growth = ((data.amount - prevAmount) / prevAmount) * 100;

                return (
                  <div key={data.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{data.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold">€{data.amount.toLocaleString()}</span>
                        {idx > 0 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            +{growth.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg transition-all duration-500"
                        style={{ width: `${height}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Engagement</CardTitle>
          <CardDescription>Recordings and stories created per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-600" />
                <span className="text-slate-600">Recordings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-500 to-emerald-600" />
                <span className="text-slate-600">Stories</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-4">
              {mockData.engagement.map((data) => {
                const recordingsHeight = (data.recordings / maxRecordings) * 100;
                const storiesHeight = (data.stories / maxRecordings) * 100;

                return (
                  <div key={data.day} className="space-y-2">
                    <div className="h-40 flex items-end gap-1">
                      <div
                        className="flex-1 bg-gradient-to-t from-purple-500 to-purple-600 rounded-t transition-all duration-500"
                        style={{ height: `${recordingsHeight}%` }}
                        title={`${data.recordings} recordings`}
                      />
                      <div
                        className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-600 rounded-t transition-all duration-500"
                        style={{ height: `${storiesHeight}%` }}
                        title={`${data.stories} stories`}
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-slate-700">{data.day}</div>
                      <div className="text-xs text-slate-500">{data.recordings + data.stories}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">54.3%</div>
            <p className="text-sm text-slate-600 mt-1">Free to paid conversion</p>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500 font-medium">+4.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">2.8%</div>
            <p className="text-sm text-slate-600 mt-1">Monthly subscriber churn</p>
            <div className="mt-4 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500 font-medium">-0.5%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">€342</div>
            <p className="text-sm text-slate-600 mt-1">Average customer LTV</p>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500 font-medium">+18.3%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ElementType;
}

function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-slate-600">{title}</div>
          <Icon className="h-5 w-5 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="flex items-center gap-1 mt-2">
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={cn(
            "text-sm font-medium",
            trend === "up" ? "text-emerald-500" : "text-red-500"
          )}>
            {change}
          </span>
          <span className="text-sm text-slate-500">vs last period</span>
        </div>
      </CardContent>
    </Card>
  );
}
