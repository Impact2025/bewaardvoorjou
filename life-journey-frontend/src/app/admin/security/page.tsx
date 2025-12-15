"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Key, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminSecurityPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Security & Compliance</h1>
        <p className="text-slate-600 mt-1">
          Monitor security status and manage access controls
        </p>
      </div>

      {/* Security Status */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Security Status</p>
                <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                  Secure
                </Badge>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">SSL/TLS</p>
                <Badge className="mt-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                  Active
                </Badge>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">API Keys</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">2</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Alerts</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">0</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Features */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>User authentication and access control</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-emerald-900">JWT Authentication</p>
                  <p className="text-xs text-emerald-600 mt-1">Enabled and operational</p>
                </div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-emerald-900">Password Hashing</p>
                  <p className="text-xs text-emerald-600 mt-1">Argon2 encryption active</p>
                </div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-emerald-900">Role-Based Access</p>
                  <p className="text-xs text-emerald-600 mt-1">Admin & user roles configured</p>
                </div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Protection</CardTitle>
            <CardDescription>Encryption and data security measures</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">Database Encryption</p>
                  <p className="text-xs text-blue-600 mt-1">PostgreSQL with SSL</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">CORS Protection</p>
                  <p className="text-xs text-blue-600 mt-1">Configured for allowed origins</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">Rate Limiting</p>
                  <p className="text-xs text-blue-600 mt-1">Active on all endpoints</p>
                </div>
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GDPR Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>GDPR & Privacy Compliance</CardTitle>
          <CardDescription>Data protection and privacy regulations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-sm text-slate-700">Data encryption at rest and in transit</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-sm text-slate-700">User consent management implemented</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-sm text-slate-700">Right to be forgotten (data deletion) available</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <p className="text-sm text-slate-700">Privacy policy and terms of service in place</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
