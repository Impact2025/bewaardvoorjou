"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { FamilyDashboard } from "@/components/family/FamilyDashboard";
import { FamilyTree } from "@/components/family/FamilyTree";
import { SharedPods } from "@/components/family/SharedPods";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Heart, TreePine, Share2, Sparkles } from "lucide-react";
import { useJourneyStore } from "@/store/journey-store";

function FamilyContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const journeyId = useJourneyStore((state) => state.journey?.id || "default");

  return (
    <AppShell
      title="Familie & Gedeelde Herinneringen"
      description="Verbind met je geliefden en bouw samen aan jullie familiegeschiedenis"
      activeHref="/family"
    >
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-orange p-8 text-white">
          <div className="absolute top-0 right-0 opacity-10">
            <Heart className="h-64 w-64 animate-pulse" />
          </div>
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8" />
              <h2 className="text-3xl font-bold">De Digitale Familiebibliotheek</h2>
            </div>
            <p className="text-orange-100 text-lg leading-relaxed mb-6">
              Jouw verhalen worden nog waardevoller wanneer ze gedeeld worden. Nodig familieleden uit,
              bouw samen aan jullie stamboom, en creëer een levend archief voor toekomstige generaties.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Deel met familie</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <TreePine className="h-4 w-4" />
                  <span className="text-sm">Bouw je stamboom</span>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Gedeelde pods</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Family Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tree" className="flex items-center gap-2">
              <TreePine className="h-4 w-4" />
              <span className="hidden sm:inline">Stamboom</span>
            </TabsTrigger>
            <TabsTrigger value="pods" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Gedeelde Ruimtes</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FamilyDashboard journeyId={journeyId} />
          </TabsContent>

          <TabsContent value="tree" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TreePine className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Jouw Familiestamboom</CardTitle>
                    <CardDescription>
                      Visualiseer jullie familiegeschiedenis door generaties heen
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FamilyTree journeyId={journeyId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pods" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Share2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Gedeelde Familiepods</CardTitle>
                    <CardDescription>
                      Samen bouwen aan jullie familieverhalen in veilige, gedeelde ruimtes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SharedPods journeyId={journeyId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Encouragement */}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange/10 border border-orange/20">
            <Heart className="h-5 w-5 text-orange heart-pulse" />
            <span className="text-slate-700 font-medium">
              Familie is waar verhalen tot leven komen
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function FamilyPage() {
  return (
    <ProtectedRoute>
      <FamilyContent />
    </ProtectedRoute>
  );
}
