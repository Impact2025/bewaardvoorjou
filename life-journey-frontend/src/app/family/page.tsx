"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { FamilyDashboard } from "@/components/family/FamilyDashboard";
import { FamilyTree } from "@/components/family/FamilyTree";
import { SharedPods } from "@/components/family/SharedPods";
import { InterviewOuders } from "@/components/family/InterviewOuders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, TreePine, Share2, MessageCircle } from "lucide-react";
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
      <div className="space-y-6">
        {/* Page intro */}
        <div className="bg-white rounded-xl border border-[#E6E2DD] overflow-hidden">
          <div className="h-1 bg-[#FF8C42]" />
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF8C42] mb-1">
              Familie
            </p>
            <h2 className="font-serif font-semibold text-[#333333] text-xl sm:text-2xl mb-2">
              De Digitale Familiebibliotheek
            </h2>
            <p className="text-[#555555] text-sm leading-relaxed max-w-2xl">
              Jouw verhalen worden nog waardevoller wanneer ze gedeeld worden. Nodig familieleden uit,
              bouw samen aan jullie stamboom en creëer een levend archief voor toekomstige generaties.
            </p>
          </div>
        </div>

        {/* Family Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-[#FAF7F2] border border-[#E6E2DD]">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#FF8C42]">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tree" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#FF8C42]">
              <TreePine className="h-4 w-4" />
              <span className="hidden sm:inline">Stamboom</span>
            </TabsTrigger>
            <TabsTrigger value="pods" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#FF8C42]">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Gedeelde Ruimtes</span>
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#FF8C42]">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Interview Ouders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FamilyDashboard journeyId={journeyId} />
          </TabsContent>

          <TabsContent value="tree" className="space-y-6">
            <Card className="bg-white border border-[#E6E2DD]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FAF7F2] rounded-lg">
                    <TreePine className="h-5 w-5 text-[#FF8C42]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#333333]">Jouw Familiestamboom</CardTitle>
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
            <Card className="bg-white border border-[#E6E2DD]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FAF7F2] rounded-lg">
                    <Share2 className="h-5 w-5 text-[#FF8C42]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#333333]">Gedeelde Familiepods</CardTitle>
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

          <TabsContent value="interview" className="space-y-6">
            <Card className="bg-white border border-[#E6E2DD]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#FAF7F2] rounded-lg">
                    <MessageCircle className="h-5 w-5 text-[#FF8C42]" />
                  </div>
                  <div>
                    <CardTitle className="text-[#333333]">Interview je Ouders</CardTitle>
                    <CardDescription>
                      Stuur een persoonlijke vragenlijst — zonder dat je ouder een account nodig heeft
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <InterviewOuders journeyId={journeyId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
