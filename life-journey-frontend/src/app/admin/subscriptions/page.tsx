"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Heart,
  Infinity,
  Sparkles,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const subscriptionData = {
  overview: {
    totalMRR: 8940,
    totalARR: 107280,
    activeSubscriptions: 1247,
    churnRate: 2.8,
  },
  tiers: [
    {
      name: "Basis",
      icon: Sparkles,
      color: "from-slate-500 to-slate-600",
      subscribers: 450,
      revenue: 0,
      growth: "+12%",
      trend: "up" as const,
    },
    {
      name: "Familie",
      icon: Heart,
      color: "from-pink-500 to-rose-600",
      subscribers: 678,
      revenue: 6770,
      growth: "+23%",
      trend: "up" as const,
    },
    {
      name: "Legacy",
      icon: Crown,
      color: "from-amber-500 to-orange-600",
      subscribers: 98,
      revenue: 1958,
      growth: "+8%",
      trend: "up" as const,
    },
    {
      name: "Eeuwig",
      icon: Infinity,
      color: "from-purple-500 to-indigo-600",
      subscribers: 21,
      revenue: 212,
      growth: "+5%",
      trend: "up" as const,
    },
  ],
  recentTransactions: [
    { user: "Emma van Dijk", tier: "Eeuwig", amount: 499, status: "completed", date: "2 min ago" },
    { user: "Anna de Vries", tier: "Familie", amount: 9.99, status: "completed", date: "1 hour ago" },
    { user: "Jan Peters", tier: "Legacy", amount: 19.99, status: "completed", date: "3 hours ago" },
    { user: "Sophie Bakker", tier: "Familie", amount: 9.99, status: "pending", date: "5 hours ago" },
    { user: "Pieter Jansen", tier: "Familie", amount: 9.99, status: "failed", date: "1 day ago" },
  ],
  upgrades: [
    { from: "Basis", to: "Familie", count: 45, percentage: 67 },
    { from: "Familie", to: "Legacy", count: 12, percentage: 18 },
    { from: "Basis", to: "Legacy", count: 8, percentage: 12 },
    { from: "Familie", to: "Eeuwig", count: 2, percentage: 3 },
  ],
};

export default function AdminSubscriptionsPage() {
  const totalRevenue = subscriptionData.tiers.reduce((sum, tier) => sum + tier.revenue, 0);
  const totalSubscribers = subscriptionData.tiers.reduce((sum, tier) => sum + tier.subscribers, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Subscription Management</h1>
        <p className="text-slate-600 mt-1">
          Monitor and manage all subscription tiers and revenue
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Monthly Recurring</div>
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              €{subscriptionData.overview.totalMRR.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500 font-medium">+23%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Annual Recurring</div>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              €{subscriptionData.overview.totalARR.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500 font-medium">+18%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Active Subscriptions</div>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {subscriptionData.overview.activeSubscriptions.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500 font-medium">+12%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-600">Churn Rate</div>
              <AlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {subscriptionData.overview.churnRate}%
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-emerald-500 font-medium">-0.5%</span>
              <span className="text-sm text-slate-500">improvement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Tiers Performance</CardTitle>
          <CardDescription>Revenue and subscriber metrics per tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {subscriptionData.tiers.map((tier) => {
              const Icon = tier.icon;
              const percentage = (tier.subscribers / totalSubscribers) * 100;

              return (
                <div key={tier.name} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", tier.color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{tier.name}</div>
                      <div className="text-sm text-slate-600">
                        {tier.subscribers} subscribers
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Revenue</span>
                      <span className="font-bold text-slate-900">€{tier.revenue.toLocaleString()}/mo</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full bg-gradient-to-r", tier.color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{percentage.toFixed(1)}% of total</span>
                      <Badge variant="ghost" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {tier.growth}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest subscription payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptionData.recentTransactions.map((transaction, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b border-slate-100 last:border-0">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    transaction.status === "completed" && "bg-emerald-500",
                    transaction.status === "pending" && "bg-amber-500",
                    transaction.status === "failed" && "bg-red-500"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{transaction.user}</p>
                    <p className="text-xs text-slate-600">{transaction.tier} - €{transaction.amount}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="ghost"
                      className={cn(
                        transaction.status === "completed" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                        transaction.status === "pending" && "bg-amber-50 text-amber-700 border-amber-200",
                        transaction.status === "failed" && "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {transaction.status}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">{transaction.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Paths */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Upgrade Paths</CardTitle>
            <CardDescription>How users upgrade their subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptionData.upgrades.map((upgrade, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{upgrade.from}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-medium text-slate-900">{upgrade.to}</span>
                    </div>
                    <span className="text-slate-600">{upgrade.count} upgrades</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange to-gold rounded-full"
                      style={{ width: `${upgrade.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
